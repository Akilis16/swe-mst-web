import { request } from './http'
import { routes } from './routes'

/**
 * Contrato do módulo Forca da MST API.
 * A palavra fica no servidor; o cliente recebe só a máscara até o fim da partida.
 */
export const hangmanApi = {
  categories() {
    return request(routes.hangmanCategories)
  },
  start({ category }) {
    return request(routes.hangmanRounds, { method: 'POST', body: { category } })
  },
  guess(roundId, { letter }) {
    return request(routes.hangmanGuess(roundId), { method: 'POST', body: { letter } })
  },
}
