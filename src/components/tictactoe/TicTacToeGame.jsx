import { useEffect, useState } from 'react'
import { sessionsApi } from '../../api/sessionsApi'
import {
  applyMove,
  chooseCpuIndex,
  createBoard,
  findWinner,
  isDraw,
  opponent,
} from '../../games/tictactoe/engine'
import { usePlaySession } from '../../hooks/usePlaySession'
import { Board } from './Board'

export function TicTacToeGame({ mode, cpuDelayMs = 300, random = Math.random }) {
  const [board, setBoard] = useState(createBoard)
  const [player, setPlayer] = useState('X')
  const [result, setResult] = useState(null)
  const session = usePlaySession('tictactoe')

  useEffect(() => {
    session.open({ mode })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  useEffect(() => {
    if (mode !== 'cpu' || player !== 'O' || result) return undefined
    const timer = setTimeout(() => {
      const index = chooseCpuIndex(board, random)
      if (index >= 0) commit(index, 'O')
    }, cpuDelayMs)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, player, result, mode, cpuDelayMs])

  function commit(index, symbol) {
    const move = applyMove(board, index, symbol)
    if (!move.ok) return
    const next = move.board
    setBoard(next)
    session.send((id) => sessionsApi.tictactoeMove(id, { cell: index + 1, symbol }))

    const winner = findWinner(next)
    if (winner) {
      setResult({ type: 'win', winner })
      session.finish()
      return
    }
    if (isDraw(next)) {
      setResult({ type: 'draw', winner: null })
      session.finish()
      return
    }
    setPlayer(opponent(symbol))
  }

  function onPlay(index) {
    if (result) return
    if (mode === 'cpu' && player !== 'X') return
    commit(index, player)
  }

  function restart() {
    setBoard(createBoard())
    setPlayer('X')
    setResult(null)
    session.open({ mode })
  }

  const message = resultMessage(result, mode)

  return (
    <main className="velha-main">
      <h1>Jogo da Velha</h1>
      <hr />
      <Board board={board} disabled={Boolean(result)} onPlay={onPlay} />
      <h2 className="currentPlayer" aria-live="polite">
        {message || `JOGADOR DA VEZ: ${player}`}
      </h2>
      {session.serverScore !== null ? <p className="status-line">Pontuação: {session.serverScore}</p> : null}
      {result ? (
        <div className="velha-actions">
          <button className="btn-jogar" type="button" onClick={restart}>
            <h1>Jogar de novo</h1>
          </button>
        </div>
      ) : null}
    </main>
  )
}

function resultMessage(result, mode) {
  if (!result) return ''
  if (result.type === 'draw') return 'DEU EMPATE!'
  if (mode === 'cpu' && result.winner === 'O') return "O COMPUTADOR GANHOU!"
  return `O JOGADOR '${result.winner}' GANHOU!`
}
