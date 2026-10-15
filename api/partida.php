<?php
/**
 * POST /api/partida.php {juego, puntos, dificultad, en_linea, victoria}
 * Guarda una partida terminada, suma puntos/experiencia y desbloquea logros.
 */
declare(strict_types=1);
require __DIR__ . '/_nucleo.php';

$d   = entrada();
$uid = exigir_usuario('Inicia sesión para guardar tus puntos.');

$juego = (string)($d['juego'] ?? '');
if (!isset(MAX_PUNTOS[$juego])) {
    error_json('Juego no válido.', 422);
}
$dif = (int)($d['dificultad'] ?? 1);
if ($dif < 0 || $dif > 2) {
    error_json('Dificultad no válida.', 422);
}
$puntos = (int)($d['puntos'] ?? 0);
$maximo = (int)ceil(MAX_PUNTOS[$juego] * MULTIPLICADOR_DIFICULTAD[$dif]);
if ($puntos < 0 || $puntos > $maximo) {
    error_json('Puntos fuera de rango para este juego.', 422);
}
$enLinea  = !empty($d['en_linea']) ? 1 : 0;
$victoria = !empty($d['victoria']) ? 1 : 0;

$db = conectar();

// Una partida real dura más de unos segundos: evita que se envíen miles de golpe.
$ult = $db->prepare('SELECT fecha FROM partidas WHERE usuario_id = ? ORDER BY id DESC LIMIT 1');
$ult->execute([$uid]);
$f = $ult->fetchColumn();
if ($f !== false && time() - strtotime((string)$f) < 3) {
    error_json('Espera un momento antes de guardar otra partida.', 429);
}

$db->beginTransaction();
try {
    $db->prepare('INSERT INTO partidas (usuario_id, juego, puntos, dificultad, en_linea, victoria, fecha) VALUES (?, ?, ?, ?, ?, ?, ?)')
       ->execute([$uid, $juego, $puntos, $dif, $enLinea, $victoria, date('Y-m-d H:i:s')]);
    $db->prepare('UPDATE usuarios SET puntos = puntos + ?, exp = exp + ? WHERE id = ?')
       ->execute([$puntos, $puntos * 3, $uid]);
    $nuevos = desbloquear_logros($db, $uid);
    $db->commit();
} catch (Throwable $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    throw $e;
}

$salida = estado($db, $uid);
$salida['nuevos'] = $nuevos;
json_salida($salida);
