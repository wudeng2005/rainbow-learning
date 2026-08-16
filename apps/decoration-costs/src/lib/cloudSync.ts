import { create } from 'zustand'
import { useDecorationStore, DEFAULT_BUDGET } from '@/store/useDecorationStore'
import { fetchCloudState, pushCloudState } from '@/lib/dbApi'
import type { CloudState } from '@/lib/dbApi'
import type { DecorationState } from '@/types'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error'

interface SyncStatusState {
  status: SyncStatus
  lastSyncAt: number | null
  message: string
  set: (patch: Partial<Omit<SyncStatusState, 'set'>>) => void
}

/** 云同步状态（内部使用） */
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

/** 云端与本地按主键做并集合并（冲突时本地优先），保证任何一端的数据都不丢失 */
function mergeCloudAndLocal(cloud: CloudState, local: DecorationState) {
  function mergeById<T>(cloudArr: T[], localArr: T[], key: (item: T) => string): T[] {
    const map = new Map<string, T>()
    for (const item of cloudArr) map.set(key(item), item)
    for (const item of localArr) map.set(key(item), item)
    return [...map.values()]
  }
  return {
    // 预算：本地仍是默认值而云端已修改时，采用云端值，避免默认值覆盖真实数据
    budget:
      local.budget.total_budget === DEFAULT_BUDGET.total_budget &&
      cloud.budget.total_budget !== DEFAULT_BUDGET.total_budget
        ? cloud.budget
        : local.budget,
    categoriesL1: mergeById(cloud.categoriesL1, local.categoriesL1, (c) => c.category_l1_id),
    categoriesL2: mergeById(cloud.categoriesL2, local.categoriesL2, (c) => c.category_l2_id),
    projects: mergeById(cloud.projects, local.projects, (p) => p.project_id),
    payments: mergeById(cloud.payments, local.payments, (p) => p.payment_id),
    // 更新日志仅本地维护，合并时保留本地记录
    update_log: local.update_log ?? [],
  }
}

/**
 * 应用启动时初始化云同步：
 * - 订阅本地数据变化，自动防抖推送云端
 * - 全新设备（无本地数据）：从云端拉取恢复
 * - 有本地数据：
 *   - 双方都有时间标记 → 新的覆盖旧的（相同则不动）
 *   - 缺少标记（旧版本升级）→ 并集合并后推送，确保不丢任何设备的更新
 *   - 云端为空 → 直接推送本地
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

  if (!hasLocal) {
    fetchCloudState()
      .then((cloud) => {
        if (cloud && (cloud.projects.length > 0 || cloud.payments.length > 0)) {
          useDecorationStore.getState().importData(cloud)
        }
      })
      .catch(() => {
        // 云端不可用时静默忽略，保持本地优先
      })
    return
  }

  const localAt = useDecorationStore.getState().last_modified_at || ''
  fetchCloudState()
    .then((cloud) => {
      const cloudAt = cloud?.lastModifiedAt || ''
      // 仅当云端存在实际业务数据时才视为"有数据"，避免只有默认预算记录时覆盖本地
      const cloudHasData = !!cloud && (cloud.projects.length > 0 || cloud.payments.length > 0)

      if (!cloudHasData) {
        scheduleCloudPush(2000)
        return
      }
      if (localAt && cloudAt) {
        if (localAt > cloudAt) {
          scheduleCloudPush(2000)
        } else if (cloudAt > localAt) {
          useDecorationStore.getState().importData(cloud!)
        }
        return
      }
      // 迁移场景：本地缺少时间标记，做并集合并后推送
      const merged = mergeCloudAndLocal(cloud!, useDecorationStore.getState())
      useDecorationStore.getState().importData(merged)
    })
    .catch(() => {
      // 启动时云端不可用：保持本地数据，后续变更仍会触发推送
    })
}
