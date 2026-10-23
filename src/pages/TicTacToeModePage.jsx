import { Link } from 'react-router-dom'
import { BackNav } from '../components/layout/BackNav'
import { PageShell } from '../components/layout/PageShell'

export function TicTacToeModePage() {
  return (
    <PageShell>
      <BackNav backTo="/jogos" />
      <section className="modo">
        <button className="btn-1vs1" type="button">
          <Link to="/jogos/velha/local">
            <img src="/icons/person-fill.svg" alt="" />
            <h1>X</h1>
            <img src="/icons/person-fill.svg" alt="" />
          </Link>
        </button>

        <button className="btn-1vsPc" type="button">
          <Link to="/jogos/velha/cpu">
            <img src="/icons/person-fill.svg" alt="" />
            <h1>X</h1>
            <img src="/icons/pc-display-horizontal.svg" alt="" />
          </Link>
        </button>
      </section>
    </PageShell>
  )
}
