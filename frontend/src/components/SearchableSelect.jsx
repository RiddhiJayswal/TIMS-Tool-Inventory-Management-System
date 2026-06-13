import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Loader2, AlertTriangle } from 'lucide-react'
import { toolsAPI } from '../api/client'
import StatusBadge from './StatusBadge'

const UNAVAILABLE = ['calibration_due', 'damaged', 'written_off']

function isDisabled(tool) {
  return UNAVAILABLE.includes(tool.status) || tool.available_quantity === 0
}

export default function SearchableSelect({ value, onChange, placeholder = 'Search tools…' }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const timerRef = useRef(null)
  const wrapperRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handle = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const search = useCallback((q) => {
    clearTimeout(timerRef.current)
    if (!q.trim()) { setResults([]); setOpen(false); return }
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await toolsAPI.list({ search: q, status: undefined })
        setResults(res.data)
        setOpen(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [])

  const handleInput = (e) => {
    setQuery(e.target.value)
    if (value) onChange(null)
    search(e.target.value)
  }

  const handleSelect = (tool) => {
    if (isDisabled(tool)) return
    onChange(tool)
    setQuery(`${tool.tool_code} — ${tool.name}`)
    setOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={value ? `${value.tool_code} — ${value.name}` : query}
          onChange={handleInput}
          onFocus={() => { if (results.length) setOpen(true) }}
          placeholder={placeholder}
          className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
        {loading && (
          <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 max-h-56 overflow-y-auto">
          {results.map(tool => {
            const disabled = isDisabled(tool)
            const lowStock = !disabled && tool.available_quantity <= 1
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => handleSelect(tool)}
                disabled={disabled}
                className={`w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 transition-colors
                  ${disabled ? 'opacity-40 cursor-not-allowed bg-gray-50' : 'hover:bg-amber-50 cursor-pointer'}`}
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">
                    {tool.name}
                    <span className="text-xs text-gray-400 ml-1.5">{tool.tool_code}</span>
                  </div>
                  {lowStock && (
                    <div className="flex items-center gap-1 text-xs text-amber-600 mt-0.5">
                      <AlertTriangle size={10} />
                      Only {tool.available_quantity} unit(s) available — low stock
                    </div>
                  )}
                  {disabled && (
                    <div className="text-xs text-red-500 mt-0.5">
                      {tool.available_quantity === 0 ? 'Out of stock' : `Status: ${tool.status.replace(/_/g, ' ')}`}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-semibold ${tool.available_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tool.available_quantity}/{tool.total_quantity}
                  </span>
                  <StatusBadge status={tool.status} />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
