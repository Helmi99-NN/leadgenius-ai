import { useState } from 'react'
import { motion } from 'framer-motion'
import { updateFollowUpStatus } from '../../services/followUpService'

export default function FollowUpCard({ item, index, onLeadClick }) {
  const [sent, setSent] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [copiedDraft, setCopiedDraft] = useState(false)

  const handleSend = async () => {
    try {
      setSent(true)
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

  const handleCopyDraft = () => {
    if (!item.aiDraft) return
    navigator.clipboard.writeText(item.aiDraft.replace(/^"|"$/g, ''))
    setCopiedDraft(true)
    setTimeout(() => setCopiedDraft(false), 2000)
  }

  if (isCompleted) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 + 0.1 }}
      className={`bg-white border border-outline-variant rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${
        item.status === 'overdue' ? 'border-l-4 border-l-error' : item.status === 'today' ? 'border-l-4 border-l-primary' : ''
      }`}
    >
      {/* Card Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          {/* Left: Status + Company */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Status Indicator */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.indicatorColor} ${item.indicatorTextColor}`}
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {item.indicatorIcon}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 
                  className="font-semibold text-on-surface text-[15px] leading-tight truncate cursor-pointer hover:text-primary transition-colors"
                  onClick={() => onLeadClick && onLeadClick(item.lead_id)}
                >
                  {item.company}
                </h3>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold leading-none whitespace-nowrap ${item.badgeBg} ${item.badgeText} ${
                    item.status !== 'overdue' ? 'border border-outline-variant/50' : ''
                  }`}
                >
                  {item.statusLabel}
                </span>
              </div>
              <p className="text-on-surface-variant text-[13px] leading-snug line-clamp-2">
                {item.description}
              </p>
            </div>
          </div>

          {/* Right: Platform Icon */}
          <div className="w-8 h-8 rounded-lg bg-surface-container-low border border-outline-variant/50 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-surface-variant text-[16px]">
              {item.icon}
            </span>
          </div>
        </div>
      </div>

      {/* AI Suggestion Section */}
      {item.aiDraft && (
        <div className="mx-5 mb-4">
          <div className="bg-surface-container-low border border-outline-variant/60 rounded-lg overflow-hidden">
            {/* Suggestion Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-surface-container/50 border-b border-outline-variant/40">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[14px]">
                  auto_awesome
                </span>
                <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                  Saran Balasan AI
                </span>
              </div>
              <button
                onClick={handleCopyDraft}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                  copiedDraft
                    ? 'bg-primary/10 text-primary'
                    : 'text-on-surface-variant hover:text-primary hover:bg-primary/5'
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">
                  {copiedDraft ? 'check' : 'content_copy'}
                </span>
                {copiedDraft ? 'Tersalin' : 'Salin'}
              </button>
            </div>
            {/* Suggestion Content */}
            <div className="px-3 py-3">
              <p className="text-[13px] text-on-surface-variant leading-relaxed italic">
                "{item.aiDraft}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-2">
          {item.actions.includes('send') && (
            <button
              onClick={handleSend}
              className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200 active:scale-[0.97] ${
                sent
                  ? 'bg-primary-container/30 text-primary border border-primary/20'
                  : 'bg-primary text-on-primary hover:bg-primary/90 shadow-sm'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {sent ? 'check_circle' : 'send'}
              </span>
              {sent ? 'Terkirim!' : 'Kirim Sekarang'}
            </button>
          )}

          {item.actions.includes('review') && (
            <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-semibold bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              Tinjau Draf
            </button>
          )}

          {item.actions.includes('snooze') && (
            <button
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-[13px] font-medium bg-surface hover:bg-surface-container border border-outline-variant text-on-surface-variant hover:text-on-surface transition-colors"
              title="Tunda"
            >
              <span className="material-symbols-outlined text-[16px]">snooze</span>
              <span className="hidden sm:inline">Tunda</span>
            </button>
          )}

          {item.actions.includes('complete') && (
            <button
              onClick={handleComplete}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-[13px] font-medium bg-surface hover:bg-surface-container border border-outline-variant text-on-surface-variant hover:text-primary transition-colors"
              title="Selesai"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span className="hidden sm:inline">Selesai</span>
            </button>
          )}

          {item.actions.includes('reschedule') && (
            <button
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-[13px] font-medium bg-surface hover:bg-surface-container border border-outline-variant text-on-surface-variant hover:text-on-surface transition-colors"
              title="Jadwalkan Ulang"
            >
              <span className="material-symbols-outlined text-[16px]">edit_calendar</span>
              <span className="hidden sm:inline">Jadwal Ulang</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
