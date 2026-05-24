import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getCompetitors } from '../services/competitorService'

import { addCompetitor } from '../services/competitorService'

const threatColors = {
  high: { bg: 'bg-error-container', text: 'text-on-error-container', label: 'Tinggi' },
  medium: { bg: 'bg-secondary-container', text: 'text-on-secondary-container', label: 'Sedang' },
  low: { bg: 'bg-surface-container-high', text: 'text-on-surface-variant', label: 'Rendah' },
}

export default function CompetitorPage() {
  const [competitors, setCompetitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newCompetitor, setNewCompetitor] = useState({ name: '', platform: 'Shopee', products: 0, followers: '0' })

  // Derived state for dynamic price alerts
  const dynamicPriceAlerts = competitors
    .filter(c => c.priceChange < 0)
    .map(c => ({
      competitor: c.name,
      product: 'Semua Produk (Rata-rata)',
      oldPrice: 'Harga Lama', // Simplified for MVP
      newPrice: c.avgPrice,
      change: c.priceChange,
      time: 'Baru saja' // Simplified for MVP
    }))

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getCompetitors()
        setCompetitors(data.map((c) => ({
          ...c,
          avgPrice: c.avg_price,
          priceChange: c.price_change,
          responseTime: c.response_time,
        })))
      } catch (err) {
        console.error('Gagal memuat kompetitor:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-stack-md"
      >
        <div>
          <h1 className="font-display-lg text-display-lg text-on-surface mb-unit">
            Pemantauan Kompetitor
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Pantau pergerakan harga dan strategi kompetitor di marketplace.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md flex items-center gap-2 hover:opacity-90 transition-opacity border border-black/10"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah Kompetitor
        </button>
      </motion.div>

      {/* Grid Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Kolom Kiri: Ringkasan + Alert Harga */}
        <div className="lg:col-span-4 space-y-gutter">
          {/* Ringkasan Pasar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white border border-outline-variant rounded-xl p-gutter shadow-sm border-t-4 border-t-primary"
          >
            <div className="flex items-center gap-stack-sm mb-stack-md">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                insights
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface">Ringkasan Pasar</h2>
            </div>

            <div className="space-y-stack-md">
              <div className="bg-surface-container-low rounded-lg p-stack-md border border-outline-variant">
                <div className="flex justify-between items-center mb-unit">
                  <span className="font-label-md text-label-md text-on-surface">Posisi Harga Anda</span>
                </div>
                <div className="font-headline-lg text-headline-lg text-primary">
                  #2 <span className="text-body-md text-on-surface-variant">dari 5</span>
                </div>
                <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                  Harga Anda 5% lebih tinggi dari rata-rata
                </p>
              </div>

              <div className="bg-surface-container-low rounded-lg p-stack-md border border-outline-variant">
                <div className="flex justify-between items-center mb-unit">
                  <span className="font-label-md text-label-md text-on-surface">Kompetitor Aktif</span>
                  <span className="font-label-sm text-label-sm text-error flex items-center">
                    <span className="material-symbols-outlined text-[14px]">arrow_upward</span> +1 baru
                  </span>
                </div>
                <div className="font-headline-lg text-headline-lg text-on-surface">4</div>
              </div>

              <div className="bg-error-container/30 rounded-lg p-stack-md border border-error/20">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-error text-sm">warning</span>
                  <span className="font-label-md text-label-md text-error">Peringatan</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                  2 kompetitor menurunkan harga dalam 24 jam terakhir. Tinjau strategi Anda.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Alert Perubahan Harga */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white border border-outline-variant rounded-xl p-gutter shadow-sm"
          >
            <h3 className="font-headline-md text-headline-md text-on-surface mb-stack-md flex items-center gap-stack-sm">
              <span className="material-symbols-outlined text-error">notifications_active</span>
              Alert Harga Terbaru
            </h3>

            <div className="space-y-stack-md">
              {dynamicPriceAlerts.length > 0 ? dynamicPriceAlerts.map((alert, idx) => (
                <div key={idx} className="bg-surface-container-low rounded-lg p-stack-md border border-outline-variant">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">{alert.product}</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">{alert.competitor}</p>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">{alert.time}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-body-md text-body-md text-on-surface-variant line-through text-sm">{alert.oldPrice}</span>
                    <span className="material-symbols-outlined text-error text-sm">arrow_forward</span>
                    <span className="font-label-md text-label-md text-error">{alert.newPrice}</span>
                    <span className="font-label-sm text-label-sm text-error bg-error-container px-1.5 py-0.5 rounded ml-auto">
                      {alert.change}%
                    </span>
                  </div>
                </div>
              )) : (
                <p className="text-label-md text-on-surface-variant">Tidak ada peringatan harga saat ini.</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Kolom Kanan: Daftar Kompetitor */}
        <div className="lg:col-span-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden"
          >
            <div className="p-gutter border-b border-outline-variant">
              <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-stack-sm">
                <span className="material-symbols-outlined text-primary">monitoring</span>
                Daftar Kompetitor
              </h3>
            </div>

            {/* Tabel Kompetitor */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="text-left font-label-sm text-label-sm text-on-surface-variant px-gutter py-3 uppercase tracking-wider">Toko</th>
                    <th className="text-left font-label-sm text-label-sm text-on-surface-variant px-4 py-3 uppercase tracking-wider">Platform</th>
                    <th className="text-center font-label-sm text-label-sm text-on-surface-variant px-4 py-3 uppercase tracking-wider">Rating</th>
                    <th className="text-center font-label-sm text-label-sm text-on-surface-variant px-4 py-3 uppercase tracking-wider">Produk</th>
                    <th className="text-right font-label-sm text-label-sm text-on-surface-variant px-4 py-3 uppercase tracking-wider">Harga Rata²</th>
                    <th className="text-center font-label-sm text-label-sm text-on-surface-variant px-4 py-3 uppercase tracking-wider">Δ Harga</th>
                    <th className="text-center font-label-sm text-label-sm text-on-surface-variant px-4 py-3 uppercase tracking-wider">Ancaman</th>
                    <th className="text-center font-label-sm text-label-sm text-on-surface-variant px-gutter py-3 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {competitors.map((comp, idx) => {
                    const threat = threatColors[comp.threat]
                    return (
                      <motion.tr
                        key={comp.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 + 0.2 }}
                        className="hover:bg-surface-container-low transition-colors"
                      >
                        <td className="px-gutter py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm shrink-0">
                              {comp.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-label-md text-label-md text-on-surface">{comp.name}</p>
                              <p className="font-label-sm text-label-sm text-on-surface-variant">{comp.followers} pengikut</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-2 py-1 rounded">
                            {comp.platform}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-label-md text-label-md text-on-surface flex items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            {comp.rating}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center font-label-md text-label-md text-on-surface">{comp.products}</td>
                        <td className="px-4 py-4 text-right font-label-md text-label-md text-on-surface">{comp.avgPrice}</td>
                        <td className="px-4 py-4 text-center">
                          {comp.priceChange !== 0 ? (
                            <span className={`font-label-sm text-label-sm ${comp.priceChange < 0 ? 'text-error' : 'text-primary'}`}>
                              {comp.priceChange > 0 ? '+' : ''}{comp.priceChange}%
                            </span>
                          ) : (
                            <span className="font-label-sm text-label-sm text-on-surface-variant">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`font-label-sm text-label-sm px-2 py-1 rounded-full ${threat.bg} ${threat.text}`}>
                            {threat.label}
                          </span>
                        </td>
                        <td className="px-gutter py-4 text-center">
                          <button className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-highest rounded transition-colors">
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal Tambah Kompetitor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface w-full max-w-md rounded-xl shadow-lg border border-outline-variant overflow-hidden"
          >
            <div className="p-gutter border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-headline-md text-[18px] font-bold text-on-surface">Tambah Kompetitor</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-gutter space-y-4">
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">Nama Toko</label>
                <input
                  type="text"
                  value={newCompetitor.name}
                  onChange={(e) => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
                  className="w-full bg-surface-bright border border-outline-variant rounded-md py-2 px-3 text-body-md focus:border-primary focus:outline-none"
                  placeholder="Contoh: TechCorp Store"
                />
              </div>
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">Platform</label>
                <select
                  value={newCompetitor.platform}
                  onChange={(e) => setNewCompetitor({ ...newCompetitor, platform: e.target.value })}
                  className="w-full bg-surface-bright border border-outline-variant rounded-md py-2 px-3 text-body-md focus:border-primary focus:outline-none"
                >
                  <option value="Shopee">Shopee</option>
                  <option value="Tokopedia">Tokopedia</option>
                  <option value="Lazada">Lazada</option>
                  <option value="Tiktok">Tiktok</option>
                </select>
              </div>
            </div>
            <div className="p-gutter border-t border-outline-variant flex justify-end gap-2 bg-surface-container-lowest">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-outline text-on-surface rounded-lg hover:bg-surface-container transition-colors font-label-md text-label-md"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  try {
                    const inserted = await addCompetitor({
                      name: newCompetitor.name,
                      platform: newCompetitor.platform,
                      products: 0,
                      followers: '0',
                      avg_price: 'Rp 0',
                      price_change: 0,
                      response_time: '-',
                      rating: 0,
                      threat: 'low'
                    });
                    
                    setCompetitors([
                      {
                        ...inserted,
                        avgPrice: inserted.avg_price,
                        priceChange: inserted.price_change,
                        responseTime: inserted.response_time
                      }, 
                      ...competitors
                    ]);
                    setIsModalOpen(false);
                    setNewCompetitor({ name: '', platform: 'Shopee', products: 0, followers: '0' });
                  } catch (err) {
                    console.error('Gagal tambah kompetitor', err);
                    alert('Gagal menambah kompetitor');
                  }
                }}
                disabled={!newCompetitor.name}
                className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity font-label-md text-label-md disabled:opacity-50"
              >
                Simpan Kompetitor
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
