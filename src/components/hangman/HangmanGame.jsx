import { useEffect, useRef, useState } from 'react'
import { hangmanApi } from '../../api/hangmanApi'
import { useAuth } from '../../auth/AuthContext'
import {
  ALPHABET,
  applyGuess,
  canGuess,
  createHangmanRound,
  createLocalRound,
  maskSlots,
  resolveLocalGuess,
} from '../../games/hangman/engine'
import { categories as defaultCategories } from '../../games/hangman/words'
import { useGameRound } from '../../hooks/useGameRound'
import { HangmanDrawing } from './HangmanDrawing'

const CONNECTION_LOST = 'A conexão com o servidor caiu. Uma nova partida começou sem salvar.'

export function HangmanGame({ categories: localCategories = defaultCategories, random = Math.random }) {
  const { isAuthenticated } = useAuth()
  const session = useGameRound()
  const [categories, setCategories] = useState(localCategories)
  const [chosen, setChosen] = useState(null)
  const [round, setRound] = useState(null)
  const [notice, setNotice] = useState('')
  // Palavra sorteada no navegador; null quando a partida está no servidor.
  const secret = useRef(null)
  const busy = useRef(false)

  // Logado, as categorias vêm da API (conteúdo administrado lá).
  useEffect(() => {
    setCategories(localCategories)
    if (!isAuthenticated) return undefined
    let active = true
    hangmanApi
      .categories()
      .then((remote) => {
        if (!active || !Array.isArray(remote) || remote.length === 0) return
        setCategories(remote.map((item) => ({ code: item.code, name: item.name })))
      })
      .catch(() => { })
    return () => {
      active = false
    }
  }, [isAuthenticated, localCategories])

  function localCategoryFor(code) {
    return localCategories.find((item) => item.code === code) ?? localCategories[0]
  }

  async function choose(category, { localOnly = false, message = '' } = {}) {
    busy.current = true
    setChosen(category.code)
    setNotice(message)
    setRound(null)
    const outcome = await session.start(localOnly ? async () => null : () => hangmanApi.start({ category: category.code }))
    if (outcome.status === 'stale') return
    if (outcome.status === 'online') {
      secret.current = null
      setRound(createHangmanRound(outcome.round))
    } else {
      const local = createLocalRound(localCategoryFor(category.code), random)
      secret.current = local.word
      setChosen(local.round.category)
      setRound(local.round)
    }
    busy.current = false
  }

  async function guess(letter) {
    if (busy.current || !canGuess(round, letter)) return
    if (secret.current) {
      const word = secret.current
      setRound((current) => {
        const result = resolveLocalGuess(word, current, letter)
        return result ? applyGuess(current, result) : current
      })
      return
    }
    busy.current = true
    const outcome = await session.play((id) => hangmanApi.guess(id, { letter }))
    busy.current = false
    if (outcome.status === 'online') {
      setRound((current) => applyGuess(current, outcome.result))
    } else if (outcome.status === 'lost') {
      choose(localCategoryFor(chosen), { localOnly: true, message: CONNECTION_LOST })
    }
  }

  function newGame() {
    secret.current = null
    busy.current = false
    setRound(null)
    setChosen(null)
    setNotice('')
  }

  return (
    <div className="container forca">
      <h1 className="forca-titulo">Jogo da Forca</h1>

      <div id="options-container">
        <h3>Selecionar uma opção</h3>
        <div>
          {categories.map((category) => (
            <button
              key={category.code}
              type="button"
              className={`options${chosen === category.code ? ' active' : ''}`}
              disabled={Boolean(chosen)}
              onClick={() => choose(category)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {round ? (
        <div id="letter-container" className="letter-container" role="group" aria-label="Letras">
          {ALPHABET.map((letter) => (
            <button
              key={letter}
              type="button"
              className="letters"
              disabled={!canGuess(round, letter)}
              onClick={() => guess(letter)}
            >
              {letter}
            </button>
          ))}
        </div>
      ) : null}

      <div id="user-input-section" aria-label="Palavra" aria-live="polite">
        {maskSlots(round?.maskedWord).map((slot, index) => (
          <span key={index} className="dashes">
            {slot}
          </span>
        ))}
      </div>

      <HangmanDrawing errors={round?.errors ?? 0} />

      {notice ? (
        <p className="banner loss" role="status">
          {notice}
        </p>
      ) : null}

      {round?.finished ? (
        <div id="new-game-container" className="new-game-popup">
          <div id="result-text" role="status">
            {round.result === 'WIN' ? (
              <h2 className="win-msg">Você ganhou!!</h2>
            ) : (
              <h2 className="lose-msg">Você perdeu!!</h2>
            )}
            <p>
              A palavra era: <span>{round.word}</span>
            </p>
          </div>
          {session.serverScore !== null ? <p className="status-line">Pontuação: {session.serverScore}</p> : null}
          <button id="new-game-button" type="button" onClick={newGame}>
            Novo jogo
          </button>
        </div>
      ) : null}
    </div>
  )
}
