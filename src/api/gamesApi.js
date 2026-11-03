import { request } from './http'
import { routes } from './routes'

export async function listGames() {
  return request(routes.games)
}

