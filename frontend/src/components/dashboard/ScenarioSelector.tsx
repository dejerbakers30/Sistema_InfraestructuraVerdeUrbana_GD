'use client'

import { useEffect, useState } from 'react'

interface Scenario {
  id: string
  name: string
  description: string
  created_at: string
}

export default function ScenarioSelector({
  selectedScenario,
  onScenarioChange
}: {
  selectedScenario: string | null
  onScenarioChange: (scenarioId: string | null) => void
}) {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
    setScenarios([
      {
        id: '1',
        name: 'Escenario Base (Sin intervención)',
        description: 'Estado actual del microclima urbano',
        created_at: '2024-01-01T00:00:00'
      },
      {
        id: '2',
        name: 'Techos Verdes (50% Cobertura)',
        description: 'Implementación de techos verdes intensivos',
        created_at: '2024-01-02T00:00:00'
      },
      {
        id: '3',
        name: 'Arbolado Urbano denso',
        description: 'Siembra masiva de especies autóctonas',
        created_at: '2024-01-03T00:00:00'
      }
    ])
  }, [])

  return (
    <div className="flex items-center gap-2.5">
      <label htmlFor="scenario-select" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden sm:inline">
        Escenario:
      </label>
      <div className="relative">
        <select
          id="scenario-select"
          value={selectedScenario || ''}
          onChange={(e) => onScenarioChange(e.target.value || null)}
          disabled={loading}
          className="pl-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 appearance-none shadow-sm cursor-pointer transition-all min-w-[220px]"
        >
          <option value="">Seleccionar escenario</option>
          {scenarios.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  )
}
