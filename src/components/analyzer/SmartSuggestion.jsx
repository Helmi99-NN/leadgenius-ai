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
      className="bg-primary-container/30 border border-primary/20 rounded-xl p-gutter relative overflow-hidden"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-stack-md">
          <div className="flex items-center gap-stack-sm">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
            </div>
            <div>
              <h3 className="font-label-lg text-label-lg text-primary font-bold">
                Saran Jawaban Terbaik
              </h3>
              <p className="font-body-xs text-body-xs text-on-surface-variant">
                Berdasarkan analisis konteks & sentimen
              </p>
            </div>
          </div>
          
          <button
            onClick={handleCopy}
            disabled={isAnalyzing || !result?.bestReply}
            className={`flex items-center gap-unit px-stack-md py-1.5 rounded-lg font-label-md text-label-md transition-all ${
              copied 
                ? 'bg-success text-on-success' 
                : 'bg-primary text-on-primary hover:bg-primary/90'
            } disabled:opacity-50`}
          >
            <span className="material-symbols-outlined text-sm">
              {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? 'Tersalin' : 'Salin Jawaban'}
          </button>
        </div>

        {isAnalyzing ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-primary/10 rounded w-full" />
            <div className="h-4 bg-primary/10 rounded w-5/6" />
          </div>
        ) : (
          <div className="bg-surface/50 backdrop-blur-sm border border-primary/10 rounded-lg p-stack-md">
            <p className="font-body-md text-body-md text-on-surface-variant italic leading-relaxed">
              "{result?.bestReply || 'AI sedang merumuskan jawaban terbaik...'}"
            </p>
          </div>
        )}

        {!isAnalyzing && result?.bestReply && (
          <div className="mt-stack-md flex items-center gap-stack-sm text-primary/70">
            <span className="material-symbols-outlined text-sm">info</span>
            <p className="font-body-xs text-body-xs">
              Klik salin untuk menggunakan jawaban ini langsung di chat.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
