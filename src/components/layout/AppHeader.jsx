import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

function primeiroNome(user) {
  const nome = user?.displayName?.trim()
  return nome ? nome.split(/\s+/)[0] : 'jogador'
}

function ContaAcesso() {
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()

  if (location.pathname === '/entrar' || location.pathname === '/cadastro') return null

  if (isAuthenticated) {
    return (
      <div className="conta-acesso">
        <span className="conta-nome" title={user?.email || undefined}>
          <img src="/icons/person-fill.svg" alt="" />
          Olá, {primeiroNome(user)}
        </span>
        <button type="button" className="conta-mini" onClick={logout}>
          Sair
        </button>
      </div>
    )
  }

  return (
    <div className="conta-acesso">
      <Link className="conta-mini" to="/entrar" state={{ from: location.pathname }}>
        <img src="/icons/person.svg" alt="" />
        Entrar
      </Link>
    </div>
  )
}

export function AppHeader() {
  return (
    <header className="cabecalho">
      <div className="logo-container">
        <Link to="/">
          <img src="/logo.png" alt="Logo" />
          <h1>MST</h1>
        </Link>
      </div>
      <ContaAcesso />
      <hr />
    </header>
  )
}
