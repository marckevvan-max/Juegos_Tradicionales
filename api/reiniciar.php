<?php
/** POST /api/reiniciar.php → borra el progreso del usuario (puntos, logros y recompensas). */
declare(strict_types=1);
require __DIR__ . '/_nucleo.php';

entrada();
$uid = exigir_usuario('Inicia sesión primero.');
$db  = conectar();

$db->beginTransaction();
try {
    foreach (['partidas', 'logros_usuario', 'recompensas_usuario'] as $tabla) {
        $db->prepare("DELETE FROM $tabla WHERE usuario_id = ?")->execute([$uid]);
    }
    $db->prepare('UPDATE usuarios SET puntos = 0, exp = 0 WHERE id = ?')->execute([$uid]);
    $db->commit();
} catch (Throwable $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    throw $e;
}

json_salida(estado($db, $uid));
