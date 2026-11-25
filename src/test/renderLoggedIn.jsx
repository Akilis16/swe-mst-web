import { render } from '@testing-library/react'
import { AuthProvider } from '../auth/AuthContext'
import { tokenStorage } from '../auth/tokenStorage'

export const PLAYER = { id: 'u1', displayName: 'Maria Souza', email: 'maria@mst.com', roles: ['PLAYER'] }

/** Renderiza com um jogador logado; GET /me responde com PLAYER. */
export function renderLoggedIn(ui) {
  global.fetch = jest.fn(async () => ({ ok: true, status: 200, json: async () => PLAYER }))
  tokenStorage.save({ accessToken: 'jwt-teste', tokenType: 'Bearer', expiresIn: 3600, user: PLAYER })
  return render(<AuthProvider>{ui}</AuthProvider>)
}
