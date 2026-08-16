import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDecorationStore } from '@/store/useDecorationStore'
import PageHeader from '@/components/PageHeader'
import { parseAmount } from '@/lib/utils'

export default function BudgetPage() {
  const navigate = useNavigate()
  const { budget, setBudget } = useDecorationStore()
  const [value, setValue] = useState(budget.total_budget > 0 ? budget.total_budget.toString() : '')

  const handleSave = () => {
    const amount = parseAmount(value)
    if (amount > 0) {
      setBudget(amount)
      navigate('/')
    }
  }

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="设置总预算" />

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <label className="block text-sm font-medium text-text-secondary mb-2">装修总预算（元）</label>
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary text-lg font-num">¥</span>
          <input
            type="number"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="例如 500000"
            className="w-full h-14 pl-10 pr-4 text-2xl font-bold text-text-primary bg-gray-50 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-num"
            autoFocus
          />
        </div>

        <p className="text-xs text-text-secondary mb-6">
          设置总预算后，首页将实时显示执行率和剩余预算。
        </p>

        <button
          onClick={handleSave}
          disabled={!value || parseAmount(value) <= 0}
          className="w-full h-12 rounded-xl bg-primary text-white font-semibold text-base shadow-md shadow-primary/20 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          保存
        </button>
      </div>
    </div>
  )
}
