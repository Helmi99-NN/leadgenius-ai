import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PlatformBadge from '../ui/PlatformBadge'

const scoreBadgeStyles = {
  hot: 'bg-error-container text-on-error-container',
  warm: 'bg-secondary-container text-on-secondary-container',
  cold: 'bg-tertiary-container text-on-tertiary-container',
}

export default function LeadCard({ lead, category, borderColor, onClick, onDelete, delay = 0 }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const badgeStyle = scoreBadgeStyles[category] || scoreBadgeStyles.cold

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }
    // Konfirmasi kedua: hapus
    setIsDeleting(true)
    try {
      if (onDelete) await onDelete(lead.id)
    } catch (err) {
      console.error('Gagal menghapus:', err)
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  const handleCancelDelete = (e) => {
    e.stopPropagation()
    setShowConfirm(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0, padding: 0 }}
      transition={{ duration: 0.3, delay }}
      layout
      onClick={onClick}
      className={`bg-white border border-outline-variant/60 rounded-lg p-stack-md cursor-pointer transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:border-primary-container group relative ${
        borderColor ? `border-t-2 ${borderColor}` : ''
      }`}
    >
      {/* Tombol Hapus (muncul saat hover) */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        {!showConfirm ? (
          <button
            onClick={handleDelete}
            className="w-7 h-7 rounded-full bg-surface-container-highest/80 hover:bg-error/10 flex items-center justify-center text-outline hover:text-error transition-colors"
            title="Hapus prospek"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
        ) : null}
      </div>

      {/* Konfirmasi Hapus */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-20 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="material-symbols-outlined text-error text-3xl mb-2">
              warning
            </span>
            <p className="font-label-md text-label-md text-on-surface text-center mb-1">
              Hapus <strong>{lead.company}</strong>?
            </p>
            <p className="text-label-sm text-on-surface-variant text-center mb-3">
              Semua chat & follow-up akan ikut terhapus
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCancelDelete}
                className="px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1.5 rounded-lg bg-error text-white font-label-md text-label-md hover:bg-error/90 transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                    Hapus
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Kartu */}
      <div className="flex justify-between items-start mb-stack-sm">
        <div>
          <h4 className="font-label-md text-label-md text-on-surface">{lead.company}</h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            <PlatformBadge platform={lead.platform} size={16} />
            <span className="font-label-sm text-label-sm text-on-surface-variant">{lead.contact}</span>
          </div>
        </div>
        <span
          className={`${badgeStyle} font-label-sm text-label-sm px-2 py-0.5 rounded flex items-center gap-1`}
        >
          {category === 'hot' && (
            <span className="material-symbols-outlined text-[14px]">
              local_fire_department
            </span>
          )}
          {lead.score}
        </span>
      </div>

      {/* Konteks */}
      <p className="font-body-md text-body-md text-on-surface-variant text-sm line-clamp-2 mb-stack-md">
        {lead.context}
      </p>

      {/* Footer Kartu */}
      <div className="flex justify-between items-center pt-stack-sm border-t border-outline-variant/30">
        <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">schedule</span>
          {lead.time}
        </span>

        {lead.needsFollowUp && (
          <div
            className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container"
            title="Butuh tindak lanjut"
          >
            <span className="material-symbols-outlined text-[14px]">priority_high</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
