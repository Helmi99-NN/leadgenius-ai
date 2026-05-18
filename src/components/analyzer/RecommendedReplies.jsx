import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const tabs = [
  { id: 'hard', label: 'Penjualan Agresif', icon: 'bolt' },
  { id: 'soft', label: 'Penjualan Halus', icon: 'spa' },
  { id: 'authority', label: 'Otoritas', icon: 'verified' },
  { id: 'scarcity', label: 'Kelangkaan', icon: 'timer' },
]

const defaultReplies = {
  hard: [],
  soft: [],
  authority: [],
  scarcity: [],
}

export default function RecommendedReplies({
  activeTab,
  onTabChange,
  result,
  isAnalyzing,
}) {
  const [copiedIdx, setCopiedIdx] = useState(null)

  const isEmpty = !result && !isAnalyzing

  // Ambil balasan dari hasil AI atau default kosong
  const repliesByTab = result?.replies || defaultReplies
  const replies = repliesByTab[activeTab] || []

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text.replace(/^"|"$/g, ''))
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="bg-white border border-outline-variant rounded-xl overflow-hidden flex-1 flex flex-col shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/50">
        <h3 className="text-[16px] font-semibold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">forum</span>
          Rekomendasi Balasan
        </h3>
        <button className="text-on-surface-variant hover:text-primary text-[12px] font-medium flex items-center gap-1 transition-colors">
          <span className="material-symbols-outlined text-[14px]">tune</span>
          Konfigurasi
        </button>
      </div>

      {/* Tabs - Pill Style */}
      <div className="px-5 py-3 border-b border-outline-variant/30 bg-surface-container-low/30">
        <div className="flex gap-1.5 overflow-x-auto pb-px scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* State: Kosong */}
      {isEmpty && (
        <div className="flex-1 flex items-center justify-center text-center py-16 px-6">
          <div className="max-w-xs">
            <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-outline">
                smart_toy
              </span>
            </div>
            <p className="text-[14px] text-on-surface-variant leading-relaxed">
              Rekomendasi balasan AI akan muncul di sini setelah analisis
              screenshot chat
            </p>
          </div>
        </div>
      )}

      {/* State: Loading */}
      {isAnalyzing && (
        <div className="p-5 space-y-3 flex-1 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-surface-container-low rounded-lg p-4 border border-outline-variant/30"
            >
              <div className="space-y-2">
                <div className="w-full h-3.5 rounded-md bg-surface-container-highest" />
                <div className="w-5/6 h-3.5 rounded-md bg-surface-container-highest" />
                <div className="w-3/4 h-3.5 rounded-md bg-surface-container-highest" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* State: Hasil */}
      {result && !isAnalyzing && (
        <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {replies.length > 0 ? (
                replies.map((reply, idx) => (
                  <div
                    key={idx}
                    className="group relative bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 hover:border-outline-variant rounded-lg transition-all duration-200"
                  >
                    {/* Reply Number Badge */}
                    <div className="flex items-start gap-3 p-4">
                      <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[11px] font-bold">{idx + 1}</span>
                      </div>
                      <p className="text-[14px] text-on-surface leading-relaxed flex-1 pr-2">
                        {reply}
                      </p>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-end gap-1 px-3 pb-3 pt-0">
                      <button
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[13px]">edit</span>
                        Edit
                      </button>
                      <button
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                          copiedIdx === idx
                            ? 'bg-primary/10 text-primary'
                            : 'text-on-surface-variant hover:text-primary hover:bg-primary/5'
                        }`}
                        title="Salin"
                        onClick={() => handleCopy(reply, idx)}
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {copiedIdx === idx ? 'check' : 'content_copy'}
                        </span>
                        {copiedIdx === idx ? 'Tersalin!' : 'Salin'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <span className="material-symbols-outlined text-3xl text-outline mb-2 block">
                    chat_paste_go
                  </span>
                  <p className="text-[13px] text-on-surface-variant">
                    Tidak ada balasan untuk gaya ini
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}
