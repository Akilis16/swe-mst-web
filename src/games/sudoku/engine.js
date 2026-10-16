export const INITIAL_LIVES = 5
export const TIME_OPTIONS_MINUTES = [3, 5, 10]
export const LEVELS = [
  { id: 'easy', label: 'Fácil', rank: 1 },
  { id: 'medium', label: 'Médio', rank: 2 },
  { id: 'hard', label: 'Difícil', rank: 3 },
]

export function createSudokuState({ mask, solution, lives = INITIAL_LIVES, seconds }) {
  if (mask.length !== solution.length) {
    throw new Error('Máscara e solução do Sudoku precisam ter o mesmo tamanho.')
  }
  const cells = mask.split('').map((char) => ({
    value: char === '-' ? '' : char,
    given: char !== '-',
  }))
  return {
    cells,
    solution,
    lives,
    secondsLeft: seconds,
    status: 'playing',
    notice: null,
  }
}

export function inputDigit(state, index, digit) {
  if (state.status !== 'playing') return state
  const cell = state.cells[index]
  if (!cell) return state
  if (cell.given) {
    return { ...state, notice: 'SUDOKU_CELL_IS_GIVEN' }
  }
  if (digit === '') {
    const cells = state.cells.slice()
    cells[index] = { ...cell, value: '' }
    return { ...state, cells, notice: null }
  }
  if (!/^[1-9]$/.test(digit)) return state
  if (digit !== state.solution[index]) {
    if (state.lives <= 1) {
      return { ...state, lives: 0, status: 'lost', notice: 'você perdeu!' }
    }
    return {
      ...state,
      lives: state.lives - 1,
      notice: 'Número errado, perdeu uma chance!',
    }
  }
  const cells = state.cells.slice()
  cells[index] = { ...cell, value: digit }
  const solved = cells.every((item, cellIndex) => item.value === state.solution[cellIndex])
  if (solved) {
    return { ...state, cells, status: 'solved', notice: 'parabéns, você ganhou!' }
  }
  return { ...state, cells, notice: null }
}

export function revealSolution(state) {
  return {
    ...state,
    status: 'abandoned',
    notice: null,
    cells: state.cells.map((cell, index) => ({
      ...cell,
      value: state.solution[index],
    })),
  }
}

export function tick(state) {
  if (state.status !== 'playing') return state
  if (state.secondsLeft <= 1) {
    return { ...state, secondsLeft: 0, status: 'lost', notice: 'Tempo esgotado!' }
  }
  return { ...state, secondsLeft: state.secondsLeft - 1 }
}

export function formatClock(totalSeconds) {
  const safe = Math.max(0, totalSeconds)
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function pickPuzzle(collection, random = Math.random) {
  const index = Math.floor(random() * collection.length)
  return { index, puzzle: collection[index] }
}
