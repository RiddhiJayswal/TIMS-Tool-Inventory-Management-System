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
    <aside className="w-56 min-h-screen bg-navy-900 flex flex-col shrink-0">
      {/* Logo area */}
      <div className="px-4 py-5 border-b border-navy-700">
        <BrandLogo className="h-24 w-full object-contain mix-blend-screen" compact />
        <div className="text-white font-bold text-sm leading-tight mt-2">TIMS</div>
        <div className="text-xs mt-0.5" style={{ color: '#6b8fa8' }}>
          Tool Inventory Management
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {visibleItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-white'
                    : 'text-slate-300 hover:bg-navy-700 hover:text-white'
                }`
              }
            >
              <Icon size={16} />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
