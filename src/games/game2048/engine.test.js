import {
  applyMove,
  boardResult,
  canMove,
  createGameState,
  createLocalGame,
  playLocal,
  slide,
  slideLine,
  spawnTile,
  tileClass,
} from './engine'

const STUCK = [
  [2, 4, 2, 4],
  [4, 2, 4, 2],
  [2, 4, 2, 4],
  [4, 2, 4, 2],
]

describe('2048', () => {
  test('desliza e funde como o jogo original', () => {
    expect(slideLine([0, 2, 2, 2])).toEqual({ line: [4, 2, 0, 0], gained: 4 })
    expect(slideLine([2, 2, 2, 2])).toEqual({ line: [4, 4, 0, 0], gained: 8 })
    expect(slideLine([4, 0, 0, 4])).toEqual({ line: [8, 0, 0, 0], gained: 8 })
  })

  test('as quatro direções', () => {
    const board = [
      [2, 0, 0, 2],
      [0, 4, 0, 0],
      [0, 4, 0, 0],
      [0, 0, 0, 0],
    ]
    expect(slide(board, 'LEFT').board[0]).toEqual([4, 0, 0, 0])
    expect(slide(board, 'RIGHT').board[1]).toEqual([0, 0, 0, 4])
    expect(slide(board, 'UP').board[0]).toEqual([2, 8, 0, 2])
    expect(slide(board, 'DOWN').board[3]).toEqual([2, 8, 0, 2])
    expect(slide(board, 'UP').gained).toBe(8)
  })

  test('começa com duas peças 2', () => {
    const state = createLocalGame(() => 0)
    expect(state.board.flat().filter((value) => value === 2)).toHaveLength(2)
    expect(state.points).toBe(0)
    expect(spawnTile(STUCK, () => 0)).toBe(STUCK)
  })

  test('jogada soma pontos e nasce uma peça; jogada parada não muda nada', () => {
    const state = createGameState({
      board: [
        [2, 2, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    })
    const move = playLocal(state, 'LEFT', () => 0)
    expect(move.moved).toBe(true)
    expect(move.points).toBe(4)
    expect(move.moves).toBe(1)
    expect(move.board.flat().filter(Boolean)).toHaveLength(2)

    const next = applyMove(state, move)
    const blocked = playLocal(createGameState({ board: [[2, 4, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]] }), 'LEFT')
    expect(blocked.moved).toBe(false)
    expect(next.points).toBe(4)
  })

  test('vitória em 2048 e derrota sem jogadas', () => {
    expect(canMove(STUCK)).toBe(false)
    expect(boardResult(STUCK)).toBe('LOSS')
    expect(boardResult([[2048, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]])).toBe('WIN')

    const almost = createGameState({ board: [[1024, 1024, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]] })
    const won = playLocal(almost, 'LEFT', () => 0)
    expect(won.finished).toBe(true)
    expect(won.result).toBe('WIN')
    expect(playLocal({ ...almost, finished: true }, 'LEFT')).toBeNull()
  })

  test('classes de cor do original', () => {
    expect(tileClass(0)).toBe('tile')
    expect(tileClass(2)).toBe('tile x2')
    expect(tileClass(16384)).toBe('tile x8192')
  })
})
