const NS_ISS = window.MTRSDesignSystemUltraTechCement_660dc9;

const PRIORITY_CFG = {
  ready:             { label: 'Ready to Issue',    bg: 'var(--success-bg)', fg: 'var(--success-text)' },
  calibration_check: { label: 'Calibration Check', bg: 'var(--warning-bg)', fg: 'var(--warning-text)' },
  low_stock:         { label: 'Low Stock Warning',  bg: 'var(--danger-bg)',  fg: 'var(--danger-text)'  },
  high_qty:          { label: 'High Quantity',       bg: 'var(--warning-bg)', fg: 'var(--warning-text)' },
};

function DaysLeftBadge({ state, days }) {
  const cfg = {
    on_time:   { bg: 'var(--success-bg)', fg: 'var(--success-text)', icon: 'clock',          label: `${days}d left` },
    due_today: { bg: 'var(--warning-bg)', fg: 'var(--warning-text)', icon: 'clock',          label: 'Due today' },
    overdue:   { bg: 'var(--danger-bg)',  fg: 'var(--danger-text)',  icon: 'alert_triangle', label: `${Math.abs(days)}d overdue` },
  }[state] || { bg: 'var(--surface-sunken)', fg: 'var(--text-muted)', icon: 'clock', label: '—' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 'var(--radius-pill)', background: cfg.bg, color: cfg.fg, fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
      <Icon name={cfg.icon} size={11} /> {cfg.label}
    </span>
  );
}

/* ── Confirm Issue modal ───────────────────────────────────────────── */
function IssueConfirmModal({ item, onClose, onConfirm }) {
  const { Modal, Button, Checkbox } = NS_ISS;
  const [ack, setAck] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const inr = window.inr;
  const stockAfter = item.avail_stock - item.qty;
  const stockLow = stockAfter <= 1;

  const InfoRow = ({ label, value, warn }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 13px', background: warn ? 'var(--warning-bg)' : 'var(--surface-sunken)', borderRadius: 'var(--radius-sm)', border: `1px solid ${warn ? 'var(--warning-border,var(--warning-bg))' : 'transparent'}` }}>
      <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: warn ? 'var(--warning-text)' : 'var(--text-strong)' }}>{value}</span>
    </div>
  );

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await window.API.issueRequisition(item.id);
      await Promise.all([window.API.loadDashboard(), window.API.loadIssuances(), window.API.loadRequisitions(), window.API.loadReports().catch(() => [])]);
      onConfirm(item.id);
      onClose();
    } catch (e) {
      console.error('Issue failed:', e);
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Confirm Issue" width={480}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={!ack} loading={busy} onClick={handleConfirm}>Confirm Issue</Button></>}>
      <div style={{ padding: '12px 14px', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', marginBottom: 18 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)' }}>{item.tool_name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'monospace' }}>{item.tool_code} · {item.requisition_number}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 16 }}>
        <InfoRow label="Requested by"         value={`${item.requester} (${item.dept})`} />
        <InfoRow label="Quantity"             value={`${item.qty} unit${item.qty > 1 ? 's' : ''}`} />
        <InfoRow label="Expected return"      value={item.expected_return} />
        <InfoRow label="Current available"    value={`${item.avail_stock} units`} />
        <InfoRow label="Stock after issue"    value={`${stockAfter} unit${stockAfter !== 1 ? 's' : ''}${stockLow ? ' ⚠' : ''}`} warn={stockLow} />
        <InfoRow label="Depreciation snapshot" value={inr(item.current_value || 0)} />
      </div>
      {item.purpose && (
        <div style={{ padding: '9px 13px', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-sm)', marginBottom: 14 }}>
          <div style={{ fontSize: 10.5, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 2 }}>Purpose</div>
          <div style={{ fontSize: 13, color: 'var(--text-default)', lineHeight: 1.5 }}>{item.purpose}</div>
        </div>
      )}
      <Checkbox checked={ack} onChange={setAck} label="I confirm the issue and acknowledge the stock reduction" />
    </Modal>
  );
}

/* ── View Request Details modal ────────────────────────────────────── */
function ViewRequestModal({ item, onClose }) {
  const { Modal, Button } = NS_ISS;
  const p = PRIORITY_CFG[item.priority] || PRIORITY_CFG.ready;
  const F = ({ label, value, mono, full }) => (
    <div style={full ? { gridColumn: '1 / -1' } : {}}>
      <div style={{ fontSize: 10.5, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13.5, color: 'var(--text-default)', fontFamily: mono ? 'monospace' : undefined }}>{value || '—'}</div>
    </div>
  );
  return (
    <Modal open onClose={onClose} title="Request Details" width={480} footer={<Button variant="secondary" onClick={onClose}>Close</Button>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <F label="Requisition No."    value={item.requisition_number} mono />
        <F label="Approved On"        value={item.approved_on} />
        <F label="Tool Name"          value={item.tool_name} />
        <F label="Tool Code"          value={item.tool_code} mono />
        <F label="Quantity"           value={`${item.qty} unit${item.qty > 1 ? 's' : ''}`} />
        <F label="Expected Return"    value={item.expected_return} />
        <F label="Requested By"       value={item.requester} />
        <F label="Department"         value={item.dept} />
        <F label="Available Stock"    value={`${item.avail_stock} units`} />
        <div>
          <div style={{ fontSize: 10.5, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 5 }}>Priority</div>
          <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 9px', borderRadius: 'var(--radius-pill)', background: p.bg, color: p.fg }}>{p.label}</span>
        </div>
        <F label="Purpose" value={item.purpose} full />
      </div>
    </Modal>
  );
}

/* ── Main screen ───────────────────────────────────────────────────── */
function IssuanceScreen() {
  const { PageHeader, Card, Tabs, DataTable, Button, EmptyState, Input } = NS_ISS;
  const [tab, setTab] = React.useState('all');
  const [qSearch, setQSearch] = React.useState('');
  const [aSearch, setASearch] = React.useState('');
  const [issue, setIssue] = React.useState(null);
  const [viewReq, setViewReq] = React.useState(null);
  const [issuedIds, setIssuedIds] = React.useState([]);
  const [selectedIssuance, setSelectedIssuance] = React.useState(null);
  const [successMsg, setSuccessMsg] = React.useState('');

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  /* Build approved queue from live MOCK data — evaluated at render time */
  const APPROVED_EXT = (window.MOCK?.APPROVED_QUEUE || []).map(r => ({
    ...r,
    expected_return: r.expected_return || r.due,
  })).filter(r => Number(r.avail_stock || 0) >= Number(r.qty || 0) && !['calibration_check', 'blocked'].includes(r.priority));

  const active = window.MOCK.ACTIVE_ISSUANCES || [];
  const activeUnits = active.reduce((sum, i) => sum + Number(i.qty || 0), 0);
  const c = (s) => active.filter(i => i.state === s).length;

  const filteredQueue = APPROVED_EXT.filter(r => {
    const q = qSearch.toLowerCase();
    return !q || r.tool_name.toLowerCase().includes(q) || (r.requisition_number || '').toLowerCase().includes(q) || r.requester.toLowerCase().includes(q);
  });

  const filteredActive = active.filter(i => {
    const q = aSearch.toLowerCase();
    const matchQ = !q || i.tool_name.toLowerCase().includes(q) || i.issued_to.toLowerCase().includes(q) || (i.tool_code || '').toLowerCase().includes(q);
    const matchTab = tab === 'all' || i.state === tab;
    return matchQ && matchTab;
  });

  const chips = [
    { label: 'Approved Queue',   value: APPROVED_EXT.length, fg: 'var(--info-text)',    bg: 'var(--info-bg)' },
    { label: 'Issued Units',      value: activeUnits,         fg: 'var(--text-strong)',  bg: 'var(--surface-sunken)' },
    { label: 'Due Today',        value: c('due_today'),        fg: 'var(--warning-text)', bg: 'var(--warning-bg)' },
    { label: 'Overdue',          value: c('overdue'),          fg: 'var(--danger-text)',  bg: 'var(--danger-bg)' },
  ];


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader title="Issue Tool" subtitle="Issue approved requests and track active issuances" />

      {successMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)', color: 'var(--success-text)', fontSize: 13.5, fontWeight: 500 }}>
          <Icon name="check_circle" size={16} color="var(--success-solid)" />
          {successMsg}
        </div>
      )}

      {/* Count chips */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {chips.map(ch => (
          <div key={ch.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-resting)' }}>
            <span style={{ fontSize: 17, fontWeight: 700, background: ch.bg, color: ch.fg, borderRadius: 'var(--radius-sm)', padding: '0 7px', lineHeight: 1.5 }}>{ch.value}</span>
            <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{ch.label}</span>
          </div>
        ))}
      </div>

      {/* Approved Queue */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-strong)' }}>Approved — Ready to Issue</h2>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-pill)', background: 'var(--info-bg)', color: 'var(--info-text)' }}>{APPROVED_EXT.length}</span>
          </div>
          <div style={{ width: 240 }}><Input icon={<Icon name="search" size={14} />} value={qSearch} onChange={e => setQSearch(e.target.value)} placeholder="Search tool, requester, req #…" /></div>
        </div>
        <Card padded={false}>
          <DataTable
            columns={[
              { key: 'tool_name', header: 'Request', render: (r) => {
                const p = PRIORITY_CFG[r.priority] || PRIORITY_CFG.ready;
                const highQty = r.qty > 50;
                return (
                  <div>
                    <div style={{ fontFamily: 'monospace', fontSize: 10.5, color: 'var(--text-subtle)', marginBottom: 1 }}>{r.requisition_number}</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{r.tool_name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-subtle)', fontFamily: 'monospace' }}>{r.tool_code}</div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 3, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 'var(--radius-pill)', background: p.bg, color: p.fg }}>{p.label}</span>
                      {highQty && <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 'var(--radius-pill)', background: 'var(--danger-bg)', color: 'var(--danger-text)' }}>High Qty</span>}
                    </div>
                  </div>
                );
              }},
              { key: 'qty', header: 'Qty', align: 'right', render: (r) => (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: r.qty > 50 ? 'var(--danger-text)' : 'var(--text-strong)' }}>{r.qty}</span>
                  {r.qty > 50 && <span style={{ fontSize: 9.5, fontWeight: 700, padding: '1px 5px', borderRadius: 'var(--radius-pill)', background: 'var(--danger-bg)', color: 'var(--danger-text)', letterSpacing: '0.04em' }}>HIGH</span>}
                </div>
              )},
              { key: 'requester', header: 'Requested By', render: (r) => <div><div style={{ fontWeight: 500, color: 'var(--text-strong)' }}>{r.requester}</div><div style={{ fontSize: 11.5, color: 'var(--text-subtle)' }}>{r.dept}</div></div> },
              { key: 'expected_return', header: 'Return By', nowrap: true, render: (r) => <span style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{r.expected_return}</span> },
              { key: 'actions', header: '', nowrap: true, render: (r) => (
                <div style={{ display: 'flex', gap: 6 }}>
                  <Button size="sm" variant="secondary" onClick={() => setViewReq(r)}>Details</Button>
                  {issuedIds.includes(r.id)
                    ? <Button size="sm" variant="secondary" disabled icon={<Icon name="check_circle" size={13} />}>Issued</Button>
                    : <Button size="sm" icon={<Icon name="arrow_right_circle" size={13} />} onClick={() => setIssue(r)}>Issue</Button>}
                </div>
              )},
            ]}
            rows={filteredQueue}
            empty={<EmptyState tone="success" compact icon={<Icon name="check_circle" size={24} />} title="Queue is clear" message="No approved requests waiting to be issued." />}
          />
        </Card>
      </div>

      {/* Active Issuances */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-strong)' }}>Active Issuances</h2>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ width: 220 }}><Input icon={<Icon name="search" size={14} />} value={aSearch} onChange={e => setASearch(e.target.value)} placeholder="Search tool or person…" /></div>
            <Tabs value={tab} onChange={setTab} size="sm" tabs={[
              { value: 'all',       label: 'All' },
              { value: 'on_time',   label: 'On Time',  count: c('on_time') },
              { value: 'due_today', label: 'Due Today', count: c('due_today') },
              { value: 'overdue',   label: 'Overdue',   count: c('overdue'), tone: 'danger' },
            ]} />
          </div>
        </div>
        <Card padded={false}>
          <DataTable
            columns={[
              { key: 'tool_name', header: 'Tool', render: (r) => <div><div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{r.tool_name}</div><div style={{ fontSize: 11.5, color: 'var(--text-subtle)', fontFamily: 'monospace' }}>{r.tool_code}</div></div> },
              { key: 'qty', header: 'Qty', align: 'right', render: (r) => (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                  <span style={{ fontWeight: 600, color: r.qty > 50 ? 'var(--danger-text)' : 'var(--text-strong)' }}>{r.qty}</span>
                  {r.qty > 50 && <span style={{ fontSize: 9.5, fontWeight: 700, padding: '1px 5px', borderRadius: 'var(--radius-pill)', background: 'var(--danger-bg)', color: 'var(--danger-text)', letterSpacing: '0.04em' }}>HIGH</span>}
                </div>
              )},
              { key: 'issued_to', header: 'Issued To', render: (r) => <div><div style={{ fontWeight: 500, color: 'var(--text-strong)' }}>{r.issued_to}</div><div style={{ fontSize: 11.5, color: 'var(--text-subtle)' }}>{r.dept}</div></div> },
              { key: 'issued_on', header: 'Issued On', nowrap: true, render: (r) => <span style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{r.issued_on}</span> },
              { key: 'due', header: 'Due', nowrap: true, render: (r) => <span style={{ color: r.state === 'overdue' ? 'var(--danger-text)' : 'var(--text-muted)', fontWeight: r.state === 'overdue' ? 600 : 400 }}>{r.due}</span> },
              { key: 'days', header: 'Status', render: (r) => <DaysLeftBadge state={r.state} days={r.days_left} /> },
            ]}
            rows={filteredActive}
            onRowClick={r => setSelectedIssuance(r)}
            getRowTone={(r) => r.state === 'overdue' ? 'danger' : null}
            empty={<EmptyState compact icon={<Icon name="package" size={26} />} title="No active issuances" message={tab === 'all' ? 'No tools are currently issued out.' : `No issuances in the "${tab.replace('_',' ')}" view.`} />}
          />
        </Card>
      </div>

      {issue   && <IssueConfirmModal item={issue}   onClose={() => setIssue(null)}   onConfirm={(id) => { setIssuedIds(p => [...p, id]); showSuccess(`${issue.tool_name} issued to ${issue.requester} successfully.`); }} />}
      {viewReq && <ViewRequestModal  item={viewReq} onClose={() => setViewReq(null)} />}
      {selectedIssuance && <window.IssuanceDetailModal issuance={selectedIssuance} onClose={() => setSelectedIssuance(null)} />}
    </div>
  );
}

Object.assign(window, { IssuanceScreen });
