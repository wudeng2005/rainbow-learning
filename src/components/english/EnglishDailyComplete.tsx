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
  const stars = totalQuestions > 0 ? Math.max(1, Math.round((questionsCorrect / totalQuestions) * 3)) : 3

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-gradient-to-b from-sky-100 via-cyan-50 to-blue-50 px-6 relative overflow-hidden">
      {/* 飘落庆祝 emoji */}
      {['🌊', '⭐', '🦜', '🎵', '🎈', '✨', '🌈', '🎉'].map((emoji, i) => (
        <motion.span
          key={i}
          className="absolute pointer-events-none"
          style={{ left: `${8 + i * 12}%`, top: '-8%', fontSize: `${18 + (i % 3) * 8}px` }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: [null, typeof window !== 'undefined' ? window.innerHeight + 40 : 800], opacity: [0, 1, 1, 0], rotate: [0, 200 + i * 40] }}
          transition={{ duration: 3 + (i % 3), delay: i * 0.3, repeat: Infinity, repeatDelay: 2, ease: 'easeIn' }}
        >{emoji}</motion.span>
      ))}

      <motion.div
        className="text-center relative z-10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        {/* 跳跃庆祝角色 */}
        <motion.span
          className="text-7xl block mb-3"
          animate={{ y: [0, -12, 0], rotate: [0, -8, 8, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        >🦜</motion.span>

        <h2 className="text-2xl font-bold text-text-primary mb-2">
          {isPractice ? '练习完成！' : '今天的英语冒险结束啦！'}
        </h2>

        {/* 星星评价 */}
        {!isPractice && (
          <div className="flex justify-center gap-2 mb-3">
            {[1, 2, 3].map(s => (
              <motion.span
                key={s}
                className={`text-4xl ${s <= stars ? '' : 'opacity-25 grayscale'}`}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3 + s * 0.2, type: 'spring', stiffness: 300 }}
              >⭐</motion.span>
            ))}
          </div>
        )}

        <p className="text-text-secondary text-base mb-6">
          {isPractice
            ? 'You are great! 继续保持！🌈'
            : `答对了 ${questionsCorrect}/${totalQuestions} 题！`}
        </p>

        {!isPractice && gemsEarned > 0 && (
          <motion.div
            className="inline-flex items-center gap-2 bg-white/90 rounded-full px-5 py-2.5 mb-6 shadow-md border-2 border-sky-100"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: [20, -4, 0], opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
          >
            <motion.span className="text-2xl" animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>💎</motion.span>
            <span className="font-bold text-lg text-rainbow-purple">+{gemsEarned}</span>
          </motion.div>
        )}

        <div className="flex flex-col gap-3 w-full max-w-[240px] mx-auto">
          <motion.button
            type="button"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-500 text-white font-bold text-lg border-[3px] border-white/40 shadow-[0_5px_0_rgba(56,130,190,0.3)] active:shadow-none active:translate-y-1 touch-manipulation"
            whileTap={{ scale: 0.95 }}
            onClick={onPlayAgain}
          >
            🎧 再来一次
          </motion.button>
          <motion.button
            type="button"
            className="px-8 py-3.5 rounded-2xl bg-white text-text-secondary font-bold border-[3px] border-sky-100 shadow-[0_4px_0_rgba(56,130,190,0.1)] active:shadow-none active:translate-y-1 touch-manipulation"
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
