import { motion, AnimatePresence } from 'framer-motion'

export default function LeadDetailPanel({ lead, onClose }) {
  if (!lead) return null

  return (
    <AnimatePresence>
      {lead && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: 500, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 500, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-surface border-l border-outline-variant z-50 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] flex flex-col"
          >
            {/* Header Panel */}
            <div className="px-gutter py-stack-md border-b border-outline-variant flex justify-between items-center bg-surface-container-high/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold">
                  {lead.initials}
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                    {lead.company}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-error" />
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      Prospek Panas • Skor: {lead.score}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Konten Panel */}
            <div className="flex-1 overflow-y-auto p-gutter space-y-gutter custom-scrollbar">
              {/* Aksi Cepat */}
              <div className="flex gap-2">
                <button className="flex-1 bg-transparent border border-primary text-primary font-label-md text-label-md py-2 rounded-lg hover:bg-primary/10 transition-colors flex justify-center items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                  Email
                </button>
                <button className="flex-1 bg-primary text-on-primary font-label-md text-label-md py-2 rounded-lg hover:opacity-90 transition-opacity flex justify-center items-center gap-2 border border-black/10">
                  <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                  Buat Balasan
                </button>
              </div>

              {/* Riwayat Interaksi */}
              <div>
                <h4 className="font-label-md text-label-md text-on-surface mb-stack-md flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">forum</span>
                  Interaksi Terbaru
                </h4>
                <div className="bg-surface-container rounded-xl p-stack-md border border-outline-variant/60 space-y-stack-md relative overflow-hidden">
                  {/* Efek glow AI */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

                  {/* Pesan */}
                  {lead.chatHistory?.map((chat, idx) => (
                    <div key={idx} className="flex flex-col gap-1 items-start">
                      <span className="font-label-sm text-label-sm text-on-surface-variant ml-2">
                        {chat.sender} • {chat.time}
                      </span>
                      <div className="bg-surface-container-high border border-outline-variant/30 p-3 rounded-2xl rounded-tl-sm text-body-md font-body-md text-on-surface max-w-[85%]">
                        {chat.message}
                      </div>
                    </div>
                  ))}

                  {/* Rekomendasi AI */}
                  {lead.aiRecommendation && (
                    <div className="mt-4 p-3 bg-primary-container/20 border border-primary/30 rounded-lg flex gap-3 items-start">
                      <span className="material-symbols-outlined text-primary mt-0.5">
                        lightbulb
                      </span>
                      <div>
                        <p className="font-label-md text-label-md text-primary mb-1">
                          Rekomendasi AI
                        </p>
                        <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                          {lead.aiRecommendation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Garis Waktu Aktivitas */}
              <div>
                <h4 className="font-label-md text-label-md text-on-surface mb-stack-md flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">timeline</span>
                  Garis Waktu Aktivitas
                </h4>
                <div className="relative border-l border-outline-variant ml-3 space-y-gutter pb-4">
                  {lead.timeline?.map((item, idx) => (
                    <div
                      key={idx}
                      className={`relative pl-6 ${item.faded ? 'opacity-70' : ''}`}
                    >
                      <span
                        className={`absolute -left-1.5 top-1 w-3 h-3 rounded-full ${item.color} border-[3px] border-surface`}
                      />
                      <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">
                        {item.date}
                      </p>
                      <p className="font-body-md text-body-md text-on-surface">
                        {item.event}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
