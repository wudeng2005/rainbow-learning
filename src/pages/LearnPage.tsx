import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLearningStore } from '@/store/useLearningStore'
import { useGemStore } from '@/store/useGemStore'
import { useErrorBankStore } from '@/store/useErrorBankStore'
import ProgressBar from '@/components/ProgressBar'
import FeedbackOverlay from '@/components/FeedbackOverlay'
import DailyComplete from '@/components/DailyComplete'
import FloatingDecorations from '@/components/FloatingDecorations'
import StoryPlayer from '@/components/chinese/StoryPlayer'
import CharacterTeach from '@/components/chinese/CharacterTeach'
import { correctMessages, wrongMessages, getRandomMessage } from '@/data/encouragements'
import { playCorrectSound, playWrongSound, playGemSound, stopAllAudio } from '@/lib/sounds'
import type { Question, QuestionType, Story, CharacterInfo } from '@/types'
import questionsData from '@/data/questions.json'
import storiesData from '@/data/stories.json'
import characterInfoData from '@/data/character-info.json'

const ALL_QUESTIONS = questionsData as Question[]
const ALL_STORIES = storiesData as Story[]
const CHARACTER_INFO = characterInfoData as Record<string, CharacterInfo>
const DAILY_QUESTION_COUNT = 10

type LearnPhase = 'story' | 'teach' | 'practice' | 'complete'

type OptionState = 'idle' | 'correct' | 'wrong' | 'disabled' | 'reveal'

/** 根据题型返回提示文字 */
function getPromptText(type: QuestionType): string {
  switch (type) {
    case 'char_to_pic': return '🤔 这个字是什么？'
    case 'pic_to_char': return '🧐 哪个字是它？'
    case 'char_to_pinyin': return '🗣️ 这个字怎么读？'
    case 'pinyin_to_char': return '👂 听一听，选对应的字'
    case 'char_to_word': return '✏️ 哪个字填进去最合适？'
    case 'char_to_meaning': return '💡 这个字是什么意思？'
    default: return '🤔 选一个答案吧'
  }
}

/** 判断选项是否为纯文字（非 emoji） */
function isTextOption(type: QuestionType): boolean {
  return type !== 'char_to_pic'
}

/** 播放汉字读音音频 */
function playCharAudio(audioPath: string | null | undefined) {
  if (!audioPath) return
  try {
    const audio = new Audio(audioPath)
    audio.volume = 0.85
    audio.play().catch(() => {})
  } catch {
    // 静默处理
  }
}

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
    isAllComplete,
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

  // 三段式学习流程状态
  const [learnPhase, setLearnPhase] = useState<LearnPhase>('practice')
  const [todayStory, setTodayStory] = useState<Story | null>(null)

  // 初始化或恢复学习会话
  useEffect(() => {
    resetIfNewDay()

    if (dailyProgress.completed) {
      setIsSessionComplete(true)
      setLearnPhase('complete')
      return
    }

    if (todayQuestions.length === 0) {
      const reviewIds = getReviewQuestionIds()
      startDailySession(reviewIds)
    }

    // 检查当天是否有故事数据
    const currentDay = useLearningStore.getState().chineseDayIndex
    const story = ALL_STORIES.find(s => s.day === currentDay)
    if (story && !dailyProgress.completed) {
      setTodayStory(story)
      setLearnPhase('story')
    } else {
      setLearnPhase('practice')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 故事完成 → 进入认字阶段
  const handleStoryComplete = () => {
    setLearnPhase('teach')
  }

  // 认字完成 → 进入练习阶段
  const handleTeachComplete = () => {
    setLearnPhase('practice')
  }

  const question = isPracticeMode
    ? (practiceQuestions[practiceIndex] ?? null)
    : getCurrentQuestion()

  // 重置选项状态 + 自动播放音频（题目切换时）
  useEffect(() => {
    setOptionStates(['idle', 'idle', 'idle'])
    // pinyin_to_char 题型自动播放音频
    if (question?.type === 'pinyin_to_char' && question.audio) {
      setTimeout(() => playCharAudio(question.audio), 300)
    }
  }, [currentIndex, practiceIndex, question?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectOption = useCallback((selectedIndex: number) => {
    if (!question) return
    // 防止重复点击
    if (optionStates.some(s => s !== 'idle')) return

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

    // 快速显示反馈浮层
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

  // 90 天全部完成
  if (!isPracticeMode && isAllComplete()) {
    return (
      <DailyComplete
        questionsCorrect={dailyProgress.questionsCorrect}
        totalQuestions={todayQuestions.length || 10}
        gemsEarned={0}
        onPlayAgain={handlePlayAgain}
      />
    )
  }

  // 故事阶段
  if (learnPhase === 'story' && todayStory) {
    return <StoryPlayer story={todayStory} onComplete={handleStoryComplete} />
  }

  // 认字阶段
  if (learnPhase === 'teach' && todayStory) {
    return (
      <CharacterTeach
        characters={todayStory.newCharacters}
        characterData={CHARACTER_INFO}
        onComplete={handleTeachComplete}
      />
    )
  }

  // 已完成状态（正式）— 练习模式下不拦截
  if (!isPracticeMode && (isSessionComplete || dailyProgress.completed)) {
    return (
      <DailyComplete
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
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50">
        <motion.span
          className="text-6xl"
          animate={{ rotate: [0, -8, 8, 0], y: [0, -5, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          🐼
        </motion.span>
        <motion.p
          className="text-sm text-amber-600 font-display"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          熊猫老师正在准备题目...
        </motion.p>
      </div>
    )
  }

  const qType = question.type
  const isTextOpt = isTextOption(qType)
  const promptText = getPromptText(qType)

  // 内容区域渲染
  const renderContent = () => {
    switch (qType) {
      case 'char_to_pic':
      case 'char_to_pinyin':
      case 'char_to_meaning':
        // 上方大字展示汉字
        return (
          <span className="block text-7xl md:text-8xl font-bold text-text-primary">
            {question.content}
          </span>
        )

      case 'pic_to_char':
        // 展示 emoji
        return (
          <span className="block text-7xl md:text-8xl">
            {question.content}
          </span>
        )

      case 'pinyin_to_char':
        // 展示拼音 + 播放音频按钮
        return (
          <div className="flex flex-col items-center gap-3">
            <span className="block text-5xl md:text-6xl font-bold text-rainbow-orange">
              {question.content}
            </span>
            {question.audio && (
              <motion.button
                type="button"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-50 border-2 border-orange-200 text-orange-600 font-bold text-sm transition-colors"
                onClick={() => playCharAudio(question.audio)}
                whileTap={{ scale: 0.9 }}
              >
                🔊 再听一次
              </motion.button>
            )}
          </div>
        )

      case 'char_to_word':
        // 展示 "（ ）+ 词语" 格式
        return (
          <span className="block text-4xl md:text-5xl font-bold text-text-primary leading-relaxed">
            {question.content}
          </span>
        )

      default:
        return (
          <span className="block text-5xl md:text-6xl">{question.content}</span>
        )
    }
  }

  // 选项样式：根据内容长度决定大小
  const getOptionTextStyle = (option: string): string => {
    // 拼音选项（包含声调符号的拉丁字母）
    if (/^[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+$/i.test(option)) {
      return 'text-3xl md:text-4xl font-bold'
    }
    // 含义描述（较长的文字）
    if (option.length > 4) {
      return 'text-xl md:text-2xl font-medium leading-tight'
    }
    // 汉字选项
    if (isTextOpt) {
      return 'text-4xl md:text-5xl font-bold'
    }
    // emoji 选项
    return 'text-5xl md:text-6xl'
  }

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* 漂浮装饰 */}
      <FloatingDecorations />

      {/* 顶部栏：返回 + 进度 */}
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
          <ProgressBar
            current={(isPracticeMode ? practiceIndex : currentIndex) + 1}
            total={isPracticeMode ? practiceQuestions.length : todayQuestions.length}
          />
        </div>
        {/* 练习模式标签 */}
        {isPracticeMode && (
          <span className="px-3 py-1 rounded-full bg-rainbow-orange/20 text-rainbow-orange text-xs font-bold border border-rainbow-orange/30">
            练习
          </span>
        )}
      </div>

      {/* 主内容区 */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            className="flex flex-col items-center gap-5 w-full max-w-md"
            initial={{ opacity: 0, x: 30, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* 熊猫陡伴 + 提示气泡 */}
            <div className="flex items-end gap-2 w-full">
              <motion.span
                className="text-4xl shrink-0"
                animate={{ y: [0, -4, 0], rotate: [0, -3, 3, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                🐼
              </motion.span>
              <motion.div
                className="relative bg-white rounded-2xl rounded-bl-md px-4 py-2.5 shadow-md border-2 border-orange-100"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
              >
                <p className="text-sm md:text-base text-amber-700 font-bold">
                  {promptText}
                </p>
              </motion.div>
            </div>

            {/* 题目内容卡片：玩具质感 */}
            <motion.div
              className="relative w-full bg-white rounded-[2rem] px-6 py-8 text-center border-[3px] border-orange-100 toy-shadow"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.12 }}
            >
              {/* 装饰角标 */}
              <span className="absolute -top-3 -left-2 text-xl animate-float-fast select-none">🍃</span>
              <span className="absolute -top-2 -right-2 text-lg animate-float-medium select-none">✨</span>

              {renderContent()}
            </motion.div>

            {/* 选项区域：糖果色卡片 */}
            <motion.div
              className={`grid gap-3 w-full ${
                question.options.length > 3 ? 'grid-cols-2' : 'grid-cols-3'
              }`}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.22, duration: 0.3 }}
            >
              {question.options.map((option, index) => (
                <motion.button
                  key={`${question.id}-${index}`}
                  type="button"
                  className={`relative rounded-3xl p-3 md:p-4 min-h-[76px] md:min-h-[84px] flex items-center justify-center
                    border-[3px] transition-all duration-200 cursor-pointer select-none touch-manipulation
                    ${optionStates[index] === 'idle'
                      ? `${['bg-orange-50 border-orange-200 active:border-orange-400','bg-emerald-50 border-emerald-200 active:border-emerald-400','bg-sky-50 border-sky-200 active:border-sky-400','bg-violet-50 border-violet-200 active:border-violet-400'][index % 4]} shadow-[0_4px_0_rgba(74,59,92,0.1)] active:shadow-none active:translate-y-1`
                      : optionStates[index] === 'correct'
                        ? 'bg-emerald-100 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                        : optionStates[index] === 'wrong'
                          ? 'bg-purple-50 border-purple-300 shadow-md'
                          : optionStates[index] === 'reveal'
                            ? 'bg-emerald-50 border-emerald-300 border-dashed'
                            : 'bg-gray-50 border-gray-200 opacity-50'
                    }`}
                  onClick={optionStates[index] === 'idle' ? () => handleSelectOption(index) : undefined}
                  animate={
                    optionStates[index] === 'correct' ? { scale: 1.06, y: -4 } :
                    optionStates[index] === 'wrong' ? { x: [0, -4, 4, -2, 2, 0], scale: 1 } :
                    optionStates[index] === 'disabled' ? { scale: 0.97, opacity: 0.5 } :
                    { scale: 1, y: 0 }
                  }
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  whileTap={optionStates[index] === 'idle' ? { scale: 0.93 } : undefined}
                  disabled={optionStates[index] !== 'idle'}
                >
                  {optionStates[index] === 'correct' && (
                    <>
                      <motion.span
                        className="absolute -top-2 -right-2 text-xl"
                        initial={{ scale: 0, rotate: 0 }}
                        animate={{ scale: 1, rotate: 20 }}
                        transition={{ delay: 0.1 }}
                      >⭐</motion.span>
                      <motion.span
                        className="absolute -bottom-1 -left-1 text-lg"
                        initial={{ scale: 0, rotate: 0 }}
                        animate={{ scale: 1, rotate: -15 }}
                        transition={{ delay: 0.2 }}
                      >✨</motion.span>
                    </>
                  )}
                  <span className={getOptionTextStyle(option)}>
                    {option}
                  </span>
                </motion.button>
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
