/**
 * 云上梦乐园 · 氛围背景
 * 固定铺满全屏：天空三层渐变 + 太阳光晕 + 漂移云朵 + 闪烁星星 + 缓升热气球
 * 全部使用 CSS Animation（性能友好），pointer-events 关闭不影响交互
 */

/* 一朵蓬松的云：三个圆叠成 */
function Cloud({ top, scale, duration, delay, opacity }: {
  top: string; scale: number; duration: number; delay: number; opacity: number
}) {
  return (
    <div
      className="absolute cloud-drift pointer-events-none"
      style={{ top, animationDuration: `${duration}s`, animationDelay: `${delay}s`, opacity }}
    >
      <div className="relative" style={{ transform: `scale(${scale})` }}>
        <div className="w-24 h-9 bg-white rounded-full" />
        <div className="absolute -top-4 left-4 w-12 h-12 bg-white rounded-full" />
        <div className="absolute -top-2 left-12 w-9 h-9 bg-white rounded-full" />
      </div>
    </div>
  )
}

/* 闪烁的星 */
function Star({ top, left, size, duration, delay }: {
  top: string; left: string; size: number; duration: number; delay: number
}) {
  return (
    <span
      className="absolute twinkle pointer-events-none select-none text-rainbow-yellow"
      style={{
        top, left, fontSize: size,
        animationDuration: `${duration}s`, animationDelay: `${delay}s`,
      }}
    >
      ✦
    </span>
  )
}

/* 缓升热气球 */
function Balloon({ left, duration, delay, emoji }: {
  left: string; duration: number; delay: number; emoji: string
}) {
  return (
    <span
      className="absolute balloon-rise pointer-events-none select-none"
      style={{ left, fontSize: 30, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
    >
      {emoji}
    </span>
  )
}

export default function DreamBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* 天空三层渐变：baby blue → 棉花糖粉 → 奶油暖 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #A8DDFF 0%, #C9E4FF 30%, #FFD9EC 62%, #FFF3E0 100%)',
        }}
      />

      {/* 太阳光晕（右上角） */}
      <div
        className="absolute -top-16 -right-16 w-56 h-56 rounded-full sun-glow"
        style={{
          background:
            'radial-gradient(circle, rgba(255,214,112,0.9) 0%, rgba(255,214,112,0.35) 45%, rgba(255,214,112,0) 72%)',
        }}
      />
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br from-yellow-200 to-amber-300 opacity-80 blur-[1px]" />

      {/* 云朵 */}
      <Cloud top="9%" scale={1} duration={70} delay={-10} opacity={0.85} />
      <Cloud top="22%" scale={0.7} duration={95} delay={-45} opacity={0.65} />
      <Cloud top="38%" scale={1.2} duration={120} delay={-70} opacity={0.5} />
      <Cloud top="58%" scale={0.8} duration={85} delay={-30} opacity={0.4} />
      <Cloud top="74%" scale={1} duration={110} delay={-85} opacity={0.35} />

      {/* 星星 */}
      <Star top="14%" left="12%" size={14} duration={3} delay={0} />
      <Star top="8%" left="55%" size={11} duration={4} delay={1} />
      <Star top="26%" left="82%" size={13} duration={3.5} delay={0.5} />
      <Star top="33%" left="30%" size={10} duration={4.5} delay={2} />
      <Star top="48%" left="68%" size={12} duration={3.2} delay={1.5} />
      <Star top="62%" left="15%" size={11} duration={4} delay={0.8} />
      <Star top="70%" left="88%" size={13} duration={3.8} delay={2.5} />

      {/* 热气球 */}
      <Balloon left="8%" duration={45} delay={-12} emoji="🎈" />
      <Balloon left="78%" duration={60} delay={-35} emoji="🎈" />
    </div>
  )
}
