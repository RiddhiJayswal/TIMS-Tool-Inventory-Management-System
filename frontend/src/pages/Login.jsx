import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Wrench } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()

  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Already logged in
  if (user) {
    navigate('/dashboard', { replace: true })
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(employeeId.trim(), password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed. Check your credentials.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1e2d3d' }}>
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-500 rounded-xl mb-4">
            <Wrench size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">TIMS</h1>
          <p className="text-slate-400 text-sm mt-1">Maintenance Tool Inventory System</p>
          <p className="text-slate-500 text-xs mt-0.5">UltraTech Cement</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Employee ID */}
            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1.5">
                Employee ID
              </label>
              <input
                id="employeeId"
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. USR001"
                required
                autoFocus
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-shadow"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-3.5 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
