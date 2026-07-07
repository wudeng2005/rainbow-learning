import { motion } from 'framer-motion'

interface EnglishOptionCardProps {
  option: string
  index: number
  state: 'idle' | 'correct' | 'wrong' | 'disabled' | 'reveal'
  /** 'emoji' 大图 | 'word' 英文单词 | 'letter' 字母 */
  variant: 'emoji' | 'word' | 'letter'
  onSelect: () => void
}

const cardColors = [
  'bg-sky-100 border-sky-300 hover:border-sky-500',
  'bg-cyan-100 border-cyan-300 hover:border-cyan-500',
  'bg-indigo-100 border-indigo-300 hover:border-indigo-500',
  'bg-teal-100 border-teal-300 hover:border-teal-500',
]

export default function EnglishOptionCard({ option, index, state, variant, onSelect }: EnglishOptionCardProps) {
  const idleStyle = cardColors[index % cardColors.length]

  const stateStyles = {
    idle: `${idleStyle} shadow-md hover:shadow-lg`,
    correct: 'bg-emerald-100 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    wrong: 'bg-indigo-50 border-indigo-300 shadow-md',
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

  const textStyle =
    variant === 'emoji'
      ? 'text-5xl md:text-6xl'
      : variant === 'letter'
        ? 'text-4xl md:text-5xl font-extrabold text-sky-700'
        : 'text-2xl md:text-3xl font-bold text-sky-700 lowercase'

  return (
    <motion.button
      type="button"
      className={`relative rounded-3xl p-4 min-h-[96px] min-w-[96px] flex items-center justify-center 
        border-3 transition-all duration-200 cursor-pointer select-none touch-manipulation
        ${stateStyles[state]}`}
      onClick={state === 'idle' ? onSelect : undefined}
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
          >🌟</motion.span>
          <motion.span
            className="absolute -bottom-1 -left-1 text-base"
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: -15 }}
            transition={{ delay: 0.2 }}
          >🎉</motion.span>
        </>
      )}
      <span className={textStyle}>{option}</span>
    </motion.button>
  )
}
