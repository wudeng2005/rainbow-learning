import { motion } from 'framer-motion'

interface AudioButtonProps {
  onPlay: () => void
  size?: 'lg' | 'md'
  hint?: string
}

/**
 * 发音按钮 — 使用 SVG 扬声器图标，直观清晰
 * 大号：听力题主按钮（完整动画）
 * 中号：复习页紧凑版
 */
export default function AudioButton({ onPlay, size = 'lg', hint }: AudioButtonProps) {
  const isLarge = size === 'lg'

  if (isLarge) {
    return (
      <div className="flex flex-col items-center gap-3">
        <motion.button
          type="button"
          className="relative w-32 h-32 rounded-[2rem] bg-gradient-to-br from-sky-300 via-blue-400 to-indigo-400
            shadow-[0_8px_30px_rgba(56,189,248,0.4)] flex items-center justify-center
            touch-manipulation select-none border-4 border-white/50"
          onClick={onPlay}
          whileTap={{ scale: 0.88 }}
          animate={{ y: [0, -6, 0] }}
          transition={{ y: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
          aria-label="播放发音"
        >
          {/* 发光脉冲 */}
          <motion.div
            className="absolute inset-0 rounded-[2rem] bg-white/20"
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* SVG 扬声器 + 声波动画 */}
          <svg viewBox="0 0 100 100" className="w-20 h-20 relative z-10">
            {/* 扬声器主体 */}
            <rect x="16" y="38" width="14" height="24" rx="3" fill="white" />
            <path d="M30 38 L50 20 L50 80 L30 62 Z" fill="white" />

            {/* 声波弧线 — 依次脉冲 */}
            <motion.path
              d="M58 32 Q72 50 58 68"
              fill="none" stroke="white" strokeWidth="4" strokeLinecap="round"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
            />
            <motion.path
              d="M66 22 Q86 50 66 78"
              fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
            />
            <motion.path
              d="M74 14 Q98 50 74 86"
              fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"
              animate={{ opacity: [0.1, 0.6, 0.1] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
            />
          </svg>
        </motion.button>

        {/* 提示文字 */}
        {hint && (
          <motion.span
            className="text-sm text-sky-500 font-bold flex items-center gap-1"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            👆 {hint}
          </motion.span>
        )}
      </div>
    )
  }

  /* ── 中尺寸 ── */
  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.button
        type="button"
        className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-300 via-blue-400 to-indigo-400
          shadow-[0_4px_16px_rgba(56,189,248,0.35)] flex items-center justify-center
          touch-manipulation select-none border-3 border-white/50"
        onClick={onPlay}
        whileTap={{ scale: 0.88 }}
        animate={{ y: [0, -3, 0] }}
        transition={{ y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } }}
        aria-label="播放发音"
      >
        <motion.div
          className="absolute inset-0 rounded-2xl bg-white/20"
          animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <svg viewBox="0 0 100 100" className="w-9 h-9 relative z-10">
          <rect x="16" y="38" width="14" height="24" rx="3" fill="white" />
          <path d="M30 38 L50 20 L50 80 L30 62 Z" fill="white" />
          <motion.path
            d="M58 32 Q72 50 58 68"
            fill="none" stroke="white" strokeWidth="5" strokeLinecap="round"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <motion.path
            d="M66 22 Q86 50 66 78"
            fill="none" stroke="white" strokeWidth="4" strokeLinecap="round"
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
          />
        </svg>
      </motion.button>
      {hint && <span className="text-xs text-sky-500 font-bold">{hint}</span>}
    </div>
  )
}
