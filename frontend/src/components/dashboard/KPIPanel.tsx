'use client'

import { useEffect, useState } from 'react'

interface KPIData {
  avg_pet: number
  green_area_ha: number
  runoff_coefficient: number
  temperature_reduction: number
  biodiversity_index: number
  thermal_comfort_zones: Record<string, number>
}

export default function KPIPanel({ scenarioId }: { scenarioId: string | null }) {
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (scenarioId) {
      setLoading(false)
      setKpiData({
        avg_pet: 28.5,
        green_area_ha: 15.3,
        runoff_coefficient: 0.35,
        temperature_reduction: 2.4,
        biodiversity_index: 2.1,
        thermal_comfort_zones: {
          comfortable: 45,
          slightly_uncomfortable: 30,
          uncomfortable: 20,
          very_uncomfortable: 5
        }
      })
    }
  }, [scenarioId])

  if (loading || !kpiData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICard
        title="PET Promedio"
        value={kpiData.avg_pet.toFixed(1)}
        unit="°C"
        icon="🌡️"
        badgeColor="emerald"
      />
      <KPICard
        title="Área Verde Total"
        value={kpiData.green_area_ha.toFixed(1)}
        unit="ha"
        icon="🌳"
        badgeColor="teal"
      />
      <KPICard
        title="Escorrentía Hídrica"
        value={kpiData.runoff_coefficient.toFixed(2)}
        unit=""
        icon="💧"
        badgeColor="cyan"
      />
      <KPICard
        title="Reducción Temp."
        value={`-${kpiData.temperature_reduction.toFixed(1)}`}
        unit="°C"
        icon="❄️"
        badgeColor="emerald"
      />
    </div>
  )
}

function KPICard({ title, value, unit, icon, badgeColor }: {
  title: string
  value: string
  unit: string
  icon: string
  badgeColor: 'emerald' | 'teal' | 'cyan'
}) {
  const badgeClasses = {
    emerald: 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300',
    teal: 'bg-teal-100 dark:bg-teal-950/80 border-teal-300 dark:border-teal-500/30 text-teal-800 dark:text-teal-300',
    cyan: 'bg-cyan-100 dark:bg-cyan-950/80 border-cyan-300 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-300',
  }

  return (
    <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl hover:-translate-y-0.5 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-xl shadow-inner">
          {icon}
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeClasses[badgeColor]}`}>
          {title}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</span>
        {unit && <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{unit}</span>}
      </div>
    </div>
  )
}
