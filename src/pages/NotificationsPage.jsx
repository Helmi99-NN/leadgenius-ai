import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getNotifications, markAllRead } from '../services/notificationsService'

const filterTabs = [
  { id: 'all', label: 'Semua' },
  { id: 'followup', label: 'Tindak Lanjut' },
  { id: 'new-lead', label: 'Prospek Baru' },
  { id: 'competitor', label: 'Peringatan Kompetitor' },
]

// Mapping tipe ke ikon/style
const typeConfig = {
  'new-lead': { icon: 'person_add', iconBg: 'bg-secondary-container', iconColor: 'text-on-secondary-container', badge: 'Prospek Baru', badgeStyle: 'bg-primary/10 text-primary border-primary/20' },
  'competitor': { icon: 'trending_up', iconBg: 'bg-error-container', iconColor: 'text-on-error-container', badge: 'Peringatan Kompetitor', badgeStyle: 'bg-error/10 text-error border-error/20' },
  'followup': { icon: 'schedule', iconBg: 'bg-surface-variant', iconColor: 'text-on-surface-variant', badge: 'Tindak Lanjut', badgeStyle: 'bg-outline-variant/30 text-on-surface-variant border-transparent' },
}

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

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [activeFilter])

  async function fetchData() {
    try {
      setLoading(true)
      const data = await getNotifications(activeFilter)
      setNotifications(data.map((n) => {
        const config = typeConfig[n.type] || typeConfig['followup']
        return {
          ...n,
          ...config,
          // read status dari Supabase tidak pakai "read" (reserved), pakai langsung field
          unread: !n.read,
          time: getTimeAgo(n.created_at),
          iconBg: n.read ? 'bg-surface-variant' : config.iconBg,
          iconColor: n.read ? 'text-on-surface-variant' : config.iconColor,
          badgeStyle: n.read ? 'bg-outline-variant/30 text-on-surface-variant border-transparent' : config.badgeStyle,
        }
      }))
    } catch (err) {
      console.error('Gagal memuat notifikasi:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false, read: true })))
    } catch (err) {
      console.error('Gagal menandai dibaca:', err)
    }
  }

  const filtered =
    activeFilter === 'all'
      ? notifications
      : notifications.filter((n) => n.type === activeFilter)

  return (
    <>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-background">
            Notifikasi
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Kelola peringatan dan pembaruan Anda di sini.
          </p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-2 px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg hover:bg-surface-container transition-colors text-primary font-label-md text-label-md"
        >
          <span className="material-symbols-outlined text-sm">done_all</span>
          Tandai Semua Dibaca
        </button>
      </motion.div>

      {/* Filter */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="flex gap-2 overflow-x-auto pb-2"
      >
        {filterTabs.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-4 py-1.5 rounded-full font-label-md text-label-md whitespace-nowrap transition-colors ${
              activeFilter === f.id
                ? 'bg-primary-container text-on-primary-container'
                : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            {f.label}
          </button>
        ))}
      </motion.div>

      {/* Daftar Notifikasi */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden"
      >
        <div className="divide-y divide-outline-variant">
          <AnimatePresence mode="popLayout">
            {filtered.map((notif, idx) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                className={`p-4 flex gap-4 hover:bg-surface-container-low transition-colors relative ${
                  notif.unread ? 'bg-surface-bright' : 'opacity-75'
                }`}
              >
                {/* Indikator belum dibaca */}
                {notif.unread && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl" />
                )}

                {/* Ikon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1 ${notif.iconBg} ${notif.iconColor}`}
                >
                  <span className="material-symbols-outlined">{notif.icon}</span>
                </div>

                {/* Konten */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h3
                      className={`font-label-md text-label-md text-on-background ${
                        notif.unread ? 'font-semibold' : ''
                      }`}
                    >
                      {notif.title}
                    </h3>
                    <span className="font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap shrink-0">
                      {notif.time}
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {notif.description}
                  </p>
                  {notif.badge && (
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full font-label-sm text-label-sm border ${notif.badgeStyle}`}
                      >
                        {notif.badge}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Muat Lebih Banyak */}
      <div className="text-center">
        <button className="font-label-md text-label-md text-primary hover:underline">
          Muat Lebih Banyak
        </button>
      </div>
    </>
  )
}
