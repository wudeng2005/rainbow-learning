import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchUser, fetchDailyProgress, fetchGemRecords, fetchErrorBank } from '@/lib/db'
import { registerVisibilitySync } from '@/lib/db/syncManager'
import { useUserStore } from '@/store/useUserStore'
import { useLearningStore } from '@/store/useLearningStore'
import { useGemStore } from '@/store/useGemStore'
import { useErrorBankStore } from '@/store/useErrorBankStore'
import { useMathLearningStore } from '@/store/useMathLearningStore'
import { useEnglishLearningStore } from '@/store/useEnglishLearningStore'
import { getTodayStr } from '@/lib/storage'
import type { Question } from '@/types'
import questionsData from '@/data/questions.json'

const ALL_QUESTIONS = questionsData as Question[]
const MIGRATION_KEY = 'rainbow-migration-done'
const RESET_SKIP_KEY = 'rainbow-skip-hydrate-once'

/**
 * App 初始化 Hook
 * 
 * 优化策略：立即渲染（localStorage 数据已由 zustand persist 自动恢复），Supabase 后台同步
 */
export function useAppInit() {
  useEffect(() => {
    // 检查 URL 重置参数: ?reset=2025-07-12
    const params = new URLSearchParams(window.location.search)
    const resetDate = params.get('reset')
    if (resetDate && /^\d{4}-\d{2}-\d{2}$/.test(resetDate)) {
      performReset(resetDate)
      return
    }

    // 后台异步同步 Supabase，不阻塞渲染
    backgroundSync()
  }, [])

  // 立即就绪：Zustand persist 已从 localStorage 自动恢复状态
  return true
}

/** 后台同步：迁移 + 拉取云端数据 + 注册监听 */
async function backgroundSync() {
  // 重置后跳过一次 Supabase 同步，避免云端旧数据覆盖
  if (sessionStorage.getItem(RESET_SKIP_KEY)) {
    sessionStorage.removeItem(RESET_SKIP_KEY)
    registerVisibilitySync()
    return
  }

  try {
    await migrateLocalStorageToSupabase()
    await hydrateFromSupabase()
  } catch (error) {
    console.warn('[AppInit] Supabase sync failed, using local data:', error)
  } finally {
    registerVisibilitySync()
  }
}

/** 从 Supabase 拉取数据覆盖本地 */
async function hydrateFromSupabase() {
  const today = getTodayStr()

  const [user, progress, gems, errors] = await Promise.all([
    fetchUser(),
    fetchDailyProgress(today),
    fetchGemRecords(),
    fetchErrorBank(),
  ])

  // Hydrate stores
  if (user) {
    useUserStore.getState().hydrate({ name: user.name, avatar: user.avatar })
  }

  if (progress) {
    // 根据 question IDs 从本地 JSON 匹配完整题目对象
    const todayQuestions = (progress.today_questions || [])
      .map((id: string) => ALL_QUESTIONS.find(q => q.id === id))
      .filter((q): q is Question => q !== undefined)

    useLearningStore.getState().hydrate({
      dailyProgress: {
        date: progress.date,
        questionsDone: progress.questions_done,
        questionsCorrect: progress.questions_correct,
        completed: progress.completed,
      },
      todayQuestions,
      currentIndex: progress.current_index,
      sessionAnswers: progress.session_answers || [],
      chineseDayIndex: progress.chinese_day_index || 1,
    })
  }

  if (gems) {
    useGemStore.getState().hydrate({ total: gems.total, records: gems.records })
  }

  if (errors && Object.keys(errors).length > 0) {
    useErrorBankStore.getState().hydrate(errors)
  }
}

/** 一次性迁移 localStorage → Supabase（幂等） */
async function migrateLocalStorageToSupabase() {
  if (localStorage.getItem(MIGRATION_KEY)) return

  // 检查 Supabase 是否可连接
  const { error: pingErr } = await supabase.from('users').select('id').limit(1)
  if (pingErr) {
    console.warn('[Migration] Supabase unreachable, skip migration')
    return
  }

  const USER_ID = 'rainbow-001'

  try {
    // 读取 localStorage 原始数据
    const gemRaw = localStorage.getItem('rainbow-gems')
    const errorRaw = localStorage.getItem('rainbow-error-bank')
    const userRaw = localStorage.getItem('rainbow-user')
    const learningRaw = localStorage.getItem('rainbow-learning-progress')

    // 迁移用户信息 + 宝石总量
    const gemState = gemRaw ? JSON.parse(gemRaw)?.state : null
    const userState = userRaw ? JSON.parse(userRaw)?.state : null

    if (userState?.currentUser || gemState) {
      await supabase.from('users').upsert({
        id: USER_ID,
        name: userState?.currentUser?.name || 'Rainbow',
        avatar: userState?.currentUser?.avatar || '🧒🏻',
        gems_total: gemState?.total || 0,
      })
    }

    // 迁移宝石记录
    if (gemState?.records?.length) {
      const rows = gemState.records.map((r: { amount: number; source: string; date: string }) => ({
        user_id: USER_ID,
        amount: r.amount,
        source: r.source,
        date: r.date,
      }))
      await supabase.from('gem_records').insert(rows)
    }

    // 迁移错题本
    const errorState = errorRaw ? JSON.parse(errorRaw)?.state : null
    if (errorState?.errors) {
      const errorRecords = Object.values(errorState.errors) as Array<{
        questionId: string; errorCount: number; correctCount: number;
        masteryLevel: number; nextReviewDate: string; lastAttempt: string
      }>
      if (errorRecords.length > 0) {
        const rows = errorRecords.map(e => ({
          user_id: USER_ID,
          question_id: e.questionId,
          error_count: e.errorCount,
          correct_count: e.correctCount,
          mastery_level: e.masteryLevel,
          next_review_date: e.nextReviewDate,
          last_attempt: e.lastAttempt,
        }))
        await supabase.from('error_bank').upsert(rows, { onConflict: 'user_id,question_id' })
      }
    }

    // 迁移当日进度
    const learningState = learningRaw ? JSON.parse(learningRaw)?.state : null
    if (learningState?.dailyProgress?.date) {
      await supabase.from('daily_progress').upsert({
        user_id: USER_ID,
        date: learningState.dailyProgress.date,
        questions_done: learningState.dailyProgress.questionsDone || 0,
        questions_correct: learningState.dailyProgress.questionsCorrect || 0,
        completed: learningState.dailyProgress.completed || false,
        today_questions: (learningState.todayQuestions || []).map((q: { id: string }) => q.id),
        session_answers: learningState.sessionAnswers || [],
        chinese_day_index: learningState.chineseDayIndex || 1,
        current_index: learningState.currentIndex || 0,
      }, { onConflict: 'user_id,date' })
    }

    // 标记迁移完成
    localStorage.setItem(MIGRATION_KEY, new Date().toISOString())
    console.log('[Migration] Completed successfully')
  } catch (error) {
    console.error('[Migration] Failed:', error)
    // 失败不阻塞，下次重试
  }
}

/** 重置所有学习进度，将起始日期设为指定日期 */
function performReset(firstDay: string) {
  console.log(`[Reset] 重置所有数据，起始日期: ${firstDay}`)

  // 1. 设置起始日期
  localStorage.setItem('rainbow-first-day', firstDay)

  // 2. 重置汉字学习进度
  useLearningStore.setState({
    dailyProgress: { date: '', questionsDone: 0, questionsCorrect: 0, completed: false },
    todayQuestions: [],
    currentIndex: 0,
    sessionAnswers: [],
    chineseDayIndex: 1,
  })

  // 3. 重置数学学习进度
  useMathLearningStore.setState({
    dailyProgress: { date: '', questionsDone: 0, questionsCorrect: 0, completed: false },
    todayQuestions: [],
    currentIndex: 0,
    sessionAnswers: [],
    mathDayIndex: 1,
  })

  // 4. 重置英语学习进度
  useEnglishLearningStore.setState({
    dailyProgress: { date: '', questionsDone: 0, questionsCorrect: 0, completed: false },
    todayQuestions: [],
    currentIndex: 0,
    sessionAnswers: [],
    englishDayIndex: 1,
  })

  // 5. 重置宝石
  useGemStore.setState({ total: 0, records: [] })

  // 6. 重置错题本
  useErrorBankStore.setState({ errors: {} })

  // 7. 标记跳过下次 Supabase 同步
  sessionStorage.setItem(RESET_SKIP_KEY, '1')

  // 8. 清除 URL 参数并刷新
  window.history.replaceState({}, '', window.location.pathname)
  window.location.reload()
}
