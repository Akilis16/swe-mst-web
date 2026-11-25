import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApiError } from '../../api/http'
import { memoryApi } from '../../api/memoryApi'
import { sessionsApi } from '../../api/sessionsApi'
import { renderLoggedIn } from '../../test/renderLoggedIn'
import { MemoryGame } from './MemoryGame'

jest.mock('../../api/memoryApi', () => ({
  memoryApi: {
    themes: jest.fn(),
    start: jest.fn(),
    move: jest.fn(),
  },
}))

jest.mock('../../api/sessionsApi', () => ({
  sessionsApi: {
    abandon: jest.fn(() => Promise.resolve(null)),
  },
}))

const theme = {
  key: 'T',
  name: 'Teste',
  label: 'Teste',
  backImagePath: 'img/back.png',
  cards: [
    { id: 'a', label: 'A', imagePath: 'img/a.png' },
    { id: 'b', label: 'B', imagePath: 'img/b.png' },
  ],
}

// random() = 0.99 mantém a ordem local: [A, B, A, B]
const keepOrder = () => 0.99

function hidden(position) {
  return { position, label: null, imagePath: null }
}

function view(position, label) {
  return { position, label, imagePath: `img/${label}.png` }
}

describe('MemoryGame', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  test('sem login joga no navegador: erro desvira e o último par encerra', async () => {
    const user = userEvent.setup()
    render(<MemoryGame themes={[theme]} random={keepOrder} mismatchDelayMs={0} />)

    expect(await screen.findAllByRole('gridcell')).toHaveLength(4)
    expect(screen.getByText('Visitante')).toBeInTheDocument()

    await user.click(screen.getByRole('gridcell', { name: 'Carta 1, virada para baixo' }))
    await user.click(screen.getByRole('gridcell', { name: 'Carta 2, virada para baixo' }))
    await waitFor(() => {
      expect(screen.getByRole('gridcell', { name: 'Carta 2, virada para baixo' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('gridcell', { name: 'Carta 1, virada para baixo' }))
    await user.click(screen.getByRole('gridcell', { name: 'Carta 3, virada para baixo' }))
    expect(screen.getByRole('gridcell', { name: 'Carta 3, A' })).toBeDisabled()

    await user.click(screen.getByRole('gridcell', { name: 'Carta 2, virada para baixo' }))
    await user.click(screen.getByRole('gridcell', { name: 'Carta 4, virada para baixo' }))

    expect(await screen.findByText(/Parabéns, Visitante!/)).toHaveTextContent('você teve 1 erros!')
    expect(memoryApi.themes).not.toHaveBeenCalled()
    expect(memoryApi.start).not.toHaveBeenCalled()
  })

  test('logado, o servidor embaralha, decide o par e devolve a pontuação', async () => {
    memoryApi.themes.mockResolvedValue([{ id: 'tema-1', name: 'Teste', backImagePath: 'img/back.png' }])
    memoryApi.start.mockResolvedValue({
      roundId: 'r1',
      playSessionId: 's1',
      backImagePath: 'img/back.png',
      pairs: 1,
      matchedPairs: 0,
      errors: 0,
      finished: false,
      cards: [hidden(0), hidden(1)],
      revealedPositions: [],
    })
    memoryApi.move
      .mockResolvedValueOnce({
        card: view(1, 'Rick'),
        previousCard: null,
        pairCompleted: false,
        errors: 0,
        matchedPairs: 0,
        pairs: 1,
        finished: false,
      })
      .mockResolvedValueOnce({
        card: view(0, 'Rick'),
        previousCard: view(1, 'Rick'),
        pairCompleted: true,
        errors: 0,
        matchedPairs: 1,
        pairs: 1,
        finished: true,
        score: { value: 100 },
      })

    const user = userEvent.setup()
    renderLoggedIn(<MemoryGame themes={[theme]} />)

    expect(await screen.findAllByRole('gridcell')).toHaveLength(2)
    expect(memoryApi.start).toHaveBeenCalledWith({ themeId: 'tema-1' })

    await user.click(screen.getByRole('gridcell', { name: 'Carta 2, virada para baixo' }))
    expect(await screen.findByRole('gridcell', { name: 'Carta 2, Rick' })).toBeInTheDocument()
    await user.click(screen.getByRole('gridcell', { name: 'Carta 1, virada para baixo' }))

    expect(await screen.findByText('Pontuação: 100')).toBeInTheDocument()
    expect(screen.getByText(/Parabéns, Maria!/)).toBeInTheDocument()
    expect(memoryApi.move).toHaveBeenNthCalledWith(1, 'r1', { position: 1 })
    expect(memoryApi.move).toHaveBeenNthCalledWith(2, 'r1', { position: 0 })
  })

  test('se a API cair no meio, avisa e segue em modo local', async () => {
    memoryApi.themes.mockResolvedValue([{ id: 'tema-1', name: 'Teste' }])
    memoryApi.start.mockResolvedValue({
      roundId: 'r1',
      playSessionId: 's1',
      backImagePath: 'img/back.png',
      pairs: 2,
      cards: [hidden(0), hidden(1), hidden(2), hidden(3)],
      revealedPositions: [],
    })
    memoryApi.move.mockRejectedValue(new ApiError({ status: 0, code: 'NETWORK_ERROR' }))

    const user = userEvent.setup()
    renderLoggedIn(<MemoryGame themes={[theme]} random={keepOrder} />)

    await user.click(await screen.findByRole('gridcell', { name: 'Carta 1, virada para baixo' }))

    expect(await screen.findByText(/A conexão com o servidor caiu/)).toBeInTheDocument()
    await user.click(screen.getByRole('gridcell', { name: 'Carta 1, virada para baixo' }))
    expect(screen.getByRole('gridcell', { name: 'Carta 1, A' })).toBeInTheDocument()
    expect(memoryApi.move).toHaveBeenCalledTimes(1)
  })

  test('trocar de tema no meio abandona a partida aberta no servidor', async () => {
    const other = { ...theme, key: 'O', name: 'Outro', label: 'Outro' }
    memoryApi.themes.mockResolvedValue([
      { id: 'tema-1', name: 'Teste' },
      { id: 'tema-2', name: 'Outro' },
    ])
    memoryApi.start
      .mockResolvedValueOnce({ roundId: 'r1', playSessionId: 's1', backImagePath: 'img/back.png', pairs: 1, cards: [hidden(0), hidden(1)] })
      .mockResolvedValueOnce({ roundId: 'r2', playSessionId: 's2', backImagePath: 'img/back.png', pairs: 1, cards: [hidden(0), hidden(1)] })

    const user = userEvent.setup()
    renderLoggedIn(<MemoryGame themes={[theme, other]} />)
    await screen.findAllByRole('gridcell')

    await user.click(screen.getByRole('button', { name: 'Outro' }))

    await waitFor(() => expect(memoryApi.start).toHaveBeenLastCalledWith({ themeId: 'tema-2' }))
    expect(sessionsApi.abandon).toHaveBeenCalledWith('s1')
  })
})
