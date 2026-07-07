import { motion } from 'framer-motion'
import type { EnglishQuestion } from '@/types'
import EnglishOptionCard from './EnglishOptionCard'

type OptionState = 'idle' | 'correct' | 'wrong' | 'disabled' | 'reveal'

interface RendererProps {
  question: EnglishQuestion
  optionStates: OptionState[]
  onSelect: (index: number) => void
  onReplay: () => void
}

/** 看图选词：展示 emoji 大图，从 3 个英文单词中选出正确的词 */
export default function PicWordRenderer({ question, optionStates, onSelect }: RendererProps) {
  return (
    <div className="flex flex-col items-center gap-8 w-full">
      {/* emoji 大图展示区 */}
      <motion.div
        className="bg-white rounded-[2rem] px-10 py-8 shadow-lg border-2 border-sky-100 flex items-center justify-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <span className="text-7xl md:text-8xl">{question.pic ?? '❓'}</span>
      </motion.div>

      {/* 单词选项：纵向堆叠，触摸区域大 */}
      <div className="flex flex-col gap-3 w-full max-w-[300px]">
        {question.options.map((option, index) => (
          <EnglishOptionCard
            key={index}
            option={option}
            index={index}
            state={optionStates[index]}
            variant="word"
            onSelect={() => onSelect(index)}
          />
        ))}
      </div>
    </div>
  )
}
