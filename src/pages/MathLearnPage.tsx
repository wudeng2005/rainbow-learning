import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useMathLearningStore } from '@/store/useMathLearningStore'
import { useGemStore } from '@/store/useGemStore'
import { useErrorBankStore } from '@/store/useErrorBankStore'
import MathProgressBar from '@/components/math/MathProgressBar'
import MathFeedbackOverlay from '@/components/math/MathFeedbackOverlay'
import MathDailyComplete from '@/components/math/MathDailyComplete'
import MathFloatingDecorations from '@/components/math/MathFloatingDecorations'
import PatternRenderer from '@/components/math/PatternRenderer'
import CountingRenderer from '@/components/math/CountingRenderer'
import ComparisonRenderer from '@/components/math/ComparisonRenderer'
import ShapeRenderer from '@/components/math/ShapeRenderer'
import ArithmeticRenderer from '@/components/math/ArithmeticRenderer'
import WordProblemRenderer from '@/components/math/WordProblemRenderer'
import NumberSequenceRenderer from '@/components/math/NumberSequenceRenderer'
import {
  mathCorrectMessages,
  mathWrongMessages,
  getRandomMathMessage,
} from '@/data/math-encouragements'
import { playCorrectSound, playWrongSound, playGemSound, stopAllAudio } from '@/lib/sounds'
import type { MathQuestion, PatternData, CountingData, ComparisonData, ShapeData, ArithmeticData, WordProblemData, NumberSequenceData } from '@/types'
import mathQuestionsData from '@/data/math-questions.json'

const ALL_MATH_QUESTIONS = mathQuestionsData as unknown as MathQuestion[]

type OptionState = 'idle' | 'correct' | 'wrong' | 'disabled' | 'reveal'

export default function MathLearnPage() {
  const navigate = useNavigate()
  const {
    dailyProgress,
    todayQuestions,
    currentIndex,
    startDailySession,
    submitAnswer,
    nextQuestion,
    resetIfNewDay,
    getCurrentQuestion,
  } = useMathLearningStore()

  const addGems = useGemStore(s => s.addGems)
  const { recordError, recordCorrect } = useErrorBankStore()

  const [optionStates, setOptionStates] = useState<OptionState[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackCorrect, setFeedbackCorrect] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [correctAnswerText, setCorrectAnswerText] = useState<string | undefined>()
  const [gemsEarned, setGemsEarned] = useState(0)
  const [isSessionComplete, setIsSessionComplete] = useState(false)
  const [isPracticeMode, setIsPracticeMode] = useState(false)
  const [practiceQuestions, setPracticeQuestions] = useState<MathQuestion[]>([])
  const [practiceIndex, setPracticeIndex] = useState(0)
  const [practiceComplete, setPracticeComplete] = useState(false)

  // 初始化会话
  useEffect(() => {
    resetIfNewDay()

    if (dailyProgress.completed) {
      setIsSessionComplete(true)
      return
    }

    if (todayQuestions.length === 0) {
      startDailySession()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const question = isPracticeMode
    ? (practiceQuestions[practiceIndex] ?? null)
    : getCurrentQuestion()

  // 切题时重置选项状态
  useEffect(() => {
    if (question) {
      const count = getOptionCount(question)
      setOptionStates(Array(count).fill('idle'))
    }
  }, [currentIndex, practiceIndex, question?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectOption = useCallback((selectedIndex: number) => {
    if (!question) return
    // 防止重复点击
    if (optionStates.some(s => s !== 'idle')) return

    const isCorrect = selectedIndex === question.answer

    if (!isPracticeMode) {
      submitAnswer(selectedIndex)
    }

    // 更新选项状态
    const count = getOptionCount(question)
    const newStates: OptionState[] = Array.from({ length: count }, (_, i) => {
      if (i === selectedIndex && isCorrect) return 'correct'
      if (i === selectedIndex && !isCorrect) return 'wrong'
      if (i === question.answer && !isCorrect) return 'reveal'
      return 'disabled'
    })
    setOptionStates(newStates)

    // 音效
    if (isCorrect) {
      playCorrectSound()
    } else {
      playWrongSound()
    }

    // 错题记录
    if (!isPracticeMode) {
      if (isCorrect) {
        recordCorrect(question.id)
      } else {
        recordError(question.id)
      }
    }

    // 反馈信息
    setFeedbackCorrect(isCorrect)
    setFeedbackMessage(
      isCorrect
        ? getRandomMathMessage(mathCorrectMessages)
        : getRandomMathMessage(mathWrongMessages)
    )
    if (!isCorrect) {
      setCorrectAnswerText(question.options[question.answer])
    } else {
      setCorrectAnswerText(undefined)
    }

    setTimeout(() => setShowFeedback(true), 150)
  }, [question, isPracticeMode, submitAnswer, recordCorrect, recordError, optionStates])

  const handleContinue = useCallback(() => {
    stopAllAudio()
    setShowFeedback(false)

    if (isPracticeMode) {
      const nextIdx = practiceIndex + 1
      if (nextIdx >= practiceQuestions.length) {
        setPracticeComplete(true)
      } else {
        setPracticeIndex(nextIdx)
      }
      return
    }

    const isLast = currentIndex >= todayQuestions.length - 1

    if (isLast) {
      const totalQ = todayQuestions.length
      let gems = 3
      if (dailyProgress.questionsCorrect === totalQ) {
        gems += 2
      }
      addGems(gems, dailyProgress.questionsCorrect === totalQ ? 'math_perfect_score' : 'math_daily_complete')
      playGemSound()
      setGemsEarned(gems)

      nextQuestion()
      setTimeout(() => setIsSessionComplete(true), 100)
    } else {
      nextQuestion()
    }
  }, [isPracticeMode, practiceIndex, practiceQuestions.length, currentIndex, todayQuestions.length, dailyProgress.questionsCorrect, addGems, nextQuestion])

  // 练习模式
  const handlePlayAgain = useCallback(() => {
    const usedIds = todayQuestions.map(q => q.id)
    const available = ALL_MATH_QUESTIONS.filter(q => !usedIds.includes(q.id))
    const shuffled = [...available]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    const newQuestions = shuffled.slice(0, 10)

    setIsPracticeMode(true)
    setPracticeQuestions(newQuestions)
    setPracticeIndex(0)
    setPracticeComplete(false)
    setIsSessionComplete(false)
  }, [todayQuestions])

  // 练习完成
  if (isPracticeMode && practiceComplete) {
    return (
      <MathDailyComplete
        questionsCorrect={0}
        totalQuestions={practiceQuestions.length}
        gemsEarned={0}
        isPractice
        onPlayAgain={handlePlayAgain}
      />
    )
  }

  // 正式完成
  if (!isPracticeMode && (isSessionComplete || dailyProgress.completed)) {
    return (
      <MathDailyComplete
        questionsCorrect={dailyProgress.questionsCorrect}
        totalQuestions={todayQuestions.length || 10}
        gemsEarned={gemsEarned}
        onPlayAgain={handlePlayAgain}
      />
    )
  }

  // 加载中
  if (!question) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-b from-pink-100 via-rose-50 to-emerald-50">
        <motion.span
          className="text-5xl"
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        >
          🍭
        </motion.span>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-b from-pink-100 via-rose-50 to-emerald-50 relative overflow-hidden">
      {/* 漂浮糖果装饰 */}
      <MathFloatingDecorations />

      {/* 顶部栏 */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-2 safe-top">
        <motion.button
          type="button"
          className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-xl touch-manipulation"
          onClick={() => navigate('/')}
          whileTap={{ scale: 0.9 }}
        >
          ←
        </motion.button>
        <div className="flex-1">
          <MathProgressBar
            current={(isPracticeMode ? practiceIndex : currentIndex) + 1}
            total={isPracticeMode ? practiceQuestions.length : todayQuestions.length}
          />
        </div>
        {isPracticeMode && (
          <span className="px-3 py-1 rounded-full bg-pink-200/60 text-pink-600 text-xs font-bold">
            练习
          </span>
        )}
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
            {/* 提示文字 */}
            <motion.p
              className="text-base md:text-lg text-pink-600 font-bold"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {getPromptEmoji(question)} {question.prompt}
            </motion.p>

            {/* 根据题型渲染 */}
            {renderQuestion(question, optionStates, handleSelectOption)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 反馈浮层 */}
      <MathFeedbackOverlay
        isVisible={showFeedback}
        isCorrect={feedbackCorrect}
        message={feedbackMessage}
        correctAnswer={correctAnswerText}
        onContinue={handleContinue}
      />
    </div>
  )
}

/* ─── Helpers ─── */

function getOptionCount(question: MathQuestion): number {
  if (question.data.type === 'comparison') return 2
  if (question.data.type === 'shape_recognition') return (question.data as ShapeData).items.length
  return question.options.length
}

function getPromptEmoji(question: MathQuestion): string {
  switch (question.data.type) {
    case 'pattern': return '🤔'
    case 'counting': return '👀'
    case 'comparison': return '⚖️'
    case 'shape_recognition': return '🔍'
    case 'addition': return '➕'
    case 'subtraction': return '➖'
    case 'word_problem': return '📖'
    case 'number_sequence': return '🔢'
    default: return '🍭'
  }
}

function renderQuestion(
  question: MathQuestion,
  optionStates: OptionState[],
  onSelect: (index: number) => void
) {
  switch (question.data.type) {
    case 'pattern':
      return (
        <PatternRenderer
          data={question.data as PatternData}
          options={question.options}
          optionStates={optionStates as ('idle' | 'correct' | 'wrong' | 'disabled' | 'reveal')[]}
          onSelect={onSelect}
        />
      )
    case 'counting':
      return (
        <CountingRenderer
          data={question.data as CountingData}
          options={question.options}
          optionStates={optionStates as ('idle' | 'correct' | 'wrong' | 'disabled' | 'reveal')[]}
          onSelect={onSelect}
        />
      )
    case 'comparison':
      return (
        <ComparisonRenderer
          data={question.data as ComparisonData}
          options={question.options}
          optionStates={optionStates as ('idle' | 'correct' | 'wrong' | 'disabled' | 'reveal')[]}
          onSelect={onSelect}
        />
      )
    case 'shape_recognition':
      return (
        <ShapeRenderer
          data={question.data as ShapeData}
          optionStates={optionStates as ('idle' | 'correct' | 'wrong' | 'disabled')[]}
          onSelect={onSelect}
        />
      )
    case 'addition':
    case 'subtraction':
      return (
        <ArithmeticRenderer
          data={question.data as ArithmeticData}
          options={question.options}
          optionStates={optionStates as ('idle' | 'correct' | 'wrong' | 'disabled' | 'reveal')[]}
          onSelect={onSelect}
        />
      )
    case 'word_problem':
      return (
        <WordProblemRenderer
          data={question.data as WordProblemData}
          options={question.options}
          optionStates={optionStates as ('idle' | 'correct' | 'wrong' | 'disabled' | 'reveal')[]}
          onSelect={onSelect}
        />
      )
    case 'number_sequence':
      return (
        <NumberSequenceRenderer
          data={question.data as NumberSequenceData}
          options={question.options}
          optionStates={optionStates as ('idle' | 'correct' | 'wrong' | 'disabled' | 'reveal')[]}
          onSelect={onSelect}
        />
      )
    default:
      return null
  }
}
