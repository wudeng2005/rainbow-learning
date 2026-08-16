import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDecorationStore, formatMoney } from '@/store/useDecorationStore'
import PageHeader from '@/components/PageHeader'
import { formatDate } from '@/lib/utils'
import { refreshFromCloud } from '@/lib/cloudSync'
import type { Payment } from '@/types'

export default function PaymentListPage() {
  const navigate = useNavigate()

  // 进入流水页时拉取云端最新数据
  useEffect(() => {
    refreshFromCloud()
  }, [])

  const { payments, projects } = useDecorationStore()

  const list = useMemo(() => {
    return [...payments]
      .sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime())
      .map((p) => ({
        ...p,
        project: projects.find((proj) => proj.project_id === p.project_id),
      }))
  }, [payments, projects])

  const total = useMemo(() => list.reduce((sum, p) => sum + p.amount, 0), [list])

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="支付流水" showBack={false} />

      {/* 汇总 */}
      <section className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-4 text-white shadow-lg shadow-primary/25 mb-4">
        <p className="text-primary-soft text-sm mb-1">累计支付</p>
        <p className="text-2xl font-bold font-num">{formatMoney(total)}</p>
        <p className="text-xs text-primary-soft mt-1">共 {list.length} 笔记录</p>
      </section>

      {/* 流水列表 */}
      <div className="space-y-2">
        {list.map((payment) => (
          <PaymentRow key={payment.payment_id} payment={payment} />
        ))}
        {list.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <p className="text-text-secondary text-sm">暂无支付记录</p>
            <button onClick={() => navigate('/projects/new')} className="mt-3 text-primary text-sm font-medium">
              添加第一笔费用
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function PaymentRow({
  payment,
}: {
  payment: Payment & { project?: { project_id: string; name: string; vendor: string } }
}) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(`/projects/${payment.project_id}`)}
      className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center text-primary flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div className="min-w-0 text-left">
          <p className="text-sm font-bold text-text-primary truncate">{payment.project?.name || '未知项目'}</p>
          <p className="text-xs text-text-secondary truncate">
            {payment.payment_node || '付款'} · {payment.project?.vendor || ''}
          </p>
          <p className="text-xs text-text-tertiary mt-0.5">{formatDate(payment.paid_at)}</p>
        </div>
      </div>
      <div className="text-right flex-shrink-0 ml-3">
        <p className="text-base font-bold font-num text-primary">-{formatMoney(payment.amount)}</p>
        {payment.notes && <p className="text-[10px] text-text-secondary truncate max-w-[120px]">{payment.notes}</p>}
      </div>
    </button>
  )
}
