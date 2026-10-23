import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listGames } from '../api/gamesApi'
import { BackNav } from '../components/layout/BackNav'
import { PageShell } from '../components/layout/PageShell'

const ALL_GAMES = [
  { slug: 'memoria', name: 'Jogo da Memória', to: '#', image: '/jogos/jogo-da-memoria.png', className: 'jg1', disabled: true },
  { slug: 'tictactoe', name: 'Jogo da Velha', to: '/jogos/velha', image: '/jogos/jogo-da-velha.png', className: 'jg2' },
  { slug: 'quiz', name: 'Quiz', to: '/jogos/quiz', image: '/jogos/quiz.png', className: 'jg3' },
  { slug: 'sudoku', name: 'Sudoku', to: '/jogos/sudoku', image: '/jogos/sudoku.png', className: 'jg4' },
  { slug: 'forca', name: 'Jogo da Forca', to: '#', image: '/jogos/jogo-da-forca.png', className: 'jg5', disabled: true },
]

export function CatalogPage() {
  const [games, setGames] = useState(ALL_GAMES)

  useEffect(() => {
    let active = true
    listGames()
      .then((remote) => {
        if (!active || !Array.isArray(remote)) return
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const line1 = games.slice(0, 3)
  const line2 = games.slice(3)

  return (
    <PageShell>
      <BackNav backTo="/" showHome={false} />
      <section className="jogos">
        <div className="l1">
          {line1.map((game) =>
            game.disabled ? (
              <div key={game.slug} className={`jg-card ${game.className}`} title="Em desenvolvimento">
                <h1>{game.name}</h1>
                <img src={game.image} alt={game.name} />
              </div>
            ) : (
              <Link key={game.slug} to={game.to}>
                <div className={`jg-card ${game.className}`}>
                  <h1>{game.name}</h1>
                  <img src={game.image} alt={game.name} />
                </div>
              </Link>
            ),
          )}
        </div>
        <div className="l2">
          {line2.map((game) =>
            game.disabled ? (
              <div key={game.slug} className={`jg-card ${game.className}`} title="Em desenvolvimento">
                <h1>{game.name}</h1>
                <img src={game.image} alt={game.name} />
              </div>
            ) : (
              <Link key={game.slug} to={game.to}>
                <div className={`jg-card ${game.className}`}>
                  <h1>{game.name}</h1>
                  <img src={game.image} alt={game.name} />
                </div>
              </Link>
            ),
          )}
        </div>
      </section>
    </PageShell>
  )
}
