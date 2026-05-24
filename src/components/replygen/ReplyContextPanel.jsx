import { motion } from 'framer-motion'

export default function ReplyContextPanel({
  leads = [],
  selectedLead,
  onLeadChange,
  customerMessage,
  onMessageChange,
  chatContext,
  onChatContextChange,
  toneValue,
  onToneChange,
  onGenerate,
  isGenerating
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-surface-container-lowest rounded-lg border border-outline-variant p-gutter shadow-[0px_4px_20px_rgba(0,0,0,0.04)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline-md text-headline-md font-bold text-on-background">
            Konteks Percakapan
          </h3>
          <button className="text-primary font-label-sm text-label-sm flex items-center gap-1 hover:underline">
            <span className="material-symbols-outlined text-sm">history</span>
            Riwayat
          </button>
        </div>

        {/* Pilih Lead */}
        <div className="mb-4">
          <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2">
            Pilih Lead yang Ada (Opsional)
          </label>
          <div className="relative focus-within:ring-2 focus-within:ring-primary rounded-md">
            <select
              value={selectedLead}
              onChange={(e) => onLeadChange(e.target.value)}
              className="w-full bg-surface-bright border border-outline-variant rounded-md py-2 pl-3 pr-10 font-body-md text-body-md text-on-background appearance-none focus:outline-none focus:border-primary"
            >
              <option value="">Pilih Lead...</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.label}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-2.5 text-outline pointer-events-none">
              expand_more
            </span>
          </div>
        </div>

        {/* Pesan Pelanggan */}
        <div className="mb-4">
          <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2">
            Pesan Pelanggan Terakhir
          </label>
          <textarea
            value={customerMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            className="w-full h-24 bg-surface-bright border border-outline-variant rounded-md p-3 font-body-md text-body-md text-on-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none placeholder-outline"
            placeholder="Tempelkan pesan pelanggan di sini..."
          />
        </div>

        {/* Penjelasan Konteks */}
        <div className="mb-4">
          <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2">
            Penjelasan Konteks (Opsional)
          </label>
          <textarea
            value={chatContext}
            onChange={(e) => onChatContextChange(e.target.value)}
            className="w-full h-20 bg-surface-bright border border-outline-variant rounded-md p-3 font-body-md text-body-md text-on-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none placeholder-outline text-[13px]"
            placeholder="Contoh: 'Ini pelanggan lama, minta diskon', atau 'Ini follow up ke-3'..."
          />
        </div>

        {/* Tone Slider */}
        <div>
          <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2">
            Tone Penyesuaian
          </label>
          <div className="flex items-center gap-4">
            <span className="font-label-sm text-label-sm text-outline">Formal</span>
            <input
              className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary"
              max="100"
              min="1"
              type="range"
              value={toneValue}
              onChange={(e) => onToneChange(Number(e.target.value))}
            />
            <span className="font-label-sm text-label-sm text-outline">Santai</span>
          </div>
        </div>
      </motion.div>

      {/* Tombol Buat Balasan */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        onClick={onGenerate}
        disabled={isGenerating || !customerMessage.trim()}
        className="w-full bg-primary-container text-on-primary-container font-label-md text-label-md py-3 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-primary hover:text-on-primary transition-colors shadow-[0px_4px_20px_rgba(0,0,0,0.04)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="material-symbols-outlined">
          {isGenerating ? 'hourglass_empty' : 'auto_awesome'}
        </span>
        {isGenerating ? 'Membuat Balasan...' : 'Buat Balasan'}
      </motion.button>
    </>
  )
}
