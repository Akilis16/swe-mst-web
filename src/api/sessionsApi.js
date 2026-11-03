import { request } from './http'
import { routes } from './routes'

/**
 * A pontuação não vai no corpo. O servidor calcula ao encerrar a sessão.
 * Gabarito (correção do quiz, solução do sudoku) só existe no fim da partida.
 */
export const sessionsApi = {
  open(body) {
    return request(routes.playSessions, { method: 'POST', body })
  },
  get(id) {
    return request(routes.playSession(id))
  },
  finish(id) {
    return request(routes.finishSession(id), { method: 'POST' })
  },
  abandon(id) {
    return request(routes.abandonSession(id), { method: 'POST' })
  },
  mine(params = {}) {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.size) query.set('size', String(params.size))
    const suffix = query.toString() ? `?${query}` : ''
    return request(`${routes.myPlaySessions}${suffix}`)
  },
  tictactoeMove(id, { cell, symbol }) {
    return request(routes.tictactoeMove(id), {
      method: 'POST',
      body: { cell, symbol },
    })
  },
  quizAnswer(id, { questionIndex, choiceIndex }) {
    return request(routes.quizAnswer(id), {
      method: 'POST',
      body: { questionIndex, choiceIndex },
    })
  },
  sudokuCell(id, { index, value }) {
    return request(routes.sudokuCell(id), {
      method: 'POST',
      body: { index, value },
    })
  },
}
