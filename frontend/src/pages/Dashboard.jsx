import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Activity,
  ArrowRight,
  Package,
} from 'lucide-react'
import { dashboardAPI } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import Layout from '../components/Layout'

function SummaryCard({ label, value, icon: Icon, color, subtext }) {
  return (
    <div className={`bg-white rounded-xl border shadow-sm p-5 flex items-start gap-4 ${color}`}>
      <div className={`p-2.5 rounded-lg ${color.includes('red') ? 'bg-red-100' : color.includes('amber') ? 'bg-amber-100' : 'bg-slate-100'}`}>
        <Icon size={20} className={color.includes('red') ? 'text-red-600' : color.includes('amber') ? 'text-amber-600' : 'text-slate-600'} />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value ?? '—'}</div>
        <div className="text-sm text-gray-500 mt-0.5">{label}</div>
        {subtext && <div className="text-xs text-gray-400 mt-1">{subtext}</div>}
      </div>
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysLabel(issuance) {
  const today = new Date()
  const due = new Date(issuance.expected_return_date)
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
  if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, overdue: true }
  if (diff === 0) return { text: 'Due today', overdue: true }
  return { text: `${diff}d left`, overdue: false }
}

export default function Dashboard() {
  const { user, isAdmin, isMaintenance } = useAuth()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dashboardAPI.summary()
        setSummary(res.data)
      } catch (err) {
        setError('Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400 text-sm">Loading dashboard…</div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm">{error}</div>
      </Layout>
    )
  }

  const s = summary || {}
  const hasOverdue = (s.overdue_count || 0) > 0
  const hasCalDue = (s.calibration_due_count || 0) > 0

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, {user?.full_name} · {user?.department}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <SummaryCard
            label="Total Tools"
            value={s.total_tools}
            icon={Wrench}
            color=""
          />
          <SummaryCard
            label="Available"
            value={s.available_tools}
            icon={CheckCircle2}
            color=""
          />
          <SummaryCard
            label="Currently Issued"
            value={s.tools_issued}
            icon={Package}
            color=""
          />
          <div className={`bg-white rounded-xl border shadow-sm p-5 flex items-start gap-4 ${hasOverdue ? 'border-red-300 bg-red-50' : ''}`}>
            <div className={`p-2.5 rounded-lg ${hasOverdue ? 'bg-red-100' : 'bg-slate-100'}`}>
              <Clock size={20} className={hasOverdue ? 'text-red-600' : 'text-slate-500'} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${hasOverdue ? 'text-red-700' : 'text-gray-900'}`}>
                {s.overdue_count ?? 0}
              </div>
              <div className={`text-sm mt-0.5 ${hasOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                Overdue Returns
              </div>
              {hasOverdue && (
                <Link to="/returns" className="text-xs text-red-500 underline mt-1 inline-block">View all</Link>
              )}
            </div>
          </div>
          <div className={`bg-white rounded-xl border shadow-sm p-5 flex items-start gap-4 ${hasCalDue ? 'border-amber-300 bg-amber-50' : ''}`}>
            <div className={`p-2.5 rounded-lg ${hasCalDue ? 'bg-amber-100' : 'bg-slate-100'}`}>
              <Activity size={20} className={hasCalDue ? 'text-amber-600' : 'text-slate-500'} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${hasCalDue ? 'text-amber-700' : 'text-gray-900'}`}>
                {s.calibration_due_count ?? 0}
              </div>
              <div className={`text-sm mt-0.5 ${hasCalDue ? 'text-amber-600' : 'text-gray-500'}`}>
                Calibration Due
              </div>
              {hasCalDue && isAdmin && (
                <Link to="/calibration" className="text-xs text-amber-600 underline mt-1 inline-block">Manage</Link>
              )}
            </div>
          </div>
        </div>

        {/* Role-specific sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* My Active Issuances — all roles */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">My Active Issuances</h2>
              <span className="text-xs text-gray-400">{(s.my_active_issuances || []).length} open</span>
            </div>
            {(s.my_active_issuances || []).length === 0 ? (
              <div className="flex items-center gap-2 px-5 py-6 text-sm text-green-600">
                <CheckCircle2 size={16} />
                No active issuances
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {s.my_active_issuances.map(i => {
                  const dl = daysLabel(i)
                  return (
                    <div key={i.id} className={`px-5 py-3 ${dl.overdue ? 'bg-red-50' : ''}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-800">{i.tool_name}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${dl.overdue ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {dl.text}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Qty: {i.quantity_issued} · Due: {formatDate(i.expected_return_date)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Pending Requests count / dept_head approvals */}
          <div className="space-y-4">

            {/* My Pending Requests */}
            <div className="bg-white rounded-xl border shadow-sm p-5 flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{s.my_pending_requests ?? 0}</div>
                <div className="text-sm text-gray-500 mt-0.5">My Pending Requests</div>
              </div>
              <Link
                to="/requisitions"
                className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-2 rounded-lg"
              >
                View <ArrowRight size={12} />
              </Link>
            </div>

            {/* dept_head: Pending Approvals */}
            {(user?.role === 'dept_head' || isAdmin) && s.pending_approvals_count !== undefined && (
              <div className={`bg-white rounded-xl border shadow-sm p-5 flex items-center justify-between ${(s.pending_approvals_count || 0) > 0 ? 'border-yellow-200 bg-yellow-50' : ''}`}>
                <div>
                  <div className={`text-2xl font-bold ${(s.pending_approvals_count || 0) > 0 ? 'text-yellow-700' : 'text-gray-900'}`}>
                    {s.pending_approvals_count ?? 0}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">Pending Approvals</div>
                </div>
                <Link
                  to="/approvals"
                  className="flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-2 rounded-lg"
                >
                  Review <ArrowRight size={12} />
                </Link>
              </div>
            )}

            {/* Maintenance: Approved Queue */}
            {isMaintenance && s.approved_queue_count !== undefined && (
              <div className={`bg-white rounded-xl border shadow-sm p-5 flex items-center justify-between ${(s.approved_queue_count || 0) > 0 ? 'border-blue-200 bg-blue-50' : ''}`}>
                <div>
                  <div className={`text-2xl font-bold ${(s.approved_queue_count || 0) > 0 ? 'text-blue-700' : 'text-gray-900'}`}>
                    {s.approved_queue_count ?? 0}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">Ready to Issue</div>
                </div>
                <Link
                  to="/issuance"
                  className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-2 rounded-lg"
                >
                  Issue <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Maintenance-only sections */}
        {isMaintenance && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Overdue Returns */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">
                  Overdue Returns
                  {hasOverdue && (
                    <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                      {s.overdue_count}
                    </span>
                  )}
                </h2>
              </div>
              {!hasOverdue ? (
                <div className="flex items-center gap-2 px-5 py-6 text-sm text-green-600">
                  <CheckCircle2 size={16} />
                  No overdue returns
                </div>
              ) : (
                <p className="text-xs text-gray-500 px-5 py-3">
                  {s.overdue_count} issuance(s) past due date. View the{' '}
                  <Link to="/returns" className="text-blue-500 underline">Returns page</Link> for details.
                </p>
              )}
            </div>

            {/* Low Stock */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">Low Stock Tools</h2>
                <span className="text-xs text-gray-400">{(s.low_stock_tools || []).length} tools</span>
              </div>
              {(s.low_stock_tools || []).length === 0 ? (
                <div className="flex items-center gap-2 px-5 py-6 text-sm text-green-600">
                  <CheckCircle2 size={16} />
                  All tools sufficiently stocked
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {s.low_stock_tools.map((t, idx) => (
                    <div key={idx} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-800">{t.name}</div>
                        <div className="text-xs text-gray-400">{t.tool_code}</div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-bold ${t.available_quantity === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                          {t.available_quantity}
                        </span>
                        <span className="text-xs text-gray-400"> / {t.total_quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Admin: Calibration due in next 7 days — shown as text, full detail in Calibration page */}
        {isAdmin && hasCalDue && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-amber-600" />
              <h2 className="text-sm font-semibold text-amber-800">Calibration Alert</h2>
            </div>
            <p className="text-sm text-amber-700">
              {s.calibration_due_count} tool(s) have calibration due within 7 days or overdue.
            </p>
            <Link
              to="/calibration"
              className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-amber-700 underline hover:text-amber-900"
            >
              View Calibration Schedule <ArrowRight size={12} />
            </Link>
          </div>
        )}
      </div>
    </Layout>
  )
}
