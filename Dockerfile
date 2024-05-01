FROM nginxinc/nginx-unprivileged:1.25-alpine3.18
WORKDIR /opt/app
COPY --chown=nginx:root config/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --chown=nginx:nginx build/prod /opt/app/build
COPY --chown=nginx:nginx config/scripts/env-injection.sh /opt/app/build/env-injection.sh
COPY --chown=nginx:nginx config/scripts/init.sh /opt/app/init.sh
USER root
RUN chmod +x /opt/app/build/env-injection.sh /opt/app/init.sh \
    && chown -R nginx:nginx /usr/share/nginx/html \
    && chmod -R 755 /usr/share/nginx/html\
    && chmod 664 /etc/nginx/conf.d/default.conf
ENV ENV_INJECTION_FILE=/opt/app/build/env*.js

EXPOSE 8080
USER nginx
ENTRYPOINT ["./init.sh", "build/env-injection.sh", "build/.","/usr/share/nginx/html"]