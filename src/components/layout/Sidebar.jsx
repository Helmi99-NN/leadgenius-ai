import { NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { path: '/dashboard', label: 'Dasbor', icon: 'dashboard', filled: true },
  { path: '/analyzer', label: 'Analisis Chat', icon: 'analytics' },
  { path: '/leads', label: 'Prospek', icon: 'group' },
  { path: '/follow-up', label: 'Tindak Lanjut', icon: 'history_toggle_off' },
  { path: '/reply-generator', label: 'Generator Balasan', icon: 'auto_awesome' },
  { path: '/competitors', label: 'Kompetitor', icon: 'monitoring' },
  { path: '/notifications', label: 'Notifikasi', icon: 'notifications', badge: 3 },
]

const bottomNavItems = [
  { path: '/settings', label: 'Pengaturan', icon: 'settings' },
]

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation()

  const linkClasses = (isActive) =>
    `flex items-center gap-stack-md px-stack-sm py-stack-sm font-label-md text-label-md rounded-lg active:scale-95 duration-200 transition-colors ${
      isActive
        ? 'bg-primary-container text-on-primary-container'
        : 'text-on-surface-variant hover:bg-surface-container-highest'
    }`

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="mb-stack-lg px-stack-sm">
        <div className="flex items-center gap-stack-sm mb-unit">
          <span
            className="material-symbols-outlined text-primary text-[32px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            insights
          </span>
          <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
            LeadGenius AI
          </h1>
        </div>
        <p className="font-label-sm text-label-sm text-on-surface-variant ml-10 uppercase tracking-widest opacity-80">
          Kecerdasan Pasar
        </p>
      </div>

      {/* Main Nav */}
      <ul className="flex flex-col gap-unit flex-1">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) => linkClasses(isActive)}
              onClick={onClose}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontVariationSettings:
                    location.pathname === item.path ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>
              {item.label}
              {item.badge && (
                <span className="ml-auto bg-error text-on-error text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </NavLink>
          </li>
        ))}

        {/* Bottom nav items */}
        {bottomNavItems.map((item) => (
          <li key={item.path} className={item === bottomNavItems[0] ? 'mt-auto' : ''}>
            <NavLink
              to={item.path}
              className={({ isActive }) => linkClasses(isActive)}
              onClick={onClose}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontVariationSettings:
                    location.pathname === item.path ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="h-screen sticky left-0 top-0 w-64 bg-surface-container border-r border-outline-variant shadow-sm flex-col p-stack-md hidden md:flex shrink-0">
        {sidebarContent}
      </nav>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 md:hidden"
              onClick={onClose}
            />
            <motion.nav
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-screen w-64 bg-surface-container border-r border-outline-variant shadow-xl flex flex-col p-stack-md z-50 md:hidden"
            >
              {sidebarContent}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
