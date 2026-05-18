import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getMachines, searchMachines, addMachine, deleteMachine,
  getMachineReplies, addMachineReply, updateMachineReply, deleteMachineReply
} from '../services/machineService'

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
              placeholder="Cari atau pilih mesin..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant bg-white text-[14px] text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-semibold bg-primary text-on-primary hover:bg-primary/90 shadow-sm transition-all active:scale-[0.97]"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Mesin Baru
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
                <span className="material-symbols-outlined text-primary text-[16px]">precision_manufacturing</span>
                <span className="text-[13px] font-semibold text-primary">Tambah Mesin Baru</span>
              </div>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Nama mesin (contoh: Mesin Cutting Fiber)"
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-[13px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
              <input
                type="text"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Deskripsi singkat (opsional)"
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-[13px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
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
              <span className="material-symbols-outlined text-[14px]">precision_manufacturing</span>
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
            <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">Pertanyaan</label>
            <input value={question} onChange={e => setQuestion(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-outline-variant text-[13px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">Jawaban</label>
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
  const [loading, setLoading] = useState(true)
  const [repliesLoading, setRepliesLoading] = useState(false)

  // New reply form
  const [newQuestion, setNewQuestion] = useState('')
  const [newAnswer, setNewAnswer] = useState('')
  const [addingReply, setAddingReply] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)

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
          <h1 className="font-display-lg text-display-lg text-on-surface mb-1">Database Jawaban Mesin</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
            Kelola template jawaban untuk setiap mesin. Data ini digunakan AI untuk memberikan rekomendasi balasan yang lebih akurat.
          </p>
        </div>
      </motion.div>

      {/* Machine Selector */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
        className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>precision_manufacturing</span>
          <h2 className="text-[16px] font-semibold text-on-surface">Pilih Mesin</h2>
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
                <span className="material-symbols-outlined text-on-primary text-[20px]">precision_manufacturing</span>
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
                {replies.length} jawaban
              </span>
              <button
                onClick={() => setDeleteConfirm(selectedMachine.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/5 transition-colors"
                title="Hapus Mesin"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          </div>

          {/* Add Reply Button + Form */}
          <div className="px-5 py-4 border-b border-outline-variant/30">
            {!showReplyForm ? (
              <button
                onClick={() => setShowReplyForm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary transition-all text-[13px] font-medium"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                Tambah Jawaban Baru
              </button>
            ) : (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-primary text-[16px]">add_circle</span>
                  <span className="text-[13px] font-semibold text-primary">Jawaban Baru</span>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">Pertanyaan Pelanggan</label>
                  <input
                    value={newQuestion}
                    onChange={e => setNewQuestion(e.target.value)}
                    placeholder='Contoh: "Berapa harga mesin ini?"'
                    className="w-full px-3 py-2.5 rounded-lg border border-outline-variant text-[13px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">Template Jawaban</label>
                  <textarea
                    value={newAnswer}
                    onChange={e => setNewAnswer(e.target.value)}
                    rows={3}
                    placeholder="Tulis template jawaban yang akan digunakan untuk merespon pelanggan..."
                    className="w-full px-3 py-2.5 rounded-lg border border-outline-variant text-[13px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => { setShowReplyForm(false); setNewQuestion(''); setNewAnswer('') }} className="px-3 py-1.5 text-[12px] font-medium text-on-surface-variant rounded-md hover:bg-surface-container transition-colors">Batal</button>
                  <button onClick={handleAddReply} disabled={!newQuestion.trim() || !newAnswer.trim() || addingReply} className="px-4 py-2 text-[12px] font-semibold bg-primary text-on-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm">
                    {addingReply ? 'Menyimpan...' : 'Simpan Jawaban'}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Replies List */}
          <div className="p-5">
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
                  {replies.map(reply => (
                    <ReplyCard key={reply.id} reply={reply} onEdit={handleEditReply} onDelete={handleDeleteReply} />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-outline">chat_add_on</span>
                </div>
                <h3 className="text-[15px] font-semibold text-on-surface mb-1">Belum Ada Jawaban</h3>
                <p className="text-[13px] text-on-surface-variant max-w-xs mx-auto">
                  Tambahkan template jawaban untuk mesin ini agar AI bisa memberikan rekomendasi lebih akurat.
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
            <span className="material-symbols-outlined text-4xl text-primary">precision_manufacturing</span>
          </div>
          <h3 className="text-[18px] font-bold text-on-surface mb-2">Mulai Database Mesin Anda</h3>
          <p className="text-[14px] text-on-surface-variant max-w-md mx-auto mb-6">
            Tambahkan mesin pertama Anda dan isi dengan template jawaban. AI akan menggunakan data ini untuk rekomendasi yang lebih akurat.
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
                <h3 className="text-[16px] font-bold text-on-surface">Hapus Mesin?</h3>
              </div>
              <p className="text-[13px] text-on-surface-variant mb-6">Semua template jawaban untuk mesin ini juga akan dihapus. Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-[13px] font-medium text-on-surface-variant rounded-lg hover:bg-surface-container transition-colors">Batal</button>
                <button onClick={() => handleDeleteMachine(deleteConfirm)} className="px-4 py-2 text-[13px] font-semibold bg-error text-on-error rounded-lg hover:bg-error/90 transition-all">Hapus Mesin</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
