/**
 * Workflow F — Role Restriction.
 * Verifies that every role is blocked from actions they are not permitted to perform.
 * Tests both API-level (403) and UI-level (redirect or hidden element).
 */
import { test, expect } from '@playwright/test'
import { getApiToken, loginAs } from '../helpers/auth.js'

test.describe('Workflow F — Role Restriction (API)', () => {
  test('requester blocked from all report endpoints', async ({ request }) => {
    const usrToken = await getApiToken({ request }, 'requester')
    const endpoints = [
      '/api/reports/stock', '/api/reports/issuance-history',
      '/api/reports/overdue', '/api/reports/calibration',
      '/api/reports/damage-penalty', '/api/reports/utilization',
      '/api/reports/depreciation',
    ]
    for (const ep of endpoints) {
      const res = await request.get(ep, { headers: { Authorization: `Bearer ${usrToken}` } })
      expect(res.status()).toBe(403, `Requester should be blocked from ${ep}`)
    }
  })

  test('dept_head blocked from report endpoints', async ({ request }) => {
    const hdToken = await getApiToken({ request }, 'head')
    const blocked = ['/api/reports/stock', '/api/reports/issuance-history']
    for (const ep of blocked) {
      const res = await request.get(ep, { headers: { Authorization: `Bearer ${hdToken}` } })
      expect(res.status()).toBe(403, `Head should be blocked from ${ep}`)
    }
  })

  test('requester cannot list users', async ({ request }) => {
    const usrToken = await getApiToken({ request }, 'requester')
    const res = await request.get('/api/users', { headers: { Authorization: `Bearer ${usrToken}` } })
    expect(res.status()).toBe(403)
  })

  test('staff cannot list users', async ({ request }) => {
    const stfToken = await getApiToken({ request }, 'staff')
    const res = await request.get('/api/users', { headers: { Authorization: `Bearer ${stfToken}` } })
    expect(res.status()).toBe(403)
  })

  test('requester cannot create tools', async ({ request }) => {
    const usrToken = await getApiToken({ request }, 'requester')
    const res = await request.post('/api/tools', {
      data: { tool_code: 'NOAUTH-01', name: 'Nope', tool_type: 'general', total_quantity: 1 },
      headers: { Authorization: `Bearer ${usrToken}`, 'Content-Type': 'application/json' },
    })
    expect(res.status()).toBe(403)
  })

  test('head cannot create tools', async ({ request }) => {
    const hdToken = await getApiToken({ request }, 'head')
    const res = await request.post('/api/tools', {
      data: { tool_code: 'NOAUTH-02', name: 'Nope', tool_type: 'general', total_quantity: 1 },
      headers: { Authorization: `Bearer ${hdToken}`, 'Content-Type': 'application/json' },
    })
    expect(res.status()).toBe(403)
  })

  test('requester cannot access issuance queue', async ({ request }) => {
    const usrToken = await getApiToken({ request }, 'requester')
    const res = await request.get('/api/issuance/queue', { headers: { Authorization: `Bearer ${usrToken}` } })
    expect(res.status()).toBe(403)
  })

  test('requester cannot process returns', async ({ request }) => {
    const usrToken = await getApiToken({ request }, 'requester')
    const res = await request.post('/api/returns/00000000-0000-0000-0000-000000000000', {
      data: { quantity_returned: 1, return_condition: 'good' },
      headers: { Authorization: `Bearer ${usrToken}`, 'Content-Type': 'application/json' },
    })
    expect(res.status()).toBe(403)
  })

  test('head cannot approve own requisition', async ({ request }) => {
    const adminToken = await getApiToken({ request }, 'admin')
    const hdToken = await getApiToken({ request }, 'head')

    const toolRes = await request.post('/api/tools', {
      data: { tool_code: `E2E-F-${Date.now()}`, name: 'Self-Approval Test', tool_type: 'general', total_quantity: 3 },
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
    })
    const tool = await toolRes.json()
    const today = new Date().toISOString().split('T')[0]
    const future = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]

    const reqRes = await request.post('/api/requisitions', {
      data: { tool_id: tool.id, quantity_requested: 1, purpose_of_job: 'Self-approval test', from_date: today, to_date: future },
      headers: { Authorization: `Bearer ${hdToken}`, 'Content-Type': 'application/json' },
    })
    const req = await reqRes.json()

    const approveRes = await request.put(`/api/requisitions/${req.id}/approve`, {
      headers: { Authorization: `Bearer ${hdToken}` },
    })
    expect(approveRes.status()).toBe(403)
  })

  test('cross-department head cannot approve other dept requisition', async ({ request }) => {
    const adminToken = await getApiToken({ request }, 'admin')
    const usrToken = await getApiToken({ request }, 'requester') // E&I
    const hd2Token = await getApiToken({ request }, 'head2')   // Mechanical

    const toolRes = await request.post('/api/tools', {
      data: { tool_code: `E2E-FX-${Date.now()}`, name: 'Cross Dept Tool', tool_type: 'general', total_quantity: 1 },
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
    })
    const tool = await toolRes.json()
    const today = new Date().toISOString().split('T')[0]
    const future = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]

    const reqRes = await request.post('/api/requisitions', {
      data: { tool_id: tool.id, quantity_requested: 1, purpose_of_job: 'Cross dept', from_date: today, to_date: future },
      headers: { Authorization: `Bearer ${usrToken}`, 'Content-Type': 'application/json' },
    })
    const req = await reqRes.json()

    const approveRes = await request.put(`/api/requisitions/${req.id}/approve`, {
      headers: { Authorization: `Bearer ${hd2Token}` },
    })
    expect(approveRes.status()).toBe(403)
  })

  test('unauthenticated requests return 401', async ({ request }) => {
    const endpoints = ['/api/tools', '/api/requisitions', '/api/dashboard/summary', '/api/users']
    for (const ep of endpoints) {
      const res = await request.get(ep)
      expect(res.status()).toBe(401, `${ep} should return 401 without auth`)
    }
  })
})

test.describe('Workflow F — Role Restriction (UI)', () => {
  test('requester cannot see user management page', async ({ page }) => {
    await loginAs(page, 'requester')
    await page.goto('/users', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('domcontentloaded')
    // Should either redirect or show unauthorized message
    const isUnauthorized = page.url().includes('login')
      || await page.locator('body').textContent().then(t => t.toLowerCase().includes('unauthorized') || t.toLowerCase().includes('access denied') || t.toLowerCase().includes('forbidden')).catch(() => false)
    expect(page.url().includes('login') || isUnauthorized).toBeTruthy()
  })

  test('requester cannot see reports page', async ({ page }) => {
    await loginAs(page, 'requester')
    await page.goto('/reports', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('domcontentloaded')
    const body = await page.textContent('body')
    const isBlocked = page.url().includes('login')
      || body.toLowerCase().includes('access') || body.toLowerCase().includes('permission')
      || body.toLowerCase().includes('unauthorized')
    expect(isBlocked || !page.url().includes('reports')).toBeTruthy()
  })
})
