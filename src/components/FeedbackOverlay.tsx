import { motion, AnimatePresence } from 'framer-motion'

interface FeedbackOverlayProps {
  isVisible: boolean
  isCorrect: boolean
  message: string
  correctAnswer?: string
  onContinue: () => void
}

export default function FeedbackOverlay({
  isVisible,
  isCorrect,
  message,
  correctAnswer,
  onContinue,
}: FeedbackOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onContinue}
        >
          {/* 正确时的撒花效果 */}
          {isCorrect && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {['⭐', '✨', '🌟', '🎉', '🎈', '🥳'].map((emoji, i) => (
                <motion.span
                  key={i}
                  className="absolute text-2xl md:text-3xl"
                  style={{
                    left: `${15 + i * 14}%`,
                    top: '50%',
                  }}
                  initial={{ y: 0, opacity: 1, scale: 0 }}
                  animate={{
                    y: [0, -120 - Math.random() * 80],
                    x: [0, (Math.random() - 0.5) * 60],
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1.2, 1],
                    rotate: [0, Math.random() * 360],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.1,
                    ease: 'easeOut',
                  }}
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
          )}

          <motion.div
            className={`w-full max-w-[340px] md:max-w-[400px] rounded-[1.5rem] relative overflow-hidden text-center shadow-2xl bg-white ${
              isCorrect ? 'border-2 border-emerald-300' : 'border-2 border-amber-300'
            }`}
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 15, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 450 }}
            onClick={e => e.stopPropagation()}
          >
            {/* 顶部色带 */}
            <div className={`h-1.5 ${
              isCorrect
                ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                : 'bg-gradient-to-r from-amber-400 to-orange-400'
            }`} />

            <div className="px-6 pt-6 pb-6">
              {/* 图标圆形背景 */}
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                isCorrect ? 'bg-emerald-100' : 'bg-amber-100'
              }`}>
                <span className="text-4xl">
                  {isCorrect ? '🎉' : '💪'}
                </span>
              </div>

              {/* 鼓励消息 */}
              <motion.p
                className={`text-lg font-bold mb-1.5 ${
                  isCorrect ? 'text-emerald-600' : 'text-amber-600'
                }`}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                {message}
              </motion.p>

              {/* 错误时显示正确答案 */}
              {!isCorrect && correctAnswer && (
                <motion.div
                  className="inline-flex items-center gap-1.5 bg-amber-50 rounded-full px-3.5 py-1 mb-3"
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.22 }}
                >
                  <span className="text-xs text-amber-500">正确答案</span>
                  <span className="text-lg font-bold text-amber-700">{correctAnswer}</span>
                </motion.div>
              )}

              {/* 继续按钮 */}
              <motion.button
                type="button"
                className={`w-full px-6 py-3 rounded-full text-white font-bold text-base min-h-[52px]
                  shadow-md active:shadow-sm transition-shadow touch-manipulation ${
                  isCorrect
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                    : 'bg-gradient-to-r from-amber-400 to-orange-400'
                }`}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.28, type: 'spring' }}
                whileTap={{ scale: 0.95 }}
                onClick={onContinue}
              >
                {isCorrect ? '太棒了！继续' : '知道了！'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
