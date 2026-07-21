import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import { useAppInit } from '@/hooks/useAppInit'

// 懒加载非首页页面，减少初始包体积
const LearnPage = lazy(() => import('@/pages/LearnPage'))
const MathLearnPage = lazy(() => import('@/pages/MathLearnPage'))
const EnglishLearnPage = lazy(() => import('@/pages/EnglishLearnPage'))
const GemPage = lazy(() => import('@/pages/GemPage'))
const ReviewPage = lazy(() => import('@/pages/ReviewPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))

/* ─── 趣味加载屏：角色列队跳跃 ─── */
const LOADING_CHARS = ['🐼', '🦜', '🎲', '🦄', '🌈']

function PageLoader() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-4">
      <div className="flex items-end gap-2">
        {LOADING_CHARS.map((char, i) => (
          <motion.span
            key={i}
            className="text-3xl"
            animate={{ y: [0, -14, 0], scale: [1, 1.15, 1] }}
            transition={{
              duration: 0.6,
              delay: i * 0.12,
              repeat: Infinity,
              repeatDelay: 0.8,
              ease: 'easeInOut',
            }}
          >
            {char}
          </motion.span>
        ))}
      </div>
      <motion.p
        className="text-sm text-ink-soft font-display"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        小伙伴们正在赶来...
      </motion.p>
    </div>
  )
}

/* ─── 启动加载屏：彩虹桥动画 ─── */
function SplashScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-top via-sky-mid to-sky-bottom overflow-hidden">
      {/* 彩虹弧线 */}
      <motion.div
        className="relative w-48 h-24 mb-6"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
      >
        <div className="absolute inset-0 rounded-t-full bg-gradient-to-r from-rainbow-red via-rainbow-yellow to-rainbow-blue opacity-80" />
        <div className="absolute inset-3 rounded-t-full bg-gradient-to-b from-sky-top to-transparent" />
        {/* 独角兽在彩虹上弹跳 */}
        <motion.span
          className="absolute -top-6 left-1/2 -translate-x-1/2 text-4xl"
          animate={{ y: [0, -10, 0], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          🦄
        </motion.span>
      </motion.div>

      {/* 标题 */}
      <motion.h1
        className="font-display text-2xl text-ink mb-2"
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        快乐学堂
      </motion.h1>

      {/* 加载进度点 */}
      <motion.div
        className="flex gap-2 mt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-rainbow-purple"
            animate={{ scale: [0.6, 1.2, 0.6], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
          />
        ))}
      </motion.div>
    </div>
  )
}

function App() {
  const ready = useAppInit()

  if (!ready) {
    return <SplashScreen />
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* 答题页独立全屏布局，不使用 Layout */}
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/math-learn" element={<MathLearnPage />} />
          <Route path="/english-learn" element={<EnglishLearnPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/gems" element={<GemPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
