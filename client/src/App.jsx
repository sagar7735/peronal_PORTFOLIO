import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './components/admin/ProtectedRoute'
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
const AdminLogin = lazy(() => import('./pages/admin/Login'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const ComingSoonAdmin = lazy(() => import('./pages/admin/ComingSoonAdmin'))

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CursorGlow />
        <WhatsAppButton />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
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

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<ComingSoonAdmin title="Profile Settings" />} />
              <Route path="skills" element={<ComingSoonAdmin title="Skills" />} />
              <Route path="experience" element={<ComingSoonAdmin title="Experience" />} />
              <Route path="projects" element={<ComingSoonAdmin title="Projects" />} />
              <Route path="services" element={<ComingSoonAdmin title="Services" />} />
              <Route path="freelance" element={<ComingSoonAdmin title="Applications" />} />
              <Route path="messages" element={<ComingSoonAdmin title="Messages" />} />
              <Route path="testimonials" element={<ComingSoonAdmin title="Testimonials" />} />
              <Route path="change-password" element={<ComingSoonAdmin title="Change Password" />} />
            </Route>
          </Routes>
        </Suspense>
      </ThemeProvider>
    </AuthProvider>
  )
}
