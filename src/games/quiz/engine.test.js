import {
  advanceQuiz,
  createQuizState,
  performanceMessage,
  performancePercent,
  selectAnswer,
  startQuiz,
} from './engine'

const questions = [
  {
    question: 'Um',
    answers: [
      { text: 'certa', correct: true },
      { text: 'errada', correct: false },
    ],
  },
  {
    question: 'Dois',
    answers: [
      { text: 'errada', correct: false },
      { text: 'certa', correct: true },
    ],
  },
]

describe('quiz', () => {
  test('mantém as faixas de resultado do jogo original', () => {
    expect(performanceMessage(performancePercent(10, 10))).toBe('Excelente :)')
    expect(performanceMessage(70)).toBe('Muito bom :)')
    expect(performanceMessage(50)).toBe('Bom')
    expect(performanceMessage(49)).toBe('Pode melhorar :(')
  })

  test('soma acertos e só avança depois da resposta', () => {
    let state = startQuiz(createQuizState(questions))
    state = selectAnswer(state, 0)
    expect(state.correct).toBe(1)
    expect(state.index).toBe(0)
    const ignored = advanceQuiz({ ...state, selected: null })
    expect(ignored.index).toBe(0)
    state = advanceQuiz(state)
    expect(state.index).toBe(1)
    state = selectAnswer(state, 0)
    state = advanceQuiz(state)
    expect(state.phase).toBe('finished')
    expect(state.correct).toBe(1)
    expect(state.message).toBe('Bom')
  })

  test('ignora um segundo clique na mesma pergunta', () => {
    let state = startQuiz(createQuizState(questions))
    state = selectAnswer(state, 0)
    state = selectAnswer(state, 1)
    expect(state.correct).toBe(1)
    expect(state.selected).toBe(0)
  })
})
