import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLearningStore } from '@/store/useLearningStore'
import { useErrorBankStore } from '@/store/useErrorBankStore'
import { useUserStore } from '@/store/useUserStore'

/* ─── Floating particles ─── */
function Particle({ emoji, delay, x }: { emoji: string; delay: number; x: number }) {
  return (
    <motion.span
      className="absolute text-lg pointer-events-none select-none"
      style={{ left: `${x}%` }}
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: [0, 0.5, 0.5, 0], y: [60, 10, -30, -80] }}
      transition={{ duration: 8, delay, repeat: Infinity, repeatDelay: 4, ease: 'easeOut' }}
    >
      {emoji}
    </motion.span>
  )
}

/* ─── Subject card (responsive) ─── */
function SubjectCard({
  icon, title, gradient, locked, badge, onClick,
}: {
  icon: string
  title: string
  gradient: string
  locked?: boolean
  badge?: string
  onClick?: () => void
}) {
  return (
    <motion.div
      className={`relative flex-1 min-w-[120px] rounded-[24px] p-4 pb-3 flex flex-col items-center gap-1.5 shadow-lg ${gradient} ${locked ? 'opacity-50 saturate-50' : 'cursor-pointer'}`}
      whileTap={locked ? {} : { scale: 0.93 }}
      whileHover={locked ? {} : { y: -4 }}
      onClick={locked ? undefined : onClick}
    >
      {/* 装饰光圈 */}
      <div className="absolute -top-3 -right-3 w-14 h-14 rounded-full bg-white/10 blur-[2px]" />

      {/* 大图标 — 视觉主体 */}
      <motion.div
        className="w-[60px] h-[60px] md:w-[72px] md:h-[72px] rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
        animate={locked ? {} : { y: [0, -4, 0], rotate: [0, -2, 2, 0] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 0.5 }}
      >
        <span className="text-[36px] md:text-[44px] leading-none">{icon}</span>
      </motion.div>

      {/* 标题 */}
      <h3 className="text-white font-bold text-sm text-center leading-tight mt-1">{title}</h3>

      {/* 标签 */}
      {locked ? (
        <span className="text-[10px] bg-white/15 text-white/80 px-2 py-0.5 rounded-full">
          🔒 敬请期待
        </span>
      ) : badge ? (
        <span className="text-[10px] bg-white/25 text-white font-medium px-2 py-0.5 rounded-full">
          {badge}
        </span>
      ) : null}
    </motion.div>
  )
}

/* ─── Main Page ─── */
export default function HomePage() {
  const navigate = useNavigate()
  const { dailyProgress, resetIfNewDay } = useLearningStore()
  const errorCount = useErrorBankStore(s => s.getErrorCount())
  const { currentUser } = useUserStore()

  useEffect(() => { resetIfNewDay() }, [resetIfNewDay])

  const isCompleted = dailyProgress.completed
  const chineseBadge = isCompleted
    ? '完成啦 ✅'
    : dailyProgress.questionsDone > 0
      ? `${dailyProgress.questionsDone}/5`
      : '去冒险'

  return (
    <div className="relative min-h-[calc(100dvh-140px)] pb-6">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Particle emoji="⭐" delay={0} x={6} />
        <Particle emoji="🌟" delay={2.5} x={80} />
        <Particle emoji="✨" delay={4.5} x={45} />
        <Particle emoji="🦋" delay={1.5} x={92} />
        <Particle emoji="🌸" delay={3.5} x={22} />
      </div>

      {/* ─── Hero Greeting ─── */}
      <motion.section
        className="relative z-10 pt-3 pb-5"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex justify-center mb-3">
          <div className="inline-flex items-center gap-1.5 bg-white/60 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm text-xs text-text-secondary font-medium">
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              🤝
            </motion.span>
            <span>我们一起走过了第 {getDayStreak()} 天</span>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-text-primary">
            {currentUser.name}，今天想学什么？
          </h2>
          <p className="text-text-secondary text-sm mt-1">每天进步一点点 ✨</p>
        </div>
      </motion.section>

      {/* ─── Learning Modules (responsive flex) ─── */}
      <motion.section
        className="relative z-10 mb-5"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <h3 className="text-xs font-semibold text-text-secondary tracking-widest uppercase px-2 mb-3">
          📚 学习乐园
        </h3>

        {/* Flex row — fills width on all screens */}
        <div className="flex gap-3 px-1">
          <SubjectCard
            icon="🐼"
            title="汉字天地"
            gradient="bg-gradient-to-b from-rainbow-orange to-amber-500"
            badge={chineseBadge}
            onClick={() => navigate('/learn')}
          />
          <SubjectCard
            icon="🦜"
            title="英语乐园"
            gradient="bg-gradient-to-b from-rainbow-blue to-sky-500"
            locked
          />
          <SubjectCard
            icon="🎲"
            title="数学王国"
            gradient="bg-gradient-to-b from-rainbow-green to-emerald-500"
            locked
          />
        </div>
      </motion.section>

      {/* ─── Error Challenge ─── */}
      <motion.section
        className="relative z-10 px-1"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <h3 className="text-xs font-semibold text-text-secondary tracking-widest uppercase px-2 mb-3">
          🏰 挑战关卡
        </h3>

        <motion.div
          className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-violet-500 via-rainbow-purple to-fuchsia-500 p-4 md:p-5 shadow-lg cursor-pointer"
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/review')}
        >
          {/* 装饰 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center"
                animate={{ y: [0, -3, 0], rotate: [0, 3, -3, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
              >
                <span className="text-[32px] leading-none">🐉</span>
              </motion.div>
              <div>
                <h4 className="text-white font-bold text-base">错题大冒险</h4>
                <p className="text-white/70 text-xs mt-0.5">
                  {errorCount > 0
                    ? `${errorCount} 只小怪兽等你来打败！`
                    : '小怪兽都被打跑啦，你太厉害了！'}
                </p>
              </div>
            </div>

            {errorCount > 0 && (
              <motion.div
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <span className="text-white text-xl font-bold">›</span>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.section>
    </div>
  )
}

function getDayStreak(): number {
  try {
    const stored = localStorage.getItem('rainbow-first-day')
    const today = new Date().toISOString().split('T')[0]
    if (!stored) {
      localStorage.setItem('rainbow-first-day', today)
      return 1
    }
    const diff = Math.floor(
      (new Date(today).getTime() - new Date(stored).getTime()) / (1000 * 60 * 60 * 24)
    )
    return Math.max(1, diff + 1)
  } catch {
    return 1
  }
}
