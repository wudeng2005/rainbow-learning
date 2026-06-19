import { useGemStore } from '@/store/useGemStore'
import { motion } from 'framer-motion'

export default function GemCounter() {
  const total = useGemStore(s => s.total)

  return (
    <motion.div
      className="flex items-center gap-1 bg-gem-gold/10 px-3 py-1.5 rounded-full"
      whileTap={{ scale: 0.95 }}
    >
      <span className="text-xl">💎</span>
      <motion.span
        key={total}
        className="font-bold text-gem-gold text-lg"
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {total}
      </motion.span>
    </motion.div>
  )
}
