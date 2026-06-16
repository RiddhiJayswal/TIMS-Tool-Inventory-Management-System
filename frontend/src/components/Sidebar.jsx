import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Wrench,
  ClipboardList,
  CheckSquare,
  ArrowRightCircle,
  ArrowLeftCircle,
  BarChart2,
  Activity,
  Archive,
  Users,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import BrandLogo from './BrandLogo'

const ALL_ROLES = ['requester', 'dept_head', 'maintenance_staff', 'maintenance_admin']
const MAINTENANCE_ROLES = ['maintenance_staff', 'maintenance_admin']

const NAV_ITEMS = [
  { label: 'Dashboard',    path: '/dashboard',     icon: LayoutDashboard, roles: ALL_ROLES },
  { label: 'Tools',        path: '/tools',          icon: Wrench,           roles: ALL_ROLES },
  { label: 'My Requests',  path: '/requisitions',   icon: ClipboardList,    roles: ALL_ROLES },
  { label: 'Approvals',    path: '/approvals',      icon: CheckSquare,      roles: ['dept_head', 'maintenance_admin'] },
  { label: 'Issue Tool',   path: '/issuance',       icon: ArrowRightCircle, roles: MAINTENANCE_ROLES },
  { label: 'Returns',      path: '/returns',        icon: ArrowLeftCircle,  roles: MAINTENANCE_ROLES },
  { label: 'Reports',      path: '/reports',        icon: BarChart2,        roles: MAINTENANCE_ROLES },
  { label: 'Calibration',  path: '/calibration',    icon: Activity,         roles: ['maintenance_admin'] },
  { label: 'Storage Bins', path: '/bins',           icon: Archive,          roles: ['maintenance_admin'] },
  { label: 'User Mgmt',    path: '/users',          icon: Users,            roles: ['maintenance_admin'] },
]

export default function Sidebar() {
  const { user } = useAuth()

  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(user?.role))

  return (
    <aside className="w-56 min-h-screen bg-navy-950 flex flex-col shrink-0 border-r border-white/5">
      {/* Logo area */}
      <div className="px-4 pt-4 pb-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <BrandLogo variant="sidebar" compact />
          <div className="min-w-0">
            <div className="text-white font-bold text-sm leading-tight tracking-wide">TIMS</div>
            <div className="text-[11px] mt-0.5 leading-snug text-slate-400">
              Tool Inventory Management System
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 sidebar-scroll">
        {visibleItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/25'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white hover:translate-x-0.5'
                }`
              }
            >
              <Icon size={16} className="shrink-0 opacity-90 transition-transform duration-200 ease-in-out group-hover:scale-105" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
