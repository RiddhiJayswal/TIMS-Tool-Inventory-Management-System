import { useState, useEffect } from 'react'
import { UserPlus, Shield, Users as UsersIcon, ChevronDown } from 'lucide-react'
import Layout from '../components/Layout'
import { usersAPI } from '../api/client'

const ROLES = [
  { value: 'requester',          label: 'Requester',           desc: 'View tools, raise requisitions' },
  { value: 'dept_head',          label: 'Department Head',     desc: 'Approve / reject department requests' },
  { value: 'maintenance_staff',  label: 'Maintenance Staff',   desc: 'Issue tools, process returns' },
  { value: 'maintenance_admin',  label: 'Maintenance Admin',   desc: 'Full system access' },
]

const DEPARTMENTS = [
  'Maintenance', 'E&I', 'Mechanical', 'Civil', 'Process', 'Electrical', 'Instrumentation', 'Other'
]

const ROLE_COLORS = {
  maintenance_admin:  'bg-purple-100 text-purple-800',
  maintenance_staff:  'bg-blue-100 text-blue-800',
  dept_head:          'bg-amber-100 text-amber-800',
  requester:          'bg-gray-100 text-gray-700',
}

const ROLE_LABELS = {
  maintenance_admin:  'Admin',
  maintenance_staff:  'Staff',
  dept_head:          'Dept Head',
  requester:          'Requester',
}

function RoleBadge({ role }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${ROLE_COLORS[role] || 'bg-gray-100 text-gray-600'}`}>
      {ROLE_LABELS[role] || role}
    </span>
  )
}

const EMPTY_FORM = {
  employee_id: '', full_name: '', email: '',
  role: 'requester', department: 'Maintenance', password: '', confirm_password: '',
}

function AddUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setSaving(true)
    try {
      const { confirm_password, ...payload } = form
      const res = await usersAPI.create(payload)
      onCreated(res.data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create user')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Add New Employee</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Employee ID *</label>
              <input
                required value={form.employee_id}
                onChange={e => set('employee_id', e.target.value.toUpperCase())}
                placeholder="e.g. USR002"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                required value={form.full_name}
                onChange={e => set('full_name', e.target.value)}
                placeholder="e.g. Ravi Sharma"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
            <input
              required type="email" value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="ravi.sharma@ultratech.com"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Role *</label>
              <select
                value={form.role} onChange={e => set('role', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                {ROLES.find(r => r.value === form.role)?.desc}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Department *</label>
              <select
                value={form.department} onChange={e => set('department', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Password *</label>
              <input
                required type="password" value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="Min 6 characters"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password *</label>
              <input
                required type="password" value={form.confirm_password}
                onChange={e => set('confirm_password', e.target.value)}
                placeholder="Repeat password"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 text-sm rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50">
              {saving ? 'Creating…' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [filterRole, setFilterRole] = useState('all')
  const [togglingId, setTogglingId] = useState(null)

  const fetchUsers = async () => {
    try {
      const res = await usersAPI.list()
      setUsers(res.data)
    } catch {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleToggle = async (userId) => {
    setTogglingId(userId)
    try {
      const res = await usersAPI.toggleActive(userId)
      setUsers(prev => prev.map(u => u.id === userId ? res.data : u))
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update user')
    } finally {
      setTogglingId(null)
    }
  }

  const filtered = filterRole === 'all' ? users : users.filter(u => u.role === filterRole)

  const counts = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    admin: users.filter(u => u.role === 'maintenance_admin').length,
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Only maintenance admins can create or deactivate employee accounts.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600"
          >
            <UserPlus size={16} />
            Add Employee
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Employees', value: counts.total, icon: UsersIcon, color: 'text-gray-700' },
            { label: 'Active Accounts', value: counts.active, icon: UsersIcon, color: 'text-green-600' },
            { label: 'Admins',          value: counts.admin,  icon: Shield,    color: 'text-purple-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border p-4 flex items-center gap-4">
              <Icon size={20} className={color} />
              <div>
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Role info cards */}
        <div className="grid grid-cols-4 gap-3">
          {ROLES.map(r => (
            <div key={r.value} className="bg-white border rounded-lg p-3">
              <RoleBadge role={r.value} />
              <div className="text-xs text-gray-500 mt-1.5">{r.desc}</div>
              <div className="text-lg font-bold text-gray-800 mt-1">
                {users.filter(u => u.role === r.value).length}
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="flex gap-2">
              {['all', ...ROLES.map(r => r.value)].map(r => (
                <button
                  key={r}
                  onClick={() => setFilterRole(r)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    filterRole === r
                      ? 'bg-amber-500 text-white'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {r === 'all' ? 'All' : ROLE_LABELS[r]}
                </button>
              ))}
            </div>
            <span className="text-xs text-gray-400">{filtered.length} employee{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm">Loading users…</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500 text-sm">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No employees found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wide border-b">
                  <th className="px-4 py-3 text-left">Employee</th>
                  <th className="px-4 py-3 text-left">Employee ID</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Department</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(u => (
                  <tr key={u.id} className={`hover:bg-gray-50 ${!u.is_active ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{u.full_name}</div>
                      <div className="text-xs text-gray-400">{u.email}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{u.employee_id}</td>
                    <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                    <td className="px-4 py-3 text-gray-600">{u.department}</td>
                    <td className="px-4 py-3">
                      {u.is_active ? (
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">Active</span>
                      ) : (
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(u.id)}
                        disabled={togglingId === u.id}
                        className={`text-xs px-3 py-1 rounded border font-medium transition-colors disabled:opacity-40 ${
                          u.is_active
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-green-200 text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {togglingId === u.id ? '…' : u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <AddUserModal
          onClose={() => setShowModal(false)}
          onCreated={(newUser) => setUsers(prev => [newUser, ...prev])}
        />
      )}
    </Layout>
  )
}
