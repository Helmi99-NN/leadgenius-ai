import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'

export default function AIPerformance() {
  const [stats, setStats] = useState({
    totalScans: 0,
    avgScore: 0,
    totalReplies: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        // Total leads (pemindaian)
        const { data: leads } = await supabase.from('leads').select('score')
        const totalScans = leads?.length || 0
        const avgScore = totalScans > 0
          ? Math.round(leads.reduce((sum, l) => sum + (l.score || 0), 0) / totalScans)
          : 0

        // Total balasan AI
        const { count: totalReplies } = await supabase
          .from('generated_replies')
          .select('*', { count: 'exact', head: true })

        setStats({
          totalScans,
          avgScore,
          totalReplies: totalReplies || 0,
        })
      } catch (err) {
        console.error('Gagal memuat performa AI:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const displayStats = [
    { label: 'Total Pemindaian', value: stats.totalScans.toLocaleString(), highlight: false },
    { label: 'Rata-rata Skor', value: `${stats.avgScore}%`, highlight: true },
    { label: 'Balasan Dihasilkan', value: stats.totalReplies.toLocaleString(), highlight: false },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-panel rounded-xl p-stack-md bg-gradient-to-br from-surface-container to-surface border-primary/20"
    >
      <h3 className="font-label-sm text-label-sm text-primary uppercase tracking-wider mb-stack-md flex items-center gap-unit">
        <span className="material-symbols-outlined text-[16px]">psychology</span>
        Performa AI
      </h3>
      <div className="space-y-stack-sm">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center p-stack-sm bg-surface-container-highest/50 rounded animate-pulse">
              <div className="w-24 h-4 bg-surface-container-highest rounded" />
              <div className="w-12 h-5 bg-surface-container-highest rounded" />
            </div>
          ))
        ) : (
          displayStats.map((stat) => (
            <div
              key={stat.label}
              className="flex justify-between items-center p-stack-sm bg-surface-container-highest/50 rounded"
            >
              <span className="text-label-md text-on-surface-variant">{stat.label}</span>
              <span
                className={`font-headline-md text-[16px] font-bold ${
                  stat.highlight ? 'text-primary' : 'text-on-surface'
                }`}
              >
                {stat.value}
              </span>
            </div>
          ))
        )}
      </div>
    </motion.div>
  )
}
