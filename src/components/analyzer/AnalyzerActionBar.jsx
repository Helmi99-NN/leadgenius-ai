export default function AnalyzerActionBar() {
  return (
    <div className="fixed bottom-0 right-0 w-full md:w-[calc(100%-16rem)] p-gutter bg-surface/90 backdrop-blur-xl border-t border-outline-variant flex justify-end gap-stack-md z-30">
      <button className="px-gutter py-stack-sm rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-highest transition-colors flex items-center gap-stack-sm">
        <span className="material-symbols-outlined text-sm">refresh</span>
        Hasilkan Lebih Banyak
      </button>
      <button className="px-gutter py-stack-sm rounded-lg font-label-md text-label-md text-primary border border-primary hover:bg-primary/10 transition-colors flex items-center gap-stack-sm">
        <span className="material-symbols-outlined text-sm">event</span>
        Atur Tindak Lanjut
      </button>
      <button className="px-gutter py-stack-sm rounded-lg font-label-md text-label-md text-on-primary bg-primary hover:bg-primary/90 transition-opacity shadow-sm flex items-center gap-stack-sm">
        <span className="material-symbols-outlined text-sm">bookmark_add</span>
        Simpan ke Prospek
      </button>
    </div>
  )
}
