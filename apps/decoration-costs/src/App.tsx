import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'

const BudgetPage = lazy(() => import('@/pages/BudgetPage'))
const ProjectListPage = lazy(() => import('@/pages/ProjectListPage'))
const ProjectFormPage = lazy(() => import('@/pages/ProjectFormPage'))
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage'))
const PaymentListPage = lazy(() => import('@/pages/PaymentListPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))

function PageLoader() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary-soft border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-text-secondary">加载中...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects" element={<ProjectListPage />} />
            <Route path="/projects/new" element={<ProjectFormPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="/projects/:projectId/edit" element={<ProjectFormPage />} />
            <Route path="/payments" element={<PaymentListPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="/budget" element={<BudgetPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
