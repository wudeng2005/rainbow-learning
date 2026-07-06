import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Question, DailyProgress, AnswerResult } from '@/types'
import { getTodayStr } from '@/lib/storage'
import { syncManager } from '@/lib/db/syncManager'
import questionsData from '@/data/questions.json'

const ALL_QUESTIONS = questionsData as Question[]
const DAILY_QUESTION_COUNT = 10
const MAX_DAY = 90

interface LearningState {
  dailyProgress: DailyProgress
  todayQuestions: Question[]
  currentIndex: number
  sessionAnswers: AnswerResult[]
  /** 当前学习进度天数 (1-90)，按顺序推进 */
  chineseDayIndex: number

  // Actions
  startDailySession: (reviewQuestionIds?: string[]) => void
  submitAnswer: (selectedIndex: number) => AnswerResult
  nextQuestion: () => void
  isCompleted: () => boolean
  getCurrentQuestion: () => Question | null
  resetIfNewDay: () => boolean
  /** 是否已完成全部 90 天 */
  isAllComplete: () => boolean
  /** 用 DB 数据覆盖本地状态 */
  hydrate: (data: {
    dailyProgress: DailyProgress
    todayQuestions: Question[]
    currentIndex: number
    sessionAnswers: AnswerResult[]
    chineseDayIndex: number
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
      chineseDayIndex: 1,

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
        const { chineseDayIndex } = get()

        // 按 day 序号取当日题目
        let dayQuestions = ALL_QUESTIONS.filter(q => q.day === chineseDayIndex)

        // 如果题库中该天没有题目（可能超范围），取最后一天
        if (dayQuestions.length === 0 && chineseDayIndex <= MAX_DAY) {
          dayQuestions = ALL_QUESTIONS.filter(q => q.day === MAX_DAY)
        }

        // 插入错题复习（最多 2 题，从已做过的天中找）
        const reviewQuestions = reviewQuestionIds
          .slice(0, 2)
          .map(id => ALL_QUESTIONS.find(q => q.id === id))
          .filter((q): q is Question => q !== undefined)
          .filter(q => !dayQuestions.some(dq => dq.id === q.id))

        const todayQuestions = [...reviewQuestions, ...dayQuestions].slice(0, DAILY_QUESTION_COUNT)

        set({
          todayQuestions,
          currentIndex: 0,
          sessionAnswers: [],
          dailyProgress: {
            date: getTodayStr(),
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
        const { currentIndex, todayQuestions, dailyProgress, chineseDayIndex } = get()
        const nextIdx = currentIndex + 1
        if (nextIdx >= todayQuestions.length) {
          // 当天完成，推进到下一天
          const nextDay = Math.min(chineseDayIndex + 1, MAX_DAY + 1)
          set({
            dailyProgress: { ...dailyProgress, completed: true },
            chineseDayIndex: nextDay,
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

      isAllComplete: () => get().chineseDayIndex > MAX_DAY,

      hydrate: (data) => {
        set({
          dailyProgress: data.dailyProgress,
          todayQuestions: data.todayQuestions,
          currentIndex: data.currentIndex,
          sessionAnswers: data.sessionAnswers,
          chineseDayIndex: data.chineseDayIndex,
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
        chineseDayIndex: state.chineseDayIndex,
      }),
    }
  )
)
