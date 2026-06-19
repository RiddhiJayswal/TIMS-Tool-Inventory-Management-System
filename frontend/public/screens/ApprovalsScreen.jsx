const NS_APP = window.MTRSDesignSystemUltraTechCement_660dc9;

/* ── Helpers ─────────────────────────────────────────────────────── */
function parseDMY(s) {
  if (!s) return null;
  const mon = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
  const p = s.split(' ');
  return p.length === 3 ? new Date(+p[2], mon[p[1]], +p[0]) : null;
}

const TODAY = new Date();

function getPriorityBadges(req) {
  const badges = [];
  const from = parseDMY(req.from);
  const to = parseDMY(req.to);
  const daysUntil = from ? (from - TODAY) / 86400000 : null;
  if (daysUntil !== null && daysUntil <= 0) badges.push({ k:'urgent',  label:'Urgent',        bg:'var(--danger-bg)',  fg:'var(--danger-text)' });
  else if (daysUntil !== null && daysUntil <= 2) badges.push({ k:'soon', label:'Due Soon',   bg:'var(--warning-bg)', fg:'var(--warning-text)' });
  if (req.qty >= 2) badges.push({ k:'hq', label:'High Qty',       bg:'var(--warning-bg)', fg:'var(--warning-text)' });
  if (from && to && (to-from)/86400000 > 5) badges.push({ k:'ld', label:'Long Duration', bg:'var(--info-bg)', fg:'var(--info-text)' });
  return badges;
}

function PriorityBadges({ req }) {
  const bs = getPriorityBadges(req);
  if (!bs.length) return null;
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {bs.map(b => <span key={b.k} style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 'var(--radius-pill)', background: b.bg, color: b.fg, whiteSpace: 'nowrap' }}>{b.label}</span>)}
    </div>
  );
}

/* ── Status timeline ─────────────────────────────────────────────── */
function StatusTimeline({ status }) {
  const rejected = status === 'rejected';
  const cancelled = status === 'cancelled';
  const steps = [
    { key: 'pending',  label: 'Requested', icon: 'clipboard' },
    { key: 'approved', label: rejected ? 'Rejected' : cancelled ? 'Cancelled' : 'Approved', icon: (rejected || cancelled) ? 'x' : 'check_circle' },
    { key: 'issued',   label: 'Issued',    icon: 'arrow_right_circle' },
    { key: 'returned', label: 'Returned',  icon: 'arrow_left_circle' },
  ];
  const order = ['pending','approved','issued','returned'];
  const curIdx = order.indexOf((rejected || cancelled) ? 'approved' : status);
  const state = (i) => i < curIdx ? 'done' : i === curIdx ? ((rejected || cancelled) ? 'rejected' : 'active') : 'future';

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: 4 }}>
      {steps.map((s, i) => {
        const st = state(i);
        const dotBg = st==='done' ? 'var(--success-solid)' : st==='active' ? 'var(--brand-black)' : st==='rejected' ? 'var(--danger-solid)' : 'var(--border-default)';
        const dotColor = st==='future' ? 'var(--text-subtle)' : '#fff';
        return (
          <React.Fragment key={s.key}>
            <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:4,minWidth:64 }}>
              <div style={{ width:28,height:28,borderRadius:'50%',display:'grid',placeItems:'center',background:dotBg }}>
                <Icon name={s.icon} size={13} color={dotColor} />
              </div>
              <span style={{ fontSize:10.5,textAlign:'center',color:st==='future'?'var(--text-subtle)':'var(--text-muted)',fontWeight:st!=='future'?600:400,lineHeight:1.3 }}>{s.label}</span>
            </div>
            {i < steps.length-1 && <div style={{ flex:1,height:2,marginTop:13,background:state(i+1)!=='future'?'var(--success-solid)':'var(--border-subtle)' }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ── View Details modal ──────────────────────────────────────────── */
function ViewDetailsModal({ req, onClose, effectiveStatus }) {
  const { Modal, Button } = NS_APP;
  const status = effectiveStatus || req.status;
  const F = ({ label, value, full }) => (
    <div style={full?{gridColumn:'1/-1'}:{}}>
      <div style={{ fontSize:10.5,color:'var(--text-subtle)',textTransform:'uppercase',letterSpacing:'0.05em',fontWeight:600,marginBottom:2 }}>{label}</div>
      <div style={{ fontSize:13.5,color:'var(--text-default)' }}>{value||'—'}</div>
    </div>
  );
  return (
    <Modal open onClose={onClose} title="Request Details" width={520} footer={<Button variant="secondary" onClick={onClose}>Close</Button>}>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:22 }}>
        <F label="Requisition No." value={<span style={{ fontFamily:'monospace' }}>{req.requisition_number}</span>} />
        <F label="Submitted" value={req.submitted} />
        <F label="Tool" value={<strong style={{ color:'var(--text-strong)' }}>{req.tool_name}</strong>} />
        <F label="Quantity" value={`${req.qty} unit${req.qty>1?'s':''}`} />
        {req.requester && <F label="Requested By" value={`${req.requester}${req.employee_id ? ` (${req.employee_id})` : ''}`} />}
        <F label="Department" value={req.dept || 'Not assigned'} />
        <F label="Period" value={`${req.from} → ${req.to}`} full={!req.requester} />
        {req.requester && <F label="Period" value={`${req.from} → ${req.to}`} />}
        <F label="Purpose" value={req.purpose || 'No remarks'} full />
        {req.rejection_reason && <F label="Rejection Reason" value={req.rejection_reason} full />}
      </div>
      <div style={{ paddingTop:16,borderTop:'1px solid var(--border-subtle)' }}>
        <div style={{ fontSize:11,fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:'var(--text-subtle)',marginBottom:10 }}>Status Timeline</div>
        <StatusTimeline status={status} />
      </div>
      {getPriorityBadges(req).length > 0 && (
        <div style={{ marginTop:16,paddingTop:14,borderTop:'1px solid var(--border-subtle)',display:'flex',gap:6,flexWrap:'wrap' }}>
          <span style={{ fontSize:11,fontWeight:700,color:'var(--text-subtle)',marginRight:4,letterSpacing:'0.04em',textTransform:'uppercase',alignSelf:'center' }}>Flags</span>
          {getPriorityBadges(req).map(b => <span key={b.k} style={{ fontSize:11.5,fontWeight:700,padding:'3px 9px',borderRadius:'var(--radius-pill)',background:b.bg,color:b.fg }}>{b.label}</span>)}
        </div>
      )}
    </Modal>
  );
}

/* ── Main screen ─────────────────────────────────────────────────── */
function ApprovalsScreen() {
  const { PageHeader, Card, Tabs, DataTable, Button, ConfirmDialog, Modal, Textarea, EmptyState, Input } = NS_APP;
  const [tab, setTab] = React.useState('pending');
  const [approving, setApproving] = React.useState(null);
  const [rejecting, setRejecting] = React.useState(null);
  const [viewing, setViewing] = React.useState(null);
  const [reason, setReason] = React.useState('');
  const [reasonErr, setReasonErr] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [deptFilter, setDeptFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [message, setMessage] = React.useState(null);

  const userRole = (window.MOCK.USER || {}).role;
  const userDept = (window.MOCK.USER || {}).department;
  const isDeptHead = userRole === 'dept_head';
  const visibleReqs = isDeptHead
    ? (window.MOCK.REQUISITIONS || []).filter(r => r.dept === userDept)
    : (window.MOCK.REQUISITIONS || []);
  const decided = (s) => visibleReqs.filter(r => r.status === s);
  const pending = visibleReqs.filter(r => r.status === 'pending');
  const depts = [...new Set(visibleReqs.map(r => r.dept).filter(Boolean))];

  let base = tab === 'pending' ? pending : decided(tab);
  if (!isDeptHead && deptFilter !== 'all') base = base.filter(r => r.dept === deptFilter);
  const q = search.trim().toLowerCase();
  if (q) {
    base = base.filter(r => `${r.requisition_number || ''} ${r.requester || ''} ${r.employee_id || ''} ${r.dept || ''} ${r.tool_name || ''} ${r.qty || ''} ${r.purpose || ''} ${r.status || ''}`.toLowerCase().includes(q));
  }

  const effectiveStatus = (r) => r.status || 'pending';

  const doApprove = async () => {
    setBusy(true);
    try {
      await window.API.approveRequisition(approving.id);
      await Promise.all([window.API.loadRequisitions(), window.API.loadDashboard(), window.API.loadIssuances()]);
      setApproving(null);
      setMessage({ tone: 'success', text: 'Request approved successfully.' });
      setTimeout(() => setMessage(null), 4000);
    } catch (e) {
      console.error('Approval failed:', e);
      setMessage({ tone: 'danger', text: e.message || 'Approval failed' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setBusy(false);
    }
  };
  const doReject = async () => {
    if (!reason.trim()) { setReasonErr('Rejection reason is required'); return; }
    setBusy(true);
    try {
      await window.API.rejectRequisition(rejecting.id, reason.trim());
      await Promise.all([window.API.loadRequisitions(), window.API.loadDashboard(), window.API.loadIssuances()]);
      setRejecting(null);
      setReason('');
      setMessage({ tone: 'success', text: 'Request rejected successfully.' });
      setTimeout(() => setMessage(null), 4000);
    } catch (e) {
      setReasonErr(e.message || 'Rejection failed');
    } finally {
      setBusy(false);
    }
  };

  const EMPTY_MSGS = {
    pending:  { icon: 'check_square', title: 'All clear', msg: 'No requisitions are pending your approval.' },
    approved: { icon: 'check_circle', title: 'None approved yet', msg: 'Approved requests will appear here.' },
    rejected: { icon: 'x',            title: 'No rejected requests', msg: 'Rejected requests will appear here.' },
  };
  const empty = EMPTY_MSGS[tab] || EMPTY_MSGS.pending;

  const tabStyle = (val) => ({
    display:'inline-flex',alignItems:'center',gap:6,padding:'8px 14px',border:'none',borderRadius:'var(--radius-md)',cursor:'pointer',
    fontFamily:'var(--font-sans)',fontSize:13,fontWeight:tab===val?700:400,whiteSpace:'nowrap',
    color:tab===val?'var(--text-strong)':'var(--text-muted)',background:tab===val?'var(--surface-card)':'transparent',
    boxShadow:tab===val?'var(--shadow-resting)':'none',transition:'all 0.15s',
  });

  const countPill = (n, tone) => n > 0 ? <span style={{ fontSize:10.5,fontWeight:700,padding:'1px 6px',borderRadius:'var(--radius-pill)',background:tone==='danger'?'var(--danger-solid)':'var(--surface-sunken)',color:tone==='danger'?'#fff':'var(--text-muted)',minWidth:16,textAlign:'center' }}>{n}</span> : null;

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
      <PageHeader title="Approvals" subtitle="Review and action tool requisitions from your department" />

      {message && (
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 16px', borderRadius:'var(--radius-md)', background:message.tone === 'danger' ? 'var(--danger-bg)' : 'var(--success-bg)', border:`1px solid ${message.tone === 'danger' ? 'var(--danger-border)' : 'var(--success-border)'}`, color:message.tone === 'danger' ? 'var(--danger-text)' : 'var(--success-text)', fontSize:13.5, fontWeight:500 }}>
          <Icon name={message.tone === 'danger' ? 'alert_triangle' : 'check_circle'} size={16} color={message.tone === 'danger' ? 'var(--danger-solid)' : 'var(--success-solid)'} />
          {message.text}
        </div>
      )}

      {/* Polished tab bar */}
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10 }}>
        <div style={{ display:'flex',gap:2,background:'var(--surface-sunken)',borderRadius:'var(--radius-md)',padding:3 }}>
          {[
            { val:'pending', label:'Pending',  count:pending.length, tone:'' },
            { val:'approved',label:'Approved', count:decided('approved').length, tone:'' },
            { val:'rejected',label:'Rejected', count:decided('rejected').length, tone:'danger' },
          ].map(t => (
            <button key={t.val} onClick={() => setTab(t.val)} style={tabStyle(t.val)}>
              {t.label} {countPill(t.count, t.tone)}
            </button>
          ))}
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:10,flexWrap:'wrap' }}>
          <div style={{ width: 260 }}>
            <Input icon={<Icon name="search" size={14} />} placeholder="Search request, employee, tool..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {!isDeptHead && <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
            style={{ height:34,padding:'0 10px',border:'1px solid var(--border-default)',borderRadius:'var(--radius-md)',fontFamily:'var(--font-sans)',fontSize:13,color:'var(--text-default)',background:'var(--surface-card)',cursor:'pointer',outline:'none' }}>
            <option value="all">All Depts</option>
            {depts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>}
        </div>
      </div>

      <Card padded={false}>
        <DataTable
          columns={[
            { key:'requisition_number', header:'Request', nowrap:true, render:(r) => (
              <div>
                <div style={{ fontFamily:'monospace',fontSize:12,color:'var(--text-muted)',marginBottom:2 }}>{r.requisition_number}</div>
                <div style={{ fontWeight:700,color:'var(--text-strong)',fontSize:13.5 }}>{r.tool_name}</div>
                <div style={{ marginTop:3 }}><PriorityBadges req={r} /></div>
              </div>
            )},
            { key:'qty', header:'Qty', align:'right', render:(r) => <span style={{ fontWeight:700,fontSize:15 }}>{r.qty}</span> },
            { key:'requester', header:'Requested By', render:(r) => (
              <div>
                <div style={{ fontWeight:600,color:'var(--text-strong)' }}>{r.requester}</div>
                <div style={{ fontSize:11.5,color:'var(--text-subtle)' }}>{r.employee_id ? `${r.employee_id} · ` : ''}{r.dept}</div>
              </div>
            )},
            { key:'period', header:'Period', nowrap:true, render:(r) => (
              <div style={{ fontSize:12.5,color:'var(--text-muted)',lineHeight:1.5 }}>
                <div>{r.from}</div>
                <div style={{ color:'var(--text-subtle)' }}>→ {r.to}</div>
              </div>
            )},
            { key:'actions', header:'', nowrap:true, render:(r) => (
              <div style={{ display:'flex',gap:6 }} onClick={e => e.stopPropagation()}>
                <Button size="sm" variant="secondary" onClick={() => setViewing(r)}>Details</Button>
                {tab === 'pending' && <>
                  <button
                    onClick={() => setApproving(r)}
                    onMouseEnter={e => e.currentTarget.style.background = '#15803d'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--success-solid)'}
                    style={{ height: 30, padding: '0 10px', border: '1px solid var(--success-solid)', borderRadius: 'var(--radius-md)', background: 'var(--success-solid)', color: '#fff', fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >Approve</button>
                  <Button size="sm" variant="danger" onClick={() => { setRejecting(r); setReason(''); setReasonErr(''); }}>
                    Reject
                  </Button>
                </>}
                {tab !== 'pending' && (
                  <span style={{ fontSize:11.5,fontWeight:600,padding:'4px 10px',borderRadius:'var(--radius-pill)',background:tab==='approved'?'var(--success-bg)':'var(--danger-bg)',color:tab==='approved'?'var(--success-text)':'var(--danger-text)' }}>
                    {tab.charAt(0).toUpperCase()+tab.slice(1)}
                  </span>
                )}
              </div>
            )},
          ]}
          rows={base}
          onRowClick={r => setViewing(r)}
          empty={<EmptyState icon={<Icon name={empty.icon} size={30}/>} title={empty.title} message={empty.msg} />}
        />
      </Card>

      <ConfirmDialog open={!!approving} onClose={() => setApproving(null)} onConfirm={doApprove}
        title="Approve Requisition" tone="success" confirmLabel="Approve" loading={busy}
        message={approving ? `Approve '${approving.tool_name}' (×${approving.qty}) requested by ${approving.requester} (${approving.dept})?` : ''} />

      <Modal open={!!rejecting} onClose={() => setRejecting(null)} title="Reject Requisition" width={460}
        footer={<><Button variant="secondary" onClick={() => setRejecting(null)}>Cancel</Button><Button variant="danger" loading={busy} onClick={doReject}>Reject Request</Button></>}>
        {rejecting && <>
          <div style={{ padding:'10px 13px',background:'var(--surface-sunken)',borderRadius:'var(--radius-md)',marginBottom:14 }}>
            <div style={{ fontWeight:600,color:'var(--text-strong)' }}>{rejecting.tool_name}</div>
            <div style={{ fontSize:12,color:'var(--text-muted)',marginTop:2,fontFamily:'monospace' }}>{rejecting.requisition_number} · {rejecting.requester}</div>
          </div>
          <Textarea label="Reason for rejection" required rows={3} value={reason} error={reasonErr}
            onChange={(e) => { setReason(e.target.value); setReasonErr(''); }}
            placeholder="Provide a clear reason so the requester can understand the decision…" data-autofocus />
        </>}
      </Modal>

      {viewing && <ViewDetailsModal req={viewing} effectiveStatus={effectiveStatus(viewing)} onClose={() => setViewing(null)} />}
    </div>
  );
}

Object.assign(window, { ApprovalsScreen });
