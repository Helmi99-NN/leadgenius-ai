import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const tabs = [
  { id: 'hard', label: 'Penjualan Agresif' },
  { id: 'soft', label: 'Penjualan Halus' },
  { id: 'authority', label: 'Otoritas' },
  { id: 'scarcity', label: 'Kelangkaan' },
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
      className="bg-surface border border-outline-variant rounded-xl p-gutter flex-1 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-gutter">
        <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-stack-sm">
          <span className="material-symbols-outlined text-primary">forum</span>
          Rekomendasi Balasan
        </h3>
        <button className="text-secondary hover:text-primary font-label-md text-label-md flex items-center gap-unit transition-colors">
          <span className="material-symbols-outlined text-sm">tune</span>
          Konfigurasi Nada
        </button>
      </div>

      {/* Tab */}
      <div className="flex gap-stack-sm border-b border-outline-variant mb-stack-md overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-stack-md py-stack-sm font-label-md text-label-md whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* State: Kosong */}
      {isEmpty && (
        <div className="flex-1 flex items-center justify-center text-center py-12 opacity-50">
          <div className="max-w-xs">
            <span className="material-symbols-outlined text-4xl text-outline mb-stack-md">
              smart_toy
            </span>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Rekomendasi balasan AI akan muncul di sini setelah analisis
              screenshot chat
            </p>
          </div>
        </div>
      )}

      {/* State: Loading */}
      {isAnalyzing && (
        <div className="space-y-stack-md flex-1 animate-pulse">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-surface-container rounded-lg p-stack-md border border-outline-variant"
            >
              <div className="space-y-2">
                <div className="w-full h-4 rounded bg-surface-container-highest" />
                <div className="w-5/6 h-4 rounded bg-surface-container-highest" />
                <div className="w-3/4 h-4 rounded bg-surface-container-highest" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* State: Hasil */}
      {result && !isAnalyzing && (
        <div className="space-y-stack-md flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-stack-md"
            >
              {replies.length > 0 ? (
                replies.map((reply, idx) => (
                  <div
                    key={idx}
                    className="group relative bg-surface-container hover:bg-surface-container-high border border-outline-variant rounded-lg p-stack-md transition-colors"
                  >
                    <p className="font-body-md text-body-md text-on-surface pr-20">
                      {reply}
                    </p>

                    {/* Tombol aksi hover */}
                    <div className="absolute top-4 right-4 flex gap-unit opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="w-8 h-8 rounded bg-surface flex items-center justify-center text-on-surface-variant hover:text-primary border border-outline-variant transition-colors"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-sm">
                          edit
                        </span>
                      </button>
                      <button
                        className={`w-8 h-8 rounded bg-surface flex items-center justify-center border border-outline-variant transition-colors ${
                          copiedIdx === idx
                            ? 'text-primary border-primary'
                            : 'text-on-surface-variant hover:text-secondary'
                        }`}
                        title="Salin"
                        onClick={() => handleCopy(reply, idx)}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {copiedIdx === idx ? 'check' : 'content_copy'}
                        </span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 opacity-50">
                  <p className="font-body-md text-body-md text-on-surface-variant">
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
