import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDecorationStore, formatMoney } from '@/store/useDecorationStore'
import PageHeader from '@/components/PageHeader'
import { formatDate, getTodayStr, parseAmount } from '@/lib/utils'
import { PAYMENT_NODES } from '@/data/categories'
import type { PaymentNode } from '@/types'

export default function ProjectDetailPage() {
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()
  const { getProjectDetail, addPayment, deleteProject, deletePayment } = useDecorationStore()
  const detail = projectId ? getProjectDetail(projectId) : null

  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(getTodayStr())
  const [paymentNode, setPaymentNode] = useState<PaymentNode | ''>('首款')
  const [paymentNotes, setPaymentNotes] = useState('')

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!detail) {
    return (
      <div className="animate-fade-in-up text-center py-20">
        <p className="text-text-secondary">项目不存在</p>
        <button onClick={() => navigate('/projects')} className="mt-4 text-primary font-medium">
          返回项目列表
        </button>
      </div>
    )
  }

  const { project, categoryL1Name, categoryL2Name, paidAmount, unpaidAmount, payments } = detail

  const handleAddPayment = () => {
    const amount = parseAmount(paymentAmount)
    if (amount <= 0) return

    addPayment(project.project_id, {
      amount,
      paid_at: paymentDate,
      payment_node: (paymentNode as PaymentNode) || null,
      notes: paymentNotes.trim(),
    })

    setPaymentAmount('')
    setPaymentDate(getTodayStr())
    setPaymentNode('首款')
    setPaymentNotes('')
    setShowPaymentForm(false)
  }

  const handleDeleteProject = () => {
    deleteProject(project.project_id)
    navigate('/projects')
  }

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="项目详情"
        rightAction={
          <button
            onClick={() => navigate(`/projects/${project.project_id}/edit`)}
            className="h-9 px-3 rounded-full bg-white text-primary text-sm font-semibold border border-primary active:scale-95 transition-transform"
          >
            编辑
          </button>
        }
      />

      {/* 项目信息卡 */}
      <section className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary-soft text-primary">
                {categoryL1Name}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-text-secondary">
                {categoryL2Name}
              </span>
            </div>
            <h2 className="text-xl font-bold text-text-primary">{project.name}</h2>
            {project.vendor && <p className="text-sm text-text-secondary mt-0.5">{project.vendor}</p>}
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              project.status === '已付清' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
            }`}
          >
            {project.status}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <AmountBox label="项目总计" amount={project.total_amount} />
          <AmountBox label="已支付" amount={paidAmount} color="text-primary" />
          <AmountBox label="未支付" amount={unpaidAmount} color="text-danger" />
        </div>

        {project.notes && (
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-text-secondary mb-1">备注</p>
            <p className="text-sm text-text-primary">{project.notes}</p>
          </div>
        )}
      </section>

      {/* 支付记录 */}
      <section className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-text-primary">支付记录</h3>
          <button
            onClick={() => setShowPaymentForm(true)}
            className="h-8 px-3 rounded-full bg-primary text-white text-xs font-semibold active:scale-95 transition-transform flex items-center gap-1"
          >
            <PlusIcon className="w-3 h-3" /> 追加支付
          </button>
        </div>

        {showPaymentForm && (
          <div className="bg-primary-soft/30 rounded-xl p-3 mb-3 space-y-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">本次支付金额（元）</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-sm font-num">¥</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0"
                  autoFocus
                  className="w-full h-10 pl-8 pr-3 text-sm font-bold text-text-primary bg-white rounded-xl border border-border focus:border-primary outline-none font-num"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">支付时间</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full h-10 px-3 text-sm text-text-primary bg-white rounded-xl border border-border focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">支付节点</label>
                <select
                  value={paymentNode}
                  onChange={(e) => setPaymentNode(e.target.value as PaymentNode | '')}
                  className="w-full h-10 px-3 text-sm text-text-primary bg-white rounded-xl border border-border focus:border-primary outline-none appearance-none"
                >
                  {PAYMENT_NODES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">备注</label>
              <input
                type="text"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="选填"
                className="w-full h-10 px-3 text-sm text-text-primary bg-white rounded-xl border border-border focus:border-primary outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPaymentForm(false)}
                className="flex-1 h-10 rounded-xl bg-white text-text-secondary text-sm font-medium border border-border"
              >
                取消
              </button>
              <button
                onClick={handleAddPayment}
                disabled={parseAmount(paymentAmount) <= 0}
                className="flex-1 h-10 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50"
              >
                确认
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {payments.map((p) => (
            <div
              key={p.payment_id}
              className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-soft flex items-center justify-center text-primary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {p.payment_node || '付款'}
                    {p.notes && <span className="text-xs text-text-secondary ml-1">· {p.notes}</span>}
                  </p>
                  <p className="text-xs text-text-secondary">{formatDate(p.paid_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold font-num text-primary">-{formatMoney(p.amount)}</span>
                <button
                  onClick={() => deletePayment(p.payment_id)}
                  className="text-xs text-danger px-2 py-1 rounded-lg hover:bg-danger-soft transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
          {payments.length === 0 && <p className="text-sm text-text-secondary text-center py-4">暂无支付记录</p>}
        </div>
      </section>

      {/* 删除项目 */}
      <button
        onClick={() => setShowDeleteConfirm(true)}
        className="w-full h-11 rounded-xl border border-danger text-danger text-sm font-medium active:scale-[0.98] transition-transform"
      >
        删除该项目
      </button>

      {/* 删除确认 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
            <h3 className="text-lg font-bold text-text-primary mb-2">确认删除？</h3>
            <p className="text-sm text-text-secondary mb-5">删除项目将同时删除其所有支付记录，此操作不可恢复。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 h-11 rounded-xl bg-gray-100 text-text-secondary text-sm font-medium"
              >
                取消
              </button>
              <button
                onClick={handleDeleteProject}
                className="flex-1 h-11 rounded-xl bg-danger text-white text-sm font-semibold"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AmountBox({
  label,
  amount,
  color = 'text-text-primary',
}: {
  label: string
  amount: number
  color?: string
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <p className="text-xs text-text-secondary mb-1">{label}</p>
      <p className={`text-base font-bold font-num truncate ${color}`}>{formatMoney(amount)}</p>
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
