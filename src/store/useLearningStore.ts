import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Question, DailyProgress, AnswerResult } from '@/types'
import { getTodayStr } from '@/lib/storage'
import { syncManager } from '@/lib/db/syncManager'
import questionsData from '@/data/questions.json'

const ALL_QUESTIONS = questionsData as Question[]
const DAILY_QUESTION_COUNT = 5

interface LearningState {
  dailyProgress: DailyProgress
  todayQuestions: Question[]
  currentIndex: number
  sessionAnswers: AnswerResult[]
  /** 已经做过的题目ID（近3天），避免重复 */
  recentQuestionIds: string[]

  // Actions
  startDailySession: (reviewQuestionIds?: string[]) => void
  submitAnswer: (selectedIndex: number) => AnswerResult
  nextQuestion: () => void
  isCompleted: () => boolean
  getCurrentQuestion: () => Question | null
  resetIfNewDay: () => boolean
  /** 用 DB 数据覆盖本地状态 */
  hydrate: (data: {
    dailyProgress: DailyProgress
    todayQuestions: Question[]
    currentIndex: number
    sessionAnswers: AnswerResult[]
    recentQuestionIds: string[]
  }) => void
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      dailyProgress: {
        date: '',
        questionsDone: 0,
        questionsCorrect: 0,
        completed: false,
      },
      todayQuestions: [],
      currentIndex: 0,
      sessionAnswers: [],
      recentQuestionIds: [],

      resetIfNewDay: () => {
        const today = getTodayStr()
        const { dailyProgress } = get()
        if (dailyProgress.date !== today) {
          set({
            dailyProgress: {
              date: today,
              questionsDone: 0,
              questionsCorrect: 0,
              completed: false,
            },
            todayQuestions: [],
            currentIndex: 0,
            sessionAnswers: [],
          })
          return true
        }
        return false
      },

      startDailySession: (reviewQuestionIds: string[] = []) => {
        const { recentQuestionIds } = get()
        const today = getTodayStr()

        // 优先填入错题复习（最多2题）
        const reviewQuestions = reviewQuestionIds
          .slice(0, 2)
          .map(id => ALL_QUESTIONS.find(q => q.id === id))
          .filter((q): q is Question => q !== undefined)

        // 剩余从题库随机抽取
        const remainCount = DAILY_QUESTION_COUNT - reviewQuestions.length
        const availableQuestions = ALL_QUESTIONS.filter(
          q => !reviewQuestionIds.includes(q.id) && !recentQuestionIds.includes(q.id)
        )

        // Fisher-Yates 洗牌
        const shuffled = [...availableQuestions]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        const newQuestions = shuffled.slice(0, remainCount)

        const todayQuestions = [...reviewQuestions, ...newQuestions]
        // 打乱顺序
        for (let i = todayQuestions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [todayQuestions[i], todayQuestions[j]] = [todayQuestions[j], todayQuestions[i]]
        }

        // 更新近期做过的题
        const newRecentIds = [...recentQuestionIds, ...todayQuestions.map(q => q.id)]
          .slice(-15) // 保留最近15题

        set({
          todayQuestions,
          currentIndex: 0,
          sessionAnswers: [],
          recentQuestionIds: newRecentIds,
          dailyProgress: {
            date: today,
            questionsDone: 0,
            questionsCorrect: 0,
            completed: false,
          },
        })
      },

      submitAnswer: (selectedIndex: number) => {
        const { todayQuestions, currentIndex, sessionAnswers, dailyProgress } = get()
        const question = todayQuestions[currentIndex]
        const isCorrect = selectedIndex === question.answer

        const result: AnswerResult = {
          questionId: question.id,
          isCorrect,
          selectedIndex,
        }

        set({
          sessionAnswers: [...sessionAnswers, result],
          dailyProgress: {
            ...dailyProgress,
            questionsDone: dailyProgress.questionsDone + 1,
            questionsCorrect: dailyProgress.questionsCorrect + (isCorrect ? 1 : 0),
          },
        })

        return result
      },

      nextQuestion: () => {
        const { currentIndex, todayQuestions, dailyProgress } = get()
        const nextIdx = currentIndex + 1
        if (nextIdx >= todayQuestions.length) {
          set({
            dailyProgress: { ...dailyProgress, completed: true },
          })
          // 学习完成，触发批量同步
          syncManager.syncAfterSession()
        } else {
          set({ currentIndex: nextIdx })
        }
      },

      isCompleted: () => get().dailyProgress.completed,

      getCurrentQuestion: () => {
        const { todayQuestions, currentIndex } = get()
        return todayQuestions[currentIndex] ?? null
      },

      hydrate: (data) => {
        set({
          dailyProgress: data.dailyProgress,
          todayQuestions: data.todayQuestions,
          currentIndex: data.currentIndex,
          sessionAnswers: data.sessionAnswers,
          recentQuestionIds: data.recentQuestionIds,
        })
      },
    }),
    {
      name: 'rainbow-learning-progress',
      partialize: (state) => ({
        dailyProgress: state.dailyProgress,
        todayQuestions: state.todayQuestions,
        currentIndex: state.currentIndex,
        sessionAnswers: state.sessionAnswers,
        recentQuestionIds: state.recentQuestionIds,
      }),
    }
  )
)
