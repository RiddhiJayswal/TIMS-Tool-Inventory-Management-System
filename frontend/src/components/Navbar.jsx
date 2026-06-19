import { useState, useEffect, useRef } from 'react'
import { Bell, LogOut } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { authAPI } from '../api/client'
import { useDataSync } from '../data/DataSyncContext'
import BrandLogo from './BrandLogo'

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
  const { version } = useDataSync()
  const [notifications, setNotifications] = useState([])
  const [showNotifs, setShowNotifs] = useState(false)
  const notifRef = useRef(null)

  const newNotifications = notifications.filter(n => !n.is_read)
  const olderNotifications = notifications.filter(n => n.is_read)

  const fetchNotifs = async () => {
    try {
      const res = await authAPI.getNotifications()
      setNotifications(res.data)
    } catch {}
  }

  useEffect(() => {
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchNotifs()
  }, [version])

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
      const res = await authAPI.markRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? res.data : n))
    } catch {}
  }

  return (
    <header className="h-16 bg-white/95 border-b border-slate-200 flex items-center justify-between px-5 sm:px-6 shrink-0 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
      <div className="flex items-center gap-5 min-w-0">
        <BrandLogo variant="navbar" compact />
        <div className="text-slate-700 text-sm font-semibold truncate">
          Tools Inventory Management System
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200 ease-in-out"
          >
            <Bell size={18} />
            {newNotifications.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center leading-none">
                {newNotifications.length > 9 ? '9+' : newNotifications.length}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-11 w-96 bg-white border border-slate-200 rounded-lg shadow-panel z-50 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">Notifications</span>
                <span className="text-xs text-gray-400">{newNotifications.length} new</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No new notifications</p>
                ) : (
                  <>
                    <NotificationSection
                      title="New"
                      emptyText="No new messages"
                      notifications={newNotifications}
                      onMarkRead={markRead}
                    />
                    <NotificationSection
                      title="Older"
                      emptyText="No older messages"
                      notifications={olderNotifications}
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="hidden sm:flex items-center gap-2 text-sm">
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
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition-all duration-200 ease-in-out px-2.5 py-2 rounded-lg hover:bg-red-50"
          title="Logout"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}

function NotificationSection({ title, emptyText, notifications, onMarkRead }) {
  return (
    <section>
      <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </div>
      {notifications.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-5">{emptyText}</p>
      ) : (
        notifications.map(n => (
          <div
            key={n.id}
            className={`px-4 py-3 border-b border-gray-50 ${n.is_read ? 'bg-white' : 'bg-amber-50/60'} hover:bg-gray-50`}
          >
            <p className={`text-xs leading-relaxed ${n.is_read ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>
              {n.message}
            </p>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs text-gray-400">
                {new Date(n.created_at).toLocaleString()}
              </span>
              {!n.is_read && onMarkRead && (
                <button
                  onClick={() => onMarkRead(n.id)}
                  className="text-xs text-blue-500 hover:text-blue-700"
                >
                  Mark read
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </section>
  )
}
