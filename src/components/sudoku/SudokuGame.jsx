import { useEffect, useRef, useState } from 'react'
import { sessionsApi } from '../../api/sessionsApi'
import {
  INITIAL_LIVES,
  LEVELS,
  TIME_OPTIONS_MINUTES,
  createSudokuState,
  formatClock,
  inputDigit,
  pickPuzzle,
  revealSolution,
  tick,
} from '../../games/sudoku/engine'
import { puzzles } from '../../games/sudoku/puzzles'
import { usePlaySession } from '../../hooks/usePlaySession'
import { SudokuGrid } from './SudokuGrid'

export function SudokuGame({ random = Math.random }) {
  const [level, setLevel] = useState('easy')
  const [minutes, setMinutes] = useState(5)
  const [started, setStarted] = useState(false)
  const [state, setState] = useState(null)
  const session = usePlaySession('sudoku')
  const closed = useRef(false)

  useEffect(() => {
    if (!started || !state || state.status !== 'playing') return undefined
    const timer = setInterval(() => {
      setState((current) => (current ? tick(current) : current))
    }, 1000)
    return () => clearInterval(timer)
  }, [started, state?.status])

  useEffect(() => {
    if (!state || state.status === 'playing' || closed.current) return
    closed.current = true
    if (state.status === 'abandoned') session.abandon()
    else session.finish()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.status])

  function begin(nextLevel = level, nextMinutes = minutes) {
    if (state?.status === 'playing') session.abandon()
    closed.current = false
    const { puzzle } = pickPuzzle(puzzles[nextLevel], random)
    const rank = LEVELS.find((item) => item.id === nextLevel)?.rank
    setState(
      createSudokuState({
        mask: puzzle.mask,
        solution: puzzle.solution,
        lives: INITIAL_LIVES,
        seconds: nextMinutes * 60,
      }),
    )
    setStarted(true)
    session.open({ level: rank, minutes: nextMinutes })
  }

  function onInput(index, raw) {
    if (!state || state.status !== 'playing') return
    const digit = raw.slice(-1)
    const next = inputDigit(state, index, digit)
    if (next !== state && digit && next.notice !== 'SUDOKU_CELL_IS_GIVEN') {
      session.send((id) => sessionsApi.sudokuCell(id, { index, value: digit }))
    }
    setState(next)
  }

  function reveal() {
    setState((current) => (current ? revealSolution(current) : current))
  }

  const locked = started && state?.status === 'playing'
  const notice = state?.notice && state.notice !== 'SUDOKU_CELL_IS_GIVEN' ? state.notice : ''
  const clock = formatClock(state ? state.secondsLeft : minutes * 60)
  const [clockMin, clockSec] = clock.split(':')

  return (
    <section className="sudoku-container">
      <h1 className="sudoku-title">SUDOKU</h1>

      <button
        type="button"
        id="start"
        onClick={() => begin()}
        disabled={locked}
      >
        Jogar
      </button>
      <button
        type="button"
        id="replay"
        onClick={() => begin()}
        disabled={!started}
      >
        Novo jogo
      </button>
      <button
        type="button"
        id="answer"
        onClick={reveal}
        disabled={!started || state?.status !== 'playing'}
      >
        Resposta
      </button>

      <div id="timer">
        Tempo Restante: <span id="time_min">{clockMin}</span>:<span id="time_sec">{clockSec}</span>
      </div>

      <div id="lives">Chances restantes: {state ? state.lives : INITIAL_LIVES}</div>

      <div id="game_type">
        <h3>ESCOLHA O NIVEL:</h3>
        <label>
          <input
            type="radio"
            id="easy"
            className="label"
            name="diff_level"
            checked={level === 'easy'}
            disabled={locked}
            onChange={() => setLevel('easy')}
          />{' '}
          fácil
        </label>
        <label>
          <input
            type="radio"
            id="medium"
            className="label"
            name="diff_level"
            checked={level === 'medium'}
            disabled={locked}
            onChange={() => setLevel('medium')}
          />{' '}
          Médio
        </label>
        <label>
          <input
            type="radio"
            id="hard"
            className="label"
            name="diff_level"
            checked={level === 'hard'}
            disabled={locked}
            onChange={() => setLevel('hard')}
          />{' '}
          Dificil
        </label>

        <h3>TEMPO LIMITE :</h3>
        <label>
          <input
            type="radio"
            id="time1"
            className="label"
            name="time"
            checked={minutes === 3}
            disabled={locked}
            onChange={() => setMinutes(3)}
          />{' '}
          <span id="time1_min">03</span>:<span id="time1_sec">00</span>
        </label>
        <label>
          <input
            type="radio"
            id="time2"
            className="label"
            name="time"
            checked={minutes === 5}
            disabled={locked}
            onChange={() => setMinutes(5)}
          />{' '}
          <span id="time2_min">05</span>:<span id="time2_sec">00</span>
        </label>
        <label>
          <input
            type="radio"
            id="time3"
            className="label"
            name="time"
            checked={minutes === 10}
            disabled={locked}
            onChange={() => setMinutes(10)}
          />{' '}
          <span id="time3_min">10</span>:<span id="time3_sec">00</span>
        </label>
      </div>

      <SudokuGrid
        cells={state?.cells}
        disabled={!state || state.status !== 'playing'}
        onInput={onInput}
      />

      {notice ? (
        <p className={`banner ${state.status === 'solved' ? 'win' : ''} ${state.status === 'lost' ? 'loss' : ''}`} role="status">
          {notice}
        </p>
      ) : null}

      {session.serverScore !== null ? <p className="status-line">Pontuação: {session.serverScore}</p> : null}
    </section>
  )
}
