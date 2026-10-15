<?php
/** POST /api/registro.php {nombre, pass} → crea la cuenta e inicia sesión. */
declare(strict_types=1);
require __DIR__ . '/_nucleo.php';

$d      = entrada();
$nombre = trim((string)($d['nombre'] ?? ''));
$pass   = (string)($d['pass'] ?? '');

if (!preg_match('/^[\p{L}\p{N}_.-]{3,20}$/u', $nombre)) {
    error_json('El usuario debe tener de 3 a 20 caracteres: letras, números, punto, guion o guion bajo.', 422);
}
if (strlen($pass) < 6 || strlen($pass) > 72) {
    error_json('La contraseña debe tener de 6 a 72 caracteres.', 422);
}

$db = conectar();
$existe = $db->prepare('SELECT id FROM usuarios WHERE LOWER(nombre) = LOWER(?)');
$existe->execute([$nombre]);
if ($existe->fetch()) {
    error_json('Ese usuario ya existe.', 409);
}

try {
    $ins = $db->prepare('INSERT INTO usuarios (nombre, pass_hash, creado) VALUES (?, ?, ?)');
    $ins->execute([$nombre, password_hash($pass, PASSWORD_DEFAULT), date('Y-m-d H:i:s')]);
} catch (PDOException $e) {
    if ((string)$e->getCode() === '23000') {
        error_json('Ese usuario ya existe.', 409);
    }
    throw $e;
}

iniciar_sesion();
session_regenerate_id(true);
$_SESSION['uid'] = (int)$db->lastInsertId();
json_salida(estado($db, usuario_id()), 201);
