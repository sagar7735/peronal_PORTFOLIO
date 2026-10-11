import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import PublicLayout from './layouts/PublicLayout'
import { PageLoader } from './components/ui/Loader'
import CursorGlow from './components/CursorGlow'
import WhatsAppButton from './components/WhatsAppButton'

const Home = lazy(() => import('./pages/Home'))
const UiPreview = lazy(() => import('./pages/UiPreview'))

function ComingSoon({ title }) {
  return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="text-center space-y-3">
        <h1 className="font-heading text-4xl font-bold gradient-text">{title}</h1>
        <p className="text-gray-400">Coming in Step 9...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <CursorGlow />
      <WhatsAppButton />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<ComingSoon title="Projects" />} />
            <Route path="/projects/:slug" element={<ComingSoon title="Project Detail" />} />
            <Route path="/freelance" element={<ComingSoon title="Freelance" />} />
            <Route path="/contact" element={<ComingSoon title="Contact" />} />
            <Route path="/testimonial" element={<ComingSoon title="Leave a Review" />} />
          </Route>
          <Route path="/ui-preview" element={<UiPreview />} />
          <Route path="*" element={<ComingSoon title="404 — Page Not Found" />} />
        </Routes>
      </Suspense>
    </ThemeProvider>
  )
}
