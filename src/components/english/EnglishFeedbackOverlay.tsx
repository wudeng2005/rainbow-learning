import { motion, AnimatePresence } from 'framer-motion'

interface EnglishFeedbackOverlayProps {
  isVisible: boolean
  isCorrect: boolean
  message: string
  correctAnswer?: string
  onContinue: () => void
}

const CONFETTI_EMOJIS = ['🌈', '⭐', '🎵', '🦜', '✨', '🎉', '🎈', '💫', '🦄', '🌟', '🎶', '🎀']

function CheckIcon() {
  return (
    <div className="relative w-24 h-24 mx-auto mb-4">
      <motion.div
        className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-300 to-blue-200 flex items-center justify-center shadow-lg"
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 12, stiffness: 300, delay: 0.1 }}
      >
        <svg viewBox="0 0 80 80" className="w-14 h-14">
          <motion.path
            d="M22 42 L34 56 L58 24"
            fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
          />
        </svg>
      </motion.div>
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-sky-300/50"
        initial={{ scale: 1, opacity: 0.8 }}
        animate={{ scale: 1.4, opacity: 0 }}
        transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.5 }}
      />
    </div>
  )
}

function BulbIcon() {
  return (
    <div className="relative w-24 h-24 mx-auto mb-4">
      <motion.div
        className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-200 to-cyan-100 flex items-center justify-center shadow-lg"
        initial={{ scale: 0, rotate: 15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 12, stiffness: 300, delay: 0.1 }}
      >
        <svg viewBox="0 0 80 80" className="w-14 h-14">
          <motion.path
            d="M30 38 C30 24, 50 24, 50 38 C50 44, 46 48, 46 52 L34 52 C34 48, 30 44, 30 38Z"
            fill="#FBBF24" stroke="#F59E0B" strokeWidth="2"
            initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          />
          <rect x="35" y="53" width="10" height="4" rx="2" fill="#F59E0B" />
          <rect x="36" y="58" width="8" height="3" rx="1.5" fill="#D97706" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180
            const x1 = 40 + Math.cos(rad) * 22, y1 = 35 + Math.sin(rad) * 22
            const x2 = 40 + Math.cos(rad) * 28, y2 = 35 + Math.sin(rad) * 28
            return (
              <motion.line
                key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#FCD34D" strokeWidth="2.5" strokeLinecap="round"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.8, 0.4] }}
                transition={{ delay: 0.4 + i * 0.05, duration: 1.5, repeat: Infinity }}
              />
            )
          })}
        </svg>
      </motion.div>
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-sky-300/40"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  )
}

export default function EnglishFeedbackOverlay({
  isVisible, isCorrect, message, correctAnswer, onContinue,
}: EnglishFeedbackOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }} onClick={onContinue}
        >
          <div className={`absolute inset-0 ${
            isCorrect ? 'bg-gradient-to-b from-sky-500/20 via-blue-500/15 to-violet-500/20'
              : 'bg-gradient-to-b from-sky-500/15 via-blue-400/10 to-cyan-500/15'
          } backdrop-blur-sm`} />

          {isCorrect && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {CONFETTI_EMOJIS.map((emoji, i) => (
                <motion.span key={i} className="absolute" style={{ left: `${5 + i * 8}%`, top: '-8%', fontSize: `${20 + Math.random() * 16}px` }}
                  initial={{ y: -20, opacity: 0, rotate: 0 }}
                  animate={{ y: [null, window.innerHeight + 40], opacity: [0, 1, 1, 0.8, 0], rotate: [0, 180 + Math.random() * 360], x: [0, (Math.random() - 0.5) * 100] }}
                  transition={{ duration: 2.2 + Math.random() * 0.8, delay: i * 0.08, ease: 'easeIn' }}
                >{emoji}</motion.span>
              ))}
            </div>
          )}

          {!isCorrect && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {['💙', '🩵', '💕', '🌸', '🦋'].map((emoji, i) => (
                <motion.span key={i} className="absolute text-xl" style={{ left: `${15 + i * 16}%`, top: '60%' }}
                  initial={{ y: 0, opacity: 0, scale: 0.5 }}
                  animate={{ y: [0, -60 - Math.random() * 40], opacity: [0, 0.7, 0], scale: [0.5, 1, 0.8] }}
                  transition={{ duration: 2, delay: i * 0.15, ease: 'easeOut', repeat: Infinity, repeatDelay: 1 }}
                >{emoji}</motion.span>
              ))}
            </div>
          )}

          <motion.div
            className={`w-full max-w-[340px] md:max-w-[380px] rounded-[2rem] relative overflow-hidden shadow-2xl ${
              isCorrect ? 'bg-gradient-to-b from-white via-white to-sky-50' : 'bg-gradient-to-b from-white via-white to-blue-50'
            }`}
            initial={{ scale: 0.5, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.6, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 400 }}
            onClick={e => e.stopPropagation()}
          >
            <motion.div className={`h-2 ${isCorrect ? 'bg-gradient-to-r from-sky-400 via-blue-400 to-violet-400' : 'bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-400'}`}
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.2, duration: 0.4 }} />

            <div className={`absolute -inset-1 rounded-[2rem] -z-10 blur-md opacity-40 ${isCorrect ? 'bg-gradient-to-r from-sky-300 to-blue-300' : 'bg-gradient-to-r from-sky-300 to-cyan-300'}`} />

            <div className="px-7 pt-7 pb-7">
              {isCorrect ? <CheckIcon /> : <BulbIcon />}

              <motion.p className={`text-xl font-extrabold mb-2 ${isCorrect ? 'text-sky-600' : 'text-blue-600'}`}
                initial={{ y: 10, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.25, type: 'spring', damping: 20 }}>
                {message}
              </motion.p>

              {!isCorrect && correctAnswer && (
                <motion.div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-full px-4 py-2 mb-4"
                  initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.32 }}>
                  <span className="text-sm text-sky-500">正确答案是</span>
                  <span className="text-2xl font-bold text-sky-700">{correctAnswer}</span>
                </motion.div>
              )}

              <motion.button type="button"
                className={`w-full px-6 py-4 rounded-2xl text-white font-extrabold text-lg min-h-[56px] shadow-lg active:shadow-sm transition-shadow touch-manipulation ${
                  isCorrect ? 'bg-gradient-to-r from-sky-400 via-blue-400 to-violet-400' : 'bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-400'
                }`}
                initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.38, type: 'spring', damping: 20 }}
                whileTap={{ scale: 0.93 }} onClick={onContinue}>
                {isCorrect ? 'Keep Going! →' : 'Try Again!'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
