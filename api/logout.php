<?php
/** POST /api/logout.php → cierra la sesión. */
declare(strict_types=1);
require __DIR__ . '/_nucleo.php';

entrada();
iniciar_sesion();
$_SESSION = [];
session_destroy();
setcookie(session_name(), '', ['expires' => time() - 3600, 'path' => '/']);
json_salida(estado(conectar(), null));
