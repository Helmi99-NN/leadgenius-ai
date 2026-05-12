import { motion } from 'framer-motion'

export default function LeadsHeader({ viewMode, onViewChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col md:flex-row justify-between items-start md:items-center gap-stack-md"
    >
      <div>
        <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
          Saluran Prospek
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Kelola dan prioritaskan percakapan aktif.
        </p>
      </div>

      {/* Toggle Tampilan & Aksi Cepat */}
      <div className="flex items-center gap-stack-sm">
        {/* Toggle Papan / Tabel */}
        <div className="flex p-1 bg-surface-container-high rounded-lg border border-outline-variant/30">
          <button
            onClick={() => onViewChange('board')}
            className={`px-4 py-1.5 rounded font-label-sm text-label-sm flex items-center gap-2 transition-all ${
              viewMode === 'board'
                ? 'bg-surface text-on-surface shadow-sm border border-outline-variant/30'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">view_kanban</span>
            Papan
          </button>
          <button
            onClick={() => onViewChange('table')}
            className={`px-4 py-1.5 rounded font-label-sm text-label-sm flex items-center gap-2 transition-all ${
              viewMode === 'table'
                ? 'bg-surface text-on-surface shadow-sm border border-outline-variant/30'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">table_chart</span>
            Tabel
          </button>
        </div>

        {/* Tombol Prospek Baru */}
        <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md flex items-center gap-2 hover:opacity-90 transition-opacity border border-black/10">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Prospek Baru
        </button>
      </div>
    </motion.div>
  )
}
