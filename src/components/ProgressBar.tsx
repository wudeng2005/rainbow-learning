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
        <div className="flex-1 h-3 bg-white/60 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          />
        </div>
        <span className="text-xs font-bold text-amber-700 min-w-[36px] text-right">
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
