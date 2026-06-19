const NS_RET = window.MTRSDesignSystemUltraTechCement_660dc9;

/* ── Mock return history ───────────────────────────────────────────── */
/* ── Issuance status badge ─────────────────────────────────────────── */
function IssuanceBadge({ state }) {
  const cfg = {
    on_time:   { bg: 'var(--success-bg)', fg: 'var(--success-text)', icon: 'check_circle',   label: 'On Time'   },
    due_today: { bg: 'var(--warning-bg)', fg: 'var(--warning-text)', icon: 'clock',          label: 'Due Today' },
    overdue:   { bg: 'var(--danger-bg)',  fg: 'var(--danger-text)',  icon: 'alert_triangle', label: 'Overdue'   },
  }[state] || { bg: 'var(--surface-sunken)', fg: 'var(--text-muted)', icon: 'clock', label: state };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 'var(--radius-pill)', background: cfg.bg, color: cfg.fg, fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
      <Icon name={cfg.icon} size={11} /> {cfg.label}
    </span>
  );
}

/* ── Days left chip ────────────────────────────────────────────────── */
function DaysChip({ days_left, state }) {
  if (state === 'on_time')   return <span style={{ color: 'var(--success-text)', fontWeight: 600, fontSize: 13 }}>{days_left}d left</span>;
  if (state === 'due_today') return <span style={{ color: 'var(--warning-text)', fontWeight: 700, fontSize: 13 }}>Due today</span>;
  return <span style={{ color: 'var(--danger-text)', fontWeight: 700, fontSize: 13 }}>{Math.abs(days_left)}d overdue</span>;
}

/* ── Process Return modal ──────────────────────────────────────────── */
function LegacyProcessReturnModal({ item, onClose, onConfirm }) {
  const { Modal, Button, Input, Select, Textarea } = NS_RET;
  const [condition, setCondition] = React.useState('good');
  const [busy, setBusy] = React.useState(false);
  const warn = condition === 'damaged' || condition === 'missing';
  return (
    <Modal open onClose={onClose} title="Process Return" width={480}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant={warn ? 'danger' : 'primary'} loading={busy} onClick={() => { setBusy(true); setTimeout(() => { onConfirm && onConfirm(item.id, { condition }); onClose(); }, 700); }}>Confirm Return</Button></>}>
      <div style={{ padding: '11px 14px', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-strong)' }}>{item.tool_name}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'monospace' }}>{item.tool_code} · issued to {item.issued_to}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Input label="Quantity returned" required type="number" defaultValue={item.qty} min="1" max={item.qty} />
        <Select label="Condition" required value={condition} onChange={(e) => setCondition(e.target.value)}>
          <option value="good">Good</option>
          <option value="partial">Partial</option>
          <option value="damaged">Damaged</option>
          <option value="missing">Missing</option>
        </Select>
      </div>
      <div style={{ marginTop: 14 }}><Textarea label="Notes" rows={2} placeholder="Any observations on the returned tool…" /></div>
      {warn && (
        <div style={{ display: 'flex', gap: 9, marginTop: 14, padding: '11px 13px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)' }}>
          <Icon name="alert_triangle" size={16} color="var(--danger-solid)" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12.5, color: 'var(--danger-text)', lineHeight: 1.45 }}>
            A <strong>{condition}</strong> return routes this to <strong>Pending Damage Assessment</strong>. Stock will not be restored until assessed.
          </span>
        </div>
      )}
    </Modal>
  );
}

/* ── Record Damage modal ───────────────────────────────────────────── */
function LegacyRecordDamageModal({ item, onClose, onConfirm }) {
  const { Modal, Button, RadioGroup, Input, Textarea } = NS_RET;
  const [kind, setKind] = React.useState('mishandling');
  const [marketRate, setMarketRate] = React.useState(item.current_value);
  const [notes, setNotes] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const inr = window.inr;
  const factor = kind === 'theft' ? 1 : kind === 'mishandling' ? 0.5 : 0;
  const penalty = Math.round((Number(marketRate) || 0) * factor);
  return (
    <Modal open onClose={onClose} title="Record Damage Assessment" width={480}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="danger" loading={busy} onClick={() => { setBusy(true); setTimeout(() => { onConfirm && onConfirm(item.id, { kind, penalty }); onClose(); }, 700); }}>Record Assessment</Button></>}>
      <div style={{ padding: '11px 14px', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-strong)' }}>{item.tool_name}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'monospace' }}>{item.tool_code} · returned {item.condition} by {item.returned_by}</div>
      </div>
      <RadioGroup name="dmg" value={kind} onChange={setKind} label="Damage type" layout="stack"
        options={[
          { value: 'theft',         label: 'Theft / Missing', hint: 'Full market-rate penalty (100%)' },
          { value: 'mishandling',   label: 'Mishandling',     hint: 'Half market-rate penalty (50%)' },
          { value: 'wear_and_tear', label: 'Wear & tear',     hint: 'No penalty — normal usage' },
        ]} />
      {kind !== 'wear_and_tear' && (
        <div style={{ marginTop: 16 }}>
          <Input label="Current market rate (₹)" type="number" value={marketRate} onChange={(e) => setMarketRate(e.target.value)} helper="Defaults to the tool's depreciated value" />
        </div>
      )}
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 15px', borderRadius: 'var(--radius-md)', background: penalty > 0 ? 'var(--danger-bg)' : 'var(--success-bg)', border: `1px solid ${penalty > 0 ? 'var(--danger-border)' : 'var(--success-border)'}` }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: penalty > 0 ? 'var(--danger-text)' : 'var(--success-text)' }}>Calculated penalty</span>
        <span style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 700, color: penalty > 0 ? 'var(--danger-text)' : 'var(--success-text)' }}>{inr(penalty)}</span>
      </div>
      <div style={{ marginTop: 14 }}><Textarea label="Assessment notes" rows={2} placeholder="Document the assessment rationale…" /></div>
    </Modal>
  );
}

/* ── View Damage Details modal ─────────────────────────────────────── */
function ViewDamageModal({ item, onClose }) {
  const { Modal, Button } = NS_RET;
  const inr = window.inr;
  const F = ({ label, value }) => (
    <div><div style={{ fontSize: 10.5, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 2 }}>{label}</div><div style={{ fontSize: 13.5, color: 'var(--text-default)' }}>{value || '—'}</div></div>
  );
  return (
    <Modal open onClose={onClose} title="Damage Report Details" width={460} footer={<Button variant="secondary" onClick={onClose}>Close</Button>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <F label="Tool"         value={item.tool_name} />
        <F label="Tool Code"    value={item.tool_code} />
        <F label="Returned By"  value={item.returned_by} />
        <F label="Department"   value={item.dept} />
        <F label="Returned On"  value={item.returned_on} />
        <F label="Condition"    value={item.condition.charAt(0).toUpperCase() + item.condition.slice(1)} />
        <F label="Tool Value"   value={inr(item.current_value)} />
        <F label="Status"       value="Pending Assessment" />
      </div>
    </Modal>
  );
}

/* ── Return History modal ──────────────────────────────────────────── */
function ReturnHistoryModal({ item, onClose }) {
  const { Modal, Button } = NS_RET;
  const logs = (window.MOCK.RETURN_HISTORY || []).filter(r => r.tool_id === item.tool_id || r.tool_code === item.tool_code);
  return (
    <Modal open onClose={onClose} title="Return History" width={540} footer={<Button variant="secondary" onClick={onClose}>Close</Button>}>
      <div style={{ padding: '10px 13px', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-strong)' }}>{item.tool_name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 2 }}>{item.tool_code}</div>
      </div>
      {logs.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--text-subtle)', padding: '28px 0', fontSize: 13 }}>No prior return history for this tool.</p> : (
        <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ background: 'var(--surface-sunken)', borderBottom: '1px solid var(--border-default)' }}>
              {['Date', 'Returned By', 'Condition'].map((h, i) => <th key={i} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</th>)}
            </tr></thead>
            <tbody>{logs.map((l, i) => (
              <tr key={i} onMouseEnter={e => e.currentTarget.style.background='var(--surface-sunken)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: 'var(--text-default)', fontWeight: 500 }}>{l.returned_on}</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-default)' }}>{l.returned_by}</td>
                <td style={{ padding: '10px 12px' }}><span style={{ fontSize: 11.5, fontWeight: 600, padding: '2px 8px', borderRadius: 'var(--radius-pill)', background: 'var(--success-bg)', color: 'var(--success-text)' }}>{l.condition}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}

/* ── Records modal ────────────────────────────────────────────────── */
function RecordsModal({ returnHistory, damageHistory, onClose }) {
  const inr = window.inr;
  const [tab, setTab] = React.useState('returns');
  const KIND = { theft: 'Theft / Missing', mishandling: 'Mishandling', wear_and_tear: 'Wear & Tear' };
  const TH = ({ children }) => <th style={{ padding: '9px 16px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{children}</th>;
  const TD = ({ children, mono, muted, nowrap, warn }) => <td style={{ padding: '11px 16px', color: warn ? 'var(--danger-text)' : muted ? 'var(--text-muted)' : 'var(--text-default)', fontFamily: mono ? 'monospace' : undefined, fontWeight: mono ? 600 : undefined, whiteSpace: nowrap ? 'nowrap' : undefined }}>{children}</td>;
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{
      position: 'fixed', inset: 0, zIndex: 55,
      background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 40,
    }}>
      <div style={{ width: 800, maxHeight: '82vh', display: 'flex', flexDirection: 'column', background: 'var(--surface-card)', borderRadius: 'var(--radius-xl,16px)', boxShadow: '0 24px 64px rgba(0,0,0,0.22)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border-default)', flexShrink: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-strong)' }}>Records</div>
          <button onClick={onClose} style={{ display: 'grid', placeItems: 'center', width: 32, height: 32, border: '1px solid var(--border-default)', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-muted)' }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid var(--border-default)', flexShrink: 0 }}>
          {[{ key: 'returns', label: `Processed Returns (${returnHistory.length})` }, { key: 'damage', label: `Damage Assessments (${damageHistory.length})` }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '12px 16px 10px', border: 'none', background: 'transparent', borderBottom: `2px solid ${tab === t.key ? 'var(--brand-black)' : 'transparent'}`, color: tab === t.key ? 'var(--text-strong)' : 'var(--text-muted)', fontWeight: 600, fontSize: 13.5, cursor: 'pointer', fontFamily: 'var(--font-sans)', marginBottom: -1, transition: 'color 0.15s' }}>{t.label}</button>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
          {tab === 'returns' && (
            returnHistory.length === 0
              ? <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-subtle)', fontSize: 13 }}>No returns processed yet — they will appear here once confirmed.</div>
              : <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead><tr style={{ background: 'var(--surface-sunken)', borderBottom: '1px solid var(--border-default)' }}><TH>Tool</TH><TH>Returned By</TH><TH>Dept</TH><TH>Due</TH><TH>Returned On</TH><TH>Condition</TH></tr></thead>
                  <tbody>{returnHistory.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }} onMouseEnter={e => e.currentTarget.style.background='var(--surface-sunken)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <TD><div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{r.tool_name}</div><div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-subtle)' }}>{r.tool_code}</div></TD>
                      <TD>{r.issued_to}</TD><TD muted>{r.dept}</TD><TD muted nowrap>{r.due}</TD><TD muted nowrap>{r.returnedOn}</TD>
                      <TD><span style={{ padding: '2px 9px', borderRadius: 'var(--radius-pill)', fontSize: 11.5, fontWeight: 600, background: r.condition==='good'?'var(--success-bg)':r.condition==='partial'?'var(--warning-bg)':'var(--danger-bg)', color: r.condition==='good'?'var(--success-text)':r.condition==='partial'?'var(--warning-text)':'var(--danger-text)', textTransform: 'capitalize' }}>{r.condition}</span></TD>
                    </tr>
                  ))}</tbody>
                </table>
          )}
          {tab === 'damage' && (
            damageHistory.length === 0
              ? <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-subtle)', fontSize: 13 }}>No damage assessments recorded yet — they will appear here once confirmed.</div>
              : <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead><tr style={{ background: 'var(--surface-sunken)', borderBottom: '1px solid var(--border-default)' }}><TH>Tool</TH><TH>Returned By</TH><TH>Dept</TH><TH>Condition</TH><TH>Damage Type</TH><TH>Penalty</TH><TH>Assessed</TH></tr></thead>
                  <tbody>{damageHistory.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }} onMouseEnter={e => e.currentTarget.style.background='var(--surface-sunken)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <TD><div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{r.tool_name}</div><div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-subtle)' }}>{r.tool_code}</div></TD>
                      <TD>{r.returned_by}</TD><TD muted>{r.dept}</TD>
                      <TD><span style={{ padding: '2px 9px', borderRadius: 'var(--radius-pill)', fontSize: 11.5, fontWeight: 600, background: 'var(--danger-bg)', color: 'var(--danger-text)', textTransform: 'capitalize' }}>{r.condition}</span></TD>
                      <TD muted>{KIND[r.kind] || '—'}</TD>
                      <TD mono warn={r.penalty > 0}>{inr(r.penalty || 0)}</TD>
                      <TD muted nowrap>{r.assessedOn}</TD>
                    </tr>
                  ))}</tbody>
                </table>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Return / Damage record detail modal ──────────────────────────── */
function ReturnRecordDetailModal({ record, type, onClose }) {
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const KIND = { theft: 'Theft / Missing', mishandling: 'Mishandling', wear_and_tear: 'Wear & Tear' };
  const COND = {
    good:    { bg: 'var(--success-bg)', fg: 'var(--success-text)' },
    partial: { bg: 'var(--warning-bg)', fg: 'var(--warning-text)' },
    damaged: { bg: 'var(--danger-bg)',  fg: 'var(--danger-text)'  },
    missing: { bg: 'var(--danger-bg)',  fg: 'var(--danger-text)'  },
  };
  const cs = COND[record.condition] || COND.good;
  const steps = [
    { label: 'Requested', icon: 'clipboard' },
    { label: 'Approved',  icon: 'check_circle' },
    { label: 'Issued',    icon: 'arrow_right_circle' },
    { label: 'Returned',  icon: 'arrow_left_circle' },
  ];
  const isDamage = type === 'damage';

  const F = ({ label, value, bold }) => (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: bold ? 700 : 400, color: bold ? 'var(--text-strong)' : 'var(--text-default)' }}>{value || '—'}</div>
    </div>
  );

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', padding: 20 }}>
      <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 500, maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexShrink: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-strong)' }}>{isDamage ? 'Damage Record' : 'Return Record'}</div>
          <button onClick={onClose} style={{ display: 'grid', placeItems: 'center', width: 32, height: 32, border: '1px solid var(--border-default)', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}>
            <Icon name="x" size={16} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.1) transparent' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', paddingBottom: 20, marginBottom: 20, borderBottom: '1px solid var(--border-subtle)' }}>
            <F label="Tool" value={record.tool_name} bold />
            <F label="Tool Code" value={record.tool_code} />
            <F label="Returned By" value={isDamage ? record.returned_by : record.issued_to} />
            <F label="Department" value={record.dept} />
            {!isDamage && <F label="Due Date" value={record.due} />}
            {!isDamage && <F label="Returned On" value={record.returnedOn} />}
            {isDamage && <F label="Returned On" value={record.returnedOn} />}
            {isDamage && <F label="Assessed On" value={record.assessedOn} />}
            {isDamage && <F label="Damage Type" value={KIND[record.kind] || record.kind} />}
            {isDamage && <F label="Penalty" value={window.inr(record.penalty || 0)} bold />}
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Condition</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 14px', borderRadius: 'var(--radius-pill)', background: cs.bg, color: cs.fg, fontSize: 13, fontWeight: 700, textTransform: 'capitalize' }}>
                {record.condition}
              </span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Status Timeline</div>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              {steps.map((step, idx) => (
                <React.Fragment key={step.label}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0, background: 'var(--success-solid)' }}>
                      <Icon name={step.icon} size={16} color="#fff" />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-strong)', marginTop: 6, textAlign: 'center', whiteSpace: 'nowrap' }}>{step.label}</div>
                  </div>
                  {idx < steps.length - 1 && <div style={{ flex: 1, height: 2, background: 'var(--success-solid)', margin: '15px 6px 0', minWidth: 16 }} />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
          <button onClick={onClose} style={{ height: 36, padding: '0 22px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--text-default)', fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main screen ───────────────────────────────────────────────────── */
function ProcessReturnModal({ item, onClose, onConfirm }) {
  const { Modal, Button, Input, Select, Textarea } = NS_RET;
  const [qtyReturned, setQtyReturned] = React.useState(item.qty);
  const [condition, setCondition] = React.useState('good');
  const [notes, setNotes] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState('');
  const warn = condition === 'damaged' || condition === 'missing';
  const handleConfirm = async () => {
    setBusy(true);
    setErr('');
    try {
      const returnedQty = condition === 'missing' ? 0 : Number(qtyReturned || 0);
      if (returnedQty < 0 || returnedQty > Number(item.qty || 0)) throw new Error('Returned quantity must be between 0 and issued quantity');
      if (warn && !notes.trim()) throw new Error('Notes are required for damaged or missing returns');
      await window.API.processReturn(item.id, {
        quantity_returned: returnedQty,
        return_condition: condition,
        notes: notes.trim() || null,
      });
      await Promise.all([window.API.loadDashboard(), window.API.loadIssuances(), window.API.loadRequisitions(), window.API.loadReports().catch(() => [])]);
      onConfirm && onConfirm(item.id, { condition, quantity_returned: returnedQty, notes: notes.trim() });
      onClose();
    } catch (e) {
      setErr(e.message || 'Return failed');
      setBusy(false);
    }
  };
  return (
    <Modal open onClose={onClose} title="Process Return" width={480}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant={warn ? 'danger' : 'primary'} loading={busy} onClick={handleConfirm}>Confirm Return</Button></>}>
      <div style={{ padding: '11px 14px', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-strong)' }}>{item.tool_name}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'monospace' }}>{item.tool_code} - issued to {item.issued_to}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Input label="Quantity returned" required type="number" value={qtyReturned} onChange={(e) => setQtyReturned(e.target.value)} min="0" max={item.qty} />
        <Select label="Condition" required value={condition} onChange={(e) => setCondition(e.target.value)}>
          <option value="good">Good</option>
          <option value="partial">Partial</option>
          <option value="damaged">Damaged</option>
          <option value="missing">Missing</option>
        </Select>
      </div>
      <div style={{ marginTop: 14 }}><Textarea label="Notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any observations on the returned tool..." /></div>
      {warn && (
        <div style={{ display: 'flex', gap: 9, marginTop: 14, padding: '11px 13px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)' }}>
          <Icon name="alert_triangle" size={16} color="var(--danger-solid)" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12.5, color: 'var(--danger-text)', lineHeight: 1.45 }}>
            A <strong>{condition}</strong> return routes this to <strong>Pending Damage Assessment</strong>. Stock will not be restored until assessed.
          </span>
        </div>
      )}
      {err && <div style={{ marginTop: 12, color: 'var(--danger-text)', fontSize: 12.5 }}>{err}</div>}
    </Modal>
  );
}

function RecordDamageModal({ item, onClose, onConfirm }) {
  const { Modal, Button, RadioGroup, Input, Textarea } = NS_RET;
  const [kind, setKind] = React.useState('mishandling');
  const [marketRate, setMarketRate] = React.useState(item.current_value);
  const [notes, setNotes] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState('');
  const inr = window.inr;
  const factor = kind === 'theft' ? 1 : kind === 'mishandling' ? 1 : 0;
  const penalty = Math.round((Number(marketRate) || 0) * factor);
  const handleConfirm = async () => {
    setBusy(true);
    setErr('');
    try {
      await window.API.recordDamage(item.id, {
        damage_type: kind,
        market_rate_at_damage: kind === 'theft' ? Number(marketRate) : null,
        notes: notes.trim() || null,
      });
      await Promise.all([window.API.loadDashboard(), window.API.loadIssuances(), window.API.loadReports().catch(() => [])]);
      onConfirm && onConfirm(item.id, { kind, penalty });
      onClose();
    } catch (e) {
      setErr(e.message || 'Damage assessment failed');
      setBusy(false);
    }
  };
  return (
    <Modal open onClose={onClose} title="Record Damage Assessment" width={480}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="danger" loading={busy} onClick={handleConfirm}>Record Assessment</Button></>}>
      <div style={{ padding: '11px 14px', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-strong)' }}>{item.tool_name}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'monospace' }}>{item.tool_code} - returned {item.condition} by {item.returned_by}</div>
      </div>
      <RadioGroup name="dmg" value={kind} onChange={setKind} label="Damage type" layout="stack"
        options={[
          { value: 'theft', label: 'Theft / Missing', hint: 'Full market-rate penalty (100%)' },
          { value: 'mishandling', label: 'Mishandling', hint: 'Book-value penalty at time of issue' },
          { value: 'wear_and_tear', label: 'Wear & tear', hint: 'No penalty - normal usage' },
        ]} />
      {kind !== 'wear_and_tear' && (
        <div style={{ marginTop: 16 }}>
          <Input label="Current market rate (Rs.)" type="number" value={marketRate} onChange={(e) => setMarketRate(e.target.value)} helper="Required for theft; book value is used for mishandling" />
        </div>
      )}
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 15px', borderRadius: 'var(--radius-md)', background: penalty > 0 ? 'var(--danger-bg)' : 'var(--success-bg)', border: `1px solid ${penalty > 0 ? 'var(--danger-border)' : 'var(--success-border)'}` }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: penalty > 0 ? 'var(--danger-text)' : 'var(--success-text)' }}>Calculated penalty</span>
        <span style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 700, color: penalty > 0 ? 'var(--danger-text)' : 'var(--success-text)' }}>{inr(penalty)}</span>
      </div>
      <div style={{ marginTop: 14 }}><Textarea label="Assessment notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Document the assessment rationale..." /></div>
      {err && <div style={{ marginTop: 12, color: 'var(--danger-text)', fontSize: 12.5 }}>{err}</div>}
    </Modal>
  );
}

function ReturnsScreen() {
  const { PageHeader, Card, DataTable, StatusBadge, Button, Input, EmptyState } = NS_RET;
  const [ret, setRet] = React.useState(null);
  const [dmg, setDmg] = React.useState(null);
  const [viewDmg, setViewDmg] = React.useState(null);
  const [retHist, setRetHist] = React.useState(null);
  const [selectedIssuance, setSelectedIssuance] = React.useState(null);
  const [activeList, setActiveList] = React.useState(window.MOCK.ACTIVE_ISSUANCES || []);
  const [damageList, setDamageList] = React.useState(window.MOCK.PENDING_DAMAGE || []);
  const [returnHistory, setReturnHistory] = React.useState(window.MOCK.RETURN_HISTORY || []);
  const [damageHistory, setDamageHistory] = React.useState([]);
  const [viewMode, setViewMode] = React.useState('list');
  const [recordsTab, setRecordsTab] = React.useState('returns');
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const [successMsg, setSuccessMsg] = React.useState('');
  const inr = window.inr;

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };
  const [selectedRecord, setSelectedRecord] = React.useState(null);

  const downloadRecords = () => {
    const KIND = { theft: 'Theft / Missing', mishandling: 'Mishandling', wear_and_tear: 'Wear & Tear' };
    let csv, filename;
    if (recordsTab === 'returns') {
      const headers = ['Tool', 'Tool Code', 'Returned By', 'Department', 'Due Date', 'Returned On', 'Condition'];
      const rows2 = returnHistory.map(r => [r.tool_name, r.tool_code, r.issued_to, r.dept, r.due, r.returnedOn, r.condition]);
      csv = [headers, ...rows2].map(row => row.map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
      filename = 'processed_returns.csv';
    } else {
      const headers = ['Tool', 'Tool Code', 'Returned By', 'Department', 'Condition', 'Damage Type', 'Penalty (Rs.)', 'Assessed On'];
      const rows2 = damageHistory.map(r => [r.tool_name, r.tool_code, r.returned_by, r.dept, r.condition, KIND[r.kind] || r.kind || '—', r.penalty || 0, r.assessedOn]);
      csv = [headers, ...rows2].map(row => row.map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
      filename = 'damage_assessments.csv';
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  React.useEffect(() => {
    setActiveList(window.MOCK.ACTIVE_ISSUANCES || []);
    setDamageList(window.MOCK.PENDING_DAMAGE || []);
    setReturnHistory(window.MOCK.RETURN_HISTORY || []);
  }, [window.MOCK.ACTIVE_ISSUANCES, window.MOCK.PENDING_DAMAGE, window.MOCK.RETURN_HISTORY]);

  const all = activeList;
  const activeUnits = all.reduce((sum, i) => sum + Number(i.qty || 0), 0);
  const overdue = all.filter(i => i.state === 'overdue').length;
  const pending = damageList.length;

  const chips = [
    { label: 'Issued Units',      value: activeUnits,    fg: 'var(--text-strong)',  bg: 'var(--surface-sunken)' },
    { label: 'Overdue',          value: overdue,        fg: 'var(--danger-text)',  bg: 'var(--danger-bg)' },
    { label: 'Pending Damage',   value: pending,        fg: 'var(--warning-text)', bg: 'var(--warning-bg)' },
  ];

  const activeRows = all.filter(i => {
    const q = search.toLowerCase();
    const matchQ = !q || `${i.tool_name} ${i.tool_code} ${i.issued_to}`.toLowerCase().includes(q);
    const matchF = filter === 'all' || i.state === filter;
    return matchQ && matchF;
  });

  const filterBtns = [
    { key: 'all',      label: 'All' },
    { key: 'on_time',  label: 'On Time' },
    { key: 'due_today',label: 'Due Today' },
    { key: 'overdue',  label: 'Overdue' },
    { key: 'records',  label: 'View Records' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <PageHeader title="Returns" subtitle="Process tool returns and assess damage" />

      {successMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)', color: 'var(--success-text)', fontSize: 13.5, fontWeight: 500 }}>
          <Icon name="check_circle" size={16} color="var(--success-solid)" />
          {successMsg}
        </div>
      )}

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {chips.map(ch => (
          <div key={ch.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-resting)' }}>
            <span style={{ fontSize: 17, fontWeight: 700, background: ch.bg, color: ch.fg, borderRadius: 'var(--radius-sm)', padding: '0 7px', lineHeight: 1.5 }}>{ch.value}</span>
            <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{ch.label}</span>
          </div>
        ))}
      </div>

      {/* Search + filter bar */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, maxWidth: 300 }}>
          <Input icon={<Icon name="search" size={14} />} placeholder="Search tool or borrower…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', padding: 3 }}>
          {filterBtns.map(f => (
            <button key={f.key}
              onClick={() => { if (f.key === 'records') { setViewMode('records'); } else { setViewMode('list'); setFilter(f.key); } }}
              style={{ padding: '5px 12px', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-sans)', fontWeight: 600,
                background: (f.key === 'records' ? viewMode === 'records' : viewMode === 'list' && filter === f.key) ? 'var(--surface-card)' : 'transparent',
                color: (f.key === 'records' ? viewMode === 'records' : viewMode === 'list' && filter === f.key) ? (f.key === 'records' ? 'var(--info-text)' : 'var(--text-strong)') : 'var(--text-muted)',
                boxShadow: (f.key === 'records' ? viewMode === 'records' : viewMode === 'list' && filter === f.key) ? 'var(--shadow-resting)' : 'none',
                transition: 'all 0.15s' }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {viewMode !== 'records' && <>
      {/* Active Issuances table */}
      <Card title={<span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-strong)' }}>Active Issuances</span>} padded={false}>
        <DataTable
          columns={[
            { key: 'tool_name', header: 'Tool', render: (r) => <div><div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{r.tool_name}</div><div style={{ fontSize: 11.5, color: 'var(--text-subtle)', fontFamily: 'monospace' }}>{r.tool_code}</div></div> },
            { key: 'qty', header: 'Qty', align: 'right' },
            { key: 'issued_to', header: 'Borrowed By', render: (r) => <div><div style={{ fontWeight: 500, color: 'var(--text-strong)' }}>{r.issued_to}</div><div style={{ fontSize: 11.5, color: 'var(--text-subtle)' }}>{r.dept}</div></div> },
            { key: 'issued_on', header: 'Issued On', nowrap: true, render: (r) => <span style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{r.issued_on}</span> },
            { key: 'due', header: 'Due', nowrap: true, render: (r) => <span style={{ color: r.state === 'overdue' ? 'var(--danger-text)' : 'var(--text-muted)', fontWeight: r.state === 'overdue' ? 600 : 400 }}>{r.due}</span> },
            { key: 'status', header: 'Status', render: (r) => <IssuanceBadge state={r.state} /> },
            { key: 'days', header: 'Days', render: (r) => <DaysChip days_left={r.days_left} state={r.state} /> },
            { key: 'actions', header: '', render: (r) => (
              <button onClick={e => { e.stopPropagation(); setRet(r); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', color: 'var(--text-default)', fontSize: 13, fontFamily: 'var(--font-sans)', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-black)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--brand-black)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-card)'; e.currentTarget.style.color = 'var(--text-default)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}>
                <Icon name="arrow_left_circle" size={14} /> Process Return
              </button>
            )},
          ]}
          rows={activeRows}
          onRowClick={r => setSelectedIssuance(r)}
          getRowTone={(r) => r.state === 'overdue' ? 'danger' : null}
          empty={<EmptyState compact icon={<Icon name="arrow_left_circle" size={26} />} title="No active issuances" message="There are no tools currently issued out." />}
        />
      </Card>

      {/* Pending Damage — only shown when there are items to resolve */}
      {damageList.length > 0 && <div style={{ border: '1.5px solid var(--danger-border, var(--danger-bg))', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 0 0 3px rgba(239,68,68,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: 'var(--danger-bg)', borderBottom: '1px solid var(--danger-border, var(--danger-bg))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="alert_triangle" size={17} color="var(--danger-text)" />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--danger-text)' }}>Pending Damage Assessment</span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-pill)', background: 'var(--danger-solid)', color: '#fff' }}>{damageList.length}</span>
          </div>
          <span style={{ fontSize: 11.5, color: 'var(--danger-text)', fontWeight: 500 }}>Admin action required — stock held pending resolution</span>
        </div>
        <div style={{ background: 'var(--surface-card)' }}>
          <DataTable
            columns={[
              { key: 'tool_name', header: 'Tool', render: (r) => <div><div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{r.tool_name}</div><div style={{ fontSize: 11.5, color: 'var(--text-subtle)', fontFamily: 'monospace' }}>{r.tool_code}</div></div> },
              { key: 'returned_by', header: 'Returned By', render: (r) => <div><div style={{ fontWeight: 500, color: 'var(--text-strong)' }}>{r.returned_by}</div><div style={{ fontSize: 11.5, color: 'var(--text-subtle)' }}>{r.dept}</div></div> },
              { key: 'returned_on', header: 'Returned', nowrap: true, render: (r) => <span style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{r.returned_on}</span> },
              { key: 'condition', header: 'Condition', render: (r) => <StatusBadge status={r.condition} size="sm" /> },
              { key: 'current_value', header: 'Tool Value', align: 'right', render: (r) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{inr(r.current_value)}</span> },
              { key: 'actions', header: '', nowrap: true, render: (r) => (
                <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                  <Button size="sm" variant="danger" onClick={() => setDmg(r)}>Record Damage</Button>
                  <Button size="sm" variant="secondary" onClick={() => setViewDmg(r)}>Details</Button>
                  <Button size="sm" variant="secondary" onClick={() => setRetHist(r)}>History</Button>
                </div>
              )},
            ]}
            rows={damageList}
            onRowClick={r => setViewDmg(r)}
            getRowTone={() => 'danger'}
            empty={<EmptyState tone="success" compact icon={<Icon name="check_circle" size={24} />} title="No pending assessments" message="All damaged/missing returns have been assessed." />}
          />
        </div>
      </div>}
      </>}

      {viewMode === 'records' && (
        <Card title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 12 }}>
            <div style={{ display: 'flex', gap: 0 }}>
              {[{ key: 'returns', label: `Processed Returns (${returnHistory.length})` }, { key: 'damage', label: `Damage Assessments (${damageHistory.length})` }].map(t => (
                <button key={t.key} onClick={() => setRecordsTab(t.key)} style={{ padding: '4px 16px 6px', border: 'none', background: 'transparent', borderBottom: `2px solid ${recordsTab === t.key ? 'var(--brand-black)' : 'transparent'}`, color: recordsTab === t.key ? 'var(--text-strong)' : 'var(--text-muted)', fontWeight: 600, fontSize: 13.5, cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'color 0.15s', marginBottom: -1 }}>{t.label}</button>
              ))}
            </div>
            <button onClick={downloadRecords}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 32, padding: '0 14px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', background: 'var(--surface-sunken)', color: 'var(--text-default)', fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              <Icon name="download" size={13} /> Download CSV
            </button>
          </div>
        } padded={false}>
          {recordsTab === 'returns' && (
            returnHistory.length === 0
              ? <div style={{ padding: '12px 0' }}><EmptyState compact icon={<Icon name="arrow_left_circle" size={26} />} title="No processed returns" message="Confirmed returns will appear here." /></div>
              : <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead><tr style={{ background: 'var(--surface-sunken)', borderBottom: '1px solid var(--border-default)' }}>
                    {['Tool', 'Returned By', 'Dept', 'Due', 'Returned On', 'Condition', ''].map(h => <th key={h} style={{ padding: '9px 20px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>{returnHistory.map((r, i) => (
                    <tr key={i} onClick={() => setSelectedRecord({ record: r, type: 'return' })} style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background='var(--surface-sunken)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <td style={{ padding: '11px 20px' }}><div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{r.tool_name}</div><div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-subtle)' }}>{r.tool_code}</div></td>
                      <td style={{ padding: '11px 20px' }}>{r.issued_to}</td>
                      <td style={{ padding: '11px 20px', color: 'var(--text-muted)' }}>{r.dept}</td>
                      <td style={{ padding: '11px 20px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{r.due}</td>
                      <td style={{ padding: '11px 20px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{r.returnedOn}</td>
                      <td style={{ padding: '11px 20px' }}><span style={{ padding: '2px 9px', borderRadius: 'var(--radius-pill)', fontSize: 11.5, fontWeight: 600, background: r.condition==='good'?'var(--success-bg)':r.condition==='partial'?'var(--warning-bg)':'var(--danger-bg)', color: r.condition==='good'?'var(--success-text)':r.condition==='partial'?'var(--warning-text)':'var(--danger-text)', textTransform: 'capitalize' }}>{r.condition}</span></td>
                      <td style={{ padding: '11px 16px', textAlign: 'right', color: 'var(--text-subtle)' }}><Icon name="arrow_right" size={14} /></td>
                    </tr>
                  ))}</tbody>
                </table>
          )}
          {recordsTab === 'damage' && (
            damageHistory.length === 0
              ? <div style={{ padding: '12px 0' }}><EmptyState compact icon={<Icon name="check_circle" size={26} />} tone="success" title="No damage assessments" message="Recorded damage assessments will appear here." /></div>
              : <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead><tr style={{ background: 'var(--surface-sunken)', borderBottom: '1px solid var(--border-default)' }}>
                    {['Tool', 'Returned By', 'Dept', 'Condition', 'Damage Type', 'Penalty', 'Assessed', ''].map(h => <th key={h} style={{ padding: '9px 20px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>{damageHistory.map((r, i) => (
                    <tr key={i} onClick={() => setSelectedRecord({ record: r, type: 'damage' })} style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background='var(--surface-sunken)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <td style={{ padding: '11px 20px' }}><div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{r.tool_name}</div><div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-subtle)' }}>{r.tool_code}</div></td>
                      <td style={{ padding: '11px 20px' }}>{r.returned_by}</td>
                      <td style={{ padding: '11px 20px', color: 'var(--text-muted)' }}>{r.dept}</td>
                      <td style={{ padding: '11px 20px' }}><span style={{ padding: '2px 9px', borderRadius: 'var(--radius-pill)', fontSize: 11.5, fontWeight: 600, background: 'var(--danger-bg)', color: 'var(--danger-text)', textTransform: 'capitalize' }}>{r.condition}</span></td>
                      <td style={{ padding: '11px 20px', color: 'var(--text-muted)' }}>{{ theft: 'Theft / Missing', mishandling: 'Mishandling', wear_and_tear: 'Wear & Tear' }[r.kind] || '—'}</td>
                      <td style={{ padding: '11px 20px', fontFamily: 'monospace', fontWeight: 600, color: r.penalty > 0 ? 'var(--danger-text)' : 'var(--success-text)' }}>{inr(r.penalty || 0)}</td>
                      <td style={{ padding: '11px 20px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{r.assessedOn}</td>
                      <td style={{ padding: '11px 16px', textAlign: 'right', color: 'var(--text-subtle)' }}><Icon name="arrow_right" size={14} /></td>
                    </tr>
                  ))}</tbody>
                </table>
          )}
        </Card>
      )}
      {ret && <ProcessReturnModal item={ret} onClose={() => setRet(null)} onConfirm={(id, extra) => { const found = activeList.find(i => i.id === id); setActiveList(window.MOCK.ACTIVE_ISSUANCES || []); setDamageList(window.MOCK.PENDING_DAMAGE || []); if (found) { setReturnHistory(h => [...h, { ...found, condition: extra?.condition || 'good', returnedOn: new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) }]); showSuccess(`Return for ${found.tool_name} confirmed successfully.`); } }} />}
      {dmg && <RecordDamageModal item={dmg} onClose={() => setDmg(null)} onConfirm={(id, extra) => { const found = damageList.find(i => i.id === id); setActiveList(window.MOCK.ACTIVE_ISSUANCES || []); setDamageList(window.MOCK.PENDING_DAMAGE || []); if (found) { setDamageHistory(h => [...h, { ...found, kind: extra?.kind, penalty: extra?.penalty || 0, assessedOn: new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) }]); showSuccess(`Damage assessment for ${found.tool_name} recorded.`); } }} />}
      {viewDmg && <ViewDamageModal    item={viewDmg} onClose={() => setViewDmg(null)} />}
      {retHist && <ReturnHistoryModal item={retHist} onClose={() => setRetHist(null)} />}
      {selectedIssuance && <window.IssuanceDetailModal issuance={selectedIssuance} onClose={() => setSelectedIssuance(null)} />}
      {selectedRecord && <ReturnRecordDetailModal record={selectedRecord.record} type={selectedRecord.type} onClose={() => setSelectedRecord(null)} />}
    </div>
  );
}

Object.assign(window, { ReturnsScreen });
