<?php
/** GET /api/salud.php → comprueba que PHP y la base de datos funcionan (útil al configurar Render). */
declare(strict_types=1);
require __DIR__ . '/_nucleo.php';

$tablas = ['usuarios', 'partidas', 'logros', 'logros_usuario', 'recompensas', 'recompensas_usuario', 'sesiones'];
$faltan = [];
$db = conectar();
foreach ($tablas as $t) {
    try {
        $db->query("SELECT 1 FROM $t LIMIT 1");
    } catch (PDOException $e) {
        $faltan[] = $t;
    }
}
if ($faltan) {
    json_salida(['ok' => false, 'bd' => 'conectada', 'faltan_tablas' => $faltan,
                 'ayuda' => 'Importa database/estructura_y_datos.sql en phpMyAdmin.'], 503);
}
json_salida(['ok' => true, 'bd' => 'conectada', 'php' => PHP_VERSION]);
