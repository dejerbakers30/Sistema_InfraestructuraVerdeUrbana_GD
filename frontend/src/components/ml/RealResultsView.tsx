'use client'

import React, { useState, useEffect } from 'react'
import {
  Award,
  AlertTriangle,
  Download,
  Maximize2,
  Minimize2,
  FileSpreadsheet,
  CheckCircle2,
  Layers,
  Activity,
  Zap,
  RefreshCw,
  Info,
  ChevronRight,
  TrendingUp,
  BarChart2,
  ExternalLink
} from 'lucide-react'
import { getApiUrl } from '@/utils/api'
import { exportTableToCSV } from '@/utils/exportUtils'

interface SpatialMetric {
  rmse: number
  mae: number
  r2: number
  rmse_sd?: number
  mae_sd?: number
  r2_sd?: number
}

interface RealResultsData {
  source: string
  city: string
  period: string
  target: string
  target_label: string
  features: string[]
  backend_cnn: string
  hardware: string
  clean_log?: {
    filas_iniciales?: number
    filas_finales?: number
    fechas_finales?: number
    puntos_unicos?: number
    bloques_espaciales?: number
    [key: string]: any
  }
  metricas?: {
    espacial?: Record<string, SpatialMetric>
    temporal?: Record<string, SpatialMetric>
    nota_temporal?: string
  }
  latencia_ms_100?: Record<string, number>
  estadistica?: {
    friedman_chi2?: number
    friedman_p?: number
    CD_nemenyi?: number
    rangos_espacial?: Record<string, number>
    wilcoxon_holm?: Array<{
      modelo_a: string
      modelo_b: string
      p_unadjusted: number
      p_adjusted: number
      significant: boolean
    }>
    [key: string]: any
  }
  importancia_variables?: {
    porcentajes?: Record<string, number>
    valores_brutos?: Record<string, number>
  }
  figuras_disponibles?: string[]
}

const FIGURES_METADATA: Record<string, { title: string; subtitle: string; file: string; caption: string }> = {
  fig2: {
    title: 'Figura 2. Valores Observados vs. Predichos',
    subtitle: 'Validación cruzada espacial (GroupKFold por bloques de 500 m)',
    file: 'fig2_obs_pred.png',
    caption: 'Dispersión de temperatura de superficie (LST) observada vs predicha en los 5 pliegues espaciales independientes. La línea diagonal negra representa concordancia perfecta (y = x).'
  },
  fig3: {
    title: 'Figura 3. Análisis de Residuos y Homocedasticidad',
    subtitle: 'Distribución y dispersión de errores residuales en validación espacial',
    file: 'fig3_residuos.png',
    caption: 'Evaluación de homocedasticidad y normalidad de residuos (LST observada − LST predicha) para los 5 metamodelos. Confirma ausencia de deriva sistemática en zonas de alta densidad térmica.'
  },
  fig4: {
    title: 'Figura 4. Diagrama de Diferencia Crítica (CD) de Demšar',
    subtitle: 'Post-hoc Nemenyi bilateral a nivel α = 0.05 sobre 5 modelos',
    file: 'fig4_cd.png',
    caption: 'Diagrama de Demšar que ilustra el ranking promedio de cada metamodelo. Los modelos conectados por una barra horizontal gruesa no presentan diferencias estadísticamente significativas al valor crítico CD = 1.272.'
  },
  fig5: {
    title: 'Figura 5. Diagrama de Cajas (Boxplot) de RMSE',
    subtitle: 'Distribución de error cuadrático medio en los 5 pliegues espaciales',
    file: 'fig5_boxplot.png',
    caption: 'Variabilidad del RMSE a lo largo de los 5 pliegues de validación espacial por bloques. El Stacking Ensemble exhibe la mayor compacidad de varianza y la mediana más baja.'
  },
  fig6: {
    title: 'Figura 6. Evaluación Multicriterio Radar',
    subtitle: 'Trade-offs de precisión (1/RMSE), bondad de ajuste (R²), latencia y estabilidad',
    file: 'fig6_multicriterio.png',
    caption: 'Diagrama radial normalizado que contrasta precisión espacial, velocidad de inferencia computacional y resiliencia térmica en olas de calor para la selección del gemelo digital.'
  },
  fig7: {
    title: 'Figura 7. Importancia de Variables por Permutación',
    subtitle: 'Impacto biofísico relativo de los 10 predictores satelitales y meteorológicos',
    file: 'fig7_importancia.png',
    caption: 'Pérdida porcentual de desempeño (aumento relativo del RMSE) al permutar aleatoriamente cada variable predictora. Confirma la preponderancia de t2m, ssrd, NDVI y albedo.'
  }
}

export default function RealResultsView() {
  const [data, setData] = useState<RealResultsData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFigureKey, setActiveFigureKey] = useState<string>('fig2')
  const [isFullscreenFigure, setIsFullscreenFigure] = useState<boolean>(false)
  const [activeSection, setActiveSection] = useState<'spatial' | 'temporal' | 'stats' | 'figures'>('spatial')

  const apiUrl = getApiUrl()

  const fetchRealResults = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${apiUrl}/ml/real-results`)
      if (!res.ok) {
        throw new Error(`Error ${res.status}: No se pudieron cargar los resultados reales`)
      }
      const json = await res.json()
      setData(json)
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Error al conectar con la API de resultados reales')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRealResults()
  }, [])

  const spatialMetrics = data?.metricas?.espacial || {}
  const temporalMetrics = data?.metricas?.temporal || {}
  const latencies = data?.latencia_ms_100 || {}
  const stats = data?.estadistica || {}
  const cleanLog = data?.clean_log || {}

  const handleExportSpatialCSV = () => {
    const headers = ['Modelo ML', 'Tipo Validación', 'RMSE (°C)', 'MAE (°C)', 'R² Score', 'Latencia (ms/100pts)']
    const rows = Object.entries(spatialMetrics).map(([name, m]) => [
      name,
      'Validación Espacial (GroupKFold 500m)',
      m.rmse?.toFixed(4) || '—',
      m.mae?.toFixed(4) || '—',
      m.r2?.toFixed(4) || '—',
      latencies[name] ? `${latencies[name].toFixed(2)} ms` : '—'
    ])
    exportTableToCSV(headers, rows, 'resultados_reales_espaciales_trujillo.csv')
  }

  const handleExportTemporalCSV = () => {
    const headers = ['Modelo ML', 'Tipo Validación', 'RMSE (°C)', 'MAE (°C)', 'R² Score']
    const rows = Object.entries(temporalMetrics).map(([name, m]) => [
      name,
      'Validación Temporal por Escenas',
      m.rmse?.toFixed(4) || '—',
      m.mae?.toFixed(4) || '—',
      m.r2?.toFixed(4) || '—'
    ])
    exportTableToCSV(headers, rows, 'resultados_reales_temporales_trujillo.csv')
  }

  const currentFigure = FIGURES_METADATA[activeFigureKey] || FIGURES_METADATA.fig2
  const figureUrl = `${apiUrl}/ml/real-results/figures/${currentFigure.file}`
  const figureFallbackUrl = `/figures/real_results/${currentFigure.file}`

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner de Contexto Científico */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-teal-500/30">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider border border-teal-400/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Dataset Empírico Real Satelital & Metamodelos ML</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Resultados Validados de Publicación Científica (Trujillo, Perú)
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Resultados empíricos reales obtenidos mediante el acoplamiento de sensores multiespectrales 
              <strong className="text-teal-300"> Landsat 8-9</strong>, <strong className="text-teal-300">Sentinel-2</strong>, 
              reanálisis bioclimático <strong className="text-teal-300">ERA5-Land</strong>, cobertura <strong className="text-teal-300">ESA WorldCover</strong> y topografía <strong className="text-teal-300">SRTM</strong> (2023–2025).
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
            <button
              onClick={fetchRealResults}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600/30 hover:bg-teal-600/40 text-teal-200 border border-teal-500/40 text-xs font-bold transition-all shadow-sm"
              title="Recargar métricas desde API"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizar Datos</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="mt-6 pt-6 border-t border-teal-500/20 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/50">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Muestras Válidas (QC)</span>
            <span className="text-xl sm:text-2xl font-black text-white font-mono">15,862</span>
            <span className="text-[10px] text-teal-400 block mt-0.5">728 puntos en 145 bloques</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/50">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Escenas Satelitales</span>
            <span className="text-xl sm:text-2xl font-black text-white font-mono">23 fechas</span>
            <span className="text-[10px] text-teal-400 block mt-0.5">Ventana 2023–2025</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/50">
            <span className="text-[11px] font-semibold text-teal-300 block uppercase tracking-wider">Metamodelo Ganador</span>
            <span className="text-base sm:text-lg font-black text-amber-300 truncate block">Stacking Ensemble</span>
            <span className="text-[10px] text-slate-300 block mt-0.5">R² = 0.873 • RMSE = 1.907 °C</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/50">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Inferencia GD</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">4.60 ms</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">por cada 100 puntos</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSection('spatial')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSection === 'spatial'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Validación Espacial (GroupKFold)</span>
        </button>

        <button
          onClick={() => setActiveSection('temporal')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSection === 'temporal'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Validación Temporal por Escenas</span>
        </button>

        <button
          onClick={() => setActiveSection('stats')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSection === 'stats'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Pruebas Estadísticas (Demšar, 2006)</span>
        </button>

        <button
          onClick={() => setActiveSection('figures')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSection === 'figures'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Figuras de Publicación (2 a 7)</span>
        </button>
      </div>

      {/* SECTION 1: VALIDACIÓN ESPACIAL */}
      {activeSection === 'spatial' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Tabla 1. Desempeño en Validación Cruzada Espacial (GroupKFold por Bloques de 500 m)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Partición espacial independiente para prevenir autocorrelación espacial (N = 15,862 píxeles, 145 bloques).
              </p>
            </div>
            <button
              onClick={handleExportSpatialCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/60">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 uppercase tracking-wider">
                  <th className="py-3 px-4">Modelo ML</th>
                  <th className="py-3 px-4">RMSE (°C)</th>
                  <th className="py-3 px-4">MAE (°C)</th>
                  <th className="py-3 px-4">R² Score</th>
                  <th className="py-3 px-4">Latencia Inferencia</th>
                  <th className="py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {Object.entries(spatialMetrics).map(([name, m]) => {
                  const isWinner = name.toLowerCase().includes('stacking') && !name.includes('aleatoria')
                  const isBaseline = name.toLowerCase().includes('lineal')
                  const latency = latencies[name]

                  return (
                    <tr
                      key={name}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                        isWinner ? 'bg-amber-50/60 dark:bg-amber-950/20 font-medium' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        {isWinner && <Award className="w-4 h-4 text-amber-500 shrink-0" />}
                        <span>{name}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-teal-600 dark:text-teal-400 font-bold">
                        {m.rmse?.toFixed(3)}
                        {m.rmse_sd ? <span className="text-[11px] text-slate-400 font-normal"> ± {m.rmse_sd.toFixed(3)}</span> : ''}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {m.mae?.toFixed(3)}
                        {m.mae_sd ? <span className="text-[11px] text-slate-400 font-normal"> ± {m.mae_sd.toFixed(3)}</span> : ''}
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {m.r2?.toFixed(3)}
                        {m.r2_sd ? <span className="text-[11px] text-slate-400 font-normal"> ± {m.r2_sd.toFixed(3)}</span> : ''}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        {latency ? (
                          <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                            <Zap className="w-3 h-3 text-amber-500" />
                            {latency.toFixed(2)} ms / 100 pts
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {isWinner ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30">
                            🏆 Seleccionado
                          </span>
                        ) : isBaseline ? (
                          <span className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                            Referencia
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 font-medium">
                            Evaluado
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: VALIDACIÓN TEMPORAL Y AVISO CIENTÍFICO */}
      {activeSection === 'temporal' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Tabla 2. Desempeño en Validación Temporal por Escenas (Leave-One-Scene-Out)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Evaluación en 23 escenas satelitales no vistas (fechas completas excluidas del entrenamiento).
              </p>
            </div>
            <button
              onClick={handleExportTemporalCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
          </div>

          {/* CRITICAL SCIENTIFIC WARNING CALLOUT */}
          <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400/60 dark:border-amber-600/50 shadow-md">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-black text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                  Conclusión Metodológica Fundamental: Sesgo Estacional en Validación Temporal
                </h4>
                <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300/90 leading-relaxed font-medium">
                  {data?.metricas?.nota_temporal || (
                    "Con fechas no vistas (validación temporal por escenas) el modelo tiene R² < 0 debido al sesgo estacional no representable sin historia temporal completa en el punto."
                  )}
                </p>
                <p className="text-xs text-amber-700/80 dark:text-amber-400/80 leading-relaxed pt-1 border-t border-amber-300/40 dark:border-amber-700/40">
                  <strong>Implicación para el Gemelo Digital:</strong> Los metamodelos sustitutos interpolan con altísima fidelidad espacial en cualquier punto urbano dentro de las fechas analizadas (R² = 0.873, RMSE = 1.907 °C), pero predecir una fecha completamente futura sin asimilación de datos atmosféricos en tiempo real requiere el ciclo continuo de asimilación del gemelo digital.
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/60">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 uppercase tracking-wider">
                  <th className="py-3 px-4">Modelo ML</th>
                  <th className="py-3 px-4">RMSE (°C)</th>
                  <th className="py-3 px-4">MAE (°C)</th>
                  <th className="py-3 px-4">R² Score (Temporal)</th>
                  <th className="py-3 px-4">Diagnóstico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {Object.entries(temporalMetrics).map(([name, m]) => (
                  <tr key={name} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{name}</td>
                    <td className="py-3 px-4 font-mono text-teal-600 dark:text-teal-400">{m.rmse?.toFixed(3)}</td>
                    <td className="py-3 px-4 font-mono">{m.mae?.toFixed(3)}</td>
                    <td className="py-3 px-4 font-mono text-amber-600 dark:text-amber-400 font-bold">{m.r2?.toFixed(3)}</td>
                    <td className="py-3 px-4 text-xs text-slate-500">Sesgo estacional no observado en punto fijo</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: PRUEBAS ESTADÍSTICAS */}
      {activeSection === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Friedman Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-xs uppercase tracking-wider">
                <BarChart2 className="w-4 h-4" />
                <span>Prueba Global de Friedman (Demšar, 2006)</span>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                  χ² = {stats.friedman_chi2 ? stats.friedman_chi2.toFixed(2) : '71.48'}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  p = {stats.friedman_p ? stats.friedman_p.toExponential(2) : '1.09e-14'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Rechazo categórico de la hipótesis nula de equivalencia entre modelos (p &lt; 0.001). Existen diferencias estadísticamente significativas en el desempeño espacial entre las 5 arquitecturas.
              </p>
            </div>

            {/* Nemenyi Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Award className="w-4 h-4" />
                <span>Diferencia Crítica de Nemenyi (CD, α = 0.05)</span>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                  CD = {stats.CD_nemenyi ? stats.CD_nemenyi.toFixed(3) : '1.272'}
                </span>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
                  Rango Stacking = 1.43
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                El Stacking Ensemble obtiene el ranking medio más bajo (rango 1.43 frente a SVR 4.48). Una diferencia de rangos superior a 1.272 confirma superioridad científica con significancia estadística.
              </p>
            </div>
          </div>

          {/* Wilcoxon-Holm Matrix */}
          {stats.wilcoxon_holm && stats.wilcoxon_holm.length > 0 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Comparaciones Pareadas de Wilcoxon Signed-Rank con Ajuste de Holm-Bonferroni
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase">
                      <th className="py-2.5 px-3">Contraste de Modelos</th>
                      <th className="py-2.5 px-3">p-valor sin ajustar</th>
                      <th className="py-2.5 px-3">p-valor ajustado (Holm)</th>
                      <th className="py-2.5 px-3">Significancia (α=0.05)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {stats.wilcoxon_holm.map((w: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                          {w.modelo_a} vs. {w.modelo_b}
                        </td>
                        <td className="py-2 px-3 font-mono">{Number(w.p_unadjusted).toFixed(4)}</td>
                        <td className="py-2 px-3 font-mono text-teal-600 dark:text-teal-400 font-bold">
                          {Number(w.p_adjusted).toFixed(4)}
                        </td>
                        <td className="py-2 px-3">
                          {w.significant ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Significativo
                            </span>
                          ) : (
                            <span className="text-slate-400">No significativo</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: GALERÍA DE FIGURAS CIENTÍFICAS */}
      {activeSection === 'figures' && (
        <div className="space-y-6">
          {/* Figure Selectors */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {Object.entries(FIGURES_METADATA).map(([key, fig]) => {
              const isSelected = activeFigureKey === key
              return (
                <button
                  key={key}
                  onClick={() => setActiveFigureKey(key)}
                  className={`p-3 rounded-2xl text-left transition-all border flex flex-col justify-between ${
                    isSelected
                      ? 'bg-teal-600 text-white border-teal-500 shadow-md shadow-teal-600/20'
                      : 'bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-teal-500/50'
                  }`}
                >
                  <span className={`text-[11px] font-bold uppercase tracking-wider block ${
                    isSelected ? 'text-teal-100' : 'text-teal-600 dark:text-teal-400'
                  }`}>
                    {key.toUpperCase()}
                  </span>
                  <span className="text-xs font-black line-clamp-1 mt-1">{fig.title.split('.')[1] || fig.title}</span>
                </button>
              )
            })}
          </div>

          {/* Active Figure Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {currentFigure.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentFigure.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={figureUrl}
                  download={currentFigure.file}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600/10 hover:bg-teal-600/20 text-teal-700 dark:text-teal-300 border border-teal-500/30 text-xs font-bold transition-all"
                  title="Descargar Figura en Alta Resolución (300 DPI)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar PNG</span>
                </a>

                <button
                  onClick={() => setIsFullscreenFigure(true)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                  title="Ampliar Imagen a Pantalla Completa"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Figure Image Container */}
            <div className="w-full flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 min-h-[380px] overflow-hidden">
              <img
                src={figureUrl}
                alt={currentFigure.title}
                className="max-h-[520px] max-w-full object-contain rounded-lg shadow-sm hover:scale-[1.01] transition-transform duration-300"
                onError={(e) => {
                  // Fallback to static public figures directory
                  const target = e.currentTarget
                  if (!target.src.includes('/figures/real_results/')) {
                    target.src = figureFallbackUrl
                  }
                }}
              />
            </div>

            {/* Caption */}
            <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong className="text-slate-900 dark:text-white font-bold block mb-1">Nota Científica de Publicación:</strong>
              {currentFigure.caption}
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN MODAL FOR FIGURES */}
      {isFullscreenFigure && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {currentFigure.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {currentFigure.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={figureUrl}
                  download={currentFigure.file}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar PNG</span>
                </a>

                <button
                  onClick={() => setIsFullscreenFigure(false)}
                  className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                  title="Cerrar modal"
                >
                  <Minimize2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl">
              <img
                src={figureUrl}
                alt={currentFigure.title}
                className="max-h-[70vh] max-w-full object-contain"
                onError={(e) => {
                  const target = e.currentTarget
                  if (!target.src.includes('/figures/real_results/')) {
                    target.src = figureFallbackUrl
                  }
                }}
              />
            </div>

            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              {currentFigure.caption}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
