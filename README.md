# Juega, Gana y Diviértete · Juegos tradicionales mexicanos

Siete juegos (Lotería, Canicas, Escondidas, Vasos, Balero, Trompo y Sillas) con cuenta de usuario,
puntos, niveles, logros y recompensas. Los datos se guardan en **MySQL** (se administran con **phpMyAdmin**)
y el proyecto está listo para subirse a **GitHub** y publicarse en **Render**.

## Estructura de carpetas

```
proyecto-martha-juegos-tradicionales/
├── index.html                  ← entrada: redirige al menú
├── html/                       ← TODOS los HTML
│   ├── menu.html
│   ├── logros.html
│   ├── recompensas.html
│   └── juegos/                 ← un HTML por juego (loteria.html, canicas.html, …)
├── css/                        ← TODOS los CSS
│   ├── styles.css              ← estilos generales
│   ├── paginas.css             ← logros, recompensas y perfil
│   └── juegos/                 ← un CSS por juego
├── js/                         ← TODOS los JavaScript
│   ├── common.js               ← sesión, API, puntos y utilidades
│   ├── script.js               ← menú, juegos y cuenta
│   ├── logros.js, recompensas.js
│   └── juegos/                 ← la lógica de cada juego
├── img/                        ← imágenes (una sola copia)
├── api/                        ← servidor en PHP (habla con MySQL)
├── database/
│   └── estructura_y_datos.sql  ← tablas y datos iniciales para phpMyAdmin
├── Dockerfile, docker/         ← para Render y para Docker local
├── docker-compose.yml          ← juego + MySQL + phpMyAdmin en tu computadora
├── render.yaml                 ← configuración de Render (opcional)
├── .env.example                ← plantilla de claves (cópiala como .env)
└── .gitignore                  ← evita subir tus contraseñas a GitHub
```

> Nota: tu carpeta se llamaba `Api` (con mayúscula). En Linux/Render las mayúsculas importan, por eso aquí es `api`.

---

## 1. Abrirlo en Visual Studio Code

1. Descomprime el zip.
2. **Archivo → Abrir carpeta…** y elige `proyecto-martha-juegos-tradicionales`.
3. VS Code te sugerirá instalar **PHP Intelephense** y **Docker**: acepta.

> ⚠️ El juego **ya no se abre con doble clic** sobre `menu.html`: necesita un servidor con PHP para
> guardar usuarios y puntos. Usa XAMPP (opción A) o Docker (opción B).

---

## 2. Probarlo en tu computadora

### Opción A · XAMPP + phpMyAdmin

1. Abre **XAMPP Control Panel** y enciende **Apache** y **MySQL**.
2. Copia la carpeta del proyecto a `C:\xampp\htdocs\`.
3. Entra a <http://localhost/phpmyadmin>:
   1. **Nueva** → nombre `juegos_tradicionales`, cotejamiento `utf8mb4_unicode_ci` → **Crear**.
   2. Entra a esa base → pestaña **Importar** → **Seleccionar archivo** → `database/estructura_y_datos.sql` → **Importar**.
   3. Deben aparecer 7 tablas: `usuarios`, `partidas`, `logros`, `logros_usuario`, `recompensas`, `recompensas_usuario`, `sesiones`.
4. Abre <http://localhost/proyecto-martha-juegos-tradicionales/api/salud.php>. Debe decir `"ok":true`.
5. Juega en <http://localhost/proyecto-martha-juegos-tradicionales/>.

XAMPP usa por defecto usuario `root` sin contraseña, y el proyecto ya viene con esos valores. Si tu MySQL tiene
otra contraseña, copia `.env.example` como `.env` y cámbiala ahí.

### Opción B · Docker (todo automático)

Con Docker Desktop instalado, en la carpeta del proyecto:

```bash
docker compose up --build
```

- Juego: <http://localhost:8080>
- phpMyAdmin: <http://localhost:8081> (usuario `juegos`, contraseña `juegos_pass`)

La base de datos se crea e importa sola la primera vez.

---

## 3. Subirlo a GitHub

1. En <https://github.com/new> crea un repositorio **vacío** (sin README ni .gitignore), por ejemplo `juegos-tradicionales`.
2. En la terminal de VS Code (**Terminal → Nueva terminal**):

```bash
git init
git add .
git commit -m "Juegos tradicionales mexicanos"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/juegos-tradicionales.git
git push -u origin main
```

3. **Revisa antes de subir** con `git status`: el archivo `.env` **no** debe aparecer (el `.gitignore` ya lo excluye).
   Si alguna vez subes una contraseña por error, cámbiala en tu proveedor de base de datos: borrar el archivo después no basta.

---

## 4. Base de datos en la nube

**Render no ofrece MySQL propio** (solo PostgreSQL), así que el MySQL va en otro servicio. Una opción con plan gratuito es **Aiven for MySQL**:

1. Crea una cuenta en <https://aiven.io> → crea un servicio **MySQL** con el plan **Free**.
2. Cuando esté en estado *Running*, copia de la pantalla del servicio: **Host**, **Port**, **User**, **Password** y **Database** (suele ser `defaultdb`).
3. En *Allowed IP addresses* deja `0.0.0.0/0` (el plan gratuito de Render no tiene IP fija).
4. Importa las tablas (ver abajo).

Límites del plan gratuito de Aiven (según su documentación): 1 GB de disco, 1 GB de RAM, un servicio gratuito por organización,
sin IP fija, y Aiven puede **apagar** el servicio si no tiene actividad (avisa antes; lo puedes volver a encender).

### Ver y editar esa base con tu phpMyAdmin de XAMPP

Abre `C:\xampp\phpMyAdmin\config.inc.php` y agrega al final:

```php
$i++;
$cfg['Servers'][$i]['verbose']    = 'Mi base en la nube';
$cfg['Servers'][$i]['host']       = 'TU_HOST';
$cfg['Servers'][$i]['port']       = '12345';       // tu puerto
$cfg['Servers'][$i]['auth_type']  = 'cookie';
$cfg['Servers'][$i]['ssl']        = true;
$cfg['Servers'][$i]['ssl_verify'] = false;
```

Reinicia Apache, entra a phpMyAdmin, elige ese servidor al iniciar sesión y usa **Importar** con `database/estructura_y_datos.sql`
(selecciona primero tu base, por ejemplo `defaultdb`).

---

## 5. Publicarlo en Render

Render ejecuta PHP mediante **Docker** (ya viene el `Dockerfile` listo).

1. Entra a <https://render.com> e inicia sesión con tu cuenta de GitHub.
2. **New → Web Service** → elige tu repositorio.
3. Configura:
   - **Language / Runtime:** `Docker`
   - **Instance type:** `Free`
4. En **Environment Variables** agrega:

| Variable | Valor |
|---|---|
| `DB_HOST` | el host de tu base (ej. `mysql-xxxx.aivencloud.com`) |
| `DB_PORT` | el puerto (ej. `12345`) |
| `DB_NAME` | `defaultdb` (o el nombre de tu base) |
| `DB_USER` | tu usuario |
| `DB_PASS` | tu contraseña |
| `DB_SSL` | `true` |

5. Pulsa **Create Web Service** y espera a que termine el despliegue.
6. Abre `https://TU-SERVICIO.onrender.com/api/salud.php`. Debe decir `"ok":true`.
7. Juega en `https://TU-SERVICIO.onrender.com/`.

También puedes usar **New → Blueprint**, que lee el archivo `render.yaml` y solo te pide los valores de las variables.

Desde ahora, cada `git push` a `main` vuelve a desplegar solo.

**Plan gratuito de Render (según su documentación):** el servicio se duerme tras 15 minutos sin visitas y tarda cerca de un
minuto en despertar; el disco se borra en cada reinicio; hay 750 horas gratis al mes. Por eso las sesiones y todos los datos
se guardan en MySQL: al despertar, nadie pierde su cuenta ni su progreso.

---

## 6. Qué guarda la base de datos

| Tabla | Contenido |
|---|---|
| `usuarios` | nombre, contraseña cifrada, puntos y experiencia |
| `partidas` | cada partida jugada (juego, puntos, dificultad, en línea, victoria) |
| `logros` / `logros_usuario` | catálogo de logros y cuáles ganó cada usuario |
| `recompensas` / `recompensas_usuario` | catálogo de stickers, marcos y títulos, y cuáles tiene/equipó cada usuario |
| `sesiones` | inicios de sesión abiertos |

Desde phpMyAdmin puedes **agregar logros o recompensas nuevos** insertando filas en `logros` o `recompensas`; aparecen solos en el juego.
Para un logro nuevo usa uno de estos `tipo`: `partidas`, `puntos_total`, `juegos_distintos`, `dificil`, `en_linea`,
`victorias`, `mejor_partida`, `nivel` o `victorias_juego` (este último usa la columna `juego`).

## 7. API (carpeta `api/`)

| Archivo | Qué hace |
|---|---|
| `sesion.php` | devuelve el usuario actual, logros y recompensas |
| `registro.php` / `login.php` / `logout.php` | crear cuenta, entrar y salir |
| `partida.php` | guarda una partida, suma puntos y desbloquea logros |
| `canjear.php` / `equipar.php` | canjear y equipar recompensas |
| `reiniciar.php` | borra el progreso del usuario |
| `salud.php` | revisa la conexión con MySQL |

Seguridad incluida: contraseñas con `password_hash`, consultas preparadas (PDO), sesión en cookie `HttpOnly`/`SameSite`,
límite de puntos por juego y de frecuencia de partidas. Los juegos corren en el navegador, así que un usuario muy técnico
podría intentar enviar partidas falsas dentro de esos límites: para un proyecto escolar es suficiente, pero no es un sistema anti-trampas.

---

## Problemas frecuentes

| Qué ves | Qué hacer |
|---|---|
| "No se pudo conectar con el servidor" | Abriste el HTML con doble clic, o Apache/Docker está apagado. Usa `http://localhost/...`. |
| `salud.php` dice `faltan_tablas` | Falta importar `database/estructura_y_datos.sql` en la base correcta. |
| "Error del servidor… base de datos" | Revisa `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS` y `DB_NAME` (en `.env` o en Render). Con Aiven, `DB_SSL=true`. |
| En Render tarda un minuto en abrir | Es normal en el plan gratuito: el servicio estaba dormido. |
| Subí cambios y no se ven | Espera a que Render termine el despliegue y recarga con `Ctrl + F5`. |
| Error al construir Docker en Windows (`entrypoint.sh`) | Los saltos de línea de Windows: el proyecto ya incluye `.gitattributes` para evitarlo; haz `git add --renormalize .`. |
#   J u e g o s _ T r a d i c i o n a l e s  
 