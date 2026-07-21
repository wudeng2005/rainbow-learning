import { useEffect, useRef, useState } from 'react'
import { useGemStore } from '@/store/useGemStore'
import { motion, AnimatePresence } from 'framer-motion'

/** 数字滚动动画 Hook */
function useAnimatedNumber(target: number, duration = 600) {
  const [display, setDisplay] = useState(target)
  const prevRef = useRef(target)

  useEffect(() => {
    const from = prevRef.current
    const to = target
    if (from === to) return

    const startTime = performance.now()
    let raf: number

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(from + (to - from) * eased))
      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        prevRef.current = to
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return display
}

export default function GemCounter() {
  const total = useGemStore(s => s.total)
  const displayNum = useAnimatedNumber(total)
  const [sparkle, setSparkle] = useState(false)
  const prevTotal = useRef(total)

  // 宝石增加时触发闪光
  useEffect(() => {
    if (total > prevTotal.current) {
      setSparkle(true)
      const t = setTimeout(() => setSparkle(false), 1200)
      prevTotal.current = total
      return () => clearTimeout(t)
    }
    prevTotal.current = total
  }, [total])

  return (
    <motion.div
      className="relative flex items-center gap-1 bg-gem-gold/10 px-3 py-1.5 rounded-full"
      whileTap={{ scale: 0.95 }}
    >
      {/* 宝石图标 */}
      <motion.span
        className="text-xl"
        animate={sparkle ? { rotate: [0, -15, 15, -8, 8, 0], scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.6 }}
      >
        💎
      </motion.span>

      {/* 数字 */}
      <motion.span
        className="font-bold text-gem-gold text-lg font-num min-w-[20px] text-center"
        key={displayNum}
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        {displayNum}
      </motion.span>

      {/* 增加时的闪光粒子 */}
      <AnimatePresence>
        {sparkle && (
          <>
            {['✨', '⭐', '💫'].map((s, i) => (
              <motion.span
                key={i}
                className="absolute text-xs pointer-events-none"
                style={{ top: -4, left: 8 + i * 12 }}
                initial={{ y: 0, opacity: 0, scale: 0 }}
                animate={{ y: -16 - i * 6, opacity: [0, 1, 0], scale: [0, 1.2, 0.5] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
              >
                {s}
              </motion.span>
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
