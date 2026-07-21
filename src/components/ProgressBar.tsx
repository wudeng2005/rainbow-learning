import { motion } from 'framer-motion'

interface ProgressBarProps {
  current: number
  total: number
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  // 当题目数 > 5 时，手机端使用进度条样式（星星太宽）
  const useBarStyle = total > 5

  if (useBarStyle) {
    const percent = Math.min(100, Math.round((current / total) * 100))
    return (
      <div className="flex items-center gap-2 w-full">
        <div className="relative flex-1 h-5 bg-white/60 rounded-full overflow-visible shadow-inner border border-white/80">
          {/* 彩虹进度填充 */}
          <motion.div
            className="h-full bg-gradient-to-r from-rainbow-yellow via-rainbow-orange to-rainbow-red rounded-full relative overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ type: 'spring', stiffness: 180, damping: 22 }}
          >
            {/* 流动光泽 */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, ease: 'easeInOut' }}
            />
          </motion.div>

          {/* 跳跃小兔子 */}
          <motion.div
            className="absolute -top-4"
            initial={{ left: '0%' }}
            animate={{ left: `${Math.max(0, percent - 5)}%` }}
            transition={{ type: 'spring', stiffness: 180, damping: 22 }}
          >
            <motion.span
              className="text-lg block"
              animate={{ y: [0, -6, 0], rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.3, ease: 'easeInOut' }}
            >
              🐰
            </motion.span>
          </motion.div>

          {/* 终点旗帜 */}
          <span className="absolute -top-3.5 -right-1 text-sm">🚩</span>
        </div>
        <span className="text-xs font-bold text-amber-700 min-w-[36px] text-right font-num">
          {current}/{total}
        </span>
      </div>
    )
  }

  // 题目数 <= 5 时使用星星样式
  return (
    <div className="flex items-center justify-center gap-1.5 md:gap-2">
      {Array.from({ length: total }, (_, i) => {
        const isCompleted = i < current - 1
        const isCurrent = i === current - 1

        return (
          <motion.span
            key={i}
            className={`text-lg md:text-2xl transition-all duration-300 ${
              isCurrent ? 'animate-star-pulse' : ''
            }`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ 
              scale: isCompleted || isCurrent ? 1 : 0.7, 
              opacity: 1 
            }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
          >
            {isCompleted ? '⭐' : isCurrent ? '🌟' : '☆'}
          </motion.span>
        )
      })}
    </div>
  )
}
