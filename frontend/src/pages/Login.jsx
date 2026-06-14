import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { authAPI } from '../api/client'
import BrandLogo from '../components/BrandLogo'

const emptySignup = {
  employee_id: '',
  full_name: '',
  email: '',
  department: '',
  password: '',
}

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState('signin')
  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [signup, setSignup] = useState(emptySignup)
  const [forgot, setForgot] = useState({ employee_id: '', email: '' })
  const [reset, setReset] = useState({ token: '', new_password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    navigate('/dashboard', { replace: true })
    return null
  }

  const clearFeedback = () => {
    setError('')
    setMessage('')
  }

  const switchMode = (nextMode) => {
    clearFeedback()
    setMode(nextMode)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearFeedback()
    setLoading(true)
    try {
      await login(employeeId.trim(), password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check your employee ID and password.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    clearFeedback()
    setLoading(true)
    try {
      await authAPI.signup(signup)
      setEmployeeId(signup.employee_id.trim().toUpperCase())
      setPassword('')
      setSignup(emptySignup)
      setMode('signin')
      setMessage('Account created. Sign in with your new employee ID and password.')
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(Array.isArray(detail) ? detail.map(item => item.msg).join(', ') : detail || 'Could not create account.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    clearFeedback()
    setLoading(true)
    try {
      const res = await authAPI.forgotPassword(forgot)
      setReset(prev => ({ ...prev, token: '' }))
      setMessage(res.data.message)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not start password reset.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    clearFeedback()
    setLoading(true)
    try {
      await authAPI.resetPassword(reset)
      setReset({ token: '', new_password: '' })
      setMode('signin')
      setMessage('Password reset successfully. Sign in with the new password.')
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(Array.isArray(detail) ? detail.map(item => item.msg).join(', ') : detail || 'Could not reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-8">
      <div className="w-full max-w-xl">
        <section className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 flex flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <BrandLogo className="h-20 w-40" compact />
            <div className="text-right">
              <h1 className="text-xl font-bold text-slate-900">TIMS</h1>
              <p className="text-sm text-slate-500">Maintenance Tool Inventory System</p>
            </div>
          </div>

          <div className="grid grid-cols-3 bg-gray-100 rounded-lg p-1 mt-6">
            {[
              ['signin', 'Sign In'],
              ['signup', 'Sign Up'],
              ['forgot', 'Forgot'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => switchMode(key)}
                className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                  mode === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {message && (
            <div className="mt-5 bg-green-50 border border-green-200 rounded-lg px-3.5 py-2.5">
              <p className="text-sm text-green-700">{message}</p>
            </div>
          )}
          {error && (
            <div className="mt-5 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {mode === 'signin' && (
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <Input label="Employee ID" value={employeeId} onChange={setEmployeeId} placeholder="e.g. ADM001" autoFocus />
              <PasswordInput
                label="Password"
                value={password}
                onChange={setPassword}
                show={showPassword}
                setShow={setShowPassword}
              />
              <button className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="grid sm:grid-cols-2 gap-4 mt-6">
              <Input label="Employee ID" value={signup.employee_id} onChange={(v) => setSignup({ ...signup, employee_id: v })} placeholder="e.g. USR002" autoFocus />
              <Input label="Full Name" value={signup.full_name} onChange={(v) => setSignup({ ...signup, full_name: v })} placeholder="Your name" />
              <Input label="Email" type="email" value={signup.email} onChange={(v) => setSignup({ ...signup, email: v })} placeholder="name@ultratech.com" />
              <Input label="Department" value={signup.department} onChange={(v) => setSignup({ ...signup, department: v })} placeholder="e.g. E&I" />
              <div className="sm:col-span-2">
                <PasswordInput label="Password" value={signup.password} onChange={(v) => setSignup({ ...signup, password: v })} show={showPassword} setShow={setShowPassword} />
                <p className="text-xs text-slate-500 mt-1.5">Use 8+ characters with uppercase, lowercase, number, and special character.</p>
              </div>
              <button className="sm:col-span-2 w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Requester Account'}
              </button>
            </form>
          )}

          {mode === 'forgot' && (
            <div className="mt-6 space-y-6">
              <form onSubmit={handleForgot} className="space-y-4">
                <Input label="Employee ID" value={forgot.employee_id} onChange={(v) => setForgot({ ...forgot, employee_id: v })} placeholder="e.g. USR001" autoFocus />
                <Input label="Registered Email" type="email" value={forgot.email} onChange={(v) => setForgot({ ...forgot, email: v })} placeholder="user@ultratech.com" />
                <button className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors" disabled={loading}>
                  {loading ? 'Sending instructions...' : 'Send Reset Instructions'}
                </button>
              </form>
              <form onSubmit={handleReset} className="space-y-4 border-t border-gray-100 pt-5">
                <Input label="Reset Token" value={reset.token} onChange={(v) => setReset({ ...reset, token: v })} placeholder="Paste token from your email" />
                <PasswordInput label="New Password" value={reset.new_password} onChange={(v) => setReset({ ...reset, new_password: v })} show={showPassword} setShow={setShowPassword} />
                <button className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors" disabled={loading}>
                  {loading ? 'Resetting password...' : 'Reset Password'}
                </button>
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function Input({ label, value, onChange, type = 'text', placeholder, autoFocus = false }) {
  const id = label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        autoFocus={autoFocus}
        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-shadow"
      />
    </div>
  )
}

function PasswordInput({ label, value, onChange, show, setShow }) {
  const id = label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter password"
          required
          className="w-full px-3.5 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-shadow"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  )
}
