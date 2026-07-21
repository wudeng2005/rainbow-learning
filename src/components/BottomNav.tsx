import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useUserStore } from '@/store/useUserStore'
import { playTapSound } from '@/lib/sounds'

const tabs = [
  { path: '/', label: '首页', icon: '🏠', activeBg: 'from-rainbow-blue to-sky-300' },
  { path: '/gems', label: '宝箱', icon: '🎁', activeBg: 'from-rainbow-yellow to-amber-300' },
  { path: '/profile', label: '我的', icon: 'avatar', activeBg: 'from-rainbow-green to-emerald-300' },
]

export default function BottomNav() {
  const { currentUser } = useUserStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)] pointer-events-none">
      {/* 悬浮云朵导航条 */}
      <div className="max-w-md mx-auto px-5 pb-3">
        <div className="pointer-events-auto flex justify-around items-center bg-white/85 backdrop-blur-md rounded-[28px] border-2 border-white px-2 py-1.5 shadow-[0_8px_24px_rgba(120,100,180,0.18)]">
          {tabs.map(tab => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === '/'}
              className="flex flex-col items-center justify-center min-w-[72px] py-1.5 touch-manipulation"
              onClick={() => playTapSound()}
            >
              {({ isActive }) => (
                <>
                  <motion.div
                    className={`flex items-center justify-center w-11 h-11 rounded-2xl transition-all ${
                      isActive
                        ? `bg-gradient-to-br ${tab.activeBg} border-2 border-white toy-shadow-sm`
                        : 'bg-transparent'
                    }`}
                    animate={isActive ? { scale: [1, 1.18, 1], rotate: [0, -4, 4, 0] } : { scale: 1, rotate: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {tab.icon === 'avatar' ? (
                      <img
                        src={currentUser.avatar.startsWith('/') || currentUser.avatar.startsWith('http') ? currentUser.avatar : '/avatar.png'}
                        alt={currentUser.name}
                        className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <span className="text-[22px] leading-none">{tab.icon}</span>
                    )}
                  </motion.div>
                  <span className={`text-[10px] mt-0.5 font-display transition-colors ${
                    isActive ? 'text-ink' : 'text-ink-soft'
                  }`}>
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
