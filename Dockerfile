# Imagen para Render (y para probar en tu computadora con Docker)
# PHP 8.3 + Apache. Sirve el HTML/CSS/JS y la API en PHP desde el mismo dominio.
FROM php:8.3-apache

# Extensión para conectarse a MySQL/MariaDB
RUN docker-php-ext-install pdo pdo_mysql \
 && a2enmod rewrite headers \
 && echo "ServerName localhost" >> /etc/apache2/apache2.conf \
 # Permite que funcione el archivo .htaccess del proyecto
 && sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Configuración de PHP para producción (no muestra errores en pantalla)
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

WORKDIR /var/www/html
COPY . /var/www/html/
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/entrypoint.sh \
 && chmod +x /usr/local/bin/entrypoint.sh \
 && chown -R www-data:www-data /var/www/html

# Render le asigna un puerto en la variable PORT (10000 por defecto)
ENV PORT=10000
EXPOSE 10000

ENTRYPOINT ["entrypoint.sh"]
CMD ["apache2-foreground"]
