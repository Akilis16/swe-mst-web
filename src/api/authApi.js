import { request } from './http'
import { routes } from './routes'

/** Contrato do módulo Autenticação da MST API (TokenResponse). */
export const authApi = {
  login({ email, password }) {
    return request(routes.authLogin, {
      method: 'POST',
      body: { email, password },
      auth: false,
    })
  },
  register({ displayName, email, password }) {
    return request(routes.authRegister, {
      method: 'POST',
      body: { displayName, email, password },
      auth: false,
    })
  },
  me() {
    return request(routes.me)
  },
}
