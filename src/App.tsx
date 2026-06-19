import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import LearnPage from '@/pages/LearnPage'
import GemPage from '@/pages/GemPage'
import ReviewPage from '@/pages/ReviewPage'
import ProfilePage from '@/pages/ProfilePage'
import { useAppInit } from '@/hooks/useAppInit'

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
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/gems" element={<GemPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
