import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock global fetch
global.fetch = vi.fn()

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value) },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Suppress console.error noise from intentional error tests
const originalError = console.error
beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.clear()
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) return
    originalError(...args)
  }
})

afterEach(() => {
  console.error = originalError
})
