import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDecorationStore } from '@/store/useDecorationStore'
import PageHeader from '@/components/PageHeader'
import { PAYMENT_NODES } from '@/data/categories'
import { getTodayStr, parseAmount } from '@/lib/utils'
import type { PaymentNode } from '@/types'

export default function ProjectFormPage() {
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()
  const isEdit = Boolean(projectId)

  const { projects, categoriesL1, categoriesL2, addProject, updateProject, addCategoryL2 } = useDecorationStore()

  const existingProject = isEdit ? projects.find((p) => p.project_id === projectId) : null

  const [categoryL1, setCategoryL1] = useState(existingProject?.category_l1_id || categoriesL1[0]?.category_l1_id || '')
  const [categoryL2, setCategoryL2] = useState(existingProject?.category_l2_id || '')
  const [name, setName] = useState(existingProject?.name || '')
  const [vendor, setVendor] = useState(existingProject?.vendor || '')
  const [totalAmount, setTotalAmount] = useState(existingProject ? existingProject.total_amount.toString() : '')
  const [notes, setNotes] = useState(existingProject?.notes || '')

  const [firstPaymentAmount, setFirstPaymentAmount] = useState('')
  const [firstPaymentDate, setFirstPaymentDate] = useState(getTodayStr())
  const [firstPaymentNode, setFirstPaymentNode] = useState<PaymentNode | ''>('首款')
  const [firstPaymentNotes, setFirstPaymentNotes] = useState('')
  const [showFirstPayment, setShowFirstPayment] = useState(!isEdit)

  const [newCategoryName, setNewCategoryName] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)

  useEffect(() => {
    if (isEdit && existingProject) {
      setCategoryL1(existingProject.category_l1_id)
      setCategoryL2(existingProject.category_l2_id)
      setName(existingProject.name)
      setVendor(existingProject.vendor)
      setTotalAmount(existingProject.total_amount.toString())
      setNotes(existingProject.notes)
    }
  }, [isEdit, existingProject])

  // 一级分类切换时，重置二级分类选择
  useEffect(() => {
    if (!isEdit) {
      const firstL2 = categoriesL2.find((c) => c.parent_id === categoryL1)
      setCategoryL2(firstL2?.category_l2_id || '')
    }
  }, [categoryL1, categoriesL2, isEdit])

  const availableL2 = useMemo(
    () => categoriesL2.filter((c) => c.parent_id === categoryL1),
    [categoriesL2, categoryL1]
  )

  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim()
    if (!trimmed || !categoryL1) return
    const id = addCategoryL2(categoryL1, trimmed)
    setCategoryL2(id)
    setNewCategoryName('')
    setShowNewCategory(false)
  }

  const handleSubmit = () => {
    const total = parseAmount(totalAmount)
    if (!name.trim() || total <= 0 || !categoryL1 || !categoryL2) return

    if (isEdit && existingProject) {
      updateProject(existingProject.project_id, {
        name: name.trim(),
        vendor: vendor.trim(),
        total_amount: total,
        category_l1_id: categoryL1,
        category_l2_id: categoryL2,
        notes: notes.trim(),
      })
      navigate(`/projects/${existingProject.project_id}`)
    } else {
      const firstPayment = showFirstPayment && parseAmount(firstPaymentAmount) > 0
        ? {
            amount: parseAmount(firstPaymentAmount),
            paid_at: firstPaymentDate,
            payment_node: (firstPaymentNode as PaymentNode) || null,
            notes: firstPaymentNotes.trim(),
          }
        : undefined

      const id = addProject(
        {
          category_l1_id: categoryL1,
          category_l2_id: categoryL2,
          name: name.trim(),
          vendor: vendor.trim(),
          total_amount: total,
          notes: notes.trim(),
        },
        firstPayment
      )
      navigate(`/projects/${id}`)
    }
  }

  const isValid = name.trim() && parseAmount(totalAmount) > 0 && categoryL1 && categoryL2

  return (
    <div className="animate-fade-in-up">
      <PageHeader title={isEdit ? '编辑项目' : '新增费用项目'} />

      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
        {/* 一级分类 */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">一级分类</label>
          <div className="grid grid-cols-3 gap-2">
            {categoriesL1.map((c) => (
              <button
                key={c.category_l1_id}
                onClick={() => setCategoryL1(c.category_l1_id)}
                className={`h-10 px-2 rounded-xl text-xs font-medium border transition-colors ${
                  categoryL1 === c.category_l1_id
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-text-secondary border-border'
                }`}
              >
                {c.icon} {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* 二级分类 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-text-secondary">二级分类</label>
            <button
              onClick={() => setShowNewCategory(true)}
              className="text-xs text-primary font-medium flex items-center gap-0.5"
            >
              <PlusIcon className="w-3 h-3" /> 新建
            </button>
          </div>
          {showNewCategory ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="输入新分类名称"
                className="flex-1 h-10 px-3 text-sm bg-gray-50 rounded-xl border border-border focus:border-primary outline-none"
                autoFocus
              />
              <button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                className="h-10 px-3 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-50"
              >
                确定
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableL2.map((c) => (
                <button
                  key={c.category_l2_id}
                  onClick={() => setCategoryL2(c.category_l2_id)}
                  className={`h-9 px-3 rounded-full text-xs font-medium border transition-colors ${
                    categoryL2 === c.category_l2_id
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-text-secondary border-border'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 项目名称 */}
        <FormInput label="项目名称" value={name} onChange={setName} placeholder="例如：全屋半包施工费" />

        {/* 收款方 */}
        <FormInput label="收款方" value={vendor} onChange={setVendor} placeholder="例如：远创工程" />

        {/* 项目总计 */}
        <FormAmount label="项目费用总计" value={totalAmount} onChange={setTotalAmount} placeholder="0" />

        {/* 备注 */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">备注</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="选填：合同条款、付款约定等"
            rows={2}
            className="w-full px-3 py-2.5 text-sm text-text-primary bg-gray-50 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
          />
        </div>

        {/* 首次支付（仅新增时显示） */}
        {!isEdit && (
          <div className="border-t border-border pt-4">
            <button
              onClick={() => setShowFirstPayment(!showFirstPayment)}
              className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-3"
            >
              <div
                className={`w-10 h-5 rounded-full relative transition-colors ${
                  showFirstPayment ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    showFirstPayment ? 'left-5' : 'left-0.5'
                  }`}
                />
              </div>
              同时记录首次支付
            </button>

            {showFirstPayment && (
              <div className="space-y-3 bg-primary-soft/30 rounded-xl p-3">
                <FormAmount label="首次支付金额" value={firstPaymentAmount} onChange={setFirstPaymentAmount} placeholder="0" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">支付时间</label>
                    <input
                      type="date"
                      value={firstPaymentDate}
                      onChange={(e) => setFirstPaymentDate(e.target.value)}
                      className="w-full h-10 px-3 text-sm text-text-primary bg-white rounded-xl border border-border focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">支付节点</label>
                    <select
                      value={firstPaymentNode}
                      onChange={(e) => setFirstPaymentNode(e.target.value as PaymentNode | '')}
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
                <FormInput
                  label="支付备注"
                  value={firstPaymentNotes}
                  onChange={setFirstPaymentNotes}
                  placeholder="选填"
                />
              </div>
            )}
          </div>
        )}

        {/* 保存按钮 */}
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-full h-12 rounded-xl bg-primary text-white font-semibold text-base shadow-md shadow-primary/20 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {isEdit ? '保存修改' : '保存项目'}
        </button>
      </div>
    </div>
  )
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 px-3 text-sm text-text-primary bg-gray-50 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
      />
    </div>
  )
}

function FormAmount({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1.5">{label}（元）</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-sm font-num">¥</span>
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-11 pl-8 pr-3 text-sm font-bold text-text-primary bg-gray-50 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-num"
        />
      </div>
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
