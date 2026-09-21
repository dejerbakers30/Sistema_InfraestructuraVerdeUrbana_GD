'use client'

import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Trees,
  TrendingDown,
  Droplets,
  Flame,
  ShieldAlert,
  BrainCircuit,
  ArrowRight,
  BookOpen,
} from 'lucide-react'

interface CaseOption {
  id: string
  title: string
  subtitle: string
  icon: string
  badge: string
}

const CASES: CaseOption[] = [
  {
    id: 'heat_wave',
    title: 'Ola de Calor Crítica (+3.5°C)',
    subtitle: 'Estrés térmico peatonal severo y pico de consumo HVAC',
    icon: '🔥',
    badge: 'Urgencia Alta',
  },
  {
    id: 'flash_flood',
    title: 'Tormenta Severa e Inundación (75mm)',
    subtitle: 'Saturación de drenaje pluvial en cota baja y anegamiento',
    icon: '🌊',
    badge: 'Riesgo Pluvial',
  },
  {
    id: 'drought_deficit',
    title: 'Déficit Hídrico & Sequía Prolongada',
    subtitle: 'Pérdida de biomasa foliar y caída en transpiración',
    icon: '🏜️',
    badge: 'Resiliencia',
  },
  {
    id: 'dense_canyon',
    title: 'Cañón Urbano Hiper-denso (UHI)',
    subtitle: 'Atrapamiento de onda larga nocturna y falta de ventilación',
    icon: '🏙️',
    badge: 'Isla de Calor',
  },
]

export default function AIPredictiveRecommender() {
  const [selectedCase, setSelectedCase] = useState<string>('heat_wave')
  const [loading, setLoading] = useState(false)
  const [predictionData, setPredictionData] = useState<any>(null)

  const fetchPrediction = async (caseId: string) => {
    setLoading(true)
    try {
      const storedKey = typeof window !== 'undefined' ? localStorage.getItem('groq_api_key') : null
      const res = await fetch('http://localhost:8000/api/v1/ai/predict-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          api_key: storedKey || undefined,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setPredictionData(data)
      }
    } catch (err) {
      console.error('Error fetching prediction:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrediction(selectedCase)
  }, [selectedCase])

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-cyan-500/15 border border-amber-500/30 backdrop-blur-xl shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/25">
              🤖
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Motor de IA Predictiva & Recomendaciones
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Simulación probabilística de eventos críticos y propuestas de mitigación basada en datos ENVI-met
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-semibold font-mono">
              Inferencia LLM + ML
            </span>
          </div>
        </div>
      </div>

      {/* Case Study Selector Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CASES.map((item) => {
          const isSelected = selectedCase === item.id
          return (
            <button
              key={item.id}
              onClick={() => setSelectedCase(item.id)}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 border-amber-500/50 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/30'
                  : 'bg-white/70 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {item.badge}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                {item.title}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                {item.subtitle}
              </p>
            </button>
          )
        })}
      </div>

      {/* Prediction & Recommendations Display */}
      {loading ? (
        <div className="p-16 text-center bg-white/60 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Calculando balance termodinámico y predicciones de mitigación con IA...
          </p>
        </div>
      ) : predictionData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Unmitigated Risk Scenario */}
          <div className="bg-white/80 dark:bg-slate-900/60 border border-red-500/30 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>1. Proyección Sin Intervención</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              {predictionData.risk_profile}
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              {Object.entries(predictionData.prediction || {}).map(([key, val]) => (
                <div
                  key={key}
                  className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-between text-xs"
                >
                  <span className="capitalize text-slate-700 dark:text-slate-300 font-medium">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="font-extrabold text-red-600 dark:text-red-400 font-mono">
                    {String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Recommended Green Infrastructure Interventions */}
          <div className="bg-white/80 dark:bg-slate-900/60 border border-emerald-500/30 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <Trees className="w-5 h-5" />
              <span>2. Intervenciones Verdes Recomendadas</span>
            </div>

            <div className="space-y-3">
              {(predictionData.interventions || []).map((item: any, i: number) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {item.type}
                    </span>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                      {item.cooling_delta}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                    Especies: <span className="font-normal italic text-slate-700 dark:text-slate-300">{item.species}</span>
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Ubicación óptima: {item.location}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Expected Quantitative ROI */}
          <div className="bg-white/80 dark:bg-slate-900/60 border border-cyan-500/30 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 text-cyan-600 dark:text-cyan-400 font-bold text-sm">
              <TrendingDown className="w-5 h-5" />
              <span>3. Beneficio Cuantitativo Post-Intervención</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Mejora proyectada en los indicadores de confort y resiliencia climática tras la ejecución de las intervenciones.
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              {Object.entries(predictionData.roi || {}).map(([key, val]) => (
                <div
                  key={key}
                  className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between text-xs"
                >
                  <span className="capitalize text-slate-700 dark:text-slate-300 font-medium">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">
                    {String(val)}
                  </span>
                </div>
              ))}
            </div>

            {predictionData.ai_analysis && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2 whitespace-pre-line max-h-48 overflow-y-auto">
                <div className="font-bold flex items-center gap-1.5 text-amber-500 text-[11px]">
                  <BrainCircuit className="w-4 h-4" />
                  <span>Dictamen Estratégico Groq LLM:</span>
                </div>
                <div className="text-[11px] leading-relaxed font-normal">
                  {predictionData.ai_analysis}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
