import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import LeadsHeader from '../components/leads/LeadsHeader'
import LeadsFilterBar from '../components/leads/LeadsFilterBar'
import KanbanBoard from '../components/leads/KanbanBoard'
import LeadDetailPanel from '../components/leads/LeadDetailPanel'
import { getLeadsByCategory, getLeadDetail, deleteLead } from '../services/leadsService'

export default function LeadsPage() {
  const [viewMode, setViewMode] = useState('board')
  const [selectedLead, setSelectedLead] = useState(null)
  const [filters, setFilters] = useState({ platform: 'all', category: 'all', dateRange: '7d' })
  const [leadsData, setLeadsData] = useState({ hot: [], warm: [], cold: [] })
  const [loading, setLoading] = useState(true)

  // Fetch leads dari Supabase
  useEffect(() => {
    async function fetchLeads() {
      try {
        setLoading(true)
        const data = await getLeadsByCategory()
        setLeadsData(data)
      } catch (err) {
        console.error('Gagal memuat leads:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLeads()
  }, [])

  const handleLeadClick = async (lead) => {
    try {
      const detail = await getLeadDetail(lead.id)
      // Format untuk panel detail
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
      // Fallback ke data yang sudah ada
      setSelectedLead(lead)
    }
  }

  const handleClosePanel = () => {
    setSelectedLead(null)
  }

  const handleDeleteLead = async (leadId) => {
    try {
      await deleteLead(leadId)
      // Update UI: hapus dari state lokal
      setLeadsData((prev) => ({
        hot: prev.hot.filter((l) => l.id !== leadId),
        warm: prev.warm.filter((l) => l.id !== leadId),
        cold: prev.cold.filter((l) => l.id !== leadId),
      }))
      // Tutup panel detail jika yang dihapus sedang terbuka
      if (selectedLead?.id === leadId) {
        setSelectedLead(null)
      }
    } catch (err) {
      console.error('Gagal menghapus lead:', err)
    }
  }

  // Fungsi bantu untuk memfilter data
  const applyFilters = (leadArray) => {
    return leadArray.filter((lead) => {
      // 1. Filter Platform
      if (filters.platform !== 'all' && lead.platform !== filters.platform) return false
      
      // 2. Filter Kategori (hanya berlaku di mode List View atau jika kita mau nge-hide column, 
      // tapi untuk kanban lebih baik filter data di dalam kolomnya)
      if (filters.category !== 'all' && lead.category !== filters.category) return false

      return true
    })
  }

  // Format dan filter data dari Supabase
  const formattedLeads = {
    hot: applyFilters(leadsData.hot).map(formatLead),
    warm: applyFilters(leadsData.warm).map(formatLead),
    cold: applyFilters(leadsData.cold).map(formatLead),
  }

  return (
    <>
      {/* Header Halaman */}
      <LeadsHeader viewMode={viewMode} onViewChange={setViewMode} />

      {/* Bar Filter */}
      <LeadsFilterBar filters={filters} onFilterChange={setFilters} />

      {/* Loading State */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
            <p className="font-label-md text-label-md text-on-surface-variant mt-2">Memuat data prospek...</p>
          </div>
        </div>
      ) : (
        /* Papan Kanban */
        <KanbanBoard leads={formattedLeads} onLeadClick={handleLeadClick} onDeleteLead={handleDeleteLead} />
      )}

      {/* Panel Detail Prospek */}
      <LeadDetailPanel lead={selectedLead} onClose={handleClosePanel} />
    </>
  )
}

// Helper: format data Supabase ke format komponen
function formatLead(lead) {
  const timeAgo = getTimeAgo(lead.last_message_time || lead.created_at)
  return {
    ...lead,
    time: timeAgo,
    needsFollowUp: lead.needs_followup,
    aiRecommendation: lead.ai_recommendation,
  }
}

function getTimeAgo(dateStr) {
  if (!dateStr) return '-'
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Baru saja'
  if (diffMin < 60) return `${diffMin} mnt lalu`
  if (diffHour < 24) return `${diffHour} jam lalu`
  if (diffDay === 1) return 'Kemarin'
  if (diffDay < 7) return `${diffDay} hari lalu`
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} minggu lalu`
  return `${Math.floor(diffDay / 30)} bulan lalu`
}
