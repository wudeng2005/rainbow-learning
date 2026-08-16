import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Budget,
  CategoryL1,
  CategoryL2,
  DashboardSummary,
  Payment,
  PaymentNode,
  Project,
  ProjectDetail,
  ProjectStatus,
} from '@/types'
import { DEFAULT_CATEGORIES_L1, DEFAULT_CATEGORIES_L2 } from '@/data/categories'
import { calcExecutionRate, formatMoney, generateId, getTodayStr } from '@/lib/utils'

interface DecorationState {
  budget: Budget
  categoriesL1: CategoryL1[]
  categoriesL2: CategoryL2[]
  projects: Project[]
  payments: Payment[]
  initialized: boolean
}

interface DecorationActions {
  setBudget: (total: number) => void
  addProject: (
    project: Omit<Project, 'project_id' | 'status' | 'created_at'>,
    firstPayment?: { amount: number; paid_at: string; payment_node: PaymentNode | null; notes: string }
  ) => string
  updateProject: (projectId: string, updates: Partial<Project>) => void
  deleteProject: (projectId: string) => void
  addPayment: (
    projectId: string,
    payment: Omit<Payment, 'payment_id' | 'project_id'>
  ) => void
  deletePayment: (paymentId: string) => void
  addCategoryL2: (parentId: string, name: string) => string
  getProjectPayments: (projectId: string) => Payment[]
  getProjectPaidAmount: (projectId: string) => number
  getProjectStatus: (projectId: string) => ProjectStatus
  getProjectDetail: (projectId: string) => ProjectDetail | null
  getDashboardSummary: () => DashboardSummary
  getCategorySpending: () => { category_l1_id: string; name: string; icon: string; amount: number }[]
  importData: (data: Partial<DecorationState>) => void
  exportData: () => string
  resetAll: () => void
}

const DEFAULT_BUDGET: Budget = { total_budget: 500000 }

const STORAGE_KEY = 'decoration-costs-v1'

function sortProjectsByDate(items: Project[]): Project[] {
  return [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

function sortPaymentsByDate(items: Payment[]): Payment[] {
  return [...items].sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime())
}

export const useDecorationStore = create<DecorationState & DecorationActions>()(
  persist(
    (set, get) => ({
      budget: DEFAULT_BUDGET,
      categoriesL1: DEFAULT_CATEGORIES_L1,
      categoriesL2: DEFAULT_CATEGORIES_L2,
      projects: [],
      payments: [],
      initialized: true,

      setBudget: (total) => {
        set({ budget: { total_budget: total } })
      },

      addProject: (project, firstPayment) => {
        const projectId = generateId('p')
        const payments = get().payments
        let newPayments = [...payments]

        if (firstPayment && firstPayment.amount > 0) {
          newPayments.push({
            payment_id: generateId('pay'),
            project_id: projectId,
            amount: firstPayment.amount,
            paid_at: firstPayment.paid_at || getTodayStr(),
            payment_node: firstPayment.payment_node,
            notes: firstPayment.notes,
          })
        }

        const paidAmount = newPayments
          .filter(p => p.project_id === projectId)
          .reduce((sum, p) => sum + p.amount, 0)

        const newProject: Project = {
          ...project,
          project_id: projectId,
          status: paidAmount >= project.total_amount ? '已付清' : '未付清',
          created_at: getTodayStr(),
        }

        set({
          projects: sortProjectsByDate([...get().projects, newProject]),
          payments: newPayments,
        })

        return projectId
      },

      updateProject: (projectId, updates) => {
        const projects = get().projects.map((p): Project => {
          if (p.project_id !== projectId) return p
          const total = updates.total_amount ?? p.total_amount
          const paid = get().getProjectPaidAmount(projectId)
          return {
            ...p,
            ...updates,
            status: paid >= total ? '已付清' : '未付清',
          }
        })
        set({ projects: sortProjectsByDate(projects) })
      },

      deleteProject: (projectId) => {
        set({
          projects: get().projects.filter(p => p.project_id !== projectId),
          payments: get().payments.filter(p => p.project_id !== projectId),
        })
      },

      addPayment: (projectId, payment) => {
        const newPayment: Payment = {
          payment_id: generateId('pay'),
          project_id: projectId,
          ...payment,
        }
        const payments = [...get().payments, newPayment]

        const project = get().projects.find(p => p.project_id === projectId)
        if (project) {
          const paid = payments.filter(p => p.project_id === projectId).reduce((sum, p) => sum + p.amount, 0)
          const status = paid >= project.total_amount ? '已付清' : '未付清'
          const projects = get().projects.map((p): Project => (p.project_id === projectId ? { ...p, status } : p))
          set({ payments, projects: sortProjectsByDate(projects) })
        } else {
          set({ payments })
        }
      },

      deletePayment: (paymentId) => {
        const payment = get().payments.find(p => p.payment_id === paymentId)
        if (!payment) return

        const payments = get().payments.filter(p => p.payment_id !== paymentId)
        const project = get().projects.find(p => p.project_id === payment.project_id)
        if (project) {
          const paid = payments.filter(p => p.project_id === project.project_id).reduce((sum, p) => sum + p.amount, 0)
          const status = paid >= project.total_amount ? '已付清' : '未付清'
          const projects = get().projects.map((p): Project => (p.project_id === project.project_id ? { ...p, status } : p))
          set({ payments, projects: sortProjectsByDate(projects) })
        } else {
          set({ payments })
        }
      },

      addCategoryL2: (parentId, name) => {
        const id = generateId('c2')
        const newCategory: CategoryL2 = {
          category_l2_id: id,
          parent_id: parentId,
          name: name.trim(),
          is_custom: true,
        }
        set({ categoriesL2: [...get().categoriesL2, newCategory] })
        return id
      },

      getProjectPayments: (projectId) => {
        return sortPaymentsByDate(get().payments.filter(p => p.project_id === projectId))
      },

      getProjectPaidAmount: (projectId) => {
        return get().payments.filter(p => p.project_id === projectId).reduce((sum, p) => sum + p.amount, 0)
      },

      getProjectStatus: (projectId) => {
        const project = get().projects.find(p => p.project_id === projectId)
        if (!project) return '未付清'
        const paid = get().getProjectPaidAmount(projectId)
        return paid >= project.total_amount ? '已付清' : '未付清'
      },

      getProjectDetail: (projectId) => {
        const project = get().projects.find(p => p.project_id === projectId)
        if (!project) return null

        const l1 = get().categoriesL1.find(c => c.category_l1_id === project.category_l1_id)
        const l2 = get().categoriesL2.find(c => c.category_l2_id === project.category_l2_id)
        const payments = get().getProjectPayments(projectId)
        const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0)

        return {
          project,
          categoryL1Name: l1?.name ?? '未分类',
          categoryL2Name: l2?.name ?? '未分类',
          paidAmount,
          unpaidAmount: Math.max(0, project.total_amount - paidAmount),
          payments,
        }
      },

      getDashboardSummary: () => {
        const { budget, projects, payments, categoriesL1 } = get()
        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
        const totalRemaining = Math.max(0, budget.total_budget - totalPaid)
        const executionRate = calcExecutionRate(totalPaid, budget.total_budget)
        const paidOffCount = projects.filter(p => p.status === '已付清').length
        const categorySpending = categoriesL1.map((l1) => {
          const projectIds = new Set(
            get()
              .projects.filter(p => p.category_l1_id === l1.category_l1_id)
              .map(p => p.project_id)
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

        const recentPayments = sortPaymentsByDate(payments)
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
          executionRate,
          projectCount: projects.length,
          paidOffCount,
          unpaidCount: projects.length - paidOffCount,
          categorySpending,
          recentPayments,
        }
      },

      getCategorySpending: () => {
        const { categoriesL1, projects, payments } = get()
        return categoriesL1.map((l1) => {
          const projectIds = new Set(projects.filter(p => p.category_l1_id === l1.category_l1_id).map(p => p.project_id))
          const amount = payments.filter(p => projectIds.has(p.project_id)).reduce((sum, p) => sum + p.amount, 0)
          return { category_l1_id: l1.category_l1_id, name: l1.name, icon: l1.icon, amount }
        })
      },

      importData: (data) => {
        set({
          budget: data.budget ?? get().budget,
          categoriesL1: data.categoriesL1 ?? get().categoriesL1,
          categoriesL2: data.categoriesL2 ?? get().categoriesL2,
          projects: data.projects ?? get().projects,
          payments: data.payments ?? get().payments,
        })
      },

      exportData: () => {
        const { budget, categoriesL1, categoriesL2, projects, payments } = get()
        return JSON.stringify({ budget, categoriesL1, categoriesL2, projects, payments }, null, 2)
      },

      resetAll: () => {
        set({
          budget: DEFAULT_BUDGET,
          categoriesL1: DEFAULT_CATEGORIES_L1,
          categoriesL2: DEFAULT_CATEGORIES_L2,
          projects: [],
          payments: [],
        })
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
    }
  )
)

export { formatMoney }
