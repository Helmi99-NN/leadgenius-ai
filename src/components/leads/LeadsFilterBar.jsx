import { motion } from 'framer-motion'

export default function LeadsFilterBar({ filters, onFilterChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="flex flex-wrap gap-stack-md bg-white/80 backdrop-blur-xl border border-outline-variant rounded-xl p-stack-md items-center"
    >
      <span className="material-symbols-outlined text-on-surface-variant">filter_list</span>

      {/* Filter Toko */}
      <select
        value={filters.store}
        onChange={(e) => onFilterChange({ ...filters, store: e.target.value })}
        className="bg-white border border-outline-variant font-label-md text-label-md rounded-lg py-1.5 px-3 text-on-surface min-w-[120px] focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
      >
        <option value="all">Semua Toko</option>
        <option value="alpha">Toko Alpha</option>
        <option value="beta">Toko Beta</option>
      </select>

      {/* Filter Kategori */}
      <select
        value={filters.category}
        onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
        className="bg-white border border-outline-variant font-label-md text-label-md rounded-lg py-1.5 px-3 text-on-surface min-w-[120px] focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
      >
        <option value="all">Semua Kategori</option>
        <option value="hot">Prospek Panas</option>
        <option value="warm">Prospek Hangat</option>
        <option value="cold">Prospek Dingin</option>
      </select>

      {/* Filter Tanggal */}
      <div className="flex items-center bg-white border border-outline-variant rounded-lg px-3 py-1.5 gap-2">
        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
          calendar_today
        </span>
        <input
          className="bg-transparent border-none p-0 font-label-md text-label-md text-on-surface w-32 focus:ring-0 focus:outline-none"
          type="text"
          readOnly
          value="7 Hari Terakhir"
        />
      </div>

      {/* Hapus Filter */}
      <button className="ml-auto text-primary font-label-sm text-label-sm hover:underline transition-all">
        Hapus Filter
      </button>
    </motion.div>
  )
}
