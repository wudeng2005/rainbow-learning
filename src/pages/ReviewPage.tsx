import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useErrorBankStore } from '@/store/useErrorBankStore'
import { useGemStore } from '@/store/useGemStore'
import OptionCard from '@/components/OptionCard'
import ProgressBar from '@/components/ProgressBar'
import FeedbackOverlay from '@/components/FeedbackOverlay'
import { correctMessages, wrongMessages, reviewCompleteMessages, getRandomMessage } from '@/data/encouragements'
import { playCorrectSound, playWrongSound, playGemSound } from '@/lib/sounds'
import questionsData from '@/data/questions.json'
import type { Question } from '@/types'

const ALL_QUESTIONS = questionsData as Question[]

type OptionState = 'idle' | 'correct' | 'wrong' | 'disabled' | 'reveal'

export default function ReviewPage() {
  const { getReviewQuestionIds, recordCorrect, recordError, getErrorCount } = useErrorBankStore()
  const addGems = useGemStore(s => s.addGems)

  const [reviewQuestions, setReviewQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [optionStates, setOptionStates] = useState<OptionState[]>(['idle', 'idle', 'idle'])
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackCorrect, setFeedbackCorrect] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [correctAnswerText, setCorrectAnswerText] = useState<string | undefined>()
  const [isReviewComplete, setIsReviewComplete] = useState(false)
  const [isStarted, setIsStarted] = useState(false)

  const errorCount = getErrorCount()

  // 加载待复习的题目
  const loadReviewQuestions = useCallback(() => {
    const ids = getReviewQuestionIds()
    const questions = ids
      .map(id => ALL_QUESTIONS.find(q => q.id === id))
      .filter((q): q is Question => q !== undefined)
    setReviewQuestions(questions)
    setCurrentIndex(0)
    setIsReviewComplete(false)
  }, [getReviewQuestionIds])

  useEffect(() => {
    loadReviewQuestions()
  }, [loadReviewQuestions])

  const question = reviewQuestions[currentIndex]

  useEffect(() => {
    setOptionStates(['idle', 'idle', 'idle'])
  }, [currentIndex])

  const handleStart = () => {
    loadReviewQuestions()
    setIsStarted(true)
  }

  const handleSelectOption = useCallback((selectedIndex: number) => {
    if (!question) return

    const isCorrect = selectedIndex === question.answer

    const newStates: OptionState[] = question.options.map((_, i) => {
      if (i === selectedIndex && isCorrect) return 'correct'
      if (i === selectedIndex && !isCorrect) return 'wrong'
      if (i === question.answer && !isCorrect) return 'reveal'
      return 'disabled'
    })
    setOptionStates(newStates)

    if (isCorrect) {
      playCorrectSound()
      recordCorrect(question.id)
    } else {
      playWrongSound()
      recordError(question.id)
    }

    setFeedbackCorrect(isCorrect)
    setFeedbackMessage(
      isCorrect ? getRandomMessage(correctMessages) : getRandomMessage(wrongMessages)
    )
    setCorrectAnswerText(!isCorrect ? question.options[question.answer] : undefined)

    setTimeout(() => setShowFeedback(true), 400)
  }, [question, recordCorrect, recordError])

  const handleContinue = useCallback(() => {
    setShowFeedback(false)

    if (currentIndex >= reviewQuestions.length - 1) {
      // 复习完成
      addGems(1, 'review_complete')
      playGemSound()
      setIsReviewComplete(true)
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }, [currentIndex, reviewQuestions.length, addGems])

  // 复习完成界面
  if (isReviewComplete) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center text-center py-12"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <span className="text-6xl mb-4">🌟</span>
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          {getRandomMessage(reviewCompleteMessages)}
        </h2>
        <p className="text-text-secondary mb-4">获得 1 颗宝石奖励 💎</p>
        <button
          type="button"
          className="px-8 py-3 rounded-full bg-gradient-to-r from-rainbow-green to-rainbow-blue text-white font-bold min-h-[48px]"
          onClick={() => { setIsStarted(false); loadReviewQuestions() }}
        >
          完成
        </button>
      </motion.div>
    )
  }

  // 入口界面（未开始复习）
  if (!isStarted || reviewQuestions.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center text-center py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="text-6xl mb-4">🔄</span>
        <h2 className="text-2xl font-bold text-text-primary mb-2">错题复习</h2>

        {errorCount === 0 ? (
          <>
            <p className="text-text-secondary">没有需要复习的内容</p>
            <p className="text-text-secondary text-sm mt-1">你记得真好！🌟</p>
          </>
        ) : reviewQuestions.length === 0 ? (
          <>
            <p className="text-text-secondary">有 {errorCount} 个字还需要练习</p>
            <p className="text-text-secondary text-sm mt-1">不过今天不需要复习，明天再来看看~</p>
          </>
        ) : (
          <>
            <p className="text-text-secondary mb-4">
              有 {reviewQuestions.length} 道题等着你来挑战！
            </p>
            <motion.button
              type="button"
              className="px-8 py-3 rounded-full bg-gradient-to-r from-rainbow-purple to-rainbow-blue text-white font-bold text-lg min-h-[48px]"
              whileTap={{ scale: 0.96 }}
              onClick={handleStart}
            >
              开始复习 💪
            </motion.button>
          </>
        )}
      </motion.div>
    )
  }

  // 复习答题中
  if (!question) return null

  const isCharToEmo = question.type === 'char_to_pic'

  return (
    <div className="flex flex-col gap-6">
      <ProgressBar current={currentIndex + 1} total={reviewQuestions.length} />

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white rounded-3xl p-8 shadow-sm w-full text-center">
            <p className="text-xs text-rainbow-purple font-medium mb-2">复习</p>
            <p className="text-sm text-text-secondary mb-2">
              {isCharToEmo ? '这个字是什么？' : '哪个字是它？'}
            </p>
            <span className={isCharToEmo ? 'text-6xl md:text-7xl font-bold' : 'text-6xl md:text-7xl'}>
              {question.content}
            </span>
          </div>

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
