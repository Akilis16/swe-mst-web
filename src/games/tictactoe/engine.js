export const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

export const EMPTY_BOARD = [null, null, null, null, null, null, null, null, null]

export function createBoard() {
  return EMPTY_BOARD.slice()
}

export function opponent(symbol) {
  return symbol === 'X' ? 'O' : 'X'
}

export function applyMove(board, index, symbol) {
  if (!Number.isInteger(index) || index < 0 || index > 8) {
    return { ok: false, code: 'INVALID_CELL', board }
  }
  if (board[index]) {
    return { ok: false, code: 'TICTACTOE_CELL_ALREADY_MATCHED', board }
  }
  const next = board.slice()
  next[index] = symbol
  return { ok: true, board: next }
}

export function findWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]
    }
  }
  return null
}

export function isDraw(board) {
  return board.every(Boolean) && !findWinner(board)
}

export function emptyIndexes(board) {
  return board.reduce((indexes, cell, index) => {
    if (!cell) indexes.push(index)
    return indexes
  }, [])
}

export function chooseCpuIndex(board, random = Math.random) {
  const empty = emptyIndexes(board)
  if (empty.length === 0) return -1
  const pick = Math.floor(random() * empty.length)
  return empty[pick]
}

export function outcomeForHuman(result, winner) {
  if (result === 'draw') return 'draw'
  if (winner === 'X') return 'win'
  return 'loss'
}
