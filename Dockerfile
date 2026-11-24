# ---------- Etapa 1: build do front (Vite) ----------
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Etapa 2: servir estático com Nginx ----------
FROM nginx:1.27-alpine

# URL da API MST para onde o Nginx encaminha /api.
# Pode ser sobrescrita em tempo de execução (docker run -e API_URL=...).
ENV API_URL=http://host.docker.internal:4000

# O entrypoint oficial do nginx roda envsubst em /etc/nginx/templates/*.template
# e grava o resultado em /etc/nginx/conf.d/.
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
