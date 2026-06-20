import { useState, useEffect, useMemo } from 'react'
import { Search, ArrowLeftCircle, Loader2, X, AlertTriangle } from 'lucide-react'
import { issuanceAPI } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { useDataSync } from '../data/DataSyncContext'
import { useToast } from '../contexts/ToastContext'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'

const DAMAGE_TYPES = [
  { value: 'theft', label: 'Theft', desc: 'Penalty = current market rate (entered by admin)' },
  { value: 'mishandling', label: 'Mishandling', desc: 'Penalty = depreciated book value at time of issue' },
  { value: 'wear_and_tear', label: 'Wear & Tear', desc: 'No penalty — tool written off' },
]

const DAMAGE_TYPES_BY_CONDITION = {
  missing: DAMAGE_TYPES.filter((dt) => dt.value === 'theft'),
  damaged: DAMAGE_TYPES.filter((dt) => dt.value !== 'theft'),
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtCurrency(v) {
  if (v == null) return '₹0.00'
  return `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function ModalShell({ onClose, children }) {
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

function ReturnModal({ log, onClose, onReturned }) {
  const addToast = useToast()
  const { actions } = useDataSync()
  const remaining = log.remaining_quantity ?? Math.max((log.quantity_issued || 0) - (log.quantity_returned || 0), 0)
  const [qtyReturned, setQtyReturned] = useState(remaining)
  const [condition, setCondition] = useState('good')
  const [conditionQty, setConditionQty] = useState({ good: remaining, damaged: 0, missing: 0 })
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    const qty = Number(qtyReturned)
    if (isNaN(qty) || qty < 0 || qty > remaining) {
      setErr(`Quantity must be between 0 and ${remaining}`)
      return
    }
    const split = ['good', 'damaged', 'missing'].reduce((acc, key) => {
      acc[key] = Number(conditionQty[key]) || 0
      return acc
    }, {})
    if (split.good + split.damaged + split.missing !== qty) {
      setErr('Good, damaged, and missing quantities must add up to the returned quantity')
      return
    }
    setSubmitting(true)
    try {
      await actions.returnTool(log.id, {
        quantity_returned: qty,
        return_condition: condition,
        condition_quantities: split,
        notes: notes.trim() || null,
      })
      if (condition === 'good') {
        addToast('Tool returned in good condition. Stock restored.')
      } else if (condition === 'partial') {
        addToast(`Partial return recorded. ${remaining - qty} unit(s) still open.`)
      } else {
        addToast('Return recorded. Damage assessment required — admin has been notified.', 'warning')
      }
      onReturned()
      onClose()
    } catch (ex) {
      setErr(ex.response?.data?.detail || 'Return processing failed')
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls =
    'input-control'

  const setSplit = (key, value) => {
    const nextValue = Number(value) || 0
    setConditionQty((prev) => ({ ...prev, [key]: nextValue }))
  }

  useEffect(() => {
    const qty = Number(qtyReturned) || 0
    if (condition === 'damaged') {
      setConditionQty({ good: 0, damaged: qty, missing: 0 })
    } else if (condition === 'missing') {
      setConditionQty({ good: 0, damaged: 0, missing: qty })
    } else {
      setConditionQty({ good: qty, damaged: 0, missing: 0 })
    }
  }, [condition, qtyReturned])

  return (
    <ModalShell onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-base font-semibold text-gray-900">Process Return</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="min-h-0 flex flex-1 flex-col">
          <div className="px-6 py-5 space-y-4 overflow-y-auto min-h-0 flex-1">
            {/* Summary */}
            <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Tool</span>
                <span className="font-medium text-gray-900">{log.tool_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Borrowed by</span>
                <span className="font-medium text-gray-900">
                  {log.borrower_name || '—'} ({log.borrower_dept || '—'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Qty Issued</span>
                <span className="font-medium">{log.quantity_issued}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Remaining</span>
                <span className="font-medium">{remaining}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Due Date</span>
                <span className="font-medium">{fmtDate(log.expected_return_date)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Quantity Returned
              </label>
              <input
                type="number"
                min={0}
                max={remaining}
                value={qtyReturned}
                onChange={(e) => setQtyReturned(e.target.value)}
                className={inputCls}
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Max: {remaining}. Partial durable returns stay open until all units are accounted for.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Return Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className={inputCls}
              >
                <option value="good">Good — returned as issued</option>
                <option value="partial">Partial — return some units now</option>
                <option value="damaged">Damaged — tool returned damaged</option>
                <option value="missing">Missing — tool not returned / lost</option>
              </select>
            </div>

            {['damaged', 'missing'].includes(condition) && (
              <div className="grid grid-cols-3 gap-3">
                {['good', 'damaged', 'missing'].map((key) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{key}</label>
                    <input
                      type="number"
                      min={0}
                      max={remaining}
                      value={conditionQty[key]}
                      onChange={(e) => setSplit(key, e.target.value)}
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>
            )}

            {['damaged', 'missing'].includes(condition) && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-sm text-amber-800">
                <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
                <span>
                  Damage assessment will be required. Admin will record damage type and calculate penalty after this return.
                </span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Any additional notes about the return condition…"
                className={inputCls + ' resize-none'}
              />
            </div>

            {err && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {err}
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {submitting ? 'Processing…' : 'Process Return'}
            </button>
          </div>
        </form>
      </div>
    </ModalShell>
  )
}

function DamageModal({ log, onClose, onAssessed }) {
  const addToast = useToast()
  const { actions } = useDataSync()
  const [damageType, setDamageType] = useState('')
  const [marketRate, setMarketRate] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState('')

  const calculatedPenalty = () => {
    if (!damageType) return null
    if (damageType === 'theft') {
      return marketRate ? fmtCurrency(Number(marketRate)) : 'Enter market rate above'
    }
    if (damageType === 'mishandling') return fmtCurrency(log.depreciated_value_at_issue)
    if (damageType === 'wear_and_tear') return '₹0.00 (no penalty — write-off)'
    return null
  }

  const handleSubmit = async () => {
    setErr('')
    if (!damageType) { setErr('Please select a damage type'); return }
    if (damageType === 'theft' && !marketRate) { setErr('Market rate is required for theft'); return }
    setSubmitting(true)
    try {
      await actions.markToolDamaged(log.id, {
        damage_type: damageType,
        market_rate_at_damage: damageType === 'theft' ? Number(marketRate) : null,
        notes: notes.trim() || null,
      })
      addToast('Damage assessment recorded successfully')
      onAssessed()
      onClose()
    } catch (ex) {
      setErr(ex.response?.data?.detail || 'Failed to record damage assessment')
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls =
    'input-control focus:ring-red-400'
  const damageOptions = DAMAGE_TYPES_BY_CONDITION[log.return_condition] || DAMAGE_TYPES

  return (
    <ModalShell onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-base font-semibold text-gray-900">Record Damage Assessment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto min-h-0 flex-1">
          {/* Summary */}
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-500">Tool</span>
              <span className="font-medium">{log.tool_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Returned by</span>
              <span className="font-medium">{log.borrower_name || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Return Condition</span>
              <StatusBadge status={log.return_condition} />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Value at Issue</span>
              <span className="font-medium text-amber-700">
                {fmtCurrency(log.depreciated_value_at_issue)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Damage Type <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {damageOptions.map((dt) => (
                <label
                  key={dt.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    damageType === dt.value
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="damageType"
                    value={dt.value}
                    checked={damageType === dt.value}
                    onChange={() => setDamageType(dt.value)}
                    className="mt-0.5 accent-red-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-800">{dt.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{dt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {damageType === 'theft' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Current Market Rate (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={marketRate}
                onChange={(e) => setMarketRate(e.target.value)}
                placeholder="Enter replacement cost at current market rate"
                className={inputCls}
              />
            </div>
          )}

          {damageType && (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="text-xs text-blue-600 font-medium mb-1">Calculated Penalty</div>
              <div className="text-lg font-bold text-blue-800">{calculatedPenalty()}</div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Additional notes about the damage…"
              className={inputCls + ' resize-none'}
            />
          </div>

          {err && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {err}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-danger"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {submitting ? 'Recording…' : 'Record Assessment'}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

export default function Returns() {
  const { isAdmin } = useAuth()
  const { version } = useDataSync()
  const [openLogs, setOpenLogs] = useState([])
  const [damageQueue, setDamageQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [returningLog, setReturningLog] = useState(null)
  const [assessingLog, setAssessingLog] = useState(null)

  const loadData = async () => {
    setError('')
    try {
      const calls = [issuanceAPI.list({ status: 'open' })]
      if (isAdmin) calls.push(issuanceAPI.list({ status: 'closed' }))
      const [openRes, closedRes] = await Promise.all(calls)
      setOpenLogs(openRes.data)
      if (isAdmin && closedRes) {
        setDamageQueue(
          closedRes.data.filter(
            (l) => ['damaged', 'missing'].includes(l.return_condition) && !l.damage_type
          )
        )
      }
    } catch (ex) {
      setError(ex.response?.data?.detail || 'Failed to load issuance data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [version, isAdmin])

  const filteredOpen = useMemo(() => {
    if (!search.trim()) return openLogs
    const q = search.toLowerCase()
    return openLogs.filter(
      (l) =>
        l.tool_name?.toLowerCase().includes(q) ||
        l.borrower_name?.toLowerCase().includes(q)
    )
  }, [openLogs, search])

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
        <h1 className="text-xl font-bold text-gray-900">Returns</h1>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tool name or borrower…"
            className="input-control pl-9"
          />
        </div>

        {/* Active Issuances */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Active Issuances
            </h2>
            <span className="text-xs text-gray-400">{filteredOpen.length} items</span>
          </div>

          <div className="table-shell">
            {filteredOpen.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-gray-400 gap-2">
                <ArrowLeftCircle size={28} className="opacity-30" />
                <p className="text-sm">
                  {search ? `No active issuances matching "${search}"` : 'No active issuances'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['Tool', 'Borrower', 'Dept', 'Qty', 'Remaining', 'Issued', 'Due', 'Action'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredOpen.map((log) => (
                      <tr key={log.id}>
                        <td className="px-4 py-3 font-medium text-gray-900">{log.tool_name}</td>
                        <td className="px-4 py-3 text-gray-700">{log.borrower_name || '—'}</td>
                        <td className="px-4 py-3 text-gray-500">{log.borrower_dept || '—'}</td>
                        <td className="px-4 py-3">{log.quantity_issued}</td>
                        <td className="px-4 py-3">{log.remaining_quantity ?? Math.max((log.quantity_issued || 0) - (log.quantity_returned || 0), 0)}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(log.issued_at)}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(log.expected_return_date)}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setReturningLog(log)}
                            className="btn-soft bg-amber-500 text-white hover:bg-amber-600"
                          >
                            Process Return
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

        {/* Damage Assessment Queue (admin only) */}
        {isAdmin && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Pending Damage Assessment
              </h2>
              {damageQueue.length > 0 && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                  {damageQueue.length} pending
                </span>
              )}
            </div>

            <div className="table-shell">
              {damageQueue.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
                  No damage assessments pending
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        {['Tool', 'Borrower', 'Condition', 'Returned On', 'Value at Issue', 'Action'].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {damageQueue.map((log) => (
                        <tr key={log.id} className="bg-red-50/40">
                          <td className="px-4 py-3 font-medium text-gray-900">{log.tool_name}</td>
                          <td className="px-4 py-3 text-gray-700">{log.borrower_name || '—'}</td>
                          <td className="px-4 py-3"><StatusBadge status={log.return_condition} /></td>
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(log.actual_return_date)}</td>
                          <td className="px-4 py-3 font-medium text-amber-700">
                            {fmtCurrency(log.depreciated_value_at_issue)}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setAssessingLog(log)}
                              className="btn-soft border border-red-200 bg-red-100 text-red-700 hover:bg-red-200"
                            >
                              Record Damage
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
        )}
      </div>

      {returningLog && (
        <ReturnModal
          log={returningLog}
          onClose={() => setReturningLog(null)}
          onReturned={loadData}
        />
      )}
      {assessingLog && (
        <DamageModal
          log={assessingLog}
          onClose={() => setAssessingLog(null)}
          onAssessed={loadData}
        />
      )}
    </Layout>
  )
}
