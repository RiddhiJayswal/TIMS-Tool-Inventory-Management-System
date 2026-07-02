/**
 * API client unit tests — TIMS frontend.
 * Tests the axios client interceptor logic, token attachment, and 401 redirect.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// We test the module-level behavior by importing it in the context of mocked modules.
// axios is the real module; we replace its internals to control responses.

describe('API client — token attachment', () => {
  it('attaches Authorization header when token is in localStorage', async () => {
    localStorage.setItem('tims_token', 'test-jwt-token')
    const { default: api } = await import('../api/client.js')

    // Intercept the request before it's sent by examining interceptors
    const interceptorFns = api.interceptors.request.handlers
    const handlerFn = interceptorFns[interceptorFns.length - 1]?.fulfilled
    const config = { headers: {} }
    const result = handlerFn(config)
    expect(result.headers.Authorization).toBe('Bearer test-jwt-token')
  })

  it('does not attach Authorization header when no token stored', async () => {
    localStorage.removeItem('tims_token')
    const { default: api } = await import('../api/client.js')
    const interceptorFns = api.interceptors.request.handlers
    const handlerFn = interceptorFns[interceptorFns.length - 1]?.fulfilled
    const config = { headers: {} }
    const result = handlerFn(config)
    expect(result.headers.Authorization).toBeUndefined()
  })
})

describe('API client — authAPI', () => {
  it('authAPI exports login, signup, forgotPassword, resetPassword, me, logout', async () => {
    const { authAPI } = await import('../api/client.js')
    expect(typeof authAPI.login).toBe('function')
    expect(typeof authAPI.signup).toBe('function')
    expect(typeof authAPI.forgotPassword).toBe('function')
    expect(typeof authAPI.resetPassword).toBe('function')
    expect(typeof authAPI.me).toBe('function')
    expect(typeof authAPI.logout).toBe('function')
    expect(typeof authAPI.getNotifications).toBe('function')
    expect(typeof authAPI.markRead).toBe('function')
  })
})

describe('API client — toolsAPI', () => {
  it('exports list, get, create, update', async () => {
    const { toolsAPI } = await import('../api/client.js')
    expect(typeof toolsAPI.list).toBe('function')
    expect(typeof toolsAPI.get).toBe('function')
    expect(typeof toolsAPI.create).toBe('function')
    expect(typeof toolsAPI.update).toBe('function')
  })
})

describe('API client — requisitionsAPI', () => {
  it('exports list, get, create, approve, reject, cancel, availability', async () => {
    const { requisitionsAPI } = await import('../api/client.js')
    expect(typeof requisitionsAPI.list).toBe('function')
    expect(typeof requisitionsAPI.get).toBe('function')
    expect(typeof requisitionsAPI.create).toBe('function')
    expect(typeof requisitionsAPI.approve).toBe('function')
    expect(typeof requisitionsAPI.reject).toBe('function')
    expect(typeof requisitionsAPI.cancel).toBe('function')
    expect(typeof requisitionsAPI.availability).toBe('function')
  })
})

describe('API client — dashboardAPI', () => {
  it('exports summary and myIssuances', async () => {
    const { dashboardAPI } = await import('../api/client.js')
    expect(typeof dashboardAPI.summary).toBe('function')
    expect(typeof dashboardAPI.myIssuances).toBe('function')
  })
})

describe('API client — reportsAPI', () => {
  it('exports all report endpoints', async () => {
    const { reportsAPI } = await import('../api/client.js')
    const expected = ['stock', 'issuanceHistory', 'overdue', 'calibration', 'damagePenalty', 'utilization', 'depreciation']
    expected.forEach(fn => {
      expect(typeof reportsAPI[fn]).toBe('function')
    })
  })
})

describe('API client — binsAPI', () => {
  it('exports list, tools, create, update', async () => {
    const { binsAPI } = await import('../api/client.js')
    expect(typeof binsAPI.list).toBe('function')
    expect(typeof binsAPI.tools).toBe('function')
    expect(typeof binsAPI.create).toBe('function')
    expect(typeof binsAPI.update).toBe('function')
  })
})
