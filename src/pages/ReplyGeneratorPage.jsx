import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import ReplyContextPanel from '../components/replygen/ReplyContextPanel'
import ReplyOutputPanel from '../components/replygen/ReplyOutputPanel'
import { getLeadsByCategory, getLeadDetail } from '../services/leadsService'
import { generateReplyFromContext } from '../services/geminiService'
import { supabase } from '../lib/supabase'

export default function ReplyGeneratorPage() {
  const [activeTab, setActiveTab] = useState('hard')
  const [toneValue, setToneValue] = useState(50)
  const [selectedLead, setSelectedLead] = useState('')
  const [customerMessage, setCustomerMessage] = useState('')
  const [chatContext, setChatContext] = useState('')
  const [activeChatId, setActiveChatId] = useState(null) // ID chat dari Supabase
  const location = useLocation()
  
  const [leads, setLeads] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedReplies, setGeneratedReplies] = useState(() => {
    try {
      const saved = localStorage.getItem('lastGeneratedReplies')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    async function fetchLeads() {
      try {
        const data = await getLeadsByCategory()
        const allLeads = [...data.hot, ...data.warm, ...data.cold]
        setLeads(allLeads.map(l => ({ id: l.id, label: `${l.company} - Skor: ${l.score}` })))
      } catch (err) {
        console.error('Gagal memuat leads:', err)
      }
    }
    fetchLeads()

    async function fetchLatestUnreadChat() {
      if (location.state?.leadId) {
        // Jika dinavigasi dari halaman prospek, ambil detail prospek tersebut
        try {
          const detail = await getLeadDetail(location.state.leadId)
          setSelectedLead(detail.id)
          if (detail.chatHistory && detail.chatHistory.length > 0) {
            const lastMsg = detail.chatHistory[detail.chatHistory.length - 1].message
            setCustomerMessage(lastMsg)
            setChatContext(`Pelanggan: ${detail.company}\nKonteks: ${detail.context || ''}`)
            setActiveChatId(`lead_${detail.id}`) // id unik sementara untuk lead
          }
        } catch (e) {
          console.error("Gagal load lead dari param:", e)
        }
      } else {
        // Jika tidak, ambil chat unread terakhir
        const { data, error } = await supabase
          .from('incoming_chats')
          .select('*')
          .eq('status', 'unread')
          .order('received_at', { ascending: false })
          .limit(1)
          .single()

        if (data) {
          setCustomerMessage(data.message)
          setChatContext(`Pelanggan: ${data.customer_name}`)
          setActiveChatId(data.id)
          triggerAutoGenerate(data.message, `Pelanggan: ${data.customer_name}`)
        }
      }
    }
    fetchLatestUnreadChat()

    // Supabase Real-time Listener untuk chat baru
    const chatSubscription = supabase
      .channel('public:incoming_chats')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'incoming_chats' }, (payload) => {
        const newChat = payload.new
        console.log('Incoming chat detected:', newChat)
        
        // Hanya proses chat dari Shopee yang unread
        if (newChat.status === 'unread') {
          // Update UI
          setCustomerMessage(newChat.message)
          setChatContext(`Pelanggan: ${newChat.customer_name}`)
          setActiveChatId(newChat.id)
          
          // Auto-trigger generate (kita panggil langsung)
          // Menggunakan referensi fungsi yang akan kita buat
          triggerAutoGenerate(newChat.message, `Pelanggan: ${newChat.customer_name}`)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(chatSubscription)
    }
  }, [])

  // Fungsi auto-generate agar bisa dipanggil dari Supabase event tanpa terikat strict state lama
  const triggerAutoGenerate = async (message, contextStr) => {
    setIsGenerating(true)
    try {
      const replies = await generateReplyFromContext(message, toneValue, null, contextStr)
      const formattedReplies = {}
      for (const [key, arr] of Object.entries(replies)) {
        formattedReplies[key] = arr.map((text, idx) => ({
          text,
          highlighted: idx === 0
        }))
      }
      setGeneratedReplies(formattedReplies)
      localStorage.setItem('lastGeneratedReplies', JSON.stringify(formattedReplies))
    } catch (error) {
      console.error('Auto-generate error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerate = async () => {
    if (!customerMessage.trim()) return

    setIsGenerating(true)
    try {
      let leadContext = null
      if (selectedLead) {
        // Fetch specific lead context if needed, for now just basic structure
        leadContext = { company: leads.find(l => l.id === selectedLead)?.label || 'Pelanggan', category: 'hot' } 
      }

      const replies = await generateReplyFromContext(customerMessage, toneValue, leadContext, chatContext)
      // Transform Gemini's array format to the format expected by ReplyOutputPanel
      const formattedReplies = {}
      for (const [key, arr] of Object.entries(replies)) {
        formattedReplies[key] = arr.map((text, idx) => ({
          text,
          highlighted: idx === 0 // Highlight the first option
        }))
      }
      setGeneratedReplies(formattedReplies)
      localStorage.setItem('lastGeneratedReplies', JSON.stringify(formattedReplies))
    } catch (error) {
      console.error('Gagal membuat balasan:', error)
      alert(error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-container-max-width mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Panel Input */}
        <div className="lg:col-span-5 flex flex-col gap-stack-md">
          <ReplyContextPanel
            leads={leads}
            selectedLead={selectedLead}
            onLeadChange={setSelectedLead}
            customerMessage={customerMessage}
            onMessageChange={setCustomerMessage}
            chatContext={chatContext}
            onChatContextChange={setChatContext}
            toneValue={toneValue}
            onToneChange={setToneValue}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        </div>

        {/* Panel Output */}
        <div className="lg:col-span-7 flex flex-col gap-stack-md">
          <ReplyOutputPanel 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            replies={generatedReplies}
            isGenerating={isGenerating}
            activeChatId={activeChatId}
            onRegenerate={handleGenerate}
          />
        </div>
      </div>
    </div>
  )
}
