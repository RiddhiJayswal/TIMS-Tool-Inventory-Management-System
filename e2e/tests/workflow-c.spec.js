/**
 * Workflow C — Overbooking Prevention.
 * Multiple requesters/requests compete for same limited stock.
 * System must prevent approval/issuance that exceeds available units.
 */
import { test, expect } from '@playwright/test'
import { getApiToken } from '../helpers/auth.js'

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

test.describe('Workflow C — Overbooking Prevention', () => {
  test('second approval blocked when all stock reserved', async ({ request }) => {
    const adminToken = await getApiToken({ request }, 'admin')
    const usrToken = await getApiToken({ request }, 'requester')
    const hdToken = await getApiToken({ request }, 'head')

    // Tool with qty=1
    const toolRes = await apiPost(request, '/api/tools', adminToken, {
      tool_code: `E2E-C1-${Date.now()}`, name: 'Limited Stock Tool',
      tool_type: 'general', is_consumable: false, total_quantity: 1,
    })
    expect(toolRes.status).toBe(201)
    const tool = toolRes.data

    const today = new Date().toISOString().split('T')[0]
    const future = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]

    // Two requests for the same tool (same period)
    const req1 = await apiPost(request, '/api/requisitions', usrToken, {
      tool_id: tool.id, quantity_requested: 1,
      purpose_of_job: 'First request', from_date: today, to_date: future,
    })
    const req2 = await apiPost(request, '/api/requisitions', usrToken, {
      tool_id: tool.id, quantity_requested: 1,
      purpose_of_job: 'Second request', from_date: today, to_date: future,
    })

    // Approve first — should succeed
    const approve1 = await apiPut(request, `/api/requisitions/${req1.data.id}/approve`, hdToken)
    expect(approve1.status).toBe(200)

    // Approve second — should fail (no stock left)
    const approve2 = await apiPut(request, `/api/requisitions/${req2.data.id}/approve`, hdToken)
    expect(approve2.status).toBe(400)
    const detail = approve2.data.detail?.toLowerCase() || ''
    expect(detail.includes('reservation') || detail.includes('available') || detail.includes('stock')).toBeTruthy()
  })

  test('issuance blocked when physical stock exhausted', async ({ request }) => {
    const adminToken = await getApiToken({ request }, 'admin')
    const usrToken = await getApiToken({ request }, 'requester')
    const hdToken = await getApiToken({ request }, 'head')
    const stfToken = await getApiToken({ request }, 'staff')

    const toolRes = await apiPost(request, '/api/tools', adminToken, {
      tool_code: `E2E-C2-${Date.now()}`, name: 'Exhaustible Tool',
      tool_type: 'general', is_consumable: false, total_quantity: 2,
    })
    const tool = toolRes.data

    const today = new Date().toISOString().split('T')[0]
    const future = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]

    // Two approved requests (one unit each)
    const req1 = await apiPost(request, '/api/requisitions', usrToken, {
      tool_id: tool.id, quantity_requested: 1,
      purpose_of_job: 'Exhaust 1', from_date: today, to_date: future,
    })
    const req2 = await apiPost(request, '/api/requisitions', usrToken, {
      tool_id: tool.id, quantity_requested: 1,
      purpose_of_job: 'Exhaust 2', from_date: today, to_date: future,
    })

    await apiPut(request, `/api/requisitions/${req1.data.id}/approve`, hdToken)
    await apiPut(request, `/api/requisitions/${req2.data.id}/approve`, hdToken)

    // Issue both
    const issue1 = await apiPost(request, '/api/issuance', stfToken, { requisition_id: req1.data.id })
    const issue2 = await apiPost(request, '/api/issuance', stfToken, { requisition_id: req2.data.id })
    expect(issue1.status).toBe(201)
    expect(issue2.status).toBe(201)

    // Create one more approved request
    const reqExtra = await apiPost(request, '/api/requisitions', usrToken, {
      tool_id: tool.id, quantity_requested: 1,
      purpose_of_job: 'Extra request', from_date: today, to_date: future,
    })
    // Force approve it by checking stock first
    const avail = await apiGet(request, `/api/requisitions/availability/check?tool_id=${tool.id}&quantity=1&from_date=${today}&to_date=${future}`, usrToken)
    // Available should be 0
    expect(avail.available_quantity).toBe(0)
    expect(avail.request_available).toBe(false)
  })

  test('availability check returns correct remaining quantity', async ({ request }) => {
    const adminToken = await getApiToken({ request }, 'admin')
    const usrToken = await getApiToken({ request }, 'requester')
    const hdToken = await getApiToken({ request }, 'head')

    const toolRes = await apiPost(request, '/api/tools', adminToken, {
      tool_code: `E2E-C3-${Date.now()}`, name: 'Avail Check Tool',
      tool_type: 'general', is_consumable: false, total_quantity: 5,
    })
    const tool = toolRes.data

    const today = new Date().toISOString().split('T')[0]
    const future = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]

    // Approve 3 units
    const req = await apiPost(request, '/api/requisitions', usrToken, {
      tool_id: tool.id, quantity_requested: 3,
      purpose_of_job: 'Reserve check test', from_date: today, to_date: future,
    })
    await apiPut(request, `/api/requisitions/${req.data.id}/approve`, hdToken)

    const avail = await apiGet(request, `/api/requisitions/availability/check?tool_id=${tool.id}&quantity=1&from_date=${today}&to_date=${future}`, usrToken)
    expect(avail.available_quantity).toBe(2)
    expect(avail.request_available).toBe(true)
  })

  test('stock quantity cannot go negative', async ({ request }) => {
    const adminToken = await getApiToken({ request }, 'admin')
    const stfToken = await getApiToken({ request }, 'staff')

    const toolRes = await apiPost(request, '/api/tools', adminToken, {
      tool_code: `E2E-C4-${Date.now()}`, name: 'Zero Stock Tool',
      tool_type: 'general', is_consumable: false, total_quantity: 1,
    })
    const tool = toolRes.data

    // Attempt to issue without approved requisition using fake ID
    const fakeRes = await apiPost(request, '/api/issuance', stfToken, {
      requisition_id: '00000000-0000-0000-0000-000000000000',
    })
    expect(fakeRes.status).toBeGreaterThanOrEqual(400)

    // Stock should still be 1
    const toolAfter = await apiGet(request, `/api/tools/${tool.id}`, adminToken)
    expect(toolAfter.available_quantity).toBe(1)
  })
})
