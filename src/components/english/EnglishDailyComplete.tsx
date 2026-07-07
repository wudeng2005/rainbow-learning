import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

interface EnglishDailyCompleteProps {
  questionsCorrect: number
  totalQuestions: number
  gemsEarned: number
  isPractice?: boolean
  onPlayAgain: () => void
}

export default function EnglishDailyComplete({
  questionsCorrect, totalQuestions, gemsEarned, isPractice, onPlayAgain,
}: EnglishDailyCompleteProps) {
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-gradient-to-b from-sky-100 via-cyan-50 to-blue-50 px-6">
      <motion.div
        className="text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <span className="text-7xl block mb-4">🦜</span>
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          {isPractice ? '练习完成！' : '今天的英语冒险结束啦！'}
        </h2>
        <p className="text-text-secondary text-base mb-6">
          {isPractice
            ? 'You are great! 继续保持！🌈'
            : `答对了 ${questionsCorrect}/${totalQuestions} 题！`}
        </p>

        {!isPractice && gemsEarned > 0 && (
          <motion.div
            className="inline-flex items-center gap-2 bg-white/80 rounded-full px-5 py-2 mb-6 shadow-sm"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-2xl">💎</span>
            <span className="font-bold text-lg text-rainbow-purple">+{gemsEarned}</span>
          </motion.div>
        )}

        <div className="flex flex-col gap-3 w-full max-w-[240px] mx-auto">
          <motion.button
            type="button"
            className="px-8 py-4 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 text-white font-bold text-lg shadow-lg"
            whileTap={{ scale: 0.95 }}
            onClick={onPlayAgain}
          >
            🎧 再来一次
          </motion.button>
          <motion.button
            type="button"
            className="px-8 py-3 rounded-full bg-white/80 text-text-secondary font-medium shadow-sm"
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
          >
            回到首页
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
