import { applyMove, chooseCpuIndex, createBoard, findWinner, isDraw, opponent } from './engine'

describe('jogo da velha', () => {
  test('reconhece vitória em linha, coluna e diagonal', () => {
    const row = ['X', 'X', 'X', null, null, null, null, null, null]
    const column = ['O', null, null, 'O', null, null, 'O', null, null]
    const diagonal = ['X', null, null, null, 'X', null, null, null, 'X']
    expect(findWinner(row)).toBe('X')
    expect(findWinner(column)).toBe('O')
    expect(findWinner(diagonal)).toBe('X')
  })

  test('reconhece empate só com o tabuleiro cheio e sem vencedor', () => {
    const board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']
    expect(findWinner(board)).toBeNull()
    expect(isDraw(board)).toBe(true)
    expect(isDraw(createBoard())).toBe(false)
  })

  test('recusa casa ocupada', () => {
    const first = applyMove(createBoard(), 0, 'X')
    const second = applyMove(first.board, 0, 'O')
    expect(second.ok).toBe(false)
    expect(second.code).toBe('TICTACTOE_CELL_ALREADY_MATCHED')
    expect(second.board[0]).toBe('X')
  })

  test('o computador escolhe uma casa vazia', () => {
    const board = ['X', null, 'O', null, 'X', null, null, null, null]
    expect(chooseCpuIndex(board, () => 0)).toBe(1)
    expect(chooseCpuIndex(board, () => 0.99)).toBe(8)
    expect(opponent('X')).toBe('O')
  })
})
