'use client'

import { useState } from 'react'
import Link from 'next/link'
import MapContainer from '@/components/maps/MapContainer'
import KPIPanel from '@/components/dashboard/KPIPanel'
import ScenarioSelector from '@/components/dashboard/ScenarioSelector'
import TemperatureChart from '@/components/charts/TemperatureChart'
import HumidityChart from '@/components/charts/HumidityChart'
import WindChart from '@/components/charts/WindChart'
import PETChart from '@/components/charts/PETChart'
import ThemeToggle from '@/components/ThemeToggle'
import MLEngineDashboard from '@/components/ml/MLEngineDashboard'

export default function DashboardPage() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>('1')
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ml'>('dashboard')

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white relative transition-colors duration-300">
      {/* Background Radial Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-cyan-500/15 dark:from-emerald-600/20 dark:via-teal-500/10 dark:to-cyan-500/20 blur-[120px] pointer-events-none rounded-full" />

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/60 backdrop-blur-xl transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                <span className="text-xl font-black text-slate-950">🌱</span>
              </div>
              <div>
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight block leading-none">Dashboard</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium tracking-wide">Infraestructura Verde</span>
              </div>
            </Link>

            {/* View Selector Tabs */}
            <div className="hidden md:flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🗺️ Simulación & Mapas
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ml')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'ml'
                    ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>🤖</span> Motor ML (5 Modelos)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {activeTab === 'dashboard' && (
              <ScenarioSelector 
                selectedScenario={selectedScenario}
                onScenarioChange={setSelectedScenario}
              />
            )}

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            <ThemeToggle />

            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-red-400/50 transition-all"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto p-6 space-y-6">
        {activeTab === 'ml' ? (
          <MLEngineDashboard />
        ) : (
          <>
            {/* KPI Panel */}
            <KPIPanel scenarioId={selectedScenario} />

            {/* Map and Temperature Chart Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Map */}
              <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 transition-all hover:border-emerald-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-emerald-500">📍</span> Mapa Interactivo GIS
                  </h2>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-500/30">
                    Capas Activas
                  </span>
                </div>
                <div className="h-96 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                  <MapContainer scenarioId={selectedScenario} />
                </div>
              </div>

              {/* Temperature Chart */}
              <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 transition-all hover:border-teal-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-teal-500">🌡️</span> Temperatura vs Tiempo
                  </h2>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-semibold border border-teal-300 dark:border-teal-500/30">
                    24 Horas
                  </span>
                </div>
                <div className="h-96">
                  <TemperatureChart scenarioId={selectedScenario} />
                </div>
              </div>
            </div>

            {/* Additional Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 transition-all hover:border-cyan-500/30">
                <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>💧</span> Humedad Relativa
                </h2>
                <div className="h-64">
                  <HumidityChart scenarioId={selectedScenario} />
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 transition-all hover:border-emerald-500/30">
                <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>💨</span> Velocidad del Viento
                </h2>
                <div className="h-64">
                  <WindChart scenarioId={selectedScenario} />
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 transition-all hover:border-teal-500/30">
                <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>🧘</span> PET (Confort Térmico)
                </h2>
                <div className="h-64">
                  <PETChart scenarioId={selectedScenario} />
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

