import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { toolsAPI, reportsAPI, calibrationAPI } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { useToast } from '../contexts/ToastContext'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import ConfirmDialog from '../components/ConfirmDialog'

function fmt(v, prefix = '') {
  if (v == null) return '—'
  return prefix + v
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtCurrency(v) {
  if (v == null) return '—'
  return `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function DetailRow({ label, value }) {
  return (
    <div className="py-2.5 px-4 flex justify-between items-start gap-4 border-b border-gray-50 last:border-0">
      <span className="text-xs font-medium text-gray-500 shrink-0">{label}</span>
      <span className="text-sm text-gray-800 text-right">{value ?? '—'}</span>
    </div>
  )
}

export default function ToolDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin, isMaintenance } = useAuth()
  const addToast = useToast()

  const [tool, setTool] = useState(null)
  const [issuanceHistory, setIssuanceHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showWriteOff, setShowWriteOff] = useState(false)
  const [writeOffLoading, setWriteOffLoading] = useState(false)

  const loadTool = async () => {
    try {
      const res = await toolsAPI.get(id)
      setTool(res.data)
    } catch (ex) {
      setError(ex.response?.data?.detail || 'Failed to load tool')
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async () => {
    if (!isMaintenance) return
    try {
      const res = await reportsAPI.issuanceHistory({ tool_id: id })
      setIssuanceHistory(res.data.slice(0, 20))
    } catch {}
  }

  useEffect(() => {
    loadTool()
    loadHistory()
  }, [id])

  const handleWriteOff = async () => {
    setWriteOffLoading(true)
    try {
      await toolsAPI.update(id, { status: 'written_off' })
      addToast(`Tool written off successfully`)
      setShowWriteOff(false)
      loadTool()
    } catch (ex) {
      addToast(ex.response?.data?.detail || 'Write-off failed', 'error')
    } finally {
      setWriteOffLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 gap-2 text-gray-400">
          <Loader2 size={18} className="animate-spin" /> Loading tool…
        </div>
      </Layout>
    )
  }

  if (error || !tool) {
    return (
      <Layout>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error || 'Tool not found'}
        </div>
      </Layout>
    )
  }

  const today = new Date()
  const calOverdue = tool.next_calibration_due && new Date(tool.next_calibration_due) <= today

  return (
    <Layout>
      <div className="space-y-5">
        {/* Back button */}
        <button onClick={() => navigate('/tools')} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={14} /> Back to Tools
        </button>

        {/* Header */}
        <div className="card card-hover p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{tool.name}</h1>
                <StatusBadge status={tool.status} />
              </div>
              <p className="text-gray-400 font-mono text-sm mt-1">{tool.tool_code}</p>
            </div>
            <div className="text-right shrink-0">
              <div className={`text-3xl font-bold ${tool.available_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {tool.available_quantity}
              </div>
              <div className="text-xs text-gray-400">of {tool.total_quantity} available</div>
            </div>
          </div>

          {calOverdue && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              <AlertTriangle size={14} /> Calibration overdue — tool is blocked from issuance
            </div>
          )}

          {isAdmin && tool.status !== 'written_off' && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => navigate('/tools', { state: { editId: tool.id } })}
                className="btn-primary"
              >
                Edit Tool
              </button>
              <button
                onClick={() => setShowWriteOff(true)}
                className="btn-soft border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
              >
                Write Off Tool
              </button>
            </div>
          )}
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="table-shell">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Tool Details</h2>
            </div>
            <DetailRow label="Category" value={tool.category} />
            <DetailRow label="Tool Type" value={tool.tool_type?.charAt(0).toUpperCase() + tool.tool_type?.slice(1)} />
            <DetailRow label="Department Access" value={tool.department_access || 'All Departments'} />
            <DetailRow label="Is Consumable" value={tool.is_consumable ? 'Yes' : 'No'} />
            <DetailRow label="Make" value={tool.make} />
            <DetailRow label="Model" value={tool.model} />
            <DetailRow label="Serial Number" value={tool.serial_number} />
          </div>

          <div className="table-shell">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Financial & Calibration</h2>
            </div>
            <DetailRow label="Purchase Date" value={fmtDate(tool.purchase_date)} />
            <DetailRow label="Purchase Price" value={fmtCurrency(tool.purchase_price)} />
            <DetailRow label="Standard Life" value={tool.standard_life_months ? `${tool.standard_life_months} months` : '—'} />
            <DetailRow label="Current Value" value={fmtCurrency(tool.current_value)} />
            <DetailRow label="Requires Calibration" value={tool.requires_calibration ? 'Yes' : 'No'} />
            {tool.requires_calibration && (
              <>
                <DetailRow label="Calibration Frequency" value={tool.calibration_freq_days ? `${tool.calibration_freq_days} days` : '—'} />
                <DetailRow label="Last Calibrated" value={fmtDate(tool.last_calibration_date)} />
                <DetailRow label="Next Due" value={
                  <span className={calOverdue ? 'text-red-600 font-semibold' : ''}>
                    {fmtDate(tool.next_calibration_due)}
                  </span>
                } />
                <DetailRow label="Service Partner" value={tool.service_partner} />
              </>
            )}
          </div>
        </div>

        {/* Current Issuances */}
        {(tool.current_issuances?.length > 0) && (
          <div className="table-shell">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Current Issuances</h2>
              <span className="text-xs text-gray-400">{tool.current_issuances.length} open</span>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Borrower', 'Department', 'Qty', 'Issued', 'Due Date', 'Days'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tool.current_issuances.map(i => {
                    const daysLeft = i.expected_return_date
                      ? Math.ceil((new Date(i.expected_return_date) - new Date()) / 86400000)
                      : null
                    return (
                      <tr key={i.id}>
                        <td className="px-4 py-2.5 font-medium">{i.borrower_name || '—'}</td>
                        <td className="px-4 py-2.5 text-gray-500">{i.borrower_dept || '—'}</td>
                        <td className="px-4 py-2.5">{i.quantity_issued}</td>
                        <td className="px-4 py-2.5 text-gray-500">{fmtDate(i.issued_at)}</td>
                        <td className="px-4 py-2.5 text-gray-500">{fmtDate(i.expected_return_date)}</td>
                        <td className="px-4 py-2.5">
                          {daysLeft != null && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${daysLeft < 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                              {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Calibration History */}
        {isMaintenance && tool.calibration_history?.length > 0 && (
          <div className="table-shell">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Calibration History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Date', 'Next Due', 'Service Partner', 'Notes', 'Recorded At'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tool.calibration_history.map(h => (
                    <tr key={h.id}>
                      <td className="px-4 py-2.5">{fmtDate(h.details?.calibration_date)}</td>
                      <td className="px-4 py-2.5 text-gray-500">{fmtDate(h.details?.next_calibration_due)}</td>
                      <td className="px-4 py-2.5 text-gray-500">{h.details?.service_partner || '—'}</td>
                      <td className="px-4 py-2.5 text-gray-500">{h.details?.notes || '—'}</td>
                      <td className="px-4 py-2.5 text-gray-400 text-xs">{fmtDate(h.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Issuance History (maintenance only) */}
        {isMaintenance && (
          <div className="table-shell">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Issuance History</h2>
              <span className="text-xs text-gray-400">Last {issuanceHistory.length} records</span>
            </div>
            {issuanceHistory.length === 0 ? (
              <div className="flex items-center gap-2 px-4 py-6 text-sm text-gray-400">
                <CheckCircle2 size={14} /> No issuance history
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Borrower', 'Dept', 'Qty', 'Issued', 'Returned', 'Condition', 'Penalty'].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {issuanceHistory.map(i => (
                      <tr key={i.issuance_id}>
                        <td className="px-4 py-2.5 font-medium">{i.borrower_name || '—'}</td>
                        <td className="px-4 py-2.5 text-gray-500">{i.borrower_dept || '—'}</td>
                        <td className="px-4 py-2.5">{i.quantity_issued}</td>
                        <td className="px-4 py-2.5 text-gray-500">{fmtDate(i.issued_at)}</td>
                        <td className="px-4 py-2.5 text-gray-500">{fmtDate(i.actual_return_date)}</td>
                        <td className="px-4 py-2.5">
                          {i.return_condition ? <StatusBadge status={i.return_condition} /> : '—'}
                        </td>
                        <td className="px-4 py-2.5">
                          {i.penalty_amount ? (
                            <span className="text-red-600 font-medium">{fmtCurrency(i.penalty_amount)}</span>
                          ) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showWriteOff}
        title="Write Off Tool"
        message={`Are you sure you want to write off '${tool.name}'? This will set the tool status to 'Written Off' and remove it from active inventory. This action cannot be undone easily.`}
        confirmLabel="Write Off"
        confirmStyle="red"
        loading={writeOffLoading}
        onConfirm={handleWriteOff}
        onCancel={() => setShowWriteOff(false)}
      />
    </Layout>
  )
}
