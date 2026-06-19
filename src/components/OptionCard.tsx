import { motion } from 'framer-motion'

interface OptionCardProps {
  option: string
  index: number
  state: 'idle' | 'correct' | 'wrong' | 'disabled' | 'reveal'
  isCharOption?: boolean
  onSelect: () => void
}

export default function OptionCard({ option, state, isCharOption, onSelect }: OptionCardProps) {
  const stateStyles = {
    idle: 'bg-white border-2 border-gray-200 shadow-sm active:scale-95',
    correct: 'bg-correct/10 border-2 border-correct shadow-md',
    wrong: 'bg-wrong-soft/10 border-2 border-wrong-soft shadow-md',
    reveal: 'bg-correct/5 border-2 border-correct/50',
    disabled: 'bg-gray-50 border-2 border-gray-100 opacity-60',
  }

  const animations = {
    idle: { scale: 1 },
    correct: { scale: [1, 1.1, 1] },
    wrong: { x: [0, -6, 6, -4, 4, 0] },
    reveal: { scale: 1, opacity: 0.8 },
    disabled: { scale: 1 },
  }

  return (
    <motion.button
      type="button"
      className={`rounded-2xl p-4 min-h-[80px] min-w-[80px] flex items-center justify-center 
        transition-colors cursor-pointer select-none ${stateStyles[state]}`}
      onClick={state === 'idle' ? onSelect : undefined}
      animate={animations[state]}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      whileTap={state === 'idle' ? { scale: 0.92 } : undefined}
      disabled={state !== 'idle'}
    >
      <span className={isCharOption ? 'text-3xl md:text-4xl font-bold' : 'text-4xl md:text-5xl'}>
        {option}
      </span>
    </motion.button>
  )
}
