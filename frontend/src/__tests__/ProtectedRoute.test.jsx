/**
 * ProtectedRoute component tests — TIMS frontend.
 * The real ProtectedRoute uses children (not Outlet) and a `roles` prop (not allowedRoles).
 * This test file corrects both assumptions.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('react-router-dom', () => ({
  Navigate: ({ to }) => <div data-testid="navigate-to">{to}</div>,
  useLocation: () => ({ pathname: '/dashboard' }),
}))

vi.mock('../auth/AuthContext', () => ({
  useAuth: vi.fn(),
}))

import ProtectedRoute from '../components/ProtectedRoute.jsx'
import { useAuth } from '../auth/AuthContext'

const ChildContent = () => <div data-testid="outlet">Protected Content</div>

describe('ProtectedRoute — unauthenticated', () => {
  it('redirects to /login when user is null', () => {
    useAuth.mockReturnValue({ user: null, loading: false })
    render(<ProtectedRoute><ChildContent /></ProtectedRoute>)
    // Redirects — no outlet visible
    expect(screen.queryByTestId('outlet')).toBeNull()
  })
})

describe('ProtectedRoute — authenticated', () => {
  it('renders children when user is authenticated with no role restriction', () => {
    useAuth.mockReturnValue({
      user: { id: '1', role: 'maintenance_admin', employee_id: 'ADM001' },
      loading: false,
    })
    render(<ProtectedRoute><ChildContent /></ProtectedRoute>)
    expect(screen.getByTestId('outlet')).toBeInTheDocument()
  })
})

describe('ProtectedRoute — role guard', () => {
  it('blocks access when role does not match (shows access denied)', () => {
    useAuth.mockReturnValue({
      user: { id: '2', role: 'requester', employee_id: 'USR001' },
      loading: false,
    })
    render(
      <ProtectedRoute roles={['maintenance_admin']}>
        <ChildContent />
      </ProtectedRoute>
    )
    // Access denied — outlet should NOT be visible
    expect(screen.queryByTestId('outlet')).toBeNull()
    // Access denied message should be shown
    expect(screen.getByText(/access denied/i)).toBeInTheDocument()
  })

  it('renders children when role matches', () => {
    useAuth.mockReturnValue({
      user: { id: '1', role: 'maintenance_admin', employee_id: 'ADM001' },
      loading: false,
    })
    render(
      <ProtectedRoute roles={['maintenance_admin']}>
        <ChildContent />
      </ProtectedRoute>
    )
    expect(screen.getByTestId('outlet')).toBeInTheDocument()
  })

  it('renders children when multiple roles include user role', () => {
    useAuth.mockReturnValue({
      user: { id: '3', role: 'maintenance_staff', employee_id: 'STF001' },
      loading: false,
    })
    render(
      <ProtectedRoute roles={['maintenance_admin', 'maintenance_staff']}>
        <ChildContent />
      </ProtectedRoute>
    )
    expect(screen.getByTestId('outlet')).toBeInTheDocument()
  })
})
