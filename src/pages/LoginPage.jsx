import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { describeAuthError, validateLogin } from '../auth/authErrors'
import { AuthField } from '../components/auth/AuthField'
import { BackNav } from '../components/layout/BackNav'
import { PageShell } from '../components/layout/PageShell'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destino = location.state?.from || '/jogos'

  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  if (isAuthenticated && !sending) {
    return <Navigate to={destino} replace />
  }

  const change = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => ({ ...current, [name]: undefined }))
  }

  const submit = async (event) => {
    event.preventDefault()
    const errors = validateLogin(form)
    setFieldErrors(errors)
    setMessage('')
    if (Object.keys(errors).length) return

    setSending(true)
    try {
      await login({ email: form.email.trim(), password: form.password })
      navigate(destino, { replace: true })
    } catch (error) {
      const described = describeAuthError(error)
      setFieldErrors(described.fields)
      setMessage(described.message)
      setSending(false)
    }
  }

  return (
    <PageShell>
      <BackNav backTo="/" showHome={false} />
      <section className="conta">
        <form className="conta-card" onSubmit={submit} noValidate aria-labelledby="titulo-entrar">
          <h1 id="titulo-entrar">Entrar</h1>
          <hr />
          <p className="conta-sub">O login é opcional: entre para salvar suas partidas e pontuações.</p>

          <AuthField
            id="login-email"
            label="E-mail"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={change}
            error={fieldErrors.email}
          />
          <AuthField
            id="login-senha"
            label="Senha"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={change}
            error={fieldErrors.password}
          />

          {message ? (
            <p className="banner loss conta-aviso" role="alert">
              {message}
            </p>
          ) : null}

          <button className="btn-conta" type="submit" disabled={sending}>
            <img src="/icons/person-fill.svg" alt="" />
            <span>{sending ? 'Entrando...' : 'Entrar'}</span>
          </button>

          <p className="conta-alternativa">
            Não tem conta? <Link to="/cadastro" state={location.state}>Cadastre-se</Link>
          </p>
          <Link className="conta-pular" to="/jogos">
            Jogar sem entrar
          </Link>
        </form>
      </section>
    </PageShell>
  )
}
