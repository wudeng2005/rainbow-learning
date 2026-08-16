import { useNavigate } from 'react-router-dom'

interface PageHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  rightAction?: React.ReactNode
}

export default function PageHeader({ title, subtitle, showBack = true, rightAction }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="flex items-center justify-between mb-5 safe-top">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-text-secondary active:scale-95 transition-transform"
            aria-label="返回"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold text-text-primary">{title}</h1>
          {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {rightAction}
    </header>
  )
}
