import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import DashboardPage from './pages/DashboardPage'
import AnalyzerPage from './pages/AnalyzerPage'
import LeadsPage from './pages/LeadsPage'
import FollowUpPage from './pages/FollowUpPage'
import ReplyGeneratorPage from './pages/ReplyGeneratorPage'

import MachineDatabasePage from './pages/MachineDatabasePage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage from './pages/SettingsPage'
import ShopeeProductsPage from './pages/ShopeeProductsPage'
import InvoiceGeneratorPage from './pages/InvoiceGeneratorPage'
import SocialMediaAuditPage from './pages/SocialMediaAuditPage'
import AIAssistant from './components/ai/AIAssistant'
function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="analyzer" element={<AnalyzerPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="follow-up" element={<FollowUpPage />} />
          <Route path="reply-generator" element={<ReplyGeneratorPage />} />

          <Route path="machine-database" element={<MachineDatabasePage />} />
          <Route path="products" element={<ShopeeProductsPage />} />
          <Route path="invoice" element={<InvoiceGeneratorPage />} />
          <Route path="social-audit" element={<SocialMediaAuditPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
    <AIAssistant />
    </>
  )
}

export default App
