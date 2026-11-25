import { ApiCode } from '../api/routes'

const OFFLINE_MESSAGE = 'Não foi possível contactar o servidor. Você ainda pode jogar sem entrar.'

const FIELD_MESSAGES = {
  displayName: 'Informe um nome de até 100 caracteres.',
  email: 'Informe um e-mail válido.',
  password: 'A senha precisa ter entre 8 e 72 caracteres.',
}

/**
 * Traduz o Problem Details da API em mensagens para o formulário.
 * @returns {{ message: string, fields: Record<string, string> }}
 */
export function describeAuthError(error) {
  const fields = {}

  switch (error?.code) {
    case ApiCode.INVALID_CREDENTIALS:
      return { message: 'E-mail ou senha incorretos.', fields }
    case ApiCode.EMAIL_ALREADY_USED:
      return { message: '', fields: { email: 'Este e-mail já está cadastrado.' } }
    case ApiCode.NETWORK_ERROR:
      return { message: OFFLINE_MESSAGE, fields }
    case ApiCode.VALIDATION_FAILED:
      for (const item of error.errors ?? []) {
        if (item?.field) fields[item.field] = FIELD_MESSAGES[item.field] || item.message
      }
      return { message: Object.keys(fields).length ? '' : 'Confira os dados informados.', fields }
    default:
      // Proxy do Vite / gateway sem a API no ar responde 5xx sem Problem Details.
      if (!error?.status || error.status >= 500) {
        return { message: OFFLINE_MESSAGE, fields }
      }
      return { message: error?.message || 'Algo deu errado. Tente novamente.', fields }
  }
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateLogin({ email, password }) {
  const fields = {}
  if (!EMAIL_PATTERN.test(email.trim())) fields.email = FIELD_MESSAGES.email
  if (!password) fields.password = 'Informe sua senha.'
  return fields
}

export function validateRegister({ displayName, email, password, confirmPassword }) {
  const fields = {}
  const name = displayName.trim()
  if (!name || name.length > 100) fields.displayName = FIELD_MESSAGES.displayName
  if (!EMAIL_PATTERN.test(email.trim())) fields.email = FIELD_MESSAGES.email
  if (password.length < 8 || password.length > 72) fields.password = FIELD_MESSAGES.password
  if (confirmPassword !== password) fields.confirmPassword = 'As senhas não conferem.'
  return fields
}
