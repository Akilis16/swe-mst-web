/**
 * Regras do 2048 (mesmas do jogo original e da MST API).
 *
 * As peças deslizam até a borda; duas iguais vizinhas viram uma com o dobro do
 * valor, e esse valor soma na pontuação. Só nasce um 2 novo quando a jogada mexe
 * o tabuleiro. Chegar a 2048 vence; ficar sem jogadas encerra a partida.
 */
export const SIZE = 4
export const WIN_TILE = 2048
export const SPAWN_VALUE = 2

export const KEY_DIRECTIONS = {
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
}

export function createBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
}

export function spawnTile(board, random = Math.random) {
  const empty = []
  board.forEach((row, r) =>
    row.forEach((value, c) => {
      if (value === 0) empty.push([r, c])
    }),
  )
  if (empty.length === 0) return board
  const [r, c] = empty[Math.floor(random() * empty.length)]
  const next = board.map((row) => row.slice())
  next[r][c] = SPAWN_VALUE
  return next
}

/** [0, 2, 2, 2] → [4, 2, 0, 0] e 4 pontos. */
export function slideLine(line) {
  const packed = line.filter((value) => value !== 0)
  const out = []
  let gained = 0
  for (let i = 0; i < packed.length; i += 1) {
    if (i + 1 < packed.length && packed[i] === packed[i + 1]) {
      out.push(packed[i] * 2)
      gained += packed[i] * 2
      i += 1
    } else {
      out.push(packed[i])
    }
  }
  while (out.length < SIZE) out.push(0)
  return { line: out, gained }
}

export function slide(board, direction) {
  const next = createBoard()
  let gained = 0
  let moved = false
  for (let line = 0; line < SIZE; line += 1) {
    const cells = Array.from({ length: SIZE }, (_, i) => cellOf(direction, line, i))
    const before = cells.map(([r, c]) => board[r][c])
    const result = slideLine(before)
    gained += result.gained
    cells.forEach(([r, c], i) => {
      next[r][c] = result.line[i]
      if (result.line[i] !== before[i]) moved = true
    })
  }
  return { board: next, moved, gained }
}

function cellOf(direction, line, i) {
  switch (direction) {
    case 'LEFT':
      return [line, i]
    case 'RIGHT':
      return [line, SIZE - 1 - i]
    case 'UP':
      return [i, line]
    case 'DOWN':
      return [SIZE - 1 - i, line]
    default:
      throw new Error(`Direção inválida: ${direction}`)
  }
}

export function canMove(board) {
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      const value = board[r][c]
      if (value === 0) return true
      if (c + 1 < SIZE && board[r][c + 1] === value) return true
      if (r + 1 < SIZE && board[r + 1][c] === value) return true
    }
  }
  return false
}

export function maxTile(board) {
  return Math.max(0, ...board.flat())
}

export function boardResult(board) {
  if (maxTile(board) >= WIN_TILE) return 'WIN'
  return canMove(board) ? null : 'LOSS'
}

/** Partida no formato da Game2048RoundResponse da API. */
export function createGameState({ board, points = 0, moves = 0, finished = false, result = null }) {
  return { board, points, moves, maxTile: maxTile(board), finished, result }
}

export function createLocalGame(random = Math.random) {
  return createGameState({ board: spawnTile(spawnTile(createBoard(), random), random) })
}

/** Mesmo cálculo que a API faz em POST /2048/rounds/{id}/moves. */
export function playLocal(state, direction, random = Math.random) {
  if (state.finished) return null
  const slid = slide(state.board, direction)
  if (!slid.moved) {
    return { ...state, moved: false, gained: 0 }
  }
  const board = spawnTile(slid.board, random)
  const result = boardResult(board)
  return {
    moved: true,
    gained: slid.gained,
    board,
    points: state.points + slid.gained,
    moves: state.moves + 1,
    maxTile: maxTile(board),
    finished: result !== null,
    result,
  }
}

export function applyMove(state, move) {
  return {
    ...state,
    board: move.board,
    points: move.points,
    moves: move.moves,
    maxTile: move.maxTile,
    finished: Boolean(move.finished),
    result: move.result ?? null,
  }
}

/** Classes do jogo original: x2 … x4096; acima disso, x8192. */
export function tileClass(value) {
  if (!value) return 'tile'
  return `tile ${value <= 4096 ? `x${value}` : 'x8192'}`
}
