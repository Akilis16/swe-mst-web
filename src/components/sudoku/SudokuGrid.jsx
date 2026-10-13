const BOXES = [0, 1, 2, 3, 4, 5, 6, 7, 8]

function cellIndex(box, offset) {
  const boxRow = Math.floor(box / 3)
  const boxCol = box % 3
  const row = boxRow * 3 + Math.floor(offset / 3)
  const col = boxCol * 3 + (offset % 3)
  return row * 9 + col
}

export function SudokuGrid({ cells, disabled, onInput }) {
  return (
    <div id="main" role="grid" aria-label="Grade de Sudoku">
      <div id="row1">
        {BOXES.slice(0, 3).map((box) => renderBox(box, cells, disabled, onInput))}
      </div>
      <div id="row2">
        {BOXES.slice(3, 6).map((box) => renderBox(box, cells, disabled, onInput))}
      </div>
      <div id="row3">
        {BOXES.slice(6, 9).map((box) => renderBox(box, cells, disabled, onInput))}
      </div>
    </div>
  )
}

function renderBox(box, cells, disabled, onInput) {
  return (
    <div id={`box${box + 1}`} className="box" key={box}>
      {Array.from({ length: 9 }, (_, offset) => {
        const index = cellIndex(box, offset)
        const cell = cells ? cells[index] : null
        return (
          <div className="cell" key={index}>
            <input
              id={String(index + 1)}
              className={`input ${cell?.given ? 'given' : ''}`}
              aria-label={`Célula ${index + 1}`}
              inputMode="numeric"
              maxLength={1}
              readOnly={disabled || Boolean(cell?.given)}
              value={cell ? cell.value : ''}
              onChange={(e) => onInput && onInput(index, e.target.value)}
            />
          </div>
        )
      })}
    </div>
  )
}

export { cellIndex }
