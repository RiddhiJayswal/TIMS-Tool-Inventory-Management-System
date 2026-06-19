const NS_BIN = window.MTRSDesignSystemUltraTechCement_660dc9;
const BIN_DEPTS = ['All Departments', 'E&I', 'Mechanical', 'Civil', 'Process'];

function BinForm({ bin, onClose }) {
  const { SlideOver, Button, Input, Select, Textarea } = NS_BIN;
  const editing = !!bin;
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [form, setForm] = React.useState({
    bin_code: bin?.bin_code || '',
    shelf: bin?.shelf || '',
    section: bin?.section || '',
    dept_category: bin?.dept_category || '',
    capacity: bin?.capacity || '',
    row: bin?.row || '',
    rack_number: bin?.rack_number || '',
    shelf_level: bin?.shelf_level || '',
    floor_area: bin?.floor_area || '',
    description: bin?.description || '',
  });
  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e && e.target ? e.target.value : e }));

  const Section = React.useMemo(() => function Section({ title, children }) {
    return (
    <div style={{ marginBottom: 20 }}>
      <h4 style={{ margin: '0 0 12px', paddingBottom: 7, borderBottom: '1px solid var(--border-subtle)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{title}</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>{children}</div>
    </div>
    );
  }, []);
  const Full = React.useMemo(() => function Full({ children }) {
    return <div style={{ gridColumn: '1 / -1' }}>{children}</div>;
  }, []);

  const saveBin = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        bin_code: form.bin_code.trim().toUpperCase(),
        shelf_label: form.shelf.trim(),
        section: form.section.trim() || null,
        department_cat: form.dept_category || null,
        capacity: form.capacity ? Number(form.capacity) : null,
        row_label: form.row.trim() || null,
        rack_number: form.rack_number.trim() || null,
        shelf_level: form.shelf_level || null,
        floor_area: form.floor_area || null,
        description: form.description.trim() || null,
      };
      if (!payload.bin_code || !payload.shelf_label) throw new Error('Bin Code and Shelf Label are required');
      if (editing) await window.API.updateBin(bin.id, payload);
      else await window.API.createBin(payload);
      await Promise.all([window.API.loadBins(), window.API.loadDashboard()]);
      onClose();
    } catch (e) {
      setError(e.message || 'Could not save storage bin');
      setSaving(false);
    }
  };

  return (
    <SlideOver open onClose={onClose} title={editing ? 'Edit Storage Bin' : 'Add Storage Bin'} subtitle="Bin, shelf and physical location"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={saving} onClick={saveBin}>{editing ? 'Save Changes' : 'Create Bin'}</Button></>}>

      <Section title="Identification">
        <Input label="Bin Code" required placeholder="e.g. A-12-03" value={form.bin_code} onChange={set('bin_code')} disabled={editing} />
        <Input label="Shelf Label" required placeholder="e.g. Shelf A12" value={form.shelf} onChange={set('shelf')} />
        <Full><Input label="Section" required placeholder="e.g. Precision Tools" value={form.section} onChange={set('section')} /></Full>
        <Select label="Department Category" required value={form.dept_category} onChange={set('dept_category')}>
          <option value="">Select...</option>
          {BIN_DEPTS.map(d => <option key={d}>{d}</option>)}
        </Select>
        <Input label="Capacity" required type="number" placeholder="0" value={form.capacity} onChange={set('capacity')} />
      </Section>

      <Section title="Physical Location">
        <Input label="Row" placeholder="e.g. Row A" value={form.row} onChange={set('row')} />
        <Input label="Rack Number" placeholder="e.g. R-12" value={form.rack_number} onChange={set('rack_number')} />
        <Select label="Shelf Level" value={form.shelf_level} onChange={set('shelf_level')}>
          <option value="">Select level...</option>
          <option>L1 - Ground</option>
          <option>L2 - Mid</option>
          <option>L3 - Top</option>
        </Select>
        <Select label="Floor / Area" value={form.floor_area} onChange={set('floor_area')}>
          <option value="">Select floor...</option>
          <option>Ground Floor</option>
          <option>Mezzanine</option>
          <option>First Floor</option>
          <option>Second Floor</option>
        </Select>
      </Section>

      <Section title="Notes">
        <Full><Textarea label="Description" rows={2} placeholder="What is stored in this bin..." value={form.description} onChange={set('description')} /></Full>
      </Section>
      {error && <div style={{ padding: '9px 11px', borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', color: 'var(--danger-text)', fontSize: 12.5, fontWeight: 600 }}>{error}</div>}
    </SlideOver>
  );
}

/* ── Bin Detail Modal ──────────────────────────────────────────────── */
function BinDetailModal({ bin, onClose, onEdit }) {
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const toolsInBin = (window.MOCK.TOOLS || []).filter(t => t.bin === bin.bin_code);

  const F = ({ label, value, bold }) => (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: bold ? 700 : 400, color: bold ? 'var(--text-strong)' : 'var(--text-default)' }}>{value || '—'}</div>
    </div>
  );

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', padding: 20 }}>
      <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 520, maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700, color: 'var(--text-strong)' }}>{bin.bin_code}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{bin.shelf}{bin.section ? ` · ${bin.section}` : ''}</div>
          </div>
          <button onClick={onClose} style={{ display: 'grid', placeItems: 'center', width: 32, height: 32, border: '1px solid var(--border-default)', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}>
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.1) transparent' }}>
          {/* Location fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', paddingBottom: 20, marginBottom: 20, borderBottom: '1px solid var(--border-subtle)' }}>
            <F label="Bin Code" value={bin.bin_code} bold />
            <F label="Shelf Label" value={bin.shelf} />
            <F label="Section" value={bin.section} />
            <F label="Department" value={bin.dept_category} />
            <F label="Row" value={bin.row} />
            <F label="Rack Number" value={bin.rack_number} />
            <F label="Shelf Level" value={bin.shelf_level} />
            <F label="Floor / Area" value={bin.floor_area} />
            <F label="Capacity" value={bin.capacity ? `${bin.capacity} tools` : null} />
          </div>

          {/* Notes */}
          {bin.description && (
            <div style={{ paddingBottom: 20, marginBottom: 20, borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Notes</div>
              <div style={{ fontSize: 13.5, color: 'var(--text-default)', lineHeight: 1.55 }}>{bin.description}</div>
            </div>
          )}

          {/* Tools stored here */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tools Stored Here</div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-pill)', background: 'var(--surface-sunken)', color: 'var(--text-muted)' }}>{toolsInBin.length}</span>
            </div>
            {toolsInBin.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-subtle)', fontSize: 13 }}>No tools assigned to this bin</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {toolsInBin.map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-strong)' }}>{t.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 2 }}>{t.tool_code}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: t.available > 0 ? 'var(--success-text)' : 'var(--danger-text)' }}>{t.available} avail</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>{t.total} total</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 8, justifyContent: 'flex-end', flexShrink: 0 }}>
          <button onClick={onClose}
            style={{ height: 36, padding: '0 20px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--text-default)', fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
            Close
          </button>
          <button onClick={() => { onClose(); onEdit(bin); }}
            style={{ height: 36, padding: '0 20px', border: 'none', borderRadius: 'var(--radius-md)', background: 'var(--brand-black)', color: '#fff', fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
            Edit Bin
          </button>
        </div>
      </div>
    </div>
  );
}

function StorageBinsScreen() {
  const { PageHeader, Card, DataTable, Button, Input, EmptyState } = NS_BIN;
  const [form, setForm] = React.useState(null);
  const [selectedBin, setSelectedBin] = React.useState(null);
  const [search, setSearch] = React.useState('');

  const rows = (window.MOCK.BINS || []).filter(b =>
    `${b.bin_code} ${b.section} ${b.dept_category} ${b.row || ''} ${b.rack_number || ''} ${b.description || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader title="Storage Bins" subtitle="Bin, shelf and physical location master for the tool store"
        actions={<Button icon={<Icon name="plus" size={16} />} onClick={() => setForm({ new: true })}>Add Bin</Button>} />

      <Card>
        <div style={{ maxWidth: 340 }}>
          <Input icon={<Icon name="search" size={14} />} placeholder="Search bin code, section, row or dept..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </Card>

      <Card padded={false}>
        <DataTable
          columns={[
            { key: 'bin_code', header: 'Bin', render: (b) => (
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-strong)', fontFamily: 'monospace' }}>{b.bin_code}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{b.shelf} - {b.section || 'No section'}</div>
              </div>
            )},
            { key: 'row', header: 'Location', render: (b) => (
              <div style={{ fontSize: 12.5, lineHeight: 1.6 }}>
                <div style={{ color: 'var(--text-default)' }}>{b.row || '-'} - <span style={{ fontFamily: 'monospace' }}>{b.rack_number || '-'}</span></div>
                <div style={{ color: 'var(--text-muted)' }}>{b.shelf_level || '-'} - {b.floor_area || '-'}</div>
              </div>
            )},
            { key: 'dept_category', header: 'Dept', render: (b) => <span style={{ color: 'var(--text-muted)' }}>{b.dept_category}</span> },
            { key: 'capacity', header: 'Cap.', align: 'right', render: (b) => <span style={{ fontWeight: 600 }}>{b.capacity}</span> },
            { key: 'description', header: 'Notes', render: (b) => <span style={{ display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: 12.5 }} title={b.description}>{b.description || '-'}</span> },
            { key: 'actions', header: '', render: (b) => <Button size="sm" variant="secondary" onClick={e => { e.stopPropagation(); setForm({ bin: b }); }}>Edit</Button> },
          ]}
          rows={rows}
          onRowClick={b => setSelectedBin(b)}
          empty={<EmptyState icon={<Icon name="archive" size={30} />} title="No storage bins" message="Add a bin to start mapping tools to shelves."
            action={<Button size="sm" icon={<Icon name="plus" size={14} />} onClick={() => setForm({ new: true })}>Add Bin</Button>} />}
        />
      </Card>

      {form && <BinForm bin={form.bin} onClose={() => setForm(null)} />}
      {selectedBin && <BinDetailModal bin={selectedBin} onClose={() => setSelectedBin(null)} onEdit={b => setForm({ bin: b })} />}
    </div>
  );
}

Object.assign(window, { StorageBinsScreen });
