import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-heading gradient-text">
        Portfolio — Coming Soon (Step 2+)
      </h1>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
