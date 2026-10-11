import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/adminApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    try {
      const res = await authApi.me()
      setAdmin(res.data?.data || null)
    } catch {
      setAdmin(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMe() }, [fetchMe])

  const login = async (email, password) => {
    const res = await authApi.login({ email, password })
    setAdmin(res.data?.data || null)
    return res.data
  }

  const logout = async () => {
    try { await authApi.logout() } catch {}
    setAdmin(null)
  }

  return (
    <AuthContext.Provider value={{admin, loading, login, logout, refetch: fetchMe}}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
