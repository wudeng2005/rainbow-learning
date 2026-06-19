import { motion } from 'framer-motion'

const stars = Array.from({ length: 8 }, (_, i) => i)

export default function StarAnimation() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map(i => {
        const angle = (i / stars.length) * 360
        const radius = 60 + Math.random() * 40
        const x = Math.cos((angle * Math.PI) / 180) * radius
        const y = Math.sin((angle * Math.PI) / 180) * radius

        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 text-2xl"
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{ x, y, opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.8, delay: i * 0.05, ease: 'easeOut' }}
          >
            ⭐
          </motion.span>
        )
      })}
    </div>
  )
}
