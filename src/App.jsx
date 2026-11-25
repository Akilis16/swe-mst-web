import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { CatalogPage } from './pages/CatalogPage'
import { Game2048Page } from './pages/Game2048Page'
import { HangmanPage } from './pages/HangmanPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { MemoryPage } from './pages/MemoryPage'
import { QuizPage } from './pages/QuizPage'
import { RegisterPage } from './pages/RegisterPage'
import { SudokuPage } from './pages/SudokuPage'
import { TicTacToeModePage } from './pages/TicTacToeModePage'
import { TicTacToePage } from './pages/TicTacToePage'

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/entrar" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/jogos" element={<CatalogPage />} />
        <Route path="/jogos/velha" element={<TicTacToeModePage />} />
        <Route path="/jogos/velha/:mode" element={<TicTacToePage />} />
        <Route path="/jogos/quiz" element={<QuizPage />} />
        <Route path="/jogos/sudoku" element={<SudokuPage />} />
        <Route path="/jogos/memoria" element={<MemoryPage />} />
        <Route path="/jogos/forca" element={<HangmanPage />} />
        <Route path="/jogos/2048" element={<Game2048Page />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
