import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api/authApi'
import { tokenStorage } from './tokenStorage'

const AuthContext = createContext(null)

const ANONYMOUS = {
  user: null,
  isAuthenticated: false,
  login: async () => null,
  register: async () => null,
  logout: () => {},
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => tokenStorage.read())

  useEffect(() => tokenStorage.subscribe(setSession), [])

  const accessToken = session?.accessToken ?? null
  const expiresAt = session?.expiresAt ?? null

  // Confere o token salvo com a API e atualiza os dados do jogador.
  // Se a API estiver fora do ar, mantém o que está salvo.
  useEffect(() => {
    if (!accessToken) return
    let active = true
    authApi
      .me()
      .then((user) => {
        if (active && user) tokenStorage.updateUser(user)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [accessToken])

  // Desloga sozinho quando o JWT expira.
  useEffect(() => {
    if (!expiresAt) return
    const timer = setTimeout(() => tokenStorage.clear(), Math.max(0, expiresAt - Date.now()))
    return () => clearTimeout(timer)
  }, [expiresAt])

  const login = useCallback(async (credentials) => {
    const response = await authApi.login(credentials)
    return tokenStorage.save(response).user
  }, [])

  const register = useCallback(async (data) => {
    const response = await authApi.register(data)
    return tokenStorage.save(response).user
  }, [])

  const logout = useCallback(() => tokenStorage.clear(), [])

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      login,
      register,
      logout,
    }),
    [session, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext) ?? ANONYMOUS
}
