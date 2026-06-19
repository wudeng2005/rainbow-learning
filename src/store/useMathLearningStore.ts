import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MathQuestion, MathDailyProgress, AnswerResult } from '@/types'
import { getTodayStr } from '@/lib/storage'
import mathQuestionsData from '@/data/math-questions.json'

const ALL_MATH_QUESTIONS = mathQuestionsData as unknown as MathQuestion[]
const DAILY_QUESTION_COUNT = 5

interface MathLearningState {
  dailyProgress: MathDailyProgress
  todayQuestions: MathQuestion[]
  currentIndex: number
  sessionAnswers: AnswerResult[]
  recentQuestionIds: string[]

  startDailySession: () => void
  submitAnswer: (selectedIndex: number) => AnswerResult
  nextQuestion: () => void
  isCompleted: () => boolean
  getCurrentQuestion: () => MathQuestion | null
  resetIfNewDay: () => boolean
}

export const useMathLearningStore = create<MathLearningState>()(
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

      startDailySession: () => {
        const { recentQuestionIds } = get()
        const today = getTodayStr()

        // 从题库中筛选未做过的题
        const available = ALL_MATH_QUESTIONS.filter(
          q => !recentQuestionIds.includes(q.id)
        )

        // Fisher-Yates 洗牌
        const shuffled = [...available]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }

        // 尽量保证4种题型都有覆盖
        const types: string[] = ['pattern', 'counting', 'comparison', 'shape_recognition']
        const picked: MathQuestion[] = []
        for (const t of types) {
          const q = shuffled.find(q => q.type === t && !picked.includes(q))
          if (q) picked.push(q)
        }
        // 补齐到5题
        for (const q of shuffled) {
          if (picked.length >= DAILY_QUESTION_COUNT) break
          if (!picked.includes(q)) picked.push(q)
        }

        // 打乱顺序
        for (let i = picked.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [picked[i], picked[j]] = [picked[j], picked[i]]
        }

        const newRecentIds = [...recentQuestionIds, ...picked.map(q => q.id)].slice(-15)

        set({
          todayQuestions: picked,
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
        } else {
          set({ currentIndex: nextIdx })
        }
      },

      isCompleted: () => get().dailyProgress.completed,

      getCurrentQuestion: () => {
        const { todayQuestions, currentIndex } = get()
        return todayQuestions[currentIndex] ?? null
      },
    }),
    {
      name: 'rainbow-math-progress',
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
