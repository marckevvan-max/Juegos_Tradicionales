-- =====================================================================
--  SOLO si ya importaste la versión anterior de la base de datos
--  (la tabla `usuarios` existe pero no tiene la columna `correo`).
--  En phpMyAdmin: elige tu base → pestaña SQL → pega esto → Continuar.
--  Si importas estructura_y_datos.sql en una base NUEVA, no lo necesitas.
-- =====================================================================
ALTER TABLE usuarios ADD COLUMN correo VARCHAR(120) NULL AFTER nombre;
ALTER TABLE usuarios ADD UNIQUE KEY uq_usuarios_correo (correo);
