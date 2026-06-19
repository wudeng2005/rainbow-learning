/** 糖果乐园漂浮装饰 */
export default function MathFloatingDecorations() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      <span className="absolute top-[6%] left-[8%] text-2xl animate-candy-fall opacity-40">🍬</span>
      <span className="absolute top-[12%] right-[6%] text-xl animate-candy-fall-slow opacity-35">🍭</span>
      <span className="absolute top-[55%] left-[4%] text-lg animate-candy-fall opacity-25">🧁</span>
      <span className="absolute top-[70%] right-[8%] text-2xl animate-candy-fall-slow opacity-30">🍫</span>
      <span className="absolute top-[3%] left-[40%] text-3xl animate-drift-slow opacity-20">☁️</span>
      <span className="absolute top-[25%] right-[20%] text-xl animate-candy-fall opacity-30">🌈</span>
      <span className="absolute bottom-[20%] left-[15%] text-xl animate-candy-fall-slow opacity-25">⭐</span>
      <span className="absolute top-[40%] right-[3%] text-lg animate-drift-medium opacity-20">🍬</span>
    </div>
  )
}
