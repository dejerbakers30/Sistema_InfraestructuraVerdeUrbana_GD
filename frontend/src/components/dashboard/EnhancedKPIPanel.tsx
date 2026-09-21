'use client'

import React, { useEffect, useState } from 'react'
import KPIJustificationModal, { SelectedKPIInfo } from './KPIJustificationModal'
import {
  Thermometer,
  Trees,
  Droplets,
  Snowflake,
  Flame,
  CloudSun,
  Sparkles,
  ExternalLink,
} from 'lucide-react'

interface KPIData {
  avg_pet: number
  green_area_ha: number
  runoff_coefficient: number
  temperature_reduction: number
  uhi_intensity: number
  carbon_sequestration_tons: number
  thermal_comfort_zones: Record<string, number>
}

export default function EnhancedKPIPanel({ scenarioId }: { scenarioId: string | null }) {
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedKPI, setSelectedKPI] = useState<SelectedKPIInfo | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (scenarioId) {
      setLoading(false)
      const isBase = scenarioId === '1'
      const isHighGreen = scenarioId === '2'
      setKpiData({
        avg_pet: isHighGreen ? 25.8 : isBase ? 28.5 : 32.1,
        green_area_ha: isHighGreen ? 24.6 : isBase ? 15.3 : 8.2,
        runoff_coefficient: isHighGreen ? 0.24 : isBase ? 0.35 : 0.68,
        temperature_reduction: isHighGreen ? 3.8 : isBase ? 2.4 : 1.1,
        uhi_intensity: isHighGreen ? 1.2 : isBase ? 1.8 : 3.6,
        carbon_sequestration_tons: isHighGreen ? 31.2 : isBase ? 18.4 : 9.5,
        thermal_comfort_zones: {
          comfortable: isHighGreen ? 65 : 45,
          slightly_uncomfortable: isHighGreen ? 25 : 30,
          uncomfortable: isHighGreen ? 10 : 20,
          very_uncomfortable: isHighGreen ? 0 : 5,
        },
      })
    }
  }, [scenarioId])

  const openJustification = (kpi: SelectedKPIInfo) => {
    setSelectedKPI(kpi)
    setIsModalOpen(true)
  }

  if (loading || !kpiData) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl rounded-2xl p-4 animate-pulse h-36"
          >
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-3"></div>
            <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  const kpis = [
    {
      title: 'PET Promedio',
      value: kpiData.avg_pet.toFixed(1),
      unit: '°C',
      description: 'Sensación biometeorológica',
      icon: <Thermometer className="w-5 h-5 text-emerald-500" />,
      accent: 'from-emerald-500/15 via-teal-500/5 to-transparent',
      borderColor: 'hover:border-emerald-500/40',
    },
    {
      title: 'Área Verde Total',
      value: kpiData.green_area_ha.toFixed(1),
      unit: 'ha',
      description: 'Cobertura de dosel y parques',
      icon: <Trees className="w-5 h-5 text-teal-500" />,
      accent: 'from-teal-500/15 via-cyan-500/5 to-transparent',
      borderColor: 'hover:border-teal-500/40',
    },
    {
      title: 'Escorrentía Hídrica',
      value: kpiData.runoff_coefficient.toFixed(2),
      unit: 'C',
      description: 'Retención pluvial del 65%',
      icon: <Droplets className="w-5 h-5 text-cyan-500" />,
      accent: 'from-cyan-500/15 via-blue-500/5 to-transparent',
      borderColor: 'hover:border-cyan-500/40',
    },
    {
      title: 'Reducción Temp.',
      value: `-${kpiData.temperature_reduction.toFixed(1)}`,
      unit: '°C',
      description: 'Delta vs asfalto sin dosel',
      icon: <Snowflake className="w-5 h-5 text-sky-500" />,
      accent: 'from-sky-500/15 via-indigo-500/5 to-transparent',
      borderColor: 'hover:border-sky-500/40',
    },
    {
      title: 'Intensidad UHI',
      value: `+${kpiData.uhi_intensity.toFixed(1)}`,
      unit: '°C',
      description: 'Sobretemperatura urbana',
      icon: <Flame className="w-5 h-5 text-amber-500" />,
      accent: 'from-amber-500/15 via-orange-500/5 to-transparent',
      borderColor: 'hover:border-amber-500/40',
    },
    {
      title: 'Captura de CO₂',
      value: kpiData.carbon_sequestration_tons.toFixed(1),
      unit: 't/año',
      description: 'Secuestro activo de biomasa',
      icon: <CloudSun className="w-5 h-5 text-emerald-400" />,
      accent: 'from-emerald-500/15 via-lime-500/5 to-transparent',
      borderColor: 'hover:border-emerald-500/40',
    },
  ]

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const kpiInfo: SelectedKPIInfo = {
            title: kpi.title,
            value: kpi.value,
            unit: kpi.unit,
            description: kpi.description,
            scenarioId: scenarioId || '1',
          }

          return (
            <div
              key={idx}
              onClick={() => openJustification(kpiInfo)}
              className={`group cursor-pointer relative overflow-hidden bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg hover:-translate-y-1 transition-all duration-300 ${kpi.borderColor}`}
            >
              {/* Subtle Accent Glow */}
              <div
                className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${kpi.accent} rounded-full blur-2xl pointer-events-none`}
              />

              <div className="relative z-10 flex flex-col justify-between h-full space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                    {kpi.icon}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      openJustification(kpiInfo)
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
                    title="Abrir Justificación Científica en Modal Externo"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Justificación IA</span>
                  </button>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    {kpi.title}
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {kpi.value}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {kpi.unit}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  <span className="truncate">{kpi.description}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-500 transition-colors flex-shrink-0 ml-1" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Centralized External Modal for KPI Justification */}
      <KPIJustificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        kpi={selectedKPI}
      />
    </>
  )
}
