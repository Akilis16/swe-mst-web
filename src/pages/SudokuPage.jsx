import { BackNav } from '../components/layout/BackNav'
import { PageShell } from '../components/layout/PageShell'
import { SudokuGame } from '../components/sudoku/SudokuGame'

export function SudokuPage() {
  return (
    <PageShell>
      <BackNav backTo="/jogos" />
      <SudokuGame />
    </PageShell>
  )
}
