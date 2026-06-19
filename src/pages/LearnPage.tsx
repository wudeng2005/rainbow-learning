import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLearningStore } from '@/store/useLearningStore'
import { useGemStore } from '@/store/useGemStore'
import { useErrorBankStore } from '@/store/useErrorBankStore'
import OptionCard from '@/components/OptionCard'
import ProgressBar from '@/components/ProgressBar'
import FeedbackOverlay from '@/components/FeedbackOverlay'
import DailyComplete from '@/components/DailyComplete'
import FloatingDecorations from '@/components/FloatingDecorations'
import { correctMessages, wrongMessages, getRandomMessage } from '@/data/encouragements'
import { playCorrectSound, playWrongSound, playGemSound } from '@/lib/sounds'
import type { Question } from '@/types'
import questionsData from '@/data/questions.json'

const ALL_QUESTIONS = questionsData as Question[]
const DAILY_QUESTION_COUNT = 5

type OptionState = 'idle' | 'correct' | 'wrong' | 'disabled' | 'reveal'

export default function LearnPage() {
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
  } = useLearningStore()

  const addGems = useGemStore(s => s.addGems)
  const { recordError, recordCorrect, getReviewQuestionIds } = useErrorBankStore()

  const [optionStates, setOptionStates] = useState<OptionState[]>(['idle', 'idle', 'idle'])
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackCorrect, setFeedbackCorrect] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [correctAnswerText, setCorrectAnswerText] = useState<string | undefined>()
  const [gemsEarned, setGemsEarned] = useState(0)
  const [isSessionComplete, setIsSessionComplete] = useState(false)
  // 练习模式：完成后再玩，不计分不记录
  const [isPracticeMode, setIsPracticeMode] = useState(false)
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([])
  const [practiceIndex, setPracticeIndex] = useState(0)
  const [practiceComplete, setPracticeComplete] = useState(false)

  // 初始化或恢复学习会话
  useEffect(() => {
    resetIfNewDay()

    if (dailyProgress.completed) {
      setIsSessionComplete(true)
      return
    }

    if (todayQuestions.length === 0) {
      const reviewIds = getReviewQuestionIds()
      startDailySession(reviewIds)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const question = isPracticeMode
    ? (practiceQuestions[practiceIndex] ?? null)
    : getCurrentQuestion()

  // 重置选项状态（题目切换时）
  useEffect(() => {
    setOptionStates(['idle', 'idle', 'idle'])
  }, [currentIndex, practiceIndex])

  const handleSelectOption = useCallback((selectedIndex: number) => {
    if (!question) return

    const isCorrect = selectedIndex === question.answer

    // 仅在正式模式下记录答题结果
    if (!isPracticeMode) {
      submitAnswer(selectedIndex)
    }

    // 更新选项状态
    const newStates: OptionState[] = question.options.map((_, i) => {
      if (i === selectedIndex && isCorrect) return 'correct'
      if (i === selectedIndex && !isCorrect) return 'wrong'
      if (i === question.answer && !isCorrect) return 'reveal'
      return 'disabled'
    })
    setOptionStates(newStates)

    // 播放音效
    if (isCorrect) {
      playCorrectSound()
    } else {
      playWrongSound()
    }

    // 仅在正式模式下记录错题
    if (!isPracticeMode) {
      if (isCorrect) {
        recordCorrect(question.id)
      } else {
        recordError(question.id)
      }
    }

    // 设置反馈信息
    setFeedbackCorrect(isCorrect)
    setFeedbackMessage(
      isCorrect
        ? getRandomMessage(correctMessages)
        : getRandomMessage(wrongMessages)
    )
    if (!isCorrect) {
      setCorrectAnswerText(question.options[question.answer])
    } else {
      setCorrectAnswerText(undefined)
    }

    // 延迟显示反馈浮层
    setTimeout(() => setShowFeedback(true), 400)
  }, [question, isPracticeMode, submitAnswer, recordCorrect, recordError])

  const handleContinue = useCallback(() => {
    setShowFeedback(false)

    if (isPracticeMode) {
      // 练习模式：简单推进，不计分
      const nextIdx = practiceIndex + 1
      if (nextIdx >= practiceQuestions.length) {
        setPracticeComplete(true)
      } else {
        setPracticeIndex(nextIdx)
      }
      return
    }

    // 正式模式
    const isLast = currentIndex >= todayQuestions.length - 1

    if (isLast) {
      // 发放宝石
      const totalQ = todayQuestions.length
      let gems = 3
      if (dailyProgress.questionsCorrect === totalQ) {
        gems += 2
      }
      addGems(gems, dailyProgress.questionsCorrect === totalQ ? 'perfect_score' : 'daily_complete')
      playGemSound()
      setGemsEarned(gems)

      nextQuestion()
      setTimeout(() => setIsSessionComplete(true), 100)
    } else {
      nextQuestion()
    }
  }, [isPracticeMode, practiceIndex, practiceQuestions.length, currentIndex, todayQuestions.length, dailyProgress.questionsCorrect, addGems, nextQuestion])

  // 开始练习模式
  const handlePlayAgain = useCallback(() => {
    // 从题库随机抽5题（不重复当次正式题目）
    const usedIds = todayQuestions.map(q => q.id)
    const available = ALL_QUESTIONS.filter(q => !usedIds.includes(q.id))
    const shuffled = [...available]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    const newQuestions = shuffled.slice(0, DAILY_QUESTION_COUNT)

    setIsPracticeMode(true)
    setPracticeQuestions(newQuestions)
    setPracticeIndex(0)
    setPracticeComplete(false)
    setIsSessionComplete(false)
  }, [todayQuestions])

  // 练习完成
  if (isPracticeMode && practiceComplete) {
    return (
      <DailyComplete
        questionsCorrect={0}
        totalQuestions={practiceQuestions.length}
        gemsEarned={0}
        isPractice
        onPlayAgain={handlePlayAgain}
      />
    )
  }

  // 已完成状态（正式）— 练习模式下不拦截
  if (!isPracticeMode && (isSessionComplete || dailyProgress.completed)) {
    return (
      <DailyComplete
        questionsCorrect={dailyProgress.questionsCorrect}
        totalQuestions={todayQuestions.length || 5}
        gemsEarned={gemsEarned}
        onPlayAgain={handlePlayAgain}
      />
    )
  }

  // 加载中
  if (!question) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-b from-sky-100 via-purple-50 to-pink-50">
        <motion.span
          className="text-5xl"
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        >
          🌈
        </motion.span>
      </div>
    )
  }

  const isCharToEmo = question.type === 'char_to_pic'

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-b from-sky-100 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* 漂浮装饰 */}
      <FloatingDecorations />

      {/* 顶部栏：返回 + 进度星星 */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-2 safe-top">
        <motion.button
          type="button"
          className="w-11 h-11 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-xl"
          onClick={() => navigate('/')}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
        >
          ←
        </motion.button>
        <div className="flex-1">
          <ProgressBar
            current={(isPracticeMode ? practiceIndex : currentIndex) + 1}
            total={isPracticeMode ? practiceQuestions.length : todayQuestions.length}
          />
        </div>
        {/* 练习模式标签 */}
        {isPracticeMode && (
          <span className="px-3 py-1 rounded-full bg-rainbow-purple/20 text-rainbow-purple text-xs font-bold">
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
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {/* 题目气泡区域 */}
            <div className="w-full text-center">
              {/* 提示文字 */}
              <motion.p
                className="text-base md:text-lg text-purple-600 font-bold mb-3"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {isCharToEmo ? '🤔 这个字是什么？' : '🧐 哪个字是它？'}
              </motion.p>

              {/* 题目内容卡片 */}
              <motion.div
                className="relative inline-block bg-white rounded-[2rem] px-10 py-8 shadow-xl border-2 border-purple-100"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.15 }}
              >
                {/* 装饰角标 */}
                <span className="absolute -top-3 -left-3 text-2xl animate-float-fast">✨</span>
                <span className="absolute -top-2 -right-3 text-xl animate-float-medium">🌟</span>
                
                <span className={`block ${
                  isCharToEmo 
                    ? 'text-7xl md:text-8xl font-bold text-text-primary' 
                    : 'text-7xl md:text-8xl'
                }`}>
                  {question.content}
                </span>
              </motion.div>
            </div>

            {/* 选项区域 */}
            <motion.div
              className="grid grid-cols-3 gap-4 w-full mt-4"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.3 }}
            >
              {question.options.map((option, index) => (
                <OptionCard
                  key={`${question.id}-${index}`}
                  option={option}
                  index={index}
                  state={optionStates[index]}
                  isCharOption={!isCharToEmo}
                  onSelect={() => handleSelectOption(index)}
                />
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 答题反馈浮层 */}
      <FeedbackOverlay
        isVisible={showFeedback}
        isCorrect={feedbackCorrect}
        message={feedbackMessage}
        correctAnswer={correctAnswerText}
        onContinue={handleContinue}
      />
    </div>
  )
}
