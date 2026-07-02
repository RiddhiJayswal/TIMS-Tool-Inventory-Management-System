/**
 * Shared auth helper for Playwright E2E tests.
 * Logs in via the UI and stores state for session reuse.
 */

export const USERS = {
  admin:     { id: 'ADM001', password: 'password123', role: 'maintenance_admin' },
  staff:     { id: 'STF001', password: 'password123', role: 'maintenance_staff' },
  head:      { id: 'HD001',  password: 'password123', role: 'dept_head',         dept: 'E&I' },
  head2:     { id: 'HD002',  password: 'password123', role: 'dept_head',         dept: 'Mechanical' },
  requester: { id: 'USR001', password: 'password123', role: 'requester',         dept: 'E&I' },
}

/**
 * Log in via UI and return — use page.context().storageState() after this to cache.
 */
export async function loginAs(page, userKey) {
  const user = USERS[userKey]
  if (!user) throw new Error(`Unknown user key: ${userKey}`)

  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('domcontentloaded')

  // Fill employee ID — try multiple selectors for robustness
  const empInput = page.getByLabel(/employee id/i).or(
    page.locator('input[placeholder*="ADM" i], input[placeholder*="USR" i], input[placeholder*="Employee" i], input[placeholder*="ID" i], input[name="username"], input[name="employee_id"]')
  ).first()
  await empInput.waitFor({ state: 'visible', timeout: 10000 })
  await empInput.fill(user.id)

  const pwdInput = page.getByLabel(/^password$/i).or(page.locator('input[type="password"], input[placeholder*="password" i]')).first()
  await pwdInput.fill(user.password)

  await page.getByRole('button', { name: /^sign in$/i }).last().click()

  // Wait for redirect to dashboard
  await page.waitForURL(/dashboard/, { timeout: 10000 }).catch(() => {})
  return user
}

/**
 * Make a direct API login call and return the access token.
 * Faster than UI login — use for workflow tests that don't need to test the login page itself.
 */
export async function getApiToken(page, userKey) {
  const user = USERS[userKey]
  const response = await page.request.post('/api/auth/login', {
    form: { username: user.id, password: user.password },
  })
  const data = await response.json()
  return data.access_token
}

/**
 * Set auth state in localStorage (bypasses UI login for speed).
 */
export async function setAuthState(page, userKey) {
  const token = await getApiToken(page, userKey)
  const user = USERS[userKey]
  await page.evaluate(([t, u]) => {
    localStorage.setItem('tims_token', t)
    localStorage.setItem('tims_user', JSON.stringify({ employee_id: u.id, role: u.role }))
  }, [token, user])
  return token
}
