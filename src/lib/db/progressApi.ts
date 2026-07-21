import { supabase } from '@/lib/supabase'
import type { AnswerResult } from '@/types'

const USER_ID = 'rainbow-001'

export interface DbDailyProgress {
  date: string
  questions_done: number
  questions_correct: number
  completed: boolean
  today_questions: string[]  // question IDs
  session_answers: AnswerResult[]
  chinese_day_index: number
  current_index: number
}

/** 获取某天的学习进度 */
export async function fetchDailyProgress(date: string): Promise<DbDailyProgress | null> {
  const { data, error } = await supabase
    .from('daily_progress')
    .select('date, questions_done, questions_correct, completed, today_questions, session_answers, chinese_day_index, current_index')
    .eq('user_id', USER_ID)
    .eq('date', date)
    .maybeSingle()

  if (error) throw error
  return data
}

/** Upsert 当天进度 */
export async function upsertDailyProgress(data: DbDailyProgress) {
  const { error } = await supabase
    .from('daily_progress')
    .upsert(
      {
        user_id: USER_ID,
        date: data.date,
        questions_done: data.questions_done,
        questions_correct: data.questions_correct,
        completed: data.completed,
        today_questions: data.today_questions,
        session_answers: data.session_answers,
        chinese_day_index: data.chinese_day_index,
        current_index: data.current_index,
      },
      { onConflict: 'user_id,date' }
    )

  if (error) throw error
}

/** 获取历史学习天数 */
export async function fetchLearningDaysCount(): Promise<number> {
  const { count, error } = await supabase
    .from('daily_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', USER_ID)
    .eq('completed', true)

  if (error) throw error
  return count || 0
}

/** 获取所有已完成学习的日期列表（用于学习日历） */
export async function fetchLearningCalendar(): Promise<string[]> {
  const { data, error } = await supabase
    .from('daily_progress')
    .select('date')
    .eq('user_id', USER_ID)
    .eq('completed', true)
    .order('date', { ascending: false })

  if (error) throw error
  return (data || []).map((d: { date: string }) => d.date)
}
