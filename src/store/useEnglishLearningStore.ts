import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EnglishQuestion, DailyProgress, AnswerResult } from '@/types'
import { getTodayStr } from '@/lib/storage'
import englishQuestionsData from '@/data/english-questions.json'

const ALL_ENGLISH_QUESTIONS = englishQuestionsData as unknown as EnglishQuestion[]
const DAILY_QUESTION_COUNT = 10
const MAX_DAY = 90

interface EnglishLearningState {
  dailyProgress: DailyProgress
  todayQuestions: EnglishQuestion[]
  currentIndex: number
  sessionAnswers: AnswerResult[]
  /** 当前学习进度天数 (1-90)，按顺序推进 */
  englishDayIndex: number

  startDailySession: () => void
  submitAnswer: (selectedIndex: number) => AnswerResult
  nextQuestion: () => void
  isCompleted: () => boolean
  getCurrentQuestion: () => EnglishQuestion | null
  resetIfNewDay: () => boolean
  /** 是否已完成全部 90 天 */
  isAllComplete: () => boolean
}

export const useEnglishLearningStore = create<EnglishLearningState>()(
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
      englishDayIndex: 1,

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

      startDailySession: () => {
        const { englishDayIndex } = get()
        const today = getTodayStr()

        // 按 day 序号取当日题目
        let dayQuestions = ALL_ENGLISH_QUESTIONS.filter(q => q.day === englishDayIndex)

        // 如果该天没有题目（可能超范围），取最后一天
        if (dayQuestions.length === 0) {
          dayQuestions = ALL_ENGLISH_QUESTIONS.filter(q => q.day === MAX_DAY)
        }

        const todayQuestions = dayQuestions.slice(0, DAILY_QUESTION_COUNT)

        set({
          todayQuestions,
          currentIndex: 0,
          sessionAnswers: [],
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
        const { currentIndex, todayQuestions, dailyProgress, englishDayIndex } = get()
        const nextIdx = currentIndex + 1
        if (nextIdx >= todayQuestions.length) {
          // 当天完成，推进到下一天
          const nextDay = Math.min(englishDayIndex + 1, MAX_DAY + 1)
          set({
            dailyProgress: { ...dailyProgress, completed: true },
            englishDayIndex: nextDay,
          })
        } else {
          set({ currentIndex: nextIdx })
        }
      },

      isCompleted: () => get().dailyProgress.completed,

      getCurrentQuestion: () => {
        const { todayQuestions, currentIndex } = get()
        return todayQuestions[currentIndex] ?? null
      },

      isAllComplete: () => get().englishDayIndex > MAX_DAY,
    }),
    {
      name: 'rainbow-english-progress',
      partialize: (state) => ({
        dailyProgress: state.dailyProgress,
        todayQuestions: state.todayQuestions,
        currentIndex: state.currentIndex,
        sessionAnswers: state.sessionAnswers,
        englishDayIndex: state.englishDayIndex,
      }),
    }
  )
)
