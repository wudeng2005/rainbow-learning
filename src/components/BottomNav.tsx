import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useUserStore } from '@/store/useUserStore'

const tabs = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/gems', label: '宝箱', icon: '🎁' },
  { path: '/profile', label: '我的', icon: 'avatar' },
]

export default function BottomNav() {
  const { currentUser } = useUserStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 pb-[env(safe-area-inset-bottom)] z-50">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {tabs.map(tab => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[72px] min-h-[56px] py-2 transition-all ${
                isActive
                  ? 'text-rainbow-purple'
                  : 'text-text-secondary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                    isActive ? 'bg-rainbow-purple/10' : ''
                  }`}
                  animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {tab.icon === 'avatar' ? (
                    <img
                      src={currentUser.avatar.startsWith('/') || currentUser.avatar.startsWith('http') ? currentUser.avatar : '/avatar.png'}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover border border-white shadow-sm"
                    />
                  ) : (
                    <span className="text-[24px] leading-none">{tab.icon}</span>
                  )}
                </motion.div>
                <span className={`text-[10px] font-medium ${
                  isActive ? 'text-rainbow-purple' : 'text-text-secondary'
                }`}>
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
