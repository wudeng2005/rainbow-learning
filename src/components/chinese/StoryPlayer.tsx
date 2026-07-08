import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Story } from '@/types'
import { playStoryAudio } from '@/lib/sounds'

interface StoryPlayerProps {
  story: Story
  onComplete: () => void
}

/** 渲染句子文本，新字金色高亮 */
function HighlightedSentence({ text, newChars }: { text: string; newChars: string[] }) {
  if (newChars.length === 0) {
    return <span className="text-3xl md:text-4xl font-bold text-text-primary leading-relaxed">{text}</span>
  }

  // 按新字拆分句子，新字用金色高亮
  const regex = new RegExp(`(${newChars.map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g')
  const parts = text.split(regex)

  return (
    <span className="text-3xl md:text-4xl font-bold leading-relaxed">
      {parts.map((part, i) => {
        const isNewChar = newChars.includes(part)
        return isNewChar ? (
          <motion.span
            key={i}
            className="inline-block text-amber-500 relative"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {part}
            <motion.span
              className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-amber-400"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            />
          </motion.span>
        ) : (
          <span key={i} className="text-text-primary">{part}</span>
        )
      })}
    </span>
  )
}

export default function StoryPlayer({ story, onComplete }: StoryPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasPlayedCurrent, setHasPlayedCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const autoPlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sentence = story.sentences[currentIndex]
  const isLast = currentIndex >= story.sentences.length - 1
  const total = story.sentences.length

  // 自动播放当前句子语音
  const playCurrentSentence = useCallback(async () => {
    if (isPlaying) return
    setIsPlaying(true)
    setShowNext(false)
    try {
      await playStoryAudio(story.id, currentIndex)
    } catch {
      // 静默处理
    }
    setIsPlaying(false)
    setHasPlayedCurrent(true)
    setShowNext(true)
  }, [story.id, currentIndex, isPlaying])

  // 进入新句子时自动播放
  useEffect(() => {
    setHasPlayedCurrent(false)
    setShowNext(false)
    autoPlayTimer.current = setTimeout(() => {
      playCurrentSentence()
    }, 500)
    return () => {
      if (autoPlayTimer.current) clearTimeout(autoPlayTimer.current)
    }
  }, [currentIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = () => {
    if (isLast) {
      onComplete()
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* 漂浮装饰 */}
      <motion.span className="absolute top-20 left-8 text-3xl opacity-15 pointer-events-none"
        animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
        {story.coverEmoji}
      </motion.span>
      <motion.span className="absolute bottom-40 right-6 text-2xl opacity-10 pointer-events-none"
        animate={{ y: [0, 6, 0], rotate: [0, -5, 0] }} transition={{ duration: 5, repeat: Infinity }}>
        ✨
      </motion.span>

      {/* 顶部：标题 */}
      <div className="relative z-10 px-4 pt-6 pb-3 safe-top">
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl">{story.coverEmoji}</span>
          <h1 className="text-lg font-bold text-amber-700">{story.title}</h1>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="flex flex-col items-center gap-6 w-full max-w-md"
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -40, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* 场景 emoji 插图 */}
            <motion.div
              className="text-5xl md:text-6xl"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
            >
              {sentence.scene}
            </motion.div>

            {/* 句子卡片 */}
            <motion.div
              className="bg-white rounded-3xl px-6 py-8 shadow-lg border-2 border-amber-100 w-full text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <HighlightedSentence text={sentence.text} newChars={sentence.newChars} />
            </motion.div>

            {/* 新字标签 */}
            {sentence.newChars.length > 0 && (
              <motion.div
                className="flex gap-2 justify-center flex-wrap"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {sentence.newChars.map(char => (
                  <motion.span
                    key={char}
                    className="px-3 py-1 rounded-full bg-amber-100 text-amber-600 font-bold text-sm border border-amber-200"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}
                  >
                    新字：{char}
                  </motion.span>
                ))}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* 底部操作区 */}
        <motion.div
          className="flex flex-col items-center gap-4 mt-8 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* 播放状态指示 */}
          {isPlaying && (
            <motion.div
              className="flex items-center gap-2 text-amber-500"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="text-lg">🔊</span>
              <span className="text-sm font-medium">正在朗读...</span>
            </motion.div>
          )}

          {/* 重听按钮 */}
          {hasPlayedCurrent && !isPlaying && (
            <motion.button
              className="flex items-center gap-1 px-4 py-2 rounded-full bg-white/60 text-amber-500 text-sm font-medium shadow-sm"
              onClick={() => playCurrentSentence()}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              🔊 再听一遍
            </motion.button>
          )}

          {/* 下一页 / 完成按钮 */}
          <AnimatePresence>
            {showNext && (
              <motion.button
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold text-lg shadow-lg min-w-[200px]"
                onClick={handleNext}
                whileTap={{ scale: 0.95 }}
                whileHover={{ y: -2 }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {isLast ? '认识新字 →' : '下一页 →'}
              </motion.button>
            )}
          </AnimatePresence>

          {/* 进度点 */}
          <div className="flex gap-2 justify-center mt-2">
            {Array.from({ length: total }, (_, i) => (
              <motion.div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === currentIndex ? 'bg-amber-400' : i < currentIndex ? 'bg-amber-200' : 'bg-gray-200'
                }`}
                animate={i === currentIndex ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
