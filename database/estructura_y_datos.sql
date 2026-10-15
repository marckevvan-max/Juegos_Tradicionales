-- =====================================================================
--  Juega, Gana y Diviértete · Base de datos MySQL / MariaDB
--
--  Cómo usarlo en phpMyAdmin:
--    1) Crea una base de datos (por ejemplo: juegos_tradicionales) con
--       cotejamiento utf8mb4_unicode_ci.
--    2) Entra a esa base de datos → pestaña "Importar" → elige este archivo.
--
--  Si tu proveedor (Aiven, etc.) ya te da una base de datos, solo
--  selecciónala en phpMyAdmin e importa este archivo.
--  Se puede importar varias veces sin borrar nada.
-- =====================================================================

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------
--  Usuarios
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre    VARCHAR(20)  NOT NULL,
  pass_hash VARCHAR(255) NOT NULL,               -- contraseña cifrada con password_hash()
  puntos    INT UNSIGNED NOT NULL DEFAULT 0,     -- puntos disponibles para canjear
  exp       INT UNSIGNED NOT NULL DEFAULT 0,     -- experiencia (nivel = exp / 100 + 1)
  creado    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
--  Partidas jugadas (de aquí salen las estadísticas y los logros)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS partidas (
  id          BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  usuario_id  INT UNSIGNED     NOT NULL,
  juego       VARCHAR(20)      NOT NULL,         -- loteria, canicas, escondidas, vasos, balero, trompo, sillas
  puntos      INT UNSIGNED     NOT NULL,
  dificultad  TINYINT UNSIGNED NOT NULL DEFAULT 1, -- 0 Fácil, 1 Media, 2 Difícil
  en_linea    TINYINT(1)       NOT NULL DEFAULT 0,
  victoria    TINYINT(1)       NOT NULL DEFAULT 0,
  fecha       DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_partidas_usuario (usuario_id),
  CONSTRAINT fk_partidas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
--  Catálogo de logros (puedes agregar más desde phpMyAdmin)
--    tipo: partidas, puntos_total, juegos_distintos, dificil, en_linea,
--          victorias, mejor_partida, nivel, victorias_juego (usa la columna "juego")
--    meta: valor que hay que alcanzar
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS logros (
  id          SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  clave       VARCHAR(40)  NOT NULL,
  nombre      VARCHAR(60)  NOT NULL,
  descripcion VARCHAR(200) NOT NULL,
  tipo        VARCHAR(30)  NOT NULL,
  juego       VARCHAR(20)  NULL,
  meta        INT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_logros_clave (clave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS logros_usuario (
  usuario_id INT UNSIGNED      NOT NULL,
  logro_id   SMALLINT UNSIGNED NOT NULL,
  fecha      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (usuario_id, logro_id),
  CONSTRAINT fk_lu_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
  CONSTRAINT fk_lu_logro   FOREIGN KEY (logro_id)   REFERENCES logros (id)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
--  Catálogo de recompensas (stickers, marcos y títulos)
--    costo: puntos que se gastan · nivel_min: nivel necesario
--    emoji: para stickers · fondo: degradado CSS para los marcos
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recompensas (
  id          SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  clave       VARCHAR(20)  NOT NULL,
  categoria   ENUM('sticker','marco','titulo') NOT NULL,
  nombre      VARCHAR(60)  NOT NULL,
  descripcion VARCHAR(200) NOT NULL,
  costo       INT UNSIGNED NOT NULL,
  nivel_min   TINYINT UNSIGNED NOT NULL DEFAULT 1,
  emoji       VARCHAR(16)  NULL,
  fondo       VARCHAR(255) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_recompensas_clave (clave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS recompensas_usuario (
  usuario_id   INT UNSIGNED      NOT NULL,
  recompensa_id SMALLINT UNSIGNED NOT NULL,
  equipada     TINYINT(1)        NOT NULL DEFAULT 0,
  fecha        DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (usuario_id, recompensa_id),
  CONSTRAINT fk_ru_usuario    FOREIGN KEY (usuario_id)    REFERENCES usuarios (id)    ON DELETE CASCADE,
  CONSTRAINT fk_ru_recompensa FOREIGN KEY (recompensa_id) REFERENCES recompensas (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
--  Sesiones (así no se pierde el inicio de sesión cuando Render
--  reinicia o "duerme" el servidor gratuito)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sesiones (
  id         VARCHAR(128)  NOT NULL,
  datos      MEDIUMTEXT    NOT NULL,
  actualizado INT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  KEY idx_sesiones_actualizado (actualizado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
--  Datos iniciales: logros
-- ---------------------------------------------------------------------
INSERT IGNORE INTO logros (clave, nombre, descripcion, tipo, juego, meta) VALUES
('primer_juego',     'Primer juego',            'Termina tu primera partida en cualquier juego.',                    'partidas',         NULL,         1),
('constante',        'Jugador constante',       'Termina 10 partidas.',                                              'partidas',         NULL,        10),
('maratonista',      'Maratonista de la plaza', 'Termina 25 partidas.',                                              'partidas',         NULL,        25),
('alcancia',         'Alcancía',                'Gana 100 puntos en total jugando.',                                 'puntos_total',     NULL,       100),
('tesoro',           'Tesoro del pueblo',       'Gana 500 puntos en total jugando.',                                 'puntos_total',     NULL,       500),
('explorador',       'Explorador de juegos',    'Juega los 7 juegos al menos una vez.',                              'juegos_distintos', NULL,         7),
('reto_aceptado',    'Reto aceptado',           'Termina 3 partidas en dificultad Difícil.',                         'dificil',          NULL,         3),
('jugador_en_linea', 'Jugador en línea',        'Termina 3 partidas en modo «Jugar en línea».',                      'en_linea',         NULL,         3),
('ganador',          'Ganador',                 'Gana 5 partidas en cualquier juego.',                               'victorias',        NULL,         5),
('gran_puntuacion',  'Gran puntuación',         'Consigue 30 puntos en una sola partida.',                           'mejor_partida',    NULL,        30),
('subiendo_nivel',   'Subiendo de nivel',       'Llega al nivel 3.',                                                 'nivel',            NULL,         3),
('dona_loteria',     'Doña Lotería',            'Gana 3 partidas de Lotería completando tu tabla primero.',          'victorias_juego',  'loteria',    3),
('punteria_oro',     'Puntería de oro',         'Consigue 40 puntos o más en una partida de Canicas.',               'victorias_juego',  'canicas',    1),
('cazador_experto',  'Cazador experto',         'Encuentra a los 4 jugadores en una partida de Escondidas.',         'victorias_juego',  'escondidas', 1),
('ojo_de_lince',     'Ojo de lince',            'Consigue 12 puntos o más en una partida de Vasos.',                 'victorias_juego',  'vasos',      1),
('mano_de_balero',   'Mano de balero',          'Atrapa 7 o más pelotas en una partida de Balero.',                  'victorias_juego',  'balero',     1),
('rey_del_trompo',   'Rey del trompo',          'Gana una batalla de trompos (llega a 5 derrotas).',                 'victorias_juego',  'trompo',     1),
('ultima_silla',     'La última silla',         'Gana el juego de las sillas quedando de último jugador.',           'victorias_juego',  'sillas',     1);

-- ---------------------------------------------------------------------
--  Datos iniciales: recompensas
-- ---------------------------------------------------------------------
INSERT IGNORE INTO recompensas (clave, categoria, nombre, descripcion, costo, nivel_min, emoji, fondo) VALUES
('st1', 'sticker', 'Bien hecho',          'Un sticker para presumir tu buen juego.',          5,    1, '👍', NULL),
('st2', 'sticker', 'Gallo valiente',      'El gallo de la lotería te acompaña.',              15,   1, '🐓', NULL),
('st3', 'sticker', 'Alebrije',            'Un alebrije colorido para tu perfil.',             40,   2, '🦄', NULL),
('st4', 'sticker', 'Piñata',              '¡A romper la piñata!',                             80,   3, '🪅', NULL),
('mc1', 'marco',   'Marco de madera',     'Un marco sencillo para tu foto de perfil.',        30,   1, NULL, 'linear-gradient(135deg,#c89a6a,#8b5e3c)'),
('mc2', 'marco',   'Marco tricolor',      'Con los colores de la bandera de México.',         120,  3, NULL, 'linear-gradient(135deg,#006847 0 33%,#fff 33% 66%,#ce1126 66%)'),
('mc3', 'marco',   'Marco de oro',        'Brilla como un campeón.',                          300,  4, NULL, 'linear-gradient(135deg,#fff0a8,#e8b923,#b8860b)'),
('mc4', 'marco',   'Marco de diamante',   'El marco más difícil de conseguir.',               1000, 6, NULL, 'linear-gradient(135deg,#e8fbff,#7fd6ff,#bdeeff)'),
('ti1', 'titulo',  'Tirador maestro',     'Para quienes nunca fallan un tiro.',               20,   1, NULL, NULL),
('ti2', 'titulo',  'Rey de la lotería',   'Nadie completa su tabla más rápido que tú.',       80,   2, NULL, NULL),
('ti3', 'titulo',  'Trompo imbatible',    'El campeón de la arena.',                          150,  3, NULL, NULL),
('ti4', 'titulo',  'Leyenda de la plaza', 'Solo para los jugadores más constantes.',          500,  5, NULL, NULL);
