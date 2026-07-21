import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { getRandomMessage } from '@/data/encouragements'
import { completeMessages } from '@/data/encouragements'
import { playGemSound } from '@/lib/sounds'
import { useEffect } from 'react'

interface DailyCompleteProps {
  questionsCorrect: number
  totalQuestions: number
  gemsEarned: number
  isPractice?: boolean
  onPlayAgain?: () => void
}

const CELEBRATION_EMOJIS = ['🎉', '⭐', '🌟', '✨', '🎊', '💖', '🌈', '🦋', '🎈', '🍭', '🧁', '🎶']

export default function DailyComplete({ questionsCorrect, totalQuestions, gemsEarned, isPractice, onPlayAgain }: DailyCompleteProps) {
  const navigate = useNavigate()
  const message = getRandomMessage(completeMessages)

  // 进入时播放宝石音效
  useEffect(() => {
    const t = setTimeout(() => playGemSound(), 600)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div
      className="flex flex-col items-center justify-center text-center py-8 px-4 min-h-[60dvh] relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 15 }}
    >
      {/* 满屏庆祝粒子 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {CELEBRATION_EMOJIS.map((emoji, i) => (
          <motion.span
            key={i}
            className="absolute text-xl"
            style={{ left: `${5 + i * 8}%`, top: '-5%' }}
            initial={{ y: -20, opacity: 0, rotate: 0 }}
            animate={{
              y: [null, typeof window !== 'undefined' ? window.innerHeight + 40 : 800],
              opacity: [0, 1, 1, 0.8, 0],
              rotate: [0, 180 + Math.random() * 360],
              x: [0, (Math.random() - 0.5) * 80],
            }}
            transition={{
              duration: 2.5 + Math.random() * 1,
              delay: 0.3 + i * 0.1,
              ease: 'easeIn',
            }}
          >
            {emoji}
          </motion.span>
        ))}
      </div>

      {/* 吉祥物庆祝 */}
      <motion.div
        className="relative mb-4"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.2 }}
      >
        <motion.span
          className="text-7xl md:text-8xl block"
          animate={{ rotate: [0, -10, 10, -5, 5, 0], y: [0, -8, 0] }}
          transition={{ duration: 1.2, delay: 0.5, repeat: Infinity, repeatDelay: 2 }}
        >
          {isPractice ? '⭐' : '🦄'}
        </motion.span>
        {/* 光环 */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-amber-300/40"
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      <motion.h2
        className="text-xl md:text-2xl font-bold text-text-primary mb-2"
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {isPractice ? '练习完成，真棒！' : message}
      </motion.h2>

      {!isPractice && (
        <motion.div
          className="flex gap-3 md:gap-4 mt-4 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, type: 'spring', damping: 15 }}
        >
          <div className="bg-white rounded-2xl px-5 py-3 shadow-md">
            <p className="text-xs text-text-secondary">答对</p>
            <p className="text-2xl font-bold text-correct">{questionsCorrect}/{totalQuestions}</p>
          </div>
          <motion.div
            className="bg-white rounded-2xl px-5 py-3 shadow-md"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ delay: 1, duration: 0.5, repeat: 2 }}
          >
            <p className="text-xs text-text-secondary">获得宝石</p>
            <p className="text-2xl font-bold text-gem-gold">+{gemsEarned} 💎</p>
          </motion.div>
        </motion.div>
      )}

      <motion.p
        className="text-sm md:text-base text-text-secondary mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {isPractice ? '多练习越来越厉害哦~' : '明天还有新的冒险等着你哦~'}
      </motion.p>

      <motion.div
        className="flex flex-col gap-3 w-full max-w-[280px]"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {onPlayAgain && (
          <motion.button
            type="button"
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-rainbow-blue to-rainbow-purple text-white font-bold text-lg min-h-[52px] touch-manipulation shadow-lg"
            whileTap={{ scale: 0.95 }}
            onClick={onPlayAgain}
          >
            再来一次 🌟
          </motion.button>
        )}
        <motion.button
          type="button"
          className={onPlayAgain
            ? "px-8 py-3.5 rounded-full border-2 border-rainbow-purple/30 text-rainbow-purple font-bold text-lg min-h-[52px] touch-manipulation"
            : "px-8 py-3.5 rounded-full bg-gradient-to-r from-rainbow-blue to-rainbow-purple text-white font-bold text-lg min-h-[52px] touch-manipulation shadow-lg"
          }
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
        >
          回到首页 🏠
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
