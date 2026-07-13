import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useErrorBankStore } from '@/store/useErrorBankStore'
import { useGemStore } from '@/store/useGemStore'
import OptionCard from '@/components/OptionCard'
import ProgressBar from '@/components/ProgressBar'
import FeedbackOverlay from '@/components/FeedbackOverlay'
import EnglishOptionCard from '@/components/english/EnglishOptionCard'
import AudioButton from '@/components/english/AudioButton'
import PatternRenderer from '@/components/math/PatternRenderer'
import CountingRenderer from '@/components/math/CountingRenderer'
import ComparisonRenderer from '@/components/math/ComparisonRenderer'
import ShapeRenderer from '@/components/math/ShapeRenderer'
import ArithmeticRenderer from '@/components/math/ArithmeticRenderer'
import WordProblemRenderer from '@/components/math/WordProblemRenderer'
import NumberSequenceRenderer from '@/components/math/NumberSequenceRenderer'
import MathFeedbackOverlay from '@/components/math/MathFeedbackOverlay'
import { correctMessages, wrongMessages, reviewCompleteMessages, getRandomMessage } from '@/data/encouragements'
import { playCorrectSound, playWrongSound, playGemSound, speakEnglish } from '@/lib/sounds'
import questionsData from '@/data/questions.json'
import englishQuestionsData from '@/data/english-questions.json'
import mathQuestionsData from '@/data/math-questions.json'
import type {
  Question, EnglishQuestion, MathQuestion,
  PatternData, CountingData, ComparisonData, ShapeData,
  ArithmeticData, WordProblemData, NumberSequenceData,
} from '@/types'

const ALL_CHINESE = questionsData as Question[]
const ALL_ENGLISH = englishQuestionsData as unknown as EnglishQuestion[]
const ALL_MATH = mathQuestionsData as MathQuestion[]

type ReviewQuestion = Question | EnglishQuestion | MathQuestion
type OptionState = 'idle' | 'correct' | 'wrong' | 'disabled' | 'reveal'

function isChinese(q: ReviewQuestion): q is Question { return q.id.startsWith('ch_') }
function isEnglish(q: ReviewQuestion): q is EnglishQuestion { return q.id.startsWith('e_') }
function isMath(q: ReviewQuestion): q is MathQuestion { return q.id.startsWith('m_') }

const ENGLISH_AUTO_PLAY = ['listen_pic', 'phonics', 'listen_sentence']

function renderMathQuestion(q: MathQuestion, states: OptionState[], onSelect: (i: number) => void) {
  const s = states as any
  switch (q.data.type) {
    case 'pattern':
      return <PatternRenderer data={q.data as PatternData} options={q.options} optionStates={s} onSelect={onSelect} />
    case 'counting':
      return <CountingRenderer data={q.data as CountingData} options={q.options} optionStates={s} onSelect={onSelect} />
    case 'comparison':
      return <ComparisonRenderer data={q.data as ComparisonData} options={q.options} optionStates={s} onSelect={onSelect} />
    case 'shape_recognition':
      return <ShapeRenderer data={q.data as ShapeData} optionStates={s} onSelect={onSelect} />
    case 'addition':
    case 'subtraction':
      return <ArithmeticRenderer data={q.data as ArithmeticData} options={q.options} optionStates={s} onSelect={onSelect} />
    case 'word_problem':
      return <WordProblemRenderer data={q.data as WordProblemData} options={q.options} optionStates={s} onSelect={onSelect} />
    case 'number_sequence':
      return <NumberSequenceRenderer data={q.data as NumberSequenceData} options={q.options} optionStates={s} onSelect={onSelect} />
    default:
      return null
  }
}

export default function ReviewPage() {
  const navigate = useNavigate()
  const { getReviewQuestionIds, recordCorrect, recordError, getAllErrors } = useErrorBankStore()
  const addGems = useGemStore(s => s.addGems)

  const [reviewQuestions, setReviewQuestions] = useState<ReviewQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [optionStates, setOptionStates] = useState<OptionState[]>(['idle', 'idle', 'idle', 'idle'])
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackCorrect, setFeedbackCorrect] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [correctAnswerText, setCorrectAnswerText] = useState<string | undefined>()
  const [isComplete, setIsComplete] = useState(false)
  const [isStarted, setIsStarted] = useState(false)

  const allErrors = getAllErrors()
  const totalErrors = allErrors.filter(e => e.masteryLevel < 3).length
  const cnErrors = allErrors.filter(e => e.masteryLevel < 3 && e.questionId.startsWith('ch_')).length
  const mathErrors = allErrors.filter(e => e.masteryLevel < 3 && e.questionId.startsWith('m_')).length
  const enErrors = allErrors.filter(e => e.masteryLevel < 3 && e.questionId.startsWith('e_')).length

  const loadReview = useCallback(() => {
    const ids = getReviewQuestionIds()
    const questions = ids
      .map(id => ALL_CHINESE.find(q => q.id === id) ?? ALL_ENGLISH.find(q => q.id === id) ?? ALL_MATH.find(q => q.id === id))
      .filter((q): q is ReviewQuestion => q !== undefined)
    setReviewQuestions(questions)
    setCurrentIndex(0)
    setIsComplete(false)
  }, [getReviewQuestionIds])

  useEffect(() => { loadReview() }, [loadReview])

  const question = reviewQuestions[currentIndex]

  // 切题时重置状态 + 英语自动播放
  useEffect(() => {
    setOptionStates(['idle', 'idle', 'idle', 'idle'])
    const q = reviewQuestions[currentIndex]
    if (q && isEnglish(q) && ENGLISH_AUTO_PLAY.includes(q.type)) {
      const timer = setTimeout(() => speakEnglish(q.content, q.audio), 300)
      return () => clearTimeout(timer)
    }
  }, [currentIndex, reviewQuestions])

  const handleSelect = useCallback((selectedIndex: number) => {
    if (!question) return
    const correct = selectedIndex === question.answer
    const newStates: OptionState[] = question.options.map((_, i) => {
      if (i === selectedIndex && correct) return 'correct'
      if (i === selectedIndex && !correct) return 'wrong'
      if (i === question.answer && !correct) return 'reveal'
      return 'disabled'
    })
    setOptionStates(newStates)

    if (correct) { playCorrectSound(); recordCorrect(question.id) }
    else { playWrongSound(); recordError(question.id) }

    setFeedbackCorrect(correct)
    setFeedbackMessage(correct ? getRandomMessage(correctMessages) : getRandomMessage(wrongMessages))
    setCorrectAnswerText(!correct ? question.options[question.answer] : undefined)
    setTimeout(() => setShowFeedback(true), 400)
  }, [question, recordCorrect, recordError])

  const handleContinue = useCallback(() => {
    setShowFeedback(false)
    if (currentIndex >= reviewQuestions.length - 1) {
      addGems(1, 'review_complete')
      playGemSound()
      setIsComplete(true)
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }, [currentIndex, reviewQuestions.length, addGems])

  // ─── 完成界面 ───
  if (isComplete) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-gradient-to-b from-violet-100 via-purple-50 to-pink-50 px-6">
        <motion.div className="text-center" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <motion.span className="text-7xl block mb-4" animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}>🏆</motion.span>
          <h2 className="text-2xl font-bold text-text-primary mb-2">{getRandomMessage(reviewCompleteMessages)}</h2>
          <p className="text-text-secondary mb-6">获得 1 颗宝石奖励 💎</p>
          <div className="flex flex-col gap-3 w-full max-w-[240px] mx-auto">
            <motion.button className="px-8 py-4 rounded-full bg-gradient-to-r from-violet-400 to-purple-500 text-white font-bold text-lg shadow-lg"
              whileTap={{ scale: 0.95 }} onClick={() => { setIsStarted(false); loadReview() }}>
              再练一轮
            </motion.button>
            <motion.button className="px-8 py-3 rounded-full bg-white/80 text-text-secondary font-medium shadow-sm"
              whileTap={{ scale: 0.95 }} onClick={() => navigate('/')}>
              回到首页
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ─── 入口界面 ───
  if (!isStarted || reviewQuestions.length === 0) {
    return (
      <div className="min-h-dvh flex flex-col bg-gradient-to-b from-violet-100 via-purple-50 to-pink-50 relative overflow-hidden">
        {/* 漂浮装饰 */}
        <motion.span className="absolute top-16 left-6 text-4xl opacity-20 pointer-events-none"
          animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity }}>🐉</motion.span>
        <motion.span className="absolute top-40 right-8 text-3xl opacity-15 pointer-events-none"
          animate={{ y: [0, 8, 0], rotate: [0, -8, 0] }} transition={{ duration: 3.5, repeat: Infinity }}>⚔️</motion.span>
        <motion.span className="absolute bottom-32 left-10 text-3xl opacity-15 pointer-events-none"
          animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity }}>🛡️</motion.span>

        {/* 顶部栏 */}
        <div className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-2 safe-top">
          <motion.button className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-xl touch-manipulation"
            onClick={() => navigate('/')} whileTap={{ scale: 0.9 }}>←</motion.button>
          <h1 className="text-lg font-bold text-violet-700">错题大冒险</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
          <motion.div className="text-center mb-8" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <motion.span className="text-7xl block mb-3"
              animate={{ y: [0, -8, 0], rotate: [0, -5, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}>🐉</motion.span>
            <h2 className="text-xl font-bold text-violet-700">错题大冒险</h2>
            <p className="text-sm text-violet-400 mt-1">打败遗忘小怪兽！</p>
          </motion.div>

          {totalErrors === 0 ? (
            /* 无错题 */
            <motion.div className="bg-white rounded-3xl p-8 shadow-md text-center max-w-[300px]"
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              <span className="text-5xl block mb-3">🌟</span>
              <p className="text-lg font-bold text-text-primary mb-1">太棒了！</p>
              <p className="text-sm text-text-secondary">小怪兽都被打跑啦，继续保持！</p>
            </motion.div>
          ) : reviewQuestions.length === 0 ? (
            /* 有错题但今天不用复习 */
            <motion.div className="bg-white rounded-3xl p-6 shadow-md text-center max-w-[320px] flex flex-col gap-4"
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              <span className="text-5xl">😴</span>
              <div>
                <p className="font-bold text-text-primary">今天的小怪兽在休息~</p>
                <p className="text-sm text-text-secondary mt-1">有 {totalErrors} 只怪兽，但今天不用复习</p>
              </div>
              <p className="text-xs text-violet-400">明天再来挑战吧！</p>
            </motion.div>
          ) : (
            /* 有题可复习 */
            <motion.div className="w-full max-w-[320px] flex flex-col gap-4"
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              {/* 统计卡片 */}
              <div className="bg-white rounded-3xl p-5 shadow-md">
                <p className="text-center text-sm text-text-secondary mb-3">
                  今天有 <span className="text-violet-600 font-bold text-lg">{reviewQuestions.length}</span> 道题等你挑战！
                </p>
                <div className="flex justify-center gap-3">
                  {cnErrors > 0 && (
                    <div className="bg-emerald-50 rounded-xl px-3 py-2 text-center min-w-[70px]">
                      <p className="text-lg font-bold text-emerald-600">{cnErrors}</p>
                      <p className="text-xs text-emerald-400">汉字</p>
                    </div>
                  )}
                  {mathErrors > 0 && (
                    <div className="bg-purple-50 rounded-xl px-3 py-2 text-center min-w-[70px]">
                      <p className="text-lg font-bold text-purple-600">{mathErrors}</p>
                      <p className="text-xs text-purple-400">数学</p>
                    </div>
                  )}
                  {enErrors > 0 && (
                    <div className="bg-sky-50 rounded-xl px-3 py-2 text-center min-w-[70px]">
                      <p className="text-lg font-bold text-sky-600">{enErrors}</p>
                      <p className="text-xs text-sky-400">英语</p>
                    </div>
                  )}
                </div>
              </div>

              <motion.button className="w-full px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-400 via-purple-500 to-fuchsia-400 text-white font-extrabold text-lg shadow-lg"
                whileTap={{ scale: 0.95 }}
                animate={{ boxShadow: ['0 8px 20px rgba(139,92,246,0.3)', '0 8px 30px rgba(139,92,246,0.5)', '0 8px 20px rgba(139,92,246,0.3)'] }}
                transition={{ boxShadow: { duration: 2, repeat: Infinity } }}
                onClick={() => { loadReview(); setIsStarted(true) }}>
                ⚔️ 开始冒险！
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    )
  }

  // ─── 答题中 ───
  if (!question) return null

  const chinese = isChinese(question) ? question : null
  const english = isEnglish(question) ? question : null
  const math = isMath(question) ? question : null
  const isCharToEmo = chinese?.type === 'char_to_pic'

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-b from-violet-100 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* 顶部栏 */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-2 safe-top">
        <motion.button className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-xl touch-manipulation"
          onClick={() => navigate('/')} whileTap={{ scale: 0.9 }}>←</motion.button>
        <div className="flex-1">
          <ProgressBar current={currentIndex + 1} total={reviewQuestions.length} />
        </div>
        <span className="px-3 py-1 rounded-full bg-violet-200/60 text-violet-600 text-xs font-bold">复习</span>
      </div>

      {/* 主内容区 */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            className="flex flex-col items-center gap-6 w-full max-w-md"
            initial={{ opacity: 0, x: 30, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* ═══ 英语题 ═══ */}
            {english && (
              <>
                <motion.p className="text-base md:text-lg text-sky-600 font-bold"
                  initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                  🔄 {english.prompt}
                </motion.p>
                <div className="bg-white rounded-3xl p-6 shadow-sm w-full text-center flex flex-col items-center gap-3">
                  {english.type === 'pic_word' ? (
                    <span className="text-6xl md:text-7xl">{english.pic ?? '❓'}</span>
                  ) : (
                    <AudioButton size="md" hint="点我听一听" onPlay={() => speakEnglish(english.content, english.audio)} />
                  )}
                </div>
                <div className={english.type === 'pic_word' ? 'flex flex-col gap-3 w-full max-w-[300px]' : 'grid grid-cols-3 gap-3 w-full'}>
                  {english.options.map((opt, i) => (
                    <EnglishOptionCard key={i} option={opt} index={i} state={optionStates[i]}
                      variant={english.type === 'phonics' ? 'letter' : english.type === 'pic_word' ? 'word' : 'emoji'}
                      onSelect={() => handleSelect(i)} />
                  ))}
                </div>
              </>
            )}

            {/* ═══ 汉字题 ═══ */}
            {chinese && (
              <>
                <motion.p className="text-base md:text-lg text-emerald-600 font-bold"
                  initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                  🔄 {isCharToEmo ? '这个字是什么？' : '哪个字是它？'}
                </motion.p>
                <div className="bg-white rounded-3xl p-8 shadow-sm w-full text-center">
                  <span className="text-6xl md:text-7xl font-bold">{chinese.content}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 w-full md:gap-4">
                  {chinese.options.map((opt, i) => (
                    <OptionCard key={i} option={opt} index={i} state={optionStates[i]}
                      isCharOption={!isCharToEmo} onSelect={() => handleSelect(i)} />
                  ))}
                </div>
              </>
            )}

            {/* ═══ 数学题 ═══ */}
            {math && (
              <>
                <motion.p className="text-base md:text-lg text-purple-600 font-bold"
                  initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                  🔄 {math.prompt}
                </motion.p>
                {renderMathQuestion(math, optionStates, handleSelect)}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 反馈浮层 — 数学用数学版，其他用通用版 */}
      {math ? (
        <MathFeedbackOverlay isVisible={showFeedback} isCorrect={feedbackCorrect}
          message={feedbackMessage} correctAnswer={correctAnswerText} onContinue={handleContinue} />
      ) : (
        <FeedbackOverlay isVisible={showFeedback} isCorrect={feedbackCorrect}
          message={feedbackMessage} correctAnswer={correctAnswerText} onContinue={handleContinue} />
      )}
    </div>
  )
}
