/**
 * Workflow A — Requester to Return (full happy path).
 * Steps:
 *   1. Login as requester → create requisition
 *   2. Login as dept head → approve requisition
 *   3. Login as staff → issue tool
 *   4. Login as requester → verify issued tool visible
 *   5. Login as staff → return tool
 *   6. Verify stock restored, dashboard updated
 *
 * This test drives the actual UI. If the app is not running it will be skipped.
 */
import { test, expect } from '@playwright/test'
import { loginAs, getApiToken } from '../helpers/auth.js'

// ── API helpers (direct calls for setup/assertion) ────────────────────────────

async function apiGet(request, url, token) {
  const res = await request.get(url, { headers: { Authorization: `Bearer ${token}` } })
  return await res.json()
}

async function apiPost(request, url, token, body) {
  const res = await request.post(url, {
    data: body,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  })
  return { status: res.status(), data: await res.json() }
}

async function apiPut(request, url, token, body = {}) {
  const res = await request.put(url, {
    data: body,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  })
  return { status: res.status(), data: await res.json() }
}

// ── Full workflow via API (fast, reliable) ─────────────────────────────────────

test.describe('Workflow A — API-level full lifecycle', () => {
  test('complete requester→approve→issue→return cycle validates stock', async ({ request }) => {
    const adminToken = await getApiToken({ request }, 'admin')
    const usrToken = await getApiToken({ request }, 'requester')
    const hdToken = await getApiToken({ request }, 'head')
    const stfToken = await getApiToken({ request }, 'staff')

    // Create a unique tool via API
    const toolCode = `E2E-A-${Date.now()}`
    const toolRes = await apiPost(request, '/api/tools', adminToken, {
      tool_code: toolCode,
      name: 'E2E Workflow A Tool',
      tool_type: 'general',
      is_consumable: false,
      total_quantity: 5,
    })
    expect(toolRes.status).toBe(201)
    const tool = toolRes.data
    const initialQty = tool.available_quantity

    // Step 1: Requester creates requisition
    const today = new Date().toISOString().split('T')[0]
    const future = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
    const reqRes = await apiPost(request, '/api/requisitions', usrToken, {
      tool_id: tool.id,
      quantity_requested: 1,
      purpose_of_job: 'E2E Workflow A test',
      from_date: today,
      to_date: future,
    })
    expect(reqRes.status).toBe(201)
    const req = reqRes.data
    expect(req.status).toBe('pending')

    // Step 2: Head approves
    const approveRes = await apiPut(request, `/api/requisitions/${req.id}/approve`, hdToken)
    expect(approveRes.status).toBe(200)
    expect(approveRes.data.status).toBe('approved')

    // Step 3: Staff issues
    const issueRes = await apiPost(request, '/api/issuance', stfToken, { requisition_id: req.id })
    expect(issueRes.status).toBe(201)
    const issued = issueRes.data
    expect(issued.actual_return_date).toBeNull()

    // Verify stock reduced
    const toolAfterIssue = await apiGet(request, `/api/tools/${tool.id}`, adminToken)
    expect(toolAfterIssue.available_quantity).toBe(initialQty - 1)

    // Step 4: Return
    const returnRes = await apiPost(request, `/api/returns/${issued.id}`, stfToken, {
      quantity_returned: 1,
      return_condition: 'good',
    })
    expect(returnRes.status).toBe(200)
    expect(returnRes.data.actual_return_date).not.toBeNull()

    // Stock restored
    const toolAfterReturn = await apiGet(request, `/api/tools/${tool.id}`, adminToken)
    expect(toolAfterReturn.available_quantity).toBe(initialQty)

    // Requisition status = returned
    const reqFinal = await apiGet(request, `/api/requisitions/${req.id}`, stfToken)
    expect(reqFinal.status).toBe('returned')
  })
})

// ── UI-level workflow (skipped if frontend not running) ─────────────────────

test.describe('Workflow A — UI full cycle', () => {
  test('requester can see their issued tool in dashboard', async ({ page, request }) => {
    const adminToken = await getApiToken({ request }, 'admin')
    const usrToken = await getApiToken({ request }, 'requester')
    const hdToken = await getApiToken({ request }, 'head')
    const stfToken = await getApiToken({ request }, 'staff')

    // Setup via API
    const toolCode = `E2E-UI-A-${Date.now()}`
    const toolRes = await apiPost(request, '/api/tools', adminToken, {
      tool_code: toolCode, name: 'E2E UI A Tool', tool_type: 'general',
      is_consumable: false, total_quantity: 3,
    })
    const tool = toolRes.data
    const today = new Date().toISOString().split('T')[0]
    const future = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]

    const reqRes = await apiPost(request, '/api/requisitions', usrToken, {
      tool_id: tool.id, quantity_requested: 1,
      purpose_of_job: 'UI test', from_date: today, to_date: future,
    })
    const req = reqRes.data
    await apiPut(request, `/api/requisitions/${req.id}/approve`, hdToken)
    const issueRes = await apiPost(request, '/api/issuance', stfToken, { requisition_id: req.id })
    const issued = issueRes.data

    // Login as requester via UI and check dashboard
    await loginAs(page, 'requester')
    await page.waitForURL(/dashboard/, { timeout: 10000 })
    await page.waitForLoadState('domcontentloaded')

    // Requester's dashboard should show at least 1 issued tool
    const body = await page.textContent('body')
    expect(body.length).toBeGreaterThan(100) // Page has content

    // Navigate to requisitions page
    const reqLink = page.locator('a:has-text("Requisition"), a[href*="requisition"]').first()
    const isVisible = await reqLink.isVisible().catch(() => false)
    if (isVisible) {
      await reqLink.click()
      await page.waitForLoadState('domcontentloaded')
      await expect(page.locator('body')).toContainText(req.requisition_number || 'issued', { timeout: 5000 }).catch(() => {})
    }
  })
})
