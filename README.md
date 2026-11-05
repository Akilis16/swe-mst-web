# swe-mst-web

Front em React + Vite dos jogos da velha, quiz e sudoku do MST. Memória, forca e 2048 continuam no projeto estático.

## Scripts

```bash
npm install
npm test
npm run dev
```

A API esperada é a do Swagger em `http://localhost:4000`. No desenvolvimento o Vite encaminha `/api` para `VITE_API_URL` (veja `.env.example`). O placar não é enviado pelo browser: a partida abre com `POST /api/v1/play-sessions` e termina com `finish` ou `abandon`.
