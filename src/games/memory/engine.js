/**
 * Regras do Jogo da Memória.
 *
 * O estado tem o mesmo formato no modo local e no online: cada jogada é uma
 * "resposta de movimento" igual à da MST API (MemoryMoveResponse). No modo local
 * ela é calculada aqui por resolveLocalMove; no online vem do servidor. Em ambos
 * os casos applyMove atualiza o tabuleiro.
 */
export const PAIRS = 9
export const MISMATCH_DELAY_MS = 500

export function shuffle(items, random = Math.random) {
  const copy = items.slice()
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Embaralha os pares no navegador. O layout fica guardado só no componente. */
export function createLocalRound(theme, random = Math.random) {
  const chosen = theme.cards.slice(0, PAIRS)
  const layout = shuffle([...chosen, ...chosen], random)
  const state = createMemoryState({
    backImagePath: theme.backImagePath,
    pairs: chosen.length,
    cards: layout.map((_, position) => ({ position, label: null, imagePath: null })),
  })
  return { layout, state }
}

/** Monta o estado a partir de uma partida (MemoryRoundResponse ou local). */
export function createMemoryState({ backImagePath, pairs, matchedPairs = 0, errors = 0, finished = false, cards, revealedPositions = [] }) {
  const matched = new Set(revealedPositions)
  return {
    backImagePath,
    pairs,
    matchedPairs,
    errors,
    finished,
    open: [],
    cards: cards.map((card) => ({
      position: card.position,
      label: card.label ?? null,
      imagePath: card.imagePath ?? null,
      matched: matched.has(card.position),
    })),
  }
}

export function canFlip(state, position) {
  if (!state || state.finished || state.open.length >= 2) return false
  const card = state.cards[position]
  if (!card || card.matched) return false
  return !state.open.includes(position)
}

export function isFaceUp(state, position) {
  const card = state.cards[position]
  return Boolean(card && (card.matched || state.open.includes(position)))
}

/** Calcula localmente a mesma resposta que a API daria para a carta virada. */
export function resolveLocalMove(layout, state, position) {
  const card = cardView(layout, position)
  const pending = state.open.length === 1 ? state.open[0] : null
  if (pending === null) {
    return {
      card,
      previousCard: null,
      pairCompleted: false,
      errors: state.errors,
      matchedPairs: state.matchedPairs,
      pairs: state.pairs,
      finished: false,
    }
  }
  const pairCompleted = layout[pending].id === layout[position].id
  const matchedPairs = state.matchedPairs + (pairCompleted ? 1 : 0)
  return {
    card,
    previousCard: cardView(layout, pending),
    pairCompleted,
    errors: state.errors + (pairCompleted ? 0 : 1),
    matchedPairs,
    pairs: state.pairs,
    finished: matchedPairs >= state.pairs,
  }
}

/** Aplica uma resposta de movimento (local ou da API). */
export function applyMove(state, move) {
  const cards = state.cards.slice()
  reveal(cards, move.card)
  let open
  if (!move.previousCard) {
    open = [move.card.position]
  } else {
    reveal(cards, move.previousCard)
    if (move.pairCompleted) {
      cards[move.card.position] = { ...cards[move.card.position], matched: true }
      cards[move.previousCard.position] = { ...cards[move.previousCard.position], matched: true }
      open = []
    } else {
      open = [move.previousCard.position, move.card.position]
    }
  }
  return {
    ...state,
    cards,
    open,
    errors: move.errors,
    matchedPairs: move.matchedPairs,
    finished: Boolean(move.finished),
  }
}

/** Desvira as duas cartas de uma tentativa errada. */
export function hideMismatch(state) {
  if (state.open.length < 2) return state
  return { ...state, open: [] }
}

export function hasMismatch(state) {
  return Boolean(state && state.open.length === 2)
}

function reveal(cards, view) {
  const current = cards[view.position]
  if (!current) return
  cards[view.position] = { ...current, label: view.label, imagePath: view.imagePath }
}

function cardView(layout, position) {
  const card = layout[position]
  return { position, label: card.label, imagePath: card.imagePath }
}

export function assetUrl(path) {
  if (!path) return ''
  return path.startsWith('/') || path.startsWith('http') ? path : `/${path}`
}

/** Tema remoto (MST API) equivalente ao tema local, comparando pelo nome. */
export function findRemoteTheme(remoteThemes, theme) {
  if (!Array.isArray(remoteThemes)) return null
  const name = normalize(theme.name)
  return remoteThemes.find((remote) => normalize(remote.name) === name) ?? null
}

function normalize(text) {
  return String(text ?? '').trim().toLowerCase()
}
