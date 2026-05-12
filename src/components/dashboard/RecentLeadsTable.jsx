import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import LeadBadge from '../ui/LeadBadge'
import ScoreGauge from '../ui/ScoreGauge'
import PlatformBadge from '../ui/PlatformBadge'
import { supabase } from '../../lib/supabase'

function getTimeAgo(dateStr) {
  if (!dateStr) return '-'
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diffMs / 60000)
  const hr = Math.floor(diffMs / 3600000)
  const day = Math.floor(diffMs / 86400000)
  if (min < 1) return 'Baru saja'
  if (min < 60) return `${min} mnt lalu`
  if (hr < 24) return `${hr} jam lalu`
  if (day === 1) return 'Kemarin'
  return `${day} hari lalu`
}

export default function RecentLeadsTable() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeads() {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(10)

        if (error) throw error
        setLeads(data || [])
      } catch (err) {
        console.error('Gagal memuat prospek terbaru:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLeads()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="glass-panel rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-gutter border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-stack-sm bg-surface-container-lowest/50">
        <div>
          <h3 className="font-headline-md text-[20px] font-bold text-on-surface">
            Prospek Aktif Terbaru
          </h3>
          <p className="font-body-md text-label-md text-on-surface-variant mt-unit">
            Interaksi terbaru dinilai dan dikategorikan oleh AI.
          </p>
        </div>
        <a
          href="/leads"
          className="px-stack-md py-stack-sm border border-outline text-on-surface rounded hover:bg-surface-container transition-colors font-label-md text-label-md whitespace-nowrap"
        >
          Lihat Semua
        </a>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 opacity-50">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">group</span>
            <p className="text-label-md text-on-surface-variant">Belum ada prospek</p>
            <p className="text-label-sm text-outline mt-1">
              Upload screenshot chat di halaman{' '}
              <a href="/analyzer" className="text-primary underline">Analisis Chat</a>
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container/50 border-b border-outline-variant font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                <th className="p-stack-md font-semibold">Kontak Prospek</th>
                <th className="p-stack-md font-semibold">Skor AI</th>
                <th className="p-stack-md font-semibold">Kategori</th>
                <th className="p-stack-md font-semibold w-1/3">Konteks Terakhir</th>
                <th className="p-stack-md font-semibold text-right">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-surface-container-highest/30 transition-colors group"
                >
                  {/* Contact */}
                  <td className="p-stack-md">
                    <div className="flex items-center gap-stack-sm">
                      <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface font-bold text-label-md shrink-0">
                        {lead.initials || lead.company?.substring(0, 2).toUpperCase() || '??'}
                      </div>
                      <div>
                        <p className="font-label-md text-on-surface font-semibold">
                          {lead.contact || lead.company}
                        </p>
                        <div className="mt-0.5">
                          <PlatformBadge platform={lead.platform} size={20} showLabel />
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Score */}
                  <td className="p-stack-md">
                    <ScoreGauge score={lead.score} category={lead.category} />
                  </td>

                  {/* Category */}
                  <td className="p-stack-md">
                    <LeadBadge category={lead.category} />
                  </td>

                  {/* Context */}
                  <td className="p-stack-md">
                    <p className="text-label-md text-on-surface-variant truncate max-w-xs group-hover:text-on-surface transition-colors">
                      {lead.context || lead.last_message || '-'}
                    </p>
                  </td>

                  {/* Time */}
                  <td className="p-stack-md text-right">
                    <span className="text-label-sm text-on-surface-variant whitespace-nowrap">
                      {getTimeAgo(lead.updated_at || lead.created_at)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  )
}
