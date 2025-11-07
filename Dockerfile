FROM nginx:alpine
RUN chmod -R g+rwx /var/cache/nginx /var/run /var/log/nginx && \
    chgrp -R 0 /var/cache/nginx /var/run /var/log/nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/
EXPOSE 8080
USER 1001