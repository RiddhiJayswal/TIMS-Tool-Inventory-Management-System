import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function Placeholder({ text }) {
  return (
    <Layout>
      <div className="p-8 text-gray-500 text-sm">{text} — coming in next prompt</div>
    </Layout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* Placeholder routes so sidebar links don't 404 */}
          <Route path="/tools" element={<ProtectedRoute><Placeholder text="Tools page" /></ProtectedRoute>} />
          <Route path="/requisitions" element={<ProtectedRoute><Placeholder text="Requisitions" /></ProtectedRoute>} />
          <Route path="/approvals" element={<ProtectedRoute><Placeholder text="Approvals" /></ProtectedRoute>} />
          <Route path="/issuance" element={<ProtectedRoute><Placeholder text="Issue Tool" /></ProtectedRoute>} />
          <Route path="/returns" element={<ProtectedRoute><Placeholder text="Returns" /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Placeholder text="Reports" /></ProtectedRoute>} />
          <Route path="/calibration" element={<ProtectedRoute><Placeholder text="Calibration" /></ProtectedRoute>} />
          <Route path="/bins" element={<ProtectedRoute><Placeholder text="Storage Bins" /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
