import { useState } from 'react'
import { motion } from 'framer-motion'
import ReplyContextPanel from '../components/replygen/ReplyContextPanel'
import ReplyOutputPanel from '../components/replygen/ReplyOutputPanel'

export default function ReplyGeneratorPage() {
  const [activeTab, setActiveTab] = useState('hard')
  const [toneValue, setToneValue] = useState(50)
  const [selectedLead, setSelectedLead] = useState('budi')
  const [customerMessage, setCustomerMessage] = useState('')

  return (
    <div className="max-w-container-max-width mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Panel Input */}
        <div className="lg:col-span-5 flex flex-col gap-stack-md">
          <ReplyContextPanel
            selectedLead={selectedLead}
            onLeadChange={setSelectedLead}
            customerMessage={customerMessage}
            onMessageChange={setCustomerMessage}
            toneValue={toneValue}
            onToneChange={setToneValue}
          />
        </div>

        {/* Panel Output */}
        <div className="lg:col-span-7 flex flex-col gap-stack-md">
          <ReplyOutputPanel activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>
    </div>
  )
}
