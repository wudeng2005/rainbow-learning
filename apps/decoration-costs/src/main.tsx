import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { initCloudSync } from '@/lib/cloudSync'

registerSW({ immediate: true })
initCloudSync()

// 应用回到前台时主动检查 Service Worker 更新，确保旧设备尽快拿到新版本
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then((reg) => reg?.update())
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
