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
export type MathQuestionType =
  | 'pattern'
  | 'counting'
  | 'comparison'
  | 'shape_recognition'
  | 'addition'
  | 'subtraction'
  | 'word_problem'
  | 'number_sequence'

/** 学科 */
export type Subject = 'chinese' | 'math' | 'english'

/** 英语题型：听音选图 / 看图选词 / 自然拼读 / 听句选图 */
export type EnglishQuestionType =
  | 'listen_pic'
  | 'pic_word'
  | 'phonics'
  | 'listen_sentence'

/** 宝石来源 */
export type GemSource =
  | 'daily_complete'
  | 'perfect_score'
  | 'review_complete'
  | 'math_daily_complete'
  | 'math_perfect_score'
  | 'english_daily_complete'
  | 'english_perfect_score'

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

/** 加减法运算数据（加减法共用） */
export interface ArithmeticData {
  type: 'addition' | 'subtraction'
  left: number
  right: number
  /** 图形辅助 emoji */
  emoji: string
}

/** 应用题（情境）数据 */
export interface WordProblemData {
  type: 'word_problem'
  /** 情境图示 emoji */
  emoji: string
  /** 初始数量 */
  start: number
  /** 变化数量 */
  change: number
  /** 运算方向 */
  op: 'add' | 'subtract'
}

/** 数字推理数据 */
export interface NumberSequenceData {
  type: 'number_sequence'
  /** 数字序列，null 表示待填空位 */
  sequence: (number | null)[]
}

/** 数学题目 */
export interface MathQuestion {
  id: string
  subject: 'math'
  level: number
  type: MathQuestionType
  difficulty: number
  prompt: string
  /** 所属天数 (1-90)，用于确定性顺序出题 */
  day: number
  data:
    | PatternData
    | CountingData
    | ComparisonData
    | ShapeData
    | ArithmeticData
    | WordProblemData
    | NumberSequenceData
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

/** 英语题目 */
export interface EnglishQuestion {
  id: string
  subject: 'english'
  level: number
  type: EnglishQuestionType
  difficulty: number
  /** 所属天数 (1-90)，用于确定性顺序出题 */
  day: number
  /** 中文引导语，如"听一听，选出小狗" */
  prompt: string
  /** 核心文本：单词/字母/句子，如 'dog' */
  content: string
  /** 看图选词题的题干 emoji（仅 pic_word 题型） */
  pic?: string
  /** 发音音频路径，如 /audio/en/words/dog.mp3 */
  audio: string
  /** 3个选项：emoji 图片 或 英文单词/字母 */
  options: string[]
  /** 正确选项索引 0-2 */
  answer: number
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

/** 故事句子 */
export interface StorySentence {
  text: string
  /** 本句引入的新字 */
  newChars: string[]
  /** 场景 emoji（用作插图占位） */
  scene: string
}

/** 故事课文 */
export interface Story {
  id: string
  /** 对应天数 (1-90) */
  day: number
  title: string
  /** 封面 emoji */
  coverEmoji: string
  sentences: StorySentence[]
  /** 本课新字列表（所有 sentences 中 newChars 的并集） */
  newCharacters: string[]
}

/** 汉字信息（拼音/含义/组词/emoji） */
export interface CharacterInfo {
  pinyin: string
  meaning: string
  words: string[]
  emoji: string | null
}
