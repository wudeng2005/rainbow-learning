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
