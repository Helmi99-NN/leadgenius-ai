import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { supabase } from '../../lib/supabase'

const periods = ['7H', '30H', '90H']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel rounded-lg p-stack-sm text-label-sm shadow-lg">
        <p className="text-on-surface font-semibold mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-[12px]">
            {entry.name === 'hot' ? 'Panas' : entry.name === 'warm' ? 'Hangat' : 'Dingin'}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// Helper: format tanggal ke label singkat
function formatLabel(date, period) {
  const d = new Date(date)
  if (period === '7H') {
    return ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][d.getDay()]
  }
  if (period === '30H') {
    return `${d.getDate()}/${d.getMonth() + 1}`
  }
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return months[d.getMonth()]
}

// Buat array tanggal untuk range
function generateDateRange(days) {
  const dates = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    dates.push(d)
  }
  return dates
}

export default function LeadTrendChart() {
  const [activePeriod, setActivePeriod] = useState('30H')
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrendData()
  }, [activePeriod])

  async function fetchTrendData() {
    try {
      setLoading(true)
      const daysMap = { '7H': 7, '30H': 30, '90H': 90 }
      const days = daysMap[activePeriod]

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data: leads, error } = await supabase
        .from('leads')
        .select('category, created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      // Grup data per hari/periode
      const dateRange = generateDateRange(days)

      // Untuk 90H, grup per minggu; untuk 30H, grup per 5 hari; untuk 7H, per hari
      let groupedDates = []
      if (activePeriod === '90H') {
        // Grup per minggu (~13 titik)
        for (let i = 0; i < dateRange.length; i += 7) {
          groupedDates.push(dateRange.slice(i, i + 7))
        }
      } else if (activePeriod === '30H') {
        // Grup per 5 hari (6 titik)
        for (let i = 0; i < dateRange.length; i += 5) {
          groupedDates.push(dateRange.slice(i, i + 5))
        }
      } else {
        // Per hari (7 titik)
        groupedDates = dateRange.map((d) => [d])
      }

      const trendData = groupedDates.map((group) => {
        const startOfGroup = group[0]
        const endOfGroup = new Date(group[group.length - 1])
        endOfGroup.setHours(23, 59, 59, 999)

        const inRange = (leads || []).filter((l) => {
          const d = new Date(l.created_at)
          return d >= startOfGroup && d <= endOfGroup
        })

        return {
          name: formatLabel(startOfGroup, activePeriod),
          hot: inRange.filter((l) => l.category === 'hot').length,
          warm: inRange.filter((l) => l.category === 'warm').length,
          cold: inRange.filter((l) => l.category === 'cold').length,
        }
      })

      setChartData(trendData)
    } catch (err) {
      console.error('Gagal memuat tren:', err)
      setChartData([])
    } finally {
      setLoading(false)
    }
  }

  const hasData = chartData.some((d) => d.hot > 0 || d.warm > 0 || d.cold > 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="lg:col-span-2 glass-panel rounded-xl p-gutter flex flex-col min-h-[400px]"
    >
      <div className="flex justify-between items-center mb-gutter">
        <h3 className="font-headline-md text-[20px] font-bold text-on-surface">
          Tren Volume Prospek
        </h3>
        <div className="flex items-center gap-stack-sm">
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => setActivePeriod(period)}
              className={`px-stack-sm py-unit text-label-sm font-label-sm transition-colors rounded ${
                activePeriod === period
                  ? 'bg-surface-variant text-on-surface'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradHot" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradWarm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradCold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e1e3e2" />
              <XAxis dataKey="name" stroke="#6f7975" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6f7975" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cold" stroke="#3b82f6" fillOpacity={1} fill="url(#gradCold)" strokeWidth={2} />
              <Area type="monotone" dataKey="warm" stroke="#f59e0b" fillOpacity={1} fill="url(#gradWarm)" strokeWidth={2} />
              <Area type="monotone" dataKey="hot" stroke="#ef4444" fillOpacity={1} fill="url(#gradHot)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-50">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">show_chart</span>
            <p className="text-label-md text-on-surface-variant">Belum ada data tren</p>
            <p className="text-label-sm text-outline mt-1">Upload screenshot chat untuk mulai</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
