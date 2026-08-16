import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLearningStore } from '@/store/useLearningStore'
import { useMathLearningStore } from '@/store/useMathLearningStore'
import { useEnglishLearningStore } from '@/store/useEnglishLearningStore'
import { useErrorBankStore } from '@/store/useErrorBankStore'
import { useUserStore } from '@/store/useUserStore'
import { playTapSound } from '@/lib/sounds'

/* ─── 星星进度：更大更亮的星星 + 数字，孩子一眼能懂 ─── */
function StarProgress({ progress, litColor = '#FFC93C', done }: { progress: number; litColor?: string; done: number }) {
  const total = 5
  const lit = Math.round(progress * total)
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: total }, (_, i) => (
          <motion.span
            key={i}
            className="text-base leading-none"
            style={{
              color: i < lit ? litColor : 'rgba(255,255,255,0.4)',
              filter: i < lit ? 'drop-shadow(0 1px 3px rgba(0,0,0,0.25))' : 'none',
            }}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5 + i * 0.07, type: 'spring', stiffness: 300, damping: 15 }}
          >
            ★
          </motion.span>
        ))}
      </div>
      <span className="font-num text-[11px] font-bold text-white/80">{done}/10</span>
    </div>
  )
}

/* ─── 通关勋章：完成后的荣耀时刻 ─── */
function ClearBadge() {
  return (
    <motion.div
      className="inline-flex items-center gap-1 bg-white/95 rounded-full px-3 py-1.5 toy-shadow-sm"
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: 0.55, type: 'spring', stiffness: 300, damping: 12 }}
    >
      <span className="text-base">🏅</span>
      <span className="text-[11px] font-bold text-emerald-600">今日通关！</span>
    </motion.div>
  )
}

/* ─── 云朵小径：连接冒险岛屿的虚线路径 ─── */
function CloudPath() {
  return (
    <div className="relative z-10 flex justify-center py-0.5" aria-hidden>
      <div className="flex flex-col items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
        <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
        <span className="text-xs opacity-70">☁️</span>
      </div>
    </div>
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
  const allDone = dailyProgress.completed && mathProgress.completed && englishProgress.completed

  const chineseSubtitle = dailyProgress.completed
    ? '真棒，明天再来！'
    : dailyProgress.questionsDone > 0
      ? '继续加油，快完成啦'
      : '听故事 · 认新字'

  const mathSubtitle = mathProgress.completed
    ? '真棒，明天再来！'
    : mathProgress.questionsDone > 0
      ? '快完成啦'
      : '数一数 · 算一算'

  const englishSubtitle = englishProgress.completed
    ? '真棒，明天再来！'
    : englishProgress.questionsDone > 0
      ? '快完成啦'
      : 'ABC · 小单词'

  // 根据时间段选择问候语
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
      {/* ═══ 问候云岛：独角兽 + 问候 + 同行天数 ═══ */}
      <motion.section
        className="relative z-10 mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative overflow-hidden rounded-[28px] bg-white/90 backdrop-blur-sm border-[3px] border-white toy-shadow px-5 pt-5 pb-6">
          {/* 卡片内远景装饰：彩虹带 */}
          <div
            className="absolute -top-10 -right-12 w-44 h-44 rounded-full opacity-[0.12]"
            style={{ background: 'conic-gradient(from 180deg, #FF7B6B, #FFC93C, #5FD68B, #5BA8FF, #B07FE8, #FF7B6B)' }}
            aria-hidden
          />

          {/* 同行天数徽章 */}
          <motion.div
            className="absolute top-3 right-4 inline-flex items-center gap-1 bg-gradient-to-r from-rainbow-yellow to-rainbow-orange rounded-full px-3 py-1 border-2 border-white shadow-[0_3px_0_rgba(217,119,6,0.25)]"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3 }}
          >
            <span className="text-xs">🌟</span>
            <span className="font-num text-xs font-bold text-white">第 {getDayStreak()} 天</span>
          </motion.div>

          <div className="relative z-10 flex items-center gap-4">
            {/* 独角兽坐在云上 */}
            <div className="relative shrink-0 w-[88px]">
              <motion.div
                className="relative z-10 flex justify-center"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="text-[56px] leading-none drop-shadow-md">🦄</span>
              </motion.div>
              {/* 云朵底座：蓬松三层 */}
              <div className="relative -mt-3 flex justify-center">
                <div className="w-[88px] h-7 bg-white rounded-full shadow-[0_4px_10px_rgba(120,100,180,0.18)] border border-white" />
                <div className="absolute -top-3 left-3 w-8 h-8 bg-white rounded-full" />
                <div className="absolute -top-2 right-4 w-6 h-6 bg-white rounded-full" />
              </div>
            </div>

            {/* 问候文字 */}
            <div className="flex-1 min-w-0">
              <p className="font-display text-[22px] text-ink leading-tight">
                {greeting}，{currentUser.name}！{sceneEmoji}
              </p>
              <p className="text-[13px] text-ink-soft mt-1">
                {adventureText} ✨
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══ 区域标题 ═══ */}
      <motion.div
        className="relative z-10 flex items-center gap-2.5 mb-3 px-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex-1 h-[3px] rounded-full bg-gradient-to-r from-transparent via-white/80 to-white/40" />
        <span className="font-display text-sm text-ink-soft">选择今天的冒险世界</span>
        <div className="flex-1 h-[3px] rounded-full bg-gradient-to-l from-transparent via-white/80 to-white/40" />
      </motion.div>

      {/* ═══ 汉字天地：主岛（全宽） ═══ */}
      <motion.section
        className="relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.45 }}
      >
        <motion.button
          type="button"
          className="relative w-full overflow-hidden rounded-[30px] text-left cursor-pointer touch-manipulation border-[3px] border-white toy-shadow"
          style={{ background: 'linear-gradient(135deg, #FFB25E 0%, #FF8E53 55%, #FF7B6B 100%)' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { playTapSound(); navigate('/learn') }}
        >
          {/* 岛屿地貌：远山剪影 */}
          <div className="absolute -bottom-7 -left-6 w-44 h-24 bg-white/10 rounded-[50%]" aria-hidden />
          <div className="absolute -bottom-9 right-8 w-52 h-24 bg-white/10 rounded-[50%]" aria-hidden />
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/[0.06] to-transparent" aria-hidden />

          {/* 漂浮装饰 */}
          <span className="absolute top-4 right-14 text-2xl animate-float-slow select-none" aria-hidden>🏮</span>
          <span className="absolute bottom-12 right-7 text-3xl animate-drift-slow select-none" aria-hidden>🎋</span>
          <span className="absolute top-14 right-24 text-base animate-float-medium select-none opacity-80" aria-hidden>🍃</span>

          <div className="relative z-10 flex items-center gap-4 p-5">
            {/* 大熊猫：直接站在岛上 */}
            <motion.div
              className="shrink-0 drop-shadow-[0_6px_8px_rgba(180,80,40,0.35)]"
              animate={{ rotate: [0, -3, 3, 0], y: [0, -4, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-[64px] leading-none">🐼</span>
            </motion.div>

            {/* 文字 + 进度 */}
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-[26px] text-white leading-none drop-shadow-sm">汉字天地</h3>
              <p className="text-white/85 text-xs mt-1.5">{chineseSubtitle}</p>
              <div className="mt-2.5">
                {dailyProgress.completed ? (
                  <ClearBadge />
                ) : (
                  <StarProgress progress={chineseProgress} done={dailyProgress.questionsDone} />
                )}
              </div>
            </div>

            {/* 进入箭头 */}
            <motion.div
              className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 toy-shadow-sm"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-rainbow-orange text-2xl font-bold leading-none">›</span>
            </motion.div>
          </div>
        </motion.button>
      </motion.section>

      <CloudPath />

      {/* ═══ 数学王国 + 英语乐园：双岛并排 ═══ */}
      <div className="relative z-10 grid grid-cols-2 gap-3">
        {/* 数学王国：糖果岛 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45 }}
        >
          <motion.button
            type="button"
            className="relative w-full overflow-hidden rounded-[26px] text-left cursor-pointer touch-manipulation border-[3px] border-white toy-shadow pb-4 min-h-[180px]"
            style={{ background: 'linear-gradient(150deg, #FF9EC7 0%, #FF7BAC 60%, #F968A8 100%)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => { playTapSound(); navigate('/math-learn') }}
          >
            {/* 岛屿地貌：糖果山丘 */}
            <div className="absolute -bottom-6 -left-6 w-28 h-16 bg-white/10 rounded-[50%]" aria-hidden />
            <div className="absolute -bottom-7 right-0 w-32 h-16 bg-white/10 rounded-[50%]" aria-hidden />
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/[0.06] to-transparent" aria-hidden />

            {/* 漂浮装饰 */}
            <span className="absolute top-3 right-3 text-xl animate-candy-fall select-none" aria-hidden>🍭</span>
            <span className="absolute bottom-14 right-4 text-sm animate-float-fast select-none opacity-70" aria-hidden>🍬</span>

            <div className="relative z-10 pt-4 pl-4 pr-3">
              {/* 骰子精灵：站在岛上 */}
              <motion.div
                className="drop-shadow-[0_5px_7px_rgba(200,50,120,0.35)]"
                animate={{ rotate: [0, 8, 0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="text-[44px] leading-none">🎲</span>
              </motion.div>
              <h3 className="font-display text-xl text-white mt-2.5 leading-none drop-shadow-sm">数学王国</h3>
              <p className="text-white/85 text-[11px] mt-1.5">{mathSubtitle}</p>
              <div className="mt-2">
                {mathProgress.completed ? (
                  <ClearBadge />
                ) : (
                  <StarProgress progress={mathProgressRatio} done={mathProgress.questionsDone} />
                )}
              </div>
            </div>
          </motion.button>
        </motion.section>

        {/* 英语乐园：海洋岛 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.45 }}
        >
          <motion.button
            type="button"
            className="relative w-full overflow-hidden rounded-[26px] text-left cursor-pointer touch-manipulation border-[3px] border-white toy-shadow pb-4 min-h-[180px]"
            style={{ background: 'linear-gradient(150deg, #6FC0FF 0%, #5BA8FF 60%, #4D8DFF 100%)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => { playTapSound(); navigate('/english-learn') }}
          >
            {/* 岛屿地貌：海浪 */}
            <div className="absolute -bottom-6 -right-6 w-28 h-16 bg-white/10 rounded-[50%]" aria-hidden />
            <div className="absolute -bottom-7 -left-2 w-32 h-16 bg-white/10 rounded-[50%]" aria-hidden />
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/[0.06] to-transparent" aria-hidden />

            {/* 漂浮装饰 */}
            <span className="absolute top-3 right-3 text-xl animate-float-medium select-none" aria-hidden>🫧</span>
            <span className="absolute bottom-16 right-5 font-num text-sm font-bold text-white/50 animate-float-fast select-none" aria-hidden>Aa</span>

            <div className="relative z-10 pt-4 pl-4 pr-3">
              {/* 鹦鹉船长：站在岛上 */}
              <motion.div
                className="drop-shadow-[0_5px_7px_rgba(40,90,200,0.35)]"
                animate={{ y: [0, -5, 0], rotate: [0, -4, 4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="text-[44px] leading-none">🦜</span>
              </motion.div>
              <h3 className="font-display text-xl text-white mt-2.5 leading-none drop-shadow-sm">英语乐园</h3>
              <p className="text-white/85 text-[11px] mt-1.5">{englishSubtitle}</p>
              <div className="mt-2">
                {englishProgress.completed ? (
                  <ClearBadge />
                ) : (
                  <StarProgress progress={englishProgressRatio} done={englishProgress.questionsDone} />
                )}
              </div>
            </div>
          </motion.button>
        </motion.section>
      </div>

      <CloudPath />

      {/* ═══ 错题大冒险：龙穴入口 ═══ */}
      <motion.section
        className="relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.46, duration: 0.45 }}
      >
        <motion.button
          type="button"
          className="relative w-full overflow-hidden rounded-[26px] text-left cursor-pointer touch-manipulation border-[3px] border-white toy-shadow"
          style={{ background: 'linear-gradient(120deg, #B07FE8 0%, #9B6BE0 55%, #8E5BD8 100%)' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { playTapSound(); navigate('/review') }}
        >
          {/* 龙穴氛围 */}
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/10 rounded-full" aria-hidden />
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/[0.08] to-transparent" aria-hidden />
          <span className="absolute top-3 right-12 text-lg animate-star-pulse select-none" aria-hidden>✨</span>

          <div className="relative z-10 flex items-center gap-3.5 p-4">
            {/* 小龙 */}
            <motion.div
              className="shrink-0 drop-shadow-[0_5px_7px_rgba(90,40,160,0.4)]"
              animate={{ y: [0, -3, 0], rotate: [0, 3, -3, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
            >
              <span className="text-[42px] leading-none">🐉</span>
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
                <span className="text-rainbow-purple text-xl font-bold leading-none">›</span>
              </motion.div>
            )}
          </div>
        </motion.button>
      </motion.section>

      {/* ═══ 全部完成庆祝横幅 ═══ */}
      {allDone && (
        <motion.section
          className="relative z-10 mt-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55, type: 'spring', stiffness: 200, damping: 15 }}
        >
          <div className="relative overflow-hidden rounded-[26px] bg-white/85 backdrop-blur-sm border-[3px] border-white toy-shadow px-5 py-5 text-center">
            {/* 彩虹光带 */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rainbow-red via-rainbow-yellow to-rainbow-blue" aria-hidden />
            <motion.span
              className="text-4xl block mb-1.5"
              animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.12, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
            >
              🏆
            </motion.span>
            <p className="font-display text-lg text-ink">太厉害了，今天全部完成！</p>
            <p className="text-xs text-ink-soft mt-1">你是最棒的小冒险家，明天见~ 🌈</p>
          </div>
        </motion.section>
      )}

      {/* ═══ 每日鼓励语 ═══ */}
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
