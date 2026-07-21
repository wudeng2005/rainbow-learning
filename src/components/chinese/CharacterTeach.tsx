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
    <div className="min-h-dvh flex flex-col bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* 漂浮装饰 */}
      <motion.span className="absolute top-20 left-8 text-3xl opacity-15 pointer-events-none"
        animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
        📖
      </motion.span>
      <motion.span className="absolute bottom-40 right-6 text-2xl opacity-10 pointer-events-none"
        animate={{ y: [0, 6, 0], rotate: [0, -5, 0] }} transition={{ duration: 5, repeat: Infinity }}>
        ✨
      </motion.span>
      <motion.span className="absolute top-36 right-10 text-2xl opacity-10 pointer-events-none"
        animate={{ y: [0, -6, 0], rotate: [0, 8, 0] }} transition={{ duration: 4.5, repeat: Infinity }}>
        🎋
      </motion.span>

      {/* 顶部：返回 + 标题 + 进度 */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-3 safe-top">
        <motion.button
          type="button"
          className="w-12 h-12 rounded-full bg-white shadow-md border-2 border-orange-100 flex items-center justify-center text-xl touch-manipulation"
          onClick={() => { stopAllAudio(); navigate('/') }}
          whileTap={{ scale: 0.9 }}
        >
          ←
        </motion.button>
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">📖</span>
            <h1 className="text-lg font-bold text-amber-700">认识新字</h1>
          </div>
          <div className="text-sm text-amber-400 font-bold mt-0.5">
            第 {currentIndex + 1} / {total} 个字
          </div>
        </div>
        <div className="w-12" />
      </div>

      {/* 主内容区 */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-6 pb-8">
        {/* 熊猫陪伴 + 鼓励气泡 */}
        <div className="flex items-end gap-2 w-full max-w-md mb-3">
          <motion.span className="text-4xl shrink-0" animate={{ y: [0, -4, 0], rotate: [0, -3, 3, 0] }}
            transition={{ duration: 3, repeat: Infinity }}>🐼</motion.span>
          <motion.div
            className="relative bg-white rounded-2xl rounded-bl-md px-4 py-2.5 shadow-md border-2 border-orange-100"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            <p className="text-sm md:text-base text-amber-700 font-bold">
              {isLast ? '最后一个字啦，加油！' : '跟着熊猫老师一起读！'}
            </p>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="flex flex-col items-center gap-4 w-full max-w-md"
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
              className="bg-white rounded-[2rem] px-6 py-7 shadow-[0_8px_0_rgba(217,119,6,0.08)] border-[3px] border-orange-100 w-full"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              {/* 大字 + 拼音 */}
              <div className="text-center mb-4">
                <span className="text-7xl md:text-8xl font-bold text-text-primary block">{char}</span>
                <span className="text-xl md:text-2xl font-bold text-orange-400 mt-2 block">{info.pinyin}</span>
              </div>

              {/* 含义 */}
              <div className="text-center mb-4">
                <span className="text-base md:text-lg text-text-secondary">{info.meaning}</span>
              </div>

              {/* 组词 */}
              {info.words && info.words.length > 0 && (
                <div className="text-center mb-4">
                  <span className="text-sm text-amber-500 font-bold">✨ 组词</span>
                  <div className="flex gap-2 justify-center flex-wrap mt-1.5">
                    {info.words.map((word, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 text-sm font-bold border-2 border-orange-100"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 造句 */}
              {info.words && info.words.length > 0 && (
                <div className="text-center bg-amber-50 rounded-2xl px-4 py-3 border-2 border-amber-100">
                  <span className="text-sm text-amber-500 font-bold">💬 造句</span>
                  <p className="text-base md:text-lg text-text-primary font-medium mt-0.5">
                    我喜欢{info.words[0]}。
                  </p>
                </div>
              )}
            </motion.div>

            {/* 重听按钮 */}
            <motion.button
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white text-orange-500 text-sm font-bold shadow-[0_3px_0_rgba(217,119,6,0.15)] border-2 border-orange-100 active:shadow-none active:translate-y-[3px] touch-manipulation"
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
          className="flex items-center gap-4 mt-6 w-full max-w-md justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* 上一个 */}
          <motion.button
            className={`px-6 py-3.5 rounded-2xl font-bold text-base min-w-[110px] touch-manipulation transition-all ${
              currentIndex > 0
                ? 'bg-white text-amber-600 border-[3px] border-orange-200 shadow-[0_4px_0_rgba(217,119,6,0.12)] active:shadow-none active:translate-y-1'
                : 'bg-gray-50 text-gray-300 border-[3px] border-gray-100'
            }`}
            onClick={handlePrev}
            disabled={currentIndex === 0 || isAnimating}
            whileTap={currentIndex > 0 ? { scale: 0.95 } : undefined}
          >
            ← 上一个
          </motion.button>

          {/* 下一个 / 完成 */}
          <motion.button
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold text-base min-w-[110px] border-[3px] border-white/40 shadow-[0_5px_0_rgba(217,119,6,0.3)] active:shadow-none active:translate-y-1 touch-manipulation"
            onClick={handleNext}
            disabled={isAnimating}
            whileTap={{ scale: 0.95 }}
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
                i === currentIndex ? 'bg-amber-400' : i < currentIndex ? 'bg-amber-200' : 'bg-orange-100'
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
