import { useState, useEffect, useMemo } from 'react'
import { Loader2, X, CheckCircle2 } from 'lucide-react'
import { calibrationAPI } from '../api/client'
import { useToast } from '../contexts/ToastContext'
import Layout from '../components/Layout'

const FILTER_TABS = [
  { value: 'all', label: 'All' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'due_soon', label: 'Due Soon' },
  { value: 'ok', label: 'Up to Date' },
]

const TODAY_STR = new Date().toISOString().split('T')[0]

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function DueCell({ daysUntilDue, status }) {
  if (status === 'overdue') {
    const abs = Math.abs(daysUntilDue)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        {abs}d overdue
      </span>
    )
  }
  if (status === 'due_soon') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
        {daysUntilDue}d left
      </span>
    )
  }
  if (status === 'ok') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        {daysUntilDue}d left
      </span>
    )
  }
  return <span className="text-gray-400 text-xs">—</span>
}

function RecordModal({ tool, onClose, onRecorded }) {
  const addToast = useToast()
  const [calibDate, setCalibDate] = useState(TODAY_STR)
  const [servicePartner, setServicePartner] = useState(tool.service_partner || '')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState('')

  const nextDuePreview = useMemo(() => {
    if (!calibDate || !tool.calibration_freq_days) return null
    const d = new Date(calibDate)
    d.setDate(d.getDate() + tool.calibration_freq_days)
    return fmtDate(d.toISOString().split('T')[0])
  }, [calibDate, tool.calibration_freq_days])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    if (!calibDate) { setErr('Calibration date is required'); return }
    setSubmitting(true)
    try {
      await calibrationAPI.record(tool.id, {
        calibration_date: calibDate,
        service_partner: servicePartner.trim() || null,
        notes: notes.trim() || null,
      })
      addToast(`Calibration recorded for ${tool.name}`)
      onRecorded()
      onClose()
    } catch (ex) {
      setErr(ex.response?.data?.detail || 'Failed to record calibration')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  const inputCls =
    'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Record Calibration</h2>
            <p className="text-xs text-gray-400 mt-0.5">{tool.name} · {tool.tool_code}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Calibration Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={calibDate}
                max={TODAY_STR}
                onChange={(e) => setCalibDate(e.target.value)}
                className={inputCls}
                required
              />
            </div>

            {nextDuePreview && (
              <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                <div className="text-xs text-green-600 font-medium mb-0.5">Next Calibration Due</div>
                <div className="text-base font-bold text-green-800">{nextDuePreview}</div>
                <div className="text-xs text-green-600 mt-0.5">
                  Frequency: every {tool.calibration_freq_days} days
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Service Partner
              </label>
              <input
                type="text"
                value={servicePartner}
                onChange={(e) => setServicePartner(e.target.value)}
                placeholder="Name of calibration lab or technician"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Calibration findings, certificate number, etc."
                className={inputCls + ' resize-none'}
              />
            </div>

            {err && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {err}
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-60 rounded-lg flex items-center gap-2"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {submitting ? 'Recording…' : 'Save Calibration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Calibration() {
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterTab, setFilterTab] = useState('all')
  const [recordingTool, setRecordingTool] = useState(null)

  const loadTools = async () => {
    setError('')
    try {
      // days=3650 → effectively fetch all calibration-required tools (up to 10 years out)
      const res = await calibrationAPI.list({ days: 3650 })
      setTools(res.data)
    } catch (ex) {
      setError(ex.response?.data?.detail || 'Failed to load calibration data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTools() }, [])

  const stats = useMemo(() => ({
    overdue: tools.filter((t) => t.calibration_status === 'overdue').length,
    dueWeek: tools.filter((t) => t.calibration_status === 'due_soon').length,
    dueMonth: tools.filter(
      (t) => t.days_until_due != null && t.days_until_due >= 0 && t.days_until_due <= 30
    ).length,
    upToDate: tools.filter((t) => t.calibration_status === 'ok').length,
  }), [tools])

  const filtered = useMemo(() => {
    if (filterTab === 'all') return tools
    return tools.filter((t) => t.calibration_status === filterTab)
  }, [tools, filterTab])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 gap-2 text-gray-400">
          <Loader2 size={18} className="animate-spin" /> Loading calibration data…
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-gray-900">Calibration Management</h1>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Overdue', value: stats.overdue, color: 'red' },
            { label: 'Due This Week', value: stats.dueWeek, color: 'amber' },
            { label: 'Due This Month', value: stats.dueMonth, color: 'yellow' },
            { label: 'Up to Date', value: stats.upToDate, color: 'green' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className={`bg-white border rounded-xl px-4 py-4 ${
                color === 'red'
                  ? 'border-red-200'
                  : color === 'amber'
                  ? 'border-amber-200'
                  : color === 'yellow'
                  ? 'border-yellow-200'
                  : 'border-green-200'
              }`}
            >
              <div
                className={`text-2xl font-bold ${
                  color === 'red'
                    ? 'text-red-600'
                    : color === 'amber'
                    ? 'text-amber-600'
                    : color === 'yellow'
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}
              >
                {value}
              </div>
              <div className="text-xs text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Overdue Banner */}
        {stats.overdue > 0 && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <span className="font-semibold text-red-800">
              {stats.overdue} tool{stats.overdue > 1 ? 's' : ''} overdue for calibration.
            </span>
            Overdue tools are blocked from issuance until calibration is recorded.
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          {FILTER_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setFilterTab(t.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterTab === t.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
              {t.value !== 'all' && (
                <span className="ml-1.5 text-gray-400">
                  ({t.value === 'overdue' ? stats.overdue : t.value === 'due_soon' ? stats.dueWeek : stats.upToDate})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-gray-400 gap-2">
              <CheckCircle2 size={28} className="opacity-30" />
              <p className="text-sm">No tools in this category</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Tool', 'Code', 'Service Partner', 'Last Calibrated', 'Next Due', 'Days', 'Action'].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((tool) => (
                    <tr
                      key={tool.id}
                      className={`transition-colors ${
                        tool.calibration_status === 'overdue'
                          ? 'bg-red-50/50 hover:bg-red-50'
                          : tool.calibration_status === 'due_soon'
                          ? 'bg-amber-50/30 hover:bg-amber-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{tool.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{tool.tool_code}</td>
                      <td className="px-4 py-3 text-gray-500">{tool.service_partner || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {fmtDate(tool.last_calibration_date)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={
                            tool.calibration_status === 'overdue'
                              ? 'font-semibold text-red-700'
                              : tool.calibration_status === 'due_soon'
                              ? 'font-medium text-amber-700'
                              : 'text-gray-700'
                          }
                        >
                          {fmtDate(tool.next_calibration_due)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <DueCell
                          daysUntilDue={tool.days_until_due}
                          status={tool.calibration_status}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setRecordingTool(tool)}
                          className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-200 rounded-md"
                        >
                          Record
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

      {recordingTool && (
        <RecordModal
          tool={recordingTool}
          onClose={() => setRecordingTool(null)}
          onRecorded={loadTools}
        />
      )}
    </Layout>
  )
}
