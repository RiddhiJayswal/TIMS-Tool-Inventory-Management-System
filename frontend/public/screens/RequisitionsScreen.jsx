const NS_REQ = window.MTRSDesignSystemUltraTechCement_660dc9;

/* ── Re-use helpers from ApprovalsScreen scope ─────────────────────── */
function parseDMYReq(s) {
  if (!s) return null;
  const mon = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
  const p = s.split(' ');
  return p.length === 3 ? new Date(+p[2], mon[p[1]], +p[0]) : null;
}
const TODAY_REQ = new Date();

function getReqPriority(req) {
  const badges = [];
  const from = parseDMYReq(req.from);
  const to = parseDMYReq(req.to);
  const daysUntil = from ? (from - TODAY_REQ) / 86400000 : null;
  if (daysUntil !== null && daysUntil <= 0) badges.push({ k:'urgent', label:'Urgent',        bg:'var(--danger-bg)',  fg:'var(--danger-text)' });
  else if (daysUntil !== null && daysUntil <= 2) badges.push({ k:'soon', label:'Due Soon',   bg:'var(--warning-bg)', fg:'var(--warning-text)' });
  if (req.qty >= 2) badges.push({ k:'hq', label:'High Qty',       bg:'var(--warning-bg)', fg:'var(--warning-text)' });
  if (from && to && (to-from)/86400000 > 5) badges.push({ k:'ld', label:'Long Duration', bg:'var(--info-bg)', fg:'var(--info-text)' });
  return badges;
}

function ReqPriorityBadges({ req }) {
  const bs = getReqPriority(req);
  if (!bs.length) return null;
  return (
    <div style={{ display:'flex',gap:4,marginTop:3,flexWrap:'wrap' }}>
      {bs.map(b => <span key={b.k} style={{ fontSize:10.5,fontWeight:700,padding:'2px 7px',borderRadius:'var(--radius-pill)',background:b.bg,color:b.fg,whiteSpace:'nowrap' }}>{b.label}</span>)}
    </div>
  );
}

/* ── Status timeline ─────────────────────────────────────────────── */
function ReqTimeline({ status }) {
  const rejected = status === 'rejected';
  const cancelled = status === 'cancelled';
  const steps = [
    { key:'pending',  label:'Requested', icon:'clipboard' },
    { key:'approved', label:rejected?'Rejected':cancelled?'Cancelled':'Approved', icon:(rejected||cancelled)?'x':'check_circle' },
    { key:'issued',   label:'Issued',    icon:'arrow_right_circle' },
    { key:'returned', label:'Returned',  icon:'arrow_left_circle' },
  ];
  const order = ['pending','approved','issued','returned'];
  const curIdx = order.indexOf((rejected || cancelled) ? 'approved' : status);
  const st = (i) => i < curIdx ? 'done' : i === curIdx ? ((rejected || cancelled)?'rejected':'active') : 'future';
  return (
    <div style={{ display:'flex',alignItems:'flex-start', marginTop: 4 }}>
      {steps.map((s,i) => {
        const state = st(i);
        const bg = state==='done'?'var(--success-solid)':state==='active'?'var(--brand-black)':state==='rejected'?'var(--danger-solid)':'var(--border-default)';
        return (
          <React.Fragment key={s.key}>
            <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:4,minWidth:64 }}>
              <div style={{ width:28,height:28,borderRadius:'50%',display:'grid',placeItems:'center',background:bg }}>
                <Icon name={s.icon} size={13} color={state==='future'?'var(--text-subtle)':'#fff'} />
              </div>
              <span style={{ fontSize:10,textAlign:'center',color:state==='future'?'var(--text-subtle)':'var(--text-muted)',fontWeight:state!=='future'?600:400,lineHeight:1.3 }}>{s.label}</span>
            </div>
            {i < steps.length-1 && <div style={{ flex:1,height:2,marginTop:13,background:st(i+1)!=='future'?'var(--success-solid)':'var(--border-subtle)' }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ── View Details modal ──────────────────────────────────────────── */
function ViewRequisitionModal({ req, onClose }) {
  const { Modal, Button } = NS_REQ;
  const F = ({ label, value, full }) => (
    <div style={full?{gridColumn:'1/-1'}:{}}>
      <div style={{ fontSize:10.5,color:'var(--text-subtle)',textTransform:'uppercase',letterSpacing:'0.05em',fontWeight:600,marginBottom:2 }}>{label}</div>
      <div style={{ fontSize:13.5,color:'var(--text-default)' }}>{value||'—'}</div>
    </div>
  );
  return (
    <Modal open onClose={onClose} title="Requisition Details" width={500} footer={<Button variant="secondary" onClick={onClose}>Close</Button>}>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:20 }}>
        <F label="Requisition No." value={<span style={{ fontFamily:'monospace' }}>{req.requisition_number}</span>} />
        <F label="Submitted" value={req.submitted} />
        <F label="Tool" value={<strong style={{ color:'var(--text-strong)' }}>{req.tool_name}</strong>} />
        <F label="Quantity" value={`${req.qty} unit${req.qty>1?'s':''}`} />
        <F label="Requester" value={req.requester ? `${req.requester}${req.employee_id ? ` (${req.employee_id})` : ''}` : 'Not assigned'} />
        <F label="Department" value={req.dept || 'Not assigned'} />
        <F label="Period" value={`${req.from} → ${req.to}`} full />
        <F label="Purpose" value={req.purpose || 'No remarks'} full />
        {req.rejection_reason && <F label="Rejection Reason" value={req.rejection_reason} full />}
      </div>
      <div style={{ paddingTop:14,borderTop:'1px solid var(--border-subtle)',marginBottom:14 }}>
        <div style={{ fontSize:11,fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:'var(--text-subtle)',marginBottom:10 }}>Status Timeline</div>
        <ReqTimeline status={req.status} />
      </div>
      {getReqPriority(req).length > 0 && (
        <div style={{ paddingTop:12,borderTop:'1px solid var(--border-subtle)',display:'flex',gap:6,flexWrap:'wrap',alignItems:'center' }}>
          <span style={{ fontSize:10.5,fontWeight:700,color:'var(--text-subtle)',textTransform:'uppercase',letterSpacing:'0.04em' }}>Flags</span>
          {getReqPriority(req).map(b => <span key={b.k} style={{ fontSize:11.5,fontWeight:700,padding:'3px 9px',borderRadius:'var(--radius-pill)',background:b.bg,color:b.fg }}>{b.label}</span>)}
        </div>
      )}
    </Modal>
  );
}

/* ── New Requisition modal ───────────────────────────────────────── */
function NewRequisitionModal({ onClose }) {
  const { Modal, Button, Input, Select, Textarea } = NS_REQ;
  const [step, setStep] = React.useState(1);
  const [tool, setTool] = React.useState(null);
  const [query, setQuery] = React.useState('');
  const [qty, setQty] = React.useState('1');
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');
  const [purpose, setPurpose] = React.useState('');
  const [error, setError] = React.useState('');
  const [availability, setAvailability] = React.useState(null);
  const [checkingAvailability, setCheckingAvailability] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const valueFrom = (e) => e && e.target ? e.target.value : e;
  const opts = (window.MOCK.TOOLS || []).filter(t => `${t.name} ${t.tool_code}`.toLowerCase().includes(query.toLowerCase()));
  const disabled = (t) => t.status !== 'active' || t.available === 0;
  React.useEffect(() => {
    let cancelled = false;
    setAvailability(null);
    if (!tool || !fromDate || !toDate || !Number(qty) || Number(qty) < 1) return;
    setCheckingAvailability(true);
    window.API.checkRequisitionAvailability(tool.id, Number(qty), fromDate, toDate)
      .then(result => { if (!cancelled) setAvailability(result); })
      .catch(e => { if (!cancelled) setAvailability({ request_available: false, message: e.message || 'Could not check availability for this time period.' }); })
      .finally(() => { if (!cancelled) setCheckingAvailability(false); });
    return () => { cancelled = true; };
  }, [tool?.id, qty, fromDate, toDate]);
  const periodBlocked = availability && availability.request_available === false;
  const submitDisabled = saving || checkingAvailability || periodBlocked || !tool || !Number(qty) || Number(qty) < 1 || Number(qty) > Number(tool.available || 0) || !fromDate || !toDate || !purpose.trim();
  const submit = async () => {
    if (submitDisabled) return;
    setSaving(true);
    setError('');
    try {
      await window.API.createRequisition(tool.id, Number(qty), purpose.trim(), fromDate, toDate);
      await Promise.all([window.API.loadRequisitions(), window.API.loadDashboard()]);
      onClose(true);
    } catch (e) {
      setError(e.message || 'Could not submit request');
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="New Requisition" width={520}
      footer={step === 1
        ? <><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={!tool} onClick={() => setStep(2)}>Continue</Button></>
        : <><Button variant="secondary" onClick={() => setStep(1)}>Back</Button><Button loading={saving} disabled={submitDisabled} onClick={submit}>Submit Request</Button></>}>
      <div style={{ display:'flex',gap:8,marginBottom:18 }}>
        {[1,2].map(n => (
          <div key={n} style={{ flex:1,display:'flex',alignItems:'center',gap:8 }}>
            <span style={{ display:'grid',placeItems:'center',width:22,height:22,borderRadius:'50%',fontSize:12,fontWeight:700,background:step>=n?'var(--brand-black)':'var(--surface-sunken)',color:step>=n?'#fff':'var(--text-subtle)' }}>{n}</span>
            <span style={{ fontSize:12.5,fontWeight:600,color:step>=n?'var(--text-strong)':'var(--text-subtle)' }}>{n===1?'Select Tool':'Request Details'}</span>
          </div>
        ))}
      </div>
      {step === 1 ? (
        <div>
          <Input icon={<Icon name="search" size={14}/>} placeholder="Search tool by name or code…" value={query} onChange={e => setQuery(valueFrom(e))} data-autofocus />
          <div style={{ marginTop:12,maxHeight:280,overflowY:'auto',border:'1px solid var(--border-subtle)',borderRadius:'var(--radius-md)' }}>
            {opts.map(t => {
              const off = disabled(t);
              const sel = tool && tool.id === t.id;
              return (
                <button key={t.id} disabled={off} onClick={() => setTool(t)} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',width:'100%',textAlign:'left',padding:'10px 13px',border:'none',borderBottom:'1px solid var(--border-subtle)',cursor:off?'not-allowed':'pointer',background:sel?'var(--info-bg)':'transparent',opacity:off?0.5:1 }}>
                  <div>
                    <div style={{ fontSize:13.5,fontWeight:600,color:'var(--text-strong)' }}>{t.name}</div>
                    <div style={{ fontFamily:'monospace',fontSize:11.5,color:'var(--text-muted)',marginTop:1 }}>{t.tool_code} · {t.available}/{t.total} available</div>
                  </div>
                  {off && <span style={{ fontSize:11,fontWeight:600,color:'var(--danger-text)',textTransform:'capitalize' }}>{t.status==='active'?'Out of stock':t.status.replace('_',' ')}</span>}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
          <div style={{ padding:'11px 14px',background:'var(--surface-sunken)',borderRadius:'var(--radius-md)' }}>
            <div style={{ fontSize:13.5,fontWeight:600,color:'var(--text-strong)' }}>{tool.name}</div>
            <div style={{ fontFamily:'monospace',fontSize:11.5,color:'var(--text-muted)',marginTop:2 }}>{tool.tool_code}</div>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
            <Input label="Quantity" required type="number" value={qty} min="1" max={tool.available} helper={`Max ${tool.available} available`} onChange={e => setQty(valueFrom(e))} />
            <div />
            <Input label="Required From" required type="date" value={fromDate} onChange={e => setFromDate(valueFrom(e))} />
            <Input label="Required To" required type="date" value={toDate} onChange={e => setToDate(valueFrom(e))} />
          </div>
          <Textarea label="Purpose of job" required rows={3} value={purpose} onChange={e => setPurpose(valueFrom(e))} placeholder="Describe the maintenance task this tool is for…" />
          {checkingAvailability && <div style={{ padding:'9px 11px',borderRadius:'var(--radius-md)',background:'var(--surface-sunken)',color:'var(--text-muted)',fontSize:12.5,fontWeight:600 }}>Checking availability for this time period...</div>}
          {periodBlocked && <div style={{ padding:'9px 11px',borderRadius:'var(--radius-md)',background:'var(--danger-bg)',color:'var(--danger-text)',fontSize:12.5,fontWeight:600 }}>{availability.message || 'Tool is not available for the selected time period. Please choose a different time period.'}</div>}
          {availability && availability.request_available && !checkingAvailability && <div style={{ padding:'9px 11px',borderRadius:'var(--radius-md)',background:'var(--success-bg)',color:'var(--success-text)',fontSize:12.5,fontWeight:600 }}>Available for the selected time period.</div>}
          {error && <div style={{ padding:'9px 11px',borderRadius:'var(--radius-md)',background:'var(--danger-bg)',color:'var(--danger-text)',fontSize:12.5,fontWeight:600 }}>{error}</div>}
        </div>
      )}
    </Modal>
  );
}

function ReturnRequestModal({ req, issuance, onClose, onReturned }) {
  const { Modal, Button, Input, Select, Textarea } = NS_REQ;
  const [condition, setCondition] = React.useState('good');
  const [qty, setQty] = React.useState(issuance.quantity_issued || issuance.qty || req.qty || 1);
  const [notes, setNotes] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const warn = condition === 'damaged' || condition === 'missing';

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      const returnedQty = condition === 'missing' ? 0 : Number(qty || 0);
      const issuedQty = Number(issuance.quantity_issued || issuance.qty || req.qty || 1);
      if (returnedQty < 0 || returnedQty > issuedQty) throw new Error('Returned quantity must be between 0 and issued quantity');
      if (condition === 'damaged' && returnedQty !== issuedQty) throw new Error(`A damaged return must account for all ${issuedQty} issued unit(s)`);
      if (warn && !notes.trim()) throw new Error('Notes are required for damaged or missing returns');
      await window.API.processReturn(issuance.id, {
        quantity_returned: returnedQty,
        return_condition: condition,
        notes: notes.trim() || null,
      });
      await Promise.all([window.API.loadDashboard(), window.API.loadRequisitions(), window.API.loadIssuances(), window.API.loadReports().catch(() => [])]);
      onReturned();
      onClose();
    } catch (e) {
      setError(e.message || 'Tool return failed');
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Return Tool" width={480}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant={warn ? 'danger' : 'primary'} loading={saving} onClick={submit}>Confirm Return</Button></>}>
      <div style={{ padding:'11px 14px', background:'var(--surface-sunken)', borderRadius:'var(--radius-md)', marginBottom:16 }}>
        <div style={{ fontSize:13.5, fontWeight:600, color:'var(--text-strong)' }}>{req.tool_name}</div>
        <div style={{ fontSize:11.5, color:'var(--text-muted)', marginTop:2, fontFamily:'monospace' }}>{req.requisition_number}</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <Input label="Quantity returned" required type="number" value={condition === 'missing' ? 0 : qty} min="0" max={issuance.quantity_issued || issuance.qty || req.qty || 1} onChange={e => setQty(e.target.value)} disabled={condition === 'missing'} />
        <Select label="Condition" required value={condition} onChange={e => setCondition(e.target.value)}>
          <option value="good">Good</option>
          <option value="partial">Partial</option>
          <option value="damaged">Damaged</option>
          <option value="missing">Missing</option>
        </Select>
      </div>
      <div style={{ marginTop:14 }}><Textarea label="Notes" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any observations on the returned tool..." /></div>
      {warn && (
        <div style={{ display:'flex', gap:9, marginTop:14, padding:'11px 13px', background:'var(--danger-bg)', border:'1px solid var(--danger-border)', borderRadius:'var(--radius-md)' }}>
          <Icon name="alert_triangle" size={16} color="var(--danger-solid)" style={{ flexShrink:0, marginTop:1 }} />
          <span style={{ fontSize:12.5, color:'var(--danger-text)', lineHeight:1.45 }}>Damaged or missing returns are sent to maintenance for assessment before stock is made available.</span>
        </div>
      )}
      {error && <div style={{ marginTop:12, color:'var(--danger-text)', fontSize:12.5 }}>{error}</div>}
    </Modal>
  );
}

/* ── Main screen ─────────────────────────────────────────────────── */
function RequisitionsScreen() {
  const { PageHeader, Card, DataTable, StatusBadge, Button, EmptyState } = NS_REQ;
  const [tab, setTab] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [showNew, setShowNew] = React.useState(false);
  const [view, setView] = React.useState(null);
  const [returningReq, setReturningReq] = React.useState(null);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [busyId, setBusyId] = React.useState(null);
  const [message, setMessage] = React.useState(null);

  const all = window.MOCK.MY_REQUESTS || [];
  const q = search.trim().toLowerCase();
  const rows = (tab === 'all' ? all : all.filter(r => r.status === tab)).filter(r => {
    if (!q) return true;
    return `${r.requisition_number || ''} ${r.tool_name || ''} ${r.requester || ''} ${r.employee_id || ''} ${r.dept || ''} ${r.status || ''} ${r.purpose || ''}`.toLowerCase().includes(q);
  });
  const count = (s) => all.filter(r => r.status === s).length;

  const EMPTY = {
    pending:  'Your pending requests awaiting approval will appear here.',
    approved: 'Approved requests ready for issuance will appear here.',
    issued:   'Tools currently issued to you will appear here.',
    returned: 'Completed returns will appear here.',
    rejected: 'Rejected requests will appear here.',
    cancelled: 'Cancelled requests will appear here.',
    all:      'You have no requisitions yet.',
  };

  const tabStyle = (val) => ({
    display:'inline-flex',alignItems:'center',gap:6,padding:'7px 12px',border:'none',borderRadius:'var(--radius-md)',cursor:'pointer',
    fontFamily:'var(--font-sans)',fontSize:13,fontWeight:tab===val?700:400,whiteSpace:'nowrap',
    color:tab===val?'var(--text-strong)':'var(--text-muted)',background:tab===val?'var(--surface-card)':'transparent',
    boxShadow:tab===val?'var(--shadow-resting)':'none',transition:'all 0.15s',
  });
  const pill = (n, tone) => n > 0 ? <span style={{ fontSize:10.5,fontWeight:700,padding:'1px 6px',borderRadius:'var(--radius-pill)',background:tone==='danger'?'var(--danger-solid)':tab===tone?'var(--surface-page)':'var(--surface-sunken)',color:tone==='danger'?'#fff':'var(--text-muted)' }}>{n}</span> : null;
  const findActiveIssue = (req) => {
    const byReq = [...(window.MOCK.MY_ISSUANCES || []), ...(window.MOCK.ACTIVE_ISSUANCES || [])]
      .find(i => i.requisition_id === req.id);
    if (byReq) return byReq;
    return [...(window.MOCK.MY_ISSUANCES || []), ...(window.MOCK.ACTIVE_ISSUANCES || [])]
      .find(i => i.tool_id === req.tool_id && Number(i.quantity_issued || i.qty || 0) >= Number(req.qty || 0));
  };
  const returnRequestTool = async (req) => {
    const issuance = findActiveIssue(req);
    if (!issuance) {
      setMessage({ tone: 'danger', text: 'No active issue record found for this request.' });
      return;
    }
    setReturningReq({ req, issuance });
  };
  const cancelRequest = async (req) => {
    if (req.status !== 'pending' || busyId) return;
    setBusyId(req.id);
    try {
      await window.API.cancelRequisition(req.id);
      await Promise.all([window.API.loadRequisitions(), window.API.loadDashboard()]);
      setTab('cancelled');
      setMessage({ tone: 'success', text: 'Request cancelled successfully.' });
      setRefreshKey(k => k + 1);
    } catch (e) {
      setMessage({ tone: 'danger', text: e.message || 'Request cancellation failed' });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
      <PageHeader title="My Requests" subtitle="Your tool requisitions and their approval status"
        actions={<Button icon={<Icon name="plus" size={16}/>} onClick={() => setShowNew(true)}>New Requisition</Button>} />

      {message && (
        <div style={{ padding:'9px 12px', borderRadius:'var(--radius-md)', background:message.tone === 'danger' ? 'var(--danger-bg)' : 'var(--success-bg)', color:message.tone === 'danger' ? 'var(--danger-text)' : 'var(--success-text)', fontSize:12.5, fontWeight:600 }}>
          {message.text}
        </div>
      )}

      <div style={{ position:'relative', maxWidth:360 }}>
        <Icon name="search" size={14} color="var(--text-subtle)" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search request, tool, status..."
          style={{ width:'100%', height:36, padding:'0 12px 0 32px', border:'1px solid var(--border-default)', borderRadius:'var(--radius-md)', fontFamily:'var(--font-sans)', fontSize:13.5, color:'var(--text-default)', background:'var(--surface-card)', outline:'none', boxSizing:'border-box' }} />
      </div>

      {/* Polished tab bar */}
      <div className="tims-mobile-stack-tabs" style={{ display:'flex',gap:2,background:'var(--surface-sunken)',borderRadius:'var(--radius-md)',padding:3,overflowX:'auto' }}>
        {[
          { val:'all',      label:'All',      n: null },
          { val:'pending',  label:'Pending',  n: count('pending') },
          { val:'approved', label:'Approved', n: count('approved') },
          { val:'issued',   label:'Issued',   n: count('issued') },
          { val:'returned', label:'Returned', n: count('returned') },
          { val:'rejected', label:'Rejected', n: count('rejected'), tone:'danger' },
          { val:'cancelled', label:'Cancelled', n: count('cancelled') },
        ].map(t => (
          <button key={t.val} onClick={() => setTab(t.val)} style={tabStyle(t.val)}>
            {t.label} {t.n ? pill(t.n, t.tone) : null}
          </button>
        ))}
      </div>

      <Card padded={false}>
        <DataTable
          columns={[
            { key:'requisition_number', header:'Request', nowrap:true, render:(r) => (
              <div>
                <div style={{ fontFamily:'monospace',fontSize:12,color:'var(--text-muted)',marginBottom:2 }}>{r.requisition_number}</div>
                <div style={{ fontWeight:700,color:'var(--text-strong)',fontSize:13.5 }}>{r.tool_name}</div>
                <ReqPriorityBadges req={r} />
              </div>
            )},
            { key:'qty', header:'Qty', align:'right', render:(r) => <span style={{ fontWeight:700,fontSize:15 }}>{r.qty}</span> },
            { key:'period', header:'Period', nowrap:true, render:(r) => (
              <div style={{ fontSize:12.5,color:'var(--text-muted)',lineHeight:1.5 }}>
                <div>{r.from}</div>
                <div style={{ color:'var(--text-subtle)' }}>→ {r.to}</div>
              </div>
            )},
            { key:'submitted', header:'Submitted', nowrap:true, render:(r) => <span style={{ color:'var(--text-muted)',fontSize:12.5 }}>{r.submitted}</span> },
            { key:'status', header:'Status', render:(r) => <StatusBadge status={r.status} size="sm" /> },
            { key:'actions', header:'', render:(r) => (
              <div style={{ display:'flex',gap:6 }} onClick={e => e.stopPropagation()}>
                <Button size="sm" variant="secondary" onClick={() => setView(r)}>Details</Button>
                {r.status === 'pending' && <Button size="sm" variant="secondary" disabled={busyId === r.id} onClick={() => cancelRequest(r)}>{busyId === r.id ? 'Cancelling...' : 'Cancel'}</Button>}
                {r.status === 'issued' && findActiveIssue(r) && <Button size="sm" onClick={() => returnRequestTool(r)}>Return Tool</Button>}
              </div>
            )},
          ]}
          rows={rows}
          onRowClick={r => setView(r)}
          empty={<EmptyState icon={<Icon name="clipboard" size={30}/>} title={`No ${tab === 'all' ? '' : tab} requests`} message={EMPTY[tab] || EMPTY.all}
            action={<Button size="sm" icon={<Icon name="plus" size={14}/>} onClick={() => setShowNew(true)}>New Requisition</Button>} />}
        />
      </Card>

      {showNew && <NewRequisitionModal onClose={(created) => {
        setShowNew(false);
        if (created) {
          setTab('pending');
          setSearch('');
          setRefreshKey(k => k + 1);
        }
      }} />}
      {view && <ViewRequisitionModal req={view} onClose={() => setView(null)} />}
      {returningReq && <ReturnRequestModal req={returningReq.req} issuance={returningReq.issuance} onClose={() => setReturningReq(null)} onReturned={() => {
        setTab('returned');
        setMessage({ tone: 'success', text: 'Tool returned successfully.' });
        setRefreshKey(k => k + 1);
      }} />}
    </div>
  );
}

Object.assign(window, { RequisitionsScreen });
