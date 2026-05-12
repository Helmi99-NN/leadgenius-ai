import { motion } from 'framer-motion'

export default function ContextExtraction({ result, isAnalyzing }) {
  const isEmpty = !result && !isAnalyzing

  const insights = result?.insights || []
  const transcript = result?.transcript || ''

  const priorityColors = {
    high: 'text-error',
    medium: 'text-secondary',
    low: 'text-primary',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-surface border border-outline-variant rounded-xl p-gutter relative"
    >
      <h3 className="font-headline-md text-headline-md text-on-surface mb-stack-md flex items-center gap-stack-sm">
        <span className="material-symbols-outlined text-primary">summarize</span>
        Ekstraksi Konteks
      </h3>

      {/* State: Kosong */}
      {isEmpty && (
        <div className="flex items-center justify-center text-center py-12 opacity-50">
          <div className="max-w-xs">
            <span className="material-symbols-outlined text-4xl text-outline mb-stack-md">
              chat_bubble
            </span>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Hasil ekstraksi konteks percakapan akan muncul di sini setelah
              analisis
            </p>
          </div>
        </div>
      )}

      {/* State: Loading */}
      {isAnalyzing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
          <div className="bg-surface-container rounded-lg p-stack-md border border-outline-variant animate-pulse">
            <div className="w-24 h-4 rounded bg-surface-container-highest mb-stack-sm" />
            <div className="space-y-2">
              <div className="w-full h-3 rounded bg-surface-container-highest" />
              <div className="w-3/4 h-3 rounded bg-surface-container-highest" />
              <div className="w-5/6 h-3 rounded bg-surface-container-highest" />
              <div className="w-2/3 h-3 rounded bg-surface-container-highest" />
            </div>
          </div>
          <div className="bg-primary-container/10 rounded-lg p-stack-md border border-primary/20 animate-pulse">
            <div className="w-32 h-4 rounded bg-primary/10 mb-stack-sm" />
            <div className="space-y-3">
              <div className="w-full h-4 rounded bg-primary/10" />
              <div className="w-4/5 h-4 rounded bg-primary/10" />
              <div className="w-3/4 h-4 rounded bg-primary/10" />
            </div>
          </div>
        </div>
      )}

      {/* State: Hasil */}
      {result && !isAnalyzing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
          {/* Transkrip Mentah */}
          <div className="bg-surface-container rounded-lg p-stack-md border border-outline-variant max-h-[250px] overflow-y-auto custom-scrollbar">
            <p className="font-label-sm text-label-sm text-outline mb-stack-sm uppercase tracking-wider sticky top-0 bg-surface-container pb-2">
              Transkrip Mentah
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant font-mono text-sm leading-relaxed whitespace-pre-wrap">
              {transcript || 'Tidak ada transkrip yang terdeteksi'}
            </p>
          </div>

          {/* Ringkasan Wawasan AI */}
          <div className="bg-primary-container/10 rounded-lg p-stack-md border border-primary/20">
            <p className="font-label-sm text-label-sm text-primary mb-stack-sm uppercase tracking-wider">
              Ringkasan Wawasan AI
            </p>

            {/* Info Produk & Intent */}
            {(result.product || result.intent) && (
              <div className="mb-stack-md pb-stack-md border-b border-primary/10">
                {result.product && (
                  <div className="flex items-center gap-stack-sm mb-unit">
                    <span className="material-symbols-outlined text-sm text-primary">
                      inventory_2
                    </span>
                    <span className="font-label-md text-label-md text-on-surface">
                      <strong>Produk:</strong> {result.product}
                    </span>
                  </div>
                )}
                {result.intent && (
                  <div className="flex items-center gap-stack-sm">
                    <span className="material-symbols-outlined text-sm text-secondary">
                      target
                    </span>
                    <span className="font-label-md text-label-md text-on-surface">
                      <strong>Niat:</strong> {result.intent}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Insights */}
            <ul className="space-y-stack-sm">
              {insights.map((item, idx) => (
                <li key={idx} className="flex items-start gap-stack-sm">
                  <span
                    className={`material-symbols-outlined text-sm mt-0.5 ${
                      priorityColors[item.priority] || 'text-primary'
                    }`}
                  >
                    arrow_right
                  </span>
                  <span className="font-body-md text-body-md text-on-surface">
                    {item.text}
                  </span>
                </li>
              ))}
              {insights.length === 0 && (
                <li className="text-on-surface-variant font-body-md text-body-md">
                  Tidak ada insight yang terdeteksi
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </motion.div>
  )
}
