# swe-mst-web

Front em React + Vite dos jogos do MST: jogo da velha, quiz, sudoku, jogo da memória, jogo da forca e 2048 (migrados do projeto estático `MemoriaSaudeTecnologia`).

## Scripts

```bash
npm install
npm test
npm run dev
```

A API esperada é a do Swagger em `http://localhost:4000`. No desenvolvimento o Vite encaminha `/api` para `VITE_API_URL` (veja `.env.example`). O placar não é enviado pelo browser: a partida abre com `POST /api/v1/play-sessions` e termina com `finish` ou `abandon`.

## Login (opcional)

`/entrar` e `/cadastro` usam `POST /api/v1/auth/login` e `POST /api/v1/auth/register`. O JWT fica em `localStorage` (`mst.auth`) e o cliente HTTP (`src/api/http.js`) envia `Authorization: Bearer` automaticamente; um `401` descarta o token. Sem login os jogos continuam funcionando em modo local.

## Memória, forca e 2048

Esses três jogos usam os endpoints próprios da MST API, em que o servidor decide cada jogada. O hook `src/hooks/useGameRound.js` escolhe o modo:

| Situação | O que acontece |
|---|---|
| Visitante (sem login) | A partida roda só no navegador (`src/games/*/engine.js`); a API não é chamada. |
| Logado | A partida abre no servidor e cada jogada vai para a API; ao fim aparece a pontuação calculada por ela. |
| Logado e a API cai no meio | O jogo avisa e começa uma nova partida local, sem travar. |
| Trocar de tema/partida ou sair da página no meio | A sessão aberta no servidor é abandonada (`POST /play-sessions/{id}/abandon`). |

| Jogo | Rota | Endpoints |
|---|---|---|
| Jogo da Memória | `/jogos/memoria` | `GET /memory/themes`, `POST /memory/rounds`, `POST /memory/rounds/{id}/moves` |
| Jogo da Forca | `/jogos/forca` | `GET /hangman/categories`, `POST /hangman/rounds`, `POST /hangman/rounds/{id}/guesses` |
| 2048 | `/jogos/2048` | `POST /2048/rounds`, `POST /2048/rounds/{id}/moves` |

Os motores locais devolvem as jogadas no mesmo formato das respostas da API (`MemoryMoveResponse`, `GuessResponse`, `Game2048MoveResponse`), então o componente aplica as duas do mesmo jeito. As imagens das cartas ficam em `public/img/Jogo_da_Memoria/`, no caminho que a API devolve em `imagePath`.
