import { useState, useEffect } from 'react'

const DEFAULT_SETTINGS = {
  // AI Config
  aiModel: 'Gemini 2.0 Flash',
  aiLanguage: 'Bahasa Indonesia',
  aiStyle: 'Penjualan Halus (Soft Selling)',
  autoAnalyze: true,
  autoSuggest: true,
  autoCompetitor: false,
  
  // Notifications
  notifNewLead: true,
  notifFollowUp: true,
  notifCompetitor: true,
  notifDaily: false,
  notifSound: false,
}

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const item = window.localStorage.getItem('leadgenius_settings')
      return item ? { ...DEFAULT_SETTINGS, ...JSON.parse(item) } : DEFAULT_SETTINGS
    } catch (error) {
      console.warn('Gagal membaca setting dari localStorage:', error)
      return DEFAULT_SETTINGS
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem('leadgenius_settings', JSON.stringify(settings))
    } catch (error) {
      console.warn('Gagal menyimpan setting ke localStorage:', error)
    }
  }, [settings])

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return { settings, updateSetting }
}
