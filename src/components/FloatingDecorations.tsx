/**
 * 漂浮装饰元素 - 星星、云朵、彩虹片段
 * 纯 CSS 动画，不影响布局
 */
export default function FloatingDecorations() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* 星星 */}
      <span className="absolute top-[8%] left-[5%] text-2xl animate-float-slow opacity-40">⭐</span>
      <span className="absolute top-[15%] right-[8%] text-xl animate-float-medium opacity-30">✨</span>
      <span className="absolute top-[60%] left-[3%] text-lg animate-float-fast opacity-25">🌟</span>
      <span className="absolute top-[75%] right-[5%] text-2xl animate-float-slow opacity-35">⭐</span>
      
      {/* 云朵 */}
      <span className="absolute top-[5%] left-[30%] text-3xl animate-drift-slow opacity-20">☁️</span>
      <span className="absolute top-[20%] right-[25%] text-2xl animate-drift-medium opacity-15">☁️</span>
      
      {/* 彩虹片段 */}
      <span className="absolute bottom-[15%] left-[10%] text-2xl animate-float-medium opacity-30">🌈</span>
      <span className="absolute top-[40%] right-[3%] text-xl animate-float-slow opacity-25">🌈</span>
    </div>
  )
}
