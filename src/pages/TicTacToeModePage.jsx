import { Link } from 'react-router-dom'
import { BackNav } from '../components/layout/BackNav'
import { PageShell } from '../components/layout/PageShell'

export function TicTacToeModePage() {
  return (
    <PageShell>
      <BackNav backTo="/jogos" />
      <section className="modo">
        <Link className="btn-1vs1" to="/jogos/velha/local" aria-label="Dois jogadores">
          <img src="/icons/person-fill.svg" alt="" />
          <h1>X</h1>
          <img src="/icons/person-fill.svg" alt="" />
        </Link>

        <Link className="btn-1vsPc" to="/jogos/velha/cpu" aria-label="Contra o computador">
          <img src="/icons/person-fill.svg" alt="" />
          <h1>X</h1>
          <img src="/icons/pc-display-horizontal.svg" alt="" />
        </Link>
      </section>
    </PageShell>
  )
}
