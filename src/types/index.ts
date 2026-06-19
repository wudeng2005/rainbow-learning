/** 用户 */
export interface User {
  id: string
  name: string
  avatar: string // URL or emoji
}

/** 题型：看字选图 / 看图选字 */
export type QuestionType = 'char_to_pic' | 'pic_to_char'

/** 学科 */
export type Subject = 'chinese'

/** 宝石来源 */
export type GemSource = 'daily_complete' | 'perfect_score' | 'review_complete'

/** 题目 */
export interface Question {
  id: string
  subject: Subject
  level: number
  type: QuestionType
  /** 展示内容：char_to_pic 时为汉字，pic_to_char 时为 emoji */
  content: string
  /** 正确选项索引 0-2 */
  answer: number
  /** 3个选项 */
  options: string[]
  difficulty: number
}

/** 错题记录 */
export interface ErrorRecord {
  questionId: string
  errorCount: number
  correctCount: number
  masteryLevel: 0 | 1 | 2 | 3
  /** ISO date string: 下次复习日期 */
  nextReviewDate: string
  /** ISO date string: 最后一次作答 */
  lastAttempt: string
}

/** 宝石记录 */
export interface GemRecord {
  amount: number
  source: GemSource
  date: string
}

/** 每日进度 */
export interface DailyProgress {
  /** YYYY-MM-DD */
  date: string
  questionsDone: number
  questionsCorrect: number
  completed: boolean
}

/** 答题会话中的单题结果 */
export interface AnswerResult {
  questionId: string
  isCorrect: boolean
  selectedIndex: number
}
