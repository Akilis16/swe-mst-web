import { Link } from 'react-router-dom'

export function AppHeader() {
  return (
    <header className="cabecalho">
      <div className="logo-container">
        <Link to="/">
          <img src="/logo.png" alt="Logo" />
          <h1>MST</h1>
        </Link>
      </div>
      <hr />
    </header>
  )
}
