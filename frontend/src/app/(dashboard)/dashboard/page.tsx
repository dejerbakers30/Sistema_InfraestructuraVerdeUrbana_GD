'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import ExecutiveSidebar, { ActiveModule } from '@/components/layout/ExecutiveSidebar'
import EnhancedKPIPanel from '@/components/dashboard/EnhancedKPIPanel'
import AIPredictiveRecommender from '@/components/predictive/AIPredictiveRecommender'
import GroqChatDrawer from '@/components/ai/GroqChatDrawer'
import AIReasoningBadge from '@/components/ai/AIReasoningBadge'
import MapContainer from '@/components/maps/MapContainer'
import ScenarioSelector from '@/components/dashboard/ScenarioSelector'

const DigitalTwin3DViewer = dynamic(() => import('@/components/maps/DigitalTwin3DViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-slate-400 p-6">
      <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-3" />
      <span className="text-xs font-semibold">Cargando visor 3D Three.js...</span>
    </div>
  ),
})
import TemperatureChart from '@/components/charts/TemperatureChart'
import HumidityChart from '@/components/charts/HumidityChart'
import WindChart from '@/components/charts/WindChart'
import PETChart from '@/components/charts/PETChart'
import ThemeToggle from '@/components/ThemeToggle'
import MLEngineDashboard from '@/components/ml/MLEngineDashboard'
import ReportsDashboard from '@/components/reports/ReportsDashboard'
import {
  Compass,
  Radio,
  Sparkles,
  Sliders,
  MessageSquare,
  Box,
  MapPin,
  Maximize2,
  Minimize2,
  CheckCircle,
  Key,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Layers,
  Activity,
  ChevronRight,
  ArrowUpRight,
  Eye,
  LogOut,
  Workflow,
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [selectedScenario, setSelectedScenario] = useState<string | null>('1')
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [isTrainingActive, setIsTrainingActive] = useState(false)

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isGroqDrawerOpen, setIsGroqDrawerOpen] = useState(false)
  const [groqKeyActive, setGroqKeyActive] = useState(false)
  const [settingsApiKey, setSettingsApiKey] = useState('')
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [dashboardMapExpanded, setDashboardMapExpanded] = useState(false)
  const [showAlertsBanner, setShowAlertsBanner] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
    } else {
      setIsAuthenticated(true)
      setCheckingAuth(false)
    }
  }, [router])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const key = localStorage.getItem('groq_api_key')
      if (key) {
        setGroqKeyActive(true)
        setSettingsApiKey(key)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.href = '/login'
  }

  const handleSaveSettingsKey = () => {
    if (settingsApiKey.trim()) {
      localStorage.setItem('groq_api_key', settingsApiKey.trim())
      setGroqKeyActive(true)
      setSettingsSaved(true)
      setTimeout(() => setSettingsSaved(false), 2500)
    } else {
      localStorage.removeItem('groq_api_key')
      setGroqKeyActive(false)
    }
  }

  if (checkingAuth || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <span className="absolute text-2xl">🌱</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight mb-1">Verificando sesión...</h2>
        <p className="text-sm text-slate-400">Accediendo a la plataforma de Infraestructura Verde</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white relative transition-colors duration-300">
      {/* Background Radial Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-tr from-emerald-500/10 via-teal-500/10 to-cyan-500/10 dark:from-emerald-600/15 dark:via-teal-500/10 dark:to-cyan-500/15 blur-[140px] pointer-events-none rounded-full" />

      {/* Left Executive Sidebar */}
      <ExecutiveSidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        groqKeyActive={groqKeyActive}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top GIS Telemetry Navigation Bar */}
        <header className="sticky top-0 z-20 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/80 backdrop-blur-xl transition-colors duration-300">
          <div className="px-6 h-20 flex items-center justify-between gap-4">
            {/* Left Title & Telemetry */}
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>Gemelo Digital Urbano</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                    v2.0 Enterprise
                  </span>
                </h1>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                    <span>ENVI-met 3D Solver</span>
                  </span>
                  <span>•</span>
                  <span className="hidden sm:inline">Paso Temporal: 13:00h (Pico Solar)</span>
                  {isTrainingActive && (
                    <span className="text-amber-500 font-bold flex items-center gap-1 animate-pulse">
                      <span>•</span>
                      <span>Entrenamiento ML Activo...</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Coordinates Chip */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-300">
                <Compass className="w-4 h-4 text-emerald-500" />
                <span>8°06′43″S 79°01′47″W (Trujillo Centro)</span>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              {/* Scenario Selector */}
              <ScenarioSelector
                selectedScenario={selectedScenario}
                onScenarioChange={setSelectedScenario}
              />

              {/* Langflow AI Trigger Button */}
              <button
                onClick={() => setIsGroqDrawerOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-cyan-500/20 border border-emerald-500/30 hover:border-emerald-400 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all shadow-sm group hover:scale-[1.02]"
                title="Abrir Asistente IA con Langflow"
              >
                <Workflow className="w-4 h-4 text-emerald-500 group-hover:rotate-12 transition-transform" />
                <span>Asistente Langflow</span>
              </button>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

              <ThemeToggle />

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-red-400/50 transition-all whitespace-nowrap"
                title="Cerrar Sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Content Views */}
        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* VIEW: Dashboard Ejecutivo */}
          {activeModule === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Enhanced KPI Panel with AI Justifications */}
              <EnhancedKPIPanel scenarioId={selectedScenario} />

              {/* Early Warning Microclimatic Alerts Banner */}
              {showAlertsBanner && (
                <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-red-500/10 to-emerald-500/10 border border-amber-500/30 backdrop-blur-xl shadow-lg relative overflow-hidden transition-all">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 flex-shrink-0 mt-0.5">
                        <AlertTriangle className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono">
                            Centro de Alertas Tempranas Microclimáticas
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-bold animate-pulse">
                            2 Alertas Activas
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                          <strong className="text-slate-900 dark:text-white">Alerta 1:</strong> Pico de Estrés Térmico Severo proyectado (PET &gt; 38.5°C) en sector NE sin arbolado entre 12:30h - 14:30h.
                          <br />
                          <strong className="text-slate-900 dark:text-white">Alerta 2:</strong> Saturación hídrica superficial potencial (C = 0.68) por déficit de Sistemas Urbanos de Drenaje Sostenible (SUDs).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() => setActiveModule('predictive')}
                        className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold transition-colors flex items-center gap-1.5 border border-amber-500/30"
                      >
                        <span>Ver Mitigación IA</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setShowAlertsBanner(false)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        title="Descartar banner de alertas"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Map & Temperature Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* 2D GIS Interactive Map */}
                <div
                  className={`transition-all duration-300 ${
                    dashboardMapExpanded ? 'lg:col-span-12' : 'lg:col-span-7'
                  } bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 relative`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>Cartografía GIS 2D</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                            Leaflet Multi-Layer
                          </span>
                        </h2>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Índice de Moran: +0.64 (Cluster térmico crítico)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <AIReasoningBadge
                        metricName="Cartografía e Índice de Moran"
                        value="+0.64 Moran's I"
                        scenarioName={`Escenario ${selectedScenario || '1'}`}
                      />
                      <button
                        onClick={() => setDashboardMapExpanded(!dashboardMapExpanded)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors"
                        title={dashboardMapExpanded ? 'Contraer Mapa' : 'Expandir Mapa'}
                      >
                        {dashboardMapExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className={`${dashboardMapExpanded ? 'h-[620px]' : 'h-[460px]'} rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner`}>
                    <MapContainer scenarioId={selectedScenario} />
                  </div>
                </div>

                {/* Microclimatic Thermal Field Chart */}
                <div
                  className={`${
                    dashboardMapExpanded ? 'lg:col-span-12' : 'lg:col-span-5'
                  } bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 transition-all`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-500">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          Gradiente Térmico
                        </h2>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Mitigación UHI (-2.4 °C)
                        </span>
                      </div>
                    </div>

                    <AIReasoningBadge
                      metricName="Gradiente Térmico Diurno"
                      value="-2.4 °C"
                      unit=""
                      scenarioName={`Escenario ${selectedScenario || '1'}`}
                    />
                  </div>

                  <div className="h-[460px]">
                    <TemperatureChart scenarioId={selectedScenario} />
                  </div>
                </div>
              </div>

              {/* Secondary Microclimate Analytics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Humidity Chart */}
                <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-base">💧</span>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          Humedad Relativa
                        </h3>
                        <span className="text-[10px] text-slate-500">Promedio: 68.4%</span>
                      </div>
                    </div>
                    <AIReasoningBadge
                      metricName="Humedad Relativa y Evapotranspiración"
                      value="68.4"
                      unit="%"
                      scenarioName={`Escenario ${selectedScenario || '1'}`}
                    />
                  </div>
                  <div className="h-64">
                    <HumidityChart scenarioId={selectedScenario} />
                  </div>
                </div>

                {/* Wind Velocity Chart */}
                <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-base">💨</span>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          Velocidad de Viento
                        </h3>
                        <span className="text-[10px] text-slate-500">Media: 3.2 m/s</span>
                      </div>
                    </div>
                    <AIReasoningBadge
                      metricName="Régimen de Vientos y Cañones Urbanos"
                      value="3.2"
                      unit="m/s"
                      scenarioName={`Escenario ${selectedScenario || '1'}`}
                    />
                  </div>
                  <div className="h-64">
                    <WindChart scenarioId={selectedScenario} />
                  </div>
                </div>

                {/* Thermal Comfort PET Chart */}
                <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🧘</span>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          Confort Térmico PET
                        </h3>
                        <span className="text-[10px] text-slate-500">Índice: 24.1 °C</span>
                      </div>
                    </div>
                    <AIReasoningBadge
                      metricName="Temperatura Fisiológica Equivalente (PET)"
                      value="24.1"
                      unit="°C"
                      scenarioName={`Escenario ${selectedScenario || '1'}`}
                    />
                  </div>
                  <div className="h-64">
                    <PETChart scenarioId={selectedScenario} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: Gemelo Digital 3D */}
          {activeModule === '3d-twin' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
                    <Box className="w-5 h-5 text-cyan-500" />
                    <span>Gemelo Digital 3D (Simulación ENVI-met &amp; Microclima)</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Inspección volumétrica interactiva con sombreado solar, dosel arbóreo y dinámica microclimática
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <AIReasoningBadge
                    metricName="Modelo Tridimensional y Balance de Energía 3D"
                    value="3D Solver"
                    unit=""
                    scenarioName={`Escenario ${selectedScenario || '1'}`}
                  />
                  <div className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-mono font-bold">
                    Three.js WebGL Engine
                  </div>
                </div>
              </div>

              <div className="h-[760px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
                <DigitalTwin3DViewer scenarioId={selectedScenario} />
              </div>
            </div>
          )}

          {/* VIEW: Cartografía 2D Completa */}
          {activeModule === 'maps' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
                    <MapPin className="w-5 h-5 text-teal-500" />
                    <span>Cartografía Territorial GIS 2D</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Visualización de capas multiespectrales, arbolado urbano censado y polígonos de intervención
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <AIReasoningBadge
                    metricName="Análisis Geoespacial 2D y Autocorrelación"
                    value="EPSG:4326"
                    unit=""
                    scenarioName={`Escenario ${selectedScenario || '1'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-[10px] text-slate-500 block">Índice Foliar (LAI)</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">3.2 m²/m²</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-[10px] text-slate-500 block">Delta UHI Máx</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">-3.8 °C</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-[10px] text-slate-500 block">Capacidad SUDs</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">4,250 m³</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-500 block">Árboles Censados</span>
                  <span className="font-bold text-emerald-500">1,420 ind.</span>
                </div>
              </div>

              <div className="h-[760px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
                <MapContainer scenarioId={selectedScenario} />
              </div>
            </div>
          )}

          {/* VIEW: IA Predictiva & Recomendaciones */}
          {activeModule === 'predictive' && (
            <div className="animate-in fade-in duration-300">
              <AIPredictiveRecommender />
            </div>
          )}

          {/* VIEW: Reportes Técnicos */}
          {activeModule === 'reports' && (
            <div className="animate-in fade-in duration-300">
              <ReportsDashboard />
            </div>
          )}

          {/* VIEW: Motor ML (5 Modelos) */}
          {activeModule === 'ml' && (
            <div className="animate-in fade-in duration-300">
              <MLEngineDashboard onTrainingStateChange={setIsTrainingActive} />
            </div>
          )}

          {/* VIEW: Asistente Groq IA Console */}
          {activeModule === 'groq-chat' && (
            <div className="animate-in fade-in duration-300 max-w-4xl mx-auto">
              <GroqChatDrawer scenarioId={selectedScenario} />
            </div>
          )}

          {/* VIEW: Configuración & API Keys */}
          {activeModule === 'settings' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
                <div className="flex items-center gap-3 pb-6 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-500">
                    <Sliders className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Configuración del Sistema &amp; Credenciales
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Gestiona la clave de Groq Cloud y los parámetros del Gemelo Digital
                    </p>
                  </div>
                </div>

                {/* Groq Key Setting */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-500" />
                    <span>API Key de Groq Cloud (Opcional)</span>
                  </label>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Si ingresas tu clave personal de Groq (`gsk_...`), el asistente utilizará inferencia directa de Llama 3.3 70B Versatile con latencias inferiores a 500ms. Si no se provee, el sistema opera con el motor de razonamiento microclimático integrado.
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="password"
                      placeholder="gsk_..."
                      value={settingsApiKey}
                      onChange={(e) => setSettingsApiKey(e.target.value)}
                      className="flex-1 px-4 py-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={handleSaveSettingsKey}
                      className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                    >
                      {settingsSaved ? <CheckCircle className="w-4 h-4" /> : null}
                      <span>{settingsSaved ? 'Guardado' : 'Guardar Clave'}</span>
                    </button>
                  </div>
                </div>

                {/* GIS Telemetry Settings */}
                <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Parámetros de Referencia Espacial
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Sistema de Referencia (CRS)</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">EPSG:4326 (WGS 84)</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Resolución de Malla ENVI-met</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">2.0m × 2.0m × 2.0m (DX/DY/DZ)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Action Button (FAB) for Langflow Agent (Always visible) */}
      <button
        onClick={() => setIsGroqDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-2xl shadow-emerald-500/40 border border-white/20 hover:scale-105 active:scale-95 transition-all group"
        title="Abrir Chat con el Agente de Langflow"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-200"></span>
        </span>
        <Workflow className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        <span>Agente Langflow IA</span>
      </button>

      {/* Floating Langflow Assistant Modal / Drawer (available from any view) */}
      {isGroqDrawerOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsGroqDrawerOpen(false)
          }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-2xl">
            <button
              onClick={() => setIsGroqDrawerOpen(false)}
              className="absolute -top-3 -right-3 z-20 w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-white flex items-center justify-center text-sm shadow-xl hover:bg-slate-800"
              title="Cerrar asistente"
            >
              ✕
            </button>
            <GroqChatDrawer
              scenarioId={selectedScenario}
              isOpen={isGroqDrawerOpen}
              onClose={() => setIsGroqDrawerOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
