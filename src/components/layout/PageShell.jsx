import { AppFooter } from './AppFooter'
import { AppHeader } from './AppHeader'

export function PageShell({ children }) {
  return (
    <div className="app">
      <AppHeader />
      <main className="app-main">{children}</main>
      <AppFooter />
    </div>
  )
}
