import { useCallback, useEffect, useRef, useState } from 'react'
import { sessionsApi } from '../api/sessionsApi'
import { useAuth } from '../auth/AuthContext'

/**
 * Partida dos jogos com regras no servidor (memória, forca e 2048).
 *
 * Sem login a partida roda só no navegador e a API não é chamada.
 * Logado, a partida abre no servidor e cada jogada é decidida por ele; se a API
 * cair no meio, o jogo avisa e segue em modo local.
 *
 * Cada chamada devolve { status, ... }:
 *   online   → a API respondeu (round / result)
 *   offline  → sem login ou sem API: o componente usa o motor local
 *   rejected → a API recusou a jogada por regra (409/422): ignore a jogada
 *   lost     → a conexão caiu no meio da partida: recomece em modo local
 *   stale    → resposta de uma partida que já foi trocada: ignore
 */
export function useGameRound() {
  const { isAuthenticated } = useAuth()
  const round = useRef(null)
  const generation = useRef(0)
  const [connection, setConnection] = useState('offline')
  const [serverScore, setServerScore] = useState(null)

  const discard = useCallback(() => {
    const current = round.current
    round.current = null
    if (current?.playSessionId) sessionsApi.abandon(current.playSessionId).catch(() => { })
  }, [])

  useEffect(
    () => () => {
      generation.current += 1
      discard()
    },
    [discard],
  )

  const start = useCallback(
    async (opener) => {
      const ticket = ++generation.current
      discard()
      setServerScore(null)
      if (!isAuthenticated) {
        setConnection('offline')
        return { status: 'offline' }
      }
      try {
        const remote = await opener()
        if (ticket !== generation.current) {
          if (remote?.playSessionId) sessionsApi.abandon(remote.playSessionId).catch(() => { })
          return { status: 'stale' }
        }
        if (!remote?.roundId) {
          setConnection('offline')
          return { status: 'offline' }
        }
        round.current = { roundId: remote.roundId, playSessionId: remote.playSessionId }
        setConnection('online')
        return { status: 'online', round: remote }
      } catch {
        if (ticket !== generation.current) return { status: 'stale' }
        setConnection('offline')
        return { status: 'offline' }
      }
    },
    [isAuthenticated, discard],
  )

  const play = useCallback(async (action) => {
    const current = round.current
    if (!current) return { status: 'offline' }
    const ticket = generation.current
    try {
      const result = await action(current.roundId)
      if (ticket !== generation.current) return { status: 'stale' }
      if (result?.finished) {
        round.current = null
        if (typeof result.score?.value === 'number') setServerScore(result.score.value)
      }
      return { status: 'online', result }
    } catch (error) {
      if (ticket !== generation.current) return { status: 'stale' }
      if (isRuleRejection(error)) return { status: 'rejected', error }
      round.current = null
      setConnection('offline')
      return { status: 'lost', error }
    }
  }, [])

  return { connection, serverScore, start, play }
}

function isRuleRejection(error) {
  return error?.status === 409 || error?.status === 422
}
