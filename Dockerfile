# Portal Azzu: Angular SPA served by unprivileged Nginx.
FROM node:22-alpine AS build
WORKDIR /workspace
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/dist/bancocloud-web/browser /usr/share/nginx/html
EXPOSE 8080
