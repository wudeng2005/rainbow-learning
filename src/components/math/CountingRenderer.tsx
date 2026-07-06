import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { CountingData } from '@/types'
import MathOptionCard from './MathOptionCard'

interface CountingRendererProps {
  data: CountingData
  options: string[]
  optionStates: ('idle' | 'correct' | 'wrong' | 'disabled' | 'reveal')[]
  onSelect: (index: number) => void
}

export default function CountingRenderer({ data, options, optionStates, onSelect }: CountingRendererProps) {
  // 随机散落位置（组件挂载时确定）
  const positions = useMemo(() => {
    return Array.from({ length: data.count }, (_, i) => ({
      rotate: data.layout === 'scattered' ? (Math.random() - 0.5) * 20 : 0,
      offsetX: data.layout === 'scattered' ? (Math.random() - 0.5) * 10 : 0,
      offsetY: data.layout === 'scattered' ? (Math.random() - 0.5) * 10 : 0,
      delay: i * 0.08,
    }))
  }, [data.count, data.layout])

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* emoji 展示区 */}
      <div className="bg-white rounded-[2rem] p-6 shadow-lg border-2 border-pink-100 min-h-[140px] w-full max-w-[320px] flex items-center justify-center">
        <div className={`flex flex-wrap justify-center gap-3 ${data.layout === 'scattered' ? 'gap-4' : 'gap-2'}`}>
          {Array.from({ length: data.count }, (_, i) => (
            <motion.span
              key={i}
              className="text-3xl md:text-4xl"
              style={{
                transform: `rotate(${positions[i].rotate}deg) translate(${positions[i].offsetX}px, ${positions[i].offsetY}px)`,
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: positions[i].delay * 0.5, duration: 0.2 }}
            >
              {data.emoji}
            </motion.span>
          ))}
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
