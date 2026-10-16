export function performancePercent(correct, total) {
  if (!total) return 0
  return Math.floor((correct * 100) / total)
}

export function performanceMessage(percent) {
  if (percent >= 90) return 'Excelente :)'
  if (percent >= 70) return 'Muito bom :)'
  if (percent >= 50) return 'Bom'
  return 'Pode melhorar :('
}

export function isCorrectAnswer(question, answerIndex) {
  return Boolean(question?.answers?.[answerIndex]?.correct)
}

export function createQuizState(questions) {
  return {
    questions,
    index: 0,
    correct: 0,
    selected: null,
    phase: 'ready',
  }
}

export function startQuiz(state) {
  return {
    ...state,
    phase: 'question',
    index: 0,
    correct: 0,
    selected: null,
  }
}

export function selectAnswer(state, answerIndex) {
  if (state.phase !== 'question' || state.selected !== null) return state
  const question = state.questions[state.index]
  if (!question || answerIndex < 0 || answerIndex >= question.answers.length) return state
  const right = isCorrectAnswer(question, answerIndex)
  return {
    ...state,
    selected: answerIndex,
    correct: state.correct + (right ? 1 : 0),
  }
}

export function advanceQuiz(state) {
  if (state.phase !== 'question' || state.selected === null) return state
  const index = state.index + 1
  if (index >= state.questions.length) {
    const percent = performancePercent(state.correct, state.questions.length)
    return {
      ...state,
      phase: 'finished',
      index,
      percent,
      message: performanceMessage(percent),
    }
  }
  return { ...state, index, selected: null }
}
