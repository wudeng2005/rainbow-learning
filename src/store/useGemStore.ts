import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GemRecord, GemSource } from '@/types'
import { getTodayStr } from '@/lib/storage'
import { syncManager } from '@/lib/db/syncManager'

interface GemState {
  total: number
  records: GemRecord[]

  addGems: (amount: number, source: GemSource) => void
  getRecentRecords: (count?: number) => GemRecord[]
  /** 用 DB 数据覆盖本地状态 */
  hydrate: (data: { total: number; records: GemRecord[] }) => void
}

export const useGemStore = create<GemState>()(
  persist(
    (set, get) => ({
      total: 0,
      records: [],

      addGems: (amount: number, source: GemSource) => {
        const record: GemRecord = {
          amount,
          source,
          date: getTodayStr(),
        }
        set(state => ({
          total: state.total + amount,
          records: [record, ...state.records],
        }))
        // 记录待同步宝石
        syncManager.addPendingGem(record)
      },

      getRecentRecords: (count = 20) => {
        return get().records.slice(0, count)
      },

      hydrate: (data) => {
        set({ total: data.total, records: data.records })
      },
    }),
    {
      name: 'rainbow-gems',
    }
  )
)
