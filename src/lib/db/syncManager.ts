import { useLearningStore } from '@/store/useLearningStore'
import { useGemStore } from '@/store/useGemStore'
import { upsertDailyProgress } from './progressApi'
import { insertGemRecords, updateGemsTotal } from './gemApi'
import { upsertErrorRecords } from './errorBankApi'
import { updateUser } from './userApi'
import type { GemRecord, ErrorRecord } from '@/types'

/**
 * SyncManager - Session 粒度批量同步
 * 
 * 答题过程只写 localStorage（快）
 * 学习完成 / 页面隐藏时批量同步到 DB
 */
class SyncManager {
  private syncing = false
  private pendingSync = false
  /** 本次 session 新增的宝石记录（尚未同步到 DB） */
  private pendingGemRecords: GemRecord[] = []
  /** 本次 session 变动的错题（尚未同步到 DB） */
  private pendingErrorUpdates: Map<string, ErrorRecord> = new Map()

  /** 记录待同步的宝石 */
  addPendingGem(record: GemRecord) {
    this.pendingGemRecords.push(record)
  }

  /** 记录待同步的错题变动 */
  addPendingError(record: ErrorRecord) {
    this.pendingErrorUpdates.set(record.questionId, record)
  }

  /** 学习 Session 完成后调用 */
  async syncAfterSession() {
    if (this.syncing) {
      this.pendingSync = true
      return
    }

    this.syncing = true
    try {
      const learningState = useLearningStore.getState()
      const gemState = useGemStore.getState()

      // 并行执行所有同步操作
      const tasks: Promise<void>[] = []

      // 1. 同步每日进度
      if (learningState.dailyProgress.date) {
        tasks.push(
          upsertDailyProgress({
            date: learningState.dailyProgress.date,
            questions_done: learningState.dailyProgress.questionsDone,
            questions_correct: learningState.dailyProgress.questionsCorrect,
            completed: learningState.dailyProgress.completed,
            today_questions: learningState.todayQuestions.map(q => q.id),
            session_answers: learningState.sessionAnswers,
            recent_question_ids: learningState.recentQuestionIds,
            current_index: learningState.currentIndex,
          })
        )
      }

      // 2. 同步新增宝石记录
      if (this.pendingGemRecords.length > 0) {
        const records = [...this.pendingGemRecords]
        this.pendingGemRecords = []
        tasks.push(insertGemRecords(records))
        tasks.push(updateGemsTotal(gemState.total))
      }

      // 3. 同步错题变动
      if (this.pendingErrorUpdates.size > 0) {
        const errors = Array.from(this.pendingErrorUpdates.values())
        this.pendingErrorUpdates.clear()
        tasks.push(upsertErrorRecords(errors))
      }

      await Promise.all(tasks)
    } catch (error) {
      console.error('[SyncManager] Sync failed:', error)
      // 失败后数据仍在 localStorage，下次重试
    } finally {
      this.syncing = false
      if (this.pendingSync) {
        this.pendingSync = false
        this.syncAfterSession()
      }
    }
  }

  /** 即时同步用户信息变更 */
  async syncUserUpdate(updates: { name?: string; avatar?: string }) {
    try {
      await updateUser(updates)
    } catch (error) {
      console.error('[SyncManager] User sync failed:', error)
    }
  }
}

export const syncManager = new SyncManager()

/** 注册页面可见性监听 - 页面隐藏时触发同步 */
export function registerVisibilitySync() {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      syncManager.syncAfterSession()
    }
  })
}
