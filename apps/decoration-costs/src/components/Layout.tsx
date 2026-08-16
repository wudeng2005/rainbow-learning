import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <main className="flex-1 w-full max-w-[600px] md:max-w-[760px] mx-auto px-4 sm:px-6 md:px-8 pt-4 pb-24">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
