import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'

const tabs = [
  { id: 'hard', label: 'Penjualan Agresif' },
  { id: 'soft', label: 'Penjualan Halus' },
  { id: 'authority', label: 'Otoritas' },
  { id: 'scarcity', label: 'Kelangkaan' },
]

const repliesByTab = null

const tabLabels = {
  hard: 'Hard Selling',
  soft: 'Soft Selling',
  authority: 'Otoritas',
  scarcity: 'Kelangkaan',
}

export default function ReplyOutputPanel({ activeTab, onTabChange, replies, isGenerating, activeChatId, onRegenerate }) {
  const [copiedIdx, setCopiedIdx] = useState(null)

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const [sendingIdx, setSendingIdx] = useState(null)

  const handleApproveAndSend = async (text, idx) => {
    if (!activeChatId) {
      alert("Fitur ini hanya aktif untuk chat yang masuk otomatis dari Shopee Extension.");
      return;
    }
    
    setSendingIdx(idx)
    try {
      const { error } = await supabase
        .from('incoming_chats')
        .update({ 
          status: 'approved',
          reply_text: text,
          is_sent: false
        })
        .eq('id', activeChatId)

      if (error) throw error
      
      alert("Balasan di-Approve! Ekstensi sedang mengetik dan mengirimkannya ke Shopee...")
    } catch (err) {
      console.error(err)
      alert("Gagal Approve: " + err.message)
    } finally {
      setTimeout(() => setSendingIdx(null), 1500)
    }
  }

  const currentReplies = replies?.[activeTab] || null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-surface-container-lowest rounded-lg border border-outline-variant p-gutter shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex-1 flex flex-col"
    >
      {/* Tab Gaya */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-outline-variant pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 font-label-md text-label-md transition-colors ${
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary -mb-[10px]'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Header Hasil */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline-md text-headline-md font-bold text-on-background">
          Hasil ({tabLabels[activeTab]})
        </h3>
        <button 
          onClick={onRegenerate}
          disabled={isGenerating}
          className={`font-label-sm text-label-sm flex items-center gap-1 transition-colors ${
            isGenerating ? 'text-outline opacity-50 cursor-not-allowed' : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className={`material-symbols-outlined text-sm ${isGenerating ? 'animate-spin' : ''}`}>refresh</span>
          Regenerate
        </button>
      </div>

      {/* Daftar Opsi Balasan */}
      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 flex-1"
          >
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-outline-variant rounded-lg p-4 bg-surface-bright animate-pulse">
                <div className="h-4 bg-surface-container-high rounded w-full mb-2"></div>
                <div className="h-4 bg-surface-container-high rounded w-5/6 mb-4"></div>
                <div className="flex justify-end gap-2">
                  <div className="h-8 w-16 bg-surface-container-high rounded"></div>
                  <div className="h-8 w-20 bg-surface-container-high rounded"></div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : currentReplies ? (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 flex-1"
          >
            {currentReplies.map((reply, idx) => (
              <div
                key={idx}
                className="border border-outline-variant rounded-lg p-4 bg-surface-bright relative group hover:border-primary transition-colors"
              >
                {/* Aksen kiri untuk opsi pertama */}
                {reply.highlighted && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary-fixed rounded-l-lg" />
              )}

              <p
                className={`font-body-md text-body-md text-on-background mb-4 ${
                  reply.highlighted ? 'pl-2' : ''
                }`}
              >
                {reply.text}
              </p>

              {/* Tombol aksi */}
              <div className="flex justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button className="px-3 py-1.5 border border-outline-variant text-primary font-label-sm text-label-sm rounded hover:bg-surface-variant flex items-center gap-1 transition-colors">
                  <span className="material-symbols-outlined text-sm">edit</span>
                  Edit
                </button>
                <button
                  onClick={() => handleCopy(reply.text, idx)}
                  className={`px-3 py-1.5 font-label-sm text-label-sm rounded flex items-center gap-1 transition-colors ${
                    copiedIdx === idx
                      ? 'bg-secondary-fixed text-on-secondary-fixed'
                      : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {copiedIdx === idx ? 'check' : 'content_copy'}
                  </span>
                  {copiedIdx === idx ? 'Tersalin' : 'Salin'}
                </button>
                <button
                  onClick={() => handleApproveAndSend(reply.text, idx)}
                  disabled={sendingIdx !== null}
                  className={`px-4 py-1.5 font-label-sm text-label-sm rounded-lg flex items-center gap-2 transition-colors ${
                    sendingIdx === idx
                      ? 'bg-primary/70 text-on-primary'
                      : 'bg-primary text-on-primary hover:bg-primary/90 shadow-sm'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {sendingIdx === idx ? 'hourglass_top' : 'send'}
                  </span>
                  {sendingIdx === idx ? 'Mengirim...' : 'Approve & Send'}
                </button>
              </div>
            </div>
          ))}
        </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center py-12 text-on-surface-variant opacity-70"
          >
            <span className="material-symbols-outlined text-[48px] mb-3">quick_phrases</span>
            <p className="font-body-md text-body-md text-center max-w-xs">Belum ada balasan yang dibuat.<br/>Silakan masukkan pesan pelanggan dan klik "Buat Balasan".</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simpan Template */}
      <div className="mt-6 flex justify-end">
        <button className="text-primary font-label-md text-label-md font-medium hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined">save</span>
          Simpan sebagai Template
        </button>
      </div>
    </motion.div>
  )
}
