import { useState } from 'react'
import { motion } from 'framer-motion'
import FollowUpHeader from '../components/followup/FollowUpHeader'
import AIInsightPanel from '../components/followup/AIInsightPanel'
import FollowUpTimeline from '../components/followup/FollowUpTimeline'
import LeadDetailPanel from '../components/leads/LeadDetailPanel'
import { getLeadDetail } from '../services/leadsService'

export default function FollowUpPage() {
  const [selectedLead, setSelectedLead] = useState(null)

  const handleLeadClick = async (leadId) => {
    try {
      const detail = await getLeadDetail(leadId)
      setSelectedLead({
        ...detail,
        chatHistory: detail.chatHistory.map((c) => ({
          sender: c.sender,
          time: new Date(c.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          message: c.message,
        })),
        timeline: [
          {
            date: 'Terbaru',
            event: detail.context || 'Tidak ada aktivitas terbaru.',
            color: detail.category === 'hot' ? 'bg-error' : detail.category === 'warm' ? 'bg-secondary' : 'bg-outline-variant',
          },
        ],
      })
    } catch (err) {
      console.error('Gagal memuat detail lead:', err)
    }
  }

  const handleClosePanel = () => {
    setSelectedLead(null)
  }

  return (
    <>
      {/* Header Halaman & Aksi Massal */}
      <FollowUpHeader />

      {/* Layout Grid Bento - Reversed: Cards first on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Daftar Tindak Lanjut */}
        <div className="lg:col-span-8 order-2 lg:order-1">
          <FollowUpTimeline onLeadClick={handleLeadClick} />
        </div>

        {/* Kolom Kanan: Panel Wawasan AI */}
        <div className="lg:col-span-4 order-1 lg:order-2">
          <div className="lg:sticky lg:top-6 space-y-4">
            <AIInsightPanel />
          </div>
        </div>
      </div>

      <LeadDetailPanel lead={selectedLead} onClose={handleClosePanel} />
    </>
  )
}
