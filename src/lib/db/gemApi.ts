import { supabase } from '@/lib/supabase'
import type { GemRecord } from '@/types'

const USER_ID = 'rainbow-001'

/** 获取全部宝石记录（最近50条） */
export async function fetchGemRecords(): Promise<{ total: number; records: GemRecord[] }> {
  const [{ data: records, error: recErr }, { data: user, error: userErr }] = await Promise.all([
    supabase
      .from('gem_records')
      .select('amount, source, date')
      .eq('user_id', USER_ID)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('users')
      .select('gems_total')
      .eq('id', USER_ID)
      .single(),
  ])

  if (recErr) throw recErr
  if (userErr) throw userErr

  return {
    total: user?.gems_total || 0,
    records: (records || []) as GemRecord[],
  }
}

/** 批量插入宝石记录 */
export async function insertGemRecords(newRecords: GemRecord[]) {
  if (newRecords.length === 0) return

  const rows = newRecords.map(r => ({
    user_id: USER_ID,
    amount: r.amount,
    source: r.source,
    date: r.date,
  }))

  const { error } = await supabase.from('gem_records').insert(rows)
  if (error) throw error
}

/** 更新用户宝石总量 */
export async function updateGemsTotal(total: number) {
  const { error } = await supabase
    .from('users')
    .update({ gems_total: total })
    .eq('id', USER_ID)

  if (error) throw error
}
