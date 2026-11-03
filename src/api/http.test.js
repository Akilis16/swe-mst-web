import { ApiError, request } from './http'
import { routes } from './routes'
import { sessionsApi } from './sessionsApi'
import { listGames } from './gamesApi'

describe('cliente da API', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  test('abre sessão com método POST e sem pontuação no corpo', async () => {
    fetch.mockResolvedValue({ ok: true, status: 201, json: async () => ({ id: 's1' }) })

    await sessionsApi.open({ game: 'tictactoe', mode: 'local' })

    expect(fetch).toHaveBeenCalledWith(
      routes.playSessions,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ game: 'tictactoe', mode: 'local' }),
      }),
    )
    expect(fetch.mock.calls[0][1].body).not.toContain('score')
  })

  test('interpreta Problem Details de erro de validação', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({
        title: 'Validação',
        status: 422,
        code: 'VALIDATION_FAILED',
        errors: [{ field: 'cell', message: 'já ocupada' }],
      }),
    })

    const error = await request('/api/v1/play-sessions/1/tictactoe/moves', { method: 'POST', body: {} }).catch((cause) => cause)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.code).toBe('VALIDATION_FAILED')
    expect(error.errors[0]).toEqual({ field: 'cell', message: 'já ocupada' })
  })

  test('as rotas de sessão e catálogo estão devidamente formatadas', async () => {
    fetch.mockResolvedValue({ ok: true, status: 200, json: async () => [{ slug: 'tictactoe' }] })
    const games = await listGames()
    expect(games).toEqual([{ slug: 'tictactoe' }])
    expect(fetch.mock.calls[0][0]).toBe('/api/v1/games')

    expect(routes.finishSession('42')).toBe('/api/v1/play-sessions/42/finish')
    expect(routes.abandonSession('42')).toBe('/api/v1/play-sessions/42/abandon')
    expect(routes.playSession('42')).toBe('/api/v1/play-sessions/42')
    expect(routes.myPlaySessions).toBe('/api/v1/me/play-sessions')
    expect(routes.tictactoeMove('42')).toBe('/api/v1/play-sessions/42/tictactoe/moves')
    expect(routes.quizAnswer('42')).toBe('/api/v1/play-sessions/42/quiz/answers')
    expect(routes.sudokuCell('42')).toBe('/api/v1/play-sessions/42/sudoku/cells')
  })

  test('traduz falha de rede', async () => {
    fetch.mockRejectedValue(new Error('offline'))
    const error = await sessionsApi.finish('1').catch((cause) => cause)
    expect(error.code).toBe('NETWORK_ERROR')
  })
})
