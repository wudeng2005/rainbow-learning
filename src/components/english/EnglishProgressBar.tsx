import { motion } from 'framer-motion'

interface EnglishProgressBarProps {
  current: number
  total: number
}

/** 海洋进度条：蓝色渐变填充 + 游泳小鹦鹉 + 终点贝壳 */
export default function EnglishProgressBar({ current, total }: EnglishProgressBarProps) {
  const percent = Math.min(100, Math.round((current / total) * 100))

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative flex-1 h-5 bg-white/60 rounded-full overflow-visible shadow-inner border border-white/80">
        {/* 海洋色进度填充 */}
        <motion.div
          className="h-full bg-gradient-to-r from-sky-300 via-blue-400 to-indigo-400 rounded-full relative overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        >
          {/* 波浪光泽 */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 0.8, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* 游泳小鹦鹉 */}
        <motion.div
          className="absolute -top-4"
          initial={{ left: '0%' }}
          animate={{ left: `${Math.max(0, percent - 5)}%` }}
          transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        >
          <motion.span
            className="text-lg block"
            animate={{ y: [0, -5, 0], rotate: [0, -6, 6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.25, ease: 'easeInOut' }}
          >
            🦜
          </motion.span>
        </motion.div>

        {/* 终点贝壳 */}
        <span className="absolute -top-3.5 -right-1 text-sm">🐚</span>
      </div>
      <span className="text-xs font-bold text-sky-600 min-w-[36px] text-right font-num">
        {current}/{total}
      </span>
    </div>
  )
}
