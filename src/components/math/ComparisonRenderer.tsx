import { motion } from 'framer-motion'
import type { ComparisonData } from '@/types'

interface ComparisonRendererProps {
  data: ComparisonData
  optionStates: ('idle' | 'correct' | 'wrong' | 'disabled')[]
  onSelect: (index: number) => void
}

export default function ComparisonRenderer({ data, optionStates, onSelect }: ComparisonRendererProps) {
  const containerStyle = (state: string) => {
    if (state === 'correct') return 'border-emerald-400 bg-emerald-50 scale-105 shadow-xl'
    if (state === 'wrong') return 'border-purple-300 bg-purple-50 opacity-60 scale-95'
    if (state === 'disabled') return 'border-gray-200 bg-gray-50 opacity-50'
    return 'border-pink-200 bg-white hover:border-pink-400 hover:shadow-lg'
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex items-center gap-3 w-full max-w-[360px]">
        {/* 左容器 */}
        <motion.button
          type="button"
          className={`flex-1 rounded-3xl p-5 min-h-[120px] border-3 flex flex-wrap justify-center items-center gap-1 
            cursor-pointer transition-all duration-300 touch-manipulation ${containerStyle(optionStates[0])}`}
          onClick={optionStates[0] === 'idle' ? () => onSelect(0) : undefined}
          disabled={optionStates[0] !== 'idle'}
          whileTap={optionStates[0] === 'idle' ? { scale: 0.95 } : undefined}
        >
          {Array.from({ length: data.left.count }, (_, i) => (
            <motion.span
              key={i}
              className="text-2xl md:text-3xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05, type: 'spring' }}
            >
              {data.left.emoji}
            </motion.span>
          ))}
        </motion.button>

        {/* VS */}
        <motion.span
          className="text-lg font-bold text-pink-400 flex-shrink-0"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          VS
        </motion.span>

        {/* 右容器 */}
        <motion.button
          type="button"
          className={`flex-1 rounded-3xl p-5 min-h-[120px] border-3 flex flex-wrap justify-center items-center gap-1 
            cursor-pointer transition-all duration-300 touch-manipulation ${containerStyle(optionStates[1])}`}
          onClick={optionStates[1] === 'idle' ? () => onSelect(1) : undefined}
          disabled={optionStates[1] !== 'idle'}
          whileTap={optionStates[1] === 'idle' ? { scale: 0.95 } : undefined}
        >
          {Array.from({ length: data.right.count }, (_, i) => (
            <motion.span
              key={i}
              className="text-2xl md:text-3xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 + 0.2, type: 'spring' }}
            >
              {data.right.emoji}
            </motion.span>
          ))}
        </motion.button>
      </div>
    </div>
  )
}
