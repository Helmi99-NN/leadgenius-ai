import { useState } from 'react'
import { motion } from 'framer-motion'

const sections = [
  { id: 'account', label: 'Akun', icon: 'person' },
  { id: 'stores', label: 'Toko', icon: 'storefront' },
  { id: 'ai', label: 'Konfigurasi AI', icon: 'smart_toy' },
  { id: 'notifications', label: 'Notifikasi', icon: 'notifications' },
  { id: 'api', label: 'API & Integrasi', icon: 'code' },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('account')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display-lg text-display-lg text-on-surface mb-unit">
          Pengaturan
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Kelola akun, koneksi toko, dan preferensi AI Anda.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Sidebar Menu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-3"
        >
          <div className="bg-white border border-outline-variant rounded-xl p-stack-md shadow-sm space-y-unit">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-stack-md py-stack-sm rounded-lg font-label-md text-label-md transition-colors text-left ${
                  activeSection === s.id
                    ? 'bg-primary-container text-on-primary-container'
                    : 'text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={activeSection === s.id ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {s.icon}
                </span>
                {s.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Konten Pengaturan */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="lg:col-span-9"
        >
          {activeSection === 'account' && <AccountSettings />}
          {activeSection === 'stores' && <StoreSettings />}
          {activeSection === 'ai' && <AISettings />}
          {activeSection === 'notifications' && <NotificationSettings />}
          {activeSection === 'api' && <APISettings />}

          {/* Tombol Simpan */}
          <div className="mt-gutter flex justify-end gap-stack-sm">
            <button className="px-6 py-2.5 border border-outline text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-container transition-colors">
              Batal
            </button>
            <button
              onClick={handleSave}
              className={`px-6 py-2.5 rounded-lg font-label-md text-label-md flex items-center gap-2 transition-all ${
                saved
                  ? 'bg-primary-container text-on-primary-container'
                  : 'bg-primary text-on-primary hover:opacity-90'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {saved ? 'check' : 'save'}
              </span>
              {saved ? 'Tersimpan!' : 'Simpan Perubahan'}
            </button>
          </div>
        </motion.div>
      </div>
    </>
  )
}

/* ---------- Sub-sections ---------- */

function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-white border border-outline-variant rounded-xl p-gutter shadow-sm mb-gutter">
      <h3 className="font-headline-md text-headline-md text-on-surface mb-stack-md flex items-center gap-stack-sm">
        <span className="material-symbols-outlined text-primary">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  )
}

function FieldGroup({ label, children, hint }) {
  return (
    <div className="mb-stack-md">
      <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2">
        {label}
      </label>
      {children}
      {hint && (
        <p className="font-label-sm text-label-sm text-outline mt-1">{hint}</p>
      )}
    </div>
  )
}

function InputField({ type = 'text', placeholder, defaultValue, ...props }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      defaultValue={defaultValue}
      className="w-full bg-surface-bright border border-outline-variant rounded-md py-2 px-3 font-body-md text-body-md text-on-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      {...props}
    />
  )
}

function ToggleRow({ label, description, defaultChecked = false }) {
  const [enabled, setEnabled] = useState(defaultChecked)
  return (
    <div className="flex items-center justify-between py-3 border-b border-outline-variant/50 last:border-0">
      <div>
        <p className="font-label-md text-label-md text-on-surface">{label}</p>
        {description && (
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`w-11 h-6 rounded-full transition-colors relative ${
          enabled ? 'bg-primary' : 'bg-surface-container-highest'
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform ${
            enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}

/* --- Account --- */
function AccountSettings() {
  return (
    <SectionCard title="Informasi Akun" icon="person">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
        <FieldGroup label="Nama Lengkap">
          <InputField defaultValue="Helmi" />
        </FieldGroup>
        <FieldGroup label="Email">
          <InputField type="email" defaultValue="helmi@fibermedia.id" />
        </FieldGroup>
        <FieldGroup label="Nomor Telepon">
          <InputField defaultValue="+62 812-xxxx-xxxx" />
        </FieldGroup>
        <FieldGroup label="Peran">
          <InputField defaultValue="Admin Toko" readOnly />
        </FieldGroup>
      </div>
      <div className="mt-stack-md pt-stack-md border-t border-outline-variant">
        <button className="text-error font-label-md text-label-md hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">lock_reset</span>
          Ubah Kata Sandi
        </button>
      </div>
    </SectionCard>
  )
}

/* --- Store --- */
function StoreSettings() {
  return (
    <SectionCard title="Koneksi Toko" icon="storefront">
      <div className="space-y-stack-md">
        {/* Toko terhubung */}
        <div className="flex items-center justify-between bg-surface-container-low rounded-lg p-stack-md border border-outline-variant">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#EE4D2D] flex items-center justify-center text-white font-bold text-sm">S</div>
            <div>
              <p className="font-label-md text-label-md text-on-surface">Toko Fibermedia</p>
              <p className="font-label-sm text-label-sm text-primary flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary" /> Terhubung
              </p>
            </div>
          </div>
          <button className="text-on-surface-variant hover:text-error font-label-sm text-label-sm transition-colors">
            Putuskan
          </button>
        </div>

        <div className="flex items-center justify-between bg-surface-container-low rounded-lg p-stack-md border border-outline-variant">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#42B549] flex items-center justify-center text-white font-bold text-sm">T</div>
            <div>
              <p className="font-label-md text-label-md text-on-surface">Fibermedia Official</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-outline-variant" /> Belum terhubung
              </p>
            </div>
          </div>
          <button className="text-primary hover:underline font-label-sm text-label-sm transition-colors">
            Hubungkan
          </button>
        </div>

        <button className="w-full border-2 border-dashed border-outline-variant rounded-lg p-stack-md text-on-surface-variant hover:border-primary hover:text-primary transition-colors font-label-md text-label-md flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah Toko Baru
        </button>
      </div>
    </SectionCard>
  )
}

/* --- AI Config --- */
function AISettings() {
  return (
    <SectionCard title="Konfigurasi AI" icon="smart_toy">
      <FieldGroup label="Model AI" hint="Model yang digunakan untuk analisis chat dan generate balasan.">
        <div className="relative">
          <select className="w-full bg-surface-bright border border-outline-variant rounded-md py-2 pl-3 pr-10 font-body-md text-body-md text-on-background appearance-none focus:outline-none focus:border-primary">
            <option>Gemini 2.0 Flash</option>
            <option>Gemini 2.5 Pro</option>
            <option>Gemini 1.5 Pro</option>
          </select>
          <span className="material-symbols-outlined absolute right-3 top-2.5 text-outline pointer-events-none">expand_more</span>
        </div>
      </FieldGroup>

      <FieldGroup label="Bahasa Default Balasan">
        <div className="relative">
          <select className="w-full bg-surface-bright border border-outline-variant rounded-md py-2 pl-3 pr-10 font-body-md text-body-md text-on-background appearance-none focus:outline-none focus:border-primary">
            <option>Bahasa Indonesia</option>
            <option>English</option>
            <option>Bahasa Indonesia + English (Campur)</option>
          </select>
          <span className="material-symbols-outlined absolute right-3 top-2.5 text-outline pointer-events-none">expand_more</span>
        </div>
      </FieldGroup>

      <FieldGroup label="Gaya Balasan Default">
        <div className="relative">
          <select className="w-full bg-surface-bright border border-outline-variant rounded-md py-2 pl-3 pr-10 font-body-md text-body-md text-on-background appearance-none focus:outline-none focus:border-primary">
            <option>Penjualan Halus (Soft Selling)</option>
            <option>Penjualan Agresif (Hard Selling)</option>
            <option>Otoritas</option>
            <option>Kelangkaan</option>
          </select>
          <span className="material-symbols-outlined absolute right-3 top-2.5 text-outline pointer-events-none">expand_more</span>
        </div>
      </FieldGroup>

      <div className="mt-stack-md">
        <ToggleRow label="Auto-Analisis Chat Masuk" description="Analisis otomatis setiap chat baru yang masuk." defaultChecked={true} />
        <ToggleRow label="Saran Balasan Otomatis" description="Tampilkan saran balasan di notifikasi." defaultChecked={true} />
        <ToggleRow label="Deteksi Kompetitor Otomatis" description="AI akan mendeteksi jika pelanggan menyebut kompetitor." defaultChecked={false} />
      </div>
    </SectionCard>
  )
}

/* --- Notification Prefs --- */
function NotificationSettings() {
  return (
    <SectionCard title="Preferensi Notifikasi" icon="notifications">
      <ToggleRow label="Prospek Baru" description="Dapatkan notifikasi saat ada lead baru masuk." defaultChecked={true} />
      <ToggleRow label="Pengingat Tindak Lanjut" description="Ingatkan jadwal follow-up yang mendekat." defaultChecked={true} />
      <ToggleRow label="Peringatan Kompetitor" description="Notifikasi saat kompetitor mengubah harga." defaultChecked={true} />
      <ToggleRow label="Laporan Harian" description="Kirim ringkasan performa harian via email." defaultChecked={false} />
      <ToggleRow label="Suara Notifikasi" description="Aktifkan suara untuk notifikasi penting." defaultChecked={false} />
    </SectionCard>
  )
}

/* --- API Keys --- */
function APISettings() {
  return (
    <SectionCard title="API & Integrasi" icon="code">
      <FieldGroup label="Gemini API Key" hint="Digunakan untuk semua fitur AI. Jaga kerahasiaan key ini.">
        <div className="flex gap-2">
          <InputField type="password" defaultValue="AIzaSy•••••••••••••••••••" readOnly className="flex-1" />
          <button className="px-3 py-2 border border-outline-variant rounded-md text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-sm">visibility</span>
          </button>
          <button className="px-3 py-2 border border-outline-variant rounded-md text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-sm">content_copy</span>
          </button>
        </div>
      </FieldGroup>

      <FieldGroup label="Webhook URL" hint="URL untuk menerima data dari Chrome Extension / Android App.">
        <InputField defaultValue="https://api.leadgenius.ai/webhook/incoming" />
      </FieldGroup>

      <FieldGroup label="Chrome Extension ID">
        <InputField defaultValue="Belum terpasang" readOnly />
      </FieldGroup>

      <div className="mt-stack-md pt-stack-md border-t border-outline-variant">
        <button className="text-primary font-label-md text-label-md hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">download</span>
          Unduh Chrome Extension
        </button>
      </div>
    </SectionCard>
  )
}
