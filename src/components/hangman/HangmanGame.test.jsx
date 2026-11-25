import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { hangmanApi } from '../../api/hangmanApi'
import { renderLoggedIn } from '../../test/renderLoggedIn'
import { HangmanGame } from './HangmanGame'

jest.mock('../../api/hangmanApi', () => ({
  hangmanApi: {
    categories: jest.fn(),
    start: jest.fn(),
    guess: jest.fn(),
  },
}))

jest.mock('../../api/sessionsApi', () => ({
  sessionsApi: {
    abandon: jest.fn(() => Promise.resolve(null)),
  },
}))

async function guessAll(user, letters) {
  const keyboard = screen.getByRole('group', { name: 'Letras' })
  for (const letter of letters) {
    await user.click(within(keyboard).getByRole('button', { name: letter }))
  }
}

describe('HangmanGame', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  test('sem login sorteia no navegador e vence ao completar a palavra', async () => {
    const user = userEvent.setup()
    // random() = 0 → primeira palavra de Frutas: AMEIXA
    render(<HangmanGame random={() => 0} />)

    expect(screen.queryByRole('group', { name: 'Letras' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Frutas' }))

    expect(await screen.findByRole('group', { name: 'Letras' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Animais' })).toBeDisabled()

    await guessAll(user, ['A', 'Z'])
    expect(screen.getByRole('button', { name: 'Z' })).toBeDisabled()
    expect(screen.getByRole('img', { name: 'Forca: 1 de 6 erros' })).toBeInTheDocument()

    await guessAll(user, ['M', 'E', 'I', 'X'])

    expect(await screen.findByText('Você ganhou!!')).toBeInTheDocument()
    expect(screen.getByText('AMEIXA')).toBeInTheDocument()
    expect(hangmanApi.start).not.toHaveBeenCalled()
    expect(hangmanApi.categories).not.toHaveBeenCalled()
  })

  test('seis erros perdem e "Novo jogo" volta para as categorias', async () => {
    const user = userEvent.setup()
    render(<HangmanGame random={() => 0} />)

    await user.click(screen.getByRole('button', { name: 'Frutas' }))
    await screen.findByRole('group', { name: 'Letras' })
    await guessAll(user, ['B', 'C', 'D', 'F', 'G', 'H'])

    expect(await screen.findByText('Você perdeu!!')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Novo jogo' }))
    expect(screen.getByRole('button', { name: 'Frutas' })).toBeEnabled()
    expect(screen.queryByText('Você perdeu!!')).not.toBeInTheDocument()
  })

  test('logado, as categorias e os palpites vão para a API', async () => {
    hangmanApi.categories.mockResolvedValue([{ code: 'FRUTAS', name: 'Frutas', wordCount: 10 }])
    hangmanApi.start.mockResolvedValue({
      roundId: 'r1',
      playSessionId: 's1',
      category: 'FRUTAS',
      maskedWord: '_ _ _',
      length: 3,
      errors: 0,
      maxErrors: 6,
      usedLetters: [],
      finished: false,
      result: null,
      word: null,
    })
    hangmanApi.guess
      .mockResolvedValueOnce({ correct: true, maskedWord: 'U _ _', errors: 0, maxErrors: 6, usedLetters: ['U'], finished: false, result: null, word: null })
      .mockResolvedValueOnce({ correct: true, maskedWord: 'U V _', errors: 0, maxErrors: 6, usedLetters: ['U', 'V'], finished: false, result: null, word: null })
      .mockResolvedValueOnce({
        correct: true,
        maskedWord: 'U V A',
        errors: 0,
        maxErrors: 6,
        usedLetters: ['U', 'V', 'A'],
        finished: true,
        result: 'WIN',
        word: 'UVA',
        score: { value: 100 },
      })

    const user = userEvent.setup()
    renderLoggedIn(<HangmanGame />)

    await screen.findByRole('button', { name: 'Frutas' })
    await screen.findByText('Selecionar uma opção')
    expect(hangmanApi.categories).toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Frutas' }))
    await screen.findByRole('group', { name: 'Letras' })
    expect(hangmanApi.start).toHaveBeenCalledWith({ category: 'FRUTAS' })

    for (const letter of ['U', 'V', 'A']) {
      await guessAll(user, [letter])
      await waitFor(() => expect(screen.getByRole('button', { name: letter })).toBeDisabled())
    }

    expect(await screen.findByText('Você ganhou!!')).toBeInTheDocument()
    expect(screen.getByText('Pontuação: 100')).toBeInTheDocument()
    expect(hangmanApi.guess).toHaveBeenNthCalledWith(1, 'r1', { letter: 'U' })
    expect(hangmanApi.guess).toHaveBeenNthCalledWith(3, 'r1', { letter: 'A' })
  })
})
