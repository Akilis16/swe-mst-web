import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { App } from './App'

describe('Rotas da Aplicação (App)', () => {
  test('renderiza a HomePage na rota "/"', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /jogos/i })).toBeInTheDocument()
    expect(screen.getByText('Todos os direitos reservados a MST ©Copyright')).toBeInTheDocument()
  })

  test('renderiza o CatalogPage na rota "/jogos"', () => {
    render(
      <MemoryRouter initialEntries={['/jogos']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /jogo da velha/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /quiz/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sudoku/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /jogo da memória/i })).toHaveAttribute('href', '/jogos/memoria')
    expect(screen.getByRole('link', { name: /jogo da forca/i })).toHaveAttribute('href', '/jogos/forca')
    expect(screen.getByRole('link', { name: /2048/i })).toHaveAttribute('href', '/jogos/2048')
  })

  test('renderiza MemoryPage na rota "/jogos/memoria"', async () => {
    render(
      <MemoryRouter initialEntries={['/jogos/memoria']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Jogo da Memória' })).toBeInTheDocument()
    expect(await screen.findAllByRole('gridcell')).toHaveLength(18)
  })

  test('renderiza HangmanPage na rota "/jogos/forca"', () => {
    render(
      <MemoryRouter initialEntries={['/jogos/forca']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Jogo da Forca' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Frutas' })).toBeInTheDocument()
  })

  test('renderiza Game2048Page na rota "/jogos/2048"', async () => {
    render(
      <MemoryRouter initialEntries={['/jogos/2048']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: '2048' })).toBeInTheDocument()
    expect(await screen.findByRole('grid', { name: 'Tabuleiro do 2048' })).toBeInTheDocument()
  })

  test('renderiza TicTacToeModePage na rota "/jogos/velha"', () => {
    render(
      <MemoryRouter initialEntries={['/jogos/velha']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /dois jogadores/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /contra o computador/i })).toBeInTheDocument()
  })

  test('renderiza TicTacToePage na rota "/jogos/velha/local"', () => {
    render(
      <MemoryRouter initialEntries={['/jogos/velha/local']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Jogo da Velha' })).toBeInTheDocument()
    expect(screen.getByRole('grid', { name: /tabuleiro do jogo da velha/i })).toBeInTheDocument()
  })

  test('renderiza QuizPage na rota "/jogos/quiz"', () => {
    render(
      <MemoryRouter initialEntries={['/jogos/quiz']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('button', { name: 'Começar Quiz!' })).toBeInTheDocument()
  })

  test('renderiza SudokuPage na rota "/jogos/sudoku"', () => {
    render(
      <MemoryRouter initialEntries={['/jogos/sudoku']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'SUDOKU' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Jogar' })).toBeInTheDocument()
  })

  test('redireciona rota inválida para a HomePage', () => {
    render(
      <MemoryRouter initialEntries={['/rota-que-nao-existe']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /jogos/i })).toBeInTheDocument()
  })
})

