/**
 * Workflow B — Rejection flow.
 * Requester creates requisition → Head rejects with reason →
 * Requester sees rejection → Stock unchanged → Reports reflect correct status.
 */
import { test, expect } from '@playwright/test'
import { getApiToken, loginAs } from '../helpers/auth.js'

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

async function apiGet(request, url, token) {
  const res = await request.get(url, { headers: { Authorization: `Bearer ${token}` } })
  return await res.json()
}

test.describe('Workflow B — Rejection flow (API)', () => {
  test('rejected requisition does not reduce stock', async ({ request }) => {
    const adminToken = await getApiToken({ request }, 'admin')
    const usrToken = await getApiToken({ request }, 'requester')
    const hdToken = await getApiToken({ request }, 'head')

    const toolRes = await apiPost(request, '/api/tools', adminToken, {
      tool_code: `E2E-B-${Date.now()}`,
      name: 'E2E Rejection Tool',
      tool_type: 'general',
      is_consumable: false,
      total_quantity: 4,
    })
    expect(toolRes.status).toBe(201)
    const tool = toolRes.data
    const initialQty = tool.available_quantity

    const today = new Date().toISOString().split('T')[0]
    const future = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]

    const reqRes = await apiPost(request, '/api/requisitions', usrToken, {
      tool_id: tool.id, quantity_requested: 2,
      purpose_of_job: 'Workflow B test', from_date: today, to_date: future,
    })
    expect(reqRes.status).toBe(201)
    const req = reqRes.data

    // Head rejects
    const rejectRes = await apiPut(request, `/api/requisitions/${req.id}/reject`, hdToken, {
      reason: 'Tool not needed for this job scope',
    })
    expect(rejectRes.status).toBe(200)
    expect(rejectRes.data.status).toBe('rejected')
    expect(rejectRes.data.rejection_reason).toContain('not needed')

    // Stock unchanged
    const toolAfter = await apiGet(request, `/api/tools/${tool.id}`, adminToken)
    expect(toolAfter.available_quantity).toBe(initialQty)
  })

  test('rejected requisition cannot be issued', async ({ request }) => {
    const adminToken = await getApiToken({ request }, 'admin')
    const usrToken = await getApiToken({ request }, 'requester')
    const hdToken = await getApiToken({ request }, 'head')
    const stfToken = await getApiToken({ request }, 'staff')

    const toolRes = await apiPost(request, '/api/tools', adminToken, {
      tool_code: `E2E-B2-${Date.now()}`, name: 'E2E No Issue Tool',
      tool_type: 'general', is_consumable: false, total_quantity: 2,
    })
    const tool = toolRes.data
    const today = new Date().toISOString().split('T')[0]
    const future = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]

    const reqRes = await apiPost(request, '/api/requisitions', usrToken, {
      tool_id: tool.id, quantity_requested: 1,
      purpose_of_job: 'Reject issue test', from_date: today, to_date: future,
    })
    const req = reqRes.data
    await apiPut(request, `/api/requisitions/${req.id}/reject`, hdToken, { reason: 'Rejected' })

    const issueRes = await apiPost(request, '/api/issuance', stfToken, { requisition_id: req.id })
    expect(issueRes.status).toBeGreaterThanOrEqual(400)
  })

  test('rejection without reason returns 422', async ({ request }) => {
    const adminToken = await getApiToken({ request }, 'admin')
    const usrToken = await getApiToken({ request }, 'requester')
    const hdToken = await getApiToken({ request }, 'head')

    const toolRes = await apiPost(request, '/api/tools', adminToken, {
      tool_code: `E2E-B3-${Date.now()}`, name: 'Reason Required Tool',
      tool_type: 'general', is_consumable: false, total_quantity: 1,
    })
    const tool = toolRes.data
    const today = new Date().toISOString().split('T')[0]
    const future = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]

    const reqRes = await apiPost(request, '/api/requisitions', usrToken, {
      tool_id: tool.id, quantity_requested: 1,
      purpose_of_job: 'No reason reject test', from_date: today, to_date: future,
    })
    const req = reqRes.data

    const rejectRes = await apiPut(request, `/api/requisitions/${req.id}/reject`, hdToken, { reason: '' })
    expect(rejectRes.status).toBe(422)
  })

  test('requester sees rejection with reason in requisitions list', async ({ page, request }) => {
    const adminToken = await getApiToken({ request }, 'admin')
    const usrToken = await getApiToken({ request }, 'requester')
    const hdToken = await getApiToken({ request }, 'head')

    const toolRes = await apiPost(request, '/api/tools', adminToken, {
      tool_code: `E2E-B4-${Date.now()}`, name: 'UI Rejection Tool',
      tool_type: 'general', is_consumable: false, total_quantity: 2,
    })
    const tool = toolRes.data
    const today = new Date().toISOString().split('T')[0]
    const future = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]

    const reqRes = await apiPost(request, '/api/requisitions', usrToken, {
      tool_id: tool.id, quantity_requested: 1,
      purpose_of_job: 'UI rejection test', from_date: today, to_date: future,
    })
    const req = reqRes.data
    await apiPut(request, `/api/requisitions/${req.id}/reject`, hdToken, {
      reason: 'Budget constraints for this quarter',
    })

    await loginAs(page, 'requester')
    await page.goto('/requisitions', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('domcontentloaded')

    const body = await page.textContent('body')
    // Page should show "rejected" status somewhere
    expect(body.toLowerCase()).toContain('reject')
  })
})
