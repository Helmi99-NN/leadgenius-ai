import { motion } from 'framer-motion'

const categoryConfig = {
  hot: {
    label: 'PROSPEK PANAS',
    icon: 'local_fire_department',
    badgeClass:
      'bg-error-container text-on-error-container border-error/30',
  },
  warm: {
    label: 'PROSPEK HANGAT',
    icon: 'sunny',
    badgeClass:
      'bg-secondary-container text-on-secondary-container border-secondary/30',
  },
  cold: {
    label: 'PROSPEK DINGIN',
    icon: 'ac_unit',
    badgeClass:
      'bg-tertiary-container text-on-tertiary-container border-tertiary/30',
  },
}

export default function IntelligenceReading({ result, isAnalyzing }) {
  const score = result?.score || 0
  const category = result?.category || 'cold'
  const sentiment = result?.sentiment || '-'
  const config = categoryConfig[category] || categoryConfig.cold

  // State: belum ada data
  const isEmpty = !result && !isAnalyzing

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-surface border border-outline-variant rounded-xl p-gutter flex-1 flex flex-col relative overflow-hidden"
    >
      {/* Dekorasi blur */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

      <h3 className="font-headline-md text-headline-md text-on-surface mb-gutter flex items-center gap-stack-sm">
        <span className="material-symbols-outlined text-secondary">speed</span>
        Pembacaan Intelijen
      </h3>

      {/* State: Kosong — belum ada analisis */}
      {isEmpty && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8 opacity-50">
          <span className="material-symbols-outlined text-4xl text-outline mb-stack-md">
            psychology
          </span>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Upload dan analisis screenshot chat untuk melihat hasil intelijen AI
          </p>
        </div>
      )}

      {/* State: Sedang menganalisis */}
      {isAnalyzing && (
        <div className="flex-1 flex flex-col gap-stack-md">
          {/* Skeleton gauge */}
          <div className="flex items-center justify-between bg-surface-container rounded-lg p-stack-md border border-outline-variant animate-pulse">
            <div className="w-24 h-24 rounded-full bg-surface-container-highest" />
            <div className="flex flex-col items-end gap-stack-sm">
              <div className="w-32 h-8 rounded-full bg-surface-container-highest" />
              <div className="w-20 h-4 rounded bg-surface-container-highest" />
              <div className="w-24 h-5 rounded bg-surface-container-highest" />
            </div>
          </div>

          {/* Skeleton steps */}
          <div className="space-y-stack-md mt-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-stack-md">
                {i < 3 ? (
                  <span className="material-symbols-outlined text-primary opacity-50">
                    check_circle
                  </span>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-secondary border-t-transparent animate-spin flex-shrink-0" />
                )}
                <span className="font-body-md text-body-md text-on-surface-variant">
                  {i === 1
                    ? 'Pemindaian OCR...'
                    : i === 2
                      ? 'Pengenalan Niat...'
                      : 'Menghasilkan analisis...'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* State: Hasil analisis tersedia */}
      {result && !isAnalyzing && (
        <div className="flex-1 flex flex-col gap-gutter">
          {/* Area Gauge & Badge */}
          <div className="flex items-center justify-between bg-surface-container rounded-lg p-stack-md border border-outline-variant">
            {/* SVG Gauge */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  className="text-surface-container-highest"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <motion.path
                  className={
                    score >= 70
                      ? 'text-error'
                      : score >= 40
                        ? 'text-secondary'
                        : 'text-outline'
                  }
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  initial={{ strokeDasharray: '0, 100' }}
                  animate={{ strokeDasharray: `${score}, 100` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className="font-display-lg text-2xl font-bold text-on-surface leading-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {score}
                </motion.span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Skor
                </span>
              </div>
            </div>

            {/* Badge & Sentimen */}
            <div className="flex flex-col items-end gap-stack-sm">
              <span
                className={`${config.badgeClass} font-label-md text-label-md px-4 py-1.5 rounded-full border flex items-center gap-unit tracking-wider`}
              >
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {config.icon}
                </span>
                {config.label}
              </span>
              <div className="text-right">
                <p className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Sentimen
                </p>
                <p className="font-body-md text-body-md text-secondary">
                  {sentiment}
                </p>
              </div>
            </div>
          </div>

          {/* Langkah Pemrosesan — selesai semua */}
          <div className="space-y-stack-md mt-auto">
            {[
              'Pemindaian OCR Selesai',
              'Pengenalan Niat Selesai',
              'Vektor Balasan Dihasilkan',
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-stack-md opacity-60">
                <span className="material-symbols-outlined text-primary">
                  check_circle
                </span>
                <span className="font-body-md text-body-md text-on-surface">
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
