import { BackNav } from '../components/layout/BackNav'
import { PageShell } from '../components/layout/PageShell'
import { Game2048 } from '../components/game2048/Game2048'

export function Game2048Page() {
  return (
    <PageShell>
      <BackNav backTo="/jogos" />
      <Game2048 />
    </PageShell>
  )
}
