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
          overdue: overdueCount,
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

  if (stats.loading) {
    return (
      <div className="bg-white border border-outline-variant rounded-xl p-5 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded bg-surface-container-high" />
          <div className="w-24 h-5 rounded bg-surface-container-high" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-surface-container-low rounded-lg p-4">
              <div className="w-1/2 h-3 rounded bg-surface-container-high mb-2" />
              <div className="w-1/3 h-6 rounded bg-surface-container-high" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const completionPercent = Math.min(100, Math.round((stats.completedWeek / stats.totalWeek) * 100)) || 0

  const insightCards = [
    {
      label: 'Perlu Perhatian',
      value: stats.overdue,
      suffix: 'terlambat',
      icon: 'warning',
      color: stats.overdue > 0 ? 'text-error' : 'text-primary',
      bgColor: stats.overdue > 0 ? 'bg-error/5' : 'bg-primary/5',
      barColor: stats.overdue > 0 ? 'bg-error' : 'bg-primary',
      barWidth: stats.overdue > 0 ? '25%' : '0%',
    },
    {
      label: 'Tingkat Konversi',
      value: `${stats.conversion}%`,
      icon: 'trending_up',
      color: 'text-primary',
      bgColor: 'bg-primary/5',
    },
    {
      label: 'Rata-rata Waktu Respons',
      value: '2.4',
      suffix: 'jam',
      icon: 'schedule',
      color: 'text-on-surface',
      bgColor: 'bg-surface-container-low',
    },
    {
      label: 'Diselesaikan Minggu Ini',
      value: stats.completedWeek,
      suffix: `dari ${stats.totalWeek}`,
      icon: 'task_alt',
      color: 'text-primary',
      bgColor: 'bg-primary/5',
      barColor: 'bg-primary',
      barWidth: `${completionPercent}%`,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-outline-variant/50">
        <span
          className="material-symbols-outlined text-primary text-[20px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          auto_awesome
        </span>
        <h2 className="text-[16px] font-semibold text-on-surface">
          Wawasan AI
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="p-4 space-y-3">
        {insightCards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.08 }}
            className={`rounded-lg p-4 ${card.bgColor} border border-outline-variant/30`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className={`material-symbols-outlined text-[14px] ${card.color}`}>
                  {card.icon}
                </span>
                <span className="text-[12px] font-medium text-on-surface-variant">
                  {card.label}
                </span>
              </div>
            </div>
            <div className={`text-[24px] font-bold ${card.color} leading-tight`}>
              {card.value}
              {card.suffix && (
                <span className="text-[13px] font-normal text-on-surface-variant ml-1">
                  {card.suffix}
                </span>
              )}
            </div>
            {card.barColor && (
              <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-2.5">
                <motion.div
                  className={`${card.barColor} h-full rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: card.barWidth }}
                  transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
