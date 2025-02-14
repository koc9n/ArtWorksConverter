FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY conf.d/upload.conf /etc/nginx/conf.d/upload.conf
RUN chmod 644 /etc/nginx/conf.d/*.conf 