import { useEffect, useRef, useState } from 'react'
import { game2048Api } from '../../api/game2048Api'
import {
  KEY_DIRECTIONS,
  applyMove,
  createBoard,
  createGameState,
  createLocalGame,
  playLocal,
} from '../../games/game2048/engine'
import { useGameRound } from '../../hooks/useGameRound'
import { Board2048 } from './Board2048'

const CONNECTION_LOST = 'A conexão com o servidor caiu. Uma nova partida começou sem salvar.'
const SWIPE_MIN_PX = 30

export function Game2048({ random = Math.random }) {
  const session = useGameRound()
  const [state, setState] = useState(null)
  const [notice, setNotice] = useState('')
  // true quando a partida roda só no navegador.
  const local = useRef(true)
  const busy = useRef(false)
  const touch = useRef(null)
  const moveRef = useRef(null)

  useEffect(() => {
    begin()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    function onKey(event) {
      const direction = KEY_DIRECTIONS[event.key]
      if (!direction) return
      event.preventDefault()
      moveRef.current?.(direction)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function begin({ localOnly = false, message = '' } = {}) {
    busy.current = false
    setNotice(message)
    const outcome = await session.start(localOnly ? async () => null : () => game2048Api.start())
    if (outcome.status === 'stale') return
    if (outcome.status === 'online') {
      local.current = false
      setState(createGameState(outcome.round))
    } else {
      local.current = true
      setState(createLocalGame(random))
    }
  }

  async function move(direction) {
    if (busy.current || !state || state.finished) return
    if (local.current) {
      setState((current) => {
        const next = current ? playLocal(current, direction, random) : null
        return next?.moved ? applyMove(current, next) : current
      })
      return
    }
    busy.current = true
    const outcome = await session.play((id) => game2048Api.move(id, { direction }))
    busy.current = false
    if (outcome.status === 'online') {
      if (outcome.result?.moved) setState((current) => applyMove(current, outcome.result))
    } else if (outcome.status === 'lost') {
      begin({ localOnly: true, message: CONNECTION_LOST })
    }
  }
  moveRef.current = move

  function onTouchStart(event) {
    const point = event.changedTouches?.[0]
    touch.current = point ? { x: point.clientX, y: point.clientY } : null
  }

  function onTouchEnd(event) {
    const start = touch.current
    const point = event.changedTouches?.[0]
    touch.current = null
    if (!start || !point) return
    const dx = point.clientX - start.x
    const dy = point.clientY - start.y
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN_PX) return
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'RIGHT' : 'LEFT')
    else move(dy > 0 ? 'DOWN' : 'UP')
  }

  return (
    <section className="jogo-2048">
      <div className="menu">
        <h1>2048</h1>
        <h2>
          Pontuação: <span id="score">{state?.points ?? 0}</span>
        </h2>
        <button type="button" className="btn-atualizar" aria-label="Novo jogo" onClick={() => begin()}>
          <img src="/icons/atualizar.svg" alt="" />
        </button>
      </div>

      <Board2048 board={state?.board ?? createBoard()} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} />

      <p className="instrucao-2048">Use as setas do teclado (ou deslize no celular) para juntar as peças.</p>

      {state?.finished ? (
        <p className={`banner ${state.result === 'WIN' ? 'win' : 'loss'}`} role="status">
          {state.result === 'WIN' ? 'Parabéns, você chegou a 2048!' : 'Fim de jogo! Não há mais jogadas.'}
        </p>
      ) : null}

      {session.serverScore !== null ? (
        <p className="status-line">Pontuação salva na sua conta: {session.serverScore}</p>
      ) : null}

      {notice ? (
        <p className="banner loss" role="status">
          {notice}
        </p>
      ) : null}
    </section>
  )
}
