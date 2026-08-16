import { useNavigate } from 'react-router-dom'
import { useDecorationStore } from '@/store/useDecorationStore'
import PageHeader from '@/components/PageHeader'
import UpdateCalendar from '@/components/UpdateCalendar'

export default function SettingsPage() {
  const navigate = useNavigate()
  const budget = useDecorationStore((s) => s.budget)
  const updateLog = useDecorationStore((s) => s.update_log)

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

      {/* 更新日志 */}
      <section className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-text-primary mb-3">更新日志</h3>
        <UpdateCalendar dates={updateLog} />
      </section>
    </div>
  )
}
