const colorMap = {
  hot: '#ef4444',
  warm: '#f59e0b',
  cold: '#3b82f6',
  primary: '#004c3d',
}

export default function ScoreGauge({ score, maxScore = 100, category = 'primary', size = 24 }) {
  const color = colorMap[category] || colorMap.primary
  const radius = (size - 4) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / maxScore) * circumference
  const offset = circumference - progress

  return (
    <div className="flex items-center gap-unit">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e1e3e2"
          strokeWidth="2"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="score-ring transition-all duration-700"
        />
      </svg>
      <span className="font-label-md text-on-surface">{score}</span>
    </div>
  )
}
