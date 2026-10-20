import { useCallback, useRef, useState } from 'react'
import { sessionsApi } from '../api/sessionsApi'

export function usePlaySession(game) {
  const sessionId = useRef(null)
  const generation = useRef(0)
  const [connection, setConnection] = useState('idle')
  const [serverScore, setServerScore] = useState(null)

  const open = useCallback(
    async (extra = {}) => {
      const ticket = ++generation.current
      setServerScore(null)
      try {
        const session = await sessionsApi.open({ game, ...extra })
        if (ticket !== generation.current) {
          if (session?.id) sessionsApi.abandon(session.id).catch(() => { })
          return null
        }
        sessionId.current = session?.id ?? null
        setConnection(sessionId.current ? 'online' : 'offline')
        return session
      } catch {
        if (ticket === generation.current) {
          sessionId.current = null
          setConnection('offline')
        }
        return null
      }
    },
    [game],
  )

  const send = useCallback(async (action) => {
    if (!sessionId.current) return null
    try {
      return await action(sessionId.current)
    } catch {
      return null
    }
  }, [])

  const finish = useCallback(async () => {
    generation.current += 1
    if (!sessionId.current) return null
    const id = sessionId.current
    sessionId.current = null
    try {
      const result = await sessionsApi.finish(id)
      if (result && typeof result.score === 'number') {
        setServerScore(result.score)
      }
      return result
    } catch {
      return null
    }
  }, [])

  const abandon = useCallback(async () => {
    generation.current += 1
    if (!sessionId.current) return null
    const id = sessionId.current
    sessionId.current = null
    try {
      return await sessionsApi.abandon(id)
    } catch {
      return null
    }
  }, [])

  return { connection, serverScore, open, send, finish, abandon }
}
