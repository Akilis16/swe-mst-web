import { request } from './http'
import { routes } from './routes'

/**
 * Contrato do módulo 2048 da MST API.
 * O servidor aplica a jogada, sorteia a peça nova e soma os pontos.
 */
export const game2048Api = {
  start() {
    return request(routes.game2048Rounds, { method: 'POST', body: {} })
  },
  move(roundId, { direction }) {
    return request(routes.game2048Move(roundId), { method: 'POST', body: { direction } })
  },
}
