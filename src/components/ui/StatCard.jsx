import { motion } from 'framer-motion'

export default function StatCard({ icon, iconColor, iconBg, label, value, valueSuffix, trend, trendValue, hasGradientBorder = false, delay = 0 }) {
  const isPositive = trend === 'up'
  const isFlat = trend === 'flat'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`glass-panel rounded-xl p-gutter relative overflow-hidden group hover:shadow-[0_0_15px_rgba(7,102,83,0.1)] transition-shadow ${
        hasGradientBorder ? 'ai-border-top' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-stack-md">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        </div>
        <span
          className={`flex items-center text-label-sm font-label-sm px-unit py-[2px] rounded ${
            isFlat
              ? 'text-outline bg-surface-variant'
              : 'text-primary bg-primary/10'
          }`}
        >
          <span className="material-symbols-outlined text-[14px] mr-[2px]">
            {isPositive ? 'trending_up' : isFlat ? 'trending_flat' : 'trending_down'}
          </span>
          {trendValue}
        </span>
      </div>
      <div>
        <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
          {label}
        </p>
        <h2 className="font-display-lg text-display-lg text-on-surface mt-unit">
          {value}
          {valueSuffix && <span className="text-headline-md">{valueSuffix}</span>}
        </h2>
      </div>
    </motion.div>
  )
}
