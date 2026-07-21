import { motion } from 'framer-motion'
import { playTapSound } from '@/lib/sounds'

interface MathOptionCardProps {
  option: string
  index: number
  state: 'idle' | 'correct' | 'wrong' | 'disabled' | 'reveal'
  onSelect: () => void
}

const cardColors = [
  'bg-pink-100 border-pink-300 hover:border-pink-500',
  'bg-yellow-100 border-yellow-300 hover:border-yellow-500',
  'bg-emerald-100 border-emerald-300 hover:border-emerald-500',
  'bg-purple-100 border-purple-300 hover:border-purple-500',
]

export default function MathOptionCard({ option, index, state, onSelect }: MathOptionCardProps) {
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
      className={`relative rounded-3xl p-4 min-h-[80px] min-w-[80px] flex items-center justify-center 
        border-3 transition-all duration-200 cursor-pointer select-none touch-manipulation
        ${stateStyles[state]}`}
      onClick={state === 'idle' ? () => { playTapSound(); onSelect() } : undefined}
      animate={animations[state]}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      whileTap={state === 'idle' ? { scale: 0.93 } : undefined}
      whileHover={state === 'idle' ? { y: -3, scale: 1.02 } : undefined}
      disabled={state !== 'idle'}
    >
      {state === 'correct' && (
        <>
          <motion.span
            className="absolute -top-2 -right-2 text-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 20 }}
            transition={{ delay: 0.1 }}
          >🍬</motion.span>
          <motion.span
            className="absolute -bottom-1 -left-1 text-base"
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: -15 }}
            transition={{ delay: 0.2 }}
          >⭐</motion.span>
        </>
      )}
      <span className="text-3xl md:text-4xl font-bold">{option}</span>
    </motion.button>
  )
}
