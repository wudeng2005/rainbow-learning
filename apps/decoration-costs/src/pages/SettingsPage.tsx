import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDecorationStore } from '@/store/useDecorationStore'
import PageHeader from '@/components/PageHeader'
import { fetchCloudState, pushCloudState } from '@/lib/dbApi'

export default function SettingsPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { exportData, importData, resetAll, budget } = useDecorationStore()

  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `装修费用备份_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        importData(data)
        setSyncMessage('数据导入成功')
        setTimeout(() => setSyncMessage(''), 2000)
      } catch {
        setSyncMessage('导入失败：文件格式错误')
        setTimeout(() => setSyncMessage(''), 3000)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handlePush = async () => {
    setSyncing(true)
    setSyncMessage('')
    try {
      const state = useDecorationStore.getState()
      await pushCloudState(state)
      setSyncMessage('已同步到云端')
    } catch (error) {
      setSyncMessage(`同步失败：${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncMessage(''), 3000)
    }
  }

  const handlePull = async () => {
    setSyncing(true)
    setSyncMessage('')
    try {
      const cloud = await fetchCloudState()
      if (cloud) {
        importData(cloud)
        setSyncMessage('已从云端恢复')
      } else {
        setSyncMessage('云端暂无数据')
      }
    } catch (error) {
      setSyncMessage(`恢复失败：${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncMessage(''), 3000)
    }
  }

  const handleReset = () => {
    resetAll()
    setShowResetConfirm(false)
    setSyncMessage('数据已清空')
    setTimeout(() => setSyncMessage(''), 2000)
  }

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="设置" showBack={false} />

      {/* 预算入口 */}
      <section className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <button
          onClick={() => navigate('/budget')}
          className="w-full flex items-center justify-between py-1"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center text-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-text-primary">装修总预算</p>
              <p className="text-xs text-text-secondary">当前 ¥{budget.total_budget.toLocaleString('zh-CN')}</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </section>

      {/* 数据同步 */}
      <section className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <h3 className="font-bold text-text-primary mb-3">数据同步</h3>
        <div className="space-y-2">
          <button
            onClick={handlePush}
            disabled={syncing}
            className="w-full h-11 rounded-xl bg-primary text-white text-sm font-semibold active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CloudUploadIcon className="w-4 h-4" />
            同步到云端
          </button>
          <button
            onClick={handlePull}
            disabled={syncing}
            className="w-full h-11 rounded-xl bg-white text-primary text-sm font-semibold border border-primary active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CloudDownloadIcon className="w-4 h-4" />
            从云端恢复
          </button>
        </div>
        {syncMessage && <p className="text-xs text-center mt-2 text-text-secondary">{syncMessage}</p>}
      </section>

      {/* 数据导入导出 */}
      <section className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <h3 className="font-bold text-text-primary mb-3">数据备份</h3>
        <div className="space-y-2">
          <button
            onClick={handleExport}
            className="w-full h-11 rounded-xl bg-white text-text-primary text-sm font-semibold border border-border active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <DownloadIcon className="w-4 h-4" />
            导出 JSON 备份
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-11 rounded-xl bg-white text-text-primary text-sm font-semibold border border-border active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <UploadIcon className="w-4 h-4" />
            导入 JSON 备份
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>
      </section>

      {/* 清空数据 */}
      <section className="bg-white rounded-2xl p-4 shadow-sm">
        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full h-11 rounded-xl border border-danger text-danger text-sm font-medium active:scale-[0.98] transition-transform"
        >
          清空所有数据
        </button>
      </section>

      {/* 重置确认 */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
            <h3 className="text-lg font-bold text-text-primary mb-2">确认清空？</h3>
            <p className="text-sm text-text-secondary mb-5">此操作将删除所有项目、支付记录和自定义分类，不可恢复。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 h-11 rounded-xl bg-gray-100 text-text-secondary text-sm font-medium"
              >
                取消
              </button>
              <button onClick={handleReset} className="flex-1 h-11 rounded-xl bg-danger text-white text-sm font-semibold">
                清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CloudUploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  )
}

function CloudDownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
    </svg>
  )
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  )
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  )
}
