const NS_DASH = window.MTRSDesignSystemUltraTechCement_660dc9;

/* ── Centred overlay panel ─────────────────────────────────────────── */
function CentrePanel({ title, subtitle, onClose, children }) {
  React.useEffect(() => {
    if (!document.getElementById('dp-anim')) {
      const s = document.createElement('style');
      s.id = 'dp-anim';
      s.textContent = '@keyframes dpBg{from{opacity:0}to{opacity:1}} @keyframes dpBox{from{opacity:0;transform:translateY(22px) scale(0.97)}to{opacity:1;transform:none}}';
      document.head.appendChild(s);
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{
      position: 'fixed', inset: 0, zIndex: 60,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 28, animation: 'dpBg 0.18s ease',
    }}>
      <div style={{
        width: '90vw', maxWidth: 1100, height: '88vh',
        display: 'flex', flexDirection: 'column',
        background: 'var(--surface-page,#f5f6f8)',
        borderRadius: 'var(--radius-xl,16px)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.26), 0 8px 24px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        animation: 'dpBox 0.24s cubic-bezier(0.34,1.1,0.64,1)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 28px', borderBottom: '1px solid var(--border-default)', background: 'var(--surface-card)', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-strong)' }}>{title}</div>
            {subtitle && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{ display: 'grid', placeItems: 'center', width: 34, height: 34, border: '1px solid var(--border-default)', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}>
            <Icon name="x" size={17} />
          </button>
        </div>
        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 28, scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.12) transparent' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Chip filter row ───────────────────────────────────────────────── */
function ChipGroup({ label, value, onChange, options }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.07em', textTransform: 'uppercase', flexShrink: 0 }}>{label}</span>
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <button key={opt.value} onClick={() => onChange(opt.value)} style={{
            padding: '4px 11px', borderRadius: 'var(--radius-pill)', border: '1px solid',
            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)',
            minWidth: 0,
            background: active ? 'var(--brand-black)' : 'transparent',
            color: active ? '#fff' : 'var(--text-muted)',
            borderColor: active ? 'var(--brand-black)' : 'var(--border-default)',
            transition: 'background 0.13s, color 0.13s, border-color 0.13s',
          }}>{opt.label}</button>
        );
      })}
    </div>
  );
}

/* ── Per-tool issuance breakdown modal ────────────────────────────── */
function ToolDetailModal({ tool, onClose }) {
  const issued = (window.MOCK.ACTIVE_ISSUANCES || []).filter(i =>
    i.tool_code === tool.tool_code || i.tool_name === tool.name
  );
  const issuedUnitCount = issued.reduce((sum, i) => sum + Number(i.qty || 0), 0);
  const availCount = tool.available;
  const STATE_BADGE = {
    on_time:   ['var(--success-bg)', 'var(--success-text)', 'On Time'],
    due_today: ['var(--warning-bg)', 'var(--warning-text)', 'Due Today'],
    overdue:   ['var(--danger-bg)',  'var(--danger-text)',  'Overdue'],
  };
  const SectionHead = ({ label }) => (
    <div style={{ padding: '9px 24px 7px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-subtle)', background: 'var(--surface-sunken)', borderBottom: '1px solid var(--border-subtle)' }}>{label}</div>
  );
  const Info = ({ label, value }) => (
    <div>
      <div style={{ fontSize: 10.5, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{label}</div>
      <div style={{ marginTop: 3, fontSize: 13, color: value ? 'var(--text-default)' : 'var(--text-subtle)' }}>{value || 'Not set'}</div>
    </div>
  );
  const unitStartFor = (idx) => issued.slice(0, idx).reduce((sum, row) => sum + Number(row.qty || 0), 0) + 1;
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{
      position: 'fixed', inset: 0, zIndex: 70,
      background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 48, animation: 'dpBg 0.15s ease',
    }}>
      <div style={{
        width: 640, maxHeight: '78vh',
        display: 'flex', flexDirection: 'column',
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-xl,16px)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
        overflow: 'hidden',
        animation: 'dpBox 0.2s cubic-bezier(0.34,1.1,0.64,1)',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-default)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-subtle)', marginBottom: 3 }}>{tool.tool_code}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-strong)' }}>{tool.name}</div>
              <div style={{ display: 'flex', gap: 10, marginTop: 6, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                <span style={{ textTransform: 'capitalize' }}>{tool.tool_type}</span>
                <span>·</span>
                <span>Bin: <b>{tool.bin}</b></span>
                <span>·</span>
                <span style={{ color: tool.available > 0 ? 'var(--success-text)' : 'var(--danger-text)', fontWeight: 600 }}>{tool.available} available</span>
                <span style={{ color: 'var(--text-subtle)' }}>/ {tool.total} total</span>
              </div>
            </div>
            <button onClick={onClose} style={{ display: 'grid', placeItems: 'center', width: 32, height: 32, border: '1px solid var(--border-default)', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}>
              <Icon name="x" size={16} />
            </button>
          </div>
        </div>
        {/* Unit rows */}
        <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.1) transparent' }}>
          <SectionHead label="Basic information" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
            <Info label="Category" value={tool.category} />
            <Info label="Make" value={tool.make} />
            <Info label="Model" value={tool.model} />
            <Info label="Serial No." value={tool.serial_number} />
            <Info label="Department" value={tool.department_access || 'All'} />
            <Info label="Condition" value={tool.status} />
          </div>
          <SectionHead label="Inventory, value and calibration" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
            <Info label="Total qty" value={tool.total} />
            <Info label="Available qty" value={tool.available} />
            <Info label="Issued qty" value={issuedUnitCount || tool.issued || 0} />
            <Info label="Purchase date" value={tool.purchase_date} />
            <Info label="Purchase cost" value={tool.purchase_price != null ? window.inr(tool.purchase_price) : ''} />
            <Info label="Current value" value={tool.current_value != null ? window.inr(tool.current_value) : ''} />
            <Info label="Storage bin" value={tool.bin} />
            <Info label="Calibration" value={tool.requires_calibration ? 'Required' : 'Not required'} />
            <Info label="Service partner" value={tool.service_partner} />
            <Info label="Last calibration" value={tool.last_calibration_date} />
            <Info label="Next calibration" value={tool.next_calibration_due} />
            <Info label="Frequency" value={tool.calibration_freq_days ? `${tool.calibration_freq_days} days` : ''} />
          </div>
          {issued.length > 0 && (
            <>
              <SectionHead label={`Issued - ${issuedUnitCount} unit${issuedUnitCount !== 1 ? 's' : ''} out`} />
              {issued.map((i, idx) => {
                const [bg, fg, lbl] = STATE_BADGE[i.state] || STATE_BADGE.on_time;
                const start = unitStartFor(idx);
                const qty = Number(i.qty || 0);
                const unitLabel = qty > 1 ? `Units #${start}-${start + qty - 1}` : `Unit #${start}`;
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 24px', borderBottom: '1px solid var(--border-subtle)', background: i.state === 'overdue' ? 'var(--danger-bg)' : 'transparent' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-sunken)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <Icon name="user" size={15} color="var(--text-muted)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-strong)', fontSize: 13.5 }}>{unitLabel} - With {i.issued_to}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Issued to {i.issued_to} ({i.dept})</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>Home bin: {tool.bin || 'Not set'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{i.dept} · Qty {i.qty}</div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>
                      <div>Issued: {i.issued_on}</div>
                      <div style={{ fontWeight: 600, color: i.state === 'overdue' ? 'var(--danger-text)' : 'inherit', marginTop: 2 }}>Due: {i.due}</div>
                    </div>
                    <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-pill)', background: bg, color: fg, fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>{lbl}</span>
                  </div>
                );
              })}
            </>
          )}
          {availCount > 0 && (
            <>
              <SectionHead label={`Available — ${availCount} unit${availCount > 1 ? 's' : ''} in stock`} />
              {Array.from({ length: availCount }, (_, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--success-bg)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <Icon name="check_circle" size={15} color="var(--success-solid,var(--success-text))" />
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Unit #{issuedUnitCount + idx + 1} - In storage ({tool.bin})</span>
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-pill)', background: 'var(--success-bg)', color: 'var(--success-text)', fontSize: 11.5, fontWeight: 600 }}>Available</span>
                </div>
              ))}
            </>
          )}
          {issued.length === 0 && availCount === 0 && (
            <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--text-subtle)', fontSize: 13 }}>No unit data available for this tool.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardScreen({ onNavigate }) {
  const { PageHeader, MetricCard, Card, EmptyState, Badge, DataTable, StatusBadge, Input } = NS_DASH;
  const s = window.MOCK.SUMMARY;
  const totalToolTypes = Number(s.total_tool_types || window.MOCK.TOOLS.length || 0);
  const totalUnits = Number(s.total_units ?? s.total_tools ?? 0);
  const userRole = (window.MOCK.USER || {}).role;
  const isMaintenanceUser = userRole === 'maintenance_admin' || userRole === 'maintenance_staff';
  const isDeptHead = userRole === 'dept_head';
  const seesOperationalIssuances = isMaintenanceUser || userRole === 'dept_head';
  const activeIssuanceRows = seesOperationalIssuances ? (window.MOCK.ACTIVE_ISSUANCES || []) : (window.MOCK.MY_ISSUANCES || []);
  const scopeLabels = isMaintenanceUser
    ? { tools: 'Tool Types', available: 'Available', issued: 'Currently Issued' }
    : isDeptHead
      ? { tools: 'Department Tools', available: 'Dept Available', issued: 'Dept Issued' }
      : { tools: 'Requestable Tools', available: 'Available to Request', issued: 'My Issued Tools' };
  const [activePanel, setActivePanel] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [fType, setFType] = React.useState('');
  const [fStatus, setFStatus] = React.useState('');
  const [fDept, setFDept] = React.useState('');
  const [fState, setFState] = React.useState('');
  const [selectedTool, setSelectedTool] = React.useState(null);
  const [selectedIssuance, setSelectedIssuance] = React.useState(null);
  const [message, setMessage] = React.useState(null);
  const [, setRefreshTick] = React.useState(0);

  const DEPTS = ['E&I', 'Mechanical', 'Civil', 'Process'];

  const openPanel = (panel) => {
    setActivePanel(panel); setSearch('');
    setFType(''); setFStatus(''); setFDept(''); setFState('');
  };

  const returnOwnTool = () => {
    setMessage({ tone: 'success', text: 'Open My Requests and use Return Tool to confirm quantity and condition.' });
    onNavigate('requisitions');
  };

  /* ── Filtered rows ─────────────────────────────────────────────── */
  const totalRows = window.MOCK.TOOLS.filter(t => {
    if (search && !(`${t.name} ${t.tool_code}`).toLowerCase().includes(search.toLowerCase())) return false;
    if (fType && t.tool_type !== fType) return false;
    if (fStatus && t.status !== fStatus) return false;
    if (fDept && t.department_access !== fDept) return false;
    return true;
  });

  const availRows = window.MOCK.TOOLS.filter(t => {
    if (t.available <= 0) return false;
    if (search && !(`${t.name} ${t.tool_code}`).toLowerCase().includes(search.toLowerCase())) return false;
    if (fType && t.tool_type !== fType) return false;
    if (fDept && t.department_access !== fDept) return false;
    return true;
  });

  const issuedRows = (window.MOCK.ACTIVE_ISSUANCES || []).filter(i => {
    if (search && !(`${i.tool_name} ${i.issued_to} ${i.tool_code}`).toLowerCase().includes(search.toLowerCase())) return false;
    if (fDept && i.dept !== fDept) return false;
    if (fState && i.state !== fState) return false;
    return true;
  });

  /* ── Panel definitions ─────────────────────────────────────────── */
  const STATE_BADGE = {
    on_time:   ['var(--success-bg)', 'var(--success-text)', 'On Time'],
    due_today: ['var(--warning-bg)', 'var(--warning-text)', 'Due Today'],
    overdue:   ['var(--danger-bg)',  'var(--danger-text)',  'Overdue'],
  };

  const FilterBar = ({ children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '16px 0 20px', borderBottom: '1px solid var(--border-subtle)', marginBottom: 16 }}>
      {children}
    </div>
  );

  const PANELS = {
    total: {
      title: 'All Tools',
      subtitle: `${totalToolTypes.toLocaleString()} tool types, ${totalUnits.toLocaleString()} total units`,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <FilterBar>
            <Input icon={<Icon name="search" size={14} />} placeholder="Search name or code…" value={search} onChange={e => setSearch(e.target.value)} />
            <ChipGroup label="Type" value={fType} onChange={setFType} options={[{value:'',label:'All'},{value:'general',label:'General'},{value:'specialized',label:'Specialized'}]} />
            <ChipGroup label="Status" value={fStatus} onChange={setFStatus} options={[{value:'',label:'All'},{value:'active',label:'Active'},{value:'calibration_due',label:'Cal Due'},{value:'damaged',label:'Damaged'}]} />
            <ChipGroup label="Dept" value={fDept} onChange={setFDept} options={[{value:'',label:'All'},...DEPTS.map(d=>({value:d,label:d}))]} />
          </FilterBar>
          <DataTable
            columns={[
              { key: 'tool_code', header: 'Code', mono: true, nowrap: true },
              { key: 'name', header: 'Tool Name', render: t => <span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{t.name}</span> },
              { key: 'tool_type', header: 'Type', render: t => <span style={{ textTransform: 'capitalize', color: 'var(--text-muted)' }}>{t.tool_type}</span> },
              { key: 'dept', header: 'Dept Access', render: t => t.department_access || <span style={{ color: 'var(--text-subtle)' }}>All</span> },
              { key: 'avail', header: 'Avail / Total', align: 'right', nowrap: true, render: t => <span><b style={{ color: t.available > 0 ? 'var(--success-text)' : 'var(--danger-text)' }}>{t.available}</b><span style={{ color: 'var(--text-subtle)' }}> / {t.total}</span></span> },
              { key: 'status', header: 'Status', render: t => <StatusBadge status={t.status} size="sm" /> },
              { key: 'bin', header: 'Bin', mono: true, render: t => <span style={{ color: 'var(--text-muted)' }}>{t.bin}</span> },
            ]}
            rows={totalRows}
            onRowClick={t => setSelectedTool(t)}
            empty={<EmptyState icon={<Icon name="wrench" size={28} />} title="No tools found" message="Try adjusting your filters." />}
          />
        </div>
      ),
    },
    available: {
      title: 'Available Tools',
      subtitle: `${s.available_tools.toLocaleString()} units ready to issue`,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <FilterBar>
            <Input icon={<Icon name="search" size={14} />} placeholder="Search name or code…" value={search} onChange={e => setSearch(e.target.value)} />
            <ChipGroup label="Type" value={fType} onChange={setFType} options={[{value:'',label:'All'},{value:'general',label:'General'},{value:'specialized',label:'Specialized'}]} />
            <ChipGroup label="Dept" value={fDept} onChange={setFDept} options={[{value:'',label:'All'},...DEPTS.map(d=>({value:d,label:d}))]} />
          </FilterBar>
          <DataTable
            columns={[
              { key: 'tool_code', header: 'Code', mono: true, nowrap: true },
              { key: 'name', header: 'Tool Name', render: t => <span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{t.name}</span> },
              { key: 'tool_type', header: 'Type', render: t => <span style={{ textTransform: 'capitalize', color: 'var(--text-muted)' }}>{t.tool_type}</span> },
              { key: 'dept', header: 'Dept Access', render: t => t.department_access || <span style={{ color: 'var(--text-subtle)' }}>All</span> },
              { key: 'available', header: 'Available', align: 'right', render: t => <span style={{ fontWeight: 700, color: 'var(--success-text)', fontSize: 15 }}>{t.available}</span> },
              { key: 'total', header: 'Total', align: 'right', render: t => <span style={{ color: 'var(--text-muted)' }}>{t.total}</span> },
              { key: 'bin', header: 'Bin', mono: true, render: t => <span style={{ color: 'var(--text-muted)' }}>{t.bin}</span> },
            ]}
            rows={availRows}
            onRowClick={t => setSelectedTool(t)}
            empty={<EmptyState icon={<Icon name="check_circle" size={28} />} title="No available tools" message="Try adjusting your filters." />}
          />
        </div>
      ),
    },
    issued: {
      title: 'Currently Issued',
      subtitle: `${s.tools_issued} units out in the field`,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <FilterBar>
            <Input icon={<Icon name="search" size={14} />} placeholder="Search tool or employee…" value={search} onChange={e => setSearch(e.target.value)} />
            <ChipGroup label="Dept" value={fDept} onChange={setFDept} options={[{value:'',label:'All'},...DEPTS.map(d=>({value:d,label:d}))]} />
            <ChipGroup label="Status" value={fState} onChange={setFState} options={[{value:'',label:'All'},{value:'on_time',label:'On Time'},{value:'due_today',label:'Due Today'},{value:'overdue',label:'Overdue'}]} />
          </FilterBar>
          <DataTable
            columns={[
              { key: 'tool_code', header: 'Code', mono: true, nowrap: true },
              { key: 'tool_name', header: 'Tool', render: i => <span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{i.tool_name}</span> },
              { key: 'issued_to', header: 'Issued To', render: i => <span style={{ fontWeight: 500 }}>{i.issued_to}</span> },
              { key: 'dept', header: 'Dept', render: i => <span style={{ color: 'var(--text-muted)' }}>{i.dept}</span> },
              { key: 'issued_on', header: 'Issued On', nowrap: true, render: i => <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{i.issued_on}</span> },
              { key: 'due', header: 'Due Date', nowrap: true, render: i => <span style={{ color: i.state === 'overdue' ? 'var(--danger-text)' : 'var(--text-muted)', fontWeight: i.state === 'overdue' ? 600 : 400, fontSize: 12 }}>{i.due}</span> },
              { key: 'state', header: 'Status', render: i => {
                const [bg, fg, lbl] = STATE_BADGE[i.state] || STATE_BADGE.on_time;
                return <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-pill)', background: bg, color: fg, fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap' }}>{lbl}</span>;
              }},
            ]}
            rows={issuedRows}
            getRowTone={i => i.state === 'overdue' ? 'danger' : i.state === 'due_today' ? 'warning' : null}
            empty={<EmptyState icon={<Icon name="package" size={28} />} title="No active issuances" message="Try adjusting your filters." />}
          />
        </div>
      ),
    },
  };

  const panel = activePanel ? PANELS[activePanel] : null;

  const SectionCard = ({ title, count, children }) => (
    <Card title={
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-strong)' }}>{title}</span>
        {count != null && <Badge tone="neutral">{count}</Badge>}
      </div>
    } padded={false}>
      {children}
    </Card>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <PageHeader title="Dashboard" subtitle={`Welcome back, ${(window.MOCK.USER || {}).full_name || '—'} · ${(window.MOCK.USER || {}).department || ''}`} />

      {message && (
        <div style={{ padding:'9px 12px', borderRadius:'var(--radius-md)', background:message.tone === 'danger' ? 'var(--danger-bg)' : 'var(--success-bg)', color:message.tone === 'danger' ? 'var(--danger-text)' : 'var(--success-text)', fontSize:12.5, fontWeight:600 }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        <div onClick={() => openPanel('total')} className="tims-clickable-card" style={{ cursor: 'pointer' }}>
          <MetricCard label={scopeLabels.tools} value={totalToolTypes.toLocaleString()} icon={<Icon name="wrench" size={19} />}
            subtext={`${totalUnits.toLocaleString()} total units`} />
        </div>
        <div onClick={() => openPanel('available')} className="tims-clickable-card" style={{ cursor: 'pointer' }}>
          <MetricCard label={scopeLabels.available} value={s.available_tools.toLocaleString()} icon={<Icon name="check_circle" size={19} />} subtext={' '} />
        </div>
        <div onClick={() => openPanel('issued')} className="tims-clickable-card" style={{ cursor: 'pointer' }}>
          <MetricCard label={scopeLabels.issued} value={s.tools_issued} icon={<Icon name="package" size={19} />} subtext={' '} />
        </div>
        <div onClick={() => onNavigate('returns')} className="tims-clickable-card" style={{ cursor: 'pointer' }}>
          <MetricCard label="Overdue Returns" value={s.overdue_count} icon={<Icon name="clock" size={19} />} subtext={' '} />
        </div>
        <div onClick={() => onNavigate('calibration')} className="tims-clickable-card" style={{ cursor: 'pointer' }}>
          <MetricCard label="Calibration Due" value={s.calibration_due_count} icon={<Icon name="activity" size={19} />} subtext={' '} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <SectionCard title={seesOperationalIssuances ? 'Active Issuances' : 'My Active Issuances'} count={activeIssuanceRows.length + ' open'}>
          <div>
            {activeIssuanceRows.map((i) => (
              <div key={i.id} onClick={() => setSelectedIssuance(i)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)', background: (i.overdue || i.state === 'overdue') ? 'var(--danger-bg)' : 'transparent', cursor: 'pointer', transition: 'filter 0.12s' }}
                onMouseEnter={e => { if (!(i.overdue || i.state === 'overdue')) e.currentTarget.style.background = 'var(--surface-sunken)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = (i.overdue || i.state === 'overdue') ? 'var(--danger-bg)' : 'transparent'; }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-strong)' }}>{i.tool_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Qty: {i.quantity_issued} · Due: {i.due}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 'var(--radius-pill)', background: i.overdue ? '#fff' : 'var(--success-bg)', color: i.overdue ? 'var(--danger-text)' : 'var(--success-text)' }}>{i.days}</span>
                  {!seesOperationalIssuances && (
                    <button
                      onClick={e => { e.stopPropagation(); returnOwnTool(i); }}
                      style={{ padding: '5px 11px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--brand-black)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
                    >
                      Return Tool
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <QueueRow label="Pending Approvals" value={s.pending_approvals_count} tone="warning" cta="Review" onClick={() => onNavigate('approvals')} />
          <QueueRow label="Ready to Issue" value={s.approved_queue_count} tone="info" cta="Issue" onClick={() => onNavigate('issuance')} />
          <QueueRow label="My Pending Requests" value={s.my_pending_requests} tone="default" cta="View" onClick={() => onNavigate('requisitions')} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <SectionCard title="Overdue Returns" count={s.overdue_count}>
          <div style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-default)' }}>
            <strong>{s.overdue_count}</strong> issuance(s) past due date. Open the <a onClick={() => onNavigate('returns')} style={{ color: 'var(--info-text)', cursor: 'pointer', textDecoration: 'underline' }}>Returns page</a> for details.
          </div>
        </SectionCard>
        <SectionCard title="Low Stock Tools" count={window.MOCK.LOW_STOCK.length + ' tools'}>
          <div>
            {window.MOCK.LOW_STOCK.map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-strong)' }}>{t.name}</div>
                  <div className="mtrs-mono" style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>{t.tool_code}</div>
                </div>
                <div style={{ fontVariantNumeric: 'tabular-nums' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: t.available === 0 ? 'var(--danger-text)' : 'var(--warning-text)' }}>{t.available}</span>
                  <span style={{ fontSize: 12.5, color: 'var(--text-subtle)' }}> / {t.total}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {activePanel && panel && (
        <CentrePanel title={panel.title} subtitle={panel.subtitle} onClose={() => { setActivePanel(null); setSelectedTool(null); }}>
          {panel.content}
        </CentrePanel>
      )}
      {selectedTool && <ToolDetailModal tool={selectedTool} onClose={() => setSelectedTool(null)} />}
      {selectedIssuance && <window.IssuanceDetailModal issuance={selectedIssuance} onClose={() => setSelectedIssuance(null)} />}
    </div>
  );
}

function QueueRow({ label, value, tone, cta, onClick }) {
  const TONE = {
    warning: { border: 'var(--warning-border)', bg: 'var(--warning-bg)', fig: 'var(--warning-text)', btnBg: 'var(--warning-bg)', btnFg: 'var(--warning-text)' },
    info:    { border: 'var(--info-border)',    bg: 'var(--info-bg)',    fig: 'var(--info-text)',    btnBg: 'var(--info-bg)',    btnFg: 'var(--info-text)'    },
    default: { border: 'var(--border-default)', bg: 'var(--surface-card)', fig: 'var(--text-strong)', btnBg: 'var(--surface-sunken)', btnFg: 'var(--text-default)' },
  }[tone];
  return (
    <div onClick={onClick} className="tims-clickable-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', background: TONE.bg, border: `1px solid ${TONE.border}`, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-resting)', cursor: 'pointer' }}>
      <div>
        <div style={{ fontSize: 'var(--type-metric-size)', fontWeight: 700, color: TONE.fig, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
      </div>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 13px', borderRadius: 'var(--radius-md)', background: TONE.btnBg, color: TONE.btnFg, fontSize: 12.5, fontWeight: 600, fontFamily: 'var(--font-sans)' }}>
        {cta} <Icon name="arrow_right" size={13} />
      </span>
    </div>
  );
}

/* ── Issuance Detail Modal (shared — exported to window) ─────────── */
function IssuanceDetailModal({ issuance, onClose }) {
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const allReqs = [...(window.MOCK.REQUISITIONS || []), ...(window.MOCK.MY_REQUESTS || [])];
  const req = allReqs.find(r => r.id === issuance.requisition_id);

  const STATE = {
    on_time:   { bg: 'var(--success-bg)', fg: 'var(--success-text)', label: 'On Time' },
    due_today: { bg: 'var(--warning-bg)', fg: 'var(--warning-text)', label: 'Due Today' },
    overdue:   { bg: 'var(--danger-bg)',  fg: 'var(--danger-text)',  label: 'Overdue'  },
  };
  const st = STATE[issuance.state] || STATE.on_time;

  const F = ({ label, value, bold, span }) => (
    <div style={span ? { gridColumn: '1 / -1' } : {}}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>{label}</div>
      {typeof value === 'object' && value !== null
        ? value
        : <div style={{ fontSize: 13.5, fontWeight: bold ? 700 : 400, color: bold ? 'var(--text-strong)' : 'var(--text-default)' }}>{value || '—'}</div>}
    </div>
  );

  const steps = [
    { label: 'Requested', icon: 'clipboard',         done: true },
    { label: 'Approved',  icon: 'check_circle',       done: true },
    { label: 'Issued',    icon: 'arrow_right_circle', done: true, current: true },
    { label: 'Returned',  icon: 'arrow_left_circle',  done: false },
  ];
  const qty = issuance.qty || issuance.quantity_issued || 1;
  const isOverdue = issuance.overdue || issuance.state === 'overdue';
  const isDueToday = issuance.state === 'due_today';

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', padding: 20 }}>
      <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 520, maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-strong)' }}>Issuance Details</div>
            {req?.requisition_number && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, fontFamily: 'monospace' }}>{req.requisition_number}</div>}
          </div>
          <button onClick={onClose} style={{ display: 'grid', placeItems: 'center', width: 32, height: 32, border: '1px solid var(--border-default)', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}>
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.1) transparent' }}>
          {/* Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', paddingBottom: 20, marginBottom: 20, borderBottom: '1px solid var(--border-subtle)' }}>
            {req?.requisition_number && <F label="Requisition No." value={req.requisition_number} />}
            <F label="Issued On" value={issuance.issued_on || '—'} />
            <F label="Tool" value={issuance.tool_name} bold />
            <F label="Quantity" value={`${qty} unit${qty > 1 ? 's' : ''}`} />
            <F label="Issued To" value={issuance.issued_to || '—'} />
            <F label="Department" value={issuance.dept || '—'} />
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Period</div>
              <div style={{ fontSize: 13.5, color: 'var(--text-default)' }}>{issuance.issued_on || '—'} → {issuance.due || '—'}</div>
            </div>
          </div>

          {/* Purpose */}
          {req?.purpose && (
            <div style={{ paddingBottom: 20, marginBottom: 20, borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Purpose</div>
              <div style={{ fontSize: 13.5, color: 'var(--text-default)', lineHeight: 1.55 }}>{req.purpose}</div>
            </div>
          )}

          {/* Status Timeline */}
          <div style={{ paddingBottom: (isOverdue || isDueToday) ? 20 : 0, marginBottom: (isOverdue || isDueToday) ? 20 : 0, borderBottom: (isOverdue || isDueToday) ? '1px solid var(--border-subtle)' : 'none' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Status Timeline</div>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              {steps.map((step, idx) => (
                <React.Fragment key={step.label}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0,
                      background: step.done ? 'var(--success-solid)' : 'var(--surface-sunken)',
                      border: step.done ? 'none' : '2px solid var(--border-default)',
                      boxShadow: step.current ? '0 0 0 4px rgba(34,197,94,0.18)' : 'none',
                    }}>
                      <Icon name={step.icon} size={16} color={step.done ? '#fff' : 'var(--text-subtle)'} />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: step.current ? 700 : 500, color: step.done ? 'var(--text-strong)' : 'var(--text-subtle)', marginTop: 6, textAlign: 'center', whiteSpace: 'nowrap' }}>{step.label}</div>
                  </div>
                  {idx < steps.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: step.done ? 'var(--success-solid)' : 'var(--border-subtle)', margin: '15px 6px 0', minWidth: 16 }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Flags */}
          {(isOverdue || isDueToday) && (
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Flags</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 13px', borderRadius: 'var(--radius-pill)', background: st.bg, color: st.fg, fontSize: 12.5, fontWeight: 700 }}>
                <Icon name="alert_triangle" size={13} color="currentColor" /> {st.label} · {issuance.days}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
          <button onClick={onClose}
            style={{ height: 36, padding: '0 22px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--text-default)', fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardScreen, ToolDetailModal, IssuanceDetailModal });
