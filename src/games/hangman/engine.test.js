import {
  ALPHABET,
  applyGuess,
  canGuess,
  createHangmanRound,
  createLocalRound,
  maskSlots,
  maskWord,
  normalizeLetter,
  resolveLocalGuess,
} from './engine'
import { categories } from './words'

function roundFor(word) {
  return createHangmanRound({ category: 'TESTE', maskedWord: maskWord(word, []), length: word.length })
}

function play(word, letters) {
  let round = roundFor(word)
  let last = null
  for (const letter of letters) {
    last = resolveLocalGuess(word, round, letter)
    round = applyGuess(round, last)
  }
  return { round, last }
}

describe('jogo da forca', () => {
  test('as palavras do jogo original estão em maiúsculas de A a Z', () => {
    expect(categories.map((category) => category.code)).toEqual(['FRUTAS', 'ANIMAIS', 'PAISES', 'CORES'])
    for (const category of categories) {
      expect(category.words).toHaveLength(10)
      category.words.forEach((word) => expect(word).toMatch(/^[A-Z]+$/))
    }
    expect(ALPHABET).toHaveLength(26)
  })

  test('a máscara usa o mesmo formato da API', () => {
    expect(maskWord('BANANA', ['A'])).toBe('_ A _ A _ A')
    expect(maskSlots('_ A _')).toEqual(['_', 'A', '_'])
    const { word, round } = createLocalRound(categories[0], () => 0)
    expect(word).toBe('AMEIXA')
    expect(round.maskedWord).toBe('_ _ _ _ _ _')
    expect(round.word).toBeNull()
  })

  test('letra certa revela todas as ocorrências', () => {
    const { round, last } = play('BANANA', ['a'])
    expect(last.correct).toBe(true)
    expect(round.maskedWord).toBe('_ A _ A _ A')
    expect(round.errors).toBe(0)
    expect(round.usedLetters).toEqual(['A'])
  })

  test('letra repetida ou inválida é ignorada', () => {
    const { round } = play('BANANA', ['B'])
    expect(resolveLocalGuess('BANANA', round, 'b')).toBeNull()
    expect(resolveLocalGuess('BANANA', round, 'ç')).toBeNull()
    expect(normalizeLetter(' x ')).toBe('X')
    expect(canGuess(round, 'B')).toBe(false)
    expect(canGuess(round, 'C')).toBe(true)
  })

  test('sexto erro perde e mostra a palavra', () => {
    const { round } = play('BANANA', ['X', 'Y', 'Z', 'W', 'K', 'Q'])
    expect(round.finished).toBe(true)
    expect(round.result).toBe('LOSS')
    expect(round.word).toBe('BANANA')
    expect(canGuess(round, 'A')).toBe(false)
  })

  test('última letra vence', () => {
    const { round } = play('BANANA', ['B', 'X', 'N', 'A'])
    expect(round.result).toBe('WIN')
    expect(round.errors).toBe(1)
    expect(round.maskedWord).toBe('B A N A N A')
  })
})
