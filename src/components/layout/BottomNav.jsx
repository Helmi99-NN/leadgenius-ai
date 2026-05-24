import { NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getUnreadNotificationCount } from '../../services/notificationsService'
import { supabase } from '../../lib/supabase'

const bottomNavItems = [
  { path: '/dashboard', label: 'Dasbor', icon: 'dashboard', filled: true },
  { path: '/analyzer', label: 'Analisis', icon: 'analytics' },
  { path: '/leads', label: 'Prospek', icon: 'group' },
  { path: '/follow-up', label: 'Tindak Lanjut', icon: 'history_toggle_off' },
  { path: '/notifications', label: 'Notifikasi', icon: 'notifications', isNotification: true },
]

export default function BottomNav() {
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    getUnreadNotificationCount().then(setUnreadCount).catch(console.error)

    const channel = supabase
      .channel('notifications-bottomnav')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => {
          getUnreadNotificationCount().then(setUnreadCount).catch(console.error)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-container border-t border-outline-variant shadow-[0_-4px_16px_rgba(0,0,0,0.05)] z-[60] md:hidden pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {bottomNavItems.map((item) => {
          const isActive = location.pathname === item.path

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center min-w-[64px] py-1 px-2 rounded-xl transition-all duration-200 ${
                isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <div className={`relative flex items-center justify-center w-16 h-8 rounded-full mb-1 transition-colors ${
                isActive ? 'bg-primary-container text-on-primary-container' : 'bg-transparent'
              }`}>
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                {item.isNotification && unreadCount > 0 && (
                  <span className="absolute top-0 right-3 bg-error text-on-error text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border-2 border-surface-container">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className={`text-[11px] font-medium tracking-tight ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
