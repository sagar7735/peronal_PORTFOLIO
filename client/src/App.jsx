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
const AdminProfile = lazy(() => import('./pages/admin/ProfileSettings'))
const AdminSkills = lazy(() => import('./pages/admin/Skills'))
const AdminExperience = lazy(() => import('./pages/admin/Experience'))
const AdminProjects = lazy(() => import('./pages/admin/Projects'))
const AdminServices = lazy(() => import('./pages/admin/Services'))
const AdminFreelance = lazy(() => import('./pages/admin/FreelanceApplications'))
const AdminMessages = lazy(() => import('./pages/admin/Messages'))
const AdminTestimonials = lazy(() => import('./pages/admin/Testimonials'))
const AdminChangePassword = lazy(() => import('./pages/admin/ChangePassword'))

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
              <Route path="profile" element={<AdminProfile />} />
              <Route path="skills" element={<AdminSkills />} />
              <Route path="experience" element={<AdminExperience />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="freelance" element={<AdminFreelance />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="testimonials" element={<AdminTestimonials />} />
              <Route path="change-password" element={<AdminChangePassword />} />
            </Route>
          </Routes>
        </Suspense>
      </ThemeProvider>
    </AuthProvider>
  )
}
