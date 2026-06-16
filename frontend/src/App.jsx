import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { DataSyncProvider } from './data/DataSyncContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Tools from './pages/Tools'
import ToolDetail from './pages/ToolDetail'
import Requisitions from './pages/Requisitions'
import Approvals from './pages/Approvals'
import Issuance from './pages/Issuance'
import Returns from './pages/Returns'
import Calibration from './pages/Calibration'
import Reports from './pages/Reports'
import Users from './pages/Users'
import StorageBins from './pages/StorageBins'
import Layout from './components/Layout'

function StorageBinsPlaceholder() {
  return (
    <Layout>
      <div className="p-8 text-gray-500 text-sm">Storage Bins — coming in next prompt</div>
    </Layout>
  )
}

const MAINTENANCE_ROLES = ['maintenance_staff', 'maintenance_admin']
const ADMIN_ROLES = ['maintenance_admin']
const DEPT_HEAD_ROLES = ['dept_head', 'maintenance_admin']

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <DataSyncProvider>
          <BrowserRouter>
            <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />

            <Route path="/tools" element={
              <ProtectedRoute><Tools /></ProtectedRoute>
            } />
            <Route path="/tools/:id" element={
              <ProtectedRoute><ToolDetail /></ProtectedRoute>
            } />

            <Route path="/requisitions" element={
              <ProtectedRoute><Requisitions /></ProtectedRoute>
            } />

            <Route path="/approvals" element={
              <ProtectedRoute roles={DEPT_HEAD_ROLES}><Approvals /></ProtectedRoute>
            } />

            <Route path="/issuance" element={
              <ProtectedRoute roles={MAINTENANCE_ROLES}><Issuance /></ProtectedRoute>
            } />

            <Route path="/returns" element={
              <ProtectedRoute roles={MAINTENANCE_ROLES}><Returns /></ProtectedRoute>
            } />

            <Route path="/calibration" element={
              <ProtectedRoute roles={ADMIN_ROLES}><Calibration /></ProtectedRoute>
            } />

            <Route path="/reports" element={
              <ProtectedRoute roles={MAINTENANCE_ROLES}><Reports /></ProtectedRoute>
            } />

            <Route path="/bins" element={
              <ProtectedRoute roles={ADMIN_ROLES}><StorageBins /></ProtectedRoute>
            } />

            <Route path="/users" element={
              <ProtectedRoute roles={ADMIN_ROLES}><Users /></ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </DataSyncProvider>
      </ToastProvider>
    </AuthProvider>
  )
}
