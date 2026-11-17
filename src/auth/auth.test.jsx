import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { App } from '../App'
import { request } from '../api/http'
import { routes } from '../api/routes'
import { tokenStorage } from './tokenStorage'

const TOKEN_RESPONSE = {
  accessToken: 'jwt-abc',
  tokenType: 'Bearer',
  expiresIn: 3600,
  user: { id: 'u1', displayName: 'Maria Souza', email: 'maria@mst.com', roles: ['PLAYER'] },
}

function json(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body }
}

function renderApp(route) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
  global.fetch = jest.fn()
})

describe('armazenamento do token', () => {
  test('salva o TokenResponse e monta o header Authorization', () => {
    tokenStorage.save(TOKEN_RESPONSE)
    expect(tokenStorage.read().user.displayName).toBe('Maria Souza')
    expect(tokenStorage.authorization()).toBe('Bearer jwt-abc')
  })

  test('descarta token expirado', () => {
    tokenStorage.save({ ...TOKEN_RESPONSE, expiresIn: -1 })
    expect(tokenStorage.read()).toBeNull()
    expect(tokenStorage.authorization()).toBeNull()
  })
})

describe('cliente HTTP com token', () => {
  test('envia o Bearer quando há sessão', async () => {
    tokenStorage.save(TOKEN_RESPONSE)
    fetch.mockResolvedValue(json(200, []))
    await request(routes.games)
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer jwt-abc')
  })

  test('não envia header sem sessão nem em chamadas com auth: false', async () => {
    fetch.mockResolvedValue(json(200, {}))
    await request(routes.games)
    tokenStorage.save(TOKEN_RESPONSE)
    await request(routes.authLogin, { method: 'POST', body: {}, auth: false })
    expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined()
    expect(fetch.mock.calls[1][1].headers.Authorization).toBeUndefined()
  })

  test('401 com token limpa a sessão', async () => {
    tokenStorage.save(TOKEN_RESPONSE)
    fetch.mockResolvedValue(json(401, { status: 401, code: 'UNAUTHENTICATED' }))
    await expect(request(routes.me)).rejects.toMatchObject({ code: 'UNAUTHENTICATED' })
    expect(tokenStorage.read()).toBeNull()
  })
})

describe('telas de Entrar e Cadastro', () => {
  test('o cabeçalho oferece "Entrar" para visitante', () => {
    renderApp('/')
    expect(screen.getByRole('link', { name: /entrar/i })).toHaveAttribute('href', '/entrar')
  })

  test('login válido salva o token e mostra o jogador no cabeçalho', async () => {
    fetch.mockImplementation(async (url) =>
      url === routes.authLogin ? json(200, TOKEN_RESPONSE) : json(200, TOKEN_RESPONSE.user),
    )
    renderApp('/entrar')

    await userEvent.type(screen.getByLabelText('E-mail'), 'maria@mst.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'segredo123')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText(/Olá, Maria/)).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith(
      routes.authLogin,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'maria@mst.com', password: 'segredo123' }),
      }),
    )
    expect(tokenStorage.authorization()).toBe('Bearer jwt-abc')
    expect(screen.getByRole('link', { name: /jogo da velha/i })).toBeInTheDocument()
  })

  test('credenciais inválidas exibem o aviso', async () => {
    fetch.mockResolvedValue(json(401, { status: 401, code: 'INVALID_CREDENTIALS' }))
    renderApp('/entrar')

    await userEvent.type(screen.getByLabelText('E-mail'), 'maria@mst.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'errada')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha incorretos.')
    expect(tokenStorage.read()).toBeNull()
  })

  test('cadastro valida no cliente antes de chamar a API', async () => {
    renderApp('/cadastro')
    await userEvent.type(screen.getByLabelText('Nome'), 'Maria')
    await userEvent.type(screen.getByLabelText('E-mail'), 'maria@mst.com')
    await userEvent.type(screen.getByLabelText(/^Senha/), 'curta')
    await userEvent.type(screen.getByLabelText('Confirmar senha'), 'outra')
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(screen.getByText(/entre 8 e 72 caracteres/)).toBeInTheDocument()
    expect(screen.getByText('As senhas não conferem.')).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  test('cadastro com e-mail repetido marca o campo', async () => {
    fetch.mockResolvedValue(json(409, { status: 409, code: 'EMAIL_ALREADY_USED' }))
    renderApp('/cadastro')
    await userEvent.type(screen.getByLabelText('Nome'), 'Maria')
    await userEvent.type(screen.getByLabelText('E-mail'), 'maria@mst.com')
    await userEvent.type(screen.getByLabelText(/^Senha/), 'segredo123')
    await userEvent.type(screen.getByLabelText('Confirmar senha'), 'segredo123')
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(await screen.findByText('Este e-mail já está cadastrado.')).toBeInTheDocument()
    expect(fetch.mock.calls[0][0]).toBe(routes.authRegister)
  })

  test('sair volta ao modo visitante', async () => {
    tokenStorage.save(TOKEN_RESPONSE)
    fetch.mockResolvedValue(json(200, TOKEN_RESPONSE.user))
    renderApp('/')
    await userEvent.click(screen.getByRole('button', { name: 'Sair' }))
    await waitFor(() => expect(screen.getByRole('link', { name: /entrar/i })).toBeInTheDocument())
    expect(tokenStorage.read()).toBeNull()
  })
})
