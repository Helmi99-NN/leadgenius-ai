import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import UploadZone from '../components/analyzer/UploadZone'
import IntelligenceReading from '../components/analyzer/IntelligenceReading'
import ContextExtraction from '../components/analyzer/ContextExtraction'
import RecommendedReplies from '../components/analyzer/RecommendedReplies'
import SmartSuggestion from '../components/analyzer/SmartSuggestion'
import AnalyzerActionBar from '../components/analyzer/AnalyzerActionBar'
import { analyzeChatScreenshot, fileToBase64, analyzeChatText } from '../services/geminiService'
import { saveAnalyzedLead } from '../services/leadsService'

export default function AnalyzerPage() {
  const [activeTab, setActiveTab] = useState('hard')
  const [analysisResult, setAnalysisResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState(null)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [textInput, setTextInput] = useState('')
  const rawFilesRef = useRef([])
  const [extensionSource, setExtensionSource] = useState(null)

  const [savedLead, setSavedLead] = useState(null)

  // ── CEK PWA SHARE TARGET & EXTENSION ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    
    // 1. PWA Share Target
    const sharedText = params.get('text') || params.get('title')
    if (sharedText) {
      console.log('📱 Menerima data dari PWA Share Target:', sharedText)
      setTextInput(sharedText)
      // Bersihkan URL agar jika direfresh tidak memicu ulang
      window.history.replaceState({}, document.title, window.location.pathname)
      // Auto-analyze text
      handleAnalyzeText(sharedText)
      return
    }

    // 2. Extension
    function checkExtensionCapture() {
      const capture = window.__LEADGENIUS_CAPTURE__
      if (!capture || !capture.dataUrl) return

      try {
        window.__LEADGENIUS_CAPTURE__ = null
        console.log('📸 Menerima capture dari extension:', capture.platform?.name)
        setExtensionSource(capture.platform)

        const byteString = atob(capture.dataUrl.split(',')[1])
        const mimeString = capture.dataUrl.split(',')[0].split(':')[1].split(';')[0]
        const ab = new ArrayBuffer(byteString.length)
        const ia = new Uint8Array(ab)
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i)
        }
        const blob = new Blob([ab], { type: mimeString })
        const file = new File([blob], 'extension-capture.png', { type: mimeString })

        setUploadedFiles([{ id: Date.now(), file, preview: capture.dataUrl }])
        rawFilesRef.current = [file]

        handleAnalyzeImage([file], capture.platform)
      } catch (err) {
        console.error('Gagal proses capture extension:', err)
      }
    }

    if (params.get('from') === 'extension') {
      let attempts = 0
      const interval = setInterval(() => {
        attempts++
        checkExtensionCapture()
        if (attempts >= 10 || (window.__LEADGENIUS_CAPTURE__ === null && attempts > 2)) {
          clearInterval(interval)
        }
      }, 500)
      return () => clearInterval(interval)
    }

    function onExtensionCapture() {
      checkExtensionCapture()
    }
    window.addEventListener('extensionCaptureReady', onExtensionCapture)
    return () => window.removeEventListener('extensionCaptureReady', onExtensionCapture)
  }, [])

  const processResultAndSave = async (result, platformOverride) => {
    setAnalysisResult(result)
    try {
      const { lead, isUpdate } = await saveAnalyzedLead(result, platformOverride)
      setSavedLead({ ...lead, isUpdate })
      console.log(`✅ Data ${isUpdate ? 'diupdate' : 'tersimpan'} untuk: ${lead.company} (id: ${lead.id})`)
    } catch (dbErr) {
      console.warn('Gagal simpan ke database:', dbErr)
    }
  }

  const handleAnalyzeImage = async (files, platformOverride) => {
    if (!files || files.length === 0) return

    rawFilesRef.current = files
    setIsAnalyzing(true)
    setError(null)
    setAnalysisResult(null)
    setSavedLead(null)

    try {
      const file = files[0]
      const { base64, mimeType } = await fileToBase64(file)
      const result = await analyzeChatScreenshot(base64, mimeType)
      await processResultAndSave(result, platformOverride)
    } catch (err) {
      console.error('Analisis gagal:', err)
      setError(err.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAnalyzeText = async (text) => {
    if (!text.trim()) return

    setIsAnalyzing(true)
    setError(null)
    setAnalysisResult(null)
    setSavedLead(null)

    try {
      const result = await analyzeChatText(text)
      await processResultAndSave(result, null)
    } catch (err) {
      console.error('Analisis teks gagal:', err)
      setError(err.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setAnalysisResult(null)
    setError(null)
    setUploadedFiles([])
    setSavedLead(null)
    setTextInput('')
  }

  return (
    <>
      {/* Header Halaman */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl"
      >
        <h1 className="font-display-lg text-display-lg text-primary mb-stack-sm">
          Analisis Chat
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Ekstrak intelijen dari tangkapan layar percakapan. Unggah riwayat chat
          untuk menghasilkan penilaian prospek instan dan strategi balasan
          berbasis AI.
        </p>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-error-container border border-error/30 rounded-lg p-stack-md flex items-start gap-stack-sm"
        >
          <span className="material-symbols-outlined text-error">error</span>
          <div className="flex-1">
            <p className="font-label-md text-label-md text-on-error-container font-medium">
              {error.includes('429') || error.includes('quota') || error.includes('Rate limit')
                ? '⏳ Quota API Habis Sementara'
                : 'Analisis Gagal'}
            </p>
            <p className="font-body-sm text-body-sm text-on-error-container/80 mt-unit">
              {error.includes('429') || error.includes('quota') || error.includes('Rate limit')
                ? 'Gemini API sedang sibuk. Tunggu 30 detik lalu coba lagi.'
                : error}
            </p>
            {(error.includes('429') || error.includes('quota') || error.includes('Rate limit')) && (
              <button
                onClick={() => {
                  setError(null)
                  if (rawFilesRef.current.length > 0) {
                    handleAnalyze(rawFilesRef.current)
                  }
                }}
                className="mt-stack-sm px-4 py-1.5 rounded-lg bg-on-error-container/10 text-on-error-container font-label-md text-label-md hover:bg-on-error-container/20 transition-colors inline-flex items-center gap-unit"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Coba Lagi
              </button>
            )}
          </div>
          <button
            onClick={() => setError(null)}
            className="text-on-error-container/60 hover:text-on-error-container"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </motion.div>
      )}

      {/* Success Notification */}
      {savedLead && analysisResult && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-container border border-primary/20 rounded-lg p-stack-md flex items-start gap-stack-sm"
        >
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            {savedLead.isUpdate ? 'sync' : 'check_circle'}
          </span>
          <div className="flex-1">
            <p className="font-label-md text-label-md text-on-primary-container font-medium">
              {savedLead.isUpdate
                ? '🔄 Data Customer Diupdate!'
                : '✅ Data Tersimpan ke Database!'}
            </p>
            <p className="font-body-sm text-body-sm text-on-primary-container/80 mt-unit">
              {savedLead.isUpdate
                ? <>Customer <strong>{analysisResult.customerName}</strong> sudah ada — skor & data diperbarui (Skor: {analysisResult.score}). Chat history baru ditambahkan.</>
                : <>Prospek <strong>{analysisResult.customerName || 'Pelanggan'}</strong> (Skor: {analysisResult.score}) tersimpan. Follow-up otomatis dijadwalkan 24 jam kedepan.</>
              }{' '}
              Buka{' '}
              <a href="/leads" className="underline font-medium hover:text-primary">Halaman Prospek</a>{' '}
              atau <a href="/follow-up" className="underline font-medium hover:text-primary">Tindak Lanjut</a> untuk melihat.
            </p>
          </div>
          <button
            onClick={() => setSavedLead(null)}
            className="text-on-primary-container/60 hover:text-on-primary-container"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </motion.div>
      )}

      {/* Grid Utama Bento */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">
        {/* Kolom Kiri: Upload & Pemrosesan */}
        <div className="xl:col-span-4 space-y-gutter flex flex-col">
          <UploadZone
            onAnalyze={handleAnalyzeImage}
            isAnalyzing={isAnalyzing}
            hasResult={!!analysisResult}
            onReset={handleReset}
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
            textInput={textInput}
            setTextInput={setTextInput}
            onAnalyzeText={handleAnalyzeText}
          />
          <IntelligenceReading
            result={analysisResult}
            isAnalyzing={isAnalyzing}
          />
        </div>

        {/* Kolom Kanan: Ringkasan & Balasan */}
        <div className="xl:col-span-8 space-y-gutter flex flex-col">
          <SmartSuggestion
            result={analysisResult}
            isAnalyzing={isAnalyzing}
          />
          <ContextExtraction
            result={analysisResult}
            isAnalyzing={isAnalyzing}
          />
          <RecommendedReplies
            activeTab={activeTab}
            onTabChange={setActiveTab}
            result={analysisResult}
            isAnalyzing={isAnalyzing}
          />
        </div>
      </div>

      {/* Bar Aksi Mengambang */}
      <AnalyzerActionBar
        result={analysisResult}
      />
    </>
  )
}
