import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, X } from 'lucide-react'

const ToastContext = createContext(null)

const STYLES = {
  success: 'bg-green-600 text-white',
  error:   'bg-red-600 text-white',
  warning: 'bg-amber-500 text-white',
}

const ICONS = {
  success: CheckCircle2,
  error:   XCircle,
  warning: AlertTriangle,
}

function ToastContainer({ toasts, remove }) {
  return (
    <div className="fixed top-4 right-4 z-[200] space-y-2 pointer-events-none">
      {toasts.map(t => {
        const Icon = ICONS[t.type] || CheckCircle2
        return (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-72 max-w-sm pointer-events-auto ${STYLES[t.type] || STYLES.success}`}
          >
            <Icon size={16} className="shrink-0" />
            <span className="text-sm font-medium flex-1">{t.message}</span>
            <button onClick={() => remove(t.id)} className="shrink-0 opacity-75 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => remove(id), 4000)
  }, [remove])

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <ToastContainer toasts={toasts} remove={remove} />
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}
