import { motion } from 'framer-motion'
import type { ComparisonData } from '@/types'
import MathOptionCard from './MathOptionCard'

interface ComparisonRendererProps {
  data: ComparisonData
  options: string[]
  optionStates: ('idle' | 'correct' | 'wrong' | 'disabled' | 'reveal')[]
  onSelect: (index: number) => void
}

export default function ComparisonRenderer({ data, options, optionStates, onSelect }: ComparisonRendererProps) {
  // 判断是否为"一样多"题型（选项中包含"一样多"）
  const isSameMode = options.some(o => o.includes('一样多'))

  const containerStyle = (state: string) => {
    if (state === 'correct') return 'border-emerald-300 bg-emerald-50 scale-105 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
    if (state === 'wrong') return 'border-rose-200 bg-rose-50 opacity-60 scale-95'
    if (state === 'disabled') return 'border-gray-200 bg-gray-50 opacity-50'
    return 'border-pink-200 bg-white shadow-[0_5px_0_rgba(190,80,120,0.12)] active:shadow-none active:translate-y-[5px]'
  }

  // ─── "一样多"模式：容器仅展示，下方提供文字选项按钮 ───
  if (isSameMode) {
    return (
      <div className="flex flex-col items-center gap-5 w-full">
        <div className="flex items-center gap-3 w-full max-w-[360px]">
          {/* 左容器 - 仅展示 */}
          <div className="flex-1 rounded-3xl p-5 min-h-[120px] border-3 border-pink-200 bg-white flex flex-wrap justify-center items-center gap-1">
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
          </div>

          {/* = 号 */}
          <motion.span
            className="text-2xl font-bold text-pink-400 flex-shrink-0"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            =
          </motion.span>

          {/* 右容器 - 仅展示 */}
          <div className="flex-1 rounded-3xl p-5 min-h-[120px] border-3 border-pink-200 bg-white flex flex-wrap justify-center items-center gap-1">
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
          </div>
        </div>

        {/* 文字选项按钮 */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-[360px]">
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

  // ─── 常规模式：哪边多/哪边少 - 点击容器选择 ───
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
