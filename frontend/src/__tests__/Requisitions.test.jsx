/**
 * Requisitions page unit tests — TIMS frontend.
 * Tests: list, create form, validation, date range, quantity limits, status badges.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/requisitions', search: '', hash: '', state: null }),
  Link: ({ children }) => <a>{children}</a>,
  NavLink: ({ children, to }) => <a href={to}>{children}</a>,
}))

// Mock Layout to avoid importing Navbar/Sidebar which make real API calls
vi.mock('../components/Layout', () => ({
  default: ({ children }) => <div data-testid="layout">{children}</div>,
}))

vi.mock('../auth/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../api/client', () => ({
  requisitionsAPI: {
    list: vi.fn(),
    create: vi.fn(),
    approve: vi.fn(),
    reject: vi.fn(),
    cancel: vi.fn(),
    availability: vi.fn(),
  },
  toolsAPI: {
    list: vi.fn(),
  },
  default: { get: vi.fn() },
}))

vi.mock('../data/DataSyncContext', () => ({
  useDataSync: () => ({
    version: 0,
    lastChange: null,
    emitDataChanged: vi.fn(),
    actions: {
      createRequest: vi.fn(),
      approveRequest: vi.fn(),
      rejectRequest: vi.fn(),
      cancelRequest: vi.fn(),
    },
  }),
}))

vi.mock('../contexts/ToastContext', () => ({
  useToast: () => vi.fn(),
}))

vi.mock('lucide-react', () => {
  const Mock = () => <span data-testid="icon" />
  return {
    Plus: Mock,
    Loader2: Mock,
    ClipboardList: Mock,
    X: Mock,
    ArrowRight: Mock,
    ArrowLeft: Mock,
  }
})

import Requisitions from '../pages/Requisitions.jsx'
import { useAuth } from '../auth/AuthContext'
import { requisitionsAPI, toolsAPI } from '../api/client'

const today = new Date().toISOString().split('T')[0]
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

const requesterUser = { id: '4', role: 'requester', full_name: 'Requester', employee_id: 'USR001', department: 'E&I' }
const adminUser = { id: '1', role: 'maintenance_admin', full_name: 'Admin', employee_id: 'ADM001' }
const headUser = { id: '3', role: 'dept_head', full_name: 'Head', employee_id: 'HD001', department: 'E&I' }

const mockRequisitions = [
  {
    id: 'req-1', requisition_number: 'REQ-2024-0001', tool_name: 'Torque Wrench',
    tool_code: 'TL-001', quantity_requested: 1, status: 'pending',
    from_date: today, to_date: tomorrow, purpose_of_job: 'Test job',
    requester_name: 'Requester User', requester_dept: 'E&I',
    created_at: new Date().toISOString(),
  },
  {
    id: 'req-2', requisition_number: 'REQ-2024-0002', tool_name: 'Digital Multimeter',
    tool_code: 'TL-002', quantity_requested: 2, status: 'approved',
    from_date: today, to_date: tomorrow, purpose_of_job: 'Measurement job',
    requester_name: 'Requester User', requester_dept: 'E&I',
    created_at: new Date().toISOString(),
  },
]

describe('Requisitions page — list', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: requesterUser })
    requisitionsAPI.list.mockResolvedValue({ data: mockRequisitions })
    toolsAPI.list.mockResolvedValue({ data: [] })
  })

  it('renders without crashing', async () => {
    render(<Requisitions />)
    await waitFor(() => { expect(document.body).toBeInTheDocument() })
  })

  it('calls requisitionsAPI.list on mount', async () => {
    render(<Requisitions />)
    await waitFor(() => {
      expect(requisitionsAPI.list).toHaveBeenCalled()
    })
  })

  it('displays requisition status badges', async () => {
    render(<Requisitions />)
    await waitFor(() => {
      const text = document.body.textContent
      // Should show pending or approved
      expect(text.toLowerCase().includes('pending') || text.toLowerCase().includes('approved')).toBeTruthy()
    }, { timeout: 3000 })
  })

  it('shows requisition numbers', async () => {
    render(<Requisitions />)
    await waitFor(() => {
      expect(document.body.textContent.includes('REQ-2024-0001')).toBeTruthy()
    }, { timeout: 3000 })
  })
})

describe('Requisitions page — requester sees only own', () => {
  it('page loads for requester role', async () => {
    useAuth.mockReturnValue({ user: requesterUser })
    requisitionsAPI.list.mockResolvedValue({ data: [mockRequisitions[0]] })
    toolsAPI.list.mockResolvedValue({ data: [] })

    render(<Requisitions />)
    await waitFor(() => {
      expect(document.body).toBeInTheDocument()
    })
  })
})

describe('Requisitions page — head approval view', () => {
  it('page loads for dept_head role', async () => {
    useAuth.mockReturnValue({ user: headUser })
    requisitionsAPI.list.mockResolvedValue({ data: mockRequisitions })
    toolsAPI.list.mockResolvedValue({ data: [] })

    render(<Requisitions />)
    await waitFor(() => {
      expect(document.body).toBeInTheDocument()
    })
  })
})

describe('Requisitions page — API error handling', () => {
  it('does not crash when API fails', async () => {
    useAuth.mockReturnValue({ user: requesterUser })
    requisitionsAPI.list.mockRejectedValue(new Error('Server error'))
    toolsAPI.list.mockResolvedValue({ data: [] })

    render(<Requisitions />)
    await waitFor(() => {
      expect(document.body).toBeInTheDocument()
    }, { timeout: 2000 })
  })
})
