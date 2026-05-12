import { motion } from 'framer-motion'

export default function PagePlaceholder({ icon, title, description, features = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center"
    >
      <div className="glass-panel rounded-2xl p-12 max-w-lg w-full">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-primary-container/20 flex items-center justify-center mx-auto mb-gutter">
          <span
            className="material-symbols-outlined text-primary text-[40px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        </div>

        {/* Title */}
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-stack-sm">
          {title}
        </h2>

        {/* Description */}
        <p className="font-body-md text-body-md text-on-surface-variant mb-gutter max-w-sm mx-auto">
          {description}
        </p>

        {/* Feature preview pills */}
        {features.length > 0 && (
          <div className="flex flex-wrap justify-center gap-stack-sm mb-gutter">
            {features.map((feature, i) => (
              <span
                key={i}
                className="px-stack-sm py-unit bg-surface-container-highest text-on-surface-variant text-label-sm rounded-full border border-outline-variant"
              >
                {feature}
              </span>
            ))}
          </div>
        )}

        {/* Status */}
        <div className="flex items-center justify-center gap-stack-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[18px] text-secondary">
            construction
          </span>
          <span className="text-label-md font-label-md">Segera Hadir</span>
        </div>
      </div>
    </motion.div>
  )
}
