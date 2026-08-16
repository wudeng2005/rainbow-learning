import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDecorationStore, formatMoney } from '@/store/useDecorationStore'
import { computeDashboardSummary } from '@/lib/utils'
import { refreshFromCloud } from '@/lib/cloudSync'
import type { CategorySpendingItem, RecentPaymentItem } from '@/types'

export default function HomePage() {
  const navigate = useNavigate()

  // 进入首页时拉取云端最新数据
  useEffect(() => {
    refreshFromCloud()
  }, [])

  const budget = useDecorationStore((s) => s.budget)
  const projects = useDecorationStore((s) => s.projects)
  const payments = useDecorationStore((s) => s.payments)
  const categoriesL1 = useDecorationStore((s) => s.categoriesL1)

  const summary = useMemo(
    () => computeDashboardSummary(budget, projects, payments, categoriesL1),
    [budget, projects, payments, categoriesL1]
  )

  const executionColor = useMemo(() => {
    if (summary.executionRate >= 90) return 'bg-danger'
    if (summary.executionRate >= 80) return 'bg-accent'
    return 'bg-primary'
  }, [summary.executionRate])

  return (
    <div className="animate-fade-in-up">
      {/* 顶部标题 */}
      <header className="flex items-center justify-between mb-5 safe-top">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">装修费用管家</h1>
          <p className="text-sm text-text-secondary mt-0.5">文鼎苑 4-103 · 134.4㎡</p>
        </div>
        <button
          onClick={() => navigate('/projects/new')}
          className="h-10 px-4 rounded-full bg-primary text-white text-sm font-semibold shadow-md shadow-primary/20 active:scale-95 transition-transform flex items-center gap-1"
        >
          <PlusIcon className="w-4 h-4" />
          记一笔
        </button>
      </header>

      {/* 预算总览卡片 */}
      <section
        onClick={() => navigate('/budget')}
        className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-5 text-white shadow-lg shadow-primary/25 mb-5 active:scale-[0.99] transition-transform cursor-pointer"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-primary-soft text-sm font-medium">装修总预算</span>
          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">点击设置</span>
        </div>
        <div className="text-3xl font-bold font-num mb-4">{formatMoney(summary.totalBudget)}</div>

        {/* 执行进度条 */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-primary-soft mb-1.5">
            <span>已支出 {formatMoney(summary.totalPaid)}</span>
            <span>执行率 {summary.executionRate}%</span>
          </div>
          <div className="h-2.5 bg-black/20 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${executionColor}`}
              style={{ width: `${Math.min(summary.executionRate, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/15">
          <div>
            <p className="text-xs text-primary-soft mb-0.5">剩余预算</p>
            <p className="text-lg font-semibold font-num">{formatMoney(summary.totalRemaining)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-primary-soft mb-0.5">已付清项目</p>
            <p className="text-lg font-semibold font-num">
              {summary.paidOffCount}/{summary.projectCount}
            </p>
          </div>
        </div>
      </section>

      {/* 统计小卡 */}
      <section className="grid grid-cols-2 gap-3 mb-5">
        {/* 总项目 / 未付清 合并卡 */}
        <div className="col-span-2 bg-white rounded-2xl p-3 shadow-sm flex items-center justify-around text-center">
          <div>
            <p className="text-xs text-text-secondary mb-1">总项目</p>
            <p className="text-lg font-bold font-num text-text-primary">
              {summary.projectCount}
              <span className="text-xs font-normal text-text-secondary ml-0.5">个</span>
            </p>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div>
            <p className="text-xs text-text-secondary mb-1">未付清</p>
            <p className="text-lg font-bold font-num text-text-primary">
              {summary.unpaidCount}
              <span className="text-xs font-normal text-text-secondary ml-0.5">个</span>
            </p>
          </div>
        </div>
        <StatCard label="待支付" value={formatMoney(summary.totalUnpaid)} unit="" color="bg-danger-soft" />
        <StatCard label="已支出" value={formatMoney(summary.totalPaid)} unit="" color="bg-accent-soft" />
      </section>

      {/* 分类支出 */}
      <section className="bg-white rounded-2xl p-4 shadow-sm mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-text-primary">分类支出</h2>
          <button onClick={() => navigate('/projects')} className="text-xs text-primary font-medium">
            查看全部
          </button>
        </div>
        <div className="space-y-3">
          {summary.categorySpending
            .filter((c) => c.amount > 0)
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5)
            .map((category) => (
              <CategoryRow key={category.category_l1_id} category={category} />
            ))}
          {summary.categorySpending.every((c) => c.amount === 0) && (
            <p className="text-sm text-text-secondary text-center py-4">暂无支出记录</p>
          )}
        </div>
      </section>

      {/* 最近支付 */}
      <section className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-text-primary">最近支付</h2>
          <button onClick={() => navigate('/payments')} className="text-xs text-primary font-medium">
            查看全部
          </button>
        </div>
        <div className="space-y-2">
          {summary.recentPayments.map((payment) => (
            <PaymentRow key={payment.payment_id} payment={payment} />
          ))}
          {summary.recentPayments.length === 0 && (
            <p className="text-sm text-text-secondary text-center py-4">暂无支付记录</p>
          )}
        </div>
      </section>
    </div>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}

function StatCard({ label, value, unit, color }: { label: string; value: string | number; unit: string; color: string }) {
  return (
    <div className={`${color} rounded-2xl p-3 shadow-sm text-center`}>
      <p className="text-xs text-text-secondary mb-1">{label}</p>
      <p className="text-lg font-bold font-num text-text-primary">
        {value}
        {unit && <span className="text-xs font-normal text-text-secondary ml-0.5">{unit}</span>}
      </p>
    </div>
  )
}

function CategoryRow({ category }: { category: CategorySpendingItem }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(`/projects?category=${category.category_l1_id}`)}
      className="w-full flex items-center gap-3 text-left active:scale-[0.99] transition-transform"
    >
      <span className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center text-xl">{category.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-text-primary truncate">{category.name}</span>
          <span className="text-sm font-semibold font-num text-text-primary">{formatMoney(category.amount)}</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${Math.min(category.percentage, 100)}%` }}
          />
        </div>
      </div>
    </button>
  )
}

function PaymentRow({ payment }: { payment: RecentPaymentItem }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(`/projects/${payment.project_id}`)}
      className="w-full flex items-center justify-between py-2 border-b border-gray-50 last:border-0 active:scale-[0.99] transition-transform"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center text-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{payment.project_name}</p>
          <p className="text-xs text-text-secondary">
            {payment.payment_node || '付款'} · {payment.paid_at}
          </p>
        </div>
      </div>
      <span className="text-sm font-bold font-num text-primary">-{formatMoney(payment.amount)}</span>
    </button>
  )
}
