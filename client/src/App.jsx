import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import PublicLayout from './layouts/PublicLayout'
import { PageLoader } from './components/ui/Loader'
import CursorGlow from './components/CursorGlow'
import WhatsAppButton from './components/WhatsAppButton'

const Home = lazy(() => import('./pages/Home'))
const Projects = lazy(() => import('./pages/Projects'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
const Freelance = lazy(() => import('./pages/Freelance'))
const Contact = lazy(() => import('./pages/Contact'))
const Testimonial = lazy(() => import('./pages/Testimonial'))
const NotFound = lazy(() => import('./pages/NotFound'))
const UiPreview = lazy(() => import('./pages/UiPreview'))

export default function App() {
  return (
    <ThemeProvider>
      <CursorGlow />
      <WhatsAppButton />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/freelance" element={<Freelance />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/testimonial" element={<Testimonial />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="/ui-preview" element={<UiPreview />} />
        </Routes>
      </Suspense>
    </ThemeProvider>
  )
}
