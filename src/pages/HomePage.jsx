import { Link } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'

export function HomePage() {
  return (
    <PageShell>
      <section className="jogar">
        <Link className="btn-jogar" to="/jogos">
          <img src="/jogos-logo.png" alt="" />
          <h1>Jogos</h1>
        </Link>
      </section>
    </PageShell>
  )
}
