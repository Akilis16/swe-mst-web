import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { describeAuthError, validateRegister } from '../auth/authErrors'
import { AuthField } from '../components/auth/AuthField'
import { BackNav } from '../components/layout/BackNav'
import { PageShell } from '../components/layout/PageShell'

const EMPTY = { displayName: '', email: '', password: '', confirmPassword: '' }

export function RegisterPage() {
  const { isAuthenticated, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destino = location.state?.from || '/jogos'

  const [form, setForm] = useState(EMPTY)
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
    const errors = validateRegister(form)
    setFieldErrors(errors)
    setMessage('')
    if (Object.keys(errors).length) return

    setSending(true)
    try {
      await register({
        displayName: form.displayName.trim(),
        email: form.email.trim(),
        password: form.password,
      })
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
      <BackNav backTo="/entrar" />
      <section className="conta">
        <form className="conta-card" onSubmit={submit} noValidate aria-labelledby="titulo-cadastro">
          <h1 id="titulo-cadastro">Cadastro</h1>
          <hr />

          <AuthField
            id="cadastro-nome"
            label="Nome"
            name="displayName"
            autoComplete="name"
            maxLength={100}
            value={form.displayName}
            onChange={change}
            error={fieldErrors.displayName}
          />
          <AuthField
            id="cadastro-email"
            label="E-mail"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={255}
            value={form.email}
            onChange={change}
            error={fieldErrors.email}
          />
          <AuthField
            id="cadastro-senha"
            label="Senha (mínimo 8 caracteres)"
            name="password"
            type="password"
            autoComplete="new-password"
            maxLength={72}
            value={form.password}
            onChange={change}
            error={fieldErrors.password}
          />
          <AuthField
            id="cadastro-confirmar"
            label="Confirmar senha"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            maxLength={72}
            value={form.confirmPassword}
            onChange={change}
            error={fieldErrors.confirmPassword}
          />

          {message ? (
            <p className="banner loss conta-aviso" role="alert">
              {message}
            </p>
          ) : null}

          <button className="btn-conta" type="submit" disabled={sending}>
            <img src="/icons/person-fill.svg" alt="" />
            <span>{sending ? 'Criando...' : 'Criar conta'}</span>
          </button>

          <p className="conta-alternativa">
            Já tem conta? <Link to="/entrar" state={location.state}>Entrar</Link>
          </p>
          <Link className="conta-pular" to="/jogos">
            Jogar sem entrar
          </Link>
        </form>
      </section>
    </PageShell>
  )
}
