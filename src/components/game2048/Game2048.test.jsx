import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { game2048Api } from '../../api/game2048Api'
import { renderLoggedIn } from '../../test/renderLoggedIn'
import { Game2048 } from './Game2048'

jest.mock('../../api/game2048Api', () => ({
  game2048Api: {
    start: jest.fn(),
    move: jest.fn(),
  },
}))

jest.mock('../../api/sessionsApi', () => ({
  sessionsApi: {
    abandon: jest.fn(() => Promise.resolve(null)),
  },
}))

function scoreText() {
  return document.getElementById('score').textContent
}

describe('Game2048', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  test('sem login joga no navegador com as setas do teclado', async () => {
    // random() = 0 → as duas primeiras peças nascem em (0,0) e (0,1)
    render(<Game2048 random={() => 0} />)

    expect(await screen.findByRole('gridcell', { name: 'Linha 1, coluna 1: 2' })).toBeInTheDocument()
    expect(screen.getAllByRole('gridcell')).toHaveLength(16)

    fireEvent.keyDown(window, { key: 'ArrowLeft' })

    expect(await screen.findByRole('gridcell', { name: 'Linha 1, coluna 1: 4' })).toBeInTheDocument()
    expect(scoreText()).toBe('4')
    expect(game2048Api.start).not.toHaveBeenCalled()
  })

  test('logado, o servidor aplica a jogada e registra a pontuação', async () => {
    const empty = [0, 0, 0, 0]
    game2048Api.start.mockResolvedValue({
      roundId: 'r1',
      playSessionId: 's1',
      board: [[1024, 1024, 0, 0], empty, empty, empty],
      points: 0,
      moves: 0,
      maxTile: 1024,
      finished: false,
      result: null,
    })
    game2048Api.move.mockResolvedValue({
      moved: true,
      gained: 2048,
      board: [[2048, 0, 0, 2], empty, empty, empty],
      points: 2048,
      moves: 1,
      maxTile: 2048,
      finished: true,
      result: 'WIN',
      score: { value: 2048 },
    })

    renderLoggedIn(<Game2048 />)
    expect(await screen.findByRole('gridcell', { name: 'Linha 1, coluna 1: 1024' })).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'ArrowLeft' })

    expect(await screen.findByText('Parabéns, você chegou a 2048!')).toBeInTheDocument()
    expect(screen.getByText('Pontuação salva na sua conta: 2048')).toBeInTheDocument()
    expect(scoreText()).toBe('2048')
    expect(game2048Api.move).toHaveBeenCalledWith('r1', { direction: 'LEFT' })
  })

  test('o botão de atualizar começa outra partida', async () => {
    const user = userEvent.setup()
    render(<Game2048 random={() => 0} />)
    await screen.findByRole('gridcell', { name: 'Linha 1, coluna 1: 2' })

    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    await waitFor(() => expect(scoreText()).toBe('4'))

    await user.click(screen.getByRole('button', { name: 'Novo jogo' }))
    await waitFor(() => expect(scoreText()).toBe('0'))
  })
})
