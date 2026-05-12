import { useState, useEffect } from 'react'
import StatCard from '../components/ui/StatCard'
import FollowUpAlert from '../components/dashboard/FollowUpAlert'
import LeadTrendChart from '../components/dashboard/LeadTrendChart'
import LeadDistribution from '../components/dashboard/LeadDistribution'
import AIPerformance from '../components/dashboard/AIPerformance'
import RecentLeadsTable from '../components/dashboard/RecentLeadsTable'
import { getLeadStats } from '../services/leadsService'

export default function DashboardPage() {
  const [stats, setStats] = useState({ hot: 0, warm: 0, cold: 0, total: 0, avgScore: 0 })

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getLeadStats()
        setStats(data)
      } catch (err) {
        console.error('Gagal memuat statistik:', err)
      }
    }
    fetchStats()
  }, [])

  const convRate = stats.total > 0 ? ((stats.hot / stats.total) * 100).toFixed(1) : '0'

  return (
    <>
      {/* Follow-Up Alerts Banner */}
      <FollowUpAlert />

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <StatCard
          icon="local_fire_department"
          iconColor="#ef4444"
          iconBg="rgba(239, 68, 68, 0.15)"
          label="Prospek Panas"
          value={String(stats.hot)}
          trend={stats.hot > 0 ? 'up' : 'flat'}
          trendValue={stats.hot > 0 ? `${stats.hot} lead` : '0'}
          hasGradientBorder={stats.hot > 0}
          delay={0}
        />
        <StatCard
          icon="wb_sunny"
          iconColor="#f59e0b"
          iconBg="rgba(245, 158, 11, 0.15)"
          label="Prospek Hangat"
          value={String(stats.warm)}
          trend={stats.warm > 0 ? 'up' : 'flat'}
          trendValue={stats.warm > 0 ? `${stats.warm} lead` : '0'}
          delay={0.1}
        />
        <StatCard
          icon="ac_unit"
          iconColor="#3b82f6"
          iconBg="rgba(59, 130, 246, 0.15)"
          label="Prospek Dingin"
          value={String(stats.cold)}
          trend="flat"
          trendValue={stats.cold > 0 ? `${stats.cold} lead` : '0'}
          delay={0.2}
        />
        <StatCard
          icon="published_with_changes"
          iconColor="#004c3d"
          iconBg="rgba(7, 102, 83, 0.2)"
          label="Tingkat Konv."
          value={convRate}
          valueSuffix="%"
          trend={parseFloat(convRate) > 0 ? 'up' : 'flat'}
          trendValue={stats.total > 0 ? `${stats.total} total` : '0'}
          delay={0.3}
        />
      </div>

      {/* Dashboard Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Main Chart Area */}
        <LeadTrendChart />

        {/* Right Column: Donut & AI Stats */}
        <div className="flex flex-col gap-gutter">
          <LeadDistribution />
          <AIPerformance />
        </div>
      </div>

      {/* Recent Leads Table */}
      <RecentLeadsTable />
    </>
  )
}
