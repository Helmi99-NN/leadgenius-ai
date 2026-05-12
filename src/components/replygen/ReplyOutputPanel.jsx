import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const tabs = [
  { id: 'hard', label: 'Penjualan Agresif' },
  { id: 'soft', label: 'Penjualan Halus' },
  { id: 'authority', label: 'Otoritas' },
  { id: 'scarcity', label: 'Kelangkaan' },
]

const repliesByTab = {
  hard: [
    {
      text: 'Halo Budi! Kebetulan banget stok Macbook ini tinggal sisa 2 unit lagi lho. Kalo kamu transfer hari ini sebelum jam 3 sore, aku bisa kasih free ongkir ke seluruh Indonesia. Jangan sampai kehabisan ya!',
      highlighted: true,
    },
    {
      text: 'Halo Budi! Ini best deal banget. Harga promo ini cuma berlaku sampai besok aja. Yuk langsung checkout sekarang sebelum harganya naik lagi. Mumpung barangnya masih ready nih!',
      highlighted: false,
    },
    {
      text: 'Halo Budi! Langsung deal ya. Transfer sekarang, barangnya langsung kita proses kirim hari ini juga pake kilat. Spesifikasi gahar harga bersahabat, kapan lagi coba?',
      highlighted: false,
    },
  ],
  soft: [
    {
      text: 'Halo Budi! Terima kasih sudah tertarik dengan Macbook kami. Kalau ada pertanyaan tentang spesifikasi atau perbandingan model, saya siap bantu. Kamu bisa cek reviewnya juga dari pelanggan kami yang sudah puas ya.',
      highlighted: true,
    },
    {
      text: 'Hai Budi, Macbook ini memang pilihan tepat untuk kebutuhan kerja dan kreativitas. Kalau mau, saya bisa kirim detail perbandingan dengan model lain biar kamu makin yakin. Santai aja, kapanpun siap order tinggal kabari!',
      highlighted: false,
    },
    {
      text: 'Halo Budi! Saya paham milih gadget itu perlu pertimbangan. Aku kasih info lengkap ya: garansi resmi 1 tahun, bisa COD, dan ada program cicilan 0% juga. Kalau ada yang mau ditanya, langsung chat aja ya!',
      highlighted: false,
    },
  ],
  authority: [
    {
      text: 'Halo Budi! Sebagai seller bersertifikat Apple Authorized Reseller, kami menjamin keaslian dan garansi resmi 100%. Sudah 5.000+ unit Macbook terjual dengan rating 4.9/5. Anda berada di tangan yang tepat!',
      highlighted: true,
    },
    {
      text: 'Hai Budi, toko kami sudah berpengalaman 8 tahun di bidang Apple products dan merupakan Top Seller Platinum. Setiap unit dilengkapi sertifikat keaslian dan garansi internasional. Kualitas kami sudah teruji.',
      highlighted: false,
    },
    {
      text: 'Halo Budi! Unit Macbook kami langsung dari distributor resmi. Kami sudah dipercaya oleh 200+ perusahaan untuk pengadaan IT mereka. Dijamin produk ori, packaging rapi, dan pengiriman aman bergaransi.',
      highlighted: false,
    },
  ],
  scarcity: [
    {
      text: 'Halo Budi! URGENT: Stok Macbook model ini tinggal 2 unit terakhir di seluruh Indonesia. Harga ini tidak akan bertahan lama karena ada kenaikan harga dari distributor minggu depan. Amankan sekarang!',
      highlighted: true,
    },
    {
      text: 'Hai Budi! FYI, model ini sudah dihentikan produksinya dan stok kami adalah batch terakhir. Sudah ada 5 orang yang nanya hari ini. Siapa cepat dia dapat ya. Mau saya hold-kan 1 unit untuk kamu?',
      highlighted: false,
    },
    {
      text: 'Halo Budi! Flash Sale 24 jam terakhir! Diskon 15% untuk Macbook ini hanya berlaku hari ini sampai jam 23:59. Setelah itu harga kembali normal. Jangan lewatkan kesempatan langka ini!',
      highlighted: false,
    },
  ],
}

const tabLabels = {
  hard: 'Hard Selling',
  soft: 'Soft Selling',
  authority: 'Otoritas',
  scarcity: 'Kelangkaan',
}

export default function ReplyOutputPanel({ activeTab, onTabChange }) {
  const [copiedIdx, setCopiedIdx] = useState(null)

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const replies = repliesByTab[activeTab] || repliesByTab.hard

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-surface-container-lowest rounded-lg border border-outline-variant p-gutter shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex-1 flex flex-col"
    >
      {/* Tab Gaya */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-outline-variant pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 font-label-md text-label-md transition-colors ${
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary -mb-[10px]'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Header Hasil */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline-md text-headline-md font-bold text-on-background">
          Hasil ({tabLabels[activeTab]})
        </h3>
        <button className="text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1 hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-sm">refresh</span>
          Regenerate
        </button>
      </div>

      {/* Daftar Opsi Balasan */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
          className="space-y-4 flex-1"
        >
          {replies.map((reply, idx) => (
            <div
              key={idx}
              className="border border-outline-variant rounded-lg p-4 bg-surface-bright relative group hover:border-primary transition-colors"
            >
              {/* Aksen kiri untuk opsi pertama */}
              {reply.highlighted && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary-fixed rounded-l-lg" />
              )}

              <p
                className={`font-body-md text-body-md text-on-background mb-4 ${
                  reply.highlighted ? 'pl-2' : ''
                }`}
              >
                {reply.text}
              </p>

              {/* Tombol aksi hover */}
              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="px-3 py-1.5 border border-outline-variant text-primary font-label-sm text-label-sm rounded hover:bg-surface-variant flex items-center gap-1 transition-colors">
                  <span className="material-symbols-outlined text-sm">edit</span>
                  Edit
                </button>
                <button
                  onClick={() => handleCopy(reply.text, idx)}
                  className={`px-3 py-1.5 font-label-sm text-label-sm rounded flex items-center gap-1 transition-colors ${
                    copiedIdx === idx
                      ? 'bg-primary text-on-primary'
                      : 'bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {copiedIdx === idx ? 'check' : 'content_copy'}
                  </span>
                  {copiedIdx === idx ? 'Tersalin!' : 'Salin'}
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Simpan Template */}
      <div className="mt-6 flex justify-end">
        <button className="text-primary font-label-md text-label-md font-medium hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined">save</span>
          Simpan sebagai Template
        </button>
      </div>
    </motion.div>
  )
}
