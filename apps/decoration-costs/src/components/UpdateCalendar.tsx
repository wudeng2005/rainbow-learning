import { useMemo, useState } from 'react'

const WEEK_LABELS = ['一', '二', '三', '四', '五', '六', '日']

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** 更新日志日历：在有更新的日期上打点，支持翻月查看 */
export default function UpdateCalendar({ dates }: { dates: string[] }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const dateSet = useMemo(() => new Set(dates), [dates])
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`

  const cells = useMemo(() => {
    const first = new Date(year, month - 1, 1)
    const offset = (first.getDay() + 6) % 7 // 周一起始
    const daysInMonth = new Date(year, month, 0).getDate()
    const list: (string | null)[] = Array(offset).fill(null)
    for (let d = 1; d <= daysInMonth; d++) {
      list.push(`${year}-${pad(month)}-${pad(d)}`)
    }
    return list
  }, [year, month])

  const changeMonth = (delta: number) => {
    let m = month + delta
    let y = year
    if (m < 1) {
      m = 12
      y -= 1
    }
    if (m > 12) {
      m = 1
      y += 1
    }
    setYear(y)
    setMonth(m)
  }

  const recent = useMemo(() => dates.slice(0, 8), [dates])

  return (
    <div>
      {/* 月份切换 */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => changeMonth(-1)}
          className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-text-secondary active:scale-95 transition-transform"
          aria-label="上个月"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="text-sm font-semibold text-text-primary font-num">
          {year} 年 {month} 月
        </p>
        <button
          onClick={() => changeMonth(1)}
          className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-text-secondary active:scale-95 transition-transform"
          aria-label="下个月"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 星期表头 */}
      <div className="grid grid-cols-7 mb-1">
        {WEEK_LABELS.map((w) => (
          <p key={w} className="text-center text-[11px] text-text-tertiary py-1">
            {w}
          </p>
        ))}
      </div>

      {/* 日期网格 */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((dateStr, i) =>
          dateStr === null ? (
            <div key={`blank-${i}`} />
          ) : (
            <div key={dateStr} className="flex flex-col items-center py-1">
              <span
                className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-num ${
                  dateStr === todayStr
                    ? 'bg-primary text-white font-semibold'
                    : dateSet.has(dateStr)
                      ? 'text-text-primary font-semibold'
                      : 'text-text-secondary'
                }`}
              >
                {Number(dateStr.slice(-2))}
              </span>
              <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${dateSet.has(dateStr) ? 'bg-accent' : 'bg-transparent'}`} />
            </div>
          )
        )}
      </div>

      {/* 最近更新记录 */}
      <div className="mt-3 pt-3 border-t border-gray-50">
        <p className="text-xs text-text-tertiary mb-2">最近更新</p>
        {recent.length === 0 ? (
          <p className="text-xs text-text-secondary text-center py-2">暂无更新记录</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {recent.map((d) => (
              <span key={d} className="text-[11px] font-num px-2 py-1 rounded-full bg-accent-soft text-accent">
                {d.replaceAll('-', '/')}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
