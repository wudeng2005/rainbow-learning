import { motion } from 'framer-motion'
import { playTapSound } from '@/lib/sounds'

interface OptionCardProps {
  option: string
  index: number
  state: 'idle' | 'correct' | 'wrong' | 'disabled' | 'reveal'
  isCharOption?: boolean
  onSelect: () => void
}

// 每个选项不同的柔和底色
const cardColors = [
  'bg-pink-50 border-pink-200 hover:border-pink-400',
  'bg-blue-50 border-blue-200 hover:border-blue-400',
  'bg-green-50 border-green-200 hover:border-green-400',
]

export default function OptionCard({ option, index, state, isCharOption, onSelect }: OptionCardProps) {
  const idleStyle = cardColors[index % cardColors.length]

  const stateStyles = {
    idle: `${idleStyle} shadow-md hover:shadow-lg`,
    correct: 'bg-emerald-100 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    wrong: 'bg-purple-50 border-purple-300 shadow-md',
    reveal: 'bg-emerald-50 border-emerald-300 border-dashed',
    disabled: 'bg-gray-50 border-gray-200 opacity-50',
  }

  const animations = {
    idle: { scale: 1, y: 0 },
    correct: { scale: 1.08, y: -4 },
    wrong: { x: [0, -4, 4, -2, 2, 0], scale: 1 },
    reveal: { scale: 1, opacity: 0.9 },
    disabled: { scale: 0.97, opacity: 0.5 },
  }

  return (
    <motion.button
      type="button"
      className={`relative rounded-3xl p-5 min-h-[100px] min-w-[100px] flex items-center justify-center 
        border-3 transition-all duration-200 cursor-pointer select-none touch-manipulation
        ${stateStyles[state]}`}
      onClick={state === 'idle' ? () => { playTapSound(); onSelect() } : undefined}
      animate={animations[state]}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      whileTap={state === 'idle' ? { scale: 0.93 } : undefined}
      whileHover={state === 'idle' ? { y: -4, scale: 1.03 } : undefined}
      disabled={state !== 'idle'}
    >
      {/* 正确时的星星装饰 */}
      {state === 'correct' && (
        <>
          <motion.span
            className="absolute -top-2 -right-2 text-xl"
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 20 }}
            transition={{ delay: 0.1 }}
          >
            ⭐
          </motion.span>
          <motion.span
            className="absolute -bottom-1 -left-1 text-lg"
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: -15 }}
            transition={{ delay: 0.2 }}
          >
            ✨
          </motion.span>
        </>
      )}
      
      <span className={isCharOption ? 'text-4xl md:text-5xl font-bold' : 'text-5xl md:text-6xl'}>
        {option}
      </span>
    </motion.button>
  )
}
