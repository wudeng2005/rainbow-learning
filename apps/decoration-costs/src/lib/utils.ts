import type { Budget, CategoryL1, DashboardSummary, Payment, Project } from '@/types'

/** 格式化金额：¥xx,xxx */
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** 简化金额显示：万/元 */
export function formatCompactMoney(amount: number): string {
  if (Math.abs(amount) >= 10000) {
    return `${(amount / 10000).toFixed(1).replace(/\.0$/, '')}万`
  }
  return `${amount.toLocaleString('zh-CN')}`
}

/** 生成短 ID */
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

/** 今日日期字符串 YYYY-MM-DD */
export function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

/** 本地时区今日日期字符串 YYYY-MM-DD */
export function localTodayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 格式化日期显示 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return dateStr
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
}

/** 解析金额为数字 */
export function parseAmount(value: string): number {
  const num = Number.parseFloat(value.replace(/,/g, ''))
  return Number.isNaN(num) ? 0 : Math.round(num * 100) / 100
}

/** 计算执行率 */
export function calcExecutionRate(paid: number, budget: number): number {
  if (budget <= 0) return 0
  return Math.min(100, Math.round((paid / budget) * 1000) / 10)
}

/** 仪表盘汇总数据（纯函数，可在组件 useMemo / store 中复用） */
export function computeDashboardSummary(
  budget: Budget,
  projects: Project[],
  payments: Payment[],
  categoriesL1: CategoryL1[]
): DashboardSummary {
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const totalRemaining = Math.max(0, budget.total_budget - totalPaid)
  const executionRate = calcExecutionRate(totalPaid, budget.total_budget)
  const paidOffCount = projects.filter(p => p.status === '已付清').length

  // 待支付总额：每个项目的应付总额减去已付，取非负后求和
  const totalUnpaid = projects.reduce((sum, proj) => {
    const paid = payments
      .filter(p => p.project_id === proj.project_id)
      .reduce((s, p) => s + p.amount, 0)
    return sum + Math.max(0, proj.total_amount - paid)
  }, 0)

  const categorySpending = categoriesL1.map((l1) => {
    const projectIds = new Set(
      projects.filter(p => p.category_l1_id === l1.category_l1_id).map(p => p.project_id)
    )
    const amount = payments.filter(p => projectIds.has(p.project_id)).reduce((sum, p) => sum + p.amount, 0)
    return {
      category_l1_id: l1.category_l1_id,
      name: l1.name,
      icon: l1.icon,
      amount,
      percentage: totalPaid > 0 ? Math.round((amount / totalPaid) * 1000) / 10 : 0,
    }
  })

  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime())
    .slice(0, 5)
    .map((p) => {
      const project = projects.find(proj => proj.project_id === p.project_id)
      return {
        payment_id: p.payment_id,
        project_id: p.project_id,
        project_name: project?.name ?? '未知项目',
        amount: p.amount,
        paid_at: p.paid_at,
        payment_node: p.payment_node,
      }
    })

  return {
    totalBudget: budget.total_budget,
    totalPaid,
    totalRemaining,
    totalUnpaid,
    executionRate,
    projectCount: projects.length,
    paidOffCount,
    unpaidCount: projects.length - paidOffCount,
    categorySpending,
    recentPayments,
  }
}
