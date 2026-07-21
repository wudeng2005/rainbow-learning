import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLearningStore } from '@/store/useLearningStore'
import { useMathLearningStore } from '@/store/useMathLearningStore'
import { useEnglishLearningStore } from '@/store/useEnglishLearningStore'
import { useErrorBankStore } from '@/store/useErrorBankStore'
import { useUserStore } from '@/store/useUserStore'
import { playTapSound } from '@/lib/sounds'

/* ─── 星星进度条：点亮的小星星，比百分比更懂孩子 ─── */
function StarProgress({ progress, litColor = '#FFC93C' }: { progress: number; litColor?: string }) {
  const total = 5
  const lit = Math.round(progress * total)
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }, (_, i) => (
        <motion.span
          key={i}
          className="text-sm leading-none"
          style={{
            color: i < lit ? litColor : 'rgba(255,255,255,0.35)',
            filter: i < lit ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' : 'none',
          }}
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.4 + i * 0.08, type: 'spring', stiffness: 300, damping: 15 }}
        >
          ★
        </motion.span>
      ))}
    </div>
  )
}

/* ─── 完成徽章：今天完成啦 ─── */
function DoneBadge() {
  return (
    <motion.span
      className="inline-flex items-center gap-1 bg-white/90 rounded-full px-2.5 py-1 text-[11px] font-bold text-emerald-600 toy-shadow-sm"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 12 }}
    >
      🎉 今天完成啦
    </motion.span>
  )
}

/* ─── 主页面 ─── */
export default function HomePage() {
  const navigate = useNavigate()
  const { dailyProgress, resetIfNewDay } = useLearningStore()
  const mathProgress = useMathLearningStore(s => s.dailyProgress)
  const mathResetIfNewDay = useMathLearningStore(s => s.resetIfNewDay)
  const englishProgress = useEnglishLearningStore(s => s.dailyProgress)
  const englishResetIfNewDay = useEnglishLearningStore(s => s.resetIfNewDay)
  const errorCount = useErrorBankStore(s => s.getErrorCount())
  const { currentUser } = useUserStore()

  useEffect(() => { resetIfNewDay(); mathResetIfNewDay(); englishResetIfNewDay() }, [resetIfNewDay, mathResetIfNewDay, englishResetIfNewDay])

  const chineseProgress = dailyProgress.completed ? 1 : dailyProgress.questionsDone / 10
  const mathProgressRatio = mathProgress.completed ? 1 : mathProgress.questionsDone / 10
  const englishProgressRatio = englishProgress.completed ? 1 : englishProgress.questionsDone / 10

  const chineseSubtitle = dailyProgress.completed
    ? '真棒，明天再来！'
    : dailyProgress.questionsDone > 0
      ? `已闯关 ${dailyProgress.questionsDone}/10`
      : '听故事 · 认新字'

  const mathSubtitle = mathProgress.completed
    ? '真棒，明天再来！'
    : mathProgress.questionsDone > 0
      ? `已闯关 ${mathProgress.questionsDone}/10`
      : '数一数 · 算一算'

  const englishSubtitle = englishProgress.completed
    ? '真棒，明天再来！'
    : englishProgress.questionsDone > 0
      ? `已闯关 ${englishProgress.questionsDone}/10`
      : 'ABC · 小单词'

  // 根据时间段选择问候语和场景描述
  const hour = new Date().getHours()
  const greeting = hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好'
  const sceneEmoji = hour < 11 ? '☀️' : hour < 14 ? '🌤️' : hour < 18 ? '🌅' : '🌙'
  const adventureText = hour < 11
    ? '今天想去哪个世界冒险呀'
    : hour < 18
      ? '下午想来点什么好玩的'
      : '晚上好，来一场小冒险吧'

  return (
    <div className="relative pb-6">
      {/* ─── 吉祥物问候：独角兽坐在云朵上 ─── */}
      <motion.section
        className="relative z-10 pt-2 pb-5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-end gap-3">
          {/* 独角兽 + 云朵底座 */}
          <div className="relative shrink-0">
            <motion.div
              className="relative z-10 flex items-center justify-center"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-[44px] leading-none drop-shadow-sm">🦄</span>
            </motion.div>
            {/* 云朵底座 */}
            <div className="relative -mt-2.5">
              <div className="w-20 h-6 bg-white rounded-full shadow-[0_4px_10px_rgba(120,100,180,0.15)]" />
              <div className="absolute -top-2.5 left-3 w-7 h-7 bg-white rounded-full" />
              <div className="absolute -top-1.5 left-9 w-5 h-5 bg-white rounded-full" />
            </div>
          </div>

          {/* 对话气泡 */}
          <motion.div
            className="relative flex-1 bg-white rounded-3xl rounded-bl-lg px-4 py-3 toy-shadow-sm border-2 border-white"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 18 }}
          >
            <p className="font-display text-lg text-ink leading-tight">
              {greeting}，{currentUser.name}！{sceneEmoji}
            </p>
            <p className="text-xs text-ink-soft mt-0.5">
              {adventureText} ✨
            </p>
            {/* 同行天数徽章 */}
            <motion.div
              className="absolute -top-3 right-3 inline-flex items-center gap-1 bg-gradient-to-r from-rainbow-yellow to-rainbow-orange rounded-full px-2.5 py-1 toy-shadow-sm border-2 border-white"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <span className="text-[11px]">🌟</span>
              <span className="font-num text-[11px] font-bold text-white">第 {getDayStreak()} 天</span>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* ─── 汉字天地：竹林熊猫大场景卡 ─── */}
      <motion.section
        className="relative z-10 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45 }}
      >
        <motion.button
          type="button"
          className="relative w-full overflow-hidden rounded-[32px] text-left cursor-pointer touch-manipulation border-[3px] border-white toy-shadow"
          style={{ background: 'linear-gradient(135deg, #FFB25E 0%, #FF8E53 55%, #FF7B6B 100%)' }}
          whileTap={{ scale: 0.97 }}
          whileHover={{ y: -3 }}
          onClick={() => { playTapSound(); navigate('/learn') }}
        >
          {/* 场景装饰：远山 + 竹子 + 灯笼 */}
          <div className="absolute -bottom-6 -left-4 w-40 h-24 bg-white/10 rounded-[50%]" />
          <div className="absolute -bottom-8 right-10 w-48 h-24 bg-white/10 rounded-[50%]" />
          <span className="absolute top-3 right-4 text-2xl animate-float-slow select-none">🏮</span>
          <span className="absolute bottom-14 right-8 text-3xl animate-drift-slow select-none">🎋</span>
          <span className="absolute top-12 right-16 text-lg animate-float-medium select-none opacity-80">🍃</span>

          <div className="relative z-10 flex items-center gap-4 p-5 pr-4">
            {/* 大熊猫 */}
            <motion.div
              className="w-[84px] h-[84px] rounded-[28px] bg-white/25 backdrop-blur-sm flex items-center justify-center shrink-0 border-2 border-white/60"
              animate={{ rotate: [0, -3, 3, 0], y: [0, -3, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-[52px] leading-none">🐼</span>
            </motion.div>

            {/* 文字 + 进度 */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-[26px] text-white leading-none drop-shadow-sm">汉字天地</h3>
              </div>
              <p className="text-white/85 text-xs mt-1.5">{chineseSubtitle}</p>
              <div className="mt-2.5">
                {dailyProgress.completed ? (
                  <DoneBadge />
                ) : (
                  <StarProgress progress={chineseProgress} />
                )}
              </div>
            </div>

            {/* 进入箭头 */}
            <motion.div
              className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0 toy-shadow-sm"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-rainbow-orange text-xl font-bold leading-none">›</span>
            </motion.div>
          </div>
        </motion.button>
      </motion.section>

      {/* ─── 数学王国 + 英语乐园：两座小岛并排 ─── */}
      <div className="relative z-10 grid grid-cols-2 gap-3 mb-4">
        {/* 数学王国：糖果粉 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
        >
          <motion.button
            type="button"
            className="relative w-full overflow-hidden rounded-[28px] text-left cursor-pointer touch-manipulation border-[3px] border-white toy-shadow pb-4"
            style={{ background: 'linear-gradient(150deg, #FF9EC7 0%, #FF7BAC 60%, #F968A8 100%)' }}
            whileTap={{ scale: 0.96 }}
            whileHover={{ y: -3 }}
            onClick={() => { playTapSound(); navigate('/math-learn') }}
          >
            {/* 装饰：糖果 + 几何 */}
            <span className="absolute top-2.5 right-3 text-xl animate-candy-fall select-none">🍭</span>
            <span className="absolute bottom-12 right-5 text-sm animate-float-fast select-none opacity-70">🔷</span>
            <div className="absolute -bottom-5 -left-5 w-24 h-16 bg-white/10 rounded-[50%]" />

            <div className="relative z-10 pt-4 pl-4">
              <motion.div
                className="w-14 h-14 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center border-2 border-white/60"
                animate={{ rotate: [0, 8, 0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="text-[34px] leading-none">🎲</span>
              </motion.div>
              <h3 className="font-display text-xl text-white mt-3 leading-none drop-shadow-sm">数学王国</h3>
              <p className="text-white/85 text-[11px] mt-1.5">{mathSubtitle}</p>
              <div className="mt-2">
                {mathProgress.completed ? (
                  <DoneBadge />
                ) : (
                  <StarProgress progress={mathProgressRatio} />
                )}
              </div>
            </div>
          </motion.button>
        </motion.section>

        {/* 英语乐园：海洋蓝 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.45 }}
        >
          <motion.button
            type="button"
            className="relative w-full overflow-hidden rounded-[28px] text-left cursor-pointer touch-manipulation border-[3px] border-white toy-shadow pb-4"
            style={{ background: 'linear-gradient(150deg, #6FC0FF 0%, #5BA8FF 60%, #4D8DFF 100%)' }}
            whileTap={{ scale: 0.96 }}
            whileHover={{ y: -3 }}
            onClick={() => { playTapSound(); navigate('/english-learn') }}
          >
            {/* 装饰：气泡 + 字母 */}
            <span className="absolute top-2.5 right-3 text-xl animate-float-medium select-none">🫧</span>
            <span className="absolute bottom-14 right-6 font-num text-sm font-bold text-white/50 animate-float-fast select-none">Aa</span>
            <div className="absolute -bottom-5 -right-5 w-24 h-16 bg-white/10 rounded-[50%]" />

            <div className="relative z-10 pt-4 pl-4">
              <motion.div
                className="w-14 h-14 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center border-2 border-white/60"
                animate={{ y: [0, -4, 0], rotate: [0, -4, 4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="text-[34px] leading-none">🦜</span>
              </motion.div>
              <h3 className="font-display text-xl text-white mt-3 leading-none drop-shadow-sm">英语乐园</h3>
              <p className="text-white/85 text-[11px] mt-1.5">{englishSubtitle}</p>
              <div className="mt-2">
                {englishProgress.completed ? (
                  <DoneBadge />
                ) : (
                  <StarProgress progress={englishProgressRatio} />
                )}
              </div>
            </div>
          </motion.button>
        </motion.section>
      </div>

      {/* ─── 错题大冒险：龙穴入口 ─── */}
      <motion.section
        className="relative z-10 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38, duration: 0.45 }}
      >
        <motion.button
          type="button"
          className="relative w-full overflow-hidden rounded-[26px] text-left cursor-pointer touch-manipulation border-[3px] border-white toy-shadow"
          style={{ background: 'linear-gradient(120deg, #B07FE8 0%, #9B6BE0 55%, #8E5BD8 100%)' }}
          whileTap={{ scale: 0.97 }}
          whileHover={{ y: -2 }}
          onClick={() => { playTapSound(); navigate('/review') }}
        >
          {/* 装饰 */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
          <span className="absolute top-2.5 right-12 text-lg animate-star-pulse select-none">✨</span>

          <div className="relative z-10 flex items-center gap-3.5 p-4">
            <motion.div
              className="w-14 h-14 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center shrink-0 border-2 border-white/60"
              animate={{ y: [0, -3, 0], rotate: [0, 3, -3, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
            >
              <span className="text-[32px] leading-none">🐉</span>
            </motion.div>
            <div className="flex-1 min-w-0">
              <h4 className="font-display text-lg text-white leading-none drop-shadow-sm">错题大冒险</h4>
              <p className="text-white/85 text-[11px] mt-1.5">
                {errorCount > 0
                  ? `${errorCount} 只小怪兽等你来打败！`
                  : '小怪兽都被打跑啦，你太厉害了！'}
              </p>
            </div>

            {errorCount > 0 && (
              <motion.div
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 toy-shadow-sm"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <span className="text-rainbow-purple text-lg font-bold leading-none">›</span>
              </motion.div>
            )}
          </div>
        </motion.button>
      </motion.section>

      {/* ─── 全部完成庆祝横幅 ─── */}
      {dailyProgress.completed && mathProgress.completed && englishProgress.completed && (
        <motion.section
          className="relative z-10 mt-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 15 }}
        >
          <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-rainbow-yellow/20 via-rainbow-green/20 to-rainbow-blue/20 border-2 border-white toy-shadow-sm px-5 py-4 text-center">
            <motion.span
              className="text-3xl block mb-1"
              animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
            >
              🏆
            </motion.span>
            <p className="font-display text-base text-ink">太厉害了，今天全部完成！</p>
            <p className="text-xs text-ink-soft mt-1">你是最棒的小冒险家，明天见~ 🌈</p>
          </div>
        </motion.section>
      )}

      {/* ─── 每日鼓励语 ─── */}
      <motion.p
        className="relative z-10 text-center text-[11px] text-ink-soft/70 mt-5 font-display"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        {getDailyMotto()}
      </motion.p>
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

/** 每日鼓励语：根据日期轮换 */
const DAILY_MOTTOS = [
  '🌟 每天进步一点点，你就是最闪亮的小星星',
  '🌈 学习就像彩虹，每一种颜色都很美',
  '🚀 小小的你，有大大的能量',
  '🌻 坚持就是超能力，你已经在用了',
  '🎨 每一个新字都是一幅画',
  '🦄 相信自己，你比想象中更厉害',
  '🍀 今天的努力，是明天的礼物',
]

function getDailyMotto(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  )
  return DAILY_MOTTOS[dayOfYear % DAILY_MOTTOS.length]
}
