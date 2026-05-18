import { motion } from 'framer-motion'
import FollowUpHeader from '../components/followup/FollowUpHeader'
import AIInsightPanel from '../components/followup/AIInsightPanel'
import FollowUpTimeline from '../components/followup/FollowUpTimeline'

export default function FollowUpPage() {
  return (
    <>
      {/* Header Halaman & Aksi Massal */}
      <FollowUpHeader />

      {/* Layout Grid Bento - Reversed: Cards first on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Daftar Tindak Lanjut */}
        <div className="lg:col-span-8 order-2 lg:order-1">
          <FollowUpTimeline />
        </div>

        {/* Kolom Kanan: Panel Wawasan AI */}
        <div className="lg:col-span-4 order-1 lg:order-2">
          <div className="lg:sticky lg:top-6 space-y-4">
            <AIInsightPanel />
          </div>
        </div>
      </div>
    </>
  )
}
