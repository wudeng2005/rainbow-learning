/** 用户 */
export interface User {
  id: string
  name: string
  avatar: string // URL or emoji
}

/** 题型：看字选图 / 看图选字 / 看字选拼音 / 听音选字 / 组词选字 / 看字选义 */
export type QuestionType =
  | 'char_to_pic'
  | 'pic_to_char'
  | 'char_to_pinyin'
  | 'pinyin_to_char'
  | 'char_to_word'
  | 'char_to_meaning'

/** 数学题型 */
export type MathQuestionType = 'pattern' | 'counting' | 'comparison' | 'shape_recognition'

/** 学科 */
export type Subject = 'chinese' | 'math'

/** 宝石来源 */
export type GemSource = 'daily_complete' | 'perfect_score' | 'review_complete' | 'math_daily_complete' | 'math_perfect_score'

/** 找规律数据 */
export interface PatternData {
  type: 'pattern'
  sequence: string[]
}

/** 数一数数据 */
export interface CountingData {
  type: 'counting'
  emoji: string
  count: number
  layout: 'grid' | 'scattered'
}

/** 比大小数据 */
export interface ComparisonData {
  type: 'comparison'
  left: { emoji: string; count: number }
  right: { emoji: string; count: number }
}

/** 图形认知数据 */
export interface ShapeData {
  type: 'shape_recognition'
  items: string[]
  oddIndex: number
}

/** 数学题目 */
export interface MathQuestion {
  id: string
  subject: 'math'
  level: number
  type: MathQuestionType
  difficulty: number
  prompt: string
  data: PatternData | CountingData | ComparisonData | ShapeData
  answer: number
  options: string[]
}

/** 题目 */
export interface Question {
  id: string
  subject: Subject
  level: number
  type: QuestionType
  /** 所属天数 (1-90)，用于确定性顺序出题 */
  day: number
  /** 展示内容：char_to_pic 时为汉字，pic_to_char 时为 emoji，pinyin_to_char 时为拼音 */
  content: string
  /** 正确选项索引 0-2 */
  answer: number
  /** 3个选项 */
  options: string[]
  difficulty: number
  /** 听音选字时的音频路径（如 /audio/chars/花.mp3） */
  audio?: string | null
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

/** 数学每日进度 */
export interface MathDailyProgress {
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
