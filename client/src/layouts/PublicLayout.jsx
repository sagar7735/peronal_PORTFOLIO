import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { analyticsApi } from '../services/publicApi'

export default function PublicLayout() {
  const location = useLocation()

  useEffect(() => {
    analyticsApi.track(location.pathname).catch(() => {})
  }, [location.pathname])

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
