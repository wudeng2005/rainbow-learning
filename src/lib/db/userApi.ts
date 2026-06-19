import { supabase } from '@/lib/supabase'

const USER_ID = 'rainbow-001'

export interface DbUser {
  id: string
  name: string
  avatar: string
  gems_total: number
}

/** 获取用户信息 */
export async function fetchUser(): Promise<DbUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, avatar, gems_total')
    .eq('id', USER_ID)
    .maybeSingle()

  if (error) throw error
  return data
}

/** 更新用户信息 */
export async function updateUser(updates: Partial<Pick<DbUser, 'name' | 'avatar' | 'gems_total'>>) {
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', USER_ID)

  if (error) throw error
}
