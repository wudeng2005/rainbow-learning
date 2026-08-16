import { create } from 'zustand'
import { useDecorationStore } from '@/store/useDecorationStore'
import { fetchCloudState, pushCloudState } from '@/lib/dbApi'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error'

interface SyncStatusState {
  status: SyncStatus
  lastSyncAt: number | null
  message: string
  set: (patch: Partial<Omit<SyncStatusState, 'set'>>) => void
}

/** 云同步状态（供设置页展示） */
export const useSyncStatus = create<SyncStatusState>((set) => ({
  status: 'idle',
  lastSyncAt: null,
  message: '',
  set: (patch) => set(patch),
}))

const STORAGE_KEY = 'decoration-costs-v1'

let timer: number | undefined
let running = false
let queued = false

/** 数据变更后防抖推送云端 */
export function scheduleCloudPush(delay = 1500) {
  window.clearTimeout(timer)
  timer = window.setTimeout(() => {
    void push()
  }, delay)
}

async function push() {
  if (running) {
    queued = true
    return
  }
  running = true
  useSyncStatus.getState().set({ status: 'syncing', message: '' })
  try {
    await pushCloudState(useDecorationStore.getState())
    useSyncStatus.getState().set({ status: 'synced', lastSyncAt: Date.now(), message: '' })
  } catch (e) {
    useSyncStatus.getState().set({
      status: 'error',
      message: e instanceof Error ? e.message : '网络不可用',
    })
  } finally {
    running = false
    if (queued) {
      queued = false
      scheduleCloudPush(800)
    }
  }
}

/**
 * 应用启动时初始化云同步：
 * - 订阅本地数据变化，自动防抖推送云端
 * - 本地已有数据：以本地为准，延迟推送一次（把历史数据补进数据库）
 * - 全新设备（无本地数据）：尝试从云端拉取恢复
 */
export function initCloudSync() {
  useDecorationStore.subscribe((state, prev) => {
    if (
      state.budget !== prev.budget ||
      state.projects !== prev.projects ||
      state.payments !== prev.payments ||
      state.categoriesL1 !== prev.categoriesL1 ||
      state.categoriesL2 !== prev.categoriesL2
    ) {
      scheduleCloudPush()
    }
  })

  const hasLocal = localStorage.getItem(STORAGE_KEY) !== null
  if (hasLocal) {
    scheduleCloudPush(2000)
  } else {
    fetchCloudState()
      .then((cloud) => {
        if (cloud && (cloud.projects.length > 0 || cloud.payments.length > 0)) {
          useDecorationStore.getState().importData(cloud)
        }
      })
      .catch(() => {
        // 云端不可用时静默忽略，保持本地优先
      })
  }
}
