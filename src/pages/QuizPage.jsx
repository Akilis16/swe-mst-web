import { BackNav } from '../components/layout/BackNav'
import { PageShell } from '../components/layout/PageShell'
import { QuizGame } from '../components/quiz/QuizGame'

export function QuizPage() {
  return (
    <PageShell>
      <BackNav backTo="/jogos" />
      <h1 className="page-title">Quiz</h1>
      <QuizGame />
    </PageShell>
  )
}
