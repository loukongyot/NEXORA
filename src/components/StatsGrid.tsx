type StatItem = {
  label: string
  tone: 'blue' | 'brown' | 'pink' | 'purple'
  value: number | string
}

const toneClasses = {
  blue: 'bg-[#009FD1]/15 text-[#70dfff]',
  brown: 'bg-[#ba5835]/18 text-[#ffb08d]',
  pink: 'bg-[#f05193]/15 text-[#ffd1e4]',
  purple: 'bg-[#6b5095]/20 text-[#d9c7ff]',
}

type StatsGridProps = {
  stats: StatItem[]
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-3xl border border-white/10 bg-white/[0.075] p-4 text-center shadow-2xl shadow-black/20 backdrop-blur-2xl sm:grid-cols-4 xl:grid-cols-2">
      {stats.map((stat) => (
        <div className={`rounded-2xl px-3 py-4 ${toneClasses[stat.tone]}`} key={stat.label}>
          <p className="text-2xl font-semibold">{stat.value}</p>
          <p className="mt-1 text-xs text-slate-300">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
