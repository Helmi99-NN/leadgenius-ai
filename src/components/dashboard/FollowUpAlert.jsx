import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function FollowUpAlert() {
  const [urgentCount, setUrgentCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUrgent() {
      try {
        // Hitung follow-up yang pending dan overdue
        const { data } = await supabase
          .from('follow_ups')
          .select('id, scheduled_at, status, leads(category)')
          .in('status', ['pending', 'overdue'])

        // Filter yang sudah lewat jadwal atau lead panas
        const urgent = (data || []).filter((fu) => {
          const isPastDue = new Date(fu.scheduled_at) <= new Date()
          const isHotLead = fu.leads?.category === 'hot'
          return isPastDue || isHotLead
        })

        setUrgentCount(urgent.length)
      } catch (err) {
        console.error('Gagal memuat alert:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUrgent()
  }, [])

  // Tidak tampilkan jika tidak ada yang urgent
  if (loading || urgentCount === 0) return null

  return (
    <div className="glass-overlay rounded-lg p-stack-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-stack-md border-l-4 border-l-[#ef4444]">
      <div className="flex items-center gap-stack-md">
        <div className="w-10 h-10 rounded-full bg-[#ef4444]/20 flex items-center justify-center text-[#ef4444] shrink-0">
          <span className="material-symbols-outlined">priority_high</span>
        </div>
        <div>
          <h3 className="font-headline-md text-[18px] font-bold text-on-surface">
            Tindak Lanjut Mendesak Diperlukan
          </h3>
          <p className="font-body-md text-label-md text-on-surface-variant mt-unit">
            {urgentCount} prospek memerlukan tindak lanjut segera.
          </p>
        </div>
      </div>
      <a
        href="/follow-up"
        className="btn-primary-glass px-stack-md py-stack-sm rounded font-label-md text-label-md text-white transition-opacity hover:opacity-90 whitespace-nowrap"
      >
        Lihat Prospek
      </a>
    </div>
  )
}
