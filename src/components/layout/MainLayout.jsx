import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import { useGlobalChatListener } from '../../hooks/useGlobalChatListener'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Aktifkan pendengar chat global di background
  useGlobalChatListener()

  return (
    <div className="text-on-background font-body-md min-h-screen flex pb-20 md:pb-0">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0">
        <TopBar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />

        <motion.div
          className="p-4 md:p-margin space-y-stack-lg overflow-y-auto custom-scrollbar flex-1 pb-32"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </main>

      <BottomNav />
    </div>
  )
}
