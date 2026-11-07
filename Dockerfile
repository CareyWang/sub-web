# ---- Dependencies ----
FROM --platform=$BUILDPLATFORM node:24-alpine AS build
WORKDIR /app
COPY . .
RUN yarn install
ARG BASE_PATH=/
RUN yarn build --base=${BASE_PATH}

FROM nginx:1.24-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chmod=755 docker/40-subweb-config.sh /docker-entrypoint.d/40-subweb-config.sh
EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]
