/** 支付节点 */
export type PaymentNode = '定金' | '首款' | '中期款' | '尾款' | '其他'

/** 项目状态 */
export type ProjectStatus = '已付清' | '未付清'

/** 一级分类 */
export interface CategoryL1 {
  category_l1_id: string
  name: string
  icon: string
  sort_order: number
}

/** 二级分类 */
export interface CategoryL2 {
  category_l2_id: string
  parent_id: string
  name: string
  is_custom: boolean
}

/** 费用项目 */
export interface Project {
  project_id: string
  category_l1_id: string
  category_l2_id: string
  name: string
  vendor: string
  total_amount: number
  status: ProjectStatus
  notes: string
  created_at: string
}

/** 支付记录 */
export interface Payment {
  payment_id: string
  project_id: string
  amount: number
  paid_at: string
  payment_node: PaymentNode | null
  notes: string
}

/** 总预算 */
export interface Budget {
  total_budget: number
}

/** 仪表盘汇总数据 */
export interface DashboardSummary {
  totalBudget: number
  totalPaid: number
  totalRemaining: number
  executionRate: number
  projectCount: number
  paidOffCount: number
  unpaidCount: number
  categorySpending: CategorySpendingItem[]
  recentPayments: RecentPaymentItem[]
}

/** 分类支出项 */
export interface CategorySpendingItem {
  category_l1_id: string
  name: string
  icon: string
  amount: number
  percentage: number
}

/** 最近支付项 */
export interface RecentPaymentItem {
  payment_id: string
  project_id: string
  project_name: string
  amount: number
  paid_at: string
  payment_node: PaymentNode | null
}

/** 项目详情聚合 */
export interface ProjectDetail {
  project: Project
  categoryL1Name: string
  categoryL2Name: string
  paidAmount: number
  unpaidAmount: number
  payments: Payment[]
}

/** 本地持久化状态 */
export interface DecorationState {
  budget: Budget
  categoriesL1: CategoryL1[]
  categoriesL2: CategoryL2[]
  projects: Project[]
  payments: Payment[]
}
