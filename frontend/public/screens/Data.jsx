/* Data.jsx - live API adapter for TIMS runtime screens.
   Populates window.MOCK from backend endpoints so every screen reads one source. */

const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('tims_token');
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(API_BASE + path, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    const detail = err.detail;
    const message = Array.isArray(detail)
      ? detail.map(d => `${(d.loc || []).slice(1).join('.') || 'field'}: ${d.msg}`).join('; ')
      : detail && typeof detail === 'object'
        ? JSON.stringify(detail)
        : detail;
    throw new Error(message || `HTTP ${res.status}`);
  }
  return res.json();
}

function fmtDate(v) {
  if (!v) return '-';
  const d = new Date(v);
  if (isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function issuanceState(expectedReturn) {
  if (!expectedReturn) return { state: 'on_time', days_left: 99 };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(expectedReturn); due.setHours(0, 0, 0, 0);
  const days = Math.round((due - today) / 86400000);
  if (days < 0) return { state: 'overdue', days_left: days };
  if (days === 0) return { state: 'due_today', days_left: 0 };
  return { state: 'on_time', days_left: days };
}

function qty(v) {
  return Number(v || 0);
}

function maybeNumber(v) {
  return v === null || v === undefined || v === '' ? null : Number(v);
}

function safeText(v, fallback = '-') {
  if (v == null || v === '') return fallback;
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function currentRole() {
  return (window.MOCK?.USER?.role || '').toLowerCase();
}

function isMaintenanceRole() {
  return ['maintenance_admin', 'maintenance_staff'].includes(currentRole());
}

function sumIssuedUnits(rows) {
  return (rows || []).reduce((sum, row) => sum + qty(row.qty || row.quantity_issued), 0);
}

function normalizeIssuance(i, toolById = {}) {
  const tool = toolById[i.tool_id] || {};
  const { state, days_left } = issuanceState(i.expected_return_date);
  const quantity = qty(i.quantity_issued || i.qty);
  const absDays = Math.abs(days_left);
  return {
    id: i.id,
    requisition_id: i.requisition_id,
    tool_id: i.tool_id,
    tool_name: i.tool_name || tool.name || '-',
    tool_code: i.tool_code || tool.tool_code || '-',
    qty: quantity,
    quantity_issued: quantity,
    issued_to_id: i.issued_to,
    issued_to: i.borrower_name || i.issued_to || '-',
    dept: i.borrower_dept || i.dept || '-',
    issued_on: fmtDate(i.issued_at),
    due: fmtDate(i.expected_return_date),
    expected_return_date: i.expected_return_date,
    actual_return_date: i.actual_return_date,
    return_condition: i.return_condition,
    damage_type: i.damage_type,
    depreciated_value_at_issue: i.depreciated_value_at_issue,
    days_left,
    days: state === 'overdue' ? `${absDays}d overdue`
      : days_left === 0 ? 'Due today'
      : `${days_left}d left`,
    overdue: state === 'overdue',
    state,
  };
}

function normalizeStockRow(r) {
  const unitCost = maybeNumber(r.unit_cost);
  const currentUnitValue = maybeNumber(r.current_unit_value);
  const currentValue = maybeNumber(r.current_value);
  const totalValue = maybeNumber(r.total_value);
  const issuedValue = maybeNumber(r.issued_value);
  return {
    code: r.tool_code,
    name: r.tool_name || r.name || '-',
    type: r.tool_type || '-',
    category: r.category || '-',
    avail: qty(r.available_quantity),
    available: qty(r.available_quantity),
    total: qty(r.total_quantity),
    issued: qty(r.issued_quantity ?? r.currently_issued),
    unavailable: qty(r.unavailable_quantity),
    value: currentValue,
    unit_cost: unitCost,
    current_unit_value: currentUnitValue,
    total_value: totalValue,
    issued_value: issuedValue,
    status: r.status || 'active',
    storage_bin: r.storage_bin || r.storage_bin_code || 'Not assigned',
    location: r.storage_location || r.storage_bin || r.storage_bin_code || 'Not assigned',
    department: r.department_access || 'All',
    calibration_status: r.calibration_status || 'Not required',
  };
}

function normalizeCalibrationState(status) {
  if (status === 'overdue') return 'overdue';
  if (status === 'due_soon') return 'due_today';
  return 'on_time';
}

function mapTool(t, binMap = {}) {
  return {
    id: t.id,
    tool_code: t.tool_code,
    name: t.name,
    category: t.category,
    tool_type: t.tool_type,
    department_access: t.department_access,
    is_consumable: !!t.is_consumable,
    available: qty(t.available_quantity),
    total: qty(t.total_quantity),
    issued: qty(t.issued_quantity ?? t.currently_issued),
    unavailable: qty(t.unavailable_quantity),
    status: t.status,
    bin: t.storage_bin_code || binMap[t.storage_bin_id] || '-',
    storage_bin_id: t.storage_bin_id,
    requires_calibration: !!t.requires_calibration,
    calibration_freq_days: t.calibration_freq_days,
    last_calibration_date: t.last_calibration_date,
    next_calibration_due: t.next_calibration_due,
    service_partner: t.service_partner,
    make: t.make,
    model: t.model,
    serial_number: t.serial_number,
    purchase_date: t.purchase_date,
    purchase_price: t.purchase_price,
    standard_life_months: t.standard_life_months,
    condition: t.status || 'active',
    notes: t.description || '',
    current_value: qty(t.current_value),
  };
}

function buildDamageQueue(closedIssuances, toolById = {}) {
  return (closedIssuances || [])
    .filter(i => ['damaged', 'missing'].includes(i.return_condition) && !i.damage_type)
    .map(i => {
      const mapped = normalizeIssuance(i, toolById);
      return {
        ...mapped,
        returned_by: mapped.issued_to,
        returned_on: fmtDate(i.actual_return_date),
        condition: i.return_condition,
        current_value: qty(i.depreciated_value_at_issue),
      };
    });
}

function buildReturnHistory(closedIssuances, toolById = {}) {
  return (closedIssuances || [])
    .filter(i => i.actual_return_date)
    .map(i => {
      const mapped = normalizeIssuance(i, toolById);
      return {
        ...mapped,
        returned_by: mapped.issued_to,
        returned_on: fmtDate(i.actual_return_date),
        returnedOn: fmtDate(i.actual_return_date),
        condition: i.return_condition || 'good',
        notes: '',
      };
    });
}

const API = {
  login: async (employeeId, password) => {
    const form = new URLSearchParams({ username: employeeId, password });
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('tims_token', data.access_token);
    localStorage.setItem('tims_user', JSON.stringify(data.user));
    window.MOCK.USER = {
      id: data.user.id,
      employee_id: data.user.employee_id,
      full_name: data.user.full_name,
      department: data.user.department,
      role: data.user.role,
    };
    return data.user;
  },

  logout: () => {
    localStorage.removeItem('tims_token');
    localStorage.removeItem('tims_user');
  },

  forgotUsername: (identifier) =>
    apiFetch('/auth/forgot-username', { method: 'POST', body: JSON.stringify({ identifier }) }),

  forgotPassword: (employeeId, email = '') =>
    apiFetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ employee_id: employeeId, email: email || null }),
    }),

  resetPassword: (token, newPassword) =>
    apiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword }),
    }),

  loadDashboard: async () => {
    const canReadOperationalQueues = ['maintenance_admin', 'maintenance_staff', 'dept_head'].includes(currentRole());
    const [summary, bins, tools, stockReport, openIssuances, closedIssuances] = await Promise.all([
      apiFetch('/dashboard/summary'),
      apiFetch('/storage-bins').catch(() => []),
      apiFetch('/tools').catch(() => []),
      isMaintenanceRole() ? apiFetch('/reports/stock').catch(() => []) : Promise.resolve([]),
      canReadOperationalQueues ? apiFetch('/issuance?status=open').catch(() => []) : apiFetch('/dashboard/my-issuances').catch(() => []),
      canReadOperationalQueues ? apiFetch('/issuance?status=closed').catch(() => []) : Promise.resolve([]),
    ]);

    const binMap = {};
    bins.forEach(b => { binMap[b.id] = b.bin_code; });

    const toolById = {};
    tools.forEach(t => { toolById[t.id] = t; });

    const mappedTools = tools.map(t => mapTool(t, binMap));
    const activeIssuances = openIssuances.map(i => normalizeIssuance(i, toolById));
    const reportStock = stockReport.map(normalizeStockRow);
    const reportIssued = reportStock.reduce((sum, row) => sum + row.issued, 0);
    const openIssued = sumIssuedUnits(activeIssuances);
    const issuedTotal = qty(summary.tools_issued ?? summary.issued_count ?? reportIssued ?? openIssued);

    window.MOCK.SUMMARY = {
      total_tools: qty(summary.total_tools),
      total_units: qty(summary.total_tools),
      total_tool_types: qty(summary.total_tool_types || mappedTools.length),
      available_tools: qty(summary.available_tools),
      tools_issued: issuedTotal,
      issued_units: issuedTotal,
      unavailable_tools: qty(summary.unavailable_tools),
      overdue_count: qty(summary.overdue_count),
      calibration_due_count: qty(summary.calibration_due_count),
      my_pending_requests: qty(summary.my_pending_requests),
      pending_approvals_count: qty(summary.pending_approvals_count),
      approved_queue_count: qty(summary.approved_queue_count),
      pending_requests_count: qty(summary.pending_requests_count),
      approved_requests_count: qty(summary.approved_requests_count),
      rejected_requests_count: qty(summary.rejected_requests_count),
      issued_requests_count: qty(summary.issued_requests_count),
      returned_requests_count: qty(summary.returned_requests_count),
      cancelled_requests_count: qty(summary.cancelled_requests_count),
      active_users_count: qty(summary.active_users_count),
      damaged_or_lost_count: qty(summary.damaged_or_lost_count),
    };

    window.MOCK.MY_ISSUANCES = (summary.my_active_issuances || []).map(i => {
      const mapped = normalizeIssuance(i, toolById);
      const abs = Math.abs(mapped.days_left);
      return {
        id: mapped.id,
        requisition_id: mapped.requisition_id,
        tool_id: mapped.tool_id,
        tool_name: mapped.tool_name,
        tool_code: mapped.tool_code,
        issued_to_id: mapped.issued_to_id,
        quantity_issued: mapped.quantity_issued,
        qty: mapped.qty,
        due: mapped.due,
        expected_return_date: mapped.expected_return_date,
        state: mapped.state,
        days: mapped.state === 'overdue' ? `${abs}d overdue`
          : mapped.days_left === 0 ? 'Due today'
          : `${mapped.days_left}d left`,
        overdue: mapped.state === 'overdue',
      };
    });

    window.MOCK.TOOLS = mappedTools;
    window.MOCK.ACTIVE_ISSUANCES = activeIssuances;
    window.MOCK.PENDING_DAMAGE = buildDamageQueue(closedIssuances, toolById);
    window.MOCK.RETURN_HISTORY = buildReturnHistory(closedIssuances, toolById);
    window.MOCK.REPORT_STOCK = reportStock;

    window.MOCK.LOW_STOCK = (summary.low_stock_tools || []).map(t => ({
      name: t.name,
      tool_code: t.tool_code,
      available: qty(t.available_quantity),
      total: qty(t.total_quantity),
    }));

    window.MOCK.BINS = bins.map(b => ({
      id: b.id,
      bin_code: b.bin_code,
      shelf: b.shelf_label,
      section: b.section,
      dept_category: b.department_category || 'All Departments',
      row: b.row_label || '',
      rack_number: b.rack_number || '',
      shelf_level: b.shelf_level || '',
      floor_area: b.floor_area || '',
      capacity: b.capacity,
      description: b.description || '',
    }));
  },

  loadRequisitions: async () => {
    const reqs = await apiFetch('/requisitions').catch(() => []);
    const mapped = reqs.map(r => ({
      id: r.id,
      requisition_number: r.requisition_number,
      tool_id: r.tool_id,
      requested_by: r.requested_by,
      requester_id: r.requested_by,
      employee_id: r.requester_employee_id || '',
      tool_name: safeText(r.tool_name),
      qty: qty(r.quantity_requested),
      requester: safeText(r.requester_name),
      dept: safeText(r.requester_dept),
      purpose: r.purpose_of_job || '',
      from: fmtDate(r.from_date),
      to: fmtDate(r.to_date),
      from_date: r.from_date,
      to_date: r.to_date,
      submitted: fmtDate(r.created_at),
      created_at: r.created_at,
      status: r.status,
      approved_by: r.approved_by,
      approver_name: r.approver_name || '',
      approved_at: r.approved_at,
      rejection_reason: r.rejection_reason || '',
    }));
    window.MOCK.MY_REQUESTS = mapped;
    window.MOCK.REQUISITIONS = mapped;
  },

  loadIssuances: async () => {
    const [queue, issuances, closedIssuances] = await Promise.all([
      apiFetch('/requisitions?status=approved').catch(() => []),
      apiFetch('/issuance?status=open').catch(() => []),
      apiFetch('/issuance?status=closed').catch(() => []),
    ]);

    const toolById = {};
    (window.MOCK.TOOLS || []).forEach(t => { toolById[t.id] = t; });

    window.MOCK.APPROVED_QUEUE = queue.map(r => {
      const tool = toolById[r.tool_id] || {};
      const avail_stock = qty(tool.available);
      let priority = 'ready';
      if (tool.status && tool.status !== 'active') priority = tool.status === 'calibration_due' ? 'calibration_check' : 'blocked';
      else if (avail_stock <= 1) priority = 'low_stock';
      else if (qty(r.quantity_requested) > 50) priority = 'high_qty';
      return {
        id: r.id,
        requisition_number: r.requisition_number,
        tool_name: r.tool_name || '-',
        tool_code: tool.tool_code || '-',
        qty: qty(r.quantity_requested),
        requester: r.requester_name || '-',
        dept: r.requester_dept || '-',
        approved_on: fmtDate(r.approved_at),
        due: fmtDate(r.to_date),
        expected_return: fmtDate(r.to_date),
        current_value: qty(tool.current_value),
        purpose: r.purpose_of_job || 'Routine maintenance',
        avail_stock,
        priority,
      };
    });

    window.MOCK.ACTIVE_ISSUANCES = issuances.map(i => normalizeIssuance(i, toolById));
    window.MOCK.PENDING_DAMAGE = buildDamageQueue(closedIssuances, toolById);
    window.MOCK.RETURN_HISTORY = buildReturnHistory(closedIssuances, toolById);
  },

  loadReports: async () => {
    const [stock, issuance, overdue, calibration, damage, utilization, depreciation] = await Promise.all([
      apiFetch('/reports/stock').catch(() => []),
      apiFetch('/reports/issuance-history').catch(() => []),
      apiFetch('/reports/overdue').catch(() => []),
      apiFetch('/reports/calibration?days=3650').catch(() => []),
      apiFetch('/reports/damage-penalty').catch(() => []),
      apiFetch('/reports/utilization').catch(() => []),
      apiFetch('/reports/depreciation').catch(() => []),
    ]);
    window.MOCK.REPORT_STOCK = stock.map(normalizeStockRow);
    window.MOCK.REPORT_ISSUANCE = issuance;
    window.MOCK.REPORT_OVERDUE = overdue;
    window.MOCK.REPORT_CALIBRATION = calibration;
    window.MOCK.REPORT_DAMAGE = damage;
    window.MOCK.REPORT_UTILIZATION = utilization;
    window.MOCK.REPORT_DEPRECIATION = depreciation;
  },

  loadCalibration: async () => {
    const tools = await apiFetch('/calibration?days=3650').catch(() => []);
    window.MOCK.CALIBRATION = tools.map(t => ({
      id: t.id,
      tool_name: t.name,
      tool_code: t.tool_code,
      dept: t.department_access || 'All',
      last: fmtDate(t.last_calibration_date),
      next: fmtDate(t.next_calibration_due),
      freq: t.calibration_freq_days || 180,
      service_partner: t.service_partner || '-',
      state: normalizeCalibrationState(t.calibration_status),
      days: t.days_until_due,
    }));
  },

  loadBins: async () => {
    const bins = await apiFetch('/storage-bins').catch(() => []);
    window.MOCK.BINS = bins.map(b => ({
      id: b.id,
      bin_code: b.bin_code,
      shelf: b.shelf_label,
      section: b.section,
      dept_category: b.department_category || 'All Departments',
      row: b.row_label || '',
      rack_number: b.rack_number || '',
      shelf_level: b.shelf_level || '',
      floor_area: b.floor_area || '',
      capacity: b.capacity,
      description: b.description || '',
    }));
  },

  loadUsers: async () => {
    const [users, accessRequests] = await Promise.all([
      apiFetch('/users').catch(() => []),
      apiFetch('/users/access-requests').catch(() => []),
    ]);
    window.MOCK.USERS = users.map(u => ({
      id: u.id,
      emp_id: u.employee_id,
      employee_id: u.employee_id,
      full_name: u.full_name,
      email: u.email,
      role: u.role,
      department: u.department,
      status: u.is_active ? 'active' : 'inactive',
      is_active: !!u.is_active,
    }));
    window.MOCK.ACCESS_REQUESTS = accessRequests.map(r => ({
      id: r.id,
      requestId: r.requestId || r.request_id,
      full_name: r.full_name || r.name || '-',
      emp_id: r.employee_id || r.employeeId || '',
      email: r.email || r.username || '',
      department: r.department || '-',
      role: r.requested_role || r.requestedRole || r.role || 'requester',
      requestedRole: r.requested_role || r.requestedRole || r.role || 'requester',
      reason: r.reason || r.notes || '',
      status: r.status || 'pending',
      submitted: fmtDate(r.created_at || r.createdAt),
      created_at: r.created_at || r.createdAt,
      approved_by: r.approved_by || r.approvedBy || '',
      approved_at: r.approved_at || r.approvedAt || '',
      rejection_reason: r.rejection_reason || '',
      designation: r.reason || r.notes || 'Access request',
    }));
  },

  loadNotifications: async () => {
    const notifs = await apiFetch('/auth/notifications').catch(() => []);
    window.MOCK.NOTIFS = notifs.map(n => ({
      id: n.id,
      message: n.message,
      date: fmtDate(n.created_at),
      is_read: n.is_read,
    }));
  },

  loadForRoute: async (route) => {
    const actions = {
      dashboard: () => Promise.all([API.loadDashboard(), API.loadRequisitions(), API.loadIssuances().catch(() => [])]),
      tools: () => Promise.all([API.loadDashboard(), API.loadBins()]),
      requisitions: () => Promise.all([API.loadRequisitions(), API.loadDashboard(), API.loadIssuances().catch(() => [])]),
      approvals: () => Promise.all([API.loadRequisitions(), API.loadDashboard(), API.loadIssuances().catch(() => [])]),
      issuance: () => Promise.all([API.loadDashboard(), API.loadIssuances()]),
      returns: () => Promise.all([API.loadDashboard(), API.loadIssuances()]),
      calibration: () => API.loadCalibration(),
      bins: () => API.loadBins(),
      users: () => API.loadUsers(),
      reports: () => Promise.all([API.loadDashboard(), API.loadIssuances(), API.loadCalibration(), API.loadReports()]),
    };
    if (actions[route]) await actions[route]().catch(e => console.warn('Data refresh failed:', e));
  },

  approveRequisition: (id) =>
    apiFetch(`/requisitions/${id}/approve`, { method: 'PUT' }),
  rejectRequisition: (id, reason) =>
    apiFetch(`/requisitions/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) }),
  cancelRequisition: (id) =>
    apiFetch(`/requisitions/${id}/cancel`, { method: 'PUT' }),
  createRequisition: (toolId, quantity, purpose, fromDate, toDate) =>
    apiFetch('/requisitions', {
      method: 'POST',
      body: JSON.stringify({ tool_id: toolId, quantity_requested: quantity, purpose_of_job: purpose, from_date: fromDate, to_date: toDate }),
    }),
  checkRequisitionAvailability: (toolId, quantity, fromDate, toDate) =>
    apiFetch(`/requisitions/availability/check?tool_id=${encodeURIComponent(toolId)}&quantity=${encodeURIComponent(quantity)}&from_date=${encodeURIComponent(fromDate)}&to_date=${encodeURIComponent(toDate)}`),
  issueRequisition: (reqId, notes = '') =>
    apiFetch('/issuance', { method: 'POST', body: JSON.stringify({ requisition_id: reqId, notes }) }),
  processReturn: (issuanceId, payload) =>
    apiFetch(`/returns/${issuanceId}`, { method: 'POST', body: JSON.stringify(payload) }),
  recordDamage: (issuanceId, payload) =>
    apiFetch(`/damage/${issuanceId}`, { method: 'POST', body: JSON.stringify(payload) }),
  createTool: (payload) =>
    apiFetch('/tools', { method: 'POST', body: JSON.stringify(payload) }),
  updateTool: (id, payload) =>
    apiFetch(`/tools/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  recordCalibration: (toolId, payload) =>
    apiFetch(`/calibration/${toolId}`, { method: 'POST', body: JSON.stringify(payload) }),
  createBin: (payload) =>
    apiFetch('/storage-bins', { method: 'POST', body: JSON.stringify(payload) }),
  updateBin: (id, payload) =>
    apiFetch(`/storage-bins/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  createUser: (payload) =>
    apiFetch('/users', { method: 'POST', body: JSON.stringify(payload) }),
  updateUser: (id, payload) =>
    apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  toggleUserActive: (id) =>
    apiFetch(`/users/${id}/toggle-active`, { method: 'PUT' }),
  submitAccessRequest: (payload) =>
    apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  approveAccessRequest: (id) =>
    apiFetch(`/users/access-requests/${id}/approve`, { method: 'PUT' }),
  rejectAccessRequest: (id, reason) =>
    apiFetch(`/users/access-requests/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) }),
  markNotificationRead: (id) =>
    apiFetch(`/auth/notifications/${id}/read`, { method: 'PUT' }),
};

const _storedUser = (() => {
  try { return JSON.parse(localStorage.getItem('tims_user') || ''); } catch { return null; }
})();

Object.assign(window, {
  MOCK: {
    USER: _storedUser
      ? { id: _storedUser.id, employee_id: _storedUser.employee_id, full_name: _storedUser.full_name, department: _storedUser.department, role: _storedUser.role }
      : { id: '', employee_id: '', full_name: '', department: '', role: 'requester' },
    NOTIFS: [],
    SUMMARY: { total_tools: 0, total_tool_types: 0, available_tools: 0, tools_issued: 0, issued_units: 0, unavailable_tools: 0, overdue_count: 0, calibration_due_count: 0, my_pending_requests: 0, pending_approvals_count: 0, approved_queue_count: 0 },
    MY_ISSUANCES: [],
    LOW_STOCK: [],
    TOOLS: [],
    REQUISITIONS: [],
    MY_REQUESTS: [],
    APPROVED_QUEUE: [],
    ACTIVE_ISSUANCES: [],
    PENDING_DAMAGE: [],
    CALIBRATION: [],
    BINS: [],
    REPORT_STOCK: [],
    REPORT_ISSUANCE: [],
    REPORT_OVERDUE: [],
    REPORT_CALIBRATION: [],
    REPORT_DAMAGE: [],
    REPORT_UTILIZATION: [],
    REPORT_DEPRECIATION: [],
    RETURN_HISTORY: [],
    USERS: [],
    ACCESS_REQUESTS: [],
  },
  API,
  inr: (n) => 'Rs. ' + Number(n || 0).toLocaleString('en-IN'),
  sumIssuedUnits,
  SELECTORS: {
    getToolById: (id) => (window.MOCK.TOOLS || []).find(t => t.id === id) || null,
    getUserById: (id) => (window.MOCK.USERS || []).find(u => u.id === id) || null,
    getRequestById: (id) => (window.MOCK.REQUISITIONS || window.MOCK.MY_REQUESTS || []).find(r => r.id === id) || null,
    getIssueByRequestId: (requestId) => (window.MOCK.ACTIVE_ISSUANCES || []).find(i => i.requisition_id === requestId) || (window.MOCK.RETURN_HISTORY || []).find(i => i.requisition_id === requestId) || null,
    getActiveIssueByRequestId: (requestId) => (window.MOCK.ACTIVE_ISSUANCES || window.MOCK.MY_ISSUANCES || []).find(i => i.requisition_id === requestId) || null,
    getBinById: (id) => (window.MOCK.BINS || []).find(b => b.id === id) || null,
    getServicePartnerById: (id) => id,
    getActiveIssuedTools: () => window.MOCK.ACTIVE_ISSUANCES || [],
    getIssuedToolsByUser: (userId) => (window.MOCK.ACTIVE_ISSUANCES || []).filter(i => i.issued_to_id === userId || i.issued_to === userId),
    getIssuedToolsByDepartment: (dept) => (window.MOCK.ACTIVE_ISSUANCES || []).filter(i => i.dept === dept),
    getReturnableToolsForUser: () => window.MOCK.MY_ISSUANCES || [],
    getDashboardStatsByRole: () => window.MOCK.SUMMARY || {},
    getRequestsByUser: (userId) => (window.MOCK.MY_REQUESTS || []).filter(r => !userId || r.requester_id === userId),
    getRequestsByDepartment: (dept) => (window.MOCK.REQUISITIONS || []).filter(r => !dept || r.dept === dept),
    getPendingApprovalsForUser: () => (window.MOCK.REQUISITIONS || []).filter(r => r.status === 'pending'),
    getApprovedRequestsForIssue: () => window.MOCK.APPROVED_QUEUE || [],
    getApprovedRequestsReadyForIssue: () => window.MOCK.APPROVED_QUEUE || [],
    getToolsByRole: () => window.MOCK.TOOLS || [],
    getAvailableTools: () => (window.MOCK.TOOLS || []).filter(t => Number(t.available || 0) > 0 && t.status === 'active'),
    getBlockedTools: () => (window.MOCK.TOOLS || []).filter(t => ['calibration_due', 'damaged', 'blocked', 'written_off'].includes(t.status)),
    getDepartmentById: (id) => id,
    getActiveIssueTransactions: () => window.MOCK.ACTIVE_ISSUANCES || [],
    getReturnHistory: () => window.MOCK.RETURN_HISTORY || [],
    getReportRows: () => window.MOCK.REPORT_STOCK || [],
    getToolCurrentValue: (toolOrRow) => toolOrRow?.value ?? toolOrRow?.current_value ?? null,
    getToolTotalValue: (toolOrRow) => toolOrRow?.total_value ?? null,
    getToolAvailability: (tool) => Number(tool?.available || tool?.available_quantity || 0),
    getRequestLifecycleStatus: (req) => req?.status || 'pending',
    getRequestStatus: (req) => req?.status || 'pending',
    getCalibrationStatus: (tool) => (window.MOCK.CALIBRATION || []).find(c => c.id === tool?.id)?.state || tool?.status || 'active',
    getAvailableQuantity: (tool) => Number(tool?.available || tool?.available_quantity || 0),
    getDashboardStats: () => window.MOCK.SUMMARY || {},
  },
});
