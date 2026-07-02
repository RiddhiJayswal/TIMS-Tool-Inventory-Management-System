/**
 * Workflow E — Damage/Loss.
 * Issue tool → Return as damaged/lost → Stock does NOT increase →
 * Damage assessment → Total quantity reduces → Damage report updates.
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

test.describe('Workflow E — Damage/Loss (API)', () => {
  test('damaged return does not restore available stock', async ({ request }) => {
    const adminToken = await getApiToken({ request }, 'admin')
    const usrToken = await getApiToken({ request }, 'requester')
    const hdToken = await getApiToken({ request }, 'head')
    const stfToken = await getApiToken({ request }, 'staff')

    const toolRes = await apiPost(request, '/api/tools', adminToken, {
      tool_code: `E2E-E1-${Date.now()}`, name: 'E2E Damage Tool',
      tool_type: 'general', is_consumable: false, total_quantity: 3,
    })
    const tool = toolRes.data
    const initialQty = tool.available_quantity

    const today = new Date().toISOString().split('T')[0]
    const future = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]

    const reqRes = await apiPost(request, '/api/requisitions', usrToken, {
      tool_id: tool.id, quantity_requested: 1,
      purpose_of_job: 'Damage test', from_date: today, to_date: future,
    })
    await apiPut(request, `/api/requisitions/${reqRes.data.id}/approve`, hdToken)
    const issueRes = await apiPost(request, '/api/issuance', stfToken, { requisition_id: reqRes.data.id })
    const issued = issueRes.data

    const afterIssueQty = initialQty - 1

    // Return as damaged
    const returnRes = await apiPost(request, `/api/returns/${issued.id}`, stfToken, {
      quantity_returned: 1,
      return_condition: 'damaged',
      notes: 'Cracked casing from E2E test',
    })
    expect(returnRes.status).toBe(200)

    // Stock must NOT go back up
    const toolAfter = await apiGet(request, `/api/tools/${tool.id}`, adminToken)
    expect(toolAfter.available_quantity).toBe(afterIssueQty)
  })

  test('missing/lost return does not restore stock', async ({ request }) => {
    const adminToken = await getApiToken({ request }, 'admin')
    const usrToken = await getApiToken({ request }, 'requester')
    const hdToken = await getApiToken({ request }, 'head')
    const stfToken = await getApiToken({ request }, 'staff')

    const toolRes = await apiPost(request, '/api/tools', adminToken, {
      tool_code: `E2E-E2-${Date.now()}`, name: 'E2E Loss Tool',
      tool_type: 'general', is_consumable: false, total_quantity: 2,
    })
    const tool = toolRes.data
    const today = new Date().toISOString().split('T')[0]
    const future = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]

    const reqRes = await apiPost(request, '/api/requisitions', usrToken, {
      tool_id: tool.id, quantity_requested: 1,
      purpose_of_job: 'Loss test', from_date: today, to_date: future,
    })
    await apiPut(request, `/api/requisitions/${reqRes.data.id}/approve`, hdToken)
    const issueRes = await apiPost(request, '/api/issuance', stfToken, { requisition_id: reqRes.data.id })
    const issued = issueRes.data

    const afterIssueQty = tool.available_quantity - 1

    const returnRes = await apiPost(request, `/api/returns/${issued.id}`, stfToken, {
      quantity_returned: 1,
      return_condition: 'missing',
      notes: 'Lost during transport',
    })
    expect(returnRes.status).toBe(200)

    const toolAfter = await apiGet(request, `/api/tools/${tool.id}`, adminToken)
    expect(toolAfter.available_quantity).toBe(afterIssueQty)
  })

  test('damage assessment reduces total_quantity', async ({ request }) => {
    const adminToken = await getApiToken({ request }, 'admin')
    const usrToken = await getApiToken({ request }, 'requester')
    const hdToken = await getApiToken({ request }, 'head')
    const stfToken = await getApiToken({ request }, 'staff')

    const toolRes = await apiPost(request, '/api/tools', adminToken, {
      tool_code: `E2E-E3-${Date.now()}`, name: 'E2E Assess Tool',
      tool_type: 'general', is_consumable: false, total_quantity: 2,
    })
    const tool = toolRes.data
    const today = new Date().toISOString().split('T')[0]
    const future = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]

    const reqRes = await apiPost(request, '/api/requisitions', usrToken, {
      tool_id: tool.id, quantity_requested: 1,
      purpose_of_job: 'Assess test', from_date: today, to_date: future,
    })
    await apiPut(request, `/api/requisitions/${reqRes.data.id}/approve`, hdToken)
    const issueRes = await apiPost(request, '/api/issuance', stfToken, { requisition_id: reqRes.data.id })

    await apiPost(request, `/api/returns/${issueRes.data.id}`, stfToken, {
      quantity_returned: 1, return_condition: 'damaged', notes: 'Bent connector',
    })

    const damageRes = await apiPost(request, `/api/damage/${issueRes.data.id}`, adminToken, {
      damage_type: 'mishandling',
    })
    expect(damageRes.status).toBe(200)

    const toolAfter = await apiGet(request, `/api/tools/${tool.id}`, adminToken)
    expect(toolAfter.total_quantity).toBeLessThan(2)
  })

  test('damage report appears after assessment', async ({ request }) => {
    const adminToken = await getApiToken({ request }, 'admin')
    const usrToken = await getApiToken({ request }, 'requester')
    const hdToken = await getApiToken({ request }, 'head')
    const stfToken = await getApiToken({ request }, 'staff')

    const toolRes = await apiPost(request, '/api/tools', adminToken, {
      tool_code: `E2E-E4-${Date.now()}`, name: 'E2E Report Damage Tool',
      tool_type: 'general', is_consumable: false, total_quantity: 1,
    })
    const tool = toolRes.data
    const today = new Date().toISOString().split('T')[0]
    const future = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]

    const reqRes = await apiPost(request, '/api/requisitions', usrToken, {
      tool_id: tool.id, quantity_requested: 1,
      purpose_of_job: 'Report damage test', from_date: today, to_date: future,
    })
    await apiPut(request, `/api/requisitions/${reqRes.data.id}/approve`, hdToken)
    const issueRes = await apiPost(request, '/api/issuance', stfToken, { requisition_id: reqRes.data.id })

    await apiPost(request, `/api/returns/${issueRes.data.id}`, stfToken, {
      quantity_returned: 1, return_condition: 'damaged', notes: 'Burn damage',
    })
    await apiPost(request, `/api/damage/${issueRes.data.id}`, adminToken, { damage_type: 'mishandling' })

    const report = await apiGet(request, '/api/reports/damage-penalty', adminToken)
    expect(Array.isArray(report)).toBeTruthy()
    const ids = report.map(r => r.issuance_id || r.id)
    expect(ids).toContain(issueRes.data.id)
  })

  test('double damage assessment is blocked', async ({ request }) => {
    const adminToken = await getApiToken({ request }, 'admin')
    const usrToken = await getApiToken({ request }, 'requester')
    const hdToken = await getApiToken({ request }, 'head')
    const stfToken = await getApiToken({ request }, 'staff')

    const toolRes = await apiPost(request, '/api/tools', adminToken, {
      tool_code: `E2E-E5-${Date.now()}`, name: 'E2E Double Damage Tool',
      tool_type: 'general', is_consumable: false, total_quantity: 1,
    })
    const tool = toolRes.data
    const today = new Date().toISOString().split('T')[0]
    const future = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]

    const reqRes = await apiPost(request, '/api/requisitions', usrToken, {
      tool_id: tool.id, quantity_requested: 1,
      purpose_of_job: 'Double damage', from_date: today, to_date: future,
    })
    await apiPut(request, `/api/requisitions/${reqRes.data.id}/approve`, hdToken)
    const issueRes = await apiPost(request, '/api/issuance', stfToken, { requisition_id: reqRes.data.id })

    await apiPost(request, `/api/returns/${issueRes.data.id}`, stfToken, {
      quantity_returned: 1, return_condition: 'damaged', notes: 'Double test',
    })
    await apiPost(request, `/api/damage/${issueRes.data.id}`, adminToken, { damage_type: 'wear_and_tear' })

    // Second damage attempt must fail
    const second = await apiPost(request, `/api/damage/${issueRes.data.id}`, adminToken, { damage_type: 'wear_and_tear' })
    expect(second.status).toBe(400)
  })
})
