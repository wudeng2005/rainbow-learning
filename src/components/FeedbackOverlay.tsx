import { motion, AnimatePresence } from 'framer-motion'
import StarAnimation from './StarAnimation'

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
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onContinue}
        >
          <motion.div
            className={`w-full max-w-lg rounded-t-3xl p-6 pb-10 relative overflow-hidden ${
              isCorrect
                ? 'bg-gradient-to-b from-correct/5 to-white'
                : 'bg-gradient-to-b from-wrong-soft/5 to-white'
            }`}
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            exit={{ y: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
          >
            {isCorrect && <StarAnimation />}

            <div className="relative z-10 text-center">
              <span className="text-5xl mb-3 block">
                {isCorrect ? '🎉' : '💪'}
              </span>
              <p className="text-xl font-bold text-text-primary mb-2">
                {message}
              </p>
              {!isCorrect && correctAnswer && (
                <p className="text-base text-text-secondary mb-2">
                  正确答案是：<span className="text-2xl">{correctAnswer}</span>
                </p>
              )}
              <button
                type="button"
                className={`mt-4 px-8 py-3 rounded-full text-white font-bold text-lg min-h-[48px] ${
                  isCorrect
                    ? 'bg-gradient-to-r from-rainbow-green to-rainbow-blue'
                    : 'bg-gradient-to-r from-rainbow-purple to-rainbow-blue'
                }`}
                onClick={onContinue}
              >
                {isCorrect ? '继续' : '知道了'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
