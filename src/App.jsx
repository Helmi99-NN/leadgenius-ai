import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import DashboardPage from './pages/DashboardPage'
import AnalyzerPage from './pages/AnalyzerPage'
import LeadsPage from './pages/LeadsPage'
import FollowUpPage from './pages/FollowUpPage'
import ReplyGeneratorPage from './pages/ReplyGeneratorPage'
import CompetitorPage from './pages/CompetitorPage'
import MachineDatabasePage from './pages/MachineDatabasePage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage from './pages/SettingsPage'
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
          <Route path="competitors" element={<CompetitorPage />} />
          <Route path="machine-database" element={<MachineDatabasePage />} />
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
