const NS_TOOLS = window.MTRSDesignSystemUltraTechCement_660dc9;
const DEPARTMENTS = ['E&I', 'Mechanical', 'Civil', 'Process'];

function ToolForm({ onClose, tool = null }) {
  const { SlideOver, Button, Input, Select, RadioGroup, Toggle } = NS_TOOLS;
  const editing = !!tool;
  const [type, setType] = React.useState(tool?.tool_type || 'specialized');
  const [reqCal, setReqCal] = React.useState(editing ? !!tool.requires_calibration : true);
  const [consumable, setConsumable] = React.useState(editing ? !!tool.is_consumable : false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [form, setForm] = React.useState({
    tool_code: tool?.tool_code || '',
    name: tool?.name || '',
    category: tool?.category || '',
    make: tool?.make || '',
    model: tool?.model || '',
    serial_number: tool?.serial_number || '',
    department_access: tool?.department_access || '',
    total_quantity: tool?.total ?? 1,
    storage_bin_id: tool?.storage_bin_id || '',
    purchase_date: tool?.purchase_date || '',
    purchase_price: tool?.purchase_price ?? '',
    standard_life_months: tool?.standard_life_months ?? '',
    calibration_freq_days: tool?.calibration_freq_days || 180,
    last_calibration_date: tool?.last_calibration_date || '',
    service_partner: tool?.service_partner || '',
  });

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e && e.target ? e.target.value : e }));

  const Group = React.useMemo(() => function Group({ title, children }) {
    return (
    <div style={{ marginBottom: 20 }}>
      <h4 style={{ margin: '0 0 12px', paddingBottom: 7, borderBottom: '1px solid var(--border-subtle)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{title}</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>{children}</div>
    </div>
    );
  }, []);

  const saveTool = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        tool_code: form.tool_code.trim().toUpperCase(),
        name: form.name.trim(),
        category: form.category.trim() || null,
        tool_type: type,
        department_access: type === 'specialized' ? form.department_access || null : null,
        is_consumable: consumable,
        make: form.make.trim() || null,
        model: form.model.trim() || null,
        serial_number: form.serial_number.trim() || null,
        total_quantity: Number(form.total_quantity) || 0,
        storage_bin_id: form.storage_bin_id || null,
        purchase_date: form.purchase_date || null,
        purchase_price: form.purchase_price ? Number(form.purchase_price) : null,
        standard_life_months: form.standard_life_months ? Number(form.standard_life_months) : null,
        requires_calibration: reqCal,
        calibration_freq_days: reqCal ? Number(form.calibration_freq_days) || null : null,
        last_calibration_date: reqCal ? form.last_calibration_date || null : null,
        service_partner: reqCal ? form.service_partner.trim() || null : null,
      };
      if (!payload.tool_code || !payload.name) {
        throw new Error('Tool Code and Name are required');
      }
      if (payload.total_quantity < 0) {
        throw new Error('Quantity cannot be negative');
      }
      if (editing) await window.API.updateTool(tool.id, payload);
      else await window.API.createTool(payload);
      await Promise.all([window.API.loadDashboard(), window.API.loadBins(), window.API.loadIssuances().catch(() => []), window.API.loadRequisitions().catch(() => [])]);
      onClose();
    } catch (e) {
      setError(e.message || 'Could not save tool');
      setSaving(false);
    }
  };

  return (
    <SlideOver open onClose={onClose} title={editing ? 'Edit Tool' : 'Add New Tool'} subtitle="Plant maintenance catalogue"
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button loading={saving} onClick={saveTool}>{editing ? 'Save Changes' : 'Create Tool'}</Button>
      </>}>
      <Group title="Identification">
        <Input label="Tool Code" required placeholder="e.g. TL-001" value={form.tool_code} onChange={set('tool_code')} disabled={editing} />
        <Input label="Name" required placeholder="Tool name" value={form.name} onChange={set('name')} />
        <Input label="Category" placeholder="e.g. Hand Tool" value={form.category} onChange={set('category')} />
        <Input label="Make" value={form.make} onChange={set('make')} />
        <Input label="Model" value={form.model} onChange={set('model')} />
        <Input label="Serial Number" value={form.serial_number} onChange={set('serial_number')} />
      </Group>
      <Group title="Classification">
        <div style={{ gridColumn: '1 / -1' }}>
          <RadioGroup name="tt" value={type} onChange={setType} label="Tool type"
            options={[{ value: 'general', label: 'General' }, { value: 'specialized', label: 'Specialized' }]} />
        </div>
        {type === 'specialized' && (
          <div style={{ gridColumn: '1 / -1' }}>
            <Select label="Department Access" value={form.department_access} onChange={set('department_access')}>
              <option value="">Select department...</option>
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </Select>
          </div>
        )}
      </Group>
      <Group title="Inventory">
        <Input label="Total Quantity" required type="number" value={form.total_quantity} onChange={set('total_quantity')} />
        <Select label="Storage Bin" value={form.storage_bin_id} onChange={set('storage_bin_id')}>
          <option value="">None</option>
          {(window.MOCK.BINS || []).map(b => <option key={b.id} value={b.id}>{b.bin_code} - {b.shelf}</option>)}
        </Select>
      </Group>
      <Group title="Financial">
        <Input label="Purchase Date" type="date" value={form.purchase_date} onChange={set('purchase_date')} />
        <Input label="Purchase Price (Rs.)" type="number" placeholder="0.00" value={form.purchase_price} onChange={set('purchase_price')} />
        <Input label="Standard Life (months)" type="number" value={form.standard_life_months} onChange={set('standard_life_months')} />
      </Group>
      <Group title="Calibration & Consumable">
        <div style={{ gridColumn: '1 / -1' }}><Toggle checked={reqCal} onChange={setReqCal} label="Requires calibration" /></div>
        {reqCal && <>
          <Input label="Calibration Freq (days)" type="number" value={form.calibration_freq_days} onChange={set('calibration_freq_days')} />
          <Input label="Last Calibration Date" type="date" value={form.last_calibration_date} onChange={set('last_calibration_date')} />
          <div style={{ gridColumn: '1 / -1' }}><Input label="Service Partner" placeholder="Vendor / lab name" value={form.service_partner} onChange={set('service_partner')} /></div>
        </>}
        <div style={{ gridColumn: '1 / -1' }}><Toggle checked={consumable} onChange={setConsumable} label="Consumable tool (e.g. welding rods)" /></div>
      </Group>
      {error && <div style={{ padding: '9px 11px', borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', color: 'var(--danger-text)', fontSize: 12.5, fontWeight: 600 }}>{error}</div>}
    </SlideOver>
  );
}

function ToolChipGroup({ label, value, onChange, options }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.07em', textTransform: 'uppercase', flexShrink: 0 }}>{label}</span>
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <button key={opt.value} onClick={() => onChange(opt.value)} style={{
            padding: '4px 11px', borderRadius: 'var(--radius-pill)', border: '1px solid',
            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)',
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

function ToolsScreen() {
  const { PageHeader, Button, Card, DataTable, StatusBadge, Input, EmptyState } = NS_TOOLS;
  const [showForm, setShowForm] = React.useState(false);
  const [editTool, setEditTool] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [fType, setFType] = React.useState('');
  const [fStatus, setFStatus] = React.useState('');
  const canManageTools = (window.MOCK.USER || {}).role === 'maintenance_admin';

  const rows = (window.MOCK.TOOLS || []).filter(t => {
    if (search && !(`${t.name} ${t.tool_code}`.toLowerCase().includes(search.toLowerCase()))) return false;
    if (fType && t.tool_type !== fType) return false;
    if (fStatus && t.status !== fStatus) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader title="Tools" subtitle="Plant maintenance tool catalogue"
        actions={canManageTools ? <Button icon={<Icon name="plus" size={16} />} onClick={() => setShowForm(true)}>Add Tool</Button> : null} />

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Input icon={<Icon name="search" size={14} />} placeholder="Search name or code..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <ToolChipGroup label="Type" value={fType} onChange={setFType} options={[{value:'',label:'All Types'},{value:'general',label:'General'},{value:'specialized',label:'Specialized'}]} />
          <ToolChipGroup label="Status" value={fStatus} onChange={setFStatus} options={[{value:'',label:'All Statuses'},{value:'active',label:'Active'},{value:'calibration_due',label:'Calibration Due'},{value:'damaged',label:'Damaged'}]} />
        </div>
      </Card>

      <Card padded={false}>
        <DataTable
          columns={[
            { key: 'tool_code', header: 'Tool Code', mono: true, nowrap: true },
            { key: 'name', header: 'Name', render: (t) => <span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{t.name}</span> },
            { key: 'tool_type', header: 'Type', render: (t) => <span style={{ textTransform: 'capitalize', color: 'var(--text-muted)' }}>{t.tool_type}</span> },
            { key: 'dept', header: 'Dept Access', render: (t) => t.department_access || <span style={{ color: 'var(--text-subtle)' }}>All</span> },
            { key: 'avail', header: 'Available / Total', align: 'right', nowrap: true, render: (t) => <span><b style={{ color: t.available > 0 ? 'var(--success-text)' : 'var(--danger-text)' }}>{t.available}</b><span style={{ color: 'var(--text-subtle)' }}> / {t.total}</span></span> },
            { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} size="sm" /> },
            { key: 'bin', header: 'Storage Bin', mono: true, nowrap: true, render: (t) => <span style={{ color: 'var(--text-muted)' }}>{t.bin}</span> },
            { key: 'actions', header: 'Actions', render: (t) => (
              <div style={{ display: 'flex', gap: 7 }} onClick={(e) => e.stopPropagation()}>
                {canManageTools && <button onClick={() => setEditTool(t)} style={pill('var(--surface-sunken)', 'var(--text-default)')}>Edit</button>}
              </div>
            ) },
          ]}
          rows={rows}
          onRowClick={() => {}}
          getRowTone={(t) => t.status === 'damaged' ? 'danger' : null}
          empty={<EmptyState icon={<Icon name="wrench" size={30} />} title="No tools found" message="No tools match your search." />}
        />
      </Card>

      {showForm && <ToolForm onClose={() => setShowForm(false)} />}
      {editTool && <ToolForm tool={editTool} onClose={() => setEditTool(null)} />}
    </div>
  );
}

function pill(bg, fg, disabled) {
  return { padding: '5px 11px', border: 'none', borderRadius: 'var(--radius-sm)', background: bg, color: fg, fontSize: 12, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sans)', opacity: disabled ? 0.55 : 1 };
}

Object.assign(window, { ToolsScreen });
