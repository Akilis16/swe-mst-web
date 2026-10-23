import { useParams } from 'react-router-dom'
import { BackNav } from '../components/layout/BackNav'
import { PageShell } from '../components/layout/PageShell'
import { TicTacToeGame } from '../components/tictactoe/TicTacToeGame'

export function TicTacToePage() {
  const { mode } = useParams()
  const safeMode = mode === 'cpu' ? 'cpu' : 'local'

  return (
    <PageShell>
      <BackNav backTo="/jogos/velha" />
      <TicTacToeGame mode={safeMode} />
    </PageShell>
  )
}
