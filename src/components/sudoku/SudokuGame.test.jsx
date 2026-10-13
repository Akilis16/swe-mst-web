import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { sessionsApi } from '../../api/sessionsApi'
import { cellIndex } from './SudokuGrid'
import { SudokuGame } from './SudokuGame'

jest.mock('../../api/sessionsApi', () => ({
  sessionsApi: {
    open: jest.fn(() => Promise.resolve({ id: 'sudoku-1' })),
    finish: jest.fn(() => Promise.resolve({ score: 100 })),
    abandon: jest.fn(() => Promise.resolve(null)),
    sudokuCell: jest.fn(() => Promise.resolve({})),
  },
}))

describe('SudokuGame', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('a grade agrupa as casas em blocos 3x3 reais', () => {
    expect(cellIndex(0, 0)).toBe(0)
    expect(cellIndex(0, 3)).toBe(9)
    expect(cellIndex(1, 0)).toBe(3)
    expect(cellIndex(8, 8)).toBe(80)
  })

  test('número errado avisa e revelar abandona a sessão', async () => {
    const user = userEvent.setup()
    render(<SudokuGame random={() => 0} />)

    await user.click(screen.getByRole('button', { name: 'Jogar' }))
    const empty = screen.getByRole('textbox', { name: 'Célula 2' })
    await user.type(empty, '9')

    expect(await screen.findByText('Número errado, perdeu uma chance!')).toBeInTheDocument()
    expect(screen.getByText(/Chances restantes: 4/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Resposta' }))
    await waitFor(() => {
      expect(sessionsApi.abandon).toHaveBeenCalledWith('sudoku-1')
    })
    expect(sessionsApi.finish).not.toHaveBeenCalled()
  })
})
