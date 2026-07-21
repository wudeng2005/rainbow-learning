import { motion } from 'framer-motion'
import { playTapSound } from '@/lib/sounds'

interface MathOptionCardProps {
  option: string
  index: number
  state: 'idle' | 'correct' | 'wrong' | 'disabled' | 'reveal'
  onSelect: () => void
}

const cardColors = [
  'bg-pink-50 border-pink-200 text-pink-700',
  'bg-amber-50 border-amber-200 text-amber-700',
  'bg-emerald-50 border-emerald-200 text-emerald-700',
  'bg-violet-50 border-violet-200 text-violet-700',
]

export default function MathOptionCard({ option, index, state, onSelect }: MathOptionCardProps) {
  const idleStyle = cardColors[index % cardColors.length]

  const stateStyles = {
    idle: `${idleStyle} shadow-[0_5px_0_rgba(190,80,120,0.15)] active:shadow-none active:translate-y-[5px]`,
    correct: 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-[0_0_20px_rgba(16,185,129,0.25)]',
    wrong: 'bg-rose-50 border-rose-200 text-rose-400 shadow-md',
    reveal: 'bg-emerald-50 border-emerald-300 border-dashed text-emerald-600',
    disabled: 'bg-gray-50 border-gray-200 text-gray-400 opacity-50',
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
      whileTap={state === 'idle' ? { scale: 0.95 } : undefined}
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
