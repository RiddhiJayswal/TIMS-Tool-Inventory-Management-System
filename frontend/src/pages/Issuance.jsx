import { useState, useEffect } from 'react'
import { ArrowRightCircle, Loader2, X } from 'lucide-react'
import { requisitionsAPI, issuanceAPI } from '../api/client'
import { useToast } from '../contexts/ToastContext'
import Layout from '../components/Layout'

const ACTIVE_TABS = [
  { value: 'all', label: 'All' },
  { value: 'on_time', label: 'On Time' },
  { value: 'due_today', label: 'Due Today' },
  { value: 'overdue', label: 'Overdue' },
]

function getDaysLeft(expectedReturnDate) {
  const due = new Date(expectedReturnDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  return Math.ceil((due - today) / 86400000)
}

function DaysLeftCell({ daysLeft }) {
  if (daysLeft > 3)
    return <span className="text-xs font-medium text-green-600">{daysLeft}d left</span>
  if (daysLeft > 0)
    return <span className="text-xs font-medium text-amber-600">{daysLeft}d left</span>
  if (daysLeft === 0)
    return <span className="text-xs font-semibold text-amber-700">Due Today</span>
  return <span className="text-xs font-bold text-red-600">{Math.abs(daysLeft)}d OVERDUE</span>
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function IssueModal({ req, onClose, onIssued }) {
  const addToast = useToast()
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  const handleIssue = async () => {
    setErr('')
    setLoading(true)
    try {
      await issuanceAPI.issue({ requisition_id: req.id })
      addToast(`Tool '${req.tool_name}' issued to ${req.requester_name || req.requester_dept}`)
      onIssued()
      onClose()
    } catch (ex) {
      setErr(ex.response?.data?.detail || 'Issuance failed')
    } finally {
      setLoading(false)
    }
  }

  const rows = [
    ['Tool', req.tool_name],
    ['Requisition', req.requisition_number],
    ['Issued To', `${req.requester_name || '—'} (${req.requester_dept})`],
    ['Quantity', req.quantity_requested],
    ['Purpose', req.purpose_of_job],
    ['Expected Return', fmtDate(req.to_date)],
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Confirm Issuance</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="space-y-3 text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <span className="text-gray-500 shrink-0 w-32">{label}</span>
                <span className="text-gray-900 font-medium text-right break-words">{value}</span>
              </div>
            ))}
          </div>

          {err && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {err}
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
            Stock will be reduced immediately. Depreciated value will be snapshotted at the time of issuance.
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleIssue}
            disabled={loading}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg flex items-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Issuing…' : 'Issue Tool'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Issuance() {
  const [approved, setApproved] = useState([])
  const [active, setActive] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [issuingReq, setIssuingReq] = useState(null)
  const [activeTab, setActiveTab] = useState('all')

  const loadData = async () => {
    setError('')
    try {
      const [approvedRes, activeRes] = await Promise.all([
        requisitionsAPI.list({ status: 'approved' }),
        issuanceAPI.list({ status: 'open' }),
      ])
      setApproved(approvedRes.data)
      setActive(activeRes.data)
    } catch (ex) {
      setError(ex.response?.data?.detail || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const filteredActive = active.filter((log) => {
    if (!log.expected_return_date) return activeTab === 'all'
    const dl = getDaysLeft(log.expected_return_date)
    if (activeTab === 'on_time') return dl > 0
    if (activeTab === 'due_today') return dl === 0
    if (activeTab === 'overdue') return dl < 0
    return true
  })

  const overdueCount = active.filter(
    (l) => l.expected_return_date && getDaysLeft(l.expected_return_date) < 0
  ).length

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 gap-2 text-gray-400">
          <Loader2 size={18} className="animate-spin" /> Loading…
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-gray-900">Issue Tools</h1>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Section A — Approved Queue */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Approved — Ready to Issue
            </h2>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
              {approved.length} pending
            </span>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {approved.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-gray-400 gap-2">
                <ArrowRightCircle size={28} className="opacity-30" />
                <p className="text-sm">No approved requests in queue</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['Req #', 'Tool', 'Qty', 'Requested By', 'Dept', 'Purpose', 'From', 'To', 'Action'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {approved.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{req.requisition_number}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{req.tool_name}</td>
                        <td className="px-4 py-3 text-gray-600">{req.quantity_requested}</td>
                        <td className="px-4 py-3 text-gray-700">{req.requester_name || '—'}</td>
                        <td className="px-4 py-3 text-gray-500">{req.requester_dept}</td>
                        <td className="px-4 py-3 text-gray-500 max-w-xs truncate" title={req.purpose_of_job}>
                          {req.purpose_of_job}
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(req.from_date)}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(req.to_date)}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setIssuingReq(req)}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                          >
                            Issue Tool
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Section B — Active Issuances Board */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Active Issuances
            </h2>
            {overdueCount > 0 && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                {overdueCount} overdue
              </span>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-3">
            {ACTIVE_TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => setActiveTab(t.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === t.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {filteredActive.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
                No active issuances{activeTab !== 'all' ? ` in "${ACTIVE_TABS.find(t => t.value === activeTab)?.label}" category` : ''}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['Tool', 'Borrower', 'Dept', 'Qty', 'Issued On', 'Due Date', 'Status'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredActive.map((log) => {
                      const dl = log.expected_return_date ? getDaysLeft(log.expected_return_date) : null
                      const isOverdue = dl !== null && dl < 0
                      return (
                        <tr
                          key={log.id}
                          className={`transition-colors ${isOverdue ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}
                        >
                          <td className="px-4 py-3 font-medium text-gray-900">{log.tool_name}</td>
                          <td className="px-4 py-3 text-gray-700">{log.borrower_name || '—'}</td>
                          <td className="px-4 py-3 text-gray-500">{log.borrower_dept || '—'}</td>
                          <td className="px-4 py-3">{log.quantity_issued}</td>
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(log.issued_at)}</td>
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(log.expected_return_date)}</td>
                          <td className="px-4 py-3">
                            {dl !== null ? <DaysLeftCell daysLeft={dl} /> : <span className="text-gray-400">—</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {issuingReq && (
        <IssueModal
          req={issuingReq}
          onClose={() => setIssuingReq(null)}
          onIssued={loadData}
        />
      )}
    </Layout>
  )
}
