import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <main className="flex-1 w-full max-w-[600px] mx-auto px-4 pt-4 pb-24">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
