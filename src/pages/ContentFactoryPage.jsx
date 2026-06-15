import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateYouTubeContentIdeas } from '../services/geminiService'

export default function ContentFactoryPage() {
  const [mode, setMode] = useState('auto') // 'auto' | 'manual'
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [activeTab, setActiveTab] = useState('ideas') // 'ideas' | 'research' | 'script' | 'thumbnail' | 'metadata'

  const handleGenerate = async () => {
    if (mode === 'manual' && !topic.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await generateYouTubeContentIdeas(topic, mode === 'auto');
      if (res.success) {
        setResult(res.data);
      } else {
        alert("Gagal memproses AI: " + res.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Berhasil disalin!');
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
        <h1 className="font-display-lg text-display-lg text-[#1a2b4c]">Pabrik Ide Konten</h1>
        <p className="font-body-md text-body-md text-gray-500 max-w-2xl">
          Automasi pembuatan naskah, riset mendalam, prompt thumbnail, dan metadata SEO untuk channel YouTube Finance Anda.
        </p>
      </motion.div>

      {/* Control Panel */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setMode('auto')}
            className={`flex-1 py-3 px-4 rounded-xl flex flex-col items-center gap-2 border-2 transition-all ${mode === 'auto' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
          >
            <span className="material-symbols-outlined text-3xl">troubleshoot</span>
            <span className="font-bold">Mode Trending (Otomatis)</span>
            <span className="text-xs text-center opacity-80">AI mencari isu terpanas di IHSG saat ini</span>
          </button>
          <button 
            onClick={() => setMode('manual')}
            className={`flex-1 py-3 px-4 rounded-xl flex flex-col items-center gap-2 border-2 transition-all ${mode === 'manual' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
          >
            <span className="material-symbols-outlined text-3xl">edit_note</span>
            <span className="font-bold">Mode Spesifik (Manual)</span>
            <span className="text-xs text-center opacity-80">Anda tentukan sendiri emiten/topiknya</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'manual' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6">
              <label className="block text-sm font-bold text-[#1a2b4c] mb-2">Topik Konten YouTube</label>
              <input 
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="Contoh: Analisis Laporan Keuangan BBCA Q3 2026 vs BMRI"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={handleGenerate}
          disabled={loading || (mode === 'manual' && !topic.trim())}
          className="w-full py-4 bg-[#1a2b4c] text-white rounded-xl font-bold text-lg hover:bg-[#111c33] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><span className="material-symbols-outlined animate-spin">progress_activity</span> Meracik Konten (1-2 Menit)...</>
          ) : (
            <><span className="material-symbols-outlined">electric_bolt</span> Mulai Produksi Konten</>
          )}
        </button>
      </motion.div>

      {/* Results Panel */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Tabs */}
          <div className="flex border-b border-gray-100 bg-gray-50/50 overflow-x-auto">
            {[
              { id: 'ideas', label: '1. Ideasi', icon: 'lightbulb' },
              { id: 'research', label: '2. Deep Research', icon: 'travel_explore' },
              { id: 'script', label: '3. Naskah Video', icon: 'history_edu' },
              { id: 'thumbnail', label: '4. Prompt Thumbnail', icon: 'image' },
              { id: 'metadata', label: '5. Metadata SEO', icon: 'youtube_activity' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'}`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            
            {/* 1. IDEAS TAB */}
            {activeTab === 'ideas' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                  <div className="flex items-center gap-2 text-primary font-bold mb-2">
                    <span className="material-symbols-outlined">workspace_premium</span>
                    Ide Terpilih (Sistem merekomendasikan ini)
                  </div>
                  <h2 className="text-2xl font-black text-[#1a2b4c] mb-2">{result.selectedIdea.title}</h2>
                  <p className="text-gray-600">{result.selectedIdea.reason}</p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-400">list_alt</span>
                    20 Draft Ide Konten
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 border-collapse">
                      <thead>
                        <tr className="border-b-2 border-gray-200 text-gray-800">
                          <th className="py-3 px-4">Judul</th>
                          <th className="py-3 px-4">CTR</th>
                          <th className="py-3 px-4">Viewer</th>
                          <th className="py-3 px-4">Hook Utama</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.ideas.map((idea, i) => (
                          <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-semibold text-[#1a2b4c] min-w-[200px]">{idea.title}</td>
                            <td className="py-3 px-4 text-center">
                              <span className="bg-green-100 text-green-800 font-bold px-2 py-1 rounded">{idea.ctr}/10</span>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">{idea.viewer}</td>
                            <td className="py-3 px-4 min-w-[250px]">{idea.hook}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. RESEARCH TAB */}
            {activeTab === 'research' && (
              <div className="animate-fade-in relative">
                <button onClick={() => copyToClipboard(result.deepResearch)} className="absolute top-0 right-0 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">content_copy</span> Copy Riset
                </button>
                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 text-xl">
                  <span className="material-symbols-outlined text-blue-500">travel_explore</span>
                  Dokumen Deep Research
                </h3>
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl font-mono text-sm leading-relaxed text-gray-800 whitespace-pre-wrap select-all">
                  {result.deepResearch}
                </div>
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm flex gap-3">
                  <span className="material-symbols-outlined">lightbulb</span>
                  <p><strong>Tips NotebookLM:</strong> Salin (Copy) teks riset di atas, buka aplikasi NotebookLM, buat Notebook baru, lalu Paste teks ini sebagai "Source / Sumber" agar NotebookLM bisa membuat Audio Podcast dari data ini.</p>
                </div>
              </div>
            )}

            {/* 3. SCRIPT TAB */}
            {activeTab === 'script' && (
              <div className="animate-fade-in relative">
                <button onClick={() => copyToClipboard(result.notebookLmPrompt)} className="absolute top-0 right-0 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">content_copy</span> Copy Naskah
                </button>
                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 text-xl">
                  <span className="material-symbols-outlined text-purple-500">history_edu</span>
                  Naskah Video Overview (Podcast Style)
                </h3>
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl font-mono text-sm leading-relaxed text-gray-800 whitespace-pre-wrap select-all">
                  {result.notebookLmPrompt}
                </div>
              </div>
            )}

            {/* 4. THUMBNAIL TAB */}
            {activeTab === 'thumbnail' && (
              <div className="animate-fade-in space-y-6">
                <div className="bg-orange-50 border border-orange-200 p-6 rounded-xl">
                  <h4 className="text-orange-800 font-bold mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined">auto_awesome</span> Hook Visual (Ide Thumbnail)
                  </h4>
                  <p className="text-orange-900">{result.thumbnail.hook}</p>
                </div>

                <div className="relative">
                   <button onClick={() => copyToClipboard(result.thumbnail.prompt)} className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-lg font-semibold text-xs flex items-center gap-2 transition-colors">
                    <span className="material-symbols-outlined text-[14px]">content_copy</span> Copy
                  </button>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Prompt DALL-E / Midjourney</label>
                  <div className="bg-gray-900 border border-gray-800 p-5 pt-12 rounded-xl font-mono text-sm leading-relaxed text-green-400 whitespace-pre-wrap select-all">
                    {result.thumbnail.prompt}
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 italic mt-2">
                  *Salin teks di atas dan tempelkan (paste) ke ChatGPT (DALL-E) atau Midjourney untuk merender gambar thumbnail otomatis.
                </p>
              </div>
            )}

            {/* 5. METADATA TAB */}
            {activeTab === 'metadata' && (
              <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Titles */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                    <span className="material-symbols-outlined text-red-500">title</span> 10 Judul Clickbait SEO
                  </h3>
                  <div className="space-y-2">
                    {result.metadata.titles.map((title, i) => (
                      <div key={i} onClick={() => copyToClipboard(title)} className="bg-gray-50 hover:bg-gray-100 p-3 rounded-lg border border-gray-200 text-sm text-[#1a2b4c] font-semibold cursor-pointer group flex justify-between items-center transition-colors">
                        <span>{title}</span>
                        <span className="material-symbols-outlined text-gray-400 group-hover:text-primary text-[18px]">content_copy</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Tags & Keywords */}
                  <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl">
                    <h4 className="text-blue-900 font-bold mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined">tag</span> Tags & Keywords
                    </h4>
                    <div className="mb-3">
                      <strong className="text-xs text-blue-700 block mb-1">KEYWORD UTAMA:</strong>
                      <span className="bg-white px-3 py-1 rounded-full text-blue-800 text-sm font-semibold border border-blue-200">{result.metadata.keywords.main}</span>
                    </div>
                    <div className="mb-3">
                      <strong className="text-xs text-blue-700 block mb-1">KEYWORD TURUNAN (LSI):</strong>
                      <div className="flex flex-wrap gap-2">
                        {result.metadata.keywords.LSI.map((kw, i) => (
                          <span key={i} className="bg-white px-2 py-1 rounded text-blue-700 text-xs border border-blue-200">{kw}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <strong className="text-xs text-blue-700 block mb-1">YOUTUBE TAGS (Klik untuk Copy):</strong>
                      <div 
                        onClick={() => copyToClipboard(result.metadata.tags.join(', '))}
                        className="bg-white p-3 rounded-lg border border-blue-200 text-sm text-blue-900 font-mono cursor-pointer hover:bg-blue-100 transition-colors"
                      >
                        {result.metadata.tags.join(', ')}
                      </div>
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div>
                     <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg mb-4">
                      <span className="material-symbols-outlined text-gray-500">description</span> Variasi Deskripsi YouTube
                    </h3>
                    <div className="space-y-4">
                      {result.metadata.descriptions.map((desc, i) => (
                        <div key={i} className="relative group">
                           <button onClick={() => copyToClipboard(desc)} className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded-md text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Copy</button>
                           <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm text-gray-700 whitespace-pre-wrap leading-relaxed select-all">
                             {desc}
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>
        </motion.div>
      )}

    </div>
  )
}
