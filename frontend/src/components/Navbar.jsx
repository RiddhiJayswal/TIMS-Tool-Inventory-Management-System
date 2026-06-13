import { useState, useEffect, useRef } from 'react'
import { Bell, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { authAPI } from '../api/client'

const ROLE_LABELS = {
  requester: 'Requester',
  dept_head: 'Dept Head',
  maintenance_staff: 'Maint. Staff',
  maintenance_admin: 'Admin',
}

const ROLE_COLORS = {
  requester: 'bg-blue-100 text-blue-700',
  dept_head: 'bg-purple-100 text-purple-700',
  maintenance_staff: 'bg-green-100 text-green-700',
  maintenance_admin: 'bg-amber-100 text-amber-700',
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [showNotifs, setShowNotifs] = useState(false)
  const notifRef = useRef(null)

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await authAPI.getNotifications()
        setNotifications(res.data)
      } catch {}
    }
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 60000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markRead = async (id) => {
    try {
      await authAPI.markRead(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch {}
  }

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div className="text-slate-600 text-sm font-medium">
        Tool Inventory Management System
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center leading-none">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-10 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Notifications</span>
                <span className="text-xs text-gray-400">{notifications.length} unread</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No new notifications</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50">
                      <p className="text-xs text-gray-700 leading-relaxed">{n.message}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs text-gray-400">
                          {new Date(n.created_at).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => markRead(n.id)}
                          className="text-xs text-blue-500 hover:text-blue-700"
                        >
                          Mark read
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-2 text-sm">
          <div className="text-right">
            <div className="font-medium text-gray-800 leading-tight">{user?.full_name}</div>
            <div className="text-xs text-gray-400">{user?.department}</div>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[user?.role] || 'bg-gray-100 text-gray-600'}`}>
            {ROLE_LABELS[user?.role] || user?.role}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors px-2 py-1.5 rounded-md hover:bg-red-50"
          title="Logout"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}
