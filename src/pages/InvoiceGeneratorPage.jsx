import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Helpers ───────────────────────────────────────────────────
const formatRupiah = (num) => {
  if (!num && num !== 0) return ''
  return 'Rp' + Number(num).toLocaleString('id-ID')
}

const todayISO = () => new Date().toISOString().split('T')[0]

const emptyItem = () => ({
  id: Date.now() + Math.random(),
  nama: '',
  spesifikasi: '',
  qty: 1,
  harga: 0,
})

const defaultKeterangan = [
  'Pengerjaan mesin setelah DP masuk ke Rekening BCA 0113582348 a/n CV.Asianindo.',
  'Harga diatas belum termasuk ongkos kirim ke lokasi',
  'Skema Pembayaran DP:',
  '- Dp awal 30%',
  '- Dp ke 2 senilai 40% setelah mesin siap di uji coba',
  '- Dp ke 3 (pelunasan) 30%, setelah mesin siap dikirim',
]

// ─── Color Palette (from branding) ─────────────────────────────
const COLORS = {
  navy: '#2E2067',
  navyLight: '#3D2D80',
  navyDark: '#1A1245',
  coral: '#E8845C',
  coralLight: '#F2A67D',
  purple: '#4A3590',
  purpleLight: '#6B52C4',
  cream: '#FAF8F5',
  gold: '#D4A843',
}

// ─── Main Component ────────────────────────────────────────────
export default function InvoiceGeneratorPage() {
  const [clientName, setClientName] = useState('')
  const [clientLocation, setClientLocation] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(todayISO())
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [items, setItems] = useState([emptyItem()])
  const [ongkirDesc, setOngkirDesc] = useState('')
  const [ongkirPrice, setOngkirPrice] = useState(0)
  const [ppnEnabled, setPpnEnabled] = useState(true)
  const [ppnPercent, setPpnPercent] = useState(11)
  const [keterangan, setKeterangan] = useState(defaultKeterangan.join('\n'))
  const [showPreview, setShowPreview] = useState(false)

  // ─── Calculations ──────────────────────────────────────────
  const subtotalBarang = items.reduce((s, it) => s + (it.qty * it.harga), 0)
  const ppnAmount = ppnEnabled ? Math.round(subtotalBarang * ppnPercent / 100) : 0
  const grandTotal = subtotalBarang + Number(ongkirPrice || 0) + ppnAmount

  // ─── Item CRUD ─────────────────────────────────────────────
  const addItem = () => setItems(prev => [...prev, emptyItem()])
  const removeItem = (id) => setItems(prev => prev.filter(it => it.id !== id))
  const updateItem = (id, field, value) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, [field]: value } : it))
  }

  // ─── Date formatting ──────────────────────────────────────
  const formattedDate = (() => {
    const d = new Date(invoiceDate + 'T00:00:00')
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
  })()

  const handlePrint = () => window.print()

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
  }

  return (
    <div className="min-h-screen">
      {/* ═══════════ FORM AREA (hidden on print) ═══════════ */}
      <div className="invoice-form-area p-4 md:p-6 lg:p-8">
        {/* Page Header */}
        <motion.div {...fadeUp} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.purple})`, boxShadow: '0 8px 24px rgba(46,32,103,0.25)' }}>
              <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Generator Invoice</h1>
              <p className="text-sm text-gray-500">Buat invoice profesional dalam hitungan detik</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* ─── LEFT: Form Input ─────────────────────────── */}
          <motion.div {...fadeUp} transition={{ delay: 0.1, duration: 0.4 }}>
            <div className="space-y-5">
              {/* Card: Info Pelanggan */}
              <FormCard icon="person" title="Informasi Pelanggan">
                <div className="space-y-4">
                  <FormField label="Nomor Invoice (Opsional)">
                    <input type="text" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="INV/2026/06/001" className="form-input" />
                  </FormField>
                  <FormField label="Kepada Yth.">
                    <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Contoh: Qahwa Coffee Roastery" className="form-input" />
                  </FormField>
                  <FormField label="Lokasi / Kota">
                    <input type="text" value={clientLocation} onChange={e => setClientLocation(e.target.value)} placeholder="Contoh: Makassar" className="form-input" />
                  </FormField>
                  <FormField label="Tanggal Invoice">
                    <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className="form-input" />
                  </FormField>
                </div>
              </FormCard>

              {/* Card: Daftar Barang */}
              <FormCard icon="inventory_2" title="Daftar Barang / Mesin" action={
                <button onClick={addItem} className="flex items-center gap-1 text-xs font-semibold text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-sm">add</span>Tambah
                </button>
              }>
                <div className="space-y-4">
                  <AnimatePresence>
                    {items.map((item, idx) => (
                      <motion.div key={item.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="relative rounded-xl p-4 border border-gray-100" style={{ backgroundColor: '#f8f7fc' }}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ color: COLORS.navy, backgroundColor: '#ede9fa' }}>Barang #{idx + 1}</span>
                          {items.length > 1 && (
                            <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 transition-colors">
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Nama Barang</label>
                            <input type="text" value={item.nama} onChange={e => updateItem(item.id, 'nama', e.target.value)} placeholder="Mesin Spray Dryer" className="form-input" />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Spesifikasi (satu per baris)</label>
                            <textarea value={item.spesifikasi} onChange={e => updateItem(item.id, 'spesifikasi', e.target.value)} placeholder={"Kapasitas 1 Liter/Proses\nPemanas Element\nDaya Heater 9.000 Watt"} rows={4} className="form-input resize-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
                            <input type="number" min="1" value={item.qty} onChange={e => updateItem(item.id, 'qty', parseInt(e.target.value) || 1)} className="form-input" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Harga Satuan (Rp)</label>
                            <input type="number" min="0" value={item.harga || ''} onChange={e => updateItem(item.id, 'harga', parseInt(e.target.value) || 0)} placeholder="30200000" className="form-input" />
                          </div>
                        </div>
                        {item.harga > 0 && (
                          <div className="mt-3 text-right text-sm font-semibold" style={{ color: COLORS.navy }}>
                            Total: {formatRupiah(item.qty * item.harga)}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </FormCard>

              {/* Card: Ongkir & PPN */}
              <FormCard icon="local_shipping" title="Ongkir & Pajak">
                <div className="space-y-4">
                  <FormField label="Deskripsi Ongkir">
                    <input type="text" value={ongkirDesc} onChange={e => setOngkirDesc(e.target.value)} placeholder="Ongkir Ke Pelabuhan Surabaya" className="form-input" />
                  </FormField>
                  <FormField label="Biaya Ongkir (Rp)">
                    <input type="number" min="0" value={ongkirPrice || ''} onChange={e => setOngkirPrice(parseInt(e.target.value) || 0)} placeholder="800000" className="form-input" />
                  </FormField>
                  <div className="flex items-center gap-3 rounded-xl p-4 border" style={{ backgroundColor: '#f8f7fc', borderColor: '#e8e4f5' }}>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={ppnEnabled} onChange={e => setPpnEnabled(e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ ['--tw-peer-checked-bg']: COLORS.navy }}></div>
                    </label>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-700">PPN {ppnPercent}%</p>
                      <p className="text-xs text-gray-500">Dihitung dari subtotal barang (tidak termasuk ongkir)</p>
                    </div>
                    {ppnEnabled && (
                      <input type="number" min="1" max="100" value={ppnPercent} onChange={e => setPpnPercent(parseInt(e.target.value) || 11)} className="w-16 px-2 py-1.5 border rounded-lg text-center text-sm font-semibold bg-white" style={{ color: COLORS.navy, borderColor: '#d4ceed' }} />
                    )}
                  </div>
                </div>
              </FormCard>

              {/* Card: Keterangan */}
              <FormCard icon="description" title="Keterangan">
                <textarea value={keterangan} onChange={e => setKeterangan(e.target.value)} rows={7} className="form-input resize-none leading-relaxed" />
              </FormCard>

              {/* Summary Card */}
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="rounded-2xl p-6 text-white shadow-xl" style={{ background: `linear-gradient(135deg, ${COLORS.navyDark}, ${COLORS.navy}, ${COLORS.purple})`, boxShadow: '0 12px 40px rgba(46,32,103,0.3)' }}>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: COLORS.coralLight }}>Ringkasan</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between"><span className="opacity-70">Subtotal Barang</span><span className="font-semibold">{formatRupiah(subtotalBarang)}</span></div>
                  {Number(ongkirPrice) > 0 && <div className="flex justify-between"><span className="opacity-70">Biaya Ongkir</span><span className="font-semibold">{formatRupiah(ongkirPrice)}</span></div>}
                  {ppnEnabled && <div className="flex justify-between"><span className="opacity-70">PPN {ppnPercent}%</span><span className="font-semibold">{formatRupiah(ppnAmount)}</span></div>}
                  <div className="border-t border-white/20 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold">GRAND TOTAL</span>
                      <span className="text-xl font-extrabold" style={{ color: COLORS.coralLight }}>{formatRupiah(grandTotal)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowPreview(!showPreview)} className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-semibold transition-all text-sm border border-white/10">
                    <span className="material-symbols-outlined text-lg">visibility</span>
                    {showPreview ? 'Sembunyikan' : 'Lihat'} Preview
                  </button>
                  <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all text-sm shadow-lg" style={{ backgroundColor: COLORS.coral, color: '#fff', boxShadow: `0 8px 24px ${COLORS.coral}50` }}>
                    <span className="material-symbols-outlined text-lg">print</span>
                    Cetak PDF
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* ─── RIGHT: Live Preview ──────────────────────── */}
          <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.4 }} className={`${showPreview ? 'block' : 'hidden'} xl:block`}>
            <div className="sticky top-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Live Preview</p>
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold transition-colors" style={{ color: COLORS.navy }}>
                  <span className="material-symbols-outlined text-sm">print</span>Cetak PDF
                </button>
              </div>
              <div className="rounded-2xl p-4 md:p-6 shadow-inner" style={{ backgroundColor: '#e8e5f0' }}>
                <InvoicePreview
                  clientName={clientName} clientLocation={clientLocation}
                  formattedDate={formattedDate} invoiceNumber={invoiceNumber}
                  items={items} ongkirDesc={ongkirDesc} ongkirPrice={ongkirPrice}
                  ppnEnabled={ppnEnabled} ppnPercent={ppnPercent} ppnAmount={ppnAmount}
                  subtotalBarang={subtotalBarang} grandTotal={grandTotal} keterangan={keterangan}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═══════════ PRINT-ONLY AREA ═══════════ */}
      <div className="invoice-print-area">
        <InvoicePreview
          clientName={clientName} clientLocation={clientLocation}
          formattedDate={formattedDate} invoiceNumber={invoiceNumber}
          items={items} ongkirDesc={ongkirDesc} ongkirPrice={ongkirPrice}
          ppnEnabled={ppnEnabled} ppnPercent={ppnPercent} ppnAmount={ppnAmount}
          subtotalBarang={subtotalBarang} grandTotal={grandTotal} keterangan={keterangan}
          isPrint
        />
      </div>
    </div>
  )
}

// ─── Reusable Form Card ─────────────────────────────────────────
function FormCard({ icon, title, action, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.purple})` }}>
        <h2 className="text-white font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">{icon}</span>{title}
        </h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MODERN INVOICE PREVIEW
// ═══════════════════════════════════════════════════════════════════
function InvoicePreview({
  clientName, clientLocation, formattedDate, invoiceNumber, items,
  ongkirDesc, ongkirPrice, ppnEnabled, ppnPercent, ppnAmount,
  subtotalBarang, grandTotal, keterangan, isPrint
}) {
  const s = isPrint ? 1 : 0.65
  const px = (v) => `${v * s}px`

  const containerStyle = isPrint ? {
    width: '100%',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: '#333',
    backgroundColor: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
  } : {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: '#333',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
    aspectRatio: '210/297',
    overflow: 'hidden',
    position: 'relative',
  }

  // Diamond shape helper
  const Diamond = ({ size, top, right, left, bottom, color, opacity = 1, zIdx = 1 }) => (
    <div style={{
      position: 'absolute',
      width: px(size), height: px(size),
      top: top !== undefined ? px(top) : undefined,
      right: right !== undefined ? px(right) : undefined,
      left: left !== undefined ? px(left) : undefined,
      bottom: bottom !== undefined ? px(bottom) : undefined,
      backgroundColor: color,
      opacity,
      transform: 'rotate(45deg)',
      zIndex: zIdx,
    }} />
  )

  return (
    <div className={isPrint ? 'invoice-paper-print' : ''} style={containerStyle}>

      {/* ── TOP-RIGHT GEOMETRIC DIAMONDS ── */}
      <Diamond size={160} top={-60} right={-30} color={COLORS.navy} opacity={0.9} zIdx={1} />
      <Diamond size={100} top={-35} right={30} color={COLORS.coral} opacity={0.85} zIdx={2} />
      <Diamond size={70} top={10} right={-10} color={COLORS.navy} opacity={0.5} zIdx={2} />
      <Diamond size={50} top={-10} right={80} color={COLORS.navy} opacity={0.3} zIdx={2} />
      <Diamond size={35} top={50} right={55} color={COLORS.coral} opacity={0.4} zIdx={2} />

      {/* ── BOTTOM-LEFT GEOMETRIC DIAMONDS ── */}
      <Diamond size={160} bottom={-60} left={-30} color={COLORS.navy} opacity={0.9} zIdx={1} />
      <Diamond size={100} bottom={-35} left={30} color={COLORS.coral} opacity={0.85} zIdx={2} />
      <Diamond size={70} bottom={10} left={-10} color={COLORS.navy} opacity={0.5} zIdx={2} />
      <Diamond size={50} bottom={-10} left={80} color={COLORS.navy} opacity={0.3} zIdx={2} />
      <Diamond size={35} bottom={50} left={55} color={COLORS.coral} opacity={0.4} zIdx={2} />

      {/* ── CONTENT ── */}
      <div style={{ position: 'relative', zIndex: 10, padding: `${px(35)} ${px(40)}`, display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* ══ HEADER ══ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo & Company Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: px(12) }}>
            <img src="/logo-asianindo-original.png" alt="Logo" style={{ height: px(60), width: px(60), objectFit: 'contain' }} />
            <div>
              <div style={{ fontSize: px(20), fontWeight: '800', color: COLORS.navy, lineHeight: 1.1 }}>CV. ASIANINDO</div>
              <div style={{ fontSize: px(8), color: '#888', marginTop: px(3), lineHeight: 1.4, maxWidth: px(180) }}>
                Workshop Mesin Pengolahan Makanan, Pertanian, dan Mesin Industri
              </div>
            </div>
          </div>
          {/* INVOICE Title */}
          <div style={{ fontSize: px(36), fontWeight: '900', color: COLORS.navy, letterSpacing: px(1) }}>INVOICE</div>
        </div>

        {/* ══ CLIENT INFO + DETAIL BOXES ══ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: px(28), alignItems: 'flex-start' }}>
          {/* Left: Invoice To */}
          <div>
            <div style={{ fontSize: px(11), fontWeight: '700', color: COLORS.navy, textTransform: 'uppercase', marginBottom: px(6) }}>Tagihan Kepada</div>
            <div style={{ fontSize: px(14), fontWeight: '800', color: '#222' }}>{clientName || '.....................'}</div>
            {clientLocation && (
              <div style={{ fontSize: px(9), color: '#666', marginTop: px(4), lineHeight: 1.5 }}>
                <span style={{ fontWeight: '700', color: '#555' }}>ALAMAT:</span> {clientLocation}
              </div>
            )}
          </div>

          {/* Right: 3 Info Boxes */}
          <div style={{ display: 'flex', textAlign: 'center' }}>
            {/* Total Due */}
            <div style={{ background: COLORS.navy, color: '#fff', padding: `${px(10)} ${px(14)}`, minWidth: px(100) }}>
              <div style={{ fontSize: px(8), fontWeight: '600', opacity: 0.85, marginBottom: px(4) }}>Total Tagihan</div>
              <div style={{ fontSize: px(13), fontWeight: '800' }}>{formatRupiah(grandTotal)}</div>
            </div>
            {/* Date */}
            <div style={{ border: `1px solid ${COLORS.navy}`, borderLeft: 'none' }}>
              <div style={{ background: COLORS.navy, color: '#fff', padding: `${px(4)} ${px(14)}`, fontSize: px(8), fontWeight: '600' }}>Tanggal</div>
              <div style={{ padding: `${px(8)} ${px(14)}`, fontSize: px(10), fontWeight: '600', color: '#333' }}>{formattedDate}</div>
            </div>
            {/* Invoice No */}
            <div style={{ border: `1px solid ${COLORS.navy}`, borderLeft: 'none' }}>
              <div style={{ background: COLORS.navy, color: '#fff', padding: `${px(4)} ${px(14)}`, fontSize: px(8), fontWeight: '600' }}>No. Invoice</div>
              <div style={{ padding: `${px(8)} ${px(14)}`, fontSize: px(10), fontWeight: '600', color: '#333' }}>{invoiceNumber || '-'}</div>
            </div>
          </div>
        </div>

        {/* ══ TABLE ══ */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: px(24), fontSize: px(10) }}>
          <thead>
            <tr>
              <th style={{ ...thStyle(px), textAlign: 'center', width: '7%' }}>NO.</th>
              <th style={{ ...thStyle(px), textAlign: 'left', width: '43%' }}>DESKRIPSI BARANG</th>
              <th style={{ ...thStyle(px), textAlign: 'right', width: '18%' }}>HARGA</th>
              <th style={{ ...thStyle(px), textAlign: 'center', width: '12%' }}>QTY</th>
              <th style={{ ...thStyle(px), textAlign: 'right', width: '20%' }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id} style={{ backgroundColor: idx % 2 === 0 ? '#f0f4f8' : '#fff' }}>
                <td style={{ ...tdStyle(px), textAlign: 'center', fontWeight: '700', color: COLORS.navy }}>{idx + 1}</td>
                <td style={{ ...tdStyle(px), textAlign: 'left' }}>
                  <div style={{ fontWeight: '700', color: '#222', fontSize: px(10) }}>{item.nama || '-'}</div>
                  {item.spesifikasi && (
                    <div style={{ color: '#888', fontSize: px(8), marginTop: px(2), lineHeight: 1.5, fontStyle: 'italic' }}>
                      {item.spesifikasi.split('\n').filter(Boolean).map((line, li) => (
                        <span key={li}>{line}{li < item.spesifikasi.split('\n').filter(Boolean).length - 1 ? ', ' : ''}</span>
                      ))}
                    </div>
                  )}
                </td>
                <td style={{ ...tdStyle(px), textAlign: 'right', color: '#333' }}>{item.harga > 0 ? formatRupiah(item.harga) : '-'}</td>
                <td style={{ ...tdStyle(px), textAlign: 'center', color: '#333' }}>{item.qty}</td>
                <td style={{ ...tdStyle(px), textAlign: 'right', fontWeight: '700', color: '#222' }}>{item.harga > 0 ? formatRupiah(item.qty * item.harga) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ══ BOTTOM SECTION ══ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: px(24), gap: px(30) }}>

          {/* Left Column: Keterangan */}
          <div style={{ flex: 1 }}>
            <div style={{ marginTop: px(8) }}>
              <div style={{ fontSize: px(11), fontWeight: '800', color: COLORS.navy, marginBottom: px(6) }}>Syarat & Ketentuan</div>
              <div style={{ color: '#666', fontSize: px(8.5), lineHeight: 1.7 }}>
                {keterangan.split('\n').filter(Boolean).map((line, li) => (
                  <div key={li} style={{ display: 'flex', gap: px(4), marginBottom: px(2) }}>
                    <span style={{ color: COLORS.coral, fontWeight: '700', flexShrink: 0 }}>{li + 1}.</span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Totals + Signature */}
          <div style={{ width: '42%' }}>
            <div style={{ fontSize: px(10) }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: `${px(7)} 0`, borderBottom: '1px solid #e0e0e0' }}>
                <span style={{ fontWeight: '600', color: '#555' }}>Subtotal</span>
                <span style={{ fontWeight: '700', color: '#222' }}>{formatRupiah(subtotalBarang)}</span>
              </div>

              {Number(ongkirPrice) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: `${px(7)} 0`, borderBottom: '1px solid #e0e0e0' }}>
                  <span style={{ fontWeight: '600', color: '#555' }}>Ongkir</span>
                  <span style={{ fontWeight: '700', color: '#222' }}>{formatRupiah(ongkirPrice)}</span>
                </div>
              )}

              {ppnEnabled && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: `${px(7)} 0`, borderBottom: '1px solid #e0e0e0' }}>
                  <span style={{ fontWeight: '600', color: '#555' }}>PPN {ppnPercent}%</span>
                  <span style={{ fontWeight: '700', color: '#222' }}>{formatRupiah(ppnAmount)}</span>
                </div>
              )}

              {/* Grand Total bar */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: `${px(10)} ${px(14)}`, marginTop: px(8),
                background: COLORS.navy, color: '#fff',
              }}>
                <span style={{ fontSize: px(11), fontWeight: '700', textTransform: 'uppercase' }}>Total</span>
                <span style={{ fontSize: px(14), fontWeight: '900' }}>{formatRupiah(grandTotal)}</span>
              </div>
            </div>

            {/* Signature */}
            <div style={{ textAlign: 'right', marginTop: px(20) }}>
              <div style={{ display: 'inline-block', textAlign: 'center' }}>
                <div style={{ position: 'relative', height: px(65), width: px(130), margin: '0 auto' }}>
                  <img src="/logo-asianindo-original.png" alt="stamp" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', height: px(60), width: px(60), objectFit: 'contain', opacity: 0.12, pointerEvents: 'none' }} />
                  <img src="/signature-asianindo.png" alt="signature" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', height: px(50), width: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                </div>
                <div style={{ fontSize: px(8), color: '#999', fontStyle: 'italic', marginBottom: px(2) }}>Tanda Tangan Perusahaan</div>
                <div style={{ fontSize: px(9), fontWeight: '700', color: COLORS.navy }}>IMAN ANJANI BUCHORY S.E</div>
                <div style={{ fontSize: px(7.5), color: '#888', marginTop: px(1) }}>Direktur Utama</div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ FOOTER CONTACT BAR ══ */}
        <div style={{ marginTop: 'auto', paddingTop: px(30) }}>
          <div style={{
            display: 'flex', justifyContent: 'center', gap: px(28),
            borderTop: `${px(2)} solid ${COLORS.navy}`, paddingTop: px(12),
          }}>
            {/* Phone */}
            <div style={{ display: 'flex', alignItems: 'center', gap: px(6) }}>
              <div style={{ background: COLORS.navy, color: '#fff', borderRadius: '50%', width: px(22), height: px(22), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width={px(12)} height={px(12)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <div style={{ fontSize: px(8), color: '#555', fontWeight: '600' }}>+62 823-3527-3227</div>
            </div>

            {/* Email */}
            <div style={{ display: 'flex', alignItems: 'center', gap: px(6) }}>
              <div style={{ background: COLORS.navy, color: '#fff', borderRadius: '50%', width: px(22), height: px(22), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width={px(12)} height={px(12)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              <div style={{ fontSize: px(8), color: '#555', fontWeight: '600' }}>info@asianindo.com</div>
            </div>

            {/* Website */}
            <div style={{ display: 'flex', alignItems: 'center', gap: px(6) }}>
              <div style={{ background: COLORS.navy, color: '#fff', borderRadius: '50%', width: px(22), height: px(22), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width={px(12)} height={px(12)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              </div>
              <div style={{ fontSize: px(8), color: '#555', fontWeight: '600' }}>www.asianindo.com</div>
            </div>

            {/* Address */}
            <div style={{ display: 'flex', alignItems: 'center', gap: px(6) }}>
              <div style={{ background: COLORS.navy, color: '#fff', borderRadius: '50%', width: px(22), height: px(22), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width={px(12)} height={px(12)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div style={{ fontSize: px(7.5), color: '#555', fontWeight: '600', maxWidth: px(120), lineHeight: 1.3 }}>Jl. Pemuda No.41, Sidoarjo</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Table Header Style (Coral) ──────────────────────────────────
const thStyle = (px) => ({
  padding: `${px(9)} ${px(10)}`,
  fontWeight: '700',
  fontSize: px(9),
  color: '#fff',
  backgroundColor: COLORS.coral,
  textTransform: 'uppercase',
  letterSpacing: px(0.5),
  borderBottom: 'none',
})

// ─── Table Cell Style ────────────────────────────────────────────
const tdStyle = (px) => ({
  padding: `${px(10)} ${px(10)}`,
  verticalAlign: 'top',
  borderBottom: `${px(1)} solid #e8e8e8`,
  fontSize: px(9),
})
