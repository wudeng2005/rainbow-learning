import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/store/useUserStore'
import { motion } from 'framer-motion'

export default function UserAvatar() {
  const navigate = useNavigate()
  const { currentUser } = useUserStore()

  return (
    <motion.div
      className="w-9 h-9 rounded-full bg-gradient-to-br from-rainbow-orange to-rainbow-yellow flex items-center justify-center shadow-sm border-2 border-white cursor-pointer"
      whileTap={{ scale: 0.9 }}
      onClick={() => navigate('/profile')}
    >
      {currentUser.avatar.startsWith('http') || currentUser.avatar.startsWith('/') ? (
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span className="text-lg leading-none">{currentUser.avatar}</span>
      )}
    </motion.div>
  )
}
