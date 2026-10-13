import { useEffect, useState } from 'react'
import { sessionsApi } from '../../api/sessionsApi'
import {
  advanceQuiz,
  createQuizState,
  performanceMessage,
  performancePercent,
  selectAnswer,
  startQuiz,
} from '../../games/quiz/engine'
import { questions as defaultQuestions } from '../../games/quiz/questions'
import { usePlaySession } from '../../hooks/usePlaySession'

export function QuizGame({ questions = defaultQuestions }) {
  const [state, setState] = useState(() => createQuizState(questions))
  const session = usePlaySession('quiz')

  useEffect(() => {
    setState(createQuizState(questions))
  }, [questions])

  function begin() {
    setState((current) => startQuiz(current))
    session.open({})
  }

  function choose(answerIndex) {
    if (state.selected !== null) return
    session.send((id) =>
      sessionsApi.quizAnswer(id, { questionIndex: state.index, choiceIndex: answerIndex }),
    )
    setState(selectAnswer(state, answerIndex))
  }

  function next() {
    const upcoming = advanceQuiz(state)
    if (upcoming.phase === 'finished') session.finish()
    setState(upcoming)
  }

  function retry() {
    setState(startQuiz(createQuizState(questions)))
    session.open({})
  }

  if (state.phase === 'ready') {
    return (
      <div className="container">
        <div className="controls-container">
          <button className="start-quiz button" type="button" onClick={begin}>
            Começar Quiz!
          </button>
        </div>
      </div>
    )
  }

  if (state.phase === 'finished') {
    const total = state.questions.length
    const percent = state.percent ?? performancePercent(state.correct, total)
    const message = state.message ?? performanceMessage(percent)
    return (
      <div className="container">
        <div className="questions-container">
          <p className="final-message">
            Você acertou {state.correct} de {total} questões!
            <span>Resultado: {message}</span>
          </p>
          {session.serverScore !== null ? <p className="status-line">Pontuação: {session.serverScore}</p> : null}
          <button className="button" type="button" onClick={retry}>
            Refazer teste
          </button>
        </div>
      </div>
    )
  }

  const question = state.questions[state.index]

  return (
    <div className="container">
      <div className="questions-container">
        <span className="question">{question.question}</span>
        <div className="answers-container">
          {question.answers.map((answer, answerIndex) => {
            const revealed = state.selected !== null
            let className = 'answer button'
            if (revealed) {
              className += answer.correct ? ' correct' : ' incorrect'
            }
            return (
              <button
                key={answer.text}
                type="button"
                className={className}
                disabled={revealed}
                onClick={() => choose(answerIndex)}
              >
                {answer.text}
              </button>
            )
          })}
        </div>
      </div>
      <div className="controls-container">
        {state.selected !== null ? (
          <button className="next-question button" type="button" onClick={next}>
            Próxima pergunta
          </button>
        ) : null}
      </div>
    </div>
  )
}
