import { request } from './http'
import { routes } from './routes'

/**
 * Contrato do módulo Jogo da Memória da MST API.
 * O servidor embaralha as cartas e só identifica cada uma quando ela é virada.
 */
export const memoryApi = {
  themes() {
    return request(routes.memoryThemes)
  },
  start({ themeId }) {
    return request(routes.memoryRounds, { method: 'POST', body: { themeId } })
  },
  move(roundId, { position }) {
    return request(routes.memoryMove(roundId), { method: 'POST', body: { position } })
  },
}
