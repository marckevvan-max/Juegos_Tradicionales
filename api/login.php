<?php
/** POST /api/login.php {nombre, pass} → inicia sesión. */
declare(strict_types=1);
require __DIR__ . '/_nucleo.php';

$d      = entrada();
$nombre = trim((string)($d['nombre'] ?? ''));
$pass   = (string)($d['pass'] ?? '');

$db = conectar();
$q = $db->prepare('SELECT id, pass_hash FROM usuarios WHERE LOWER(nombre) = LOWER(?)');
$q->execute([$nombre]);
$u = $q->fetch();

if ($u) {
    $ok = password_verify($pass, $u['pass_hash']);
} else {
    password_hash($pass, PASSWORD_DEFAULT); // tarda lo mismo aunque el usuario no exista
    $ok = false;
}
if (!$ok) {
    usleep(400000); // frena los intentos de adivinar contraseñas
    error_json('Usuario o contraseña incorrectos.', 401);
}

iniciar_sesion();
session_regenerate_id(true);
$_SESSION['uid'] = (int)$u['id'];
json_salida(estado($db, usuario_id()));
