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

function StorageBinsScreen() {
  const { PageHeader, Card, DataTable, Button, Input, EmptyState } = NS_BIN;
  const [form, setForm] = React.useState(null);
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
            { key: 'actions', header: '', render: (b) => <Button size="sm" variant="secondary" onClick={() => setForm({ bin: b })}>Edit</Button> },
          ]}
          rows={rows}
          empty={<EmptyState icon={<Icon name="archive" size={30} />} title="No storage bins" message="Add a bin to start mapping tools to shelves."
            action={<Button size="sm" icon={<Icon name="plus" size={14} />} onClick={() => setForm({ new: true })}>Add Bin</Button>} />}
        />
      </Card>

      {form && <BinForm bin={form.bin} onClose={() => setForm(null)} />}
    </div>
  );
}

Object.assign(window, { StorageBinsScreen });
