import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDecorationStore, formatMoney } from '@/store/useDecorationStore'
import PageHeader from '@/components/PageHeader'
import type { Project } from '@/types'

export default function ProjectListPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialCategory = searchParams.get('category') || 'all'

  const { projects, categoriesL1, getProjectPaidAmount } = useDecorationStore()
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [search, setSearch] = useState('')

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchCategory = activeCategory === 'all' || p.category_l1_id === activeCategory
      const keyword = search.trim().toLowerCase()
      const matchSearch =
        !keyword ||
        p.name.toLowerCase().includes(keyword) ||
        p.vendor.toLowerCase().includes(keyword)
      return matchCategory && matchSearch
    })
  }, [projects, activeCategory, search])

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="费用项目"
        rightAction={
          <button
            onClick={() => navigate('/projects/new')}
            className="h-9 px-3 rounded-full bg-primary text-white text-sm font-semibold shadow-md shadow-primary/20 active:scale-95 transition-transform flex items-center gap-1"
          >
            <PlusIcon className="w-4 h-4" />
            新增
          </button>
        }
      />

      {/* 搜索框 */}
      <div className="relative mb-3">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索项目或收款方"
          className="w-full h-11 pl-9 pr-4 text-sm text-text-primary bg-white rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        />
      </div>

      {/* 分类筛选 */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-hide">
        <CategoryTag
          key="all"
          label="全部"
          active={activeCategory === 'all'}
          onClick={() => setActiveCategory('all')}
        />
        {categoriesL1.map((c) => (
          <CategoryTag
            key={c.category_l1_id}
            label={`${c.icon} ${c.name}`}
            active={activeCategory === c.category_l1_id}
            onClick={() => setActiveCategory(c.category_l1_id)}
          />
        ))}
      </div>

      {/* 项目列表 */}
      <div className="space-y-3">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.project_id} project={project} paidAmount={getProjectPaidAmount(project.project_id)} />
        ))}
        {filteredProjects.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <p className="text-text-secondary text-sm">暂无项目</p>
            <button
              onClick={() => navigate('/projects/new')}
              className="mt-3 text-primary text-sm font-medium"
            >
              添加第一个费用项目
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function CategoryTag({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
        active ? 'bg-primary text-white' : 'bg-white text-text-secondary border border-border'
      }`}
    >
      {label}
    </button>
  )
}

function ProjectCard({ project, paidAmount }: { project: Project; paidAmount: number }) {
  const navigate = useNavigate()
  const unpaid = Math.max(0, project.total_amount - paidAmount)
  const progress = project.total_amount > 0 ? Math.min(100, Math.round((paidAmount / project.total_amount) * 1000) / 10) : 0

  return (
    <button
      onClick={() => navigate(`/projects/${project.project_id}`)}
      className="w-full bg-white rounded-2xl p-4 shadow-sm text-left active:scale-[0.99] transition-transform"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-text-primary truncate">{project.name}</h3>
          {project.vendor && <p className="text-xs text-text-secondary mt-0.5 truncate">{project.vendor}</p>}
        </div>
        <span
          className={`flex-shrink-0 ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${
            project.status === '已付清' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
          }`}
        >
          {project.status}
        </span>
      </div>

      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-xs text-text-secondary">项目总计</p>
          <p className="text-lg font-bold font-num text-text-primary">{formatMoney(project.total_amount)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-secondary">已付 / 未付</p>
          <p className="text-sm font-semibold font-num text-primary">
            {formatMoney(paidAmount)} <span className="text-text-tertiary">/ {formatMoney(unpaid)}</span>
          </p>
        </div>
      </div>

      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            progress >= 100 ? 'bg-success' : 'bg-primary'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </button>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}
