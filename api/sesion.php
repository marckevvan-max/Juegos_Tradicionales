<?php
/** GET /api/sesion.php → estado actual (usuario si hay sesión, más logros y recompensas). */
declare(strict_types=1);
require __DIR__ . '/_nucleo.php';

iniciar_sesion();
json_salida(estado(conectar(), usuario_id()));
