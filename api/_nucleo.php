<?php
/**
 * Núcleo compartido por todos los archivos de la API.
 * (Los archivos que empiezan con "_" no son endpoints: solo los incluyen los demás.)
 */
declare(strict_types=1);

date_default_timezone_set('UTC');
// Los errores van al registro del servidor, nunca a la respuesta (así el JSON no se rompe).
ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

/* ====================================================================
 *  Configuración: variables de entorno o archivo .env (en la raíz)
 * ==================================================================== */
function cargar_env(): void
{
    $ruta = dirname(__DIR__) . '/.env';
    if (!is_readable($ruta)) {
        return;
    }
    foreach (file($ruta, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $linea) {
        $linea = trim($linea);
        if ($linea === '' || $linea[0] === '#' || strpos($linea, '=') === false) {
            continue;
        }
        [$k, $v] = explode('=', $linea, 2);
        $k = trim($k);
        $v = trim($v, " \t\"'");
        if (getenv($k) === false) {
            putenv("$k=$v");
        }
    }
}
cargar_env();

function env(string $clave, ?string $defecto = null): ?string
{
    $v = getenv($clave);
    return ($v === false || $v === '') ? $defecto : $v;
}

/* ====================================================================
 *  Respuestas JSON
 * ==================================================================== */
function json_salida(array $datos, int $codigo = 200): void
{
    http_response_code($codigo);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

function error_json(string $mensaje, int $codigo = 400): void
{
    json_salida(['error' => $mensaje], $codigo);
}

set_exception_handler(function (Throwable $e): void {
    error_log('[juegos-tradicionales] ' . $e->getMessage());
    json_salida(['error' => 'Error del servidor. Revisa la conexión con la base de datos (/api/salud.php).'], 500);
});

/** Lee el cuerpo JSON de una petición POST. */
function entrada(): array
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        error_json('Método no permitido.', 405);
    }
    // Exigir JSON evita que otra página envíe formularios en nombre del usuario (CSRF).
    if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') === false) {
        error_json('Tipo de contenido no válido.', 415);
    }
    $datos = json_decode(file_get_contents('php://input') ?: '', true);
    return is_array($datos) ? $datos : [];
}

/* ====================================================================
 *  Conexión a la base de datos (MySQL / MariaDB con PDO)
 *    DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS
 *    DB_SSL=true  → conexión cifrada (la piden Aiven y otros proveedores)
 *    DB_DSN       → opcional, para usar otro motor (por ejemplo pruebas con SQLite)
 * ==================================================================== */
function conectar(): PDO
{
    static $db = null;
    if ($db instanceof PDO) {
        return $db;
    }
    $dsn  = env('DB_DSN');
    $user = env('DB_USER', 'root');
    $pass = env('DB_PASS', '');
    if ($dsn === null) {
        $host = env('DB_HOST', 'localhost');
        $port = env('DB_PORT', '3306');
        $name = env('DB_NAME', 'juegos_tradicionales');
        $dsn  = "mysql:host=$host;port=$port;dbname=$name;charset=utf8mb4";
    }
    $opciones = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    if (strpos($dsn, 'mysql:') === 0) {
        $opciones[PDO::MYSQL_ATTR_FOUND_ROWS] = true; // rowCount() cuenta filas encontradas
        if (filter_var(env('DB_SSL', 'false'), FILTER_VALIDATE_BOOLEAN)) {
            $opciones[PDO::MYSQL_ATTR_SSL_CA] = env('DB_SSL_CA', '/etc/ssl/certs/ca-certificates.crt');
            $opciones[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] =
                filter_var(env('DB_SSL_VERIFY', 'false'), FILTER_VALIDATE_BOOLEAN);
        }
    }
    $db = new PDO($dsn, $user, $pass, $opciones);
    return $db;
}

/* ====================================================================
 *  Sesiones guardadas en la base de datos.
 *  En Render (plan gratuito) el disco se borra cuando el servidor se
 *  reinicia o se duerme; guardando la sesión en MySQL el usuario no
 *  tiene que volver a iniciar sesión.
 * ==================================================================== */
class SesionBD implements SessionHandlerInterface
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function open(string $path, string $name): bool
    {
        return true;
    }

    public function close(): bool
    {
        return true;
    }

    public function read(string $id): string|false
    {
        $q = $this->db->prepare('SELECT datos FROM sesiones WHERE id = ?');
        $q->execute([$id]);
        $datos = $q->fetchColumn();
        return $datos === false ? '' : (string)$datos;
    }

    public function write(string $id, string $data): bool
    {
        $ahora = time();
        $u = $this->db->prepare('UPDATE sesiones SET datos = ?, actualizado = ? WHERE id = ?');
        $u->execute([$data, $ahora, $id]);
        if ($u->rowCount() === 0) {
            try {
                $i = $this->db->prepare('INSERT INTO sesiones (id, datos, actualizado) VALUES (?, ?, ?)');
                $i->execute([$id, $data, $ahora]);
            } catch (PDOException $e) {
                // Otra petición creó la fila al mismo tiempo: basta con actualizarla.
                $u->execute([$data, $ahora, $id]);
            }
        }
        return true;
    }

    public function destroy(string $id): bool
    {
        $this->db->prepare('DELETE FROM sesiones WHERE id = ?')->execute([$id]);
        return true;
    }

    public function gc(int $max_lifetime): int|false
    {
        $q = $this->db->prepare('DELETE FROM sesiones WHERE actualizado < ?');
        $q->execute([time() - $max_lifetime]);
        return $q->rowCount();
    }
}

function iniciar_sesion(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https'); // Render va detrás de un proxy HTTPS
    $duracion = 60 * 60 * 24 * 30;
    ini_set('session.gc_maxlifetime', (string)$duracion);
    session_set_save_handler(new SesionBD(conectar()), true);
    session_name('JGSESION');
    session_set_cookie_params([
        'lifetime' => $duracion,
        'path'     => '/',
        'secure'   => $https,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function usuario_id(): ?int
{
    return isset($_SESSION['uid']) ? (int)$_SESSION['uid'] : null;
}

/** Corta la petición con 401 si no hay sesión y devuelve el id del usuario. */
function exigir_usuario(string $mensaje): int
{
    iniciar_sesion();
    $uid = usuario_id();
    if ($uid === null) {
        error_json($mensaje, 401);
    }
    return $uid;
}

/* ====================================================================
 *  Reglas del juego
 * ==================================================================== */
/** Máximo de puntos posibles por partida (antes del multiplicador de dificultad). */
const MAX_PUNTOS = [
    'loteria'    => 15,
    'canicas'    => 100,
    'escondidas' => 25,
    'vasos'      => 25,
    'balero'     => 30,
    'trompo'     => 20,
    'sillas'     => 15,
];
const MULTIPLICADOR_DIFICULTAD = [1.0, 1.5, 2.0];

function nivel_de(int $exp): int
{
    return intdiv($exp, 100) + 1;
}

/** Estadísticas del usuario, calculadas a partir de la tabla "partidas". */
function estadisticas(PDO $db, int $uid): array
{
    $q = $db->prepare(
        'SELECT COUNT(*) AS partidas,
                COALESCE(SUM(puntos), 0) AS puntos_total,
                COALESCE(MAX(puntos), 0) AS mejor_partida,
                COALESCE(SUM(victoria), 0) AS victorias,
                COALESCE(SUM(CASE WHEN dificultad = 2 THEN 1 ELSE 0 END), 0) AS dificil,
                COALESCE(SUM(en_linea), 0) AS en_linea,
                COUNT(DISTINCT juego) AS juegos_distintos
           FROM partidas WHERE usuario_id = ?'
    );
    $q->execute([$uid]);
    $st = array_map('intval', $q->fetch() ?: []);

    $p = $db->prepare('SELECT juego, COALESCE(SUM(victoria), 0) AS v FROM partidas WHERE usuario_id = ? GROUP BY juego');
    $p->execute([$uid]);
    $porJuego = [];
    foreach ($p->fetchAll() as $fila) {
        $porJuego[$fila['juego']] = (int)$fila['v'];
    }
    $st['por_juego'] = $porJuego;
    return $st;
}

/** Valor actual del usuario para un logro (según su "tipo"). */
function valor_logro(array $logro, array $st, int $nivel): int
{
    switch ($logro['tipo']) {
        case 'partidas':         return $st['partidas'] ?? 0;
        case 'puntos_total':     return $st['puntos_total'] ?? 0;
        case 'juegos_distintos': return $st['juegos_distintos'] ?? 0;
        case 'dificil':          return $st['dificil'] ?? 0;
        case 'en_linea':         return $st['en_linea'] ?? 0;
        case 'victorias':        return $st['victorias'] ?? 0;
        case 'mejor_partida':    return $st['mejor_partida'] ?? 0;
        case 'nivel':            return $nivel;
        case 'victorias_juego':  return $st['por_juego'][$logro['juego'] ?? ''] ?? 0;
        default:                 return 0;
    }
}

/**
 * Estado completo que recibe el navegador: usuario, logros con su progreso
 * y recompensas con lo que ya se obtuvo. Sin sesión solo manda los catálogos.
 */
function estado(PDO $db, ?int $uid): array
{
    $logros = $db->query('SELECT id, clave, nombre, descripcion, tipo, juego, meta FROM logros ORDER BY id')->fetchAll();
    $recs   = $db->query('SELECT id, clave, categoria, nombre, descripcion, costo, nivel_min, emoji, fondo FROM recompensas ORDER BY id')->fetchAll();

    $usuario = null;
    $st = [];
    $nivel = 1;
    $obtenidas = [];
    $equipadas = [];

    if ($uid !== null) {
        $q = $db->prepare('SELECT nombre, puntos, exp FROM usuarios WHERE id = ?');
        $q->execute([$uid]);
        $u = $q->fetch();
        if ($u) {
            $nivel = nivel_de((int)$u['exp']);
            $st = estadisticas($db, $uid);
            $o = $db->prepare('SELECT recompensa_id, equipada FROM recompensas_usuario WHERE usuario_id = ?');
            $o->execute([$uid]);
            foreach ($o->fetchAll() as $fila) {
                $obtenidas[(int)$fila['recompensa_id']] = ((int)$fila['equipada'] === 1);
            }
            foreach ($recs as $r) {
                if (($obtenidas[(int)$r['id']] ?? false) === true) {
                    $equipadas[$r['categoria']] = $r['clave'];
                }
            }
            $usuario = [
                'nombre'    => $u['nombre'],
                'puntos'    => (int)$u['puntos'],
                'exp'       => (int)$u['exp'],
                'nivel'     => $nivel,
                'partidas'  => (int)($st['partidas'] ?? 0),
                'equipadas' => (object)$equipadas,
            ];
        }
    }

    $salidaLogros = [];
    foreach ($logros as $l) {
        $meta = (int)$l['meta'];
        $prog = $usuario ? min($meta, valor_logro($l, $st, $nivel)) : 0;
        $salidaLogros[] = [
            'clave'        => $l['clave'],
            'nombre'       => $l['nombre'],
            'descripcion'  => $l['descripcion'],
            'meta'         => $meta,
            'progreso'     => $prog,
            'desbloqueado' => $usuario !== null && $prog >= $meta,
        ];
    }

    $salidaRecs = [];
    foreach ($recs as $r) {
        $salidaRecs[] = [
            'clave'       => $r['clave'],
            'categoria'   => $r['categoria'],
            'nombre'      => $r['nombre'],
            'descripcion' => $r['descripcion'],
            'costo'       => (int)$r['costo'],
            'nivel_min'   => (int)$r['nivel_min'],
            'emoji'       => $r['emoji'],
            'fondo'       => $r['fondo'],
            'obtenida'    => isset($obtenidas[(int)$r['id']]),
            'equipada'    => ($obtenidas[(int)$r['id']] ?? false) === true,
        ];
    }

    return ['usuario' => $usuario, 'logros' => $salidaLogros, 'recompensas' => $salidaRecs];
}

/** Guarda los logros que el usuario acaba de alcanzar y devuelve sus nombres. */
function desbloquear_logros(PDO $db, int $uid): array
{
    $q = $db->prepare('SELECT exp FROM usuarios WHERE id = ?');
    $q->execute([$uid]);
    $nivel = nivel_de((int)$q->fetchColumn());
    $st = estadisticas($db, $uid);

    $ya = [];
    $y = $db->prepare('SELECT logro_id FROM logros_usuario WHERE usuario_id = ?');
    $y->execute([$uid]);
    foreach ($y->fetchAll() as $fila) {
        $ya[(int)$fila['logro_id']] = true;
    }

    $nuevos = [];
    $ins = $db->prepare('INSERT INTO logros_usuario (usuario_id, logro_id, fecha) VALUES (?, ?, ?)');
    foreach ($db->query('SELECT id, nombre, tipo, juego, meta FROM logros ORDER BY id')->fetchAll() as $l) {
        if (!isset($ya[(int)$l['id']]) && valor_logro($l, $st, $nivel) >= (int)$l['meta']) {
            $ins->execute([$uid, (int)$l['id'], date('Y-m-d H:i:s')]);
            $nuevos[] = $l['nombre'];
        }
    }
    return $nuevos;
}
