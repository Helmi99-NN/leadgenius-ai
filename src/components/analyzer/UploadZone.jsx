import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function UploadZone({
  onAnalyze,
  isAnalyzing,
  hasResult,
  onReset,
  uploadedFiles,
  setUploadedFiles,
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [rawFiles, setRawFiles] = useState([]) // File objects untuk dikirim ke AI
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    handleFiles(files)
    // Reset input supaya bisa select file yang sama
    e.target.value = ''
  }

  const handleFiles = (files) => {
    const imageFiles = files.filter(
      (f) =>
        ['image/jpeg', 'image/png', 'image/webp'].includes(f.type) &&
        f.size <= 5 * 1024 * 1024
    )

    if (imageFiles.length === 0) return

    // Simpan raw file objects
    setRawFiles((prev) => [...prev, ...imageFiles])

    // Buat preview thumbnails
    imageFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedFiles((prev) => [
          ...prev,
          { url: e.target.result, name: file.name },
        ])
      }
      reader.readAsDataURL(file)
    })

    // AUTO-ANALISIS: langsung kirim ke AI begitu file masuk
    if (onAnalyze) {
      onAnalyze(imageFiles)
    }
  }

  const handleRemoveFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
    setRawFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAnalyzeClick = () => {
    if (rawFiles.length > 0 && onAnalyze) {
      onAnalyze(rawFiles)
    }
  }

  const handleResetClick = () => {
    setRawFiles([])
    setUploadedFiles([])
    if (onReset) onReset()
  }

  const hasFiles = uploadedFiles.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-surface border border-outline-variant rounded-xl p-gutter relative overflow-hidden group transition-all flex-shrink-0"
    >
      {/* Aksen Gradien AI */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary to-secondary" />

      {/* Area Drop */}
      {!hasResult && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[200px] ${
            isDragging
              ? 'border-primary bg-primary/10 scale-[1.02]'
              : isAnalyzing
                ? 'border-secondary bg-secondary/5 pointer-events-none'
                : 'border-outline-variant hover:border-primary hover:bg-primary/5'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isAnalyzing && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />

          {isAnalyzing ? (
            <>
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-stack-md">
                <div className="w-10 h-10 rounded-full border-3 border-secondary border-t-transparent animate-spin" />
              </div>
              <h3 className="font-headline-md text-headline-md text-secondary mb-unit">
                Menganalisis dengan AI...
              </h3>
              <p className="font-label-md text-label-md text-on-surface-variant">
                Gemini sedang membaca chat Anda
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-stack-md group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl text-primary">
                  upload_file
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-unit">
                Jatuhkan tangkapan layar chat
              </h3>
              <p className="font-label-md text-label-md text-on-surface-variant mb-stack-md">
                atau klik untuk mencari dari perangkat
              </p>
              <span className="font-label-sm text-label-sm text-outline bg-surface-container-highest px-3 py-1 rounded-full">
                Mendukung JPG, PNG (Maks 5MB)
              </span>
            </>
          )}
        </div>
      )}

      {/* Hasil Berhasil */}
      {hasResult && (
        <div className="border-2 border-primary/30 bg-primary/5 rounded-lg p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-stack-md">
            <span
              className="material-symbols-outlined text-3xl text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
          <h3 className="font-headline-md text-headline-md text-primary mb-unit">
            Analisis Selesai!
          </h3>
          <p className="font-label-md text-label-md text-on-surface-variant mb-stack-md">
            Hasil AI ditampilkan di panel samping
          </p>
          <button
            onClick={handleResetClick}
            className="px-4 py-2 rounded-lg text-primary border border-primary hover:bg-primary/10 font-label-md text-label-md transition-colors flex items-center gap-stack-sm"
          >
            <span className="material-symbols-outlined text-sm">
              restart_alt
            </span>
            Analisis Gambar Baru
          </button>
        </div>
      )}

      {/* Thumbnail yang diunggah + Tombol Aksi */}
      <div className="mt-stack-md">
        {/* Thumbnails */}
        <div className="flex gap-stack-sm overflow-x-auto pb-2">
          {uploadedFiles.map((thumb, idx) => (
            <div
              key={idx}
              className="w-16 h-16 rounded-lg bg-surface-container-highest border border-outline-variant shrink-0 relative overflow-hidden group/thumb"
            >
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-10 opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveFile(idx)
                  }}
                  className="w-6 h-6 rounded-full bg-error/80 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-white text-xs">
                    close
                  </span>
                </button>
              </div>
              <img
                src={thumb.url}
                alt={thumb.name}
                className="w-full h-full object-cover"
              />
            </div>
          ))}

          {/* Tombol tambah (hanya tampil jika belum ada hasil) */}
          {!hasResult && !isAnalyzing && (
            <div
              className="w-16 h-16 rounded-lg bg-surface-container-highest border border-outline-variant shrink-0 flex items-center justify-center border-dashed cursor-pointer hover:bg-surface-container-high text-outline"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
            >
              <span className="material-symbols-outlined text-sm">add</span>
            </div>
          )}
        </div>

        {/* Tombol Analisis AI */}
        <AnimatePresence>
          {hasFiles && !hasResult && !isAnalyzing && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
              onClick={handleAnalyzeClick}
              className="mt-stack-md w-full py-3 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-stack-sm shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
              Analisis dengan AI
            </motion.button>
          )}

          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-stack-md w-full py-3 rounded-lg bg-secondary/10 border border-secondary/30 text-secondary font-label-lg text-label-lg flex items-center justify-center gap-stack-sm"
            >
              <div className="w-5 h-5 rounded-full border-2 border-secondary border-t-transparent animate-spin" />
              Sedang memproses...
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
