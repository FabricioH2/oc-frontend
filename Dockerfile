# Usa la imagen base oficial de Nginx basada en Alpine.
# Es muy ligera y segura por defecto.
FROM nginx:alpine

# Creamos un directorio para la configuración personalizada.
# Nginx ya viene con un usuario 'nginx' y grupo 'nginx' por defecto en la imagen Alpine.
# Podemos usar este usuario y grupo para la seguridad.

# Definimos variables de entorno para el usuario y el UID/GID si queremos ser explícitos,
# aunque nginx:alpine ya configura un usuario 'nginx'.
ARG NGINX_USER=nginx
ARG NGINX_UID=101 # Este es el UID por defecto del usuario 'nginx' en la imagen nginx:alpine
ARG NGINX_GID=101 # Este es el GID por defecto del grupo 'nginx' en la imagen nginx:alpine

# Aseguramos que los directorios necesarios tengan los permisos correctos
# para el usuario 'nginx' (UID 101) para que pueda escribir logs, cache, etc.,
# incluso si se ejecuta como no-root.
# La imagen nginx:alpine ya tiene esto bastante bien configurado, pero es una buena práctica reiterar.
RUN chown -R ${NGINX_UID}:${NGINX_GID} /var/cache/nginx /var/run /var/log/nginx && \
    chmod -R g+rwx /var/cache/nginx /var/run /var/log/nginx

    

# Copia tu archivo de configuración de Nginx.
# Si no tienes uno específico, la configuración predeterminada de Nginx Alpine
# generalmente apunta a /usr/share/nginx/html para servir archivos.
# Aquí estamos reemplazando la configuración por defecto para los Virtual Hosts.
# Si no tienes un nginx.conf personalizado, puedes omitir esta línea o usar la que viene con nginx.
# Para este ejemplo, asumimos que tienes un archivo local 'nginx.conf'
# que quieres usar como configuración principal.
# Puedes copiar el nginx.conf de la imagen base y modificarlo si necesitas uno de partida.
# Por simplicidad, si no tienes un nginx.conf, puedes omitir esta línea
# y Nginx usará su configuración por defecto que ya sabe servir archivos estáticos.
# Aquí lo incluimos asumiendo que el usuario podría querer personalizarlo.
# COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html


EXPOSE 8080

# Ejecuta Nginx con el usuario predefinido 'nginx' que no es root.
# La imagen nginx:alpine ya lo hace por defecto, pero especificarlo es claro.
# Si tuvieras que crear un usuario nuevo, lo harías con ADDUSER antes de esta