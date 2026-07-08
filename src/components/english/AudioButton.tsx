import { motion } from 'framer-motion'

interface AudioButtonProps {
  /** 点击时播放发音 */
  onPlay: () => void
  /** 尺寸变体 */
  size?: 'lg' | 'md'
  /** 提示文字，如"点我再听一次" */
  hint?: string
}

/**
 * 鹦鹉小助手发音按钮 — 英语模块的吉祥物，活泼可爱
 * 大号：听力题主按钮（带完整动画）
 * 中号：复习页次按钮（紧凑版）
 */
export default function AudioButton({ onPlay, size = 'lg', hint }: AudioButtonProps) {
  const isLarge = size === 'lg'

  /* ── 大尺寸：鹦鹉主角 + 声波动画 ── */
  if (isLarge) {
    return (
      <div className="flex flex-col items-center gap-3">
        <motion.button
          type="button"
          className="relative w-32 h-32 rounded-[2rem] bg-gradient-to-br from-sky-300 via-blue-400 to-indigo-400
            shadow-[0_8px_30px_rgba(56,189,248,0.4)] flex items-center justify-center
            touch-manipulation select-none border-4 border-white/50"
          onClick={onPlay}
          whileTap={{ scale: 0.88, rotate: -5 }}
          animate={{
            y: [0, -6, 0],
            rotate: [0, -2, 2, 0],
          }}
          transition={{
            y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 },
          }}
          aria-label="播放发音"
        >
          {/* 发光脉冲光环 */}
          <motion.div
            className="absolute inset-0 rounded-[2rem] bg-white/20"
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* 左侧声波 */}
          <div className="absolute -left-5 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
            {[0, 1, 2].map(i => (
              <motion.div
                key={`l${i}`}
                className="h-1 rounded-full bg-sky-400/70"
                animate={{
                  width: [4, 12 + i * 4, 4],
                  opacity: [0.4, 0.9, 0.4],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>

          {/* 右侧声波 */}
          <div className="absolute -right-5 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
            {[0, 1, 2].map(i => (
              <motion.div
                key={`r${i}`}
                className="h-1 rounded-full bg-sky-400/70"
                animate={{
                  width: [4, 12 + i * 4, 4],
                  opacity: [0.4, 0.9, 0.4],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>

          {/* 小音符飞出 */}
          <motion.span
            className="absolute -top-2 -right-2 text-lg"
            animate={{
              y: [0, -12, 0],
              x: [0, 6, 0],
              opacity: [0.7, 1, 0.7],
              rotate: [0, 15, 0],
            }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 0.2 }}
          >
            🎵
          </motion.span>

          <motion.span
            className="absolute -bottom-1 -left-2 text-base"
            animate={{
              y: [0, -8, 0],
              x: [0, -4, 0],
              opacity: [0.5, 0.9, 0.5],
              rotate: [0, -10, 0],
            }}
            transition={{ duration: 2.2, repeat: Infinity, delay: 0.8 }}
          >
            🎶
          </motion.span>

          {/* 鹦鹉主角 */}
          <motion.span
            className="text-6xl relative z-10 drop-shadow-md"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🦜
          </motion.span>
        </motion.button>

        {/* 提示文字 */}
        {hint && (
          <motion.span
            className="text-sm text-sky-500 font-bold flex items-center gap-1"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span>👆</span> {hint}
          </motion.span>
        )}
      </div>
    )
  }

  /* ── 中尺寸：紧凑版鹦鹉按钮 ── */
  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.button
        type="button"
        className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-300 via-blue-400 to-indigo-400
          shadow-[0_4px_16px_rgba(56,189,248,0.35)] flex items-center justify-center
          touch-manipulation select-none border-3 border-white/50"
        onClick={onPlay}
        whileTap={{ scale: 0.88, rotate: -5 }}
        animate={{ y: [0, -3, 0] }}
        transition={{ y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } }}
        aria-label="播放发音"
      >
        {/* 发光脉冲 */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-white/20"
          animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* 右侧小音符 */}
        <motion.span
          className="absolute -top-1.5 -right-1.5 text-xs"
          animate={{ y: [0, -6, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          🎵
        </motion.span>

        <span className="text-3xl relative z-10 drop-shadow-sm">🦜</span>
      </motion.button>
      {hint && (
        <span className="text-xs text-sky-500 font-bold">{hint}</span>
      )}
    </div>
  )
}
