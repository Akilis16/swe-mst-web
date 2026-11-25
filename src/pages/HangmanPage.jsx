import { BackNav } from '../components/layout/BackNav'
import { PageShell } from '../components/layout/PageShell'
import { HangmanGame } from '../components/hangman/HangmanGame'

export function HangmanPage() {
  return (
    <PageShell>
      <BackNav backTo="/jogos" />
      <HangmanGame />
    </PageShell>
  )
}
