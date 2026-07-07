import { motion } from 'framer-motion'

interface AudioButtonProps {
  /** 点击时播放发音 */
  onPlay: () => void
  /** 尺寸变体 */
  size?: 'lg' | 'md'
  /** 提示文字，如“点我再听一次” */
  hint?: string
}

/** 大喇叭发音按钮 — 触摸友好，听力题的核心交互 */
export default function AudioButton({ onPlay, size = 'lg', hint }: AudioButtonProps) {
  const dim = size === 'lg' ? 'w-28 h-28 text-6xl' : 'w-16 h-16 text-3xl'

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        type="button"
        className={`${dim} rounded-full bg-gradient-to-b from-sky-400 to-blue-500 text-white
          shadow-lg flex items-center justify-center touch-manipulation select-none`}
        onClick={onPlay}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ scale: { duration: 1.8, repeat: Infinity, repeatDelay: 0.4 } }}
        aria-label="播放发音"
      >
        🔊
      </motion.button>
      {hint && <span className="text-xs text-sky-600 font-medium">{hint}</span>}
    </div>
  )
}
