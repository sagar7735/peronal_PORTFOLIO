import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import AnimatedBackground from './components/ui/AnimatedBackground'
import ScrollProgress from './components/ui/ScrollProgress'
import BackToTop from './components/ui/BackToTop'
import UiPreview from './pages/UiPreview'

function App() {
  return (
    <ThemeProvider>
      <AnimatedBackground />
      <ScrollProgress />
      <BackToTop />
      <Routes>
        <Route path="/" element={<UiPreview />} />
        <Route path="/ui-preview" element={<UiPreview />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
