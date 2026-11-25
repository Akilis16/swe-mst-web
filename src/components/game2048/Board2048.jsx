import { tileClass } from '../../games/game2048/engine'

export function Board2048({ board, onTouchStart, onTouchEnd }) {
  return (
    <div id="board" role="grid" aria-label="Tabuleiro do 2048" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {board.flatMap((row, r) =>
        row.map((value, c) => (
          <div
            key={`${r}-${c}`}
            id={`${r}-${c}`}
            role="gridcell"
            aria-label={`Linha ${r + 1}, coluna ${c + 1}: ${value || 'vazia'}`}
            className={tileClass(value)}
          >
            {value || ''}
          </div>
        )),
      )}
    </div>
  )
}
