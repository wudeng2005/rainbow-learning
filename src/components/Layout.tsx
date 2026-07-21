import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import UserAvatar from './UserAvatar'
import BottomNav from './BottomNav'
import GemCounter from './GemCounter'
import DreamBackground from './DreamBackground'

export default function Layout() {
  const location = useLocation()

  return (
    <div className="flex flex-col min-h-dvh relative">
      {/* 梦幻天空氛围背景 */}
      <DreamBackground />

      {/* 顶栏：悬浮云朵造型 */}
      <header className="relative z-40 sticky top-0 safe-top">
        <div className="flex items-center justify-between px-4 py-2.5 bg-white/70 backdrop-blur-md border-b-2 border-white/60 shadow-[0_2px_12px_rgba(120,100,180,0.08)]">
          {/* Logo：彩虹云朵 + 快乐体标题 */}
          <div className="flex items-center gap-2">
            <motion.div
              className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-top to-rainbow-blue flex items-center justify-center border-2 border-white toy-shadow-sm"
              whileTap={{ scale: 0.9, rotate: -10 }}
            >
              <span className="text-lg leading-none">🌈</span>
            </motion.div>
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

      {/* 主内容区：带路由切换动画 */}
      <main className="relative z-10 flex-1 px-4 pb-28 pt-4 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 底部导航 */}
      <BottomNav />
    </div>
  )
}
