import { motion } from 'framer-motion'
import { useGemStore } from '@/store/useGemStore'

const sourceLabels: Record<string, string> = {
  daily_complete: '完成每日任务',
  perfect_score: '全部答对奖励',
  review_complete: '闯关成功',
  math_daily_complete: '完成数学任务',
  math_perfect_score: '数学全对奖励',
  english_daily_complete: '完成英语任务',
  english_perfect_score: '英语全对奖励',
}

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
      {/* 地面阴影 */}
      <ellipse
        cx={x}
        cy={y + size * 0.38}
        rx={size * 0.28}
        ry={size * 0.08}
        fill="rgba(0,0,0,0.08)"
      />
      {/* 宝石主体 */}
      <motion.g
        animate={{ y: [0, -0.8, 0] }}
        transition={{ duration: 3 + delay, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* 菱形主体 */}
        <path
          d={`M${x} ${y - size * 0.5} L${x + size * 0.38} ${y - size * 0.05} L${x} ${y + size * 0.38} L${x - size * 0.38} ${y - size * 0.05} Z`}
          fill={`url(#${uid})`}
        />
        {/* 顶部切面 */}
        <path
          d={`M${x} ${y - size * 0.5} L${x - size * 0.18} ${y - size * 0.12} L${x} ${y - size * 0.02} L${x + size * 0.18} ${y - size * 0.12} Z`}
          fill={color.light}
          opacity="0.75"
        />
        {/* 左面 */}
        <path
          d={`M${x - size * 0.38} ${y - size * 0.05} L${x - size * 0.18} ${y - size * 0.12} L${x} ${y - size * 0.5} Z`}
          fill={color.main}
          opacity="0.8"
        />
        {/* 右面 */}
        <path
          d={`M${x + size * 0.38} ${y - size * 0.05} L${x + size * 0.18} ${y - size * 0.12} L${x} ${y - size * 0.5} Z`}
          fill={color.dark}
          opacity="0.8"
        />
        {/* 高光 */}
        <path
          d={`M${x - size * 0.06} ${y - size * 0.42} L${x - size * 0.14} ${y - size * 0.16} L${x - size * 0.02} ${y - size * 0.2} Z`}
          fill="white"
          opacity="0.5"
        />
      </motion.g>
      {/* 闪光点 */}
      <motion.circle
        cx={x - size * 0.08}
        cy={y - size * 0.38}
        r={size * 0.06}
        fill="white"
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
  // 最多展示 15 颗（堆成小山的视觉上限）
  const display = Math.min(count, 15)

  if (display <= 3) {
    // 1-3颗：一排平铺在地上
    const layouts = [
      [{ x: 140, y: 130, size: 38, colorIdx: 0 }],
      [{ x: 118, y: 130, size: 36, colorIdx: 0 }, { x: 162, y: 128, size: 34, colorIdx: 1 }],
      [{ x: 108, y: 130, size: 34, colorIdx: 0 }, { x: 140, y: 128, size: 36, colorIdx: 1 }, { x: 172, y: 131, size: 32, colorIdx: 2 }],
    ]
    return layouts[display - 1]
  }

  if (display <= 6) {
    // 4-6颗：两层小堆
    const base = [
      { x: 100, y: 140, size: 30, colorIdx: 0 },
      { x: 135, y: 138, size: 32, colorIdx: 1 },
      { x: 170, y: 141, size: 30, colorIdx: 2 },
      { x: 118, y: 118, size: 28, colorIdx: 3 },
      { x: 152, y: 116, size: 28, colorIdx: 4 },
      { x: 135, y: 100, size: 26, colorIdx: 5 },
    ]
    return base.slice(0, display)
  }

  if (display <= 10) {
    // 7-10颗：三层小山
    const base = [
      { x: 90, y: 148, size: 28, colorIdx: 0 },
      { x: 120, y: 146, size: 30, colorIdx: 1 },
      { x: 150, y: 148, size: 28, colorIdx: 2 },
      { x: 180, y: 147, size: 27, colorIdx: 3 },
      { x: 105, y: 126, size: 26, colorIdx: 4 },
      { x: 135, y: 124, size: 28, colorIdx: 5 },
      { x: 165, y: 125, size: 26, colorIdx: 6 },
      { x: 120, y: 105, size: 24, colorIdx: 7 },
      { x: 150, y: 103, size: 24, colorIdx: 0 },
      { x: 135, y: 86, size: 22, colorIdx: 1 },
    ]
    return base.slice(0, display)
  }

  // 11-15颗：满满的小山
  return [
    { x: 82, y: 152, size: 26, colorIdx: 0 },
    { x: 110, y: 150, size: 28, colorIdx: 1 },
    { x: 140, y: 152, size: 27, colorIdx: 2 },
    { x: 168, y: 150, size: 28, colorIdx: 3 },
    { x: 196, y: 152, size: 26, colorIdx: 4 },
    { x: 96, y: 130, size: 25, colorIdx: 5 },
    { x: 125, y: 128, size: 27, colorIdx: 6 },
    { x: 155, y: 129, size: 26, colorIdx: 7 },
    { x: 182, y: 130, size: 25, colorIdx: 0 },
    { x: 110, y: 108, size: 24, colorIdx: 1 },
    { x: 140, y: 106, size: 25, colorIdx: 2 },
    { x: 168, y: 108, size: 24, colorIdx: 3 },
    { x: 125, y: 88, size: 22, colorIdx: 4 },
    { x: 155, y: 87, size: 22, colorIdx: 5 },
    { x: 140, y: 70, size: 20, colorIdx: 6 },
  ].slice(0, display)
}

/* ─── 宝石堆场景 ─── */
function GemPile({ count }: { count: number }) {
  const layout = getGemLayout(count)
  // 画布高度根据数量调整
  const svgHeight = count <= 3 ? 160 : count <= 6 ? 170 : count <= 10 ? 180 : 190

  return (
    <motion.svg
      width="280"
      height={svgHeight}
      viewBox={`0 0 280 ${svgHeight}`}
      fill="none"
      className="mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* 地面渐变 */}
      <ellipse
        cx="140"
        cy={svgHeight - 20}
        rx="100"
        ry="12"
        fill="url(#ground-shadow)"
      />

      {/* 宝石们 - 从底层往上画 */}
      {layout.map((gem, i) => (
        <Gem
          key={i}
          color={GEM_PALETTE[gem.colorIdx]}
          size={gem.size}
          x={gem.x}
          y={gem.y}
          delay={i * 0.08}
        />
      ))}

      {/* 顶部星星闪烁 */}
      {count > 3 && (
        <>
          {[0, 1, 2].map(i => (
            <motion.text
              key={i}
              x={115 + i * 25}
              y={count <= 6 ? 75 : count <= 10 ? 65 : 50}
              fontSize="10"
              fill="#FFD700"
              animate={{ opacity: [0, 0.7, 0], y: [0, -8] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 + i * 0.8, ease: 'easeOut' }}
            >
              ✦
            </motion.text>
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

/* ─── 主页面 ─── */
export default function GemPage() {
  const { total, records } = useGemStore()

  return (
    <motion.div
      className="flex flex-col gap-5 py-2"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* 宝石堆主视觉 */}
      <div className="relative rounded-3xl pt-6 pb-4 px-4">
        {total > 0 ? (
          <GemPile count={total} />
        ) : (
          <div className="flex justify-center py-8">
            <motion.span
              className="text-5xl"
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              💎
            </motion.span>
          </div>
        )}

        {/* 数量 */}
        <motion.div
          className="text-center mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-xl font-bold text-amber-800">
            {total > 0 ? `${total} 颗宝石` : '等你来收集！'}
          </p>
          <p className="text-text-secondary text-xs mt-0.5">
            {total === 0 ? '完成学习就能获得闪亮宝石哦' : '每一颗都是努力的奖励 ✨'}
          </p>
        </motion.div>
      </div>

      {/* 获得记录 */}
      <div>
        <h3 className="text-base font-bold text-text-primary mb-3">获得记录</h3>

        {records.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl shadow-sm">
            <motion.span
              className="text-4xl block mb-2"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✨
            </motion.span>
            <p className="text-text-secondary text-sm">还没有宝石呢</p>
            <p className="text-text-secondary text-xs mt-1">去冒险就能赚到哦！</p>
          </div>
        ) : (
          <div className="space-y-2">
            {records.slice(0, 20).map((record, i) => (
              <motion.div
                key={`${record.date}-${i}`}
                className="flex items-center gap-3 py-3 px-4 bg-white rounded-xl shadow-sm"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-yellow-50 flex items-center justify-center">
                  <span className="text-sm">💎</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {sourceLabels[record.source] || record.source}
                  </p>
                  <p className="text-xs text-text-secondary">{record.date}</p>
                </div>
                <span className="text-sm font-bold text-amber-600">+{record.amount}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
