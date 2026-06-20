import { useEffect, useState } from 'react'
import { Archive, Loader2, Plus, X } from 'lucide-react'
import { binsAPI } from '../api/client'
import { useDataSync } from '../data/DataSyncContext'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'

const EMPTY_FORM = {
  bin_code: '',
  shelf_label: '',
  section: '',
  department_cat: '',
  description: '',
  capacity: '',
}

function BinModal({ bin, onClose, onSaved }) {
  const { actions } = useDataSync()
  const [form, setForm] = useState(bin ? { ...bin, department_cat: bin.department_category || '' } : EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    setSaving(true)
    const payload = {
      shelf_label: form.shelf_label.trim(),
      section: form.section.trim() || null,
      department_cat: form.department_cat.trim() || null,
      description: form.description.trim() || null,
      capacity: form.capacity ? Number(form.capacity) : null,
    }
    try {
      if (bin) {
        await actions.updateBin(bin.id, payload)
      } else {
        await actions.addBin({ ...payload, bin_code: form.bin_code.trim().toUpperCase() })
      }
      onSaved()
      onClose()
    } catch (ex) {
      setErr(ex.response?.data?.detail || 'Failed to save storage bin')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">{bin ? 'Edit Storage Bin' : 'Add Storage Bin'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {err && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{err}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Bin Code *</label>
              <input required disabled={!!bin} value={form.bin_code} onChange={(e) => set('bin_code', e.target.value.toUpperCase())} className="input-control" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Shelf Label *</label>
              <input required value={form.shelf_label} onChange={(e) => set('shelf_label', e.target.value)} className="input-control" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Section</label>
              <input value={form.section || ''} onChange={(e) => set('section', e.target.value)} className="input-control" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
              <input value={form.department_cat || ''} onChange={(e) => set('department_cat', e.target.value)} className="input-control" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Capacity</label>
              <input type="number" min="1" value={form.capacity || ''} onChange={(e) => set('capacity', e.target.value)} className="input-control" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description || ''} onChange={(e) => set('description', e.target.value)} className="input-control resize-none" rows={2} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Saving...' : 'Save Bin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function StorageBins() {
  const { version } = useDataSync()
  const [bins, setBins] = useState([])
  const [selected, setSelected] = useState(null)
  const [binTools, setBinTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalBin, setModalBin] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const loadBins = async () => {
    setError('')
    try {
      const res = await binsAPI.list()
      setBins(res.data)
      if (selected) {
        const stillSelected = res.data.find((b) => b.id === selected.id)
        setSelected(stillSelected || null)
      }
    } catch (ex) {
      setError(ex.response?.data?.detail || 'Failed to load storage bins')
    } finally {
      setLoading(false)
    }
  }

  const loadBinTools = async (bin) => {
    setSelected(bin)
    try {
      const res = await binsAPI.tools(bin.id)
      setBinTools(res.data)
    } catch {
      setBinTools([])
    }
  }

  useEffect(() => { loadBins() }, [version])
  useEffect(() => {
    if (selected) loadBinTools(selected)
  }, [version])

  const openAdd = () => { setModalBin(null); setShowModal(true) }
  const openEdit = (bin) => { setModalBin(bin); setShowModal(true) }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 gap-2 text-gray-400">
          <Loader2 size={18} className="animate-spin" /> Loading storage bins...
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Storage Bins</h1>
          <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Add Bin</button>
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

        <div className="table-shell">
          {bins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Archive size={32} className="mb-3 opacity-40" />
              <p className="text-sm">No storage bins found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Bin Code', 'Shelf', 'Section', 'Department', 'Tools', 'Occupancy', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bins.map((bin) => (
                    <tr key={bin.id}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{bin.bin_code}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{bin.shelf_label}</td>
                      <td className="px-4 py-3 text-gray-500">{bin.section || '-'}</td>
                      <td className="px-4 py-3 text-gray-500">{bin.department_category || 'All'}</td>
                      <td className="px-4 py-3">{bin.tool_count}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {bin.capacity ? `${bin.used_units || 0} / ${bin.capacity}` : `${bin.used_units || 0} / -`}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => loadBinTools(bin)} className="btn-soft bg-blue-50 text-blue-700 hover:bg-blue-100">View Tools</button>
                          <button onClick={() => openEdit(bin)} className="btn-soft bg-slate-100 text-slate-700 hover:bg-slate-200">Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selected && (
          <div className="table-shell">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">Tools in {selected.bin_code}</h2>
              <span className="text-xs text-gray-400">{binTools.length} tool{binTools.length !== 1 ? 's' : ''}</span>
            </div>
            {binTools.length === 0 ? (
              <div className="px-5 py-8 text-sm text-gray-400">No tools assigned to this bin.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['Code', 'Tool', 'Type', 'Available / Total', 'Issued', 'Status'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {binTools.map((tool) => (
                      <tr key={tool.id}>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{tool.tool_code}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{tool.name}</td>
                        <td className="px-4 py-3 text-gray-500 capitalize">{tool.tool_type}</td>
                        <td className="px-4 py-3">{tool.available_quantity} / {tool.total_quantity}</td>
                        <td className="px-4 py-3">{tool.issued_quantity}</td>
                        <td className="px-4 py-3"><StatusBadge status={tool.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <BinModal
          bin={modalBin}
          onClose={() => setShowModal(false)}
          onSaved={loadBins}
        />
      )}
    </Layout>
  )
}
