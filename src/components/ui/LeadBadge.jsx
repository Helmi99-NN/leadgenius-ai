const categoryConfig = {
  hot: {
    label: 'PANAS',
    bgClass: 'bg-[#ef4444]/15',
    textClass: 'text-[#ef4444]',
    borderClass: 'border-[#ef4444]/30',
  },
  warm: {
    label: 'HANGAT',
    bgClass: 'bg-[#f59e0b]/15',
    textClass: 'text-[#f59e0b]',
    borderClass: 'border-[#f59e0b]/30',
  },
  cold: {
    label: 'DINGIN',
    bgClass: 'bg-[#3b82f6]/15',
    textClass: 'text-[#3b82f6]',
    borderClass: 'border-[#3b82f6]/30',
  },
}

export default function LeadBadge({ category }) {
  const config = categoryConfig[category] || categoryConfig.cold

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded font-label-sm text-[10px] uppercase tracking-wider border ${config.bgClass} ${config.textClass} ${config.borderClass}`}
    >
      {config.label}
    </span>
  )
}
