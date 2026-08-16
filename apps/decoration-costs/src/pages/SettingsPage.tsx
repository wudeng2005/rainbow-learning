import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDecorationStore } from '@/store/useDecorationStore'
import PageHeader from '@/components/PageHeader'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { resetAll, budget } = useDecorationStore()

  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [message, setMessage] = useState('')

  const handleReset = () => {
    resetAll()
    setShowResetConfirm(false)
    setMessage('数据已清空')
    setTimeout(() => setMessage(''), 2000)
  }

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="设置" showBack={false} />

      {/* 预算入口 */}
      <section className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <button
          onClick={() => navigate('/budget')}
          className="w-full flex items-center justify-between py-1"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center text-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c1.11 0-2.08.402-2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-text-primary">装修总预算</p>
              <p className="text-xs text-text-secondary">当前 ¥{budget.total_budget.toLocaleString('zh-CN')}</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </section>

      {/* 清空数据 */}
      <section className="bg-white rounded-2xl p-4 shadow-sm">
        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full h-11 rounded-xl border border-danger text-danger text-sm font-medium active:scale-[0.98] transition-transform"
        >
          清空所有数据
        </button>
        {message && <p className="text-xs text-center mt-2 text-text-secondary">{message}</p>}
      </section>

      {/* 重置确认 */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
            <h3 className="text-lg font-bold text-text-primary mb-2">确认清空？</h3>
            <p className="text-sm text-text-secondary mb-5">此操作将删除所有项目、支付记录和自定义分类，不可恢复。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 h-11 rounded-xl bg-gray-100 text-text-secondary text-sm font-medium"
              >
                取消
              </button>
              <button onClick={handleReset} className="flex-1 h-11 rounded-xl bg-danger text-white text-sm font-semibold">
                清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
