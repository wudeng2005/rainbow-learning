import { motion } from 'framer-motion'
import type { ShapeData } from '@/types'

interface ShapeRendererProps {
  data: ShapeData
  optionStates: ('idle' | 'correct' | 'wrong' | 'disabled')[]
  onSelect: (index: number) => void
}

export default function ShapeRenderer({ data, optionStates, onSelect }: ShapeRendererProps) {
  const cellStyle = (state: string) => {
    if (state === 'correct') return 'border-emerald-300 bg-emerald-50 shadow-[0_0_16px_rgba(16,185,129,0.25)] scale-110'
    if (state === 'wrong') return 'border-rose-200 bg-rose-50 opacity-60 scale-95'
    if (state === 'disabled') return 'border-gray-200 bg-gray-50 opacity-50'
    return 'border-pink-200 bg-white shadow-[0_5px_0_rgba(190,80,120,0.12)] active:shadow-none active:translate-y-[5px]'
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="grid grid-cols-2 gap-4 w-full max-w-[280px]">
        {data.items.map((item, i) => (
          <motion.button
            key={i}
            type="button"
            className={`aspect-square rounded-3xl border-3 flex items-center justify-center
              cursor-pointer transition-all duration-300 touch-manipulation ${cellStyle(optionStates[i])}`}
            onClick={optionStates[i] === 'idle' ? () => onSelect(i) : undefined}
            disabled={optionStates[i] !== 'idle'}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
            whileTap={optionStates[i] === 'idle' ? { scale: 0.9 } : undefined}
          >
            <span className="text-5xl md:text-6xl">{item}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
