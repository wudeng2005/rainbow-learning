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
import { correctMessages, wrongMessages, getRandomMessage } from '@/data/encouragements'
import { playCorrectSound, playWrongSound, playGemSound } from '@/lib/sounds'

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

  const question = getCurrentQuestion()

  // 重置选项状态（题目切换时）
  useEffect(() => {
    setOptionStates(['idle', 'idle', 'idle'])
  }, [currentIndex])

  const handleSelectOption = useCallback((selectedIndex: number) => {
    if (!question) return

    const result = submitAnswer(selectedIndex)
    const isCorrect = result.isCorrect

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

    // 记录错题
    if (isCorrect) {
      recordCorrect(question.id)
    } else {
      recordError(question.id)
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
  }, [question, submitAnswer, recordCorrect, recordError])

  const handleContinue = useCallback(() => {
    setShowFeedback(false)

    // 检查是否是最后一题
    const isLast = currentIndex >= todayQuestions.length - 1

    if (isLast) {
      // 发放宝石
      const totalQ = todayQuestions.length
      let gems = 3 // 完成任务基础奖励
      if (dailyProgress.questionsCorrect === totalQ) {
        gems += 2 // 全对额外奖励
      }
      addGems(gems, dailyProgress.questionsCorrect === totalQ ? 'perfect_score' : 'daily_complete')
      playGemSound()
      setGemsEarned(gems)

      // 标记完成
      nextQuestion() // 这会设置 completed = true
      setTimeout(() => setIsSessionComplete(true), 100)
    } else {
      nextQuestion()
    }
  }, [currentIndex, todayQuestions.length, dailyProgress.questionsCorrect, feedbackCorrect, addGems, nextQuestion])

  // 已完成状态
  if (isSessionComplete || dailyProgress.completed) {
    return (
      <DailyComplete
        questionsCorrect={dailyProgress.questionsCorrect}
        totalQuestions={todayQuestions.length || 5}
        gemsEarned={gemsEarned}
      />
    )
  }

  // 加载中
  if (!question) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.span
          className="text-4xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          🌈
        </motion.span>
      </div>
    )
  }

  const isCharToEmo = question.type === 'char_to_pic'

  return (
    <div className="flex flex-col gap-6">
      {/* 顶部：进度 + 返回 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="text-2xl min-w-[44px] min-h-[44px] flex items-center justify-center"
          onClick={() => navigate('/')}
        >
          ←
        </button>
        <div className="flex-1">
          <ProgressBar current={currentIndex + 1} total={todayQuestions.length} />
        </div>
      </div>

      {/* 题目区域 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          {/* 题目内容 */}
          <div className="bg-white rounded-3xl p-8 shadow-sm w-full text-center">
            <p className="text-sm text-text-secondary mb-2">
              {isCharToEmo ? '这个字是什么？' : '哪个字是它？'}
            </p>
            <span className={isCharToEmo ? 'text-6xl md:text-7xl font-bold' : 'text-6xl md:text-7xl'}>
              {question.content}
            </span>
          </div>

          {/* 选项 */}
          <div className="grid grid-cols-3 gap-3 w-full md:gap-4">
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
          </div>
        </motion.div>
      </AnimatePresence>

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
