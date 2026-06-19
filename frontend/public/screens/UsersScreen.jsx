const NS_USERS = window.MTRSDesignSystemUltraTechCement_660dc9;

const ROLE_LABELS_U = { requester: 'Requester', dept_head: 'Dept Head', maintenance_staff: 'Maint. Staff', maintenance_admin: 'Admin' };
const ROLE_TONES_U = {
  requester:         { bg: 'var(--role-requester-bg)',    fg: 'var(--role-requester-text)' },
  dept_head:         { bg: 'var(--role-depthead-bg)',     fg: 'var(--role-depthead-text)' },
  maintenance_staff: { bg: 'var(--role-maintenance-bg)', fg: 'var(--role-maintenance-text)' },
  maintenance_admin: { bg: 'var(--role-admin-bg)',        fg: 'var(--role-admin-text)' },
};


/* â"€â"€ Shared form shell â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
function EmployeeForm({ title, subtitle, initial = {}, onClose, onSubmit, submitLabel }) {
  const { SlideOver, Button, Input, Select } = NS_USERS;
  const [form, setForm] = React.useState({
    full_name: '', emp_id: '', email: '', phone: '',
    department: '', role: '', joined: '', designation: '', access: 'Standard',
    ...initial,
  });
  const [saving, setSaving] = React.useState(false);
  const valueFrom = (e) => e && e.target ? e.target.value : e;
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: valueFrom(e) }));
  const submit = async () => {
    if (!form.full_name.trim() || !form.emp_id.trim() || !form.email.trim() || !form.department || !form.role) return;
    setSaving(true);
    await onSubmit({
      ...form,
      full_name: form.full_name.trim(),
      emp_id: form.emp_id.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      designation: form.designation.trim(),
    });
  };

  const Section = React.useMemo(() => function Section({ title: t, children }) {
    return (
    <div style={{ marginBottom: 22 }}>
      <h4 style={{ margin: '0 0 12px', paddingBottom: 7, borderBottom: '1px solid var(--border-subtle)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{t}</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>{children}</div>
    </div>
    );
  }, []);
  const Full = React.useMemo(() => function Full({ children }) {
    return <div style={{ gridColumn: '1 / -1' }}>{children}</div>;
  }, []);

  return (
    <SlideOver open onClose={onClose} title={title} subtitle={subtitle}
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button loading={saving} onClick={submit}>{submitLabel}</Button>
      </>}>
      <Section title="Personal Details">
        <Input label="Full Name" required value={form.full_name} onChange={set('full_name')} placeholder="e.g. Anil Kumar" />
        <Input label="Employee ID" required value={form.emp_id} onChange={set('emp_id')} placeholder="e.g. EMP-1011" />
        <Full><Input label="Email Address" required type="email" value={form.email} onChange={set('email')} placeholder="name@ultratech.com" /></Full>
        <Input label="Phone Number" type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
        <Input label="Date of Joining" type="date" value={form.joined} onChange={set('joined')} />
      </Section>
      <Section title="Work Details">
        <Select label="Department" required value={form.department} onChange={set('department')}>
          <option value="">Select departmentâ€¦</option>
          {['Maintenance', 'Mechanical', 'E&I', 'Civil', 'Process'].map(d => <option key={d}>{d}</option>)}
        </Select>
        <Select label="Role" required value={form.role} onChange={set('role')}>
          <option value="">Select roleâ€¦</option>
          <option value="requester">Requester</option>
          <option value="dept_head">Dept Head</option>
          <option value="maintenance_staff">Maintenance Staff</option>
          <option value="maintenance_admin">Admin</option>
        </Select>
        <Full><Input label="Designation" value={form.designation} onChange={set('designation')} placeholder="e.g. Senior Engineer" /></Full>
      </Section>
      <Section title="System Access">
        <Full>
          <Select label="Access Level" value={form.access} onChange={set('access')}>
            <option>Read-only</option>
            <option>Standard</option>
            <option>Full Access</option>
          </Select>
        </Full>
      </Section>
    </SlideOver>
  );
}

/* â"€â"€ Status dropdown â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
function StatusCell({ emp, onToggle }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const isActive = emp.status === 'active';

  React.useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    setTimeout(() => document.addEventListener('click', close), 0);
    return () => document.removeEventListener('click', close);
  }, [menuOpen]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setMenuOpen(m => !m); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 5, border: 'none', cursor: 'pointer',
          fontSize: 11.5, fontWeight: 600, padding: '3px 8px 3px 9px', borderRadius: 'var(--radius-pill)',
          background: isActive ? 'var(--success-bg)' : 'var(--surface-sunken)',
          color: isActive ? 'var(--success-text)' : 'var(--text-muted)',
          fontFamily: 'var(--font-sans)',
        }}>
        {isActive ? 'Active' : 'Inactive'}
        <Icon name="chevron_down" size={11} color="currentColor" />
      </button>
      {menuOpen && (
        <div style={{ position: 'absolute', left: 0, top: 'calc(100% + 4px)', zIndex: 30, background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-floating)', overflow: 'hidden', minWidth: 140 }}>
          {['active', 'inactive'].map(s => (
            <button key={s} onClick={(e) => { e.stopPropagation(); onToggle(emp.id, s); setMenuOpen(false); }}
              style={{ width: '100%', padding: '9px 12px', border: 'none', background: s === emp.status ? 'var(--surface-sunken)' : 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-default)', display: 'flex', alignItems: 'center', gap: 8 }}
              onMouseEnter={e => { if (s !== emp.status) e.currentTarget.style.background = 'var(--surface-sunken)'; }}
              onMouseLeave={e => { if (s !== emp.status) e.currentTarget.style.background = 'transparent'; }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: s === 'active' ? 'var(--success-solid)' : 'var(--text-subtle)' }} />
              {s === 'active' ? 'Active' : 'Inactive'}
              {s === emp.status && <Icon name="check_circle" size={13} color="var(--success-solid)" style={{ marginLeft: 'auto' }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* â"€â"€ Access request card â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
function AccessRequestCard({ req, onDecide }) {
  const FIELDS = [
    { key: 'full_name',   label: 'Full Name' },
    { key: 'emp_id',      label: 'Employee ID' },
    { key: 'department',  label: 'Department' },
    { key: 'role',        label: 'Role', render: v => ROLE_LABELS_U[v] || v },
    { key: 'email',       label: 'Email' },
    { key: 'designation', label: 'Designation' },
  ];
  const [checked, setChecked] = React.useState({});
  const [expanded, setExpanded] = React.useState(false);
  const [rejecting, setRejecting] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState('');
  const allChecked = FIELDS.every(f => checked[f.key]);
  const toggle = k => setChecked(p => ({ ...p, [k]: !p[k] }));
  const pending = req.status === 'pending';

  return (
    <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', background: 'var(--surface-card)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--brand-black)', color: 'var(--brand-yellow)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
          {req.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: 'var(--text-strong)', fontSize: 14 }}>{req.full_name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>{req.emp_id} Â· {req.department} Â· {req.designation} Â· Submitted {req.submitted}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 'var(--radius-pill)', background: pending ? 'var(--warning-bg)' : req.status === 'approved' ? 'var(--success-bg)' : 'var(--danger-bg)', color: pending ? 'var(--warning-text)' : req.status === 'approved' ? 'var(--success-text)' : 'var(--danger-text)', textTransform: 'capitalize' }}>{req.status}</span>
          <button onClick={() => setExpanded(e => !e)}
            style={{ border: '1px solid var(--border-default)', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-sm)', padding: '5px 10px', cursor: 'pointer', fontSize: 12.5, color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 5 }}>
            {expanded ? 'Hide' : 'Verify'} <Icon name="chevron_down" size={12} color="currentColor" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '16px 18px', background: 'var(--surface-sunken)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Check each field to verify before approving:</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            {FIELDS.map(f => (
              <label key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: checked[f.key] ? 'var(--success-bg)' : 'var(--surface-card)', border: `1px solid ${checked[f.key] ? 'var(--success-border,var(--success-bg))' : 'var(--border-default)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.15s' }}>
                <input type="checkbox" checked={!!checked[f.key]} onChange={() => toggle(f.key)} style={{ width: 15, height: 15, cursor: 'pointer', accentColor: 'var(--success-solid)', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 10.5, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{f.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-strong)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.render ? f.render(req[f.key]) : req[f.key]}</div>
                </div>
              </label>
            ))}
          </div>
          {!pending ? (
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              {req.status === 'approved' ? `Approved ${req.approved_at || ''}` : `Rejected: ${req.rejection_reason || 'No reason saved'}`}
            </div>
          ) : !rejecting ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button disabled={!allChecked} onClick={() => onDecide(req.id, 'approved')}
                style={{ flex: 1, height: 38, border: 'none', borderRadius: 'var(--radius-md)', background: allChecked ? 'var(--success-solid)' : 'var(--border-default)', color: allChecked ? '#fff' : 'var(--text-subtle)', fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700, cursor: allChecked ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}>
                {allChecked ? 'Approve Access' : `Verify all ${FIELDS.length} fields to approve`}
              </button>
              <button onClick={() => setRejecting(true)}
                style={{ padding: '0 16px', height: 38, border: '1px solid var(--danger-border,var(--danger-bg))', borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', color: 'var(--danger-text)', fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                Reject
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejection (required)â€¦"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--text-default)', resize: 'vertical', minHeight: 68, boxSizing: 'border-box', outline: 'none' }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button disabled={!rejectReason.trim()} onClick={() => onDecide(req.id, 'rejected', rejectReason)}
                  style={{ flex: 1, height: 36, border: 'none', borderRadius: 'var(--radius-md)', background: rejectReason.trim() ? 'var(--danger-solid)' : 'var(--surface-sunken)', color: rejectReason.trim() ? '#fff' : 'var(--text-subtle)', fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700, cursor: rejectReason.trim() ? 'pointer' : 'not-allowed' }}>
                  Confirm Rejection
                </button>
                <button onClick={() => { setRejecting(false); setRejectReason(''); }}
                  style={{ padding: '0 14px', height: 36, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontSize: 13.5, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* â"€â"€ Remove confirmation panel â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
function RemoveConfirmPanel({ emp, onClose, onConfirm }) {
  const FIELDS = [
    { key: 'full_name',  label: 'Full Name' },
    { key: 'emp_id',     label: 'Employee ID' },
    { key: 'department', label: 'Department' },
    { key: 'role',       label: 'Role', render: v => ROLE_LABELS_U[v] || v },
    { key: 'email',      label: 'Email' },
  ];
  const [checked, setChecked] = React.useState({});
  const [removing, setRemoving] = React.useState(false);
  const allChecked = FIELDS.every(f => checked[f.key]);
  const toggle = k => setChecked(p => ({ ...p, [k]: !p[k] }));

  const confirm = async () => {
    if (!allChecked || removing) return;
    setRemoving(true);
    await onConfirm(emp.id);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 490, margin: '0 16px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--danger-bg)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Icon name="alert_triangle" size={20} color="var(--danger-solid)" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-strong)' }}>Remove Employee</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>This will deactivate <b>{emp.full_name}</b>'s account</div>
          </div>
        </div>
        <div style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Check each field to verify before removing:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
            {FIELDS.map(f => (
              <label key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: checked[f.key] ? 'var(--success-bg)' : 'var(--surface-sunken)', border: `1px solid ${checked[f.key] ? 'var(--success-border,var(--success-bg))' : 'var(--border-default)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.15s' }}>
                <input type="checkbox" checked={!!checked[f.key]} onChange={() => toggle(f.key)} style={{ width: 15, height: 15, cursor: 'pointer', accentColor: 'var(--success-solid)', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 10.5, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{f.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-strong)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.render ? f.render(emp[f.key]) : emp[f.key]}</div>
                </div>
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose}
              style={{ flex: 1, height: 38, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
            <button disabled={!allChecked || removing} onClick={confirm}
              style={{ flex: 2, height: 38, border: 'none', borderRadius: 'var(--radius-md)', background: allChecked && !removing ? 'var(--danger-solid)' : 'var(--border-default)', color: allChecked && !removing ? '#fff' : 'var(--text-subtle)', fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700, cursor: allChecked && !removing ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}>
              {removing ? 'Removing…' : allChecked ? 'Confirm Remove' : `Verify all ${FIELDS.length} fields to remove`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* â"€â"€ Main screen â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
function UsersScreen() {
  const { Button } = NS_USERS;
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('all');
  const [adding, setAdding] = React.useState(false);
  const [editingEmp, setEditingEmp] = React.useState(null);
  const [removingEmp, setRemovingEmp] = React.useState(null);
  const [rows, setRows] = React.useState(window.MOCK.USERS || []);
  const [accessReqs, setAccessReqs] = React.useState(window.MOCK.ACCESS_REQUESTS || []);
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    setRows(window.MOCK.USERS || []);
    setAccessReqs(window.MOCK.ACCESS_REQUESTS || []);
  }, [window.MOCK.USERS]);

  const refreshUsers = async () => {
    await window.API.loadUsers();
    await window.API.loadNotifications().catch(() => {});
    setRows(window.MOCK.USERS || []);
    setAccessReqs(window.MOCK.ACCESS_REQUESTS || []);
  };

  const decideAccessRequest = async (id, decision, reason = '') => {
    setMessage('');
    try {
      if (decision === 'approved') await window.API.approveAccessRequest(id);
      else await window.API.rejectAccessRequest(id, reason);
      await refreshUsers();
      setMessage(decision === 'approved' ? 'Access request approved and user activated.' : 'Access request rejected.');
    } catch (e) {
      setMessage(e.message || 'Could not update access request.');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const updated = await window.API.toggleUserActive(id);
      setRows(rs => rs.map(r => r.id === id ? { ...r, ...updated, emp_id: updated.employee_id, status: updated.is_active ? 'active' : 'inactive' } : r));
      await window.API.loadUsers();
    } catch (e) {
      console.error('User status update failed:', e);
    }
  };

  const removeEmployee = async (id) => {
    try {
      await window.API.updateUser(id, { is_active: false });
      await refreshUsers();
      setRemovingEmp(null);
      setMessage('Employee account has been deactivated.');
    } catch (e) {
      setRemovingEmp(null);
      setMessage(e.message || 'Could not remove employee.');
    }
  };

  const filtered = rows.filter(e => {
    const q = search.toLowerCase();
    const matchQ = !q || e.full_name.toLowerCase().includes(q) || e.emp_id.toLowerCase().includes(q) || e.department.toLowerCase().includes(q);
    return matchQ && (roleFilter === 'all' || e.role === roleFilter);
  });

  const stats = [
    { label: 'Total',       value: rows.length,                                          icon: 'users',            color: 'var(--brand-yellow)' },
    { label: 'Active',      value: rows.filter(e => e.status === 'active').length,       icon: 'check_circle',     color: 'var(--success-solid)' },
    { label: 'Admins',      value: rows.filter(e => e.role === 'maintenance_admin').length, icon: 'building',      color: '#3b82f6' },
    { label: 'Dept Heads',  value: rows.filter(e => e.role === 'dept_head').length,      icon: 'clipboard',        color: 'var(--warning-solid)' },
    { label: 'Requesters',  value: rows.filter(e => e.role === 'requester').length,       icon: 'arrow_right_circle', color: 'var(--role-requester-text)' },
    { label: 'Maint. Staff',value: rows.filter(e => e.role === 'maintenance_staff').length, icon: 'wrench',         color: 'var(--role-maintenance-text)' },
  ];

  return (
    <div className="tims-users">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: 'var(--text-strong)' }}>Users</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--text-muted)' }}>Manage employee access and system roles</p>
        </div>
        <Button onClick={() => setAdding(true)}>
          <Icon name="user_plus" size={15} style={{ marginRight: 6 }} /> Add Employee
        </Button>
      </div>
      {message && (
        <div style={{ marginBottom: 14, padding: '10px 12px', borderRadius: 'var(--radius-md)', background: message.includes('Could not') ? 'var(--danger-bg)' : 'var(--success-bg)', color: message.includes('Could not') ? 'var(--danger-text)' : 'var(--success-text)', fontSize: 12.5, fontWeight: 600 }}>
          {message}
        </div>
      )}

      {/* Stats â€" 3 cols Ã— 2 rows */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 22 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'var(--surface-sunken)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Icon name={s.icon} size={18} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="tims-users-filters" style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Icon name="search" size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, ID or departmentâ€¦"
            style={{ width: '100%', paddingLeft: 34, paddingRight: 12, height: 36, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--text-default)', background: 'var(--surface-card)', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          style={{ height: 36, padding: '0 12px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--text-default)', background: 'var(--surface-card)', cursor: 'pointer', outline: 'none' }}>
          <option value="all">All Roles</option>
          <option value="requester">Requester</option>
          <option value="dept_head">Dept Head</option>
          <option value="maintenance_staff">Maint. Staff</option>
          <option value="maintenance_admin">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="tims-users-table" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: 'var(--surface-sunken)', borderBottom: '1px solid var(--border-default)' }}>
              {['Employee', 'EMP ID', 'Department', 'Role', 'Status', ''].map((h, i) => (
                <th key={i} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp, i) => {
              const tone = ROLE_TONES_U[emp.role] || ROLE_TONES_U.requester;
              const initials = emp.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              return (
                <tr key={emp.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-sunken)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td data-label="Employee" style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--brand-black)', color: 'var(--brand-yellow)', display: 'grid', placeItems: 'center', fontSize: 11.5, fontWeight: 700, flexShrink: 0, letterSpacing: '0.04em' }}>{initials}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{emp.full_name}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-subtle)' }}>{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td data-label="EMP ID" style={{ padding: '11px 14px', color: 'var(--text-muted)', fontSize: 12.5, fontVariantNumeric: 'tabular-nums' }}>{emp.emp_id}</td>
                  <td data-label="Department" style={{ padding: '11px 14px', color: 'var(--text-default)' }}>{emp.department}</td>
                  <td data-label="Role" style={{ padding: '11px 14px' }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 'var(--radius-pill)', background: tone.bg, color: tone.fg }}>{ROLE_LABELS_U[emp.role]}</span>
                  </td>
                  <td data-label="Status" style={{ padding: '11px 14px' }}>
                    <StatusCell emp={emp} onToggle={updateStatus} />
                  </td>
                  <td data-label="Action" style={{ padding: '11px 14px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button onClick={() => setEditingEmp(emp)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: '1px solid var(--border-default)', background: 'var(--surface-card)', color: 'var(--text-muted)', cursor: 'pointer', padding: '5px 11px', borderRadius: 'var(--radius-md)', fontSize: 12.5, fontFamily: 'var(--font-sans)', fontWeight: 500, transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-black)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--brand-black)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-card)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}>
                        <Icon name="eye" size={13} /> Edit
                      </button>
                      <button onClick={() => setRemovingEmp(emp)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: '1px solid var(--danger-border,var(--danger-bg))', background: 'var(--danger-bg)', color: 'var(--danger-text)', cursor: 'pointer', padding: '5px 11px', borderRadius: 'var(--radius-md)', fontSize: 12.5, fontFamily: 'var(--font-sans)', fontWeight: 500, transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-solid)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--danger-solid)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger-text)'; e.currentTarget.style.borderColor = 'var(--danger-border,var(--danger-bg))'; }}>
                        <Icon name="x" size={13} /> Remove
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '44px 0', textAlign: 'center', color: 'var(--text-subtle)', fontSize: 13.5 }}>No employees match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* â"€â"€ Access Requests section â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <div style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text-strong)' }}>Access Requests</h2>
          {accessReqs.filter(r => r.status === 'pending').length > 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-pill)', background: 'var(--warning-bg)', color: 'var(--warning-text)' }}>{accessReqs.filter(r => r.status === 'pending').length} pending</span>
          )}
        </div>
        {accessReqs.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center', background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', color: 'var(--text-subtle)', fontSize: 13.5 }}>
            <Icon name="check_circle" size={24} color="var(--success-solid)" style={{ display: 'block', margin: '0 auto 8px' }} />
            No pending access requests
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {accessReqs.map(r => (
              <AccessRequestCard key={r.id} req={r} onDecide={decideAccessRequest} />
            ))}
          </div>
        )}
      </div>

      {/* Add employee */}
      {adding && (
        <EmployeeForm
          title="Add Employee" subtitle="Create a new system user" submitLabel="Add Employee"
          onClose={() => setAdding(false)}
          onSubmit={async (form) => {
            const created = await window.API.createUser({
              employee_id: form.emp_id,
              full_name: form.full_name,
              email: form.email,
              department: form.department,
              role: form.role,
              password: `${form.emp_id}@123`,
            });
            await window.API.loadUsers();
            setRows(window.MOCK.USERS && window.MOCK.USERS.length ? window.MOCK.USERS : [{ ...created, emp_id: created.employee_id, status: created.is_active ? 'active' : 'inactive' }]);
            setAdding(false);
          }} />
      )}

      {/* Edit employee */}
      {editingEmp && (
        <EmployeeForm
          title="Edit Employee" subtitle={`Editing ${editingEmp.full_name}`} submitLabel="Save Changes"
          initial={editingEmp}
          onClose={() => setEditingEmp(null)}
          onSubmit={async (form) => {
            await window.API.updateUser(editingEmp.id, {
              full_name: form.full_name,
              email: form.email,
              department: form.department,
              role: form.role,
            });
            await window.API.loadUsers();
            setRows(window.MOCK.USERS || []);
            setEditingEmp(null);
          }} />
      )}

      {/* Remove employee confirmation */}
      {removingEmp && (
        <RemoveConfirmPanel
          emp={removingEmp}
          onClose={() => setRemovingEmp(null)}
          onConfirm={removeEmployee}
        />
      )}
    </div>
  );
}

Object.assign(window, { UsersScreen });
