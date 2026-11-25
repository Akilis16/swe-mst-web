import {
  applyMove,
  canFlip,
  createLocalRound,
  createMemoryState,
  findRemoteTheme,
  hideMismatch,
  isFaceUp,
  resolveLocalMove,
} from './engine'
import { themes } from './themes'

const tinyTheme = {
  key: 'T',
  name: 'Teste',
  backImagePath: 'img/back.png',
  cards: [
    { id: 'a', label: 'A', imagePath: 'img/a.png' },
    { id: 'b', label: 'B', imagePath: 'img/b.png' },
  ],
}

// random() = 0.99 mantém a ordem: [a, b, a, b]
const keepOrder = () => 0.99

describe('jogo da memória', () => {
  test('os temas do jogo original têm 9 pares e as imagens do seed da API', () => {
    expect(themes.map((theme) => theme.name)).toEqual(['Rick and Morty', 'Cartoon', 'Escudos de Time'])
    for (const theme of themes) {
      expect(theme.cards).toHaveLength(9)
      expect(theme.backImagePath).toMatch(/^img\/Jogo_da_Memoria\/back_/)
    }
    const { layout, state } = createLocalRound(themes[0])
    expect(layout).toHaveLength(18)
    expect(state.cards.every((card) => card.label === null)).toBe(true)
  })

  test('par certo fixa as cartas e o último par encerra', () => {
    const { layout, state: initial } = createLocalRound(tinyTheme, keepOrder)
    expect(layout.map((card) => card.id)).toEqual(['a', 'b', 'a', 'b'])

    let state = applyMove(initial, resolveLocalMove(layout, initial, 0))
    expect(state.open).toEqual([0])
    expect(isFaceUp(state, 0)).toBe(true)
    expect(canFlip(state, 0)).toBe(false)

    state = applyMove(state, resolveLocalMove(layout, state, 2))
    expect(state.cards[0].matched).toBe(true)
    expect(state.cards[2].matched).toBe(true)
    expect(state.matchedPairs).toBe(1)
    expect(state.finished).toBe(false)

    state = applyMove(state, resolveLocalMove(layout, state, 1))
    state = applyMove(state, resolveLocalMove(layout, state, 3))
    expect(state.finished).toBe(true)
    expect(state.errors).toBe(0)
  })

  test('par errado conta erro, trava a terceira carta e desvira depois', () => {
    const { layout, state: initial } = createLocalRound(tinyTheme, keepOrder)
    let state = applyMove(initial, resolveLocalMove(layout, initial, 0))
    state = applyMove(state, resolveLocalMove(layout, state, 1))

    expect(state.errors).toBe(1)
    expect(state.open).toEqual([0, 1])
    expect(canFlip(state, 2)).toBe(false)

    state = hideMismatch(state)
    expect(state.open).toEqual([])
    expect(isFaceUp(state, 0)).toBe(false)
    expect(canFlip(state, 2)).toBe(true)
  })

  test('aplica a resposta da API do mesmo jeito que a local', () => {
    const state = createMemoryState({
      backImagePath: 'img/back.png',
      pairs: 2,
      cards: [0, 1, 2, 3].map((position) => ({ position, label: null, imagePath: null })),
    })
    const first = applyMove(state, {
      card: { position: 3, label: 'Rick', imagePath: 'img/rick.png' },
      previousCard: null,
      pairCompleted: false,
      errors: 0,
      matchedPairs: 0,
      pairs: 2,
      finished: false,
    })
    expect(first.cards[3]).toMatchObject({ label: 'Rick', matched: false })
    const second = applyMove(first, {
      card: { position: 1, label: 'Rick', imagePath: 'img/rick.png' },
      previousCard: { position: 3, label: 'Rick', imagePath: 'img/rick.png' },
      pairCompleted: true,
      errors: 0,
      matchedPairs: 1,
      pairs: 2,
      finished: false,
    })
    expect(second.cards[1].matched).toBe(true)
    expect(second.cards[3].matched).toBe(true)
  })

  test('encontra o tema da API pelo nome', () => {
    const remote = [{ id: 't1', name: 'Cartoon' }, { id: 't2', name: 'rick and morty ' }]
    expect(findRemoteTheme(remote, themes[0])?.id).toBe('t2')
    expect(findRemoteTheme(remote, themes[2])).toBeNull()
  })
})
