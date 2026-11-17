import { tokenStorage } from '../auth/tokenStorage'
import { ApiCode } from './routes'

export class ApiError extends Error {
  constructor(problem) {
    super(problem.detail || problem.title || 'Erro na API MST')
    this.name = 'ApiError'
    this.status = problem.status ?? 0
    this.code = problem.code || null
    this.title = problem.title || 'Erro'
    this.errors = Array.isArray(problem.errors) ? problem.errors : []
  }
}

export function normalizeProblem(payload, status) {
  const body = payload && typeof payload === 'object' ? payload : {}
  return {
    title: body.title || 'Erro',
    status: body.status || status,
    detail: body.detail || body.message || '',
    code: body.code || null,
    errors: Array.isArray(body.errors) ? body.errors : [],
  }
}

export function apiBase() {
  if (typeof window !== 'undefined' && typeof window.__MST_API_BASE__ === 'string') {
    return window.__MST_API_BASE__.replace(/\/$/, '')
  }
  return ''
}

/**
 * @param {string} path
 * @param {{ method?: string, body?: unknown, headers?: Record<string, string>, auth?: boolean }} [options]
 *   auth: false não envia o token (usado no login e no cadastro).
 */
export async function request(path, options = {}) {
  const { method = 'GET', body, headers: customHeaders, auth = true } = options
  const headers = {
    Accept: 'application/problem+json, application/json',
    ...customHeaders,
  }

  const authorization = auth ? tokenStorage.authorization() : null
  if (authorization && !headers.Authorization) {
    headers.Authorization = authorization
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  let response
  try {
    response = await fetch(`${apiBase()}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError({
      title: 'Falha de rede',
      status: 0,
      code: ApiCode.NETWORK_ERROR,
      detail: 'Não foi possível contactar a API MST.',
    })
  }

  if (response.status === 204) return null

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    // Token expirado ou revogado: volta ao modo visitante.
    if (response.status === 401 && authorization) {
      tokenStorage.clear()
    }
    throw new ApiError(normalizeProblem(payload, response.status))
  }
  return payload
}
