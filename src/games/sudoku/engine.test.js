import { createSudokuState, formatClock, inputDigit, pickPuzzle, revealSolution, tick } from './engine'
import { puzzles } from './puzzles'

describe('sudoku', () => {
  const puzzle = { mask: '1-', solution: '12' }

  test('os tabuleiros importados têm 81 casas', () => {
    for (const level of Object.values(puzzles)) {
      for (const item of level) {
        expect(item.mask).toHaveLength(81)
        expect(item.solution).toHaveLength(81)
        expect(item.solution).toMatch(/^[1-9]+$/)
      }
    }
  })

  test('casa dada não aceita digitação', () => {
    const state = createSudokuState({ mask: puzzle.mask, solution: puzzle.solution, seconds: 30 })
    const next = inputDigit(state, 0, '9')
    expect(next.notice).toBe('SUDOKU_CELL_IS_GIVEN')
    expect(next.cells[0].value).toBe('1')
    expect(next.lives).toBe(state.lives)
  })

  test('número errado consome uma chance e o último erro encerra', () => {
    const state = createSudokuState({ mask: puzzle.mask, solution: puzzle.solution, lives: 2, seconds: 30 })
    const missed = inputDigit(state, 1, '9')
    expect(missed.lives).toBe(1)
    expect(missed.cells[1].value).toBe('')
    expect(missed.notice).toBe('Número errado, perdeu uma chance!')
    const lost = inputDigit(missed, 1, '9')
    expect(lost.status).toBe('lost')
    expect(lost.notice).toBe('você perdeu!')
  })

  test('preencher a solução vence e revelar abandona sem exigir pontuação', () => {
    const state = createSudokuState({ mask: puzzle.mask, solution: puzzle.solution, seconds: 30 })
    const solved = inputDigit(state, 1, '2')
    expect(solved.status).toBe('solved')
    const revealed = revealSolution(state)
    expect(revealed.status).toBe('abandoned')
    expect(revealed.cells.map((cell) => cell.value).join('')).toBe('12')
  })

  test('o relógio chega a zero e a partida termina', () => {
    const state = createSudokuState({ mask: puzzle.mask, solution: puzzle.solution, seconds: 1 })
    const ended = tick(state)
    expect(ended.secondsLeft).toBe(0)
    expect(ended.status).toBe('lost')
    expect(formatClock(125)).toBe('02:05')
    expect(pickPuzzle([puzzle, puzzle], () => 0.9).index).toBe(1)
  })
})
