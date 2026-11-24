# swe-mst-web

Front em React + Vite dos jogos da velha, quiz e sudoku do MST. Memória, forca e 2048 continuam no projeto estático.

## Scripts

```bash
npm install
npm test
npm run dev
```

A API esperada é a do Swagger em `http://localhost:4000`. No desenvolvimento o Vite encaminha `/api` para `VITE_API_URL` (veja `.env.example`). O placar não é enviado pelo browser: a partida abre com `POST /api/v1/play-sessions` e termina com `finish` ou `abandon`.

## Docker

A imagem faz o build do Vite e serve o `dist/` com Nginx, que também encaminha `/api` para a API MST (mesmo papel do proxy do Vite em dev) e devolve o `index.html` para as rotas do React Router.

```bash
docker compose up -d --build
# abre em http://localhost:8080
```

Por padrão o Nginx encaminha `/api` para `http://host.docker.internal:4000` (a API rodando na sua máquina). Para apontar para outro endereço, defina `API_URL`:

```bash
API_URL=http://192.168.0.10:4000 docker compose up -d --build
```

Sem compose:

```bash
docker build -t swe-mst-web .
docker run -d -p 8080:80 -e API_URL=http://host.docker.internal:4000 \
  --add-host=host.docker.internal:host-gateway swe-mst-web
```
