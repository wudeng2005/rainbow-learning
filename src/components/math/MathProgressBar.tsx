import { motion } from 'framer-motion'

interface MathProgressBarProps {
  current: number
  total: number
}

/** 糖果进度条：粉色渐变填充 + 棒棒糖小人跳跃 + 终点糖果屋 */
export default function MathProgressBar({ current, total }: MathProgressBarProps) {
  const percent = Math.min(100, Math.round((current / total) * 100))

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative flex-1 h-5 bg-white/60 rounded-full overflow-visible shadow-inner border border-white/80">
        {/* 糖果色进度填充 */}
        <motion.div
          className="h-full bg-gradient-to-r from-pink-300 via-rose-400 to-fuchsia-400 rounded-full relative overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        >
          {/* 流动光泽 */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* 跳跃棒棒糖小人 */}
        <motion.div
          className="absolute -top-4"
          initial={{ left: '0%' }}
          animate={{ left: `${Math.max(0, percent - 5)}%` }}
          transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        >
          <motion.span
            className="text-lg block"
            animate={{ y: [0, -6, 0], rotate: [0, 8, -8, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.3, ease: 'easeInOut' }}
          >
            🍭
          </motion.span>
        </motion.div>

        {/* 终点糖果屋 */}
        <span className="absolute -top-3.5 -right-1 text-sm">🍬</span>
      </div>
      <span className="text-xs font-bold text-pink-600 min-w-[36px] text-right font-num">
        {current}/{total}
      </span>
    </div>
  )
}
