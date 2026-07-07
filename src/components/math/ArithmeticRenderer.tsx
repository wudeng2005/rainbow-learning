import { motion } from 'framer-motion'
import type { ArithmeticData } from '@/types'
import MathOptionCard from './MathOptionCard'

interface ArithmeticRendererProps {
  data: ArithmeticData
  options: string[]
  optionStates: ('idle' | 'correct' | 'wrong' | 'disabled' | 'reveal')[]
  onSelect: (index: number) => void
}

function EmojiGroup({ count, emoji }: { count: number; emoji: string }) {
  return (
    <div className="flex flex-wrap justify-center gap-1 max-w-[120px]">
      {Array.from({ length: count }, (_, i) => (
        <motion.span
          key={i}
          className="text-2xl md:text-3xl"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.05, duration: 0.2 }}
        >
          {emoji}
        </motion.span>
      ))}
    </div>
  )
}

export default function ArithmeticRenderer({ data, options, optionStates, onSelect }: ArithmeticRendererProps) {
  const operator = data.type === 'addition' ? '+' : '−'

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* 图形辅助 + 算式 */}
      <div className="bg-white rounded-[2rem] p-5 shadow-lg border-2 border-pink-100 w-full max-w-[340px] flex flex-col items-center gap-4">
        <div className="flex items-center justify-center gap-3">
          <EmojiGroup count={data.left} emoji={data.emoji} />
          <span className="text-3xl md:text-4xl font-black text-pink-500">{operator}</span>
          <EmojiGroup count={data.right} emoji={data.emoji} />
        </div>
        <div className="flex items-center gap-2 text-3xl md:text-4xl font-black text-purple-600">
          <span>{data.left}</span>
          <span className="text-pink-500">{operator}</span>
          <span>{data.right}</span>
          <span className="text-pink-500">=</span>
          <span className="text-pink-400 animate-star-pulse">❓</span>
        </div>
      </div>

      {/* 数字选项 */}
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
