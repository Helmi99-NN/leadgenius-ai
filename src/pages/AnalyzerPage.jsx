import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import UploadZone from '../components/analyzer/UploadZone'
import IntelligenceReading from '../components/analyzer/IntelligenceReading'
import ContextExtraction from '../components/analyzer/ContextExtraction'
import RecommendedReplies from '../components/analyzer/RecommendedReplies'
import AnalyzerActionBar from '../components/analyzer/AnalyzerActionBar'
import { analyzeChatScreenshot, fileToBase64 } from '../services/geminiService'
import { supabase } from '../lib/supabase'

export default function AnalyzerPage() {
  const [activeTab, setActiveTab] = useState('hard')
  const [analysisResult, setAnalysisResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState(null)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const rawFilesRef = useRef([])
  const [extensionSource, setExtensionSource] = useState(null)

  const [savedLead, setSavedLead] = useState(null)

  // ── CEK APAKAH DARI EXTENSION ──
  useEffect(() => {
    function checkExtensionCapture() {
      const raw = localStorage.getItem('extensionCapture')
      if (!raw) return

      try {
        const capture = JSON.parse(raw)
        if (!capture.dataUrl) return

        // Hapus dari localStorage agar tidak diproses ulang
        localStorage.removeItem('extensionCapture')

        console.log('📸 Menerima capture dari extension:', capture.platform?.name)
        setExtensionSource(capture.platform)

        // Konversi base64 dataUrl ke File object
        const byteString = atob(capture.dataUrl.split(',')[1])
        const mimeString = capture.dataUrl.split(',')[0].split(':')[1].split(';')[0]
        const ab = new ArrayBuffer(byteString.length)
        const ia = new Uint8Array(ab)
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i)
        }
        const blob = new Blob([ab], { type: mimeString })
        const file = new File([blob], 'extension-capture.png', { type: mimeString })

        // Set preview
        setUploadedFiles([{ id: Date.now(), file, preview: capture.dataUrl }])
        rawFilesRef.current = [file]

        // Auto-trigger analisis
        handleAnalyze([file], capture.platform)
      } catch (err) {
        console.error('Gagal proses capture extension:', err)
      }
    }

    // Cek langsung saat mount
    const params = new URLSearchParams(window.location.search)
    if (params.get('from') === 'extension') {
      // Cek setiap 500ms selama 5 detik (tunggu inject dari extension)
      let attempts = 0
      const interval = setInterval(() => {
        attempts++
        checkExtensionCapture()
        if (attempts >= 10 || localStorage.getItem('extensionCapture') === null && attempts > 2) {
          clearInterval(interval)
        }
      }, 500)

      return () => clearInterval(interval)
    }

    // Juga listen custom event dari extension
    function onExtensionCapture() {
      checkExtensionCapture()
    }
    window.addEventListener('extensionCapture', onExtensionCapture)
    return () => window.removeEventListener('extensionCapture', onExtensionCapture)
  }, [])

  const handleAnalyze = async (files, platformOverride) => {
    if (!files || files.length === 0) return

    rawFilesRef.current = files
    setIsAnalyzing(true)
    setError(null)
    setAnalysisResult(null)
    setSavedLead(null)

    try {
      // Konversi file pertama ke base64
      const file = files[0]
      const { base64, mimeType } = await fileToBase64(file)

      // Kirim ke Gemini untuk analisis
      const result = await analyzeChatScreenshot(base64, mimeType)
      setAnalysisResult(result)

      // ============================================
      // SIMPAN KE SEMUA TABEL SUPABASE
      // ============================================
      try {
        const customerName = result.customerName || 'Pelanggan Baru'
        const initials = customerName
          .split(' ')
          .map((w) => w[0])
          .join('')
          .toUpperCase()
          .substring(0, 2)

        // ── 1. CEK DUPLIKAT: Apakah customer sudah ada? ──
        const { data: existingLeads } = await supabase
          .from('leads')
          .select('id, company, score')
          .ilike('company', customerName)
          .limit(1)

        let lead = null
        let isUpdate = false

        if (existingLeads && existingLeads.length > 0) {
          // ── CUSTOMER SUDAH ADA → UPDATE ──
          isUpdate = true
          const existingId = existingLeads[0].id
          console.log(`🔄 Customer "${customerName}" sudah ada (id: ${existingId}), update data...`)

          const { data: updatedLead, error: updateErr } = await supabase
            .from('leads')
            .update({
              score: result.score || existingLeads[0].score,
              category: result.category || 'cold',
              context: result.intent || result.product || '',
              sentiment: result.sentiment || '',
              last_message: result.transcript?.substring(0, 200) || '',
              last_message_time: new Date().toISOString(),
              needs_followup: true,
              updated_at: new Date().toISOString(),
              ...(platformOverride?.id ? { platform: platformOverride.id } : {}),
            })
            .eq('id', existingId)
            .select()
            .single()

          if (updateErr) console.error('❌ Gagal update lead:', updateErr)
          lead = updatedLead || existingLeads[0]
        } else {
          // ── CUSTOMER BARU → INSERT ──
          console.log(`➕ Customer baru: "${customerName}"`)

          const { data: newLead, error: leadErr } = await supabase.from('leads').insert({
            company: customerName,
            contact: customerName,
            initials,
            platform: platformOverride?.id || 'shopee',
            score: result.score || 0,
            category: result.category || 'cold',
            context: result.intent || result.product || '',
            sentiment: result.sentiment || '',
            last_message: result.transcript?.substring(0, 200) || '',
            last_message_time: new Date().toISOString(),
            needs_followup: true,
          }).select().single()

          if (leadErr) console.error('❌ Gagal simpan lead:', leadErr)
          lead = newLead
        }

        if (lead) {
          setSavedLead({ ...lead, isUpdate })

          // ── 2. Simpan transkrip sebagai chat message (selalu tambah baru) ──
          if (result.transcript) {
            const { error: chatErr } = await supabase.from('chat_messages').insert({
              lead_id: lead.id,
              sender: 'customer',
              message: result.transcript,
            })
            if (chatErr) console.error('❌ Gagal simpan chat:', chatErr)
          }

          // ── 3. Follow-up: update jika sudah ada, insert jika belum ──
          const followUpDate = new Date()
          followUpDate.setHours(followUpDate.getHours() + 24)

          if (isUpdate) {
            // Update follow-up pending yang sudah ada
            const { data: existingFU } = await supabase
              .from('follow_ups')
              .select('id')
              .eq('lead_id', lead.id)
              .eq('status', 'pending')
              .limit(1)

            if (existingFU && existingFU.length > 0) {
              await supabase.from('follow_ups').update({
                scheduled_at: followUpDate.toISOString(),
                ai_draft: result.replies?.soft?.[0] || 'Halo, terima kasih sudah menghubungi kami!',
                description: `Follow-up untuk ${customerName} — ${result.product || 'Produk'}`,
              }).eq('id', existingFU[0].id)
            } else {
              await supabase.from('follow_ups').insert({
                lead_id: lead.id,
                status: 'pending',
                scheduled_at: followUpDate.toISOString(),
                ai_draft: result.replies?.soft?.[0] || 'Halo, terima kasih sudah menghubungi kami!',
                description: `Follow-up untuk ${customerName} — ${result.product || 'Produk'}`,
              })
            }
          } else {
            const { error: fuErr } = await supabase.from('follow_ups').insert({
              lead_id: lead.id,
              status: 'pending',
              scheduled_at: followUpDate.toISOString(),
              ai_draft: result.replies?.soft?.[0] || 'Halo, terima kasih sudah menghubungi kami!',
              description: `Follow-up untuk ${customerName} — ${result.product || 'Produk'}`,
            })
            if (fuErr) console.error('❌ Gagal simpan follow-up:', fuErr)
          }

          // ── 4. Notifikasi (selalu buat baru) ──
          const { error: notifErr } = await supabase.from('notifications').insert({
            type: isUpdate ? 'followup' : 'new-lead',
            title: isUpdate
              ? `Update: ${customerName} (Skor ${result.score})`
              : `Prospek Baru: ${customerName}`,
            description: `Skor ${result.score}/100 — ${result.category === 'hot' ? '🔥 Panas' : result.category === 'warm' ? '☀️ Hangat' : '❄️ Dingin'}. ${result.intent || result.product || ''}`,
            lead_id: lead.id,
            read: false,
          })
          if (notifErr) console.error('❌ Gagal simpan notifikasi:', notifErr)

          // ── 5. Balasan AI: hapus yang lama, simpan yang baru ──
          if (result.replies) {
            // Hapus balasan lama untuk lead ini
            if (isUpdate) {
              await supabase.from('generated_replies').delete().eq('lead_id', lead.id)
            }

            const replyRows = []
            for (const [style, texts] of Object.entries(result.replies)) {
              texts.forEach((text) => {
                replyRows.push({
                  lead_id: lead.id,
                  style,
                  content: text,
                })
              })
            }
            if (replyRows.length > 0) {
              const { error: replyErr } = await supabase.from('generated_replies').insert(replyRows)
              if (replyErr) console.error('❌ Gagal simpan replies:', replyErr)
            }
          }

          console.log(`✅ Data ${isUpdate ? 'diupdate' : 'tersimpan'} untuk: ${customerName} (id: ${lead.id})`)
        }
      } catch (dbErr) {
        console.warn('Gagal simpan ke database:', dbErr)
      }
    } catch (err) {
      console.error('Analisis gagal:', err)
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
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            hasResult={!!analysisResult}
            onReset={handleReset}
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
          />
          <IntelligenceReading
            result={analysisResult}
            isAnalyzing={isAnalyzing}
          />
        </div>

        {/* Kolom Kanan: Ringkasan & Balasan */}
        <div className="xl:col-span-8 space-y-gutter flex flex-col">
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
