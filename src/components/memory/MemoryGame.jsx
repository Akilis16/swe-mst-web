import { useEffect, useRef, useState } from 'react'
import { memoryApi } from '../../api/memoryApi'
import { useAuth } from '../../auth/AuthContext'
import {
  MISMATCH_DELAY_MS,
  applyMove,
  canFlip,
  createLocalRound,
  createMemoryState,
  findRemoteTheme,
  hasMismatch,
  hideMismatch,
  isFaceUp,
  resolveLocalMove,
} from '../../games/memory/engine'
import { themes as defaultThemes } from '../../games/memory/themes'
import { useGameRound } from '../../hooks/useGameRound'
import { MemoryCard } from './MemoryCard'

const CONNECTION_LOST = 'A conexão com o servidor caiu. Uma nova partida começou sem salvar.'

export function MemoryGame({ themes = defaultThemes, random = Math.random, mismatchDelayMs = MISMATCH_DELAY_MS }) {
  const { user } = useAuth()
  const session = useGameRound()
  const [theme, setTheme] = useState(themes[0])
  const [state, setState] = useState(null)
  const [seconds, setSeconds] = useState(0)
  const [notice, setNotice] = useState('')
  // Layout embaralhado no navegador; null quando a partida está no servidor.
  const layout = useRef(null)
  const remoteThemes = useRef(null)
  const busy = useRef(false)

  useEffect(() => {
    begin(themes[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const running = Boolean(state) && !state.finished
  useEffect(() => {
    if (!running) return undefined
    const timer = setInterval(() => setSeconds((current) => current + 1), 1000)
    return () => clearInterval(timer)
  }, [running])

  useEffect(() => {
    if (!hasMismatch(state)) return undefined
    const timer = setTimeout(() => setState((current) => hideMismatch(current)), mismatchDelayMs)
    return () => clearTimeout(timer)
  }, [state, mismatchDelayMs])

  async function openRemote(nextTheme) {
    if (!remoteThemes.current) remoteThemes.current = await memoryApi.themes()
    const remote = findRemoteTheme(remoteThemes.current, nextTheme)
    return remote ? memoryApi.start({ themeId: remote.id }) : null
  }

  async function begin(nextTheme, { localOnly = false, message = '' } = {}) {
    busy.current = false
    setTheme(nextTheme)
    setNotice(message)
    setSeconds(0)
    const outcome = await session.start(localOnly ? async () => null : () => openRemote(nextTheme))
    if (outcome.status === 'stale') return
    if (outcome.status === 'online') {
      layout.current = null
      setState(createMemoryState(outcome.round))
    } else {
      const local = createLocalRound(nextTheme, random)
      layout.current = local.layout
      setState(local.state)
    }
    setSeconds(0)
  }

  async function flip(position) {
    if (busy.current || !canFlip(state, position)) return
    if (layout.current) {
      const deck = layout.current
      setState((current) => (canFlip(current, position) ? applyMove(current, resolveLocalMove(deck, current, position)) : current))
      return
    }
    busy.current = true
    const outcome = await session.play((id) => memoryApi.move(id, { position }))
    busy.current = false
    if (outcome.status === 'online') {
      setState((current) => applyMove(current, outcome.result))
    } else if (outcome.status === 'lost') {
      begin(theme, { localOnly: true, message: CONNECTION_LOST })
    }
  }

  const player = playerName(user)

  return (
    <section className="memoria">
      <h1 className="memoria-titulo">Jogo da Memória</h1>

      <div className="opcoes" role="group" aria-label="Temas">
        {themes.map((item) => (
          <button
            key={item.key}
            type="button"
            className={item.key === theme.key ? 'ativo' : undefined}
            aria-pressed={item.key === theme.key}
            onClick={() => begin(item)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="memoria-main">
        <div className="memoria-painel">
          <span className="player">{player}</span>
          <span>
            Tempo: <span className="timer">{String(seconds).padStart(2, '0')}</span>
          </span>
        </div>

        <div className="grid" role="grid" aria-label="Cartas do jogo da memória">
          {state?.cards.map((card) => (
            <MemoryCard
              key={card.position}
              card={card}
              faceUp={isFaceUp(state, card.position)}
              backImagePath={state.backImagePath}
              disabled={card.matched || state.finished}
              onFlip={flip}
            />
          ))}
        </div>

        {state?.finished ? (
          <div className="memoria-fim">
            <p className="banner win" role="status">
              Parabéns, {player}! Seu tempo foi de {seconds} segundos e você teve {state.errors} erros!
            </p>
            {session.serverScore !== null ? <p className="status-line">Pontuação: {session.serverScore}</p> : null}
            <button className="btn-jogar" type="button" onClick={() => begin(theme)}>
              <h1>Jogar de novo</h1>
            </button>
          </div>
        ) : null}

        {notice ? (
          <p className="banner loss" role="status">
            {notice}
          </p>
        ) : null}
      </div>
    </section>
  )
}

function playerName(user) {
  const name = user?.displayName?.trim()
  return name ? name.split(/\s+/)[0] : 'Visitante'
}
