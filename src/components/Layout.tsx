import { Outlet } from 'react-router-dom'
import UserAvatar from './UserAvatar'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-dvh bg-bg-warm">
      {/* 顶栏 */}
      <header className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <h1 className="text-lg font-bold bg-gradient-to-r from-rainbow-red via-rainbow-yellow to-rainbow-purple bg-clip-text text-transparent">
          🌈 快乐学堂
        </h1>
        <UserAvatar />
      </header>

      {/* 主内容区 */}
      <main className="flex-1 px-4 pb-24 pt-4 max-w-2xl mx-auto w-full">
        <Outlet />
      </main>

      {/* 底部导航 */}
      <BottomNav />
    </div>
  )
}
