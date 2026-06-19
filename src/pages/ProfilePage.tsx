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
      className="flex flex-col gap-5 py-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* 用户卡片 */}
      <div className="bg-white rounded-3xl p-6 shadow-sm text-center">
        <motion.div
          className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-rainbow-orange via-rainbow-yellow to-rainbow-green flex items-center justify-center shadow-md border-3 border-white"
          whileTap={{ scale: 0.9 }}
        >
          {currentUser.avatar.startsWith('http') || currentUser.avatar.startsWith('/') ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-4xl">{currentUser.avatar}</span>
          )}
        </motion.div>
        <h2 className="text-xl font-bold text-text-primary mt-3">{currentUser.name}</h2>
        <p className="text-text-secondary text-sm mt-1">小小学习家</p>
      </div>

      {/* 学习数据 */}
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <h3 className="text-base font-bold text-text-primary mb-4">学习数据</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-rainbow-orange">{getDayStreak()}</p>
            <p className="text-xs text-text-secondary mt-1">同行天数</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gem-gold">{total}</p>
            <p className="text-xs text-text-secondary mt-1">宝石总数</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-rainbow-green">{dailyProgress.questionsCorrect}</p>
            <p className="text-xs text-text-secondary mt-1">今日答对</p>
          </div>
        </div>
      </div>

      {/* 设置区域（预留） */}
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <h3 className="text-base font-bold text-text-primary mb-3">设置</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-text-primary">音效</span>
            <span className="text-xs text-text-secondary">开启</span>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-gray-50">
            <span className="text-sm text-text-primary">每日题数</span>
            <span className="text-xs text-text-secondary">5 题</span>
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
