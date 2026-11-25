import { assetUrl } from '../../games/memory/engine'

export function MemoryCard({ card, faceUp, backImagePath, disabled, onFlip }) {
  const number = card.position + 1
  const label = faceUp && card.label ? `Carta ${number}, ${card.label}` : `Carta ${number}, virada para baixo`
  return (
    <button
      type="button"
      role="gridcell"
      className={`card${faceUp ? ' reveal-card' : ''}`}
      aria-label={label}
      disabled={disabled}
      onClick={() => onFlip(card.position)}
    >
      <div
        className={`face front${card.matched ? ' disabled-card' : ''}`}
        style={card.imagePath ? { backgroundImage: `url('${assetUrl(card.imagePath)}')` } : undefined}
      />
      <div className="face back" style={{ backgroundImage: `url('${assetUrl(backImagePath)}')` }} />
    </button>
  )
}
