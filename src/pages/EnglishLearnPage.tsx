import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useEnglishLearningStore } from '@/store/useEnglishLearningStore'
import { useGemStore } from '@/store/useGemStore'
import { useErrorBankStore } from '@/store/useErrorBankStore'
import EnglishProgressBar from '@/components/english/EnglishProgressBar'
import EnglishFeedbackOverlay from '@/components/english/EnglishFeedbackOverlay'
import EnglishDailyComplete from '@/components/english/EnglishDailyComplete'
import EnglishFloatingDecorations from '@/components/english/EnglishFloatingDecorations'
import ListenPicRenderer from '@/components/english/ListenPicRenderer'
import PicWordRenderer from '@/components/english/PicWordRenderer'
import PhonicsRenderer from '@/components/english/PhonicsRenderer'
import ListenSentenceRenderer from '@/components/english/ListenSentenceRenderer'
import {
  englishCorrectMessages,
  englishWrongMessages,
  getRandomEnglishMessage,
} from '@/data/english-encouragements'
import { playCorrectSound, playWrongSound, playGemSound, speakEnglish, stopAllAudio } from '@/lib/sounds'
import type { EnglishQuestion } from '@/types'
import englishQuestionsData from '@/data/english-questions.json'

const ALL_ENGLISH_QUESTIONS = englishQuestionsData as unknown as EnglishQuestion[]

type OptionState = 'idle' | 'correct' | 'wrong' | 'disabled' | 'reveal'

/** 需要在进入时自动播放发音的题型（听力类 + 拼读） */
const AUTO_PLAY_TYPES = ['listen_pic', 'phonics', 'listen_sentence']

export default function EnglishLearnPage() {
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
  } = useEnglishLearningStore()

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
  const [practiceQuestions, setPracticeQuestions] = useState<EnglishQuestion[]>([])
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

  const playQuestionAudio = useCallback(() => {
    if (question) {
      speakEnglish(question.content, question.audio)
    }
  }, [question])

  // 切题时重置选项状态 + 听力类自动播放发音
  useEffect(() => {
    if (question) {
      setOptionStates(Array(question.options.length).fill('idle'))
      if (AUTO_PLAY_TYPES.includes(question.type)) {
        const timer = setTimeout(() => {
          speakEnglish(question.content, question.audio)
        }, 300)
        return () => clearTimeout(timer)
      }
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
    const count = question.options.length
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
        ? getRandomEnglishMessage(englishCorrectMessages)
        : getRandomEnglishMessage(englishWrongMessages)
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
      addGems(gems, dailyProgress.questionsCorrect === totalQ ? 'english_perfect_score' : 'english_daily_complete')
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
    const available = ALL_ENGLISH_QUESTIONS.filter(q => !usedIds.includes(q.id))
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
      <EnglishDailyComplete
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
      <EnglishDailyComplete
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
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-sky-100 via-cyan-50 to-blue-50">
        <motion.span
          className="text-6xl"
          animate={{ y: [0, -8, 0], rotate: [0, -8, 8, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          🦜
        </motion.span>
        <motion.p
          className="text-sm text-sky-600 font-display"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          鹦鹉船长正在准备...
        </motion.p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-b from-sky-100 via-cyan-50 to-blue-50 relative overflow-hidden">
      {/* 漂浮装饰 */}
      <EnglishFloatingDecorations />

      {/* 顶部栏 */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-2 safe-top">
        <motion.button
          type="button"
          className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-xl touch-manipulation border-2 border-white"
          onClick={() => navigate('/')}
          whileTap={{ scale: 0.9 }}
        >
          ←
        </motion.button>
        <div className="flex-1">
          <EnglishProgressBar
            current={(isPracticeMode ? practiceIndex : currentIndex) + 1}
            total={isPracticeMode ? practiceQuestions.length : todayQuestions.length}
          />
        </div>
        {isPracticeMode && (
          <span className="px-3 py-1 rounded-full bg-sky-200/60 text-sky-600 text-xs font-bold border border-sky-300/50">
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
            {/* 鹦鹉船长 + 提示气泡 */}
            <div className="flex items-end gap-2 w-full">
              <motion.span
                className="text-4xl shrink-0"
                animate={{ y: [0, -4, 0], rotate: [0, -5, 5, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                🦜
              </motion.span>
              <motion.div
                className="relative bg-white rounded-2xl rounded-bl-md px-4 py-2.5 shadow-md border-2 border-sky-100"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
              >
                <p className="text-sm md:text-base text-sky-600 font-bold">
                  {getPromptEmoji(question.type)} {question.prompt}
                </p>
              </motion.div>
            </div>

            {/* 根据题型渲染 */}
            {renderQuestion(question, optionStates, handleSelectOption, playQuestionAudio)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 反馈浮层 */}
      <EnglishFeedbackOverlay
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

function getPromptEmoji(type: EnglishQuestion['type']): string {
  switch (type) {
    case 'listen_pic': return '🎧'
    case 'pic_word': return '👀'
    case 'phonics': return '🔤'
    case 'listen_sentence': return '💬'
    default: return '🦜'
  }
}

function renderQuestion(
  question: EnglishQuestion,
  optionStates: OptionState[],
  onSelect: (index: number) => void,
  onReplay: () => void
) {
  const props = { question, optionStates, onSelect, onReplay }
  switch (question.type) {
    case 'listen_pic':
      return <ListenPicRenderer {...props} />
    case 'pic_word':
      return <PicWordRenderer {...props} />
    case 'phonics':
      return <PhonicsRenderer {...props} />
    case 'listen_sentence':
      return <ListenSentenceRenderer {...props} />
    default:
      return null
  }
}
