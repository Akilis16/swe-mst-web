/**
 * Regras do Jogo da Forca.
 *
 * A partida tem o formato da MST API (HangmanRoundResponse): máscara, erros e
 * letras usadas; a palavra só aparece no fim. Cada palpite é uma GuessResponse,
 * calculada aqui no modo local ou recebida do servidor no modo online.
 */
export const MAX_ERRORS = 6
export const ALPHABET = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))

export function normalizeLetter(letter) {
  const value = String(letter ?? '').trim().toUpperCase()
  return /^[A-Z]$/.test(value) ? value : null
}

export function maskWord(word, revealed) {
  return word
    .split('')
    .map((char) => (revealed.includes(char) ? char : '_'))
    .join(' ')
}

export function maskSlots(maskedWord) {
  return maskedWord ? maskedWord.split(' ') : []
}

export function pickWord(words, random = Math.random) {
  return words[Math.floor(random() * words.length)]
}

/** Partida local: a palavra fica fora do estado exibido. */
export function createLocalRound(category, random = Math.random) {
  const word = pickWord(category.words, random).toUpperCase()
  return {
    word,
    round: createHangmanRound({
      category: category.code,
      maskedWord: maskWord(word, []),
      length: word.length,
    }),
  }
}

export function createHangmanRound({
  category,
  maskedWord,
  length,
  errors = 0,
  maxErrors = MAX_ERRORS,
  usedLetters = [],
  finished = false,
  result = null,
  word = null,
}) {
  return { category, maskedWord, length, errors, maxErrors, usedLetters, finished, result, word }
}

/** Mesmo cálculo que a API faz em POST /hangman/rounds/{id}/guesses. */
export function resolveLocalGuess(word, round, rawLetter) {
  const letter = normalizeLetter(rawLetter)
  if (!letter || round.finished || round.usedLetters.includes(letter)) return null
  const usedLetters = [...round.usedLetters, letter]
  const revealed = usedLetters.filter((item) => word.includes(item))
  const errors = usedLetters.length - revealed.length
  let result = null
  if (word.split('').every((char) => revealed.includes(char))) result = 'WIN'
  else if (errors >= round.maxErrors) result = 'LOSS'
  return {
    correct: word.includes(letter),
    maskedWord: maskWord(word, revealed),
    errors,
    maxErrors: round.maxErrors,
    usedLetters,
    finished: result !== null,
    result,
    word: result !== null ? word : null,
  }
}

export function applyGuess(round, guess) {
  return {
    ...round,
    maskedWord: guess.maskedWord,
    errors: guess.errors,
    maxErrors: guess.maxErrors ?? round.maxErrors,
    usedLetters: guess.usedLetters,
    finished: Boolean(guess.finished),
    result: guess.result ?? null,
    word: guess.word ?? null,
  }
}

export function canGuess(round, letter) {
  return Boolean(round && !round.finished && !round.usedLetters.includes(letter))
}
