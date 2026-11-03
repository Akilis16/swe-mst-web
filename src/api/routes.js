/**
 * Contrato HTTP do cliente.
 * Sessões batem com o Swagger da MST API (localhost:4000).
 * Catálogo e jogadas ficam centralizados aqui para o backend encaixar
 * sem espalhar caminhos pelos componentes.
 */
export const routes = {
  games: '/api/v1/games',
  playSessions: '/api/v1/play-sessions',
  playSession: (id) => `/api/v1/play-sessions/${id}`,
  finishSession: (id) => `/api/v1/play-sessions/${id}/finish`,
  abandonSession: (id) => `/api/v1/play-sessions/${id}/abandon`,
  myPlaySessions: '/api/v1/me/play-sessions',
  tictactoeMove: (id) => `/api/v1/play-sessions/${id}/tictactoe/moves`,
  quizAnswer: (id) => `/api/v1/play-sessions/${id}/quiz/answers`,
  sudokuCell: (id) => `/api/v1/play-sessions/${id}/sudoku/cells`,
}

export const ApiCode = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  NOT_FOUND: 'NOT_FOUND',
  SESSION_ALREADY_ENDED: 'SESSION_ALREADY_ENDED',
  TICTACTOE_CELL_ALREADY_MATCHED: 'TICTACTOE_CELL_ALREADY_MATCHED',
  MEMORY_POSITION_ALREADY_MATCHED: 'MEMORY_POSITION_ALREADY_MATCHED',
  QUIZ_QUESTION_ALREADY_ANSWERED: 'QUIZ_QUESTION_ALREADY_ANSWERED',
  SUDOKU_CELL_IS_GIVEN: 'SUDOKU_CELL_IS_GIVEN',
  HANGMAN_LETTER_ALREADY_USED: 'HANGMAN_LETTER_ALREADY_USED',
  NETWORK_ERROR: 'NETWORK_ERROR',
}
