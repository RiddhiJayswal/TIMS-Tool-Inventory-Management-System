import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('tims_user')
    const token = localStorage.getItem('tims_token')
    if (!stored || !token) {
      setLoading(false)
      return
    }
    setUser(JSON.parse(stored))
    authAPI.me()
      .then((res) => {
        localStorage.setItem('tims_user', JSON.stringify(res.data))
        setUser(res.data)
      })
      .catch(() => {
        localStorage.removeItem('tims_token')
        localStorage.removeItem('tims_user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (employee_id, password) => {
    const res = await authAPI.login(employee_id, password)
    const { access_token, user: userData } = res.data
    localStorage.setItem('tims_token', access_token)
    localStorage.setItem('tims_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const logout = async () => {
    try { await authAPI.logout() } catch {}
    localStorage.removeItem('tims_token')
    localStorage.removeItem('tims_user')
    setUser(null)
  }

  const isAdmin = user?.role === 'maintenance_admin'
  const isMaintenance = ['maintenance_admin', 'maintenance_staff'].includes(user?.role)
  const isDeptHead = ['maintenance_admin', 'dept_head'].includes(user?.role)

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isMaintenance, isDeptHead }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
