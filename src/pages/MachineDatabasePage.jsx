import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getMachines, searchMachines, addMachine, deleteMachine,
  getMachineReplies, addMachineReply, updateMachineReply, deleteMachineReply
} from '../services/machineService'
import { extractFAQFromChat, extractKnowledgeFromImage, fileToBase64 } from '../services/geminiService'

// ── Machine Selector / Creator Component ──
function MachineSelector({ machines, selectedMachine, onSelect, onAddNew, loading }) {
  const [query, setQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [adding, setAdding] = useState(false)
  const inputRef = useRef(null)

  const filtered = machines.filter(m =>
    m.name.toLowerCase().includes(query.toLowerCase())
  )

  const handleAdd = async () => {
    if (!newName.trim()) return
    setAdding(true)
    try {
      const result = await onAddNew(newName, newDesc)
      setNewName('')
      setNewDesc('')
      setShowAddForm(false)
    } catch (err) {
      console.error(err)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Search / Select */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">search</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setShowDropdown(true) }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Cari atau pilih topik/mesin..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant bg-white text-[14px] text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-semibold bg-primary text-on-primary hover:bg-primary/90 shadow-sm transition-all active:scale-[0.97]"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Topik Baru
          </button>
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {showDropdown && query && filtered.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute z-20 w-full mt-1 bg-white border border-outline-variant rounded-lg shadow-lg max-h-48 overflow-y-auto custom-scrollbar"
            >
              {filtered.map(m => (
                <button
                  key={m.id}
                  onClick={() => { onSelect(m); setQuery(''); setShowDropdown(false) }}
                  className={`w-full text-left px-4 py-2.5 hover:bg-surface-container transition-colors flex items-center justify-between ${
                    selectedMachine?.id === m.id ? 'bg-primary/5 text-primary' : 'text-on-surface'
                  }`}
                >
                  <div>
                    <span className="text-[14px] font-medium">{m.name}</span>
                    {m.description && <p className="text-[11px] text-on-surface-variant">{m.description}</p>}
                  </div>
                  <span className="text-[11px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                    {m.machine_replies?.[0]?.count || 0} jawaban
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add New Machine Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-primary/5 border border-primary/15 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary text-[16px]">menu_book</span>
                <span className="text-[13px] font-semibold text-primary">Tambah Topik / Mesin Baru</span>
              </div>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Nama topik (contoh: Mesin Cutting / Info Perusahaan)"
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-[13px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
              <textarea
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Deskripsi singkat (opsional)"
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-[13px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-y min-h-[80px]"
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowAddForm(false)} className="px-3 py-1.5 text-[12px] font-medium text-on-surface-variant hover:text-on-surface rounded-md hover:bg-surface-container transition-colors">Batal</button>
                <button onClick={handleAdd} disabled={!newName.trim() || adding} className="px-4 py-1.5 text-[12px] font-semibold bg-primary text-on-primary rounded-md hover:bg-primary/90 disabled:opacity-50 transition-all">
                  {adding ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Machine chips */}
      {machines.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {machines.map(m => (
            <button
              key={m.id}
              onClick={() => onSelect(m)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${
                selectedMachine?.id === m.id
                  ? 'bg-primary text-on-primary border-primary shadow-sm'
                  : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">menu_book</span>
              {m.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Reply Card Component ──
function ReplyCard({ reply, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [question, setQuestion] = useState(reply.question)
  const [answer, setAnswer] = useState(reply.answer)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onEdit(reply.id, { question, answer })
      setEditing(false)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(reply.answer)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white border border-outline-variant/60 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
    >
      {editing ? (
        <div className="p-4 space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">Judul Informasi / Kata Kunci</label>
            <input value={question} onChange={e => setQuestion(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-outline-variant text-[13px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">Detail Informasi</label>
            <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-outline-variant text-[13px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none" />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setEditing(false); setQuestion(reply.question); setAnswer(reply.answer) }} className="px-3 py-1.5 text-[12px] font-medium text-on-surface-variant rounded-md hover:bg-surface-container transition-colors">Batal</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-1.5 text-[12px] font-semibold bg-primary text-on-primary rounded-md hover:bg-primary/90 disabled:opacity-50 transition-all">{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </div>
      ) : (
        <>
          {/* Question */}
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5 shrink-0">help</span>
              <p className="text-[13px] font-medium text-on-surface leading-relaxed">{reply.question}</p>
            </div>
          </div>
          {/* Answer */}
          <div className="px-4 pb-3">
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-3 ml-6">
              <p className="text-[13px] text-on-surface-variant leading-relaxed">{reply.answer}</p>
            </div>
          </div>
          {/* Actions */}
          <div className="px-4 pb-3 flex items-center justify-between ml-6">
            <div className="flex items-center gap-1 text-[11px] text-on-surface-variant/60">
              <span className="material-symbols-outlined text-[13px]">bar_chart</span>
              Digunakan {reply.usage_count || 0}x
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleCopy} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${copied ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-primary hover:bg-primary/5'}`}>
                <span className="material-symbols-outlined text-[13px]">{copied ? 'check' : 'content_copy'}</span>
                {copied ? 'Tersalin' : 'Salin'}
              </button>
              <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors">
                <span className="material-symbols-outlined text-[13px]">edit</span>Edit
              </button>
              <button onClick={() => onDelete(reply.id)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-on-surface-variant hover:text-error hover:bg-error/5 transition-colors">
                <span className="material-symbols-outlined text-[13px]">delete</span>Hapus
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}

// ── Main Page ──
export default function MachineDatabasePage() {
  const [machines, setMachines] = useState([])
  const [selectedMachine, setSelectedMachine] = useState(null)
  const [replies, setReplies] = useState([])
  const [searchReply, setSearchReply] = useState('')
  const [loading, setLoading] = useState(true)
  const [repliesLoading, setRepliesLoading] = useState(false)

  // New reply form
  const [newQuestion, setNewQuestion] = useState('')
  const [newAnswer, setNewAnswer] = useState('')
  const [addingReply, setAddingReply] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)
  
  // WA Import State
  const [importingWA, setImportingWA] = useState(false)
  const fileInputRef = useRef(null)

  // Image Import State
  const [importingImage, setImportingImage] = useState(false)
  const imageInputRef = useRef(null)

  // Paste Text State
  const [showPasteModal, setShowPasteModal] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [importingPaste, setImportingPaste] = useState(false)

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    loadMachines()
  }, [])

  async function loadMachines() {
    try {
      const data = await getMachines()
      setMachines(data)
      if (data.length > 0 && !selectedMachine) {
        selectMachine(data[0])
      }
    } catch (err) {
      console.error('Gagal memuat mesin:', err)
    } finally {
      setLoading(false)
    }
  }

  async function selectMachine(machine) {
    setSelectedMachine(machine)
    setRepliesLoading(true)
    try {
      const data = await getMachineReplies(machine.id)
      setReplies(data)
      setSearchReply('')
    } catch (err) {
      console.error('Gagal memuat jawaban:', err)
    } finally {
      setRepliesLoading(false)
    }
  }

  async function handleAddMachine(name, desc) {
    const result = await addMachine(name, desc)
    await loadMachines()
    selectMachine(result.data)
    return result
  }

  async function handleAddReply() {
    if (!newQuestion.trim() || !newAnswer.trim() || !selectedMachine) return
    setAddingReply(true)
    try {
      await addMachineReply(selectedMachine.id, newQuestion, newAnswer)
      setNewQuestion('')
      setNewAnswer('')
      setShowReplyForm(false)
      const data = await getMachineReplies(selectedMachine.id)
      setReplies(data)
    } catch (err) {
      console.error('Gagal menambah jawaban:', err)
    } finally {
      setAddingReply(false)
    }
  }

  async function handleEditReply(id, updates) {
    await updateMachineReply(id, updates)
    const data = await getMachineReplies(selectedMachine.id)
    setReplies(data)
  }

  async function handleWAImport(e) {
    const file = e.target.files?.[0]
    if (!file || !selectedMachine) return
    
    setImportingWA(true)
    try {
      const text = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = reject
        reader.readAsText(file)
      })

      const extractedData = await extractFAQFromChat(text)
      
      for (const item of extractedData) {
        if (item.question && item.answer) {
          await addMachineReply(selectedMachine.id, item.question, item.answer)
        }
      }
      
      const updatedData = await getMachineReplies(selectedMachine.id)
      setReplies(updatedData)
      alert(`Berhasil mengimpor ${extractedData.length} informasi baru dari histori WhatsApp!`)
    } catch (err) {
      console.error(err)
      alert("Gagal mengimpor WhatsApp: " + err.message)
    } finally {
      setImportingWA(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleImageImport(e) {
    const file = e.target.files?.[0]
    if (!file || !selectedMachine) return

    setImportingImage(true)
    try {
      const { base64, mimeType } = await fileToBase64(file)
      const extractedData = await extractKnowledgeFromImage(base64, mimeType)

      let savedCount = 0
      for (const item of extractedData) {
        if (item.question && item.answer) {
          await addMachineReply(selectedMachine.id, item.question, item.answer)
          savedCount++
        }
      }

      const updatedData = await getMachineReplies(selectedMachine.id)
      setReplies(updatedData)
      alert(`Berhasil mengekstrak ${savedCount} informasi dari gambar!`)
    } catch (err) {
      console.error(err)
      alert("Gagal menganalisis gambar: " + err.message)
    } finally {
      setImportingImage(false)
      if (imageInputRef.current) imageInputRef.current.value = ''
    }
  }

  async function handlePasteImport() {
    if (!pasteText.trim() || !selectedMachine) return
    
    setImportingPaste(true)
    try {
      const extractedData = await extractFAQFromChat(pasteText)
      
      let savedCount = 0
      for (const item of extractedData) {
        if (item.question && item.answer) {
          await addMachineReply(selectedMachine.id, item.question, item.answer)
          savedCount++
        }
      }
      
      const updatedData = await getMachineReplies(selectedMachine.id)
      setReplies(updatedData)
      setShowPasteModal(false)
      setPasteText('')
      alert(`Berhasil mengekstrak ${savedCount} informasi dari teks yang di-paste!`)
    } catch (err) {
      console.error(err)
      alert("Gagal menganalisis teks: " + err.message)
    } finally {
      setImportingPaste(false)
    }
  }

  async function handleDeleteReply(id) {
    await deleteMachineReply(id)
    const data = await getMachineReplies(selectedMachine.id)
    setReplies(data)
  }

  async function handleDeleteMachine(id) {
    await deleteMachine(id)
    setSelectedMachine(null)
    setReplies([])
    setDeleteConfirm(null)
    await loadMachines()
  }

  return (
    <>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="font-display-lg text-display-lg text-on-surface mb-1">Database Pengetahuan</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
            Kelola template jawaban, spesifikasi mesin, dan informasi perusahaan. Data ini digunakan AI untuk memberikan rekomendasi balasan yang lebih akurat.
          </p>
        </div>
      </motion.div>

      {/* Machine Selector */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
        className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
          <h2 className="text-[16px] font-semibold text-on-surface">Pilih Topik / Mesin</h2>
        </div>
        <MachineSelector
          machines={machines}
          selectedMachine={selectedMachine}
          onSelect={selectMachine}
          onAddNew={handleAddMachine}
          loading={loading}
        />
      </motion.div>

      {/* Selected Machine Content */}
      {selectedMachine && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden"
        >
          {/* Machine Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/50 bg-surface-container-low/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-[20px]">menu_book</span>
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-on-surface">{selectedMachine.name}</h3>
                {selectedMachine.description && (
                  <p className="text-[12px] text-on-surface-variant">{selectedMachine.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full">
                {replies.length} informasi
              </span>
              <button
                onClick={() => setDeleteConfirm(selectedMachine.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/5 transition-colors"
                title="Hapus Topik"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          </div>

          {/* Add Reply Button + Form */}
          <div className="px-5 py-4 border-b border-outline-variant/30">
            {!showReplyForm ? (
              <div className="flex gap-3 flex-col sm:flex-row">
                <button
                  onClick={() => setShowReplyForm(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary transition-all text-[13px] font-medium"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  Tambah Manual
                </button>
                <input 
                  type="file" 
                  accept=".txt" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleWAImport}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importingWA}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-[#25D366] hover:bg-[#25D366]/5 text-[#25D366] transition-all text-[13px] font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">forum</span>
                  {importingWA ? 'Menganalisis Chat WA...' : 'Import dari Histori WhatsApp (.txt)'}
                </button>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={imageInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleImageImport}
                />
                <button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={importingImage}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-[#4285F4] hover:bg-[#4285F4]/5 text-[#4285F4] transition-all text-[13px] font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">image_search</span>
                  {importingImage ? 'Menganalisis Gambar...' : 'Import dari Gambar / Screenshot'}
                </button>
                <button
                  onClick={() => setShowPasteModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-[#EE4D2D] hover:bg-[#EE4D2D]/5 text-[#EE4D2D] transition-all text-[13px] font-medium shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">content_paste</span>
                  Paste Teks (Shopee/Lainnya)
                </button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-primary text-[16px]">add_circle</span>
                  <span className="text-[13px] font-semibold text-primary">Informasi Baru</span>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">Judul Informasi / Kata Kunci</label>
                  <input
                    value={newQuestion}
                    onChange={e => setNewQuestion(e.target.value)}
                    placeholder='Contoh: "Alamat Kantor" atau "Dimensi Mesin"'
                    className="w-full px-3 py-2.5 rounded-lg border border-outline-variant text-[13px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">Detail Informasi</label>
                  <textarea
                    value={newAnswer}
                    onChange={e => setNewAnswer(e.target.value)}
                    rows={3}
                    placeholder="Tulis detail informasi yang lengkap (misal: alamat lengkap, spesifikasi, kebijakan, dll)..."
                    className="w-full px-3 py-2.5 rounded-lg border border-outline-variant text-[13px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-y min-h-[80px]"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => { setShowReplyForm(false); setNewQuestion(''); setNewAnswer('') }} className="px-3 py-1.5 text-[12px] font-medium text-on-surface-variant rounded-md hover:bg-surface-container transition-colors">Batal</button>
                  <button onClick={handleAddReply} disabled={!newQuestion.trim() || !newAnswer.trim() || addingReply} className="px-4 py-2 text-[12px] font-semibold bg-primary text-on-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm">
                    {addingReply ? 'Menyimpan...' : 'Simpan Informasi'}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Search Replies Bar */}
          {replies.length > 0 && (
            <div className="px-5 pb-4">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">search</span>
                <input
                  type="text"
                  value={searchReply}
                  onChange={e => setSearchReply(e.target.value)}
                  placeholder="Cari informasi dalam topik ini..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-[13px] text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 focus:bg-white transition-all shadow-sm"
                />
              </div>
            </div>
          )}

          {/* Replies List */}
          <div className="px-5 pb-5">
            {repliesLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2].map(i => (
                  <div key={i} className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30">
                    <div className="w-2/3 h-3.5 rounded bg-surface-container-high mb-3" />
                    <div className="bg-surface-container rounded-lg p-3"><div className="w-full h-3 rounded bg-surface-container-high mb-2" /><div className="w-3/4 h-3 rounded bg-surface-container-high" /></div>
                  </div>
                ))}
              </div>
            ) : replies.length > 0 ? (
              <div className="space-y-3">
                <AnimatePresence>
                  {replies
                    .filter(r => r.question.toLowerCase().includes(searchReply.toLowerCase()) || r.answer.toLowerCase().includes(searchReply.toLowerCase()))
                    .map(reply => (
                    <ReplyCard key={reply.id} reply={reply} onEdit={handleEditReply} onDelete={handleDeleteReply} />
                  ))}
                  {searchReply && replies.filter(r => r.question.toLowerCase().includes(searchReply.toLowerCase()) || r.answer.toLowerCase().includes(searchReply.toLowerCase())).length === 0 && (
                    <div className="text-center py-6 text-[13px] text-on-surface-variant bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
                      Tidak ada informasi yang cocok dengan pencarian "{searchReply}".
                    </div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-outline">chat_add_on</span>
                </div>
                <h3 className="text-[15px] font-semibold text-on-surface mb-1">Belum Ada Informasi</h3>
                <p className="text-[13px] text-on-surface-variant max-w-xs mx-auto">
                  Tambahkan pertanyaan umum dan jawaban untuk topik ini agar AI bisa memberikan rekomendasi lebih akurat.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Empty State - No Machines */}
      {!loading && machines.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-outline-variant rounded-xl p-12 text-center shadow-sm"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-4xl text-primary">menu_book</span>
          </div>
          <h3 className="text-[18px] font-bold text-on-surface mb-2">Mulai Database Pengetahuan Anda</h3>
          <p className="text-[14px] text-on-surface-variant max-w-md mx-auto mb-6">
            Tambahkan topik informasi atau mesin pertama Anda. AI akan menggunakan data ini untuk rekomendasi yang lebih akurat.
          </p>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center"><span className="material-symbols-outlined text-error">warning</span></div>
                <h3 className="text-[16px] font-bold text-on-surface">Hapus Topik?</h3>
              </div>
              <p className="text-[13px] text-on-surface-variant mb-6">Semua informasi dan template jawaban untuk topik ini juga akan dihapus. Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-[13px] font-medium text-on-surface-variant rounded-lg hover:bg-surface-container transition-colors">Batal</button>
                <button onClick={() => handleDeleteMachine(deleteConfirm)} className="px-4 py-2 text-[13px] font-semibold bg-error text-on-error rounded-lg hover:bg-error/90 transition-all">Hapus Topik</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paste Text Modal */}
      <AnimatePresence>
        {showPasteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => !importingPaste && setShowPasteModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#EE4D2D]/10 flex items-center justify-center"><span className="material-symbols-outlined text-[#EE4D2D]">content_paste</span></div>
                  <h3 className="text-[16px] font-bold text-on-surface">Paste Teks Chat (Shopee / WA)</h3>
                </div>
                <button onClick={() => !importingPaste && setShowPasteModal(false)} className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
              </div>
              <p className="text-[13px] text-on-surface-variant mb-4">
                Blok (Select All) dan Salin (Copy) histori chat Anda dari Shopee Web, lalu Paste (Tempel) di kotak bawah ini. AI akan otomatis mengekstrak harga, spesifikasi, dan pertanyaan pelanggan.
              </p>
              <textarea
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                placeholder="Paste (Ctrl+V) teks chat Shopee atau WhatsApp Anda di sini..."
                className="w-full h-64 p-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-[13px] focus:outline-none focus:border-[#EE4D2D] focus:ring-1 focus:ring-[#EE4D2D]/30 resize-none font-mono"
                disabled={importingPaste}
              />
              <div className="flex gap-3 justify-end mt-4">
                <button onClick={() => setShowPasteModal(false)} disabled={importingPaste} className="px-4 py-2.5 text-[13px] font-medium text-on-surface-variant rounded-lg hover:bg-surface-container transition-colors disabled:opacity-50">Batal</button>
                <button onClick={handlePasteImport} disabled={!pasteText.trim() || importingPaste} className="flex items-center gap-2 px-6 py-2.5 text-[13px] font-semibold bg-[#EE4D2D] text-white rounded-lg hover:bg-[#EE4D2D]/90 transition-all disabled:opacity-50 shadow-sm">
                  {importingPaste ? (
                    <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Menganalisis...</>
                  ) : (
                    <><span className="material-symbols-outlined text-[18px]">auto_awesome</span> Ekstrak AI</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
