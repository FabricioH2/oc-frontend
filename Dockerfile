FROM nginx:alpine


ARG NGINX_USER=nginx
ARG NGINX_UID=101 
ARG NGINX_GID=101 


RUN mkdir -p /var/run/nginx && \
    chown -R ${NGINX_UID}:${NGINX_GID} /var/cache/nginx /var/log/nginx /var/run/nginx && \
    chmod -R g+rwx /var/cache/nginx /var/log/nginx /var/run/nginx


COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html

EXPOSE 8080

USER nginx

CMD ["nginx", "-g", "daemon off;"]
