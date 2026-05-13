import { useState } from 'react'
import { motion } from 'framer-motion'
import { updateFollowUpStatus } from '../../services/followUpService'

export default function FollowUpCard({ item, index }) {
  const [sent, setSent] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const isEven = index % 2 === 0

  const handleSend = async () => {
    try {
      setSent(true)
      // Simulasikan pengiriman dan tandai selesai di DB
      await updateFollowUpStatus(item.id, 'completed')
      setTimeout(() => setIsCompleted(true), 1500)
    } catch (err) {
      console.error('Gagal mengirim:', err)
      setSent(false)
    }
  }

  const handleComplete = async () => {
    try {
      await updateFollowUpStatus(item.id, 'completed')
      setIsCompleted(true)
    } catch (err) {
      console.error('Gagal menandai selesai:', err)
    }
  }

  if (isCompleted) return null // Sembunyikan jika sudah selesai


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 + 0.15 }}
      className={`relative flex items-start justify-between md:justify-normal group ${
        isEven ? '' : 'md:flex-row-reverse'
      }`}
    >
      {/* Indikator Timeline */}
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface shadow shrink-0 z-10 ${item.indicatorColor} ${item.indicatorTextColor} ${item.indicatorBorder || ''} md:order-1 ${
          isEven ? 'md:-translate-x-1/2' : 'md:translate-x-1/2'
        }`}
        style={{ position: 'relative' }}
      >
        <span
          className="material-symbols-outlined text-[20px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {item.indicatorIcon}
        </span>
      </div>

      {/* Konten Kartu */}
      <div
        className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] ml-4 md:ml-0 bg-white border border-outline-variant rounded-xl p-stack-md shadow-sm hover:shadow-md transition-shadow ${
          item.hasTopBorder ? 'border-t-4 border-t-primary' : ''
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-stack-sm">
          <div>
            <span
              className={`inline-block px-2 py-1 rounded font-label-sm text-label-sm mb-unit ${item.badgeBg} ${item.badgeText} ${
                item.status !== 'overdue' ? 'border border-outline-variant' : ''
              }`}
            >
              {item.statusLabel}
            </span>
            <h3 className="font-headline-md text-headline-md text-on-surface">
              {item.company}
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {item.description}
            </p>
          </div>
          <div className="h-8 w-8 rounded-full bg-surface-container overflow-hidden border border-outline-variant flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-surface-variant">
              {item.icon}
            </span>
          </div>
        </div>

        {/* Draf Balasan AI */}
        <div
          className={`${item.aiDraftBg} border ${item.aiDraftBorder} rounded p-stack-sm mb-stack-md`}
        >
          <div
            className={`flex items-center gap-unit ${item.aiDraftLabelColor} text-xs mb-1 font-medium`}
          >
            <span className="material-symbols-outlined text-[14px]">
              auto_awesome
            </span>
            Saran Balasan
          </div>
          <p
            className={`font-body-md text-label-md ${item.aiDraftTextColor} italic`}
          >
            {item.aiDraft}
          </p>
        </div>

        {/* Tombol Aksi */}
        <div className="flex flex-wrap gap-stack-sm">
          {item.actions.includes('send') && (
            <button
              onClick={handleSend}
              className={`font-label-md text-label-md px-stack-md py-stack-sm rounded flex-1 flex items-center justify-center gap-unit transition-all active:scale-95 ${
                sent
                  ? 'bg-primary-container text-on-primary-container'
                  : 'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {sent ? 'check' : 'send'}
              </span>
              {sent ? 'Terkirim!' : 'Kirim Sekarang'}
            </button>
          )}

          {item.actions.includes('review') && (
            <button className="bg-surface hover:bg-surface-container border border-outline-variant text-on-surface font-label-md text-label-md px-stack-md py-stack-sm rounded flex-1 transition-colors">
              Tinjau Draf
            </button>
          )}

          {item.actions.includes('snooze') && (
            <button
              className="bg-surface hover:bg-surface-container border border-outline-variant text-on-surface font-label-md text-label-md px-stack-sm py-stack-sm rounded transition-colors"
              title="Tunda"
            >
              <span className="material-symbols-outlined text-[18px]">snooze</span>
            </button>
          )}

          {item.actions.includes('complete') && (
            <button
              onClick={handleComplete}
              className="bg-surface hover:bg-surface-container border border-outline-variant text-on-surface font-label-md text-label-md px-stack-sm py-stack-sm rounded transition-colors"
              title="Selesai"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
            </button>
          )}


          {item.actions.includes('reschedule') && (
            <button
              className="bg-surface hover:bg-surface-container border border-outline-variant text-on-surface font-label-md text-label-md px-stack-sm py-stack-sm rounded transition-colors"
              title="Jadwalkan Ulang"
            >
              <span className="material-symbols-outlined text-[18px]">
                edit_calendar
              </span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
