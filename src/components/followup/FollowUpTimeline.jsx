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
      statusLabel: `Terlambat (${daysLate} hari)`,
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
      statusLabel: `Hari Ini pukul ${time}`,
      indicatorColor: 'bg-primary',
      indicatorIcon: 'today',
      indicatorTextColor: 'text-on-primary',
      badgeBg: 'bg-surface-container',
      badgeText: 'text-on-surface',
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

export default function FollowUpTimeline() {
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
            ...config,
            company: fu.leads?.company || 'Lead Tidak Dikenal',
            description: fu.description || 'Tindak lanjut terjadwal',
            icon: fu.leads?.category === 'hot' ? 'business' : fu.leads?.category === 'warm' ? 'person' : 'storefront',
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
      <div className="flex items-center justify-center min-h-[300px]">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Garis timeline vertikal */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-outline-variant md:left-1/2 md:-translate-x-px" />

      <div className="space-y-gutter">
        {followUps.map((item, idx) => (
          <FollowUpCard key={item.id} item={item} index={idx} />
        ))}
      </div>
    </div>
  )
}
