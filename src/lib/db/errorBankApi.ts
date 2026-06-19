import { supabase } from '@/lib/supabase'
import type { ErrorRecord } from '@/types'

const USER_ID = 'rainbow-001'

/** 获取全部错题记录 */
export async function fetchErrorBank(): Promise<Record<string, ErrorRecord>> {
  const { data, error } = await supabase
    .from('error_bank')
    .select('question_id, error_count, correct_count, mastery_level, next_review_date, last_attempt')
    .eq('user_id', USER_ID)

  if (error) throw error

  const result: Record<string, ErrorRecord> = {}
  for (const row of data || []) {
    result[row.question_id] = {
      questionId: row.question_id,
      errorCount: row.error_count,
      correctCount: row.correct_count,
      masteryLevel: row.mastery_level as 0 | 1 | 2 | 3,
      nextReviewDate: row.next_review_date,
      lastAttempt: row.last_attempt,
    }
  }
  return result
}

/** 批量 upsert 错题记录 */
export async function upsertErrorRecords(records: ErrorRecord[]) {
  if (records.length === 0) return

  const rows = records.map(r => ({
    user_id: USER_ID,
    question_id: r.questionId,
    error_count: r.errorCount,
    correct_count: r.correctCount,
    mastery_level: r.masteryLevel,
    next_review_date: r.nextReviewDate,
    last_attempt: r.lastAttempt,
  }))

  const { error } = await supabase
    .from('error_bank')
    .upsert(rows, { onConflict: 'user_id,question_id' })

  if (error) throw error
}
