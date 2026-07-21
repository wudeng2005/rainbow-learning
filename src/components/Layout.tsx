import { Outlet } from 'react-router-dom'
import UserAvatar from './UserAvatar'
import BottomNav from './BottomNav'
import GemCounter from './GemCounter'
import DreamBackground from './DreamBackground'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-dvh relative">
      {/* 梦幻天空氛围背景 */}
      <DreamBackground />

      {/* 顶栏：悬浮云朵造型 */}
      <header className="relative z-40 sticky top-0 safe-top">
        <div className="flex items-center justify-between px-4 py-2.5 bg-white/70 backdrop-blur-md border-b-2 border-white/60 shadow-[0_2px_12px_rgba(120,100,180,0.08)]">
          {/* Logo：彩虹云朵 + 快乐体标题 */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-top to-rainbow-blue flex items-center justify-center border-2 border-white toy-shadow-sm">
              <span className="text-lg leading-none">🌈</span>
            </div>
            <h1 className="font-display text-xl text-ink leading-none">
              快乐学堂
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <GemCounter />
            <UserAvatar />
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="relative z-10 flex-1 px-4 pb-28 pt-4 max-w-2xl mx-auto w-full">
        <Outlet />
      </main>

      {/* 底部导航 */}
      <BottomNav />
    </div>
  )
}
