import { motion } from 'framer-motion'

interface ProgressBarProps {
  current: number
  total: number
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => {
        const isCompleted = i < current - 1
        const isCurrent = i === current - 1
        const isPending = i >= current

        return (
          <motion.span
            key={i}
            className={`text-xl md:text-2xl transition-all duration-300 ${
              isCurrent ? 'animate-star-pulse' : ''
            }`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ 
              scale: isCompleted || isCurrent ? 1 : 0.7, 
              opacity: 1 
            }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
          >
            {isCompleted ? '⭐' : isCurrent ? '🌟' : isPending ? '☆' : '☆'}
          </motion.span>
        )
      })}
    </div>
  )
}
