/**
 * Guarda o JWT devolvido por /auth/login e /auth/register.
 * O login é opcional: sem token os jogos seguem funcionando em modo local.
 */
const STORAGE_KEY = 'mst.auth'

const listeners = new Set()

function storage() {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    return null
  }
}

function notify(session) {
  listeners.forEach((listener) => listener(session))
}

function isValid(session) {
  return (
    session &&
    typeof session.accessToken === 'string' &&
    session.accessToken.length > 0 &&
    typeof session.expiresAt === 'number' &&
    session.expiresAt > Date.now()
  )
}

export const tokenStorage = {
  /** Sessão salva ou null se não houver ou já tiver expirado. */
  read() {
    const store = storage()
    if (!store) return null
    try {
      const session = JSON.parse(store.getItem(STORAGE_KEY))
      if (isValid(session)) return session
      if (session) store.removeItem(STORAGE_KEY)
    } catch {
      /* conteúdo corrompido: trata como deslogado */
    }
    return null
  },

  /** Converte o TokenResponse da API e persiste. */
  save(tokenResponse) {
    const session = {
      accessToken: tokenResponse.accessToken,
      tokenType: tokenResponse.tokenType || 'Bearer',
      expiresAt: Date.now() + Number(tokenResponse.expiresIn || 0) * 1000,
      user: tokenResponse.user ?? null,
    }
    try {
      storage()?.setItem(STORAGE_KEY, JSON.stringify(session))
    } catch {
      /* sem storage: a sessão vale só enquanto a aba estiver aberta */
    }
    notify(session)
    return session
  },

  updateUser(user) {
    const current = this.read()
    if (!current || !user) return current
    const session = { ...current, user }
    try {
      storage()?.setItem(STORAGE_KEY, JSON.stringify(session))
    } catch {
      /* ignora */
    }
    notify(session)
    return session
  },

  clear() {
    try {
      storage()?.removeItem(STORAGE_KEY)
    } catch {
      /* ignora */
    }
    notify(null)
  },

  /** Valor pronto para o header Authorization, ou null. */
  authorization() {
    const session = this.read()
    return session ? `${session.tokenType || 'Bearer'} ${session.accessToken}` : null
  },

  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}
