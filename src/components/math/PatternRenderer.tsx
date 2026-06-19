import { motion } from 'framer-motion'
import type { PatternData } from '@/types'
import MathOptionCard from './MathOptionCard'

interface PatternRendererProps {
  data: PatternData
  options: string[]
  optionStates: ('idle' | 'correct' | 'wrong' | 'disabled' | 'reveal')[]
  onSelect: (index: number) => void
}

export default function PatternRenderer({ data, options, optionStates, onSelect }: PatternRendererProps) {
  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* 序列展示 */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {data.sequence.map((item, i) => (
          <motion.div
            key={i}
            className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center ${
              item === '❓'
                ? 'border-3 border-dashed border-pink-400 bg-pink-50'
                : 'bg-white border-2 border-pink-100 shadow-sm'
            }`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
          >
            <span className={`text-2xl md:text-3xl ${item === '❓' ? 'animate-star-pulse text-pink-400' : ''}`}>
              {item}
            </span>
          </motion.div>
        ))}
      </div>

      {/* 选项 */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[320px]">
        {options.map((option, index) => (
          <MathOptionCard
            key={index}
            option={option}
            index={index}
            state={optionStates[index]}
            onSelect={() => onSelect(index)}
          />
        ))}
      </div>
    </div>
  )
}
