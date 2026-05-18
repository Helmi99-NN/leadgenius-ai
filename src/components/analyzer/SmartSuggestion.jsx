import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SmartSuggestion({ result, isAnalyzing }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!result?.bestReply) return
    navigator.clipboard.writeText(result.bestReply.replace(/^"|"$/g, ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!result && !isAnalyzing) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white border border-primary/15 rounded-xl overflow-hidden shadow-sm"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-primary/5 border-b border-primary/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[16px]">auto_awesome</span>
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-primary leading-tight">
              Saran Jawaban Terbaik
            </h3>
            <p className="text-[11px] text-on-surface-variant leading-tight">
              Berdasarkan analisis konteks & sentimen
            </p>
          </div>
        </div>
        
        <button
          onClick={handleCopy}
          disabled={isAnalyzing || !result?.bestReply}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200 ${
            copied 
              ? 'bg-primary/15 text-primary' 
              : 'bg-primary text-on-primary hover:bg-primary/90 shadow-sm'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <span className="material-symbols-outlined text-[14px]">
            {copied ? 'check' : 'content_copy'}
          </span>
          {copied ? 'Tersalin!' : 'Salin Jawaban'}
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        {isAnalyzing ? (
          <div className="space-y-2.5 animate-pulse">
            <div className="h-4 bg-primary/8 rounded-md w-full" />
            <div className="h-4 bg-primary/8 rounded-md w-5/6" />
            <div className="h-4 bg-primary/8 rounded-md w-2/3" />
          </div>
        ) : (
          <>
            <div className="bg-surface-container-low border border-outline-variant/40 rounded-lg p-4">
              <p className="text-[14px] text-on-surface leading-relaxed">
                {result?.bestReply || 'AI sedang merumuskan jawaban terbaik...'}
              </p>
            </div>

            {result?.bestReply && (
              <div className="mt-3 flex items-center gap-1.5 text-on-surface-variant/60">
                <span className="material-symbols-outlined text-[13px]">info</span>
                <p className="text-[11px]">
                  Klik salin untuk menggunakan jawaban ini langsung di chat.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}
