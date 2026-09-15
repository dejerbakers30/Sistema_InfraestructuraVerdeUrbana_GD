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
    const activeId = scenarioId || '1'
    setLoading(false)

    // Data mapped for all 6 scenarios
    const metrics: Record<string, KPIData> = {
      '1': {
        avg_pet: 31.2,
        green_area_ha: 10.2,
        runoff_coefficient: 0.55,
        temperature_reduction: 0.0,
        biodiversity_index: 1.2,
        thermal_comfort_zones: { comfortable: 20, slightly_uncomfortable: 40, uncomfortable: 30, very_uncomfortable: 10 }
      },
      '2': {
        avg_pet: 28.5,
        green_area_ha: 15.3,
        runoff_coefficient: 0.35,
        temperature_reduction: 1.8,
        biodiversity_index: 2.1,
        thermal_comfort_zones: { comfortable: 45, slightly_uncomfortable: 30, uncomfortable: 20, very_uncomfortable: 5 }
      },
      '3': {
        avg_pet: 26.8,
        green_area_ha: 22.8,
        runoff_coefficient: 0.28,
        temperature_reduction: 2.4,
        biodiversity_index: 3.4,
        thermal_comfort_zones: { comfortable: 60, slightly_uncomfortable: 25, uncomfortable: 12, very_uncomfortable: 3 }
      },
      '4': {
        avg_pet: 27.2,
        green_area_ha: 19.5,
        runoff_coefficient: 0.32,
        temperature_reduction: 2.1,
        biodiversity_index: 2.9,
        thermal_comfort_zones: { comfortable: 55, slightly_uncomfortable: 28, uncomfortable: 14, very_uncomfortable: 3 }
      },
      '5': {
        avg_pet: 28.9,
        green_area_ha: 11.0,
        runoff_coefficient: 0.50,
        temperature_reduction: 1.5,
        biodiversity_index: 1.4,
        thermal_comfort_zones: { comfortable: 42, slightly_uncomfortable: 35, uncomfortable: 18, very_uncomfortable: 5 }
      },
      '6': {
        avg_pet: 25.1,
        green_area_ha: 28.4,
        runoff_coefficient: 0.20,
        temperature_reduction: 3.2,
        biodiversity_index: 4.2,
        thermal_comfort_zones: { comfortable: 75, slightly_uncomfortable: 18, uncomfortable: 6, very_uncomfortable: 1 }
      }
    }

    setKpiData(metrics[activeId] || metrics['1'])
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
