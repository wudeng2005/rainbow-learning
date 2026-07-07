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

/** 自然拼读：播放单词发音，选出它的开头字母 */
export default function PhonicsRenderer({ question, optionStates, onSelect, onReplay }: RendererProps) {
  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <AudioButton onPlay={onReplay} size="lg" hint="点我再听一次" />
      </motion.div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-[320px]">
        {question.options.map((option, index) => (
          <EnglishOptionCard
            key={index}
            option={option}
            index={index}
            state={optionStates[index]}
            variant="letter"
            onSelect={() => onSelect(index)}
          />
        ))}
      </div>
    </div>
  )
}
