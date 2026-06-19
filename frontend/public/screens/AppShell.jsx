const NS_SHELL = window.MTRSDesignSystemUltraTechCement_660dc9;

const ALL_NAV_GROUPS = [
  { label: 'Operations', items: [
    { key: 'dashboard',    label: 'Dashboard',   icon: 'dashboard',         roles: ['requester','dept_head','maintenance_staff','maintenance_admin'] },
    { key: 'requisitions', label: 'My Requests', icon: 'clipboard',          roles: ['requester','dept_head','maintenance_staff','maintenance_admin'] },
    { key: 'approvals',    label: 'Approvals',   icon: 'check_square',       roles: ['dept_head','maintenance_admin'] },
  ]},
  { label: 'Inventory', items: [
    { key: 'tools',    label: 'Tools',      icon: 'wrench',             roles: ['requester','dept_head','maintenance_staff','maintenance_admin'] },
    { key: 'issuance', label: 'Issue Tool', icon: 'arrow_right_circle', roles: ['maintenance_staff','maintenance_admin'] },
    { key: 'returns',  label: 'Returns',    icon: 'arrow_left_circle',  roles: ['maintenance_staff','maintenance_admin'] },
  ]},
  { label: 'Admin', items: [
    { key: 'reports',     label: 'Reports',      icon: 'bar_chart', roles: ['maintenance_staff','maintenance_admin'] },
    { key: 'calibration', label: 'Calibration',  icon: 'activity',  roles: ['maintenance_admin'] },
    { key: 'bins',        label: 'Storage Bins', icon: 'archive',   roles: ['maintenance_staff','maintenance_admin'] },
    { key: 'users',       label: 'Users',        icon: 'users',     roles: ['maintenance_admin'] },
  ]},
];

function getNavGroups(role) {
  return ALL_NAV_GROUPS.map(g => ({
    ...g,
    items: g.items.filter(it => it.roles.includes(role)),
  })).filter(g => g.items.length > 0);
}

const ROLE_LABELS = { requester: 'Requester', dept_head: 'Dept Head', maintenance_staff: 'Maint. Staff', maintenance_admin: 'Admin' };
const ROLE_TONE = {
  requester: { bg: 'var(--role-requester-bg)', fg: 'var(--role-requester-text)' },
  dept_head: { bg: 'var(--role-depthead-bg)', fg: 'var(--role-depthead-text)' },
  maintenance_staff: { bg: 'var(--role-maintenance-bg)', fg: 'var(--role-maintenance-text)' },
  maintenance_admin: { bg: 'var(--role-admin-bg)', fg: 'var(--role-admin-text)' },
};

function Sidebar({ route, onNavigate, collapsed, onToggle, user }) {
  const { Logo } = NS_SHELL;
  const _summary = window.MOCK?.SUMMARY || {};
  const navBadges = {
    requisitions: _summary.my_pending_requests || 0,
    approvals:    _summary.pending_approvals_count || 0,
    issuance:     (window.MOCK?.APPROVED_QUEUE || []).length || _summary.approved_queue_count || 0,
    returns:      _summary.overdue_count || 0,
    calibration:  _summary.calibration_due_count || 0,
    users:        (window.MOCK?.ACCESS_REQUESTS || []).filter(r => r.status === 'pending').length,
  };
  const toggleBtn = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 30, height: 30, border: 'none', background: 'transparent',
    borderRadius: 'var(--radius-md)', color: 'rgba(255,255,255,0.55)',
    cursor: 'pointer', flexShrink: 0, padding: 0,
  };
  return (
    <aside className={`tims-sidebar ${collapsed ? 'is-collapsed' : 'is-expanded'}`} style={{
      width: collapsed ? 64 : 224, flexShrink: 0, background: 'var(--brand-black)',
      display: 'flex', flexDirection: 'column', height: '100%', borderTop: 'var(--brand-accent-line)',
      transition: 'width 0.2s cubic-bezier(0.4,0,0.2,1)', overflow: 'hidden',
    }}>
      <div style={{
        padding: collapsed ? '14px 0' : '15px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: 8, minHeight: 66,
      }}>
        {collapsed ? (
          <button onClick={onToggle} title="Expand sidebar" style={toggleBtn}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Icon name="menu" size={19} color="rgba(255,255,255,0.75)" />
          </button>
        ) : (
          <>
            <Logo variant="sidebar" logoSrc="/assets/ultratech-logo.png" />
            <button onClick={onToggle} title="Collapse sidebar" style={toggleBtn}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Icon name="menu" size={18} />
            </button>
          </>
        )}
      </div>
      <nav style={{ flex: 1, overflowY: 'auto', padding: collapsed ? '14px 8px' : '14px 12px' }}>
        {getNavGroups((user || {}).role || 'requester').map((g) => (
          <div key={g.label} style={{ marginBottom: collapsed ? 4 : 16 }}>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 0 10px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {g.items.map((it) => {
                const active = route === it.key;
                return (
                  <button key={it.key} onClick={() => onNavigate(it.key)}
                    title={collapsed ? it.label : undefined}
                    style={{
                      position: 'relative', display: 'flex', alignItems: 'center',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      gap: collapsed ? 0 : 11,
                      padding: collapsed ? '10px 0' : '9px 10px 9px 12px',
                      border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                      borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 500,
                      background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                      color: active ? '#fff' : 'rgba(255,255,255,0.66)',
                      transition: 'background var(--duration-fast), color var(--duration-fast)',
                    }}
                    onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}}
                    onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.66)'; }}}>
                    {active && (
                      <span style={{
                        position: 'absolute', left: 0, width: 3, borderRadius: 3, background: 'var(--brand-yellow)',
                        top: collapsed ? '50%' : 8,
                        ...(collapsed ? { transform: 'translateY(-50%)', height: 20 } : { bottom: 8 }),
                      }} />
                    )}
                    <Icon name={it.icon} size={17} color={active ? 'var(--brand-yellow)' : 'currentColor'} />
                    {!collapsed && it.label}
                    {(() => { const count = navBadges[it.key] || 0; return count > 0 ? (
                      !collapsed ? (
                        <span style={{
                          marginLeft: 'auto', minWidth: 18, height: 18, borderRadius: 9,
                          background: 'var(--danger-solid)', color: '#fff',
                          fontSize: 10, fontWeight: 700, lineHeight: 1,
                          display: 'grid', placeItems: 'center', padding: '0 4px', flexShrink: 0,
                        }}>
                          {count > 99 ? '99+' : count}
                        </span>
                      ) : (
                        <span style={{
                          position: 'absolute', top: 6, right: 6,
                          minWidth: 15, height: 15, borderRadius: 8,
                          background: 'var(--danger-solid)', color: '#fff',
                          fontSize: 9, fontWeight: 700, lineHeight: 1,
                          display: 'grid', placeItems: 'center', padding: '0 3px',
                          border: '1.5px solid var(--brand-black)',
                        }}>
                          {count > 9 ? '9+' : count}
                        </span>
                      )
                    ) : null; })()}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function routeFromNotification(message) {
  if (!message) return null;
  const m = message.toLowerCase();
  if (m.includes('access request') || (m.includes('requested') && m.includes('access'))) return 'users';
  if (m.startsWith('overdue') || m.includes('past return date') || m.includes('damage assessment') || (m.includes('return') && m.includes('damage'))) return 'returns';
  if (m.includes('calibration')) return 'calibration';
  if (m.includes('approved') || m.includes('rejected') || m.includes('requisition')) return 'requisitions';
  if (m.includes('issued') || m.includes('issuance')) return 'issuance';
  return null;
}

function Navbar({ user, notifs = [], onLogout, onNavigate }) {
  const [open, setOpen] = React.useState(false);
  const [, forceRefresh] = React.useState(0);
  const tone = ROLE_TONE[user.role] || ROLE_TONE.requester;
  const notifRef = React.useRef(null);
  const liveNotifs = window.MOCK?.NOTIFS || notifs || [];

  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const todayDate = liveNotifs.length > 0 ? liveNotifs[0].date : null;
  const tagged = liveNotifs.map((n, i) => ({ ...n, idx: i }));
  const newNotifs = tagged.filter(n => n.date === todayDate && !n.is_read);
  const earlierNotifs = tagged.filter(n => n.date !== todayDate || n.is_read);
  const unreadCount = tagged.filter(n => !n.is_read).length;

  const markRead = async (n) => {
    if (!n.id) return;
    await window.API?.markNotificationRead?.(n.id).catch(() => {});
    await window.API?.loadNotifications?.().catch(() => {});
    forceRefresh(v => v + 1);
  };
  const markAllRead = async () => {
    const unread = liveNotifs.filter(n => !n.is_read && n.id);
    await Promise.all(unread.map(n => window.API?.markNotificationRead?.(n.id).catch(() => {})));
    await window.API?.loadNotifications?.().catch(() => {});
    forceRefresh(v => v + 1);
  };

  const SectionLabel = ({ label }) => (
    <div style={{ padding: '6px 14px 4px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-subtle)', background: 'var(--surface-sunken)', borderBottom: '1px solid var(--border-subtle)' }}>{label}</div>
  );

  const NotifRow = ({ n }) => {
    const isRead = !!n.is_read;
    const dest = routeFromNotification(n.message);
    const baseBg = isRead ? 'transparent' : 'rgba(250,196,0,0.04)';
    const hoverBg = isRead ? 'var(--surface-sunken)' : 'rgba(250,196,0,0.10)';
    const handleClick = async () => {
      if (!isRead) markRead(n).catch(() => {});
      setOpen(false);
      if (dest && onNavigate) onNavigate(dest);
    };
    return (
      <div onClick={handleClick}
        style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: 9, alignItems: 'flex-start', background: baseBg, cursor: dest ? 'pointer' : 'default', transition: 'background 0.12s' }}
        onMouseEnter={e => { e.currentTarget.style.background = hoverBg; }}
        onMouseLeave={e => { e.currentTarget.style.background = baseBg; }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', marginTop: 5, flexShrink: 0, background: isRead ? 'transparent' : 'var(--brand-yellow)' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.45, color: isRead ? 'var(--text-subtle)' : 'var(--text-default)', whiteSpace: 'normal', overflowWrap: 'anywhere' }}>{n.message || 'Notification update'}</p>
          <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 4 }}>
            {n.date}
            {dest && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 600, color: 'var(--text-subtle)', letterSpacing: '0.04em' }}>→ {dest === 'requisitions' ? 'My Requests' : dest === 'issuance' ? 'Issue Tool' : dest.charAt(0).toUpperCase() + dest.slice(1)}</span>}
          </div>
        </div>
        {!isRead && (
          <button onClick={e => { e.stopPropagation(); markRead(n); }} title="Mark as read"
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-subtle)', padding: 2, flexShrink: 0, display: 'flex', borderRadius: 'var(--radius-sm)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--success-solid)'; e.currentTarget.style.background = 'var(--success-bg)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-subtle)'; e.currentTarget.style.background = 'transparent'; }}>
            <Icon name="check_circle" size={15} />
          </button>
        )}
      </div>
    );
  };

  return (
    <header className="tims-navbar" style={{
      height: 'var(--navbar-height)', flexShrink: 0, background: 'var(--surface-card)',
      borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 22px',
    }}>
      <div className="tims-navbar-title" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>Tools Inventory Management System</div>
      <div className="tims-navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button onClick={() => setOpen(!open)} style={{
            position: 'relative', display: 'grid', placeItems: 'center', width: 34, height: 34,
            border: 'none', background: open ? 'var(--surface-sunken)' : 'transparent',
            borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', cursor: 'pointer',
          }}>
            <Icon name="bell" size={18} />
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: 5, right: 5, minWidth: 15, height: 15, padding: '0 3px', borderRadius: 8, background: 'var(--danger-solid)', color: '#fff', fontSize: 9.5, fontWeight: 700, display: 'grid', placeItems: 'center', border: '1.5px solid var(--surface-card)' }}>{unreadCount}</span>
            )}
          </button>
          {open && (
            <div className="tims-notif-menu" style={{ position: 'absolute', right: 0, top: 40, width: 380, maxHeight: 440, background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-floating)', zIndex: 40, overflowY: 'auto', overflowX: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>Notifications</span>
                {unreadCount > 0 ? (
                  <button onClick={markAllRead} style={{ fontSize: 11.5, color: 'var(--text-muted)', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-sans)', padding: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-strong)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                    Mark all read
                  </button>
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--success-text)', background: 'var(--success-bg)', padding: '2px 8px', borderRadius: 'var(--radius-pill)' }}>All read</span>
                )}
              </div>
              {liveNotifs.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-subtle)', textAlign: 'center', padding: '24px 0' }}>No notifications</p>
              ) : (
                <>
                  {newNotifs.length > 0 && <>
                    <SectionLabel label="New" />
                    {newNotifs.map(n => <NotifRow key={n.idx} n={n} />)}
                  </>}
                  {earlierNotifs.length > 0 && <>
                    <SectionLabel label="Earlier" />
                    {earlierNotifs.map(n => <NotifRow key={n.idx} n={n} />)}
                  </>}
                </>
              )}
            </div>
          )}
        </div>
        <div className="tims-user-chip" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'right', lineHeight: 1.25 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>{user.full_name}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-subtle)' }}>{user.department}</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 'var(--radius-pill)', background: tone.bg, color: tone.fg }}>{ROLE_LABELS[user.role]}</span>
        </div>
        <button className="tims-logout-btn" onClick={onLogout} title="Logout" style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', padding: '7px 8px', borderRadius: 'var(--radius-md)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger-solid)'; e.currentTarget.style.background = 'var(--danger-bg)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}>
          <Icon name="logout" size={16} /> Logout
        </button>
      </div>
    </header>
  );
}

function AppShell({ user, route, onNavigate, notifs, onLogout, children }) {
  const [collapsed, setCollapsed] = React.useState(false);

  React.useEffect(() => {
    const s = document.createElement('style');
    s.id = 'tims-main-scroll';
    s.textContent = 'main::-webkit-scrollbar{width:5px;height:5px}main::-webkit-scrollbar-track{background:transparent}main::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.12);border-radius:10px}main::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,0.22)}';
    if (!document.getElementById('tims-main-scroll')) document.head.appendChild(s);
    return () => { const el = document.getElementById('tims-main-scroll'); if (el) el.remove(); };
  }, []);

  React.useEffect(() => {
    const syncSidebar = () => {
      if (window.innerWidth <= 820) setCollapsed(true);
    };
    syncSidebar();
    window.addEventListener('resize', syncSidebar);
    return () => window.removeEventListener('resize', syncSidebar);
  }, []);

  return (
    <div className="tims-shell" style={{ display: 'flex', height: '100%', overflow: 'hidden', background: 'var(--surface-page)' }}>
      <Sidebar route={route} onNavigate={onNavigate} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} user={user} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Navbar user={user} notifs={notifs} onLogout={onLogout} onNavigate={onNavigate} />
        <main className="tims-main" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '24px 26px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.12) transparent' }}>{children}</main>
      </div>
    </div>
  );
}

Object.assign(window, { AppShell });
