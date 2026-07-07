/** 英语乐园漂浮装饰（彩虹鹦鹉 / 海岛主题） */
export default function EnglishFloatingDecorations() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      <span className="absolute top-[6%] left-[8%] text-2xl animate-drift-slow opacity-40">🦜</span>
      <span className="absolute top-[12%] right-[6%] text-xl animate-drift-medium opacity-35">🎵</span>
      <span className="absolute top-[55%] left-[4%] text-lg animate-drift-slow opacity-25">🐚</span>
      <span className="absolute top-[70%] right-[8%] text-2xl animate-drift-medium opacity-30">🌴</span>
      <span className="absolute top-[3%] left-[42%] text-3xl animate-drift-slow opacity-20">☁️</span>
      <span className="absolute top-[25%] right-[22%] text-xl animate-drift-medium opacity-30">🌈</span>
      <span className="absolute bottom-[18%] left-[16%] text-xl animate-drift-slow opacity-25">⭐</span>
      <span className="absolute top-[42%] right-[3%] text-lg animate-drift-medium opacity-20">🎶</span>
    </div>
  )
}
