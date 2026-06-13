import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Access Denied</h2>
          <p className="text-gray-500 mt-2">You don't have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return children
}
