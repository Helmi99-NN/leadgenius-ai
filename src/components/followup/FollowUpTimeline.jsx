import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import FollowUpCard from './FollowUpCard'
import { getFollowUps } from '../../services/followUpService'

function getStatusConfig(followUp) {
  const now = new Date()
  const scheduled = new Date(followUp.scheduled_at)
  const diffHours = (scheduled - now) / 3600000

  if (followUp.status === 'overdue' || diffHours < -24) {
    const daysLate = Math.max(1, Math.abs(Math.floor(diffHours / 24)))
    return {
      status: 'overdue',
      statusLabel: `Terlambat ${daysLate} hari`,
      indicatorColor: 'bg-error',
      indicatorIcon: 'priority_high',
      indicatorTextColor: 'text-on-error',
      badgeBg: 'bg-error-container',
      badgeText: 'text-on-error-container',
      hasTopBorder: true,
      aiDraftBg: 'bg-primary-fixed',
      aiDraftBorder: 'border-primary-fixed-dim',
      aiDraftTextColor: 'text-on-primary-fixed-variant',
      aiDraftLabelColor: 'text-on-primary-fixed',
      actions: ['send', 'snooze', 'complete'],
    }
  }

  if (diffHours >= -24 && diffHours <= 24) {
    const time = scheduled.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    return {
      status: 'today',
      statusLabel: `Hari ini · ${time}`,
      indicatorColor: 'bg-primary',
      indicatorIcon: 'today',
      indicatorTextColor: 'text-on-primary',
      badgeBg: 'bg-primary-container/20',
      badgeText: 'text-primary',
      hasTopBorder: false,
      aiDraftBg: 'bg-primary-fixed',
      aiDraftBorder: 'border-primary-fixed-dim',
      aiDraftTextColor: 'text-on-primary-fixed-variant',
      aiDraftLabelColor: 'text-on-primary-fixed',
      actions: ['send', 'reschedule'],
    }
  }

  return {
    status: 'upcoming',
    statusLabel: 'Besok',
    indicatorColor: 'bg-surface-container',
    indicatorIcon: 'event',
    indicatorTextColor: 'text-on-surface',
    indicatorBorder: 'border border-outline-variant',
    badgeBg: 'bg-surface-container',
    badgeText: 'text-on-surface-variant',
    hasTopBorder: false,
    aiDraftBg: 'bg-surface-container-low',
    aiDraftBorder: 'border-outline-variant',
    aiDraftTextColor: 'text-on-surface-variant',
    aiDraftLabelColor: 'text-primary',
    actions: ['review'],
  }
}

// Group follow-ups by status category
function groupByStatus(items) {
  const groups = {
    overdue: { label: 'Terlambat', icon: 'warning', color: 'text-error', items: [] },
    today: { label: 'Hari Ini', icon: 'today', color: 'text-primary', items: [] },
    upcoming: { label: 'Mendatang', icon: 'event', color: 'text-on-surface-variant', items: [] },
  }
  items.forEach(item => {
    if (groups[item.status]) {
      groups[item.status].items.push(item)
    }
  })
  return groups
}

export default function FollowUpTimeline({ onLeadClick }) {
  const [followUps, setFollowUps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getFollowUps()
        const formatted = data.map((fu) => {
          const config = getStatusConfig(fu)
          return {
            id: fu.id,
            lead_id: fu.lead_id,
            ...config,
            company: fu.leads?.company || 'Lead Tidak Dikenal',
            description: fu.description || 'Tindak lanjut terjadwal',
            icon: fu.leads?.category === 'hot' ? 'local_fire_department' : fu.leads?.category === 'warm' ? 'wb_sunny' : 'storefront',
            aiDraft: fu.ai_draft || '',
          }
        })
        setFollowUps(formatted)
      } catch (err) {
        console.error('Gagal memuat follow-ups:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white border border-outline-variant rounded-xl p-5 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-container-high" />
              <div className="flex-1 space-y-2">
                <div className="w-1/3 h-4 rounded bg-surface-container-high" />
                <div className="w-2/3 h-3 rounded bg-surface-container-high" />
              </div>
            </div>
            <div className="mt-4 bg-surface-container-low rounded-lg p-3">
              <div className="w-full h-3 rounded bg-surface-container-high" />
              <div className="w-4/5 h-3 rounded bg-surface-container-high mt-2" />
            </div>
            <div className="mt-4 flex gap-2">
              <div className="flex-1 h-9 rounded-lg bg-surface-container-high" />
              <div className="w-20 h-9 rounded-lg bg-surface-container-high" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (followUps.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-outline-variant rounded-xl p-12 text-center"
      >
        <span className="material-symbols-outlined text-5xl text-outline mb-4 block">
          event_available
        </span>
        <h3 className="text-on-surface font-semibold text-lg mb-1">Semua Selesai! 🎉</h3>
        <p className="text-on-surface-variant text-sm">
          Tidak ada tindak lanjut yang menunggu saat ini.
        </p>
      </motion.div>
    )
  }

  const groups = groupByStatus(followUps)

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([key, group]) => {
        if (group.items.length === 0) return null

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Group Header */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className={`material-symbols-outlined text-[18px] ${group.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {group.icon}
              </span>
              <h3 className={`text-[13px] font-semibold uppercase tracking-wider ${group.color}`}>
                {group.label}
              </h3>
              <span className="text-[11px] font-medium text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                {group.items.length}
              </span>
              <div className="flex-1 h-px bg-outline-variant/50 ml-2" />
            </div>

            {/* Cards */}
            <div className="space-y-3">
              {group.items.map((item, idx) => (
                <FollowUpCard key={item.id} item={item} index={idx} onLeadClick={onLeadClick} />
              ))}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
