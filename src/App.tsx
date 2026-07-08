import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
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

function PageLoader() {
  return (
    <div className="min-h-dvh flex items-center justify-center">
      <span className="text-3xl animate-bounce">🌈</span>
    </div>
  )
}

function App() {
  const ready = useAppInit()

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-warm">
        <div className="text-center">
          <span className="text-4xl block animate-bounce">🌈</span>
          <p className="text-text-secondary text-sm mt-3">加载中...</p>
        </div>
      </div>
    )
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
