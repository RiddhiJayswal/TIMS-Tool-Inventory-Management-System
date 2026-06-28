import { useState, useEffect } from 'react'
import { useLocation as useRouterLocation } from 'react-router-dom'
import { Plus, Loader2, ClipboardList, X, ArrowRight, ArrowLeft } from 'lucide-react'
import { requisitionsAPI } from '../api/client'
import { useDataSync } from '../data/DataSyncContext'
import { useToast } from '../contexts/ToastContext'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import SearchableSelect from '../components/SearchableSelect'

const TABS = [
  { value: '',          label: 'All' },
  { value: 'pending',   label: 'Pending' },
  { value: 'approved',  label: 'Approved' },
  { value: 'issued',    label: 'Issued' },
  { value: 'returned',  label: 'Returned' },
  { value: 'rejected',  label: 'Rejected' },
]

const TODAY = new Date().toISOString().split('T')[0]

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {children}
    </div>
  )
}

function RequisitionModal({ prefillTool, onClose, onCreated }) {
  const addToast = useToast()
  const { actions } = useDataSync()
  const [step, setStep] = useState(prefillTool ? 2 : 1)
  const [selectedTool, setSelectedTool] = useState(prefillTool || null)
  const [quantity, setQuantity] = useState(1)
  const [purpose, setPurpose] = useState('')
  const [fromDate, setFromDate] = useState(TODAY)
  const [toDate, setToDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState('')
  const [availability, setAvailability] = useState(null)
  const [availabilityLoading, setAvailabilityLoading] = useState(false)

  const handleToolSelect = (tool) => {
    setSelectedTool(tool)
    setAvailability(null)
    if (tool) setStep(2)
  }

  useEffect(() => {
    if (!selectedTool || !fromDate || !toDate || toDate < fromDate) {
      setAvailability(null)
      return
    }
    let cancelled = false
    setAvailabilityLoading(true)
    requisitionsAPI.availability({
      tool_id: selectedTool.id,
      from_date: fromDate,
      to_date: toDate,
      quantity: Number(quantity) || 1,
    })
      .then((res) => { if (!cancelled) setAvailability(res.data) })
      .catch(() => { if (!cancelled) setAvailability(null) })
      .finally(() => { if (!cancelled) setAvailabilityLoading(false) })
    return () => { cancelled = true }
  }, [selectedTool, fromDate, toDate, quantity])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    if (!selectedTool) { setErr('Please select a tool'); return }
    if (quantity < 1) { setErr('Quantity must be at least 1'); return }
    const maxAvailable = availability?.available_quantity ?? selectedTool.available_quantity
    if (quantity > maxAvailable) { setErr(`Max available is ${maxAvailable}`); return }
    if (purpose.trim().length < 5) { setErr('Purpose must be at least 5 characters'); return }
    if (!fromDate) { setErr('From date is required'); return }
    if (!toDate) { setErr('To date is required'); return }
    if (toDate <= fromDate) { setErr('To date must be after From date'); return }

    setSubmitting(true)
    try {
      const res = await actions.createRequest({
        tool_id: selectedTool.id,
        quantity_requested: Number(quantity),
        purpose_of_job: purpose.trim(),
        from_date: fromDate,
        to_date: toDate,
      })
      addToast(`Request ${res.data.requisition_number} submitted successfully`)
      onCreated()
      onClose()
    } catch (ex) {
      setErr(ex.response?.data?.detail || 'Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls = 'input-control'
  const maxAvailable = availability?.available_quantity ?? selectedTool?.available_quantity ?? 0

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">New Requisition</h2>
            <p className="text-xs text-gray-400 mt-0.5">Step {step} of 2 — {step === 1 ? 'Select Tool' : 'Fill Details'}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="px-6 py-5">
          {step === 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search and select a tool</label>
              <SearchableSelect value={selectedTool} onChange={handleToolSelect} placeholder="Type tool name or code…" />
              <p className="text-xs text-gray-400 mt-2">Tools that are out of stock, damaged, or overdue for calibration cannot be selected.</p>
            </div>
          )}

          {step === 2 && selectedTool && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selected Tool Summary */}
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-blue-900">{selectedTool.name}</div>
                  <div className="text-xs text-blue-600 mt-0.5">
                    {selectedTool.tool_code} · {maxAvailable} available
                    {availabilityLoading ? ' (checking dates...)' : ''}
                  </div>
                </div>
                {!prefillTool && (
                  <button type="button" onClick={() => { setStep(1); setSelectedTool(null) }}
                    className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">
                    <ArrowLeft size={12} /> Change
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity</label>
                <input
                  type="number"
                  min={1}
                  max={maxAvailable}
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  className={inputCls}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Max: {maxAvailable} available for the selected dates
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Purpose of Job</label>
                <textarea
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  rows={3}
                  required
                  placeholder="Describe the work / job this tool is needed for…"
                  className={inputCls + ' resize-none'}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">From Date</label>
                  <input type="date" min={TODAY} value={fromDate} onChange={e => setFromDate(e.target.value)} className={inputCls} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">To Date</label>
                  <input type="date" min={fromDate || TODAY} value={toDate} onChange={e => setToDate(e.target.value)} className={inputCls} required />
                </div>
              </div>

              {err && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{err}</div>
              )}
            </form>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          {step === 1 && (
            <button
              disabled={!selectedTool}
              onClick={() => setStep(2)}
              className="btn-blue"
            >
              Next <ArrowRight size={14} />
            </button>
          )}
          {step === 2 && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {submitting ? 'Submitting…' : 'Submit Request'}
            </button>
          )}
        </div>
      </div>
    </ModalOverlay>
  )
}

function DetailModal({ req, onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">{req.requisition_number}</h2>
          <div className="flex items-center gap-3">
            <StatusBadge status={req.status} />
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
        </div>
        <div className="px-6 py-4 space-y-3 text-sm">
          {[
            ['Tool', req.tool_name],
            ['Quantity', req.quantity_requested],
            ['Purpose', req.purpose_of_job],
            ['From', fmtDate(req.from_date)],
            ['To', fmtDate(req.to_date)],
            ['Submitted', fmtDate(req.created_at)],
            req.approved_at && ['Approved By', req.approver_name],
            req.rejection_reason && ['Rejection Reason', req.rejection_reason],
          ].filter(Boolean).map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3">
              <span className="text-gray-500 shrink-0">{label}</span>
              <span className="text-gray-900 text-right">{value}</span>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="btn-secondary">Close</button>
        </div>
      </div>
    </ModalOverlay>
  )
}

export default function Requisitions() {
  const location = useRouterLocation()
  const addToast = useToast()
  const { version } = useDataSync()
  const [reqs, setReqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [prefillTool, setPrefillTool] = useState(null)
  const [viewReq, setViewReq] = useState(null)

  // Support navigation from Tools page with prefill
  useEffect(() => {
    if (location.state?.prefillTool) {
      setPrefillTool(location.state.prefillTool)
      setShowNew(true)
    }
  }, [location.state])

  const loadReqs = async () => {
    try {
      const params = {}
      if (tab) params.status = tab
      const res = await requisitionsAPI.list(params)
      setReqs(res.data)
    } catch (ex) {
      setError(ex.response?.data?.detail || 'Failed to load requisitions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadReqs() }, [tab, version])

  const openNew = () => { setPrefillTool(null); setShowNew(true) }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">My Requests</h1>
          <button onClick={openNew} className="btn-primary">
            <Plus size={16} /> New Request
          </button>
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

        {/* Tabs */}
        <div className="tab-shell w-fit">
          {TABS.map(t => (
            <button
              key={t.value}
              onClick={() => { setTab(t.value); setLoading(true) }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ease-in-out ${tab === t.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
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
              <ClipboardList size={32} className="mb-3 opacity-40" />
              <p className="text-sm">No {tab || ''} requests found.</p>
              <button onClick={openNew} className="mt-3 text-sm text-amber-600 hover:text-amber-700 font-medium">
                + Create your first request
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Req #', 'Tool', 'Qty', 'Purpose', 'From', 'To', 'Status', 'Submitted', 'Action'].map(h => (
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
                      <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{req.purpose_of_job}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(req.from_date)}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(req.to_date)}</td>
                      <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{fmtDate(req.created_at)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setViewReq(req)}
                          className="btn-soft bg-slate-100 text-slate-700 hover:bg-slate-200"
                        >
                          View
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

      {showNew && (
        <RequisitionModal
          prefillTool={prefillTool}
          onClose={() => { setShowNew(false); setPrefillTool(null) }}
          onCreated={loadReqs}
        />
      )}

      {viewReq && (
        <DetailModal req={viewReq} onClose={() => setViewReq(null)} />
      )}
    </Layout>
  )
}
