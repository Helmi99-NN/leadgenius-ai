import { motion } from 'framer-motion'

export default function AIInsightPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white border border-outline-variant rounded-xl p-gutter shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-primary"
    >
      {/* Header */}
      <div className="flex items-center gap-stack-sm mb-stack-md">
        <span
          className="material-symbols-outlined text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          auto_awesome
        </span>
        <h2 className="font-headline-md text-headline-md text-on-surface">
          Wawasan AI
        </h2>
      </div>

      <div className="space-y-stack-md">
        {/* Peringatan Terlambat */}
        <div className="bg-surface-container-low rounded-lg p-stack-md border border-outline-variant">
          <p className="font-body-md text-body-md text-on-surface-variant mb-stack-sm">
            Anda memiliki{' '}
            <strong className="text-error">3 Terlambat</strong> tindak lanjut
            yang memerlukan perhatian segera. Mereka bernilai $4.200 dalam
            potensi pipeline.
          </p>
          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
            <motion.div
              className="bg-error h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '25%' }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Tingkat Konversi */}
        <div className="bg-surface-container-low rounded-lg p-stack-md border border-outline-variant">
          <div className="flex justify-between items-center mb-unit">
            <span className="font-label-md text-label-md text-on-surface">
              Tingkat Konversi
            </span>
            <span className="font-label-sm text-label-sm text-primary flex items-center">
              <span className="material-symbols-outlined text-[14px]">
                arrow_upward
              </span>{' '}
              2.4%
            </span>
          </div>
          <div className="font-headline-lg text-headline-lg text-primary">
            18.5%
          </div>
        </div>

        {/* Statistik Tambahan */}
        <div className="bg-surface-container-low rounded-lg p-stack-md border border-outline-variant">
          <div className="flex justify-between items-center mb-unit">
            <span className="font-label-md text-label-md text-on-surface">
              Rata-rata Waktu Respons
            </span>
          </div>
          <div className="font-headline-lg text-headline-lg text-on-surface">
            2.4 <span className="text-body-md text-on-surface-variant">jam</span>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-lg p-stack-md border border-outline-variant">
          <div className="flex justify-between items-center mb-unit">
            <span className="font-label-md text-label-md text-on-surface">
              Diselesaikan Minggu Ini
            </span>
          </div>
          <div className="font-headline-lg text-headline-lg text-primary">
            12{' '}
            <span className="text-body-md text-on-surface-variant">
              dari 18
            </span>
          </div>
          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mt-stack-sm">
            <motion.div
              className="bg-primary h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '67%' }}
              transition={{ duration: 1, delay: 0.7, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
