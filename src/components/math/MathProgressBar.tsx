import { motion } from 'framer-motion'

interface MathProgressBarProps {
  current: number
  total: number
}

/** 糖果进度条：🍬(完成) 🍭(当前) ☆(待做) */
export default function MathProgressBar({ current, total }: MathProgressBarProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => {
        const isCompleted = i < current - 1
        const isCurrent = i === current - 1

        return (
          <motion.span
            key={i}
            className={`text-xl md:text-2xl transition-all duration-300 ${
              isCurrent ? 'animate-star-pulse' : ''
            }`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{
              scale: isCompleted || isCurrent ? 1 : 0.7,
              opacity: 1,
            }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
          >
            {isCompleted ? '🍬' : isCurrent ? '🍭' : '☆'}
          </motion.span>
        )
      })}
    </div>
  )
}
