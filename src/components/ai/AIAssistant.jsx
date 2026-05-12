import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sendMessage, executeAction } from '../../services/aiAssistantService'

// Format data result jadi teks ringkas
function formatResultData(result) {
  if (!result || !result.success) return ''
  if (result.count === 0) return '\n\n📭 Tidak ada data yang ditemukan.'

  if (result.data && result.data.length > 0) {
    const lines = result.data.map((d) => {
      const platform = d.platform ? `[${d.platform}]` : ''
      const score = d.score !== undefined ? `Skor: ${d.score}` : ''
      const cat = d.category ? `(${d.category === 'hot' ? '🔥' : d.category === 'warm' ? '☀️' : '❄️'})` : ''
      return `• ${d.company || d.title || 'Data'} ${platform} ${score} ${cat}`
    })
    return `\n\n${lines.join('\n')}${result.count > result.data.length ? `\n... dan ${result.count - result.data.length} lainnya` : ''}`
  }
  return `\n\n✅ ${result.count} data terpengaruh.`
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Halo! 👋 Saya **LeadGenius AI Assistant**. Saya bisa membantu kamu mengelola data prospek.\n\nContoh perintah:\n• "Ubah platform navisha ke facebook"\n• "Berapa total prospek panas?"\n• "Tampilkan semua prospek"\n• "Hapus prospek test customer"',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll ke bawah
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input saat buka
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
      setUnread(0)
    }
  }, [isOpen])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    // Tambah pesan user
    const userMsg = { role: 'user', content: trimmed }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      // Kirim ke Gemini AI (dengan history 10 pesan terakhir)
      const history = messages.slice(-10).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        content: m.content,
      }))

      const aiResponse = await sendMessage(trimmed, history)

      let finalReply = aiResponse.reply || 'Maaf, saya tidak mengerti.'

      // Eksekusi action jika ada
      if (aiResponse.action) {
        const result = await executeAction(aiResponse.action)

        if (result) {
          if (result.success) {
            finalReply += formatResultData(result)
          } else {
            finalReply += `\n\n❌ Gagal: ${result.error}`
          }
        }
      }

      const assistantMsg = { role: 'assistant', content: finalReply }
      setMessages((prev) => [...prev, assistantMsg])

      if (!isOpen) setUnread((prev) => prev + 1)
    } catch (err) {
      console.error('AI Assistant error:', err)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Maaf, terjadi kesalahan. Coba lagi ya! 🙏' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Render markdown sederhana
  const renderContent = (text) => {
    return text.split('\n').map((line, i) => {
      // Bold
      const parts = line.split(/(\*\*.*?\*\*)/).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j}>{part.slice(2, -2)}</strong>
        }
        return part
      })
      return (
        <span key={i}>
          {parts}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      )
    })
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all"
        style={{
          background: 'linear-gradient(135deg, #076653 0%, #0a9f7f 50%, #38c9a8 100%)',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          className="material-symbols-outlined text-white text-[28px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
          animate={{ rotate: isOpen ? 180 : 0 }}
        >
          {isOpen ? 'close' : 'smart_toy'}
        </motion.span>

        {/* Badge notif */}
        {unread > 0 && !isOpen && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-error rounded-full text-white text-[11px] font-bold flex items-center justify-center"
          >
            {unread}
          </motion.span>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ height: '520px' }}
          >
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center gap-3 shrink-0"
              style={{
                background: 'linear-gradient(135deg, #076653 0%, #0a9f7f 100%)',
              }}
            >
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <span className="material-symbols-outlined text-white text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  smart_toy
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-[15px] leading-tight">
                  LeadGenius Assistant
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                  <span className="text-white/70 text-[12px]">Gemini AI • Online</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-2 mt-1">
                      <span className="material-symbols-outlined text-primary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        smart_toy
                      </span>
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-br-md'
                        : 'bg-surface-container text-on-surface rounded-bl-md'
                    }`}
                  >
                    {renderContent(msg.content)}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-[14px] animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
                      smart_toy
                    </span>
                  </div>
                  <div className="bg-surface-container rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-on-surface-variant/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-on-surface-variant/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-on-surface-variant/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-4 py-3 border-t border-outline-variant bg-surface-container-lowest shrink-0">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ketik perintah... (Enter untuk kirim)"
                  rows={1}
                  className="flex-1 resize-none bg-surface-container rounded-xl px-4 py-2.5 text-[13px] text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 border border-outline-variant/50 max-h-24"
                  style={{ minHeight: '40px' }}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-30 hover:bg-primary/90 transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </button>
              </div>
              <p className="text-[10px] text-outline text-center mt-2">
                Ditenagai oleh Gemini AI • LeadGenius CRM
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
