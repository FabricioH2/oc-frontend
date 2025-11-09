# Etapa 1: Construcción de la aplicación React
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Construir la aplicación React
RUN npm run build

# Etapa 2: Servir con nginx
FROM nginx:alpine

# Configurar permisos para OpenShift (usuario no-root)
RUN chmod -R g+rwx /var/cache/nginx /var/run /var/log/nginx && \
    chgrp -R 0 /var/cache/nginx /var/run /var/log/nginx

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos construidos de React desde la etapa anterior
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 8080

# Cambiar a usuario no-root para OpenShift
USER 1001

# nginx se ejecuta en primer plano por defecto
CMD ["nginx", "-g", "daemon off;"]
