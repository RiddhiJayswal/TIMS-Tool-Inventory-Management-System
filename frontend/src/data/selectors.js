const BLOCKED_STATUSES = new Set(['calibration_due', 'damaged', 'written_off', 'blocked'])

export function availableTools(tools = []) {
  return tools.filter((tool) => !BLOCKED_STATUSES.has(tool.status) && (tool.available_quantity || 0) > 0)
}

export function blockedTools(tools = []) {
  return tools.filter((tool) => BLOCKED_STATUSES.has(tool.status) || (tool.available_quantity || 0) <= 0)
}

export function pendingRequests(requests = []) {
  return requests.filter((request) => request.status === 'pending')
}

export function approvedRequests(requests = []) {
  return requests.filter((request) => request.status === 'approved')
}

export function overdueReturns(issuances = []) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return issuances.filter((issuance) => {
    if (issuance.actual_return_date || !issuance.expected_return_date) return false
    const due = new Date(issuance.expected_return_date)
    due.setHours(0, 0, 0, 0)
    return due < today
  })
}

export function calibrationDueTools(tools = []) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return tools.filter((tool) => {
    if (!tool.requires_calibration || !tool.next_calibration_due) return false
    const due = new Date(tool.next_calibration_due)
    due.setHours(0, 0, 0, 0)
    return due <= today || tool.status === 'calibration_due'
  })
}

export function dashboardStats({ tools = [], requests = [], issuances = [], users = [] } = {}) {
  return {
    total_tools: tools.reduce((sum, tool) => sum + (Number(tool.total_quantity) || 0), 0),
    available_tools: tools.reduce((sum, tool) => sum + (Number(tool.available_quantity) || 0), 0),
    tools_issued: tools.reduce((sum, tool) => sum + (Number(tool.issued_quantity || tool.currently_issued) || 0), 0),
    pending_requests: pendingRequests(requests).length,
    approved_requests: approvedRequests(requests).length,
    overdue_count: overdueReturns(issuances).length,
    active_users: users.filter((user) => user.is_active).length,
    blocked_tools: blockedTools(tools).length,
    calibration_due_count: calibrationDueTools(tools).length,
  }
}

export function departmentReports(requests = [], issuances = []) {
  const rows = new Map()
  requests.forEach((request) => {
    const dept = request.requester_dept || 'Unassigned'
    const row = rows.get(dept) || { department: dept, total_requests: 0, approved_requests: 0, rejected_requests: 0, total_issued: 0 }
    row.total_requests += 1
    if (['approved', 'issued', 'returned'].includes(request.status)) row.approved_requests += 1
    if (request.status === 'rejected') row.rejected_requests += 1
    rows.set(dept, row)
  })
  issuances.forEach((issuance) => {
    const dept = issuance.borrower_dept || 'Unassigned'
    const row = rows.get(dept) || { department: dept, total_requests: 0, approved_requests: 0, rejected_requests: 0, total_issued: 0 }
    row.total_issued += Number(issuance.quantity_issued) || 0
    rows.set(dept, row)
  })
  return Array.from(rows.values())
}

export function employeeReports(issuances = []) {
  const rows = new Map()
  issuances.forEach((issuance) => {
    const employee = issuance.borrower_name || 'Unknown'
    const row = rows.get(employee) || { employee, department: issuance.borrower_dept, issue_count: 0, quantity_issued: 0 }
    row.issue_count += 1
    row.quantity_issued += Number(issuance.quantity_issued) || 0
    rows.set(employee, row)
  })
  return Array.from(rows.values())
}
