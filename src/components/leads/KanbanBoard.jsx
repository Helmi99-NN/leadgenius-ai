import { motion, AnimatePresence } from 'framer-motion'
import LeadCard from './LeadCard'

const columns = [
  {
    key: 'hot',
    label: 'Panas',
    dotColor: 'bg-error',
    borderColor: 'border-t-primary',
  },
  {
    key: 'warm',
    label: 'Hangat',
    dotColor: 'bg-secondary',
    borderColor: '',
  },
  {
    key: 'cold',
    label: 'Dingin',
    dotColor: 'bg-tertiary',
    borderColor: '',
  },
]

export default function KanbanBoard({ leads, onLeadClick, onDeleteLead }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-gutter min-h-[500px]"
      style={{ height: 'calc(100vh - 380px)' }}
    >
      {columns.map((col, colIdx) => (
        <div
          key={col.key}
          className="flex flex-col h-full bg-surface-container rounded-xl p-stack-md border border-outline-variant/50"
        >
          {/* Header Kolom */}
          <div className="flex items-center justify-between mb-stack-md">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
              <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">
                {col.label}
              </h3>
            </div>
            <span className="bg-surface-container-high px-2 py-0.5 rounded font-label-sm text-label-sm text-on-surface-variant">
              {leads[col.key]?.length || 0}
            </span>
          </div>

          {/* Daftar Kartu */}
          <div className="flex-1 overflow-y-auto space-y-stack-md pr-1 pb-4 custom-scrollbar">
            <AnimatePresence>
              {(leads[col.key] || []).map((lead, idx) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  category={col.key}
                  borderColor={col.borderColor}
                  onClick={() => onLeadClick(lead)}
                  onDelete={onDeleteLead}
                  delay={colIdx * 0.05 + idx * 0.05}
                />
              ))}
            </AnimatePresence>

            {/* Empty state per kolom */}
            {(!leads[col.key] || leads[col.key].length === 0) && (
              <div className="flex flex-col items-center justify-center text-center py-8 opacity-40">
                <span className="material-symbols-outlined text-2xl text-outline mb-1">
                  {col.key === 'hot' ? 'local_fire_department' : col.key === 'warm' ? 'wb_sunny' : 'ac_unit'}
                </span>
                <p className="text-label-sm text-on-surface-variant">
                  Belum ada prospek {col.label.toLowerCase()}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </motion.div>
  )
}
