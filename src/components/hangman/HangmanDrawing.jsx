import { MAX_ERRORS } from '../../games/hangman/engine'

// Mesmas coordenadas do canvas do jogo original: cabeça, corpo, braços e pernas.
const BODY_PARTS = [
  <circle key="cabeca" cx="70" cy="30" r="10" />,
  <line key="corpo" x1="70" y1="40" x2="70" y2="80" />,
  <line key="braco-esquerdo" x1="70" y1="50" x2="50" y2="70" />,
  <line key="braco-direito" x1="70" y1="50" x2="90" y2="70" />,
  <line key="perna-esquerda" x1="70" y1="80" x2="50" y2="110" />,
  <line key="perna-direita" x1="70" y1="80" x2="90" y2="110" />,
]

export function HangmanDrawing({ errors = 0 }) {
  const shown = Math.max(0, Math.min(errors, BODY_PARTS.length))
  return (
    <svg
      id="canvas"
      viewBox="0 0 140 140"
      role="img"
      aria-label={`Forca: ${shown} de ${MAX_ERRORS} erros`}
      fill="none"
      stroke="#000"
      strokeWidth="2"
    >
      <line x1="10" y1="130" x2="130" y2="130" />
      <line x1="10" y1="10" x2="10" y2="131" />
      <line x1="10" y1="10" x2="70" y2="10" />
      <line x1="70" y1="10" x2="70" y2="20" />
      {BODY_PARTS.slice(0, shown)}
    </svg>
  )
}
