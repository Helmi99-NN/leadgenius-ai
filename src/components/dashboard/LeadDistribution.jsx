import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { getLeadStats } from '../../services/leadsService'

const COLORS = {
  hot: '#ef4444',
  warm: '#f59e0b',
  cold: '#3b82f6',
}

export default function LeadDistribution() {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const stats = await getLeadStats()
        const chartData = [
          { name: 'Panas', value: stats.hot, color: COLORS.hot },
          { name: 'Hangat', value: stats.warm, color: COLORS.warm },
          { name: 'Dingin', value: stats.cold, color: COLORS.cold },
        ]
        setData(chartData)
        setTotal(stats.total)
      } catch (err) {
        console.error('Gagal memuat distribusi:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const hasData = total > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-panel rounded-xl p-gutter"
    >
      <h3 className="font-headline-md text-[20px] font-bold text-on-surface mb-gutter">
        Distribusi Prospek
      </h3>

      {loading ? (
        <div className="flex items-center justify-center" style={{ height: 200 }}>
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : hasData ? (
        <>
          <div className="relative mx-auto" style={{ width: 200, height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="block font-headline-md text-on-surface font-bold">
                  {total.toLocaleString()}
                </span>
                <span className="block text-label-sm text-on-surface-variant uppercase">
                  Total
                </span>
              </div>
            </div>
          </div>

          {/* Legend with counts */}
          <div className="flex justify-center gap-gutter mt-stack-md">
            {data.map((item) => (
              <div key={item.name} className="flex items-center gap-unit">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-label-sm text-on-surface-variant">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-8 opacity-50" style={{ minHeight: 200 }}>
          <span className="material-symbols-outlined text-3xl text-outline mb-2">pie_chart</span>
          <p className="text-label-md text-on-surface-variant">Belum ada data prospek</p>
        </div>
      )}
    </motion.div>
  )
}
