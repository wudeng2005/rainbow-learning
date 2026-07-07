import { motion } from 'framer-motion'
import type { EnglishQuestion } from '@/types'
import EnglishOptionCard from './EnglishOptionCard'
import AudioButton from './AudioButton'

type OptionState = 'idle' | 'correct' | 'wrong' | 'disabled' | 'reveal'

interface RendererProps {
  question: EnglishQuestion
  optionStates: OptionState[]
  onSelect: (index: number) => void
  onReplay: () => void
}

/** 听句选图：播放一句英文短句，从 3 个 emoji 中选出对应的场景 */
export default function ListenSentenceRenderer({ question, optionStates, onSelect, onReplay }: RendererProps) {
  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <motion.div
        className="flex flex-col items-center gap-2"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <AudioButton onPlay={onReplay} size="lg" hint="点我再听一次" />
      </motion.div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-[340px]">
        {question.options.map((option, index) => (
          <EnglishOptionCard
            key={index}
            option={option}
            index={index}
            state={optionStates[index]}
            variant="emoji"
            onSelect={() => onSelect(index)}
          />
        ))}
      </div>
    </div>
  )
}
