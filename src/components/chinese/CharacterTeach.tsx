import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { CharacterInfo } from '@/types'
import { playCharAudio, stopAllAudio } from '@/lib/sounds'

interface CharacterTeachProps {
  characters: string[]
  characterData: Record<string, CharacterInfo>
  onComplete: () => void
}

export default function CharacterTeach({ characters, characterData, onComplete }: CharacterTeachProps) {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const total = characters.length
  const char = characters[currentIndex]
  const info = characterData[char]
  const isLast = currentIndex >= total - 1

  // 进入每个字时自动播放读音
  const playCurrentCharAudio = useCallback(async () => {
    if (!char) return
    await playCharAudio(`/audio/chars/${char}.mp3`)
  }, [char])

  useEffect(() => {
    const timer = setTimeout(() => {
      playCurrentCharAudio()
    }, 400)
    return () => clearTimeout(timer)
  }, [currentIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsAnimating(true)
      setCurrentIndex(prev => prev - 1)
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

  const handleNext = () => {
    stopAllAudio()
    if (isLast) {
      onComplete()
    } else {
      setIsAnimating(true)
      setCurrentIndex(prev => prev + 1)
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

  if (!char || !info) {
    // 没有数据时直接跳过
    onComplete()
    return null
  }

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-b from-violet-50 via-purple-50 to-fuchsia-50 relative overflow-hidden">
      {/* 漂浮装饰 */}
      <motion.span className="absolute top-20 left-8 text-3xl opacity-15 pointer-events-none"
        animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
        📖
      </motion.span>
      <motion.span className="absolute bottom-40 right-6 text-2xl opacity-10 pointer-events-none"
        animate={{ y: [0, 6, 0], rotate: [0, -5, 0] }} transition={{ duration: 5, repeat: Infinity }}>
        ✨
      </motion.span>

      {/* 顶部：返回 + 标题 + 进度 */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-3 safe-top">
        <motion.button
          type="button"
          className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-xl touch-manipulation"
          onClick={() => { stopAllAudio(); navigate('/') }}
          whileTap={{ scale: 0.9 }}
        >
          ←
        </motion.button>
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">📖</span>
            <h1 className="text-lg font-bold text-purple-700">认识新字</h1>
          </div>
          <div className="text-sm text-purple-400 font-medium mt-0.5">
            {currentIndex + 1} / {total}
          </div>
        </div>
        <div className="w-12" />
      </div>

      {/* 主内容区 */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="flex flex-col items-center gap-5 w-full max-w-md"
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -40, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Emoji */}
            {info.emoji && (
              <motion.div
                className="text-5xl md:text-6xl"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
              >
                {info.emoji}
              </motion.div>
            )}

            {/* 教学卡片 */}
            <motion.div
              className="bg-white rounded-3xl px-6 py-8 shadow-lg border-2 border-purple-100 w-full"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              {/* 大字 + 拼音 */}
              <div className="text-center mb-4">
                <span className="text-7xl md:text-8xl font-bold text-text-primary block">{char}</span>
                <span className="text-xl md:text-2xl font-medium text-purple-500 mt-2 block">{info.pinyin}</span>
              </div>

              {/* 含义 */}
              <div className="text-center mb-4">
                <span className="text-base md:text-lg text-text-secondary">{info.meaning}</span>
              </div>

              {/* 组词 */}
              {info.words && info.words.length > 0 && (
                <div className="text-center mb-4">
                  <span className="text-sm text-purple-400 font-medium">组词</span>
                  <div className="flex gap-2 justify-center flex-wrap mt-1">
                    {info.words.map((word, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-sm font-medium border border-purple-100"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 造句（使用第一个组词造简单句） */}
              {info.words && info.words.length > 0 && (
                <div className="text-center">
                  <span className="text-sm text-purple-400 font-medium">造句</span>
                  <p className="text-base md:text-lg text-text-primary mt-1">
                    我喜欢{info.words[0]}。
                  </p>
                </div>
              )}
            </motion.div>

            {/* 重听按钮 */}
            <motion.button
              className="flex items-center gap-1 px-4 py-2 rounded-full bg-white/60 text-purple-500 text-sm font-medium shadow-sm"
              onClick={() => playCurrentCharAudio()}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              🔊 听读音
            </motion.button>
          </motion.div>
        </AnimatePresence>

        {/* 底部操作区 */}
        <motion.div
          className="flex items-center gap-4 mt-8 w-full max-w-md justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* 上一个 */}
          <motion.button
            className={`px-6 py-3 rounded-2xl font-bold text-base shadow-md min-w-[100px] ${
              currentIndex > 0
                ? 'bg-white text-purple-500 border-2 border-purple-200'
                : 'bg-gray-100 text-gray-300 border-2 border-gray-100'
            }`}
            onClick={handlePrev}
            disabled={currentIndex === 0 || isAnimating}
            whileTap={currentIndex > 0 ? { scale: 0.95 } : undefined}
          >
            ← 上一个
          </motion.button>

          {/* 下一个 / 完成 */}
          <motion.button
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-400 to-fuchsia-400 text-white font-bold text-base shadow-lg min-w-[100px]"
            onClick={handleNext}
            disabled={isAnimating}
            whileTap={{ scale: 0.95 }}
            whileHover={{ y: -2 }}
          >
            {isLast ? '开始练习 →' : '下一个 →'}
          </motion.button>
        </motion.div>

        {/* 进度条 */}
        <div className="flex gap-2 justify-center mt-4">
          {Array.from({ length: total }, (_, i) => (
            <motion.div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === currentIndex ? 'bg-purple-400' : i < currentIndex ? 'bg-purple-200' : 'bg-gray-200'
              }`}
              animate={i === currentIndex ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
