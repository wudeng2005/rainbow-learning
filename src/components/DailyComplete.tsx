import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { getRandomMessage } from '@/data/encouragements'
import { completeMessages } from '@/data/encouragements'

interface DailyCompleteProps {
  questionsCorrect: number
  totalQuestions: number
  gemsEarned: number
  isPractice?: boolean
  onPlayAgain?: () => void
}

export default function DailyComplete({ questionsCorrect, totalQuestions, gemsEarned, isPractice, onPlayAgain }: DailyCompleteProps) {
  const navigate = useNavigate()
  const message = getRandomMessage(completeMessages)

  return (
    <motion.div
      className="flex flex-col items-center justify-center text-center py-8"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 15 }}
    >
      <motion.span
        className="text-7xl mb-4"
        animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {isPractice ? '⭐' : '🌈'}
      </motion.span>

      <h2 className="text-2xl font-bold text-text-primary mb-2">
        {isPractice ? '练习完成，真棒！' : message}
      </h2>

      {!isPractice && (
        <div className="flex gap-4 mt-4 mb-6">
          <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
            <p className="text-sm text-text-secondary">答对</p>
            <p className="text-2xl font-bold text-correct">{questionsCorrect}/{totalQuestions}</p>
          </div>
          <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
            <p className="text-sm text-text-secondary">获得宝石</p>
            <p className="text-2xl font-bold text-gem-gold">+{gemsEarned} 💎</p>
          </div>
        </div>
      )}

      <p className="text-base text-text-secondary mb-6">
        {isPractice ? '多练习越来越厉害哦~' : '明天还有新的冒险等着你哦~'}
      </p>

      <div className="flex flex-col gap-3 w-full max-w-[240px]">
        {onPlayAgain && (
          <button
            type="button"
            className="px-8 py-3 rounded-full bg-gradient-to-r from-rainbow-blue to-rainbow-purple text-white font-bold text-lg min-h-[48px]"
            onClick={onPlayAgain}
          >
            再来一次
          </button>
        )}
        <button
          type="button"
          className={onPlayAgain
            ? "px-8 py-3 rounded-full border-2 border-rainbow-purple/30 text-rainbow-purple font-bold text-lg min-h-[48px]"
            : "px-8 py-3 rounded-full bg-gradient-to-r from-rainbow-blue to-rainbow-purple text-white font-bold text-lg min-h-[48px]"
          }
          onClick={() => navigate('/')}
        >
          回到首页
        </button>
      </div>
    </motion.div>
  )
}
