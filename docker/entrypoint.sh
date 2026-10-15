#!/bin/sh
# Hace que Apache escuche en el puerto que pide Render (variable PORT).
set -e
PORT="${PORT:-10000}"
sed -i "s/^Listen 80\$/Listen ${PORT}/" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf
exec docker-php-entrypoint "$@"
