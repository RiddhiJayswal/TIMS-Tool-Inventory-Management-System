import { useState, useEffect, useCallback } from 'react'
import { Download, Loader2, BarChart3 } from 'lucide-react'
import api, { reportsAPI } from '../api/client'
import { useToast } from '../contexts/ToastContext'
import { useDataSync } from '../data/DataSyncContext'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'

const TODAY = new Date().toISOString().split('T')[0]

const TABS = [
  { value: 'stock', label: 'Stock Status', endpoint: 'stock' },
  { value: 'issuance-history', label: 'Issuance History', endpoint: 'issuance-history' },
  { value: 'overdue', label: 'Overdue', endpoint: 'overdue' },
  { value: 'calibration', label: 'Calibration', endpoint: 'calibration' },
  { value: 'damage-penalty', label: 'Damage & Penalty', endpoint: 'damage-penalty' },
  { value: 'utilization', label: 'Utilization', endpoint: 'utilization' },
  { value: 'depreciation', label: 'Depreciation', endpoint: 'depreciation' },
]

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtCurrency(v) {
  if (v == null) return '—'
  return `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function TableShell({ children, exportLoading, onExport }) {
  return (
    <div className="table-shell">
      <div className="px-4 py-3 border-b border-gray-100 flex justify-end">
        <button
          onClick={onExport}
          disabled={exportLoading}
          className="btn-soft bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-60"
        >
          {exportLoading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
          {exportLoading ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>
      {children}
    </div>
  )
}

function EmptyState({ msg }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-gray-400 gap-2">
      <BarChart3 size={28} className="opacity-30" />
      <p className="text-sm">{msg || 'No data available'}</p>
    </div>
  )
}

function StockTable({ data }) {
  if (!data.length) return <EmptyState msg="No tools found" />
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            {['Code', 'Name', 'Category', 'Type', 'Total', 'Available', 'Issued', 'Status'].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((r) => (
            <tr key={r.tool_id || r.id}>
              <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.tool_code}</td>
              <td className="px-4 py-3 font-medium text-gray-900">{r.tool_name || r.name}</td>
              <td className="px-4 py-3 text-gray-500">{r.category}</td>
              <td className="px-4 py-3 text-gray-500">{r.tool_type}</td>
              <td className="px-4 py-3">{r.total_quantity}</td>
              <td className="px-4 py-3">
                <span className={r.available_quantity === 0 ? 'text-red-600 font-medium' : 'text-green-700 font-medium'}>
                  {r.available_quantity}
                </span>
              </td>
              <td className="px-4 py-3">{r.issued_quantity ?? r.currently_issued ?? 0}</td>
              <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function IssuanceHistoryTab({ addToast }) {
  const { version } = useDataSync()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState(TODAY)
  const [dept, setDept] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (fromDate) params.from_date = fromDate
      if (toDate) params.to_date = toDate
      if (dept.trim()) params.department = dept.trim()
      const res = await reportsAPI.issuanceHistory(params)
      setData(res.data)
    } catch (ex) {
      addToast(ex.response?.data?.detail || 'Failed to load report', 'error')
    } finally {
      setLoading(false)
    }
  }, [fromDate, toDate, dept, version])

  useEffect(() => { load() }, [load])

  const handleExport = async () => {
    setExportLoading(true)
    try {
      const params = new URLSearchParams({ format: 'csv' })
      if (fromDate) params.append('from_date', fromDate)
      if (toDate) params.append('to_date', toDate)
      if (dept.trim()) params.append('department', dept.trim())
      const res = await api.get(`/reports/issuance-history?${params}`, { responseType: 'blob' })
      triggerDownload(res.data, 'issuance-history')
    } catch {
      addToast('Export failed', 'error')
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
            className="input-control" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input type="date" value={toDate} max={TODAY} onChange={(e) => setToDate(e.target.value)}
            className="input-control" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Department</label>
          <input type="text" value={dept} onChange={(e) => setDept(e.target.value)}
            placeholder="Filter by dept…"
            className="input-control w-40" />
        </div>
      </div>

      <TableShell exportLoading={exportLoading} onExport={handleExport}>
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
            <Loader2 size={16} className="animate-spin" /> Loading…
          </div>
        ) : data.length === 0 ? (
          <EmptyState msg="No issuance history matching filters" />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Tool', 'Borrower', 'Dept', 'Qty', 'Issued', 'Returned', 'Condition', 'Penalty'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map((r, i) => (
                  <tr key={r.issuance_id || i}>
                    <td className="px-4 py-3 font-medium text-gray-900">{r.tool_name}</td>
                    <td className="px-4 py-3 text-gray-700">{r.borrower_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{r.borrower_dept || '—'}</td>
                    <td className="px-4 py-3">{r.quantity_issued}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(r.issued_at)}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(r.actual_return_date)}</td>
                    <td className="px-4 py-3">{r.return_condition ? <StatusBadge status={r.return_condition} /> : '—'}</td>
                    <td className="px-4 py-3">{r.penalty_amount ? <span className="text-red-600 font-medium">{fmtCurrency(r.penalty_amount)}</span> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TableShell>
    </div>
  )
}

function triggerDownload(blob, name) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tims_${name}_${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function SimpleReportTab({ fetchFn, endpoint, columns, addToast }) {
  const { version } = useDataSync()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [exportLoading, setExportLoading] = useState(false)

  useEffect(() => {
    fetchFn()
      .then((r) => setData(r.data))
      .catch((ex) => addToast(ex.response?.data?.detail || 'Failed to load report', 'error'))
      .finally(() => setLoading(false))
  }, [version])

  const handleExport = async () => {
    setExportLoading(true)
    try {
      const res = await api.get(`/reports/${endpoint}?format=csv`, { responseType: 'blob' })
      triggerDownload(res.data, endpoint)
    } catch {
      addToast('Export failed', 'error')
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <TableShell exportLoading={exportLoading} onExport={handleExport}>
      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      ) : data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {columns.map((c) => (
                  <th key={c.key} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((r, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 text-gray-700">
                      {c.render ? c.render(r) : (r[c.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </TableShell>
  )
}

export default function Reports() {
  const addToast = useToast()
  const { version } = useDataSync()
  const [tab, setTab] = useState('stock')
  const [stockData, setStockData] = useState([])
  const [stockLoading, setStockLoading] = useState(true)
  const [stockExportLoading, setStockExportLoading] = useState(false)

  useEffect(() => {
    if (tab === 'stock') {
      setStockLoading(true)
      reportsAPI.stock()
        .then((r) => setStockData(r.data))
        .catch((ex) => addToast(ex.response?.data?.detail || 'Failed to load stock report', 'error'))
        .finally(() => setStockLoading(false))
    }
  }, [tab, version])

  const handleStockExport = async () => {
    setStockExportLoading(true)
    try {
      const res = await api.get('/reports/stock?format=csv', { responseType: 'blob' })
      triggerDownload(res.data, 'stock')
    } catch {
      addToast('Export failed', 'error')
    } finally {
      setStockExportLoading(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-5">
        <h1 className="text-xl font-bold text-gray-900">Reports</h1>

        {/* Tab Navigation */}
        <div className="tab-shell">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ease-in-out whitespace-nowrap ${
                tab === t.value
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Stock Status */}
        {tab === 'stock' && (
          <TableShell exportLoading={stockExportLoading} onExport={handleStockExport}>
            {stockLoading ? (
              <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
                <Loader2 size={16} className="animate-spin" /> Loading…
              </div>
            ) : (
              <StockTable data={stockData} />
            )}
          </TableShell>
        )}

        {/* Issuance History (has its own filters) */}
        {tab === 'issuance-history' && <IssuanceHistoryTab addToast={addToast} />}

        {/* Overdue */}
        {tab === 'overdue' && (
          <SimpleReportTab
            fetchFn={reportsAPI.overdue}
            endpoint="overdue"
            addToast={addToast}
            columns={[
              { key: 'tool_name', label: 'Tool', render: (r) => <span className="font-medium text-gray-900">{r.tool_name}</span> },
              { key: 'borrower_name', label: 'Borrower' },
              { key: 'borrower_dept', label: 'Dept' },
              { key: 'quantity_issued', label: 'Qty' },
              { key: 'issued_at', label: 'Issued', render: (r) => fmtDate(r.issued_at) },
              { key: 'expected_return_date', label: 'Due Date', render: (r) => fmtDate(r.expected_return_date) },
              {
                key: 'days_overdue', label: 'Days Overdue',
                render: (r) => (
                  <span className="font-semibold text-red-600">{r.days_overdue}d</span>
                ),
              },
            ]}
          />
        )}

        {/* Calibration */}
        {tab === 'calibration' && (
          <SimpleReportTab
            fetchFn={() => reportsAPI.calibration({ days: 3650 })}
            endpoint="calibration"
            addToast={addToast}
            columns={[
              { key: 'name', label: 'Tool', render: (r) => <span className="font-medium text-gray-900">{r.name || r.tool_name}</span> },
              { key: 'tool_code', label: 'Code', render: (r) => <span className="font-mono text-xs text-gray-500">{r.tool_code}</span> },
              { key: 'service_partner', label: 'Service Partner' },
              { key: 'last_calibration_date', label: 'Last Calibrated', render: (r) => fmtDate(r.last_calibration_date) },
              { key: 'next_calibration_due', label: 'Next Due', render: (r) => fmtDate(r.next_calibration_due) },
              {
                key: 'calibration_status', label: 'Status',
                render: (r) => {
                  const s = r.calibration_status
                  const cls = s === 'overdue' ? 'bg-red-100 text-red-700' : s === 'due_soon' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{s}</span>
                },
              },
            ]}
          />
        )}

        {/* Damage & Penalty */}
        {tab === 'damage-penalty' && (
          <SimpleReportTab
            fetchFn={reportsAPI.damagePenalty}
            endpoint="damage-penalty"
            addToast={addToast}
            columns={[
              { key: 'tool_name', label: 'Tool', render: (r) => <span className="font-medium text-gray-900">{r.tool_name}</span> },
              { key: 'borrower_name', label: 'Borrower' },
              { key: 'borrower_dept', label: 'Dept' },
              {
                key: 'damage_type', label: 'Damage Type',
                render: (r) => {
                  const cls = r.damage_type === 'theft' ? 'bg-red-100 text-red-700' : r.damage_type === 'mishandling' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{r.damage_type?.replace('_', ' ')}</span>
                },
              },
              { key: 'return_condition', label: 'Condition', render: (r) => r.return_condition ? <StatusBadge status={r.return_condition} /> : '—' },
              { key: 'depreciated_value_at_issue', label: 'Book Value at Issue', render: (r) => fmtCurrency(r.depreciated_value_at_issue) },
              {
                key: 'penalty_amount', label: 'Penalty',
                render: (r) => r.penalty_amount ? <span className="font-semibold text-red-600">{fmtCurrency(r.penalty_amount)}</span> : '₹0.00',
              },
              { key: 'actual_return_date', label: 'Date', render: (r) => fmtDate(r.actual_return_date) },
            ]}
          />
        )}

        {/* Utilization */}
        {tab === 'utilization' && (
          <SimpleReportTab
            fetchFn={reportsAPI.utilization}
            endpoint="utilization"
            addToast={addToast}
            columns={[
              { key: 'department', label: 'Department', render: (r) => <span className="font-medium text-gray-900">{r.department || r.requester_dept}</span> },
              { key: 'total_requests', label: 'Total Requests' },
              { key: 'approved_requests', label: 'Approved' },
              { key: 'rejected_requests', label: 'Rejected' },
              { key: 'active_issuances', label: 'Active Issuances' },
              { key: 'total_issued', label: 'Total Issued' },
            ]}
          />
        )}

        {/* Depreciation */}
        {tab === 'depreciation' && (
          <SimpleReportTab
            fetchFn={reportsAPI.depreciation}
            endpoint="depreciation"
            addToast={addToast}
            columns={[
              { key: 'tool_name', label: 'Tool', render: (r) => <span className="font-medium text-gray-900">{r.tool_name || r.name}</span> },
              { key: 'tool_code', label: 'Code', render: (r) => <span className="font-mono text-xs text-gray-500">{r.tool_code}</span> },
              { key: 'purchase_price', label: 'Purchase Price', render: (r) => fmtCurrency(r.purchase_price) },
              { key: 'standard_life_months', label: 'Life (months)' },
              { key: 'months_elapsed', label: 'Months Elapsed' },
              {
                key: 'current_value', label: 'Current Value',
                render: (r) => (
                  <span className={r.current_value === 0 ? 'text-red-600 font-medium' : 'text-gray-900 font-medium'}>
                    {fmtCurrency(r.current_value)}
                  </span>
                ),
              },
              { key: 'depreciation_pct', label: '% Depreciated', render: (r) => r.depreciation_pct != null ? `${r.depreciation_pct}%` : '—' },
              { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            ]}
          />
        )}
      </div>
    </Layout>
  )
}
