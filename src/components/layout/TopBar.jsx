import { useState } from 'react'

export default function TopBar({ onMenuToggle }) {
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <header className="sticky top-0 w-full z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant flex justify-between items-center px-4 md:px-margin py-stack-sm">
      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-on-surface-variant hover:text-primary transition-colors mr-stack-sm"
        onClick={onMenuToggle}
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Search Bar */}
      <div
        className={`flex-1 max-w-md rounded-lg overflow-hidden transition-shadow ${
          searchFocused ? 'ring-2 ring-secondary' : ''
        }`}
      >
        <div className="flex items-center bg-surface-container-highest px-stack-sm py-unit">
          <span className="material-symbols-outlined text-on-surface-variant mr-stack-sm">
            search
          </span>
          <input
            className="w-full bg-transparent border-none text-on-surface focus:ring-0 focus:outline-none font-body-md text-body-md p-0 placeholder:text-outline"
            placeholder="Cari prospek, chat..."
            type="text"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 md:gap-gutter">
        {/* Notifications */}
        <button className="text-on-surface-variant hover:text-primary transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full pulse-dot" />
        </button>

        <div className="h-6 w-px bg-outline-variant hidden md:block" />

        {/* Store Selector */}
        <button className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors items-center gap-unit hidden md:flex">
          <span className="material-symbols-outlined text-[18px]">store</span>
          Pemilih Toko
        </button>

        {/* User Avatar */}
        <button className="flex items-center gap-stack-sm group">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant group-hover:border-primary transition-colors bg-primary-container flex items-center justify-center">
            <span className="text-on-primary-container font-bold text-label-sm">H</span>
          </div>
        </button>
      </div>
    </header>
  )
}
