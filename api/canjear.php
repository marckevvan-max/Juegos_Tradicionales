<?php
/** POST /api/canjear.php {clave} → gasta puntos para obtener una recompensa. */
declare(strict_types=1);
require __DIR__ . '/_nucleo.php';

$d   = entrada();
$uid = exigir_usuario('Inicia sesión para canjear recompensas.');
$db  = conectar();

$q = $db->prepare('SELECT id, costo, nivel_min FROM recompensas WHERE clave = ?');
$q->execute([(string)($d['clave'] ?? '')]);
$r = $q->fetch();
if (!$r) {
    error_json('Esa recompensa no existe.', 404);
}

$q = $db->prepare('SELECT exp FROM usuarios WHERE id = ?');
$q->execute([$uid]);
$nivel = nivel_de((int)$q->fetchColumn());
if ($nivel < (int)$r['nivel_min']) {
    error_json('Necesitas llegar al nivel ' . (int)$r['nivel_min'] . '.', 403);
}

$q = $db->prepare('SELECT 1 FROM recompensas_usuario WHERE usuario_id = ? AND recompensa_id = ?');
$q->execute([$uid, (int)$r['id']]);
if ($q->fetch()) {
    error_json('Ya tienes esta recompensa.', 409);
}

$db->beginTransaction();
try {
    $costo = (int)$r['costo'];
    $gasto = $db->prepare('UPDATE usuarios SET puntos = puntos - ? WHERE id = ? AND puntos >= ?');
    $gasto->execute([$costo, $uid, $costo]);
    if ($gasto->rowCount() !== 1) {
        $db->rollBack();
        error_json('No tienes puntos suficientes.', 402);
    }
    $db->prepare('INSERT INTO recompensas_usuario (usuario_id, recompensa_id, equipada, fecha) VALUES (?, ?, 0, ?)')
       ->execute([$uid, (int)$r['id'], date('Y-m-d H:i:s')]);
    $db->commit();
} catch (PDOException $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    if ((string)$e->getCode() === '23000') {
        error_json('Ya tienes esta recompensa.', 409);
    }
    throw $e;
}

json_salida(estado($db, $uid));
