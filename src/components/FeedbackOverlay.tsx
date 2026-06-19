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
            className={`w-full max-w-sm rounded-[2rem] p-8 relative overflow-hidden text-center ${
              isCorrect
                ? 'bg-gradient-to-br from-emerald-50 via-white to-yellow-50 border-2 border-emerald-200'
                : 'bg-gradient-to-br from-purple-50 via-white to-blue-50 border-2 border-purple-200'
            } shadow-2xl`}
            initial={{ scale: 0.5, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
          >
            {/* 大表情 - 静态展示 */}
            <span className="text-6xl md:text-7xl block mb-4">
              {isCorrect ? '🎉' : '💪'}
            </span>

            {/* 鼓励消息 */}
            <motion.p
              className="text-xl md:text-2xl font-bold text-text-primary mb-2"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {message}
            </motion.p>

            {/* 错误时显示正确答案 */}
            {!isCorrect && correctAnswer && (
              <motion.p
                className="text-base text-text-secondary mb-3"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                正确答案是：<span className="text-3xl ml-1">{correctAnswer}</span>
              </motion.p>
            )}

            {/* 继续按钮 */}
            <motion.button
              type="button"
              className={`mt-5 px-10 py-4 rounded-full text-white font-bold text-lg min-h-[56px] min-w-[160px]
                shadow-lg active:shadow-md transition-shadow ${
                isCorrect
                  ? 'bg-gradient-to-r from-emerald-400 to-cyan-400'
                  : 'bg-gradient-to-r from-purple-400 to-blue-400'
              }`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              onClick={onContinue}
            >
              {isCorrect ? '太棒了！继续' : '知道了！'}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
