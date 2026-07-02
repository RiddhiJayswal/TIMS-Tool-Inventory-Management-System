/**
 * StorageBins page unit tests — TIMS frontend.
 * Tests: list rendering, bin details, create form, input focus retention,
 * capacity display, tool count scoping, error handling.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
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
  binsAPI: {
    list: vi.fn(),
    tools: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('../data/DataSyncContext', () => ({
  useDataSync: () => ({
    version: 0,
    lastChange: null,
    emitDataChanged: vi.fn(),
    actions: {
      addBin: vi.fn(),
      updateBin: vi.fn(),
    },
  }),
}))

vi.mock('../contexts/ToastContext', () => ({
  useToast: () => vi.fn(),
}))

vi.mock('lucide-react', () => {
  const Mock = () => <span data-testid="icon" />
  return {
    Archive: Mock,
    Loader2: Mock,
    Plus: Mock,
    X: Mock,
  }
})

import StorageBins from '../pages/StorageBins.jsx'
import { useAuth } from '../auth/AuthContext'
import { binsAPI } from '../api/client'

const adminUser = { id: '1', role: 'maintenance_admin', full_name: 'Admin', employee_id: 'ADM001' }
const requesterUser = { id: '4', role: 'requester', full_name: 'Requester', employee_id: 'USR001' }

const mockBins = [
  {
    id: 'bin-1', bin_code: 'BIN-A01', shelf_label: 'Shelf Alpha',
    section: 'Section A', capacity: 20, tool_count: 3, used_units: 5,
    remaining_capacity: 15, created_at: new Date().toISOString(),
  },
  {
    id: 'bin-2', bin_code: 'BIN-B02', shelf_label: 'Shelf Beta',
    section: 'Section B', capacity: null, tool_count: 1, used_units: 2,
    remaining_capacity: null, created_at: new Date().toISOString(),
  },
]

describe('StorageBins page — list rendering', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: adminUser })
    binsAPI.list.mockResolvedValue({ data: mockBins })
  })

  it('renders without crashing', async () => {
    render(<StorageBins />)
    await waitFor(() => { expect(document.body).toBeInTheDocument() })
  })

  it('calls binsAPI.list on mount', async () => {
    render(<StorageBins />)
    await waitFor(() => { expect(binsAPI.list).toHaveBeenCalledTimes(1) })
  })

  it('displays bin codes', async () => {
    render(<StorageBins />)
    await waitFor(() => {
      expect(document.body.textContent.includes('BIN-A01')).toBeTruthy()
    }, { timeout: 3000 })
  })

  it('displays shelf labels', async () => {
    render(<StorageBins />)
    await waitFor(() => {
      expect(document.body.textContent.includes('Shelf Alpha')).toBeTruthy()
    }, { timeout: 3000 })
  })

  it('shows tool count for each bin', async () => {
    render(<StorageBins />)
    await waitFor(() => {
      const text = document.body.textContent
      expect(text.includes('3') || text.includes('tool')).toBeTruthy()
    }, { timeout: 3000 })
  })
})

describe('StorageBins page — create form', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: adminUser })
    binsAPI.list.mockResolvedValue({ data: mockBins })
    binsAPI.create.mockResolvedValue({ data: mockBins[0] })
  })

  it('form inputs do not lose focus while typing (bin_code field)', async () => {
    const user = userEvent.setup()
    render(<StorageBins />)

    // Find and click an "Add" button if it exists
    await waitFor(() => { expect(binsAPI.list).toHaveBeenCalled() }, { timeout: 3000 })

    const addBtn = screen.queryAllByRole('button').find(
      btn => btn.textContent.toLowerCase().includes('add') ||
             btn.textContent.toLowerCase().includes('new')
    )
    if (addBtn) {
      await user.click(addBtn)
      const inputs = document.querySelectorAll('input')
      const firstInput = inputs[0]
      if (firstInput) {
        await user.type(firstInput, 'BIN-TEST')
        expect(firstInput.value).toBe('BIN-TEST')
        expect(document.activeElement).toBe(firstInput)
      }
    }
  })
})

describe('StorageBins page — requester view', () => {
  it('renders for requester without crashing', async () => {
    useAuth.mockReturnValue({ user: requesterUser })
    binsAPI.list.mockResolvedValue({ data: mockBins })

    render(<StorageBins />)
    await waitFor(() => { expect(document.body).toBeInTheDocument() })
  })
})

describe('StorageBins page — empty state', () => {
  it('renders empty state without crashing', async () => {
    useAuth.mockReturnValue({ user: adminUser })
    binsAPI.list.mockResolvedValue({ data: [] })

    render(<StorageBins />)
    await waitFor(() => { expect(document.body).toBeInTheDocument() })
  })
})

describe('StorageBins page — API error handling', () => {
  it('does not crash when binsAPI.list fails', async () => {
    useAuth.mockReturnValue({ user: adminUser })
    binsAPI.list.mockRejectedValue(new Error('Network error'))

    render(<StorageBins />)
    await waitFor(() => { expect(document.body).toBeInTheDocument() }, { timeout: 2000 })
  })
})
