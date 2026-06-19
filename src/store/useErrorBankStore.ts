import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ErrorRecord } from '@/types'
import { getTodayStr, addDays } from '@/lib/storage'
import { syncManager } from '@/lib/db/syncManager'

/** mastery_level 对应的复习间隔天数 */
const REVIEW_INTERVALS: Record<number, number> = {
  0: 1,   // 次日复习
  1: 3,   // 3天后
  2: 7,   // 7天后
  3: 999, // 已掌握，不再复习
}

interface ErrorBankState {
  errors: Record<string, ErrorRecord>

  recordError: (questionId: string) => void
  recordCorrect: (questionId: string) => void
  getReviewQuestionIds: () => string[]
  getErrorCount: () => number
  getAllErrors: () => ErrorRecord[]
  /** 用 DB 数据覆盖本地状态 */
  hydrate: (errors: Record<string, ErrorRecord>) => void
}

export const useErrorBankStore = create<ErrorBankState>()(
  persist(
    (set, get) => ({
      errors: {},

      recordError: (questionId: string) => {
        const today = getTodayStr()
        const { errors } = get()
        const existing = errors[questionId]

        const updated: ErrorRecord = existing
          ? {
              ...existing,
              errorCount: existing.errorCount + 1,
              masteryLevel: Math.max(0, existing.masteryLevel - 1) as 0 | 1 | 2 | 3,
              lastAttempt: today,
              nextReviewDate: addDays(today, REVIEW_INTERVALS[0]),
            }
          : {
              questionId,
              errorCount: 1,
              correctCount: 0,
              masteryLevel: 0,
              lastAttempt: today,
              nextReviewDate: addDays(today, REVIEW_INTERVALS[0]),
            }

        set({ errors: { ...errors, [questionId]: updated } })
        syncManager.addPendingError(updated)
      },

      recordCorrect: (questionId: string) => {
        const today = getTodayStr()
        const { errors } = get()
        const existing = errors[questionId]

        if (!existing) return // 如果不在错题库中，无需处理

        const newLevel = Math.min(3, existing.masteryLevel + 1) as 0 | 1 | 2 | 3
        const updated: ErrorRecord = {
          ...existing,
          correctCount: existing.correctCount + 1,
          masteryLevel: newLevel,
          lastAttempt: today,
          nextReviewDate: addDays(today, REVIEW_INTERVALS[newLevel]),
        }

        set({ errors: { ...errors, [questionId]: updated } })
        syncManager.addPendingError(updated)
      },

      getReviewQuestionIds: () => {
        const today = getTodayStr()
        const { errors } = get()
        return Object.values(errors)
          .filter(e => e.masteryLevel < 3 && e.nextReviewDate <= today)
          .sort((a, b) => a.masteryLevel - b.masteryLevel) // 优先复习掌握度低的
          .map(e => e.questionId)
      },

      getErrorCount: () => {
        const { errors } = get()
        return Object.values(errors).filter(e => e.masteryLevel < 3).length
      },

      getAllErrors: () => {
        return Object.values(get().errors)
      },

      hydrate: (errors) => {
        set({ errors })
      },
    }),
    {
      name: 'rainbow-error-bank',
    }
  )
)
