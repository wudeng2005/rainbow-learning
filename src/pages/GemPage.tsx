import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGemStore } from '@/store/useGemStore'
import { useLearningStore } from '@/store/useLearningStore'
import { useMathLearningStore } from '@/store/useMathLearningStore'
import { useEnglishLearningStore } from '@/store/useEnglishLearningStore'
import { fetchLearningCalendar } from '@/lib/db'
import { getTodayStr } from '@/lib/storage'

/* ─── 宝石颜色 ─── */
const GEM_PALETTE = [
  { main: '#FF4D6D', light: '#FFB3C1', dark: '#A4133C' },
  { main: '#4895EF', light: '#A2D2FF', dark: '#1D4ED8' },
  { main: '#52B788', light: '#95D5B2', dark: '#1B7340' },
  { main: '#9B5DE5', light: '#D0AAFF', dark: '#6A1FB0' },
  { main: '#FFB703', light: '#FFE066', dark: '#CC8B00' },
  { main: '#FF6D00', light: '#FFAB76', dark: '#CC5500' },
  { main: '#E91E8F', light: '#FFB3D9', dark: '#9B1260' },
  { main: '#00B4D8', light: '#90E0EF', dark: '#0077B6' },
]

type GemColor = typeof GEM_PALETTE[0]

/* ─── 单颗宝石 SVG ─── */
function Gem({ color, size, x, y, delay }: {
  color: GemColor; size: number; x: number; y: number; delay: number
}) {
  const uid = `g${x}${y}${delay}`
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 15 }}
    >
      <ellipse cx={x} cy={y + size * 0.38} rx={size * 0.28} ry={size * 0.08} fill="rgba(0,0,0,0.08)" />
      <motion.g
        animate={{ y: [0, -0.8, 0] }}
        transition={{ duration: 3 + delay, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path
          d={`M${x} ${y - size * 0.5} L${x + size * 0.38} ${y - size * 0.05} L${x} ${y + size * 0.38} L${x - size * 0.38} ${y - size * 0.05} Z`}
          fill={`url(#${uid})`}
        />
        <path
          d={`M${x} ${y - size * 0.5} L${x - size * 0.18} ${y - size * 0.12} L${x} ${y - size * 0.02} L${x + size * 0.18} ${y - size * 0.12} Z`}
          fill={color.light} opacity="0.75"
        />
        <path
          d={`M${x - size * 0.38} ${y - size * 0.05} L${x - size * 0.18} ${y - size * 0.12} L${x} ${y - size * 0.5} Z`}
          fill={color.main} opacity="0.8"
        />
        <path
          d={`M${x + size * 0.38} ${y - size * 0.05} L${x + size * 0.18} ${y - size * 0.12} L${x} ${y - size * 0.5} Z`}
          fill={color.dark} opacity="0.8"
        />
        <path
          d={`M${x - size * 0.06} ${y - size * 0.42} L${x - size * 0.14} ${y - size * 0.16} L${x - size * 0.02} ${y - size * 0.2} Z`}
          fill="white" opacity="0.5"
        />
      </motion.g>
      <motion.circle
        cx={x - size * 0.08} cy={y - size * 0.38} r={size * 0.06} fill="white"
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2.5 + delay * 2 }}
      />
      <defs>
        <linearGradient id={uid} x1={x} y1={y - size * 0.5} x2={x} y2={y + size * 0.38} gradientUnits="userSpaceOnUse">
          <stop stopColor={color.light} />
          <stop offset="0.5" stopColor={color.main} />
          <stop offset="1" stopColor={color.dark} />
        </linearGradient>
      </defs>
    </motion.g>
  )
}

/* ─── 根据数量生成宝石布局 ─── */
function getGemLayout(count: number): Array<{ x: number; y: number; size: number; colorIdx: number }> {
  const display = Math.min(count, 15)
  if (display <= 3) {
    const layouts = [
      [{ x: 140, y: 130, size: 38, colorIdx: 0 }],
      [{ x: 118, y: 130, size: 36, colorIdx: 0 }, { x: 162, y: 128, size: 34, colorIdx: 1 }],
      [{ x: 108, y: 130, size: 34, colorIdx: 0 }, { x: 140, y: 128, size: 36, colorIdx: 1 }, { x: 172, y: 131, size: 32, colorIdx: 2 }],
    ]
    return layouts[display - 1]
  }
  if (display <= 6) {
    const base = [
      { x: 100, y: 140, size: 30, colorIdx: 0 }, { x: 135, y: 138, size: 32, colorIdx: 1 },
      { x: 170, y: 141, size: 30, colorIdx: 2 }, { x: 118, y: 118, size: 28, colorIdx: 3 },
      { x: 152, y: 116, size: 28, colorIdx: 4 }, { x: 135, y: 100, size: 26, colorIdx: 5 },
    ]
    return base.slice(0, display)
  }
  if (display <= 10) {
    const base = [
      { x: 90, y: 148, size: 28, colorIdx: 0 }, { x: 120, y: 146, size: 30, colorIdx: 1 },
      { x: 150, y: 148, size: 28, colorIdx: 2 }, { x: 180, y: 147, size: 27, colorIdx: 3 },
      { x: 105, y: 126, size: 26, colorIdx: 4 }, { x: 135, y: 124, size: 28, colorIdx: 5 },
      { x: 165, y: 125, size: 26, colorIdx: 6 }, { x: 120, y: 105, size: 24, colorIdx: 7 },
      { x: 150, y: 103, size: 24, colorIdx: 0 }, { x: 135, y: 86, size: 22, colorIdx: 1 },
    ]
    return base.slice(0, display)
  }
  return [
    { x: 82, y: 152, size: 26, colorIdx: 0 }, { x: 110, y: 150, size: 28, colorIdx: 1 },
    { x: 140, y: 152, size: 27, colorIdx: 2 }, { x: 168, y: 150, size: 28, colorIdx: 3 },
    { x: 196, y: 152, size: 26, colorIdx: 4 }, { x: 96, y: 130, size: 25, colorIdx: 5 },
    { x: 125, y: 128, size: 27, colorIdx: 6 }, { x: 155, y: 129, size: 26, colorIdx: 7 },
    { x: 182, y: 130, size: 25, colorIdx: 0 }, { x: 110, y: 108, size: 24, colorIdx: 1 },
    { x: 140, y: 106, size: 25, colorIdx: 2 }, { x: 168, y: 108, size: 24, colorIdx: 3 },
    { x: 125, y: 88, size: 22, colorIdx: 4 }, { x: 155, y: 87, size: 22, colorIdx: 5 },
    { x: 140, y: 70, size: 20, colorIdx: 6 },
  ].slice(0, display)
}

/* ─── 宝石堆场景 ─── */
function GemPile({ count }: { count: number }) {
  const layout = getGemLayout(count)
  const svgHeight = count <= 3 ? 160 : count <= 6 ? 170 : count <= 10 ? 180 : 190

  return (
    <motion.svg
      width="280" height={svgHeight} viewBox={`0 0 280 ${svgHeight}`}
      fill="none" className="mx-auto"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
    >
      <ellipse cx="140" cy={svgHeight - 20} rx="100" ry="12" fill="url(#ground-shadow)" />
      {layout.map((gem, i) => (
        <Gem key={i} color={GEM_PALETTE[gem.colorIdx]} size={gem.size} x={gem.x} y={gem.y} delay={i * 0.08} />
      ))}
      {count > 3 && (
        <>
          {[0, 1, 2].map(i => (
            <motion.text
              key={i} x={115 + i * 25} y={count <= 6 ? 75 : count <= 10 ? 65 : 50}
              fontSize="10" fill="#FFD700"
              animate={{ opacity: [0, 0.7, 0], y: [0, -8] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 + i * 0.8, ease: 'easeOut' }}
            >✦</motion.text>
          ))}
        </>
      )}
      <defs>
        <radialGradient id="ground-shadow" cx="140" cy={svgHeight - 20} rx="100" ry="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D4A574" stopOpacity="0.15" />
          <stop offset="1" stopColor="#D4A574" stopOpacity="0" />
        </radialGradient>
      </defs>
    </motion.svg>
  )
}

/* ─── 学习日历 ─── */
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

function LearningCalendar({ learnedDates }: { learnedDates: Set<string> }) {
  const today = getTodayStr()
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const { year, month } = viewDate
  const firstDay = new Date(year, month, 1).getDay() // 0=周日
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // 判断今天是否已学习（本地状态）
  const chineseCompleted = useLearningStore(s => s.dailyProgress.completed)
  const mathCompleted = useMathLearningStore(s => s.dailyProgress.completed)
  const englishCompleted = useEnglishLearningStore(s => s.dailyProgress.completed)
  const todayLearned = chineseCompleted || mathCompleted || englishCompleted

  const prevMonth = () => {
    setViewDate(d => d.month === 0 ? { year: d.year - 1, month: 11 } : { ...d, month: d.month - 1 })
  }
  const nextMonth = () => {
    setViewDate(d => d.month === 11 ? { year: d.year + 1, month: 0 } : { ...d, month: d.month + 1 })
  }

  // 本月学习天数
  const monthLearnedCount = Array.from({ length: daysInMonth }, (_, i) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
    return learnedDates.has(dateStr) || (dateStr === today && todayLearned)
  }).filter(Boolean).length

  const isCurrentMonth = new Date().getFullYear() === year && new Date().getMonth() === month

  return (
    <div className="toy-card p-5">
      {/* 月份导航 */}
      <div className="flex items-center justify-between mb-4">
        <motion.button
          type="button"
          className="w-10 h-10 rounded-full bg-bg-warm border-2 border-white flex items-center justify-center text-ink-soft touch-manipulation toy-shadow-sm"
          whileTap={{ scale: 0.9 }}
          onClick={prevMonth}
        >
          <span className="text-lg leading-none">‹</span>
        </motion.button>
        <div className="text-center">
          <h3 className="font-display text-lg text-ink leading-none">{year}年{month + 1}月</h3>
          <p className="text-[11px] text-ink-soft mt-1">
            本月学习 <span className="font-num font-bold text-rainbow-green">{monthLearnedCount}</span> 天
          </p>
        </div>
        <motion.button
          type="button"
          className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center touch-manipulation ${
            isCurrentMonth ? 'bg-gray-50 text-gray-300' : 'bg-bg-warm text-ink-soft toy-shadow-sm'
          }`}
          whileTap={isCurrentMonth ? {} : { scale: 0.9 }}
          onClick={isCurrentMonth ? undefined : nextMonth}
          disabled={isCurrentMonth}
        >
          <span className="text-lg leading-none">›</span>
        </motion.button>
      </div>

      {/* 星期头 */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[11px] font-medium text-ink-soft py-1">
            {d}
          </div>
        ))}
      </div>

      {/* 日期格子 */}
      <div className="grid grid-cols-7 gap-y-1">
        {/* 前置空白 */}
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* 每天 */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isLearned = learnedDates.has(dateStr) || (dateStr === today && todayLearned)
          const isToday = dateStr === today
          const isFuture = new Date(dateStr) > new Date()

          return (
            <div key={day} className="flex items-center justify-center py-0.5">
              <motion.div
                className={`relative w-9 h-9 rounded-full flex items-center justify-center font-num text-sm ${
                  isLearned
                    ? 'bg-gradient-to-br from-rainbow-green to-emerald-400 text-white font-bold toy-shadow-sm'
                    : isToday
                      ? 'bg-rainbow-yellow/20 text-amber-700 font-bold ring-2 ring-rainbow-yellow'
                      : isFuture
                        ? 'text-gray-300'
                        : 'text-ink-soft'
                }`}
                initial={isLearned ? { scale: 0.5, opacity: 0 } : false}
                animate={isLearned ? { scale: 1, opacity: 1 } : undefined}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: day * 0.01 }}
              >
                {day}
                {/* 学习完成标记 */}
                {isLearned && (
                  <motion.span
                    className="absolute -top-1 -right-1 text-[11px]"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + day * 0.01, type: 'spring' }}
                  >
                    ⭐
                  </motion.span>
                )}
              </motion.div>
            </div>
          )
        })}
      </div>

      {/* 图例 */}
      <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t-2 border-bg-warm">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-gradient-to-br from-rainbow-green to-emerald-400" />
          <span className="text-[10px] text-ink-soft">已学习</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full ring-2 ring-rainbow-yellow bg-rainbow-yellow/20" />
          <span className="text-[10px] text-ink-soft">今天</span>
        </div>
      </div>
    </div>
  )
}

/* ─── 主页面 ─── */
export default function GemPage() {
  const { total } = useGemStore()
  const [learnedDates, setLearnedDates] = useState<Set<string>>(new Set())

  // 从 Supabase 获取学习日历数据
  useEffect(() => {
    fetchLearningCalendar()
      .then(dates => setLearnedDates(new Set(dates)))
      .catch(() => {
        // 离线时从本地 gem records 推断学习日期
        const records = useGemStore.getState().records
        const dates = new Set(records.map(r => r.date))
        setLearnedDates(dates)
      })
  }, [])

  return (
    <motion.div
      className="flex flex-col gap-4 py-2"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ─── 页面标题 ─── */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-xl leading-none">🎁</span>
        <h2 className="font-display text-xl text-ink leading-none">我的宝箱</h2>
      </div>

      {/* ─── 宝石展示区 ─── */}
      <div className="relative toy-card pt-6 pb-5 px-4 overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute top-3 left-6 text-2xl opacity-25 animate-float-slow">✨</div>
        <div className="absolute top-8 right-8 text-xl opacity-20 animate-float-medium">💫</div>
        <div className="absolute bottom-4 left-10 text-lg opacity-15 animate-float-fast">⭐</div>

        {total > 0 ? (
          <GemPile count={total} />
        ) : (
          <div className="flex justify-center py-8">
            <motion.span
              className="text-6xl"
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.08, 1], y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              💎
            </motion.span>
          </div>
        )}

        {/* 数量 + 描述 */}
        <motion.div
          className="text-center mt-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="font-display text-2xl text-ink leading-none">
            {total > 0 ? (
              <>
                <span className="font-num text-3xl font-bold text-rainbow-orange">{total}</span>
                <span className="text-base ml-1">颗宝石</span>
              </>
            ) : '等你来收集！'}
          </p>
          <p className="text-ink-soft text-xs mt-2">
            {total === 0 ? '完成学习就能获得闪亮宝石哦 ✨' : '每一颗都是你努力的奖励 🌟'}
          </p>
        </motion.div>
      </div>

      {/* ─── 学习日历 ─── */}
      <div className="flex items-center gap-2 px-1 mt-1">
        <span className="text-xl leading-none">📅</span>
        <h2 className="font-display text-xl text-ink leading-none">学习日历</h2>
      </div>
      <LearningCalendar learnedDates={learnedDates} />
    </motion.div>
  )
}
