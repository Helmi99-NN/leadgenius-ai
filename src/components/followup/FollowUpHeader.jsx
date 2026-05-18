import { motion } from 'framer-motion'

export default function FollowUpHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2"
    >
      <div>
        <h1 className="font-display-lg text-display-lg text-on-surface mb-1">
          Tindak Lanjut Pintar
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-lg">
          Kelola dan otomatisasi komunikasi marketplace Anda dengan bantuan AI.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-semibold border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-[16px]">group_add</span>
          Tugaskan ke Tim
        </button>
        <button className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-semibold border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-[16px]">done_all</span>
          Tandai Semua Selesai
        </button>
      </div>
    </motion.div>
  )
}
