import { motion } from 'framer-motion'
import { useUserStore } from '@/store/useUserStore'
import { useGemStore } from '@/store/useGemStore'
import { useLearningStore } from '@/store/useLearningStore'

export default function ProfilePage() {
  const { currentUser } = useUserStore()
  const total = useGemStore(s => s.total)
  const { dailyProgress } = useLearningStore()

  return (
    <motion.div
      className="flex flex-col gap-4 py-2"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ─── 用户卡片 ─── */}
      <div className="relative toy-card p-6 pt-7 text-center overflow-hidden">
        {/* 顶部彩虹装饰条 */}
        <div className="absolute top-0 left-0 right-0 h-2 flex">
          <div className="flex-1 bg-rainbow-red" />
          <div className="flex-1 bg-rainbow-orange" />
          <div className="flex-1 bg-rainbow-yellow" />
          <div className="flex-1 bg-rainbow-green" />
          <div className="flex-1 bg-rainbow-blue" />
          <div className="flex-1 bg-rainbow-purple" />
        </div>

        {/* 漂浮装饰 */}
        <span className="absolute top-5 left-5 text-lg animate-float-slow select-none">🌸</span>
        <span className="absolute top-8 right-6 text-base animate-float-medium select-none">⭐</span>

        {/* 头像：彩虹渐变光环 */}
        <motion.div
          className="relative w-24 h-24 mx-auto rounded-full p-1 bg-gradient-to-br from-rainbow-orange via-rainbow-yellow to-rainbow-green toy-shadow"
          whileTap={{ scale: 0.92 }}
          animate={{ rotate: [0, 2, -2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white">
            {currentUser.avatar.startsWith('http') || currentUser.avatar.startsWith('/') ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-4xl">{currentUser.avatar}</span>
            )}
          </div>
          {/* 小皇冠 */}
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl drop-shadow-sm">👑</span>
        </motion.div>

        <h2 className="font-display text-2xl text-ink mt-4 leading-none">{currentUser.name}</h2>
        <p className="text-ink-soft text-xs mt-2">爱学习的快乐小孩 🌈</p>
      </div>

      {/* ─── 学习数据 ─── */}
      <div className="toy-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg leading-none">📊</span>
          <h3 className="font-display text-lg text-ink leading-none">学习数据</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center bg-bg-warm rounded-2xl py-3.5 border-2 border-white toy-shadow-sm">
            <p className="font-num text-2xl font-bold text-rainbow-orange leading-none">{getDayStreak()}</p>
            <p className="text-[11px] text-ink-soft mt-1.5">同行天数</p>
          </div>
          <div className="text-center bg-bg-warm rounded-2xl py-3.5 border-2 border-white toy-shadow-sm">
            <p className="font-num text-2xl font-bold text-gem-gold leading-none">{total}</p>
            <p className="text-[11px] text-ink-soft mt-1.5">宝石总数</p>
          </div>
          <div className="text-center bg-bg-warm rounded-2xl py-3.5 border-2 border-white toy-shadow-sm">
            <p className="font-num text-2xl font-bold text-rainbow-green leading-none">{dailyProgress.questionsCorrect}</p>
            <p className="text-[11px] text-ink-soft mt-1.5">今日答对</p>
          </div>
        </div>
      </div>

      {/* ─── 成就徽章 ─── */}
      <div className="toy-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg leading-none">🏅</span>
          <h3 className="font-display text-lg text-ink leading-none">我的成就</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {getAchievements(total).map((badge, i) => (
            <motion.div
              key={badge.name}
              className={`text-center rounded-2xl py-3 px-2 border-2 transition-all ${
                badge.unlocked
                  ? 'bg-gradient-to-b from-amber-50 to-orange-50 border-amber-200 toy-shadow-sm'
                  : 'bg-gray-50 border-gray-100 opacity-45 grayscale'
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: badge.unlocked ? 1 : 0.45 }}
              transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 300, damping: 18 }}
            >
              <motion.span
                className="text-2xl block"
                animate={badge.unlocked ? { y: [0, -3, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 + i * 0.5 }}
              >
                {badge.icon}
              </motion.span>
              <p className="text-[10px] font-bold text-ink mt-1 leading-tight">{badge.name}</p>
              <p className="text-[9px] text-ink-soft mt-0.5">{badge.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── 设置区域（预留） ─── */}
      <div className="toy-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg leading-none">⚙️</span>
          <h3 className="font-display text-lg text-ink leading-none">设置</h3>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-bg-warm border-2 border-white">
            <span className="text-sm text-ink">🔔 音效</span>
            <span className="text-xs text-rainbow-green font-bold">开启</span>
          </div>
          <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-bg-warm border-2 border-white">
            <span className="text-sm text-ink">📝 每日题数</span>
            <span className="font-num text-xs text-ink-soft font-bold">10 题</span>
          </div>
        </div>
      </div>
    </motion.div>
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

/** 成就徽章定义 */
interface Achievement {
  icon: string
  name: string
  desc: string
  unlocked: boolean
}

function getAchievements(gemTotal: number): Achievement[] {
  const streak = getDayStreak()
  return [
    { icon: '🌱', name: '小萌芽', desc: '开始学习', unlocked: streak >= 1 },
    { icon: '🌟', name: '小星星', desc: `同行${Math.min(streak, 7)}天`, unlocked: streak >= 7 },
    { icon: '🔥', name: '小火苗', desc: '同行30天', unlocked: streak >= 30 },
    { icon: '💎', name: '收藏家', desc: '10颗宝石', unlocked: gemTotal >= 10 },
    { icon: '👑', name: '宝石女王', desc: '50颗宝石', unlocked: gemTotal >= 50 },
    { icon: '🌈', name: '大满贯', desc: '100颗宝石', unlocked: gemTotal >= 100 },
  ]
}
