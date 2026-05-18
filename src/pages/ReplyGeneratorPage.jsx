import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ReplyContextPanel from '../components/replygen/ReplyContextPanel'
import ReplyOutputPanel from '../components/replygen/ReplyOutputPanel'
import { generateReplyFromContext } from '../services/geminiService'
import { getLeadsByCategory } from '../services/leadsService'

export default function ReplyGeneratorPage() {
  const [activeTab, setActiveTab] = useState('hard')
  const [toneValue, setToneValue] = useState(50)
  const [selectedLead, setSelectedLead] = useState('')
  const [customerMessage, setCustomerMessage] = useState('')
  
  const [leads, setLeads] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedReplies, setGeneratedReplies] = useState(null)

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
  }, [])

  const handleGenerate = async () => {
    if (!customerMessage.trim()) return

    setIsGenerating(true)
    try {
      let leadContext = null
      if (selectedLead) {
        // Fetch specific lead context if needed, for now just basic structure
        leadContext = { company: leads.find(l => l.id === selectedLead)?.label || 'Pelanggan', category: 'hot' } 
      }

      const replies = await generateReplyFromContext(customerMessage, toneValue, leadContext)
      // Transform Gemini's array format to the format expected by ReplyOutputPanel
      const formattedReplies = {}
      for (const [key, arr] of Object.entries(replies)) {
        formattedReplies[key] = arr.map((text, idx) => ({
          text,
          highlighted: idx === 0 // Highlight the first option
        }))
      }
      setGeneratedReplies(formattedReplies)
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
          />
        </div>
      </div>
    </div>
  )
}
