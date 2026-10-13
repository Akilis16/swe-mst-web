export function Board({ board, disabled, onPlay }) {
  return (
    <div className="game" role="grid" aria-label="Tabuleiro do jogo da velha">
      {board.map((cell, index) => (
        <button
          key={index}
          type="button"
          data-i={index + 1}
          role="gridcell"
          aria-label={`Casa ${index + 1}${cell ? `, ${cell}` : ''}`}
          disabled={disabled || Boolean(cell)}
          onClick={() => onPlay(index)}
        >
          {cell || ''}
        </button>
      ))}
    </div>
  )
}
