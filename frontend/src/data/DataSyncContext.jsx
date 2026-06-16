import { createContext, useCallback, useContext, useMemo, useReducer } from 'react'
import {
  binsAPI,
  calibrationAPI,
  damageAPI,
  issuanceAPI,
  requisitionsAPI,
  returnsAPI,
  toolsAPI,
  usersAPI,
} from '../api/client'

const DataSyncContext = createContext(null)

function reducer(state, action) {
  if (action.type === 'DATA_CHANGED') {
    return {
      version: state.version + 1,
      lastChange: {
        scope: action.scope || 'all',
        at: Date.now(),
      },
    }
  }
  return state
}

export function DataSyncProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { version: 0, lastChange: null })

  const emitDataChanged = useCallback((scope = 'all') => {
    dispatch({ type: 'DATA_CHANGED', scope })
  }, [])

  const runMutation = useCallback(async (scope, fn) => {
    const result = await fn()
    emitDataChanged(scope)
    return result
  }, [emitDataChanged])

  const actions = useMemo(() => ({
    createRequest: (payload) => runMutation('requests', () => requisitionsAPI.create(payload)),
    approveRequest: (id) => runMutation('requests', () => requisitionsAPI.approve(id)),
    rejectRequest: (id, reason) => runMutation('requests', () => requisitionsAPI.reject(id, reason)),
    cancelRequest: (id) => runMutation('requests', () => requisitionsAPI.cancel(id)),
    issueTool: (payload) => runMutation('issuance', () => issuanceAPI.issue(payload)),
    returnTool: (issuanceId, payload) => runMutation('returns', () => returnsAPI.processReturn(issuanceId, payload)),
    markToolDamaged: (issuanceId, payload) => runMutation('damage', () => damageAPI.record(issuanceId, payload)),
    markToolLost: (issuanceId, payload) => runMutation('damage', () => damageAPI.record(issuanceId, payload)),
    updateCalibration: (toolId, payload) => runMutation('calibration', () => calibrationAPI.record(toolId, payload)),
    updateToolBin: (toolId, storageBinId) => runMutation('tools', () => toolsAPI.update(toolId, { storage_bin_id: storageBinId || null })),
    addTool: (payload) => runMutation('tools', () => toolsAPI.create(payload)),
    updateTool: (id, payload) => runMutation('tools', () => toolsAPI.update(id, payload)),
    addUser: (payload) => runMutation('users', () => usersAPI.create(payload)),
    updateUser: (id, payload) => runMutation('users', () => usersAPI.update(id, payload)),
    changeUserRole: (id, role) => runMutation('users', () => usersAPI.update(id, { role })),
    deactivateUser: (id) => runMutation('users', () => usersAPI.update(id, { is_active: false })),
    toggleUserActive: (id) => runMutation('users', () => usersAPI.toggleActive(id)),
    addBin: (payload) => runMutation('bins', () => binsAPI.create(payload)),
    updateBin: (id, payload) => runMutation('bins', () => binsAPI.update(id, payload)),
  }), [runMutation])

  const value = useMemo(() => ({
    version: state.version,
    lastChange: state.lastChange,
    emitDataChanged,
    actions,
  }), [actions, emitDataChanged, state.lastChange, state.version])

  return <DataSyncContext.Provider value={value}>{children}</DataSyncContext.Provider>
}

export function useDataSync() {
  const ctx = useContext(DataSyncContext)
  if (!ctx) throw new Error('useDataSync must be used inside DataSyncProvider')
  return ctx
}
