import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { PageLoader } from '../ui/Loader'

export default function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />
  if (!admin) return <Navigate to="/admin/login" state={{from: location}} replace />
  return children
}
