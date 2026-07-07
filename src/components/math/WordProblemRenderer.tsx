import { motion } from 'framer-motion'
import type { WordProblemData } from '@/types'
import MathOptionCard from './MathOptionCard'

interface WordProblemRendererProps {
  data: WordProblemData
  options: string[]
  optionStates: ('idle' | 'correct' | 'wrong' | 'disabled' | 'reveal')[]
  onSelect: (index: number) => void
}

function EmojiRow({ count, emoji, faded }: { count: number; emoji: string; faded?: boolean }) {
  return (
    <div className="flex flex-wrap justify-center gap-1">
      {Array.from({ length: count }, (_, i) => (
        <motion.span
          key={i}
          className={`text-2xl md:text-3xl ${faded ? 'opacity-30' : ''}`}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: faded ? 0.3 : 1 }}
          transition={{ delay: i * 0.05, duration: 0.2 }}
        >
          {emoji}
        </motion.span>
      ))}
    </div>
  )
}

export default function WordProblemRenderer({ data, options, optionStates, onSelect }: WordProblemRendererProps) {
  const isAdd = data.op === 'add'

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* 情境图示 */}
      <div className="bg-white rounded-[2rem] p-5 shadow-lg border-2 border-pink-100 w-full max-w-[340px] flex flex-col items-center gap-3">
        <EmojiRow count={data.start} emoji={data.emoji} />
        <div className="flex items-center gap-2 text-xl font-bold text-pink-500">
          <span>{isAdd ? '➕' : '➖'}</span>
          <EmojiRow count={data.change} emoji={data.emoji} faded={!isAdd} />
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
