import { Link } from 'react-router-dom'

export function BackNav({ backTo = '/jogos', showHome = true }) {
  return (
    <section className="voltar" aria-label="Navegação de retorno">
      {showHome ? (
        <Link to="/" aria-label="Início">
          <div className="voltar-op-1">
            <img src="/icons/house.svg" alt="" />
          </div>
        </Link>
      ) : null}
      {backTo ? (
        <Link to={backTo} aria-label="Voltar">
          <div className="voltar-op-2">
            <img src="/icons/arrow-left.svg" alt="" />
          </div>
        </Link>
      ) : null}
    </section>
  )
}
