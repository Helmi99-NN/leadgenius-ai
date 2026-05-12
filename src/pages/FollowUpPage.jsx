import { motion } from 'framer-motion'
import FollowUpHeader from '../components/followup/FollowUpHeader'
import AIInsightPanel from '../components/followup/AIInsightPanel'
import FollowUpTimeline from '../components/followup/FollowUpTimeline'

export default function FollowUpPage() {
  return (
    <>
      {/* Header Halaman & Aksi Massal */}
      <FollowUpHeader />

      {/* Layout Grid Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Kolom Kiri: Panel Wawasan AI */}
        <div className="lg:col-span-4 flex flex-col gap-gutter">
          <AIInsightPanel />
        </div>

        {/* Kolom Kanan: Tampilan Timeline */}
        <div className="lg:col-span-8">
          <FollowUpTimeline />
        </div>
      </div>
    </>
  )
}
