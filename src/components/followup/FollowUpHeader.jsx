import { motion } from 'framer-motion'

export default function FollowUpHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col md:flex-row md:items-end justify-between gap-stack-md"
    >
      <div>
        <h1 className="font-display-lg text-display-lg text-on-surface mb-unit">
          Tindak Lanjut Pintar
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Kelola dan otomatisasi komunikasi marketplace Anda.
        </p>
      </div>
      <div className="flex items-center gap-stack-sm">
        <button className="bg-transparent border border-outline text-on-surface font-label-md text-label-md px-stack-md py-stack-sm rounded-lg transition-colors hover:bg-surface-container flex items-center gap-unit">
          <span className="material-symbols-outlined text-[18px]">group_add</span>
          Tugaskan ke Tim
        </button>
        <button className="bg-transparent border border-outline text-on-surface font-label-md text-label-md px-stack-md py-stack-sm rounded-lg transition-colors hover:bg-surface-container flex items-center gap-unit">
          <span className="material-symbols-outlined text-[18px]">done_all</span>
          Tandai Semua Selesai
        </button>
      </div>
    </motion.div>
  )
}
