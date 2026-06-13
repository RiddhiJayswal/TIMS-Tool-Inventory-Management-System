import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Loader2, Wrench } from 'lucide-react'
import { toolsAPI, binsAPI } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { useToast } from '../contexts/ToastContext'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'

const DEPARTMENTS = ['E&I', 'Mechanical', 'Civil', 'Process']
const TODAY = new Date().toISOString().split('T')[0]

function emptyForm() {
  return {
    tool_code: '', name: '', category: '', make: '', model: '', serial_number: '',
    tool_type: 'general', department_access: '',
    total_quantity: 1, storage_bin_id: '',
    purchase_date: '', purchase_price: '', standard_life_months: '',
    requires_calibration: false, calibration_freq_days: '', last_calibration_date: '', service_partner: '',
    is_consumable: false,
  }
}

function FieldGroup({ title, children }) {
  return (
    <div className="mb-5">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 pb-1.5 border-b border-gray-100">{title}</h4>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  )
}

function Field({ label, children, full }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent'

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? 'bg-amber-500' : 'bg-gray-300'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow ${checked ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
    </button>
  )
}

function ToolModal({ onClose, onSaved, editTool }) {
  const addToast = useToast()
  const [form, setForm] = useState(editTool ? { ...editTool, storage_bin_id: editTool.storage_bin_id || '' } : emptyForm())
  const [bins, setBins] = useState([])
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    binsAPI.list().then(r => setBins(r.data)).catch(() => {})
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    setSaving(true)
    try {
      const payload = {
        ...form,
        total_quantity: Number(form.total_quantity) || 0,
        purchase_price: form.purchase_price ? Number(form.purchase_price) : null,
        standard_life_months: form.standard_life_months ? Number(form.standard_life_months) : null,
        calibration_freq_days: form.calibration_freq_days ? Number(form.calibration_freq_days) : null,
        storage_bin_id: form.storage_bin_id || null,
        department_access: form.tool_type === 'specialized' ? form.department_access || null : null,
        purchase_date: form.purchase_date || null,
        last_calibration_date: form.last_calibration_date || null,
      }
      if (editTool) {
        await toolsAPI.update(editTool.id, payload)
        addToast(`Tool '${form.name}' updated successfully`)
      } else {
        await toolsAPI.create(payload)
        addToast(`Tool '${form.name}' created successfully`)
      }
      onSaved()
      onClose()
    } catch (ex) {
      setErr(ex.response?.data?.detail || 'Failed to save tool')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/40"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white h-full w-full max-w-xl shadow-2xl flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-base font-semibold text-gray-900">{editTool ? 'Edit Tool' : 'Add New Tool'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-light">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4">
          <FieldGroup title="Identification">
            <Field label="Tool Code *"><input required value={form.tool_code} onChange={e => set('tool_code', e.target.value)} className={inputCls} placeholder="e.g. TL-001" disabled={!!editTool} /></Field>
            <Field label="Name *"><input required value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} placeholder="Tool name" /></Field>
            <Field label="Category"><input value={form.category} onChange={e => set('category', e.target.value)} className={inputCls} placeholder="e.g. Hand Tool" /></Field>
            <Field label="Make"><input value={form.make} onChange={e => set('make', e.target.value)} className={inputCls} /></Field>
            <Field label="Model"><input value={form.model} onChange={e => set('model', e.target.value)} className={inputCls} /></Field>
            <Field label="Serial Number"><input value={form.serial_number} onChange={e => set('serial_number', e.target.value)} className={inputCls} /></Field>
          </FieldGroup>

          <FieldGroup title="Classification">
            <Field label="Tool Type *" full>
              <div className="flex gap-4">
                {['general', 'specialized'].map(t => (
                  <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" value={t} checked={form.tool_type === t} onChange={() => set('tool_type', t)} className="accent-amber-500" />
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </label>
                ))}
              </div>
            </Field>
            {form.tool_type === 'specialized' && (
              <Field label="Department Access" full>
                <select value={form.department_access} onChange={e => set('department_access', e.target.value)} className={inputCls}>
                  <option value="">Select department…</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
            )}
          </FieldGroup>

          <FieldGroup title="Inventory">
            <Field label="Total Quantity *"><input required type="number" min="0" value={form.total_quantity} onChange={e => set('total_quantity', e.target.value)} className={inputCls} /></Field>
            <Field label="Storage Bin">
              <select value={form.storage_bin_id} onChange={e => set('storage_bin_id', e.target.value)} className={inputCls}>
                <option value="">None</option>
                {bins.map(b => <option key={b.id} value={b.id}>{b.bin_code} — {b.shelf_label}</option>)}
              </select>
            </Field>
          </FieldGroup>

          <FieldGroup title="Financial">
            <Field label="Purchase Date"><input type="date" value={form.purchase_date} onChange={e => set('purchase_date', e.target.value)} className={inputCls} /></Field>
            <Field label="Purchase Price (₹)"><input type="number" min="0" step="0.01" value={form.purchase_price} onChange={e => set('purchase_price', e.target.value)} className={inputCls} /></Field>
            <Field label="Standard Life (months)"><input type="number" min="1" value={form.standard_life_months} onChange={e => set('standard_life_months', e.target.value)} className={inputCls} /></Field>
          </FieldGroup>

          <FieldGroup title="Calibration & Consumable">
            <Field label="Requires Calibration" full>
              <div className="flex items-center gap-3">
                <Toggle checked={form.requires_calibration} onChange={v => set('requires_calibration', v)} />
                <span className="text-sm text-gray-600">{form.requires_calibration ? 'Yes' : 'No'}</span>
              </div>
            </Field>
            {form.requires_calibration && (
              <>
                <Field label="Calibration Freq (days)"><input type="number" min="1" value={form.calibration_freq_days} onChange={e => set('calibration_freq_days', e.target.value)} className={inputCls} /></Field>
                <Field label="Last Calibration Date"><input type="date" value={form.last_calibration_date} onChange={e => set('last_calibration_date', e.target.value)} className={inputCls} /></Field>
                <Field label="Service Partner" full><input value={form.service_partner} onChange={e => set('service_partner', e.target.value)} className={inputCls} placeholder="Vendor / lab name" /></Field>
              </>
            )}
            <Field label="Consumable Tool" full>
              <div className="flex items-center gap-3">
                <Toggle checked={form.is_consumable} onChange={v => set('is_consumable', v)} />
                <span className="text-sm text-gray-600">{form.is_consumable ? 'Yes (e.g. welding rods)' : 'No (durable tool)'}</span>
              </div>
            </Field>
          </FieldGroup>

          {err && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{err}</div>}
        </form>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="px-5 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-60 rounded-lg flex items-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? 'Saving…' : editTool ? 'Save Changes' : 'Create Tool'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Tools() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editTool, setEditTool] = useState(null)

  // Filters
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCal, setFilterCal] = useState('')

  const loadTools = async () => {
    try {
      const res = await toolsAPI.list()
      setTools(res.data)
    } catch (ex) {
      setError(ex.response?.data?.detail || 'Failed to load tools')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTools() }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return tools.filter(t => {
      if (q && !t.name.toLowerCase().includes(q) && !t.tool_code.toLowerCase().includes(q)) return false
      if (filterType && t.tool_type !== filterType) return false
      if (filterDept && t.department_access !== filterDept) return false
      if (filterStatus && t.status !== filterStatus) return false
      if (filterCal === 'yes' && !t.requires_calibration) return false
      if (filterCal === 'no' && t.requires_calibration) return false
      return true
    })
  }, [tools, search, filterType, filterDept, filterStatus, filterCal])

  const openAdd = () => { setEditTool(null); setShowModal(true) }
  const openEdit = (e, tool) => { e.stopPropagation(); setEditTool(tool); setShowModal(true) }

  const handleRequest = (e, tool) => {
    e.stopPropagation()
    navigate('/requisitions', { state: { prefillTool: tool } })
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 gap-2 text-gray-400">
          <Loader2 size={18} className="animate-spin" /> Loading tools…
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Tools</h1>
          {isAdmin && (
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg">
              <Plus size={16} /> Add Tool
            </button>
          )}
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-44">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name or code…"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
              <option value="">All Types</option>
              <option value="general">General</option>
              <option value="specialized">Specialized</option>
            </select>
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
              <option value="">All Depts</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="calibration_due">Calibration Due</option>
              <option value="damaged">Damaged</option>
            </select>
            <select value={filterCal} onChange={e => setFilterCal(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
              <option value="">All Calibration</option>
              <option value="yes">Requires Cal.</option>
              <option value="no">No Cal. Required</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Wrench size={32} className="mb-3 opacity-40" />
              <p className="text-sm">No tools found matching your search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Tool Code', 'Name', 'Type', 'Dept Access', 'Available / Total', 'Status', 'Storage Bin', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(tool => (
                    <tr
                      key={tool.id}
                      onClick={() => navigate(`/tools/${tool.id}`)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{tool.tool_code}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{tool.name}</td>
                      <td className="px-4 py-3 text-gray-500 capitalize">{tool.tool_type}</td>
                      <td className="px-4 py-3 text-gray-500">{tool.department_access || <span className="text-gray-300">All</span>}</td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${tool.available_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {tool.available_quantity}
                        </span>
                        <span className="text-gray-400"> / {tool.total_quantity}</span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={tool.status} /></td>
                      <td className="px-4 py-3 text-gray-500">{tool.storage_bin_code || <span className="text-gray-300">—</span>}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleRequest(e, tool)}
                            className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
                          >
                            Request
                          </button>
                          {isAdmin && (
                            <button
                              onClick={(e) => openEdit(e, tool)}
                              className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ToolModal
          editTool={editTool}
          onClose={() => setShowModal(false)}
          onSaved={loadTools}
        />
      )}
    </Layout>
  )
}
