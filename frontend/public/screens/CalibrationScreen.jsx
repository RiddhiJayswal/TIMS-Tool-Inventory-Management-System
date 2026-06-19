const NS_CAL = window.MTRSDesignSystemUltraTechCement_660dc9;

const SERVICE_PARTNERS = ['Fluke India', 'Testronix Services', 'CalTech Solutions', 'Precision Lab'];

/* Mock calibration history per tool id */
const CAL_HISTORY = {
  51: [
    { id: 1, date: '14 Dec 2025', partner: 'Fluke India',          cert_no: 'CERT-2025-0412', by: 'Rajesh Menon',  notes: 'Regular 6-month calibration. All readings within tolerance.', file: 'cert_TL-0088_dec25.pdf' },
    { id: 2, date: '16 Jun 2025', partner: 'Fluke India',          cert_no: 'CERT-2025-0188', by: 'K. Iqbal',      notes: 'Passed all standard tests.',                                   file: 'cert_TL-0088_jun25.pdf' },
    { id: 3, date: '18 Dec 2024', partner: 'Testronix Services',   cert_no: 'CERT-2024-0390', by: 'Rajesh Menon',  notes: 'Sensor adjusted. Calibrated as per IS 1248.',                  file: 'cert_TL-0088_dec24.pdf' },
  ],
  52: [
    { id: 1, date: '18 Dec 2025', partner: 'Testronix Services',   cert_no: 'CERT-2025-0398', by: 'Rajesh Menon',  notes: 'Minor adjustment made to temperature sensor.',                 file: 'cert_TL-0102_dec25.pdf' },
    { id: 2, date: '20 Jun 2025', partner: 'Testronix Services',   cert_no: 'CERT-2025-0201', by: 'V. Krishnan',   notes: 'Passed all tests.',                                            file: 'cert_TL-0102_jun25.pdf' },
  ],
  53: [
    { id: 1, date: '20 Jan 2026', partner: 'CalTech Solutions',    cert_no: 'CERT-2026-0041', by: 'Rajesh Menon',  notes: 'Annual calibration. Torque accuracy ±2%.',                     file: 'cert_TL-0142_jan26.pdf' },
    { id: 2, date: '24 Jul 2025', partner: 'CalTech Solutions',    cert_no: 'CERT-2025-0271', by: 'K. Iqbal',      notes: 'Regular calibration completed.',                               file: 'cert_TL-0142_jul25.pdf' },
  ],
  54: [
    { id: 1, date: '02 Mar 2026', partner: 'Precision Lab',        cert_no: 'CERT-2026-0088', by: 'Rajesh Menon',  notes: 'Calibrated as per manufacturer specs.',                        file: 'cert_TL-0319_mar26.pdf' },
    { id: 2, date: '04 Sep 2025', partner: 'Precision Lab',        cert_no: 'CERT-2025-0321', by: 'Anita Sharma',  notes: 'All channels verified.',                                       file: 'cert_TL-0319_sep25.pdf' },
  ],
};

/* ── Status + Blocked badge cell ───────────────────────────────────── */
function CalDueCell({ state, days, blocked }) {
  const safeState = state === 'ok' || state === 'not_scheduled' ? 'on_time' : state;
  const safeDays = Number.isFinite(Number(days)) ? Number(days) : 0;
  const cfg = {
    on_time:   { bg: 'var(--success-bg)', fg: 'var(--success-text)', icon: 'check_circle',   label: `In ${safeDays}d` },
    due_today: { bg: 'var(--warning-bg)', fg: 'var(--warning-text)', icon: 'clock',          label: `Due in ${safeDays}d` },
    overdue:   { bg: 'var(--danger-bg)',  fg: 'var(--danger-text)',  icon: 'alert_triangle', label: `${Math.abs(safeDays)}d overdue` },
  }[safeState] || { bg: 'var(--surface-sunken)', fg: 'var(--text-muted)', icon: 'clock', label: 'Scheduled' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 'var(--radius-pill)', background: cfg.bg, color: cfg.fg, fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
        <Icon name={cfg.icon} size={11} /> {cfg.label}
      </span>
      {blocked && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 'var(--radius-pill)', background: 'var(--danger-bg)', color: 'var(--danger-text)', fontSize: 10.5, fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
          <Icon name="x" size={9} /> Blocked from Issue
        </span>
      )}
    </div>
  );
}

/* ── Record Calibration Modal ──────────────────────────────────────── */
function RecordCalibrationModal({ item, onClose }) {
  const { Modal, Button, Input, Textarea } = NS_CAL;
  const [date, setDate] = React.useState('2026-06-14');
  const [partner, setPartner] = React.useState(item.service_partner || '');
  const [certNo, setCertNo] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  const nextDue = React.useMemo(() => {
    const d = new Date(date); if (isNaN(d)) return '—';
    d.setDate(d.getDate() + item.freq);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }, [date, item.freq]);

  const InfoPill = ({ label, value, danger }) => (
    <div>
      <div style={{ fontSize: 10.5, color: 'var(--text-subtle)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: danger ? 'var(--danger-text)' : 'var(--text-default)' }}>{value}</div>
    </div>
  );

  const saveRecord = async () => {
    setBusy(true);
    setError('');
    try {
      await window.API.recordCalibration(item.id, {
        calibration_date: date,
        service_partner: partner || null,
        notes: [certNo ? `Certificate: ${certNo}` : '', notes].filter(Boolean).join(' | ') || null,
      });
      await Promise.all([window.API.loadCalibration(), window.API.loadDashboard(), window.API.loadReports()]);
      onClose();
    } catch (e) {
      setError(e.message || 'Could not record calibration');
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Record Calibration" width={520}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={busy} onClick={saveRecord}>Save Record</Button></>}>

      {/* Tool info panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14, padding: '14px 16px', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
        <div style={{ gridColumn: '1 / 3' }}>
          <div style={{ fontSize: 10.5, color: 'var(--text-subtle)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Tool Name</div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-strong)' }}>{item.tool_name}</div>
        </div>
        <InfoPill label="Tool Code" value={item.tool_code} />
        <InfoPill label="Frequency" value={`${item.freq} days`} />
        <InfoPill label="Last Calibrated" value={item.last} />
        <InfoPill label="Current Next Due" value={item.next} danger={item.state === 'overdue'} />
      </div>

      {/* Fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Input label="Calibration Date" required type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Input label="Service Partner" required value={partner} onChange={(e) => setPartner(e.target.value)} placeholder="Vendor / lab name" />
        <Input label="Certificate Number" value={certNo} onChange={(e) => setCertNo(e.target.value)} placeholder="e.g. CERT-2026-0412" />
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-default)', marginBottom: 6 }}>Certificate Upload</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: '1.5px dashed var(--border-default)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12.5, transition: 'border-color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand-yellow)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}>
            <Icon name="download" size={14} />
            <span>Upload PDF / image</span>
            <input type="file" accept=".pdf,.jpg,.png" style={{ display: 'none' }} />
          </label>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <Textarea label="Notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observations, adjustments, certificate remarks…" />
        </div>
      </div>

      {/* Next-due preview */}
      <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderRadius: 'var(--radius-md)', background: 'var(--info-bg)', border: '1px solid var(--info-border)' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--info-text)', fontWeight: 600, opacity: 0.75 }}>NEXT CALIBRATION DUE (PREVIEW)</div>
          <div style={{ fontSize: 11.5, color: 'var(--info-text)', marginTop: 2 }}>Based on calibration date + {item.freq}-day cycle</div>
        </div>
        <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--info-text)' }}>{nextDue}</span>
      </div>
      {error && <div style={{ marginTop: 12, padding: '9px 11px', borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', color: 'var(--danger-text)', fontSize: 12.5, fontWeight: 600 }}>{error}</div>}
    </Modal>
  );
}

/* ── History Modal ─────────────────────────────────────────────────── */
function HistoryModal({ item, onClose }) {
  const { Modal, Button } = NS_CAL;
  const logs = CAL_HISTORY[item.id] || [];

  return (
    <Modal open onClose={onClose} title="Calibration History" width={680}
      footer={<Button variant="secondary" onClick={onClose}>Close</Button>}>

      <div style={{ display: 'flex', gap: 22, padding: '11px 14px', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', marginBottom: 18 }}>
        {[['Tool', item.tool_name], ['Code', item.tool_code], ['Dept', item.dept], ['Frequency', `Every ${item.freq} days`]].map(([l, v]) => (
          <div key={l}>
            <div style={{ fontSize: 10.5, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{l}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-default)', marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>

      {logs.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-subtle)', padding: '32px 0', fontSize: 13 }}>No calibration history recorded yet.</p>
      ) : (
        <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--surface-sunken)', borderBottom: '1px solid var(--border-default)' }}>
                {['Date', 'Service Partner', 'Cert No.', 'Recorded By', 'Notes', 'File'].map((h, i) => (
                  <th key={i} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={log.id} style={{ borderBottom: i < logs.length - 1 ? '1px solid var(--border-subtle)' : 'none', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-sunken)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', fontWeight: 500, color: 'var(--text-default)' }}>{log.date}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-default)' }}>{log.partner}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{log.cert_no}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{log.by}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)', maxWidth: 180 }}>
                    <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{log.notes}</span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <button style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)', border: '1px solid var(--border-default)', background: 'transparent', borderRadius: 'var(--radius-sm)', padding: '3px 8px', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-sunken)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <Icon name="download" size={12} /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}

/* ── Calibration Detail Modal ──────────────────────────────────────── */
function CalibrationDetailModal({ item, onClose, onRecord, onHistory }) {
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const safeState = item.state === 'ok' || item.state === 'not_scheduled' ? 'on_time' : item.state;
  const STATE = {
    on_time:   { bg: 'var(--success-bg)', fg: 'var(--success-text)', icon: 'check_circle',   label: 'Up to Date' },
    due_today: { bg: 'var(--warning-bg)', fg: 'var(--warning-text)', icon: 'clock',          label: 'Due Soon'   },
    overdue:   { bg: 'var(--danger-bg)',  fg: 'var(--danger-text)',  icon: 'alert_triangle', label: 'Overdue'    },
  };
  const st = STATE[safeState] || STATE.on_time;
  const absDays = Math.abs(Number(item.days || 0));
  const logs = CAL_HISTORY[item.id] || [];

  const F = ({ label, value, bold }) => (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: bold ? 700 : 400, color: bold ? 'var(--text-strong)' : 'var(--text-default)' }}>{value || '—'}</div>
    </div>
  );

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', padding: 20 }}>
      <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 560, maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-subtle)', marginBottom: 3 }}>{item.tool_code}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-strong)' }}>{item.tool_name}</div>
          </div>
          <button onClick={onClose} style={{ display: 'grid', placeItems: 'center', width: 32, height: 32, border: '1px solid var(--border-default)', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}>
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.1) transparent' }}>
          {/* Status banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 'var(--radius-md)', background: st.bg, marginBottom: 20 }}>
            <Icon name={st.icon} size={16} color={st.fg} />
            <span style={{ fontSize: 13.5, fontWeight: 700, color: st.fg }}>{st.label}</span>
            <span style={{ fontSize: 12.5, color: st.fg, opacity: 0.8 }}>· {absDays}d {safeState === 'overdue' ? 'overdue' : 'remaining'}</span>
            {item.blocked && (
              <span style={{ marginLeft: 'auto', fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--radius-pill)', background: 'var(--danger-solid)', color: '#fff', flexShrink: 0 }}>Blocked from Issue</span>
            )}
          </div>

          {/* Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', paddingBottom: 20, marginBottom: 20, borderBottom: '1px solid var(--border-subtle)' }}>
            <F label="Tool Code" value={item.tool_code} />
            <F label="Department" value={item.dept} />
            <F label="Last Calibrated" value={item.last} />
            <F label="Next Due" value={item.next} bold />
            <F label="Frequency" value={`Every ${item.freq} days`} />
            <F label="Service Partner" value={item.service_partner} />
          </div>

          {/* History */}
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Calibration History</div>
            {logs.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-subtle)', fontSize: 13 }}>No records yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {logs.map(log => (
                  <div key={log.id} style={{ display: 'flex', gap: 14, padding: '12px 14px', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--success-bg)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <Icon name="check_circle" size={16} color="var(--success-solid,var(--success-text))" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-strong)' }}>{log.date}</div>
                        <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)', flexShrink: 0 }}>{log.cert_no}</span>
                      </div>
                      <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>{log.partner} · Recorded by {log.by}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.45 }}>{log.notes}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 8, justifyContent: 'flex-end', flexShrink: 0 }}>
          <button onClick={() => { onClose(); onHistory(item); }}
            style={{ height: 36, padding: '0 16px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--text-default)', fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
            Full History
          </button>
          <button onClick={() => { onClose(); onRecord(item); }}
            style={{ height: 36, padding: '0 18px', border: 'none', borderRadius: 'var(--radius-md)', background: 'var(--brand-black)', color: '#fff', fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
            Record Calibration
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main screen ───────────────────────────────────────────────────── */
function CalibrationScreen() {
  const { PageHeader, Card, Tabs, DataTable, Button, EmptyState, Input } = NS_CAL;
  const [search, setSearch] = React.useState('');
  const [partnerFilter, setPartnerFilter] = React.useState('all');
  const [tab, setTab] = React.useState('all');
  const [rec, setRec] = React.useState(null);
  const [hist, setHist] = React.useState(null);
  const [selectedCal, setSelectedCal] = React.useState(null);

  /* Build from live MOCK data — evaluated at render time after data loads */
  const CAL_DATA = (window.MOCK?.CALIBRATION || []).map((c, i) => ({
    ...c,
    service_partner: c.service_partner || SERVICE_PARTNERS[i % SERVICE_PARTNERS.length],
    blocked: c.state === 'overdue',
  }));

  const partners = [...new Set(CAL_DATA.map(c => c.service_partner))];
  const stateMap = { overdue: ['overdue'], due_soon: ['due_today'], up_to_date: ['on_time', 'ok', 'not_scheduled'] };

  const filtered = CAL_DATA.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || `${c.tool_name || ''} ${c.tool_code || ''} ${c.service_partner || ''} ${c.freq || ''}`.toLowerCase().includes(q);
    return matchQ
      && (partnerFilter === 'all' || c.service_partner === partnerFilter)
      && (tab === 'all' || stateMap[tab].includes(c.state));
  });

  const cnt = (k) => CAL_DATA.filter(x => stateMap[k].includes(x.state)).length;

  const summaryCards = [
    { label: 'Overdue',             value: cnt('overdue'),           icon: 'alert_triangle', color: 'var(--danger-text)',  bg: 'var(--danger-bg)' },
    { label: 'Due Soon',            value: cnt('due_soon'),          icon: 'clock',          color: 'var(--warning-text)', bg: 'var(--warning-bg)' },
    { label: 'Up to Date',          value: cnt('up_to_date'),        icon: 'check_circle',   color: 'var(--success-text)', bg: 'var(--success-bg)' },
    { label: 'Blocked from Issue',  value: CAL_DATA.filter(c => c.blocked).length, icon: 'x', color: 'var(--danger-text)', bg: 'var(--danger-bg)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader title="Calibration" subtitle="Calibration schedule, service records and compliance tracking" />

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {summaryCards.map(s => (
          <div key={s.label} style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: s.bg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Icon name={s.icon} size={18} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <Input icon={<Icon name="search" size={14} />} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tool code, name, partner or frequency..." />
        </div>
        <select value={partnerFilter} onChange={e => setPartnerFilter(e.target.value)}
          style={{ height: 36, padding: '0 12px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--text-default)', background: 'var(--surface-card)', cursor: 'pointer', outline: 'none' }}>
          <option value="all">All Partners</option>
          {partners.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div style={{ overflowX: 'auto' }}>
        <Tabs value={tab} onChange={setTab} tabs={[
          { value: 'all',        label: 'All' },
          { value: 'overdue',    label: 'Overdue',     count: cnt('overdue'),    tone: 'danger' },
          { value: 'due_soon',   label: 'Due Soon',    count: cnt('due_soon') },
          { value: 'up_to_date', label: 'Up to Date',  count: cnt('up_to_date') },
        ]} />
      </div>

      {/* Table */}
      <Card padded={false}>
        <DataTable
          columns={[
            { key: 'tool_name', header: 'Tool', render: (r) => (
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{r.tool_name}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>{r.tool_code}</div>
              </div>
            )},
            { key: 'last', header: 'Schedule', render: (r) => (
              <div style={{ fontSize: 12.5, lineHeight: 1.6 }}>
                <div style={{ color: 'var(--text-muted)' }}>{r.last}</div>
                <div style={{ color: r.state === 'overdue' ? 'var(--danger-text)' : 'var(--text-default)', fontWeight: 500 }}>→ {r.next}</div>
              </div>
            )},
            { key: 'service_partner', header: 'Service / Freq.', render: (r) => (
              <div style={{ fontSize: 12.5, lineHeight: 1.6 }}>
                <div style={{ color: 'var(--text-default)' }}>{r.service_partner}</div>
                <div style={{ color: 'var(--text-muted)' }}>Every {r.freq}d</div>
              </div>
            )},
            { key: 'state', header: 'Status', render: (r) => <CalDueCell state={r.state} days={r.days} blocked={r.blocked} /> },
            { key: 'actions', header: '', nowrap: true, render: (r) => (
              <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                <Button size="sm" variant={r.state === 'overdue' ? 'primary' : 'secondary'} onClick={() => setRec(r)}>Record</Button>
                <Button size="sm" variant="secondary" onClick={() => setHist(r)}>History</Button>
                <Button size="sm" variant="secondary"><Icon name="download" size={13} /></Button>
              </div>
            )},
          ]}
          rows={filtered}
          onRowClick={r => setSelectedCal(r)}
          getRowTone={(r) => r.state === 'overdue' ? 'danger' : null}
          empty={<EmptyState tone="success" compact icon={<Icon name="check_circle" size={24} />} title="Nothing found" message="No tools match your current filters." />}
        />
      </Card>

      {rec  && <RecordCalibrationModal item={rec}  onClose={() => setRec(null)}  />}
      {hist && <HistoryModal           item={hist} onClose={() => setHist(null)} />}
      {selectedCal && <CalibrationDetailModal item={selectedCal} onClose={() => setSelectedCal(null)} onRecord={r => setRec(r)} onHistory={r => setHist(r)} />}
    </div>
  );
}

Object.assign(window, { CalibrationScreen });
