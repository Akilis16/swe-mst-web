import { BackNav } from '../components/layout/BackNav'
import { PageShell } from '../components/layout/PageShell'
import { MemoryGame } from '../components/memory/MemoryGame'

export function MemoryPage() {
  return (
    <PageShell>
      <BackNav backTo="/jogos" />
      <MemoryGame />
    </PageShell>
  )
}
