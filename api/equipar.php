<?php
/** POST /api/equipar.php {clave, equipar: true|false} → equipa o quita una recompensa obtenida. */
declare(strict_types=1);
require __DIR__ . '/_nucleo.php';

$d   = entrada();
$uid = exigir_usuario('Inicia sesión para equipar recompensas.');
$db  = conectar();

$q = $db->prepare('SELECT id, categoria FROM recompensas WHERE clave = ?');
$q->execute([(string)($d['clave'] ?? '')]);
$r = $q->fetch();
if (!$r) {
    error_json('Esa recompensa no existe.', 404);
}

$q = $db->prepare('SELECT 1 FROM recompensas_usuario WHERE usuario_id = ? AND recompensa_id = ?');
$q->execute([$uid, (int)$r['id']]);
if (!$q->fetch()) {
    error_json('Primero tienes que canjear esta recompensa.', 403);
}

$db->beginTransaction();
try {
    // Solo una recompensa equipada por categoría (sticker, marco o título).
    $db->prepare('UPDATE recompensas_usuario SET equipada = 0
                   WHERE usuario_id = ? AND recompensa_id IN (SELECT id FROM recompensas WHERE categoria = ?)')
       ->execute([$uid, $r['categoria']]);
    if (!empty($d['equipar'])) {
        $db->prepare('UPDATE recompensas_usuario SET equipada = 1 WHERE usuario_id = ? AND recompensa_id = ?')
           ->execute([$uid, (int)$r['id']]);
    }
    $db->commit();
} catch (Throwable $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    throw $e;
}

json_salida(estado($db, $uid));
