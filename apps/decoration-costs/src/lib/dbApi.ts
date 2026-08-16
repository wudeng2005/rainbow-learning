import { supabase } from '@/lib/supabase'
import type { Budget, CategoryL1, CategoryL2, DecorationState, Payment, Project } from '@/types'

const USER_ID = 'decoration-user-001'

export interface CloudState {
  budget: Budget
  categoriesL1: CategoryL1[]
  categoriesL2: CategoryL2[]
  projects: Project[]
  payments: Payment[]
  /** 云端最后同步时间（budgets.updated_at） */
  lastModifiedAt: string
}

/** 从云端拉取完整状态 */
export async function fetchCloudState(): Promise<CloudState | null> {
  const [{ data: budgetRows }, { data: l1Rows }, { data: l2Rows }, { data: projectRows }, { data: paymentRows }] =
    await Promise.all([
      supabase.from('decoration_budgets').select('total_budget,updated_at').eq('user_id', USER_ID).maybeSingle(),
      supabase.from('decoration_categories_l1').select('*').order('sort_order'),
      supabase.from('decoration_categories_l2').select('*'),
      supabase.from('decoration_projects').select('*').order('created_at', { ascending: false }),
      supabase.from('decoration_payments').select('*').order('paid_at', { ascending: false }),
    ])

  if (!budgetRows && !l1Rows?.length && !projectRows?.length) return null

  return {
    budget: { total_budget: Number(budgetRows?.total_budget ?? 500000) },
    lastModifiedAt: (budgetRows?.updated_at as string) ?? '',
    categoriesL1: (l1Rows ?? []).map(r => ({
      category_l1_id: r.category_l1_id,
      name: r.name,
      icon: r.icon,
      sort_order: r.sort_order,
    })),
    categoriesL2: (l2Rows ?? []).map(r => ({
      category_l2_id: r.category_l2_id,
      parent_id: r.parent_id,
      name: r.name,
      is_custom: r.is_custom,
    })),
    projects: (projectRows ?? []).map(r => ({
      project_id: r.project_id,
      category_l1_id: r.category_l1_id,
      category_l2_id: r.category_l2_id,
      name: r.name,
      vendor: r.vendor,
      total_amount: Number(r.total_amount),
      status: r.status,
      notes: r.notes,
      created_at: r.created_at,
    })),
    payments: (paymentRows ?? []).map(r => ({
      payment_id: r.payment_id,
      project_id: r.project_id,
      amount: Number(r.amount),
      paid_at: r.paid_at,
      payment_node: r.payment_node,
      notes: r.notes,
    })),
  }
}

/** 将本地状态完整推送至云端（先清空再写入，保证幂等） */
export async function pushCloudState(state: DecorationState): Promise<void> {
  const { budget, categoriesL1, categoriesL2, projects, payments } = state

  // 1. 清理旧数据
  await supabase.from('decoration_payments').delete().neq('payment_id', '')
  await supabase.from('decoration_projects').delete().neq('project_id', '')
  await supabase.from('decoration_categories_l2').delete().neq('category_l2_id', '')
  await supabase.from('decoration_categories_l1').delete().neq('category_l1_id', '')

  // 2. 写入分类
  if (categoriesL1.length > 0) {
    const { error } = await supabase.from('decoration_categories_l1').insert(categoriesL1)
    if (error) throw error
  }
  if (categoriesL2.length > 0) {
    const { error } = await supabase.from('decoration_categories_l2').insert(categoriesL2)
    if (error) throw error
  }

  // 3. 写入项目
  if (projects.length > 0) {
    const { error } = await supabase.from('decoration_projects').insert(
      projects.map(p => ({
        ...p,
        total_amount: Number(p.total_amount),
      }))
    )
    if (error) throw error
  }

  // 4. 写入支付记录
  if (payments.length > 0) {
    const { error } = await supabase.from('decoration_payments').insert(
      payments.map(p => ({
        ...p,
        amount: Number(p.amount),
      }))
    )
    if (error) throw error
  }

  // 5. 写入预算（同时写入本地最后修改时间，作为云端新旧标记）
  await upsertCloudBudget(budget.total_budget, state.last_modified_at || new Date().toISOString())
}

/** 写入/更新云端预算（user_id 无唯一约束，采用先查后写） */
async function upsertCloudBudget(totalBudget: number, updatedAt?: string): Promise<void> {
  const { data, error: queryError } = await supabase
    .from('decoration_budgets')
    .select('id')
    .eq('user_id', USER_ID)
    .maybeSingle()
  if (queryError) throw queryError

  if (data) {
    const { error } = await supabase
      .from('decoration_budgets')
      .update({ total_budget: Number(totalBudget), updated_at: updatedAt ?? new Date().toISOString() })
      .eq('user_id', USER_ID)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('decoration_budgets')
      .insert({ user_id: USER_ID, total_budget: Number(totalBudget), updated_at: updatedAt ?? new Date().toISOString() })
    if (error) throw error
  }
}

/** 仅更新云端预算 */
export async function updateCloudBudget(totalBudget: number): Promise<void> {
  await upsertCloudBudget(totalBudget)
}
