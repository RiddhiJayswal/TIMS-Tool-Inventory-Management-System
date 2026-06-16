import { useState, useEffect } from 'react'
import { CheckSquare, Loader2, X } from 'lucide-react'
import { requisitionsAPI } from '../api/client'
import { useDataSync } from '../data/DataSyncContext'
import { useToast } from '../contexts/ToastContext'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import ConfirmDialog from '../components/ConfirmDialog'

const TABS = [
  { value: 'pending',  label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function ModalOverlay({ onClose, children }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      {children}
    </div>
  )
}

export default function Approvals() {
  const addToast = useToast()
  const { actions, version } = useDataSync()
  const [reqs, setReqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('pending')

  // Approve
  const [approving, setApproving] = useState(null)
  const [approveLoading, setApproveLoading] = useState(false)

  // Reject
  const [rejecting, setRejecting] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectLoading, setRejectLoading] = useState(false)
  const [rejectErr, setRejectErr] = useState('')

  const loadReqs = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await requisitionsAPI.list({ status: tab })
      setReqs(res.data)
    } catch (ex) {
      setError(ex.response?.data?.detail || 'Failed to load requisitions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadReqs() }, [tab, version])

  const handleApprove = async () => {
    setApproveLoading(true)
    try {
      await actions.approveRequest(approving.id)
      addToast(`Requisition ${approving.requisition_number} approved`)
      setApproving(null)
      loadReqs()
    } catch (ex) {
      addToast(ex.response?.data?.detail || 'Approval failed', 'error')
    } finally {
      setApproveLoading(false)
    }
  }

  const handleReject = async () => {
    setRejectErr('')
    if (!rejectReason.trim()) { setRejectErr('Rejection reason is required'); return }
    setRejectLoading(true)
    try {
      await actions.rejectRequest(rejecting.id, rejectReason.trim())
      addToast(`Requisition ${rejecting.requisition_number} rejected`)
      setRejecting(null)
      setRejectReason('')
      loadReqs()
    } catch (ex) {
      addToast(ex.response?.data?.detail || 'Rejection failed', 'error')
    } finally {
      setRejectLoading(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Approvals</h1>
          <p className="text-sm text-gray-500 mt-0.5">Review and action tool requisitions from your department</p>
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

        {/* Tabs */}
        <div className="tab-shell w-fit">
          {TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ease-in-out ${tab === t.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="table-shell">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
              <Loader2 size={16} className="animate-spin" /> Loading…
            </div>
          ) : reqs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <CheckSquare size={32} className="mb-3 opacity-40" />
              <p className="text-sm">No {tab} requests to review.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Req #', 'Tool', 'Qty', 'Requested By', 'Purpose', 'From', 'To', 'Submitted', ...(tab === 'pending' ? ['Actions'] : ['Status'])].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reqs.map(req => (
                    <tr key={req.id}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{req.requisition_number}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{req.tool_name}</td>
                      <td className="px-4 py-3 text-gray-600">{req.quantity_requested}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{req.requester_name || '—'}</div>
                        <div className="text-xs text-gray-400">{req.requester_dept}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-xs truncate" title={req.purpose_of_job}>{req.purpose_of_job}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(req.from_date)}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(req.to_date)}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{fmtDate(req.created_at)}</td>
                      {tab === 'pending' ? (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setApproving(req)}
                              className="btn-soft bg-green-600 text-white hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => { setRejecting(req); setRejectReason(''); setRejectErr('') }}
                              className="btn-soft border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      ) : (
                        <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Approve Dialog */}
      <ConfirmDialog
        open={!!approving}
        title="Approve Requisition"
        message={approving ? `Approve request for '${approving.tool_name}' (×${approving.quantity_requested}) by ${approving.requester_name} (${approving.requester_dept})?` : ''}
        confirmLabel="Approve"
        confirmStyle="green"
        loading={approveLoading}
        onConfirm={handleApprove}
        onCancel={() => setApproving(null)}
      />

      {/* Reject Modal */}
      {rejecting && (
        <ModalOverlay onClose={() => setRejecting(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Reject Requisition</h2>
              <button onClick={() => setRejecting(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                Rejecting <strong>{rejecting.requisition_number}</strong> — {rejecting.tool_name} requested by {rejecting.requester_name}.
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason for rejection <span className="text-red-500">*</span></label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Provide a clear reason so the requester can understand the decision…"
                className="input-control resize-none focus:ring-red-400"
                autoFocus
              />
              {rejectErr && <p className="text-xs text-red-600 mt-1.5">{rejectErr}</p>}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setRejecting(null)} className="btn-secondary">Cancel</button>
              <button
                onClick={handleReject}
                disabled={rejectLoading}
                className="btn-danger"
              >
                {rejectLoading && <Loader2 size={14} className="animate-spin" />}
                {rejectLoading ? 'Rejecting…' : 'Reject Request'}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </Layout>
  )
}
