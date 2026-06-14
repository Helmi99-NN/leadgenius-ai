import { useState, useEffect } from 'react'
import { analyzeSocialMedia, saveAuditToSupabase, getAuditHistoryFromSupabase } from '../services/socialAuditService'

export default function SocialMediaAuditPage() {
  const [url, setUrl] = useState('')
  const [files, setFiles] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [auditResult, setAuditResult] = useState(null)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    const res = await getAuditHistoryFromSupabase()
    if (res.success) setHistory(res.data)
  }

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleAnalyze = async (e) => {
    e.preventDefault()
    if (!url && files.length === 0) return
    setIsAnalyzing(true)
    setAuditResult(null)
    
    const result = await analyzeSocialMedia(url, files)
    
    setIsAnalyzing(false)
    if (result.success) {
      setAuditResult(result.data)
      await saveAuditToSupabase(url || (files[0] ? files[0].name : "File Upload"), result.data)
      loadHistory()
    } else {
      alert("Gagal menganalisis profil: " + result.error)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in relative z-10 font-sans">
      {/* HEADER */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
        
        <button 
          onClick={() => setShowHistory(true)}
          className="absolute top-6 right-6 flex items-center gap-2 text-[#1a2b4c] font-bold hover:bg-gray-50 px-4 py-2 rounded-xl transition-all border border-gray-200 z-20 shadow-sm"
        >
          <span className="material-symbols-outlined">history</span>
          Riwayat (Cloud)
        </button>

        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff6b5b] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#1a2b4c] opacity-5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="w-16 h-16 bg-[#1a2b4c]/10 rounded-2xl flex items-center justify-center mb-6 mt-4 relative z-10">
          <span className="material-symbols-outlined text-4xl text-[#1a2b4c]">fact_check</span>
        </div>
        <h1 className="text-4xl font-black text-[#1a2b4c] mb-4 relative z-10 tracking-tight">360° Facebook Ads Audit</h1>
        <p className="text-gray-500 max-w-2xl text-lg relative z-10 leading-relaxed">
          Analisis mendalam profil Facebook Anda dengan AI. Temukan kelemahan *funnel*, evaluasi kredibilitas, dan siapkan akun Anda untuk performa Meta Ads yang optimal.
        </p>

        <form onSubmit={handleAnalyze} className="mt-8 w-full max-w-2xl flex flex-col gap-4 relative z-10">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">link</span>
            <input
              type="url"
              placeholder="Masukkan link profil Facebook (Opsional jika upload gambar/video)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-100 focus:border-[#ff6b5b] focus:ring-4 focus:ring-[#ff6b5b]/10 transition-all outline-none text-gray-700 font-medium"
            />
          </div>

          {/* DRAG & DROP ZONE */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-[#ff6b5b] transition-colors relative bg-gray-50/50">
            <input 
              type="file" 
              multiple 
              accept="image/*,video/mp4" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-2 pointer-events-none">
              <span className="material-symbols-outlined text-4xl text-gray-400">cloud_upload</span>
              <p className="text-gray-600 font-medium">Klik atau Drag & Drop file ke sini</p>
              <p className="text-gray-400 text-sm">Upload Video Screen Record (.mp4) atau beberapa Screenshot Profile (.jpg/.png)</p>
            </div>
            
            {files.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {files.map((f, i) => (
                  <span key={i} className="bg-[#1a2b4c]/10 text-[#1a2b4c] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">{f.type.includes('video') ? 'movie' : 'image'}</span>
                    {f.name.length > 20 ? f.name.substring(0, 20) + '...' : f.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button 
            type="submit"
            disabled={isAnalyzing || files.length === 0}
            className="mt-2 bg-[#1a2b4c] hover:bg-[#111e36] text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#1a2b4c]/20"
          >
            {isAnalyzing ? (
              <>
                <span className="material-symbols-outlined animate-spin">sync</span>
                AI Sedang Memeriksa File... (Mungkin Butuh Beberapa Detik)
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">analytics</span>
                Mulai Audit Visual
              </>
            )}
          </button>
        </form>
      </div>

      {/* LOADING STATE */}
      {isAnalyzing && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ff6b5b]/5 to-transparent animate-[shimmer_2s_infinite]"></div>
          <div className="relative w-24 h-24 mx-auto mb-8 z-10">
            <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#ff6b5b] rounded-full border-t-transparent animate-spin"></div>
            <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl text-[#1a2b4c]">robot_2</span>
          </div>
          <h3 className="text-xl font-bold text-[#1a2b4c] mb-2 relative z-10">AI Sedang Bekerja...</h3>
          <div className="flex flex-col items-center gap-2 text-gray-500 font-medium relative z-10">
            <p className="animate-pulse">Mengambil data profil...</p>
            <p className="animate-pulse" style={{animationDelay: '0.2s'}}>Mengevaluasi identitas & kredibilitas...</p>
            <p className="animate-pulse" style={{animationDelay: '0.4s'}}>Menganalisis matriks konten & funnel...</p>
          </div>
        </div>
      )}

      {/* RESULTS DASHBOARD */}
      {auditResult && !isAnalyzing && (
        <div className="space-y-8 animate-fade-in-up">
          
          {/* SECTION 11 & 12: SCORES & EXECUTIVE SUMMARY */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#1a2b4c] rounded-2xl p-8 text-white relative overflow-hidden shadow-lg shadow-[#1a2b4c]/20">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#ff6b5b] rounded-full opacity-20 blur-2xl"></div>
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ff6b5b]">flag</span>
                Kesimpulan Kelayakan Iklan
              </h2>
              <div className="text-lg text-blue-50 leading-relaxed space-y-4 relative z-10">
                <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                  <strong className="text-[#ff6b5b] block text-sm uppercase tracking-wider mb-1">Status Kesiapan</strong>
                  <span className="font-bold text-xl">{auditResult.conclusion.status}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white/5 p-4 rounded-xl">
                    <strong className="text-gray-400 block text-sm uppercase tracking-wider mb-1">Risiko Saat Ini</strong>
                    <p className="text-sm text-gray-300">{auditResult.conclusion.risks}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl">
                    <strong className="text-gray-400 block text-sm uppercase tracking-wider mb-1">Peluang Keberhasilan</strong>
                    <p className="text-sm text-gray-300">{auditResult.conclusion.successEstimate}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1a2b4c]">speed</span>
                Skor Evaluasi Akhir
              </h3>
              <div className="space-y-5">
                {Object.entries(auditResult.scores).map(([label, score]) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                      <span className="capitalize">{label.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className={score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-[#ff6b5b]'}>{score}/100</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all duration-1000 ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-[#ff6b5b]'}`} style={{ width: `${score}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TWO COLUMN LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* SECTION 1 & 2: IDENTITY & CREDIBILITY */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-[#1a2b4c] mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                <span className="material-symbols-outlined text-[#ff6b5b]">badge</span>
                1. Identitas & Kredibilitas
              </h3>
              <ul className="space-y-5">
                {auditResult.identity.map((item, idx) => (
                  <li key={idx} className="flex gap-4 items-start">
                    <span className={`material-symbols-outlined mt-0.5 text-xl ${item.ok ? 'text-green-500' : 'text-[#ff6b5b]'}`}>
                      {item.ok ? 'check_circle' : 'cancel'}
                    </span>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{item.title}</p>
                      <p className="text-gray-500 text-sm mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* SECTION 3 & 6: CONTENT & FUNNEL */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-[#1a2b4c] mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                <span className="material-symbols-outlined text-[#ff6b5b]">filter_alt</span>
                2. Funnel & Komposisi Konten
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Marketing Funnel Distribution</h4>
                  <div className="flex flex-col gap-3">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex justify-between items-center transition-transform hover:scale-[1.02]">
                      <span className="font-bold text-blue-900 text-sm">TOFU (Awareness)</span>
                      <span className="font-black text-blue-700 bg-blue-100 px-3 py-1 rounded-lg">{auditResult.funnel.tofu}%</span>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl flex justify-between items-center mx-4 transition-transform hover:scale-[1.02]">
                      <span className="font-bold text-yellow-900 text-sm">MOFU (Consideration)</span>
                      <span className="font-black text-yellow-700 bg-yellow-100 px-3 py-1 rounded-lg">{auditResult.funnel.mofu}%</span>
                    </div>
                    <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex justify-between items-center mx-8 transition-transform hover:scale-[1.02]">
                      <span className="font-bold text-green-900 text-sm">BOFU (Conversion)</span>
                      <span className="font-black text-green-700 bg-green-100 px-3 py-1 rounded-lg">{auditResult.funnel.bofu}%</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <strong className="text-[#1a2b4c] block mb-1 text-sm">Evaluasi Funnel:</strong> 
                  <p className="text-sm text-gray-600 leading-relaxed">{auditResult.funnel.evaluation}</p>
                </div>
              </div>
            </div>

          </div>

          {/* SECTION 9 & 10: CHECKLIST & ROADMAP */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
             <h3 className="text-xl font-bold text-[#1a2b4c] mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                <span className="material-symbols-outlined text-[#ff6b5b]">format_list_bulleted</span>
                3. Roadmap Perbaikan Prioritas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* High Priority */}
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100 shadow-sm">
                  <h4 className="text-red-800 font-bold flex items-center gap-2 mb-4 pb-2 border-b border-red-100">
                    <span className="material-symbols-outlined">warning</span>
                    Prioritas Tinggi
                  </h4>
                  <ul className="space-y-4">
                    {auditResult.roadmap.high.map((item, i) => {
                      const task = typeof item === 'string' ? item : item.task;
                      const action = typeof item === 'string' ? null : item.action;
                      return (
                      <li key={i} className="flex flex-col gap-2 text-sm text-red-900 leading-relaxed bg-white p-3 rounded-xl border border-red-100/50">
                        <div className="flex gap-2">
                          <span className="text-red-500 font-bold mt-0.5">•</span> 
                          <span className="font-semibold">{task}</span>
                        </div>
                        {action && (
                          <div className="mt-1 ml-4 bg-red-50/50 p-3 rounded-lg border border-red-100">
                             <strong className="text-[10px] text-red-400 block mb-1 uppercase tracking-wider">Eksekusi Praktis:</strong>
                             <p className="text-red-800 italic select-all">{action}</p>
                          </div>
                        )}
                      </li>
                      )
                    })}
                  </ul>
                </div>
                
                {/* Medium Priority */}
                <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100 shadow-sm">
                  <h4 className="text-yellow-800 font-bold flex items-center gap-2 mb-4 pb-2 border-b border-yellow-100">
                    <span className="material-symbols-outlined">schedule</span>
                    Prioritas Menengah
                  </h4>
                  <ul className="space-y-4">
                    {auditResult.roadmap.medium.map((item, i) => {
                      const task = typeof item === 'string' ? item : item.task;
                      const action = typeof item === 'string' ? null : item.action;
                      return (
                      <li key={i} className="flex flex-col gap-2 text-sm text-yellow-900 leading-relaxed bg-white p-3 rounded-xl border border-yellow-100/50">
                        <div className="flex gap-2">
                          <span className="text-yellow-500 font-bold mt-0.5">•</span> 
                          <span className="font-semibold">{task}</span>
                        </div>
                        {action && (
                          <div className="mt-1 ml-4 bg-yellow-50/50 p-3 rounded-lg border border-yellow-100">
                             <strong className="text-[10px] text-yellow-500 block mb-1 uppercase tracking-wider">Eksekusi Praktis:</strong>
                             <p className="text-yellow-800 italic select-all">{action}</p>
                          </div>
                        )}
                      </li>
                      )
                    })}
                  </ul>
                </div>

                {/* Low Priority */}
                <div className="bg-green-50 p-6 rounded-2xl border border-green-100 shadow-sm">
                  <h4 className="text-green-800 font-bold flex items-center gap-2 mb-4 pb-2 border-b border-green-100">
                    <span className="material-symbols-outlined">task_alt</span>
                    Prioritas Rendah (Optimasi)
                  </h4>
                  <ul className="space-y-4">
                    {auditResult.roadmap.low.map((item, i) => {
                      const task = typeof item === 'string' ? item : item.task;
                      const action = typeof item === 'string' ? null : item.action;
                      return (
                      <li key={i} className="flex flex-col gap-2 text-sm text-green-900 leading-relaxed bg-white p-3 rounded-xl border border-green-100/50">
                        <div className="flex gap-2">
                          <span className="text-green-500 font-bold mt-0.5">•</span> 
                          <span className="font-semibold">{task}</span>
                        </div>
                        {action && (
                          <div className="mt-1 ml-4 bg-green-50/50 p-3 rounded-lg border border-green-100">
                             <strong className="text-[10px] text-green-500 block mb-1 uppercase tracking-wider">Panduan Praktis:</strong>
                             <p className="text-green-800 italic select-all">{action}</p>
                          </div>
                        )}
                      </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
          </div>

        </div>
      )}

      {/* HISTORY SLIDE-OVER */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-fade-in-right">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#1a2b4c] text-white">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined">cloud_sync</span>
                Riwayat Audit
              </h2>
              <button onClick={() => setShowHistory(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-gray-50">
              {history.length === 0 ? (
                <div className="text-center mt-10">
                  <span className="material-symbols-outlined text-6xl text-gray-300 mb-2">inbox</span>
                  <p className="text-gray-500 font-medium">Belum ada riwayat audit.</p>
                </div>
              ) : (
                history.map((h) => (
                  <div 
                    key={h.id} 
                    onClick={() => {
                      setAuditResult(h.result);
                      setShowHistory(false);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                    className="p-4 bg-white border border-gray-200 rounded-xl hover:border-[#ff6b5b] hover:shadow-md cursor-pointer transition-all flex flex-col gap-3 group"
                  >
                    <div className="flex justify-between items-start">
                      <strong className="text-[#1a2b4c] truncate max-w-[200px] text-sm group-hover:text-[#ff6b5b] transition-colors">{h.url}</strong>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                        {new Date(h.created_at).toLocaleDateString('id-ID', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-50 pt-2">
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Status:</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${h.result?.conclusion?.status?.includes('LAYAK') && !h.result?.conclusion?.status?.includes('BELUM') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {h.result?.conclusion?.status || 'Unknown'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// -------------------------------------------------------------
// DUMMY DATA UNTUK MOCKUP UI SEBELUM ADA API GEMINI
// -------------------------------------------------------------
function getMockData() {
  return {
    scores: {
      brandingScore: 75,
      trustScore: 40,
      contentScore: 65,
      engagementScore: 55,
      adsReadinessScore: 45
    },
    conclusion: {
      status: "BELUM LAYAK UNTUK IKLAN KONVERSI",
      risks: "Jika Anda memaksakan beriklan sekarang, CPC (Cost Per Click) akan sangat mahal karena trust issue. Pengunjung iklan yang masuk ke profil Anda kemungkinan besar akan mental (bounce) karena kurangnya social proof dan kontak bisnis yang jelas.",
      successEstimate: "Tingkat keberhasilan kampanye saat ini diprediksi hanya 30-40%. Harap selesaikan 'Prioritas Tinggi' di Roadmap sebelum menghidupkan kampanye Ads."
    },
    identity: [
      { title: "Keseragaman Branding", desc: "Warna cover dan profile picture sudah senada (Navy/Coral), namun resolusi cover sedikit pecah.", ok: true },
      { title: "Kejelasan Positioning", desc: "Bio menyebutkan 'Digital Creator' namun kontennya campur aduk. Positioning tidak tajam.", ok: false },
      { title: "Kelengkapan Kontak", desc: "Website dan Nomor WhatsApp Business tidak tercantum. Ini sangat fatal untuk Ads.", ok: false },
      { title: "Social Proof Dasar", desc: "Baru memiliki 5 Likes. Tingkat kepercayaan audiens dingin (cold audience) masih sangat rendah.", ok: false },
    ],
    funnel: {
      tofu: 80,
      mofu: 15,
      bofu: 5,
      evaluation: "Akun ini terlalu banyak berisi konten Awareness/Edukasi ringan (TOFU), namun tidak memiliki konten yang meyakinkan audiens untuk membeli (Testimoni, Detail Produk, Portofolio). Konten jualan (BOFU) sangat minim yang akan menyulitkan retargeting."
    },
    roadmap: {
      high: [
        { task: "Lengkapi Nomor WhatsApp dan Link Website resmi di kolom profil Bio", action: "Bio Baru: 'Spesialis Baju Koko Anak Premium ✨ | Pengiriman Seluruh Indonesia 📦 | Pesan via WhatsApp 👇' \n\nLink: wa.me/628123456789" },
        { task: "Buat 3 postingan Testimoni Pelanggan yang di-pin di bagian paling atas profil", action: "Post 1: 'Alhamdulillah, pesanan mendarat aman di Surabaya! Terima kasih bunda testimoni jujurnya 🥰' (Sertakan foto screenshot chat)" },
        { task: "Ubah kategori profil dari 'Digital Creator' menjadi kategori bisnis/perusahaan yang relevan", action: "Masuk ke Edit Profile -> Category -> Ubah menjadi 'Clothing (Brand)'" }
      ],
      medium: [
        { task: "Perbaiki resolusi Foto Cover agar terlihat profesional di tampilan Desktop maupun Mobile", action: "Gunakan Canva ukuran 1640 x 856 px. Letakkan logo dan pesan utama di tengah agar tidak terpotong di HP." },
        { task: "Tambahkan setidaknya 5 katalog produk di fitur Shop/Postingan unggulan", action: "Buat album foto 'Katalog 2026' dan unggah 5 produk best-seller dengan deskripsi harga dan bahan yang jelas." },
        { task: "Tingkatkan interaksi organik minimal 50 likes agar tidak terlihat seperti akun palsu", action: "Minta teman atau kerabat untuk like dan komen di 3 postingan terakhir Anda." }
      ],
      low: [
        { task: "Buat warna thumbnail video/postingan yang lebih seragam menggunakan template brand", action: "Pilih 2 warna utama merek (misalnya Biru Navy dan Emas) dan konsisten gunakan untuk teks judul di setiap foto." },
        { task: "Balas beberapa komentar lama untuk memancing kembali algoritma engagement rate", action: "Balas: 'Terima kasih banyak kak atas kepercayaannya! Ditunggu orderan selanjutnya ya 🙏'" }
      ]
    }
  }
}
