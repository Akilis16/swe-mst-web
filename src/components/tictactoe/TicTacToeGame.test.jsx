import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { sessionsApi } from '../../api/sessionsApi'
import { TicTacToeGame } from './TicTacToeGame'

jest.mock('../../api/sessionsApi', () => ({
  sessionsApi: {
    open: jest.fn(() => Promise.reject(new Error('offline'))),
    finish: jest.fn(() => Promise.resolve({ score: 50 })),
    abandon: jest.fn(() => Promise.resolve(null)),
    tictactoeMove: jest.fn(() => Promise.resolve({})),
  },
}))

describe('TicTacToeGame', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('dois jogadores: X vence na primeira linha', async () => {
    const user = userEvent.setup()
    render(<TicTacToeGame mode="local" />)

    const cells = () => screen.getAllByRole('gridcell')
    await user.click(cells()[0])
    await user.click(cells()[3])
    await user.click(cells()[1])
    await user.click(cells()[4])
    await user.click(cells()[2])

    expect(screen.getByText("O JOGADOR 'X' GANHOU!")).toBeInTheDocument()
    expect(cells()[2]).toBeDisabled()
  })

  test('contra o computador, a casa vazia seguinte recebe O', async () => {
    const user = userEvent.setup()
    render(<TicTacToeGame mode="cpu" cpuDelayMs={0} random={() => 0} />)

    await user.click(screen.getByRole('gridcell', { name: 'Casa 1' }))

    await waitFor(() => {
      expect(screen.getByRole('gridcell', { name: 'Casa 2, O' })).toBeInTheDocument()
    })
    expect(sessionsApi.open).toHaveBeenCalledWith({ game: 'tictactoe', mode: 'cpu' })
  })
})
