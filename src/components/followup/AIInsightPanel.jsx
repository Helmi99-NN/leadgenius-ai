import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'

export default function AIInsightPanel() {
  const [stats, setStats] = useState({
    overdue: 0,
    completedWeek: 0,
    totalWeek: 0,
    conversion: 0,
    loading: true
  })

  useEffect(() => {
    async function fetchInsightData() {
      try {
        // 1. Get overdue follow ups (including those pending but past due)
        const { data: followUps } = await supabase
          .from('follow_ups')
          .select('id, scheduled_at, status')
          .in('status', ['pending', 'overdue'])

        const now = new Date()
        const overdueCount = (followUps || []).filter(fu => {
          const scheduled = new Date(fu.scheduled_at)
          const diffHours = (scheduled - now) / 3600000
          return fu.status === 'overdue' || diffHours < -24
        }).length
        
        // 2. Get completed this week
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
        
        const { data: weekData } = await supabase
          .from('follow_ups')
          .select('id, status')
          .gte('created_at', startOfWeek.toISOString())

        const completedWeek = (weekData || []).filter(f => f.status === 'completed').length
        const totalWeek = (weekData || []).length || 1 // avoid div by 0

        // 3. Get conversion rate (hot leads / total leads)
        const { data: leads } = await supabase.from('leads').select('category')
        const hot = (leads || []).filter(l => l.category === 'hot').length
        const totalLeads = (leads || []).length || 1
        const conversion = ((hot / totalLeads) * 100).toFixed(1)

        setStats({
          overdue: (overdueData || []).length,
          completedWeek,
          totalWeek,
          conversion,
          loading: false
        })
      } catch (err) {
        console.error('Failed to fetch AI insights:', err)
        setStats(s => ({ ...s, loading: false }))
      }
    }
    fetchInsightData()
  }, [])

  if (stats.loading) return null

  const completionPercent = Math.min(100, Math.round((stats.completedWeek / stats.totalWeek) * 100)) || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white border border-outline-variant rounded-xl p-gutter shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-primary"
    >
      {/* Header */}
      <div className="flex items-center gap-stack-sm mb-stack-md">
        <span
          className="material-symbols-outlined text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          auto_awesome
        </span>
        <h2 className="font-headline-md text-headline-md text-on-surface">
          Wawasan AI
        </h2>
      </div>

      <div className="space-y-stack-md">
        {/* Peringatan Terlambat */}
        <div className="bg-surface-container-low rounded-lg p-stack-md border border-outline-variant">
          <p className="font-body-md text-body-md text-on-surface-variant mb-stack-sm">
            Anda memiliki{' '}
            <strong className={stats.overdue > 0 ? "text-error" : "text-primary"}>
              {stats.overdue} Terlambat
            </strong> tindak lanjut
            yang memerlukan perhatian segera.
          </p>
          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
            <motion.div
              className={`${stats.overdue > 0 ? 'bg-error' : 'bg-primary'} h-full rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: stats.overdue > 0 ? '25%' : '0%' }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Tingkat Konversi */}
        <div className="bg-surface-container-low rounded-lg p-stack-md border border-outline-variant">
          <div className="flex justify-between items-center mb-unit">
            <span className="font-label-md text-label-md text-on-surface">
              Tingkat Konversi
            </span>
          </div>
          <div className="font-headline-lg text-headline-lg text-primary">
            {stats.conversion}%
          </div>
        </div>

        {/* Statistik Tambahan */}
        <div className="bg-surface-container-low rounded-lg p-stack-md border border-outline-variant">
          <div className="flex justify-between items-center mb-unit">
            <span className="font-label-md text-label-md text-on-surface">
              Rata-rata Waktu Respons
            </span>
          </div>
          <div className="font-headline-lg text-headline-lg text-on-surface">
            2.4 <span className="text-body-md text-on-surface-variant">jam</span>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-lg p-stack-md border border-outline-variant">
          <div className="flex justify-between items-center mb-unit">
            <span className="font-label-md text-label-md text-on-surface">
              Diselesaikan Minggu Ini
            </span>
          </div>
          <div className="font-headline-lg text-headline-lg text-primary">
            {stats.completedWeek}{' '}
            <span className="text-body-md text-on-surface-variant">
              dari {stats.totalWeek}
            </span>
          </div>
          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mt-stack-sm">
            <motion.div
              className="bg-primary h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercent}%` }}
              transition={{ duration: 1, delay: 0.7, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

