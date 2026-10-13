import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuizGame } from './QuizGame'

jest.mock('../../api/sessionsApi', () => ({
  sessionsApi: {
    open: jest.fn(() => Promise.resolve({ id: 'quiz-1' })),
    finish: jest.fn(() => Promise.resolve({ score: 50 })),
    abandon: jest.fn(),
    quizAnswer: jest.fn(() => Promise.resolve({})),
  },
}))

const questions = [
  {
    question: 'Primeira?',
    answers: [
      { text: 'Certa', correct: true },
      { text: 'Errada', correct: false },
    ],
  },
  {
    question: 'Segunda?',
    answers: [
      { text: 'Errada', correct: false },
      { text: 'Certa', correct: true },
    ],
  },
]

describe('QuizGame', () => {
  test('mostra o acerto e o resultado final', async () => {
    const user = userEvent.setup()
    render(<QuizGame questions={questions} />)

    await user.click(screen.getByRole('button', { name: 'Começar Quiz!' }))
    await user.click(screen.getByRole('button', { name: 'Certa' }))
    expect(screen.getByRole('button', { name: 'Certa' })).toHaveClass('correct')
    expect(screen.getByRole('button', { name: 'Errada' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Próxima pergunta' }))
    await user.click(screen.getByRole('button', { name: 'Errada' }))
    await user.click(screen.getByRole('button', { name: 'Próxima pergunta' }))

    expect(screen.getByText(/Você acertou 1 de 2 questões!/)).toBeInTheDocument()
    expect(screen.getByText(/Resultado: Bom/)).toBeInTheDocument()
  })
})
