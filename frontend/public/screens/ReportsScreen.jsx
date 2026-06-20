const NS_REP = window.MTRSDesignSystemUltraTechCement_660dc9;

const LAST_UPDATED = '14 Jun 2026, 09:41 AM';

const SEARCH_HINTS = {
  stock:        'Tool code, name, type or status…',
  issuance:     'Tool name, code, borrower or dept…',
  overdue:      'Tool name or borrower name…',
  calibration:  'Tool code, name, partner or frequency...',
  damage:       'Tool name, code or returned by…',
  utilization:  'Tool code, name or type…',
  depreciation: 'Tool code or name…',
};

const REPORT_TABS = [
  { value: 'stock',       label: 'Stock Status',      desc: 'Current inventory levels, availability and asset values for all tools.' },
  { value: 'issuance',    label: 'Issuance History',  desc: 'Complete tool issuance history, including active and returned records.' },
  { value: 'overdue',     label: 'Overdue',           desc: 'Tools that have passed their expected return date and require follow-up.' },
  { value: 'calibration', label: 'Calibration',       desc: 'Tools with scheduled, due, or overdue calibration requirements.' },
  { value: 'damage',      label: 'Damage & Penalty',  desc: 'Completed damage assessments and penalties recorded against borrowers.' },
  { value: 'utilization', label: 'Utilization',       desc: 'Request and issuance activity summarized by department.' },
  { value: 'depreciation',label: 'Depreciation',      desc: 'Asset value depreciation by tool over time.' },
];

/* ── Row-level highlight colours by status ─────────────────────────── */
const ROW_TONE = {
  active:          null,
  damaged:         'rgba(239,68,68,0.06)',
  calibration_due: 'rgba(245,158,11,0.07)',
  overdue:         'rgba(239,68,68,0.06)',
  due_today:       'rgba(245,158,11,0.07)',
  missing:         'rgba(239,68,68,0.08)',
};

/* ── Status pill ───────────────────────────────────────────────────── */
function StatusPill({ status }) {
  const cfg = {
    active:          { bg: 'var(--success-bg)',  fg: 'var(--success-text)', label: 'Active' },
    damaged:         { bg: 'var(--danger-bg)',   fg: 'var(--danger-text)',  label: 'Damaged' },
    calibration_due: { bg: 'var(--warning-bg)',  fg: 'var(--warning-text)', label: 'Cal. Due' },
    overdue:         { bg: 'var(--danger-bg)',   fg: 'var(--danger-text)',  label: 'Overdue' },
    due_today:       { bg: 'var(--warning-bg)',  fg: 'var(--warning-text)', label: 'Due Today' },
    on_time:         { bg: 'var(--success-bg)',  fg: 'var(--success-text)', label: 'On Time' },
    returned:        { bg: 'var(--info-bg)',     fg: 'var(--info-text)',    label: 'Returned' },
    missing:         { bg: 'var(--danger-bg)',   fg: 'var(--danger-text)',  label: 'Missing' },
  }[status] || { bg: 'var(--surface-sunken)', fg: 'var(--text-muted)', label: status };
  return <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 'var(--radius-pill)', background: cfg.bg, color: cfg.fg, whiteSpace: 'nowrap' }}>{cfg.label}</span>;
}

function MoneyCell({ value }) {
  if (value === null || value === undefined || value === '') {
    return <span style={{ color: 'var(--text-subtle)' }}>Not set</span>;
  }
  return <span style={{ fontFamily: 'monospace' }}>{window.inr(value)}</span>;
}

function reportDate(value) {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function reportIssuanceState(row) {
  if (row.actual_return_date) return { state: 'returned', days_left: null };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(row.expected_return_date);
  due.setHours(0, 0, 0, 0);
  const daysLeft = Math.round((due - today) / 86400000);
  return {
    state: daysLeft < 0 ? 'overdue' : daysLeft === 0 ? 'due_today' : 'on_time',
    days_left: daysLeft,
  };
}

/* ── Sort icon ─────────────────────────────────────────────────────── */
function SortIcon({ col, sortCol, sortDir }) {
  const active = col === sortCol;
  return (
    <span style={{ marginLeft: 4, opacity: active ? 1 : 0.3, fontSize: 10 }}>
      {active && sortDir === 'desc' ? '▲' : '▼'}
    </span>
  );
}

/* ── Reusable report table ─────────────────────────────────────────── */
function ReportTable({ columns, rows, sortableKeys = [] }) {
  const [sortCol, setSortCol] = React.useState(null);
  const [sortDir, setSortDir] = React.useState('asc');
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const inr = window.inr;

  const toggleSort = (key) => {
    if (!sortableKeys.includes(key)) return;
    if (sortCol === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(key); setSortDir('asc'); setPage(1); }
  };

  const sorted = React.useMemo(() => {
    if (!sortCol) return rows;
    return [...rows].sort((a, b) => {
      const va = a[sortCol], vb = b[sortCol];
      if (typeof va === 'number') return sortDir === 'asc' ? va - vb : vb - va;
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }, [rows, sortCol, sortDir]);

  const total = sorted.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const pg = Math.min(page, pages);
  const pageRows = sorted.slice((pg - 1) * perPage, pg * perPage);

  if (rows.length === 0) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-subtle)', fontSize: 13.5 }}>
        <Icon name="bar_chart" size={28} color="var(--text-subtle)" style={{ marginBottom: 10, display: 'block', margin: '0 auto 10px' }} />
        No data for this report.
      </div>
    );
  }

  return (
    <div className="tims-report-table">
      <div className="tims-report-scroll" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: 'var(--surface-sunken)', borderBottom: '1px solid var(--border-default)' }}>
              {columns.map(col => (
                <th key={col.key}
                  onClick={() => toggleSort(col.key)}
                  style={{ padding: '10px 14px', textAlign: col.align === 'right' ? 'right' : 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap', cursor: sortableKeys.includes(col.key) ? 'pointer' : 'default', userSelect: 'none' }}
                  onMouseEnter={e => { if (sortableKeys.includes(col.key)) e.currentTarget.style.color = 'var(--text-default)'; }}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  {col.header}
                  {sortableKeys.includes(col.key) && <SortIcon col={col.key} sortCol={sortCol} sortDir={sortDir} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => {
              const tone = ROW_TONE[row.status] || ROW_TONE[row.state] || null;
              return (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)', background: tone || 'transparent', transition: 'filter 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.97)'}
                  onMouseLeave={e => e.currentTarget.style.filter = 'none'}>
                  {columns.map(col => (
                    <td key={col.key} data-label={col.header} style={{ padding: '11px 14px', textAlign: col.align === 'right' ? 'right' : 'left', verticalAlign: 'middle' }}>
                      {col.render ? col.render(row, inr) : row[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 5 && (
        <div className="tims-report-pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Rows per page</span>
            <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
              style={{ height: 30, padding: '0 8px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-default)', background: 'var(--surface-card)', cursor: 'pointer', outline: 'none' }}>
              {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
            {(pg - 1) * perPage + 1}–{Math.min(pg * perPage, total)} of {total}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[{ label: '←', go: pg - 1 }, { label: '→', go: pg + 1 }].map(btn => (
              <button key={btn.label} disabled={btn.go < 1 || btn.go > pages} onClick={() => setPage(btn.go)}
                style={{ width: 30, height: 30, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-card)', cursor: btn.go >= 1 && btn.go <= pages ? 'pointer' : 'not-allowed', color: btn.go >= 1 && btn.go <= pages ? 'var(--text-default)' : 'var(--text-subtle)', fontFamily: 'var(--font-sans)', fontSize: 14 }}>
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Report definitions per tab ────────────────────────────────────── */
function getReportConfig(tab, search) {
  const q = search.toLowerCase();
  const inr = window.inr;

  const stockRows = (window.MOCK.REPORT_STOCK || []).filter(r =>
    !q || `${r.code || ''} ${r.name || ''} ${r.type || ''} ${r.status || ''}`.toLowerCase().includes(q));
  const issuanceRows = (window.MOCK.REPORT_ISSUANCE || []).map(r => ({
    ...r,
    issued_to: r.borrower_name || '-',
    dept: r.borrower_dept || '-',
    issued_on: reportDate(r.issued_at),
    due: reportDate(r.expected_return_date),
    returned_on: reportDate(r.actual_return_date),
    ...reportIssuanceState(r),
  })).filter(r =>
    !q || `${r.tool_name || ''} ${r.tool_code || ''} ${r.issued_to || ''} ${r.dept || ''}`.toLowerCase().includes(q));
  const overdueRows = (window.MOCK.REPORT_OVERDUE || []).map(r => ({
    ...r,
    issued_to: r.borrower_name || '-',
    dept: r.borrower_dept || '-',
    due: reportDate(r.expected_return_date),
    state: 'overdue',
    days_left: -Number(r.days_overdue || 0),
  })).filter(r =>
    !q || `${r.tool_name || ''} ${r.issued_to || ''} ${r.dept || ''}`.toLowerCase().includes(q));
  const calRows = (window.MOCK.CALIBRATION || []).filter(r =>
    !q || `${r.tool_name || ''} ${r.tool_code || ''} ${r.service_partner || ''} ${r.freq || ''} ${r.next || ''}`.toLowerCase().includes(q));
  const dmgRows = (window.MOCK.REPORT_DAMAGE || []).map(r => ({
    ...r,
    returned_by: r.borrower_name || '-',
    dept: r.borrower_dept || '-',
    returned_on: reportDate(r.actual_return_date),
  })).filter(r =>
    !q || `${r.tool_name || ''} ${r.returned_by || ''} ${r.dept || ''} ${r.damage_type || ''}`.toLowerCase().includes(q));
  const utilRows = (window.MOCK.REPORT_UTILIZATION || []).filter(r =>
    !q || `${r.department || ''} ${r.most_borrowed_tool || ''}`.toLowerCase().includes(q));
  const depreciationRows = (window.MOCK.REPORT_DEPRECIATION || []).filter(r =>
    !q || `${r.tool_code || ''} ${r.name || ''} ${r.status || ''}`.toLowerCase().includes(q));

  const configs = {
    stock: {
      rows: stockRows,
      sortable: ['avail', 'total', 'value', 'status'],
      columns: [
        { key: 'code', header: 'Tool Code', render: (r) => <span style={{ fontFamily: 'monospace', fontSize: 12.5, color: 'var(--text-muted)' }}>{r.code}</span> },
        { key: 'name', header: 'Name', render: (r) => <span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{r.name}</span> },
        { key: 'type', header: 'Type', render: (r) => <span style={{ color: 'var(--text-muted)' }}>{r.type}</span> },
        { key: 'avail', header: 'Available', align: 'right', render: (r) => <span style={{ fontWeight: 600 }}>{r.avail}</span> },
        { key: 'total', header: 'Total', align: 'right' },
        { key: 'value', header: 'Current Value', align: 'right', render: (r) => <MoneyCell value={r.value} /> },
        { key: 'total_value', header: 'Total Value', align: 'right', render: (r) => <MoneyCell value={r.total_value} /> },
        { key: 'issued_value', header: 'Issued Value', align: 'right', render: (r) => <MoneyCell value={r.issued_value} /> },
        { key: 'storage_bin', header: 'Location', render: (r) => <span style={{ color: 'var(--text-muted)' }}>{r.location || 'Not assigned'}</span> },
        { key: 'status', header: 'Status', render: (r) => <StatusPill status={r.status} /> },
      ],
    },
    issuance: {
      rows: issuanceRows,
      sortable: ['days_left', 'issued_on', 'due'],
      columns: [
        { key: 'tool_name', header: 'Tool', render: (r) => <span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{r.tool_name}</span> },
        { key: 'tool_code', header: 'Code', render: (r) => <span style={{ fontFamily: 'monospace', fontSize: 12.5, color: 'var(--text-muted)' }}>{r.tool_code}</span> },
        { key: 'issued_to', header: 'Issued To', render: (r) => <div><div style={{ fontWeight: 500 }}>{r.issued_to}</div><div style={{ fontSize: 11.5, color: 'var(--text-subtle)' }}>{r.dept}</div></div> },
        { key: 'quantity_issued', header: 'Qty', align: 'right' },
        { key: 'issued_on', header: 'Issued On', render: (r) => <span style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{r.issued_on}</span> },
        { key: 'due', header: 'Due', render: (r) => <span style={{ color: r.state === 'overdue' ? 'var(--danger-text)' : 'var(--text-muted)', fontWeight: r.state === 'overdue' ? 600 : 400 }}>{r.due}</span> },
        { key: 'returned_on', header: 'Returned', render: (r) => <span style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{r.returned_on}</span> },
        { key: 'state', header: 'Status', render: (r) => <StatusPill status={r.state} /> },
        { key: 'days_left', header: 'Days Left', align: 'right', render: (r) => <span style={{ fontWeight: 600, color: r.state === 'overdue' ? 'var(--danger-text)' : r.state === 'due_today' ? 'var(--warning-text)' : 'var(--success-text)' }}>{r.days_left == null ? '-' : r.state === 'overdue' ? `−${Math.abs(r.days_left)}` : r.days_left}</span> },
      ],
    },
    overdue: {
      rows: overdueRows,
      sortable: ['days_left'],
      columns: [
        { key: 'tool_name', header: 'Tool', render: (r) => <span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{r.tool_name}</span> },
        { key: 'issued_to', header: 'Issued To', render: (r) => <div><div style={{ fontWeight: 500 }}>{r.issued_to}</div><div style={{ fontSize: 11.5, color: 'var(--text-subtle)' }}>{r.dept}</div></div> },
        { key: 'due', header: 'Due Date', render: (r) => <span style={{ color: 'var(--danger-text)', fontWeight: 600 }}>{r.due}</span> },
        { key: 'days_left', header: 'Days Overdue', align: 'right', render: (r) => <span style={{ fontWeight: 700, color: 'var(--danger-text)' }}>{Math.abs(r.days_left)}d</span> },
        { key: 'state', header: 'Status', render: (r) => <StatusPill status={r.state} /> },
      ],
    },
    calibration: {
      rows: calRows,
      sortable: ['days', 'next'],
      columns: [
        { key: 'tool_code', header: 'Code', render: (r) => <span style={{ fontFamily: 'monospace', fontSize: 12.5, color: 'var(--text-muted)' }}>{r.tool_code}</span> },
        { key: 'tool_name', header: 'Tool', render: (r) => <span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{r.tool_name}</span> },
        { key: 'service_partner', header: 'Service Partner', render: (r) => <span style={{ color: 'var(--text-muted)' }}>{r.service_partner || 'Not set'}</span> },
        { key: 'last', header: 'Last Calibrated', render: (r) => <span style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{r.last}</span> },
        { key: 'next', header: 'Next Due', render: (r) => <span style={{ color: r.state === 'overdue' ? 'var(--danger-text)' : 'var(--text-default)', fontWeight: 500 }}>{r.next}</span> },
        { key: 'days', header: 'Days', align: 'right', render: (r) => <span style={{ fontWeight: 600, color: r.state === 'overdue' ? 'var(--danger-text)' : r.state === 'due_today' ? 'var(--warning-text)' : 'var(--success-text)' }}>{r.days}</span> },
        { key: 'state', header: 'Status', render: (r) => <StatusPill status={r.state} /> },
      ],
    },
    damage: {
      rows: dmgRows,
      sortable: ['penalty_amount', 'returned_on'],
      columns: [
        { key: 'tool_name', header: 'Tool', render: (r) => <span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{r.tool_name}</span> },
        { key: 'returned_by', header: 'Returned By', render: (r) => <div><div style={{ fontWeight: 500 }}>{r.returned_by}</div><div style={{ fontSize: 11.5, color: 'var(--text-subtle)' }}>{r.dept}</div></div> },
        { key: 'returned_on', header: 'Date', render: (r) => <span style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{r.returned_on}</span> },
        { key: 'return_condition', header: 'Condition', render: (r) => <StatusPill status={r.return_condition} /> },
        { key: 'damage_type', header: 'Assessment', render: (r) => <span style={{ textTransform: 'capitalize' }}>{String(r.damage_type || '-').replaceAll('_', ' ')}</span> },
        { key: 'penalty_amount', header: 'Penalty', align: 'right', render: (r) => <MoneyCell value={r.penalty_amount} /> },
      ],
    },
    utilization: {
      rows: utilRows,
      sortable: ['total_requests', 'total_issued', 'active_issuances', 'overdue_count'],
      columns: [
        { key: 'department', header: 'Department', render: (r) => <span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{r.department}</span> },
        { key: 'total_requests', header: 'Requests', align: 'right' },
        { key: 'approved_requests', header: 'Approved', align: 'right' },
        { key: 'total_issued', header: 'Issued', align: 'right' },
        { key: 'active_issuances', header: 'Active', align: 'right' },
        { key: 'overdue_count', header: 'Overdue', align: 'right', render: (r) => <span style={{ color: r.overdue_count ? 'var(--danger-text)' : 'var(--text-default)', fontWeight: 600 }}>{r.overdue_count}</span> },
        { key: 'most_borrowed_tool', header: 'Most Borrowed Tool', render: (r) => <span style={{ color: 'var(--text-muted)' }}>{r.most_borrowed_tool || '-'}</span> },
      ],
    },
    depreciation: {
      rows: depreciationRows,
      sortable: ['purchase_price', 'current_value', 'depreciation_to_date', 'depreciation_pct'],
      columns: [
        { key: 'tool_code', header: 'Code', render: (r) => <span style={{ fontFamily: 'monospace', fontSize: 12.5, color: 'var(--text-muted)' }}>{r.tool_code}</span> },
        { key: 'name', header: 'Tool', render: (r) => <span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{r.name}</span> },
        { key: 'purchase_date', header: 'Purchased', render: (r) => <span style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{reportDate(r.purchase_date)}</span> },
        { key: 'purchase_price', header: 'Purchase Value', align: 'right', render: (r) => <MoneyCell value={r.purchase_price} /> },
        { key: 'current_value', header: 'Current Value', align: 'right', render: (r) => <MoneyCell value={r.current_value} /> },
        { key: 'depreciation_to_date', header: 'Depreciated', align: 'right', render: (r) => <MoneyCell value={r.depreciation_to_date} /> },
        { key: 'depreciation_pct', header: 'Depreciation %', align: 'right', render: (r) => <span style={{ fontFamily: 'monospace' }}>{r.depreciation_pct == null ? '-' : `${r.depreciation_pct}%`}</span> },
        { key: 'status', header: 'Status', render: (r) => <StatusPill status={r.status} /> },
      ],
    },
  };
  return configs[tab] || configs.stock;
}

/* ── Main screen ───────────────────────────────────────────────────── */
function ReportsScreen() {
  const { PageHeader, Button, EmptyState, Input } = NS_REP;
  const [tab, setTab] = React.useState('stock');
  const [search, setSearch] = React.useState('');

  const tabInfo = REPORT_TABS.find(t => t.value === tab);
  const config = getReportConfig(tab, search);

  const handlePrint = () => {
    let s = document.getElementById('tims-print-style');
    if (!s) { s = document.createElement('style'); s.id = 'tims-print-style'; document.head.appendChild(s); }
    s.textContent = `@media print {
      #app > div > aside, #app > div > div > header { display:none!important; }
      #app, #app > div, #app > div > div { display:block!important; height:auto!important; overflow:visible!important; }
      #app > div > div > main { overflow:visible!important; padding:8px!important; }
      body { background:white!important; }
    }`;
    setTimeout(() => { window.print(); setTimeout(() => { s.textContent = ''; }, 300); }, 80);
  };

  const handleExportCSV = () => {
    const cfg = getReportConfig(tab, search);
    const headers = cfg.columns.map(c => c.header);
    const rowsData = cfg.rows.map(row => cfg.columns.map(col => {
      let v = String(row[col.key] ?? '').replace(/"/g, '""');
      return (v.includes(',') || v.includes('"') || v.includes('\n')) ? `"${v}"` : v;
    }));
    const csv = [headers.join(','), ...rowsData.map(r => r.join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `TIMS-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadBackendFile = async (url, fallbackName) => {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('tims_token') || ''}` } });
    if (!res.ok) return;
    const blob = await res.blob();
    const disposition = res.headers.get('Content-Disposition') || '';
    const nameMatch = disposition.match(/filename="?([^"]+)"?/);
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = nameMatch ? nameMatch[1] : fallbackName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  };

  return (
    <div className="tims-reports" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader title="Reports" subtitle="Operational and financial exports for the maintenance department"
        actions={
          <div className="tims-report-actions" style={{ display: 'flex', gap: 8 }}>
            <button onClick={handlePrint} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 13px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-sans)', cursor: 'pointer', fontWeight: 500 }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-sunken)'; e.currentTarget.style.color = 'var(--text-default)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-card)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
              <Icon name="download" size={14} /> Print / PDF
            </button>
            <button onClick={handleExportCSV} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', background: 'var(--brand-black)', color: '#fff', fontSize: 13, fontFamily: 'var(--font-sans)', cursor: 'pointer', fontWeight: 600 }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              <Icon name="download" size={14} color="#fff" /> Export CSV
            </button>
            <button onClick={() => downloadBackendFile('/api/reports/activity-logs?format=csv', `tims_activity_backup_${new Date().toISOString().slice(0,10)}.csv`)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 13px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-sans)', cursor: 'pointer', fontWeight: 500 }}>
              <Icon name="download" size={14} /> Activity Backup
            </button>
            <button onClick={() => downloadBackendFile('/api/reports/activity-logs/daily', `TIMS-activity-${new Date().toISOString().slice(0,10)}.log`)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 13px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-sans)', cursor: 'pointer', fontWeight: 500 }}>
              <Icon name="download" size={14} /> Daily Log
            </button>
          </div>
        } />

      {/* Tab bar — premium style */}
      <div className="tims-report-tabs" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 4, display: 'flex', gap: 2, overflowX: 'auto' }}>
        {REPORT_TABS.map(t => (
          <button key={t.value} onClick={() => { setTab(t.value); setSearch(''); }}
            style={{ padding: '8px 14px', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: tab === t.value ? 600 : 400, whiteSpace: 'nowrap', color: tab === t.value ? 'var(--text-strong)' : 'var(--text-muted)', background: tab === t.value ? 'var(--surface-sunken)' : 'transparent', boxShadow: tab === t.value ? 'var(--shadow-resting)' : 'none', transition: 'all 0.15s' }}
            onMouseEnter={e => { if (tab !== t.value) { e.currentTarget.style.background = 'var(--surface-sunken)'; e.currentTarget.style.color = 'var(--text-default)'; }}}
            onMouseLeave={e => { if (tab !== t.value) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab description + search + last-updated */}
      <div className="tims-report-toolbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="tims-report-description" style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 480 }}>{tabInfo?.desc}</div>
        </div>
        <div className="tims-report-searchbar" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ width: 220 }}>
            <Input icon={<Icon name="search" size={14} />} value={search} onChange={e => setSearch(e.target.value)} placeholder={SEARCH_HINTS[tab] || 'Filter this report…'} />
          </div>
          <span style={{ fontSize: 11.5, color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>Updated {LAST_UPDATED}</span>
        </div>
      </div>

      {/* Table card */}
      <div className="tims-report-card" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <ReportTable columns={config.columns} rows={config.rows} sortableKeys={config.sortable} />
      </div>
    </div>
  );
}

function PlaceholderScreen({ title, subtitle, note }) {
  const { PageHeader, Card, EmptyState } = NS_REP;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader title={title} subtitle={subtitle} />
      <Card><EmptyState icon={<Icon name="building" size={30} />} title={title + ' screen'} message={note} /></Card>
    </div>
  );
}

Object.assign(window, { ReportsScreen, PlaceholderScreen });
