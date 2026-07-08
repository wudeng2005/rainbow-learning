import { motion, AnimatePresence } from 'framer-motion'

interface FeedbackOverlayProps {
  isVisible: boolean
  isCorrect: boolean
  message: string
  correctAnswer?: string
  onContinue: () => void
}

const CONFETTI_EMOJIS = ['⭐', '🌟', '✨', '🎉', '🎊', '🎈', '💖', '🌈', '🦋', '🎵', '🍭', '🧁']

/** SVG 打勾图标 — 答对时使用，路径动画绘制 */
function CheckIcon() {
  return (
    <div className="relative w-24 h-24 mx-auto mb-4">
      <motion.div
        className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-300 to-teal-200 flex items-center justify-center shadow-lg"
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 12, stiffness: 300, delay: 0.1 }}
      >
        <svg viewBox="0 0 80 80" className="w-14 h-14">
          <motion.path
            d="M22 42 L34 56 L58 24"
            fill="none"
            stroke="white"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
          />
        </svg>
      </motion.div>
      {/* 脉冲光环 */}
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-emerald-300/50"
        initial={{ scale: 1, opacity: 0.8 }}
        animate={{ scale: 1.4, opacity: 0 }}
        transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.5 }}
      />
    </div>
  )
}

/** SVG 灯泡图标 — 答错时使用，温暖鼓励 */
function BulbIcon() {
  return (
    <div className="relative w-24 h-24 mx-auto mb-4">
      <motion.div
        className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-200 to-orange-100 flex items-center justify-center shadow-lg"
        initial={{ scale: 0, rotate: 15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 12, stiffness: 300, delay: 0.1 }}
      >
        <svg viewBox="0 0 80 80" className="w-14 h-14">
          {/* 灯泡玻璃 */}
          <motion.path
            d="M30 38 C30 24, 50 24, 50 38 C50 44, 46 48, 46 52 L34 52 C34 48, 30 44, 30 38Z"
            fill="#FBBF24"
            stroke="#F59E0B"
            strokeWidth="2"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          />
          {/* 灯泡底座 */}
          <rect x="35" y="53" width="10" height="4" rx="2" fill="#F59E0B" />
          <rect x="36" y="58" width="8" height="3" rx="1.5" fill="#D97706" />
          {/* 发光光线 */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180
            const x1 = 40 + Math.cos(rad) * 22
            const y1 = 35 + Math.sin(rad) * 22
            const x2 = 40 + Math.cos(rad) * 28
            const y2 = 35 + Math.sin(rad) * 28
            return (
              <motion.line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#FCD34D"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.8, 0.4] }}
                transition={{ delay: 0.4 + i * 0.05, duration: 1.5, repeat: Infinity }}
              />
            )
          })}
        </svg>
      </motion.div>
      {/* 柔和脉冲 */}
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-amber-300/40"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  )
}

export default function FeedbackOverlay({
  isVisible, isCorrect, message, correctAnswer, onContinue,
}: FeedbackOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onContinue}
        >
          {/* 背景遮罩 */}
          <div className={`absolute inset-0 ${
            isCorrect
              ? 'bg-gradient-to-b from-purple-500/20 via-pink-500/15 to-blue-500/20'
              : 'bg-gradient-to-b from-amber-500/15 via-orange-400/10 to-yellow-500/15'
          } backdrop-blur-sm`} />

          {/* 正确：满屏撒花 */}
          {isCorrect && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {CONFETTI_EMOJIS.map((emoji, i) => (
                <motion.span
                  key={i}
                  className="absolute"
                  style={{
                    left: `${5 + i * 8}%`,
                    top: '-8%',
                    fontSize: `${20 + Math.random() * 16}px`,
                  }}
                  initial={{ y: -20, opacity: 0, rotate: 0 }}
                  animate={{
                    y: [null, window.innerHeight + 40],
                    opacity: [0, 1, 1, 0.8, 0],
                    rotate: [0, 180 + Math.random() * 360],
                    x: [0, (Math.random() - 0.5) * 100],
                  }}
                  transition={{
                    duration: 2.2 + Math.random() * 0.8,
                    delay: i * 0.08,
                    ease: 'easeIn',
                  }}
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
          )}

          {/* 错误：浮动爱心 */}
          {!isCorrect && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {['💛', '🧡', '💕', '🌸', '🌻'].map((emoji, i) => (
                <motion.span
                  key={i}
                  className="absolute text-xl"
                  style={{ left: `${15 + i * 16}%`, top: '60%' }}
                  initial={{ y: 0, opacity: 0, scale: 0.5 }}
                  animate={{
                    y: [0, -60 - Math.random() * 40],
                    opacity: [0, 0.7, 0],
                    scale: [0.5, 1, 0.8],
                  }}
                  transition={{
                    duration: 2, delay: i * 0.15, ease: 'easeOut',
                    repeat: Infinity, repeatDelay: 1,
                  }}
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
          )}

          {/* 主卡片 */}
          <motion.div
            className={`w-full max-w-[340px] md:max-w-[380px] rounded-[2rem] relative overflow-hidden shadow-2xl ${
              isCorrect
                ? 'bg-gradient-to-b from-white via-white to-emerald-50'
                : 'bg-gradient-to-b from-white via-white to-amber-50'
            }`}
            initial={{ scale: 0.5, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.6, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 400 }}
            onClick={e => e.stopPropagation()}
          >
            {/* 顶部渐变条 */}
            <motion.div
              className={`h-2 ${
                isCorrect
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400'
                  : 'bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400'
              }`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            />

            {/* 发光外圈 */}
            <div className={`absolute -inset-1 rounded-[2rem] -z-10 blur-md opacity-40 ${
              isCorrect
                ? 'bg-gradient-to-r from-emerald-300 to-teal-300'
                : 'bg-gradient-to-r from-amber-300 to-orange-300'
            }`} />

            <div className="px-7 pt-7 pb-7">
              {isCorrect ? <CheckIcon /> : <BulbIcon />}

              {/* 鼓励消息 */}
              <motion.p
                className={`text-xl font-extrabold mb-2 ${
                  isCorrect ? 'text-emerald-600' : 'text-amber-600'
                }`}
                initial={{ y: 10, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.25, type: 'spring', damping: 20 }}
              >
                {message}
              </motion.p>

              {/* 错误时显示正确答案 */}
              {!isCorrect && correctAnswer && (
                <motion.div
                  className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-2 mb-4"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.32 }}
                >
                  <span className="text-sm text-amber-500">正确答案是</span>
                  <span className="text-2xl font-bold text-amber-700">{correctAnswer}</span>
                </motion.div>
              )}

              {/* 继续按钮 */}
              <motion.button
                type="button"
                className={`w-full px-6 py-4 rounded-2xl text-white font-extrabold text-lg min-h-[56px]
                  shadow-lg active:shadow-sm transition-shadow touch-manipulation ${
                  isCorrect
                    ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400'
                    : 'bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400'
                }`}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.38, type: 'spring', damping: 20 }}
                whileTap={{ scale: 0.93 }}
                onClick={onContinue}
              >
                {isCorrect ? '继续冒险 →' : '再试一次！'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
