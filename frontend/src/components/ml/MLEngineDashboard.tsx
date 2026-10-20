'use client'

import React, { useState, useEffect } from 'react'
import { Maximize2, Minimize2, FileSpreadsheet } from 'lucide-react'
import { exportTableToCSV } from '@/utils/exportUtils'
import { getApiUrl } from '@/utils/api'

import ScientificValidationSuite, {
  ModelMetric,
  StatisticalTestsData
} from './ScientificValidationSuite'

export default function MLEngineDashboard({
  onTrainingStateChange
}: {
  onTrainingStateChange?: (isTraining: boolean) => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [datasets, setDatasets] = useState<any[]>([])
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('')
  const [targetVariable, setTargetVariable] = useState<string>('temperature')
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [isSeedingBenchmark, setIsSeedingBenchmark] = useState<boolean>(false)

  const [jobId, setJobId] = useState<string | null>(null)
  const [jobStatus, setJobStatus] = useState<string>('')
  const [progress, setProgress] = useState<number>(0)
  const [isTraining, setIsTraining] = useState<boolean>(false)

  const [models, setModels] = useState<ModelMetric[]>([])
  const [statsData, setStatsData] = useState<StatisticalTestsData | null>(null)

  // Zoom de tabla y pantalla completa
  const [tableFontSize, setTableFontSize] = useState<'compact' | 'normal' | 'large'>('normal')
  const [isTableFullscreen, setIsTableFullscreen] = useState<boolean>(false)

  const handleExportModelsCSV = () => {
    const headers = ['Modelo ML', 'Tipo de Modelo', 'RMSE', 'MAE', 'R2 Score', 'MSE', 'MAPE (%)', 'Estado Activo']
    const rows = models.map(m => [
      m.name,
      m.model_type,
      m.metrics?.rmse?.toFixed(4) || '—',
      m.metrics?.mae?.toFixed(4) || '—',
      m.metrics?.r2?.toFixed(4) || '—',
      m.metrics?.mse?.toFixed(4) || '—',
      `${m.metrics?.mape?.toFixed(2) || '—'}%`,
      m.is_active ? 'Activo (Ganador)' : 'Comparativo'
    ])
    exportTableToCSV(headers, rows, 'benchmark_modelos_ml_5fold.csv')
  }

  // Initialize persistent states from sessionStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    const savedDatasetId = sessionStorage.getItem('ml_selected_dataset_id')
    const savedTargetVar = sessionStorage.getItem('ml_target_variable')
    const savedJobId = sessionStorage.getItem('ml_job_id')
    const savedIsTraining = sessionStorage.getItem('ml_is_training') === 'true'
    const savedProgress = sessionStorage.getItem('ml_progress')
    const savedModels = sessionStorage.getItem('ml_models')
    const savedStats = sessionStorage.getItem('ml_stats_data')

    if (savedDatasetId) setSelectedDatasetId(savedDatasetId)
    if (savedTargetVar) setTargetVariable(savedTargetVar)
    if (savedJobId) setJobId(savedJobId)
    if (savedIsTraining) setIsTraining(true)
    if (savedProgress) setProgress(parseFloat(savedProgress))
    if (savedModels) {
      try { setModels(JSON.parse(savedModels)) } catch (e) {}
    }
    if (savedStats) {
      try { setStatsData(JSON.parse(savedStats)) } catch (e) {}
    }
  }, [])

  // Synchronize state changes to sessionStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (selectedDatasetId) sessionStorage.setItem('ml_selected_dataset_id', selectedDatasetId)
    if (targetVariable) sessionStorage.setItem('ml_target_variable', targetVariable)
    if (jobId) sessionStorage.setItem('ml_job_id', jobId)
    sessionStorage.setItem('ml_is_training', isTraining ? 'true' : 'false')
    sessionStorage.setItem('ml_progress', progress.toString())
    if (models.length > 0) sessionStorage.setItem('ml_models', JSON.stringify(models))
    if (statsData) sessionStorage.setItem('ml_stats_data', JSON.stringify(statsData))
  }, [selectedDatasetId, targetVariable, jobId, isTraining, progress, models, statsData])

  useEffect(() => {
    onTrainingStateChange?.(isTraining)
  }, [isTraining, onTrainingStateChange])

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 6000)
  }

  const getAuthHeaders = (): Record<string, string> => {
    if (typeof window === 'undefined') return {}
    const token = localStorage.getItem('access_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const apiUrl = getApiUrl()

  // Fetch available datasets
  const fetchDatasets = async () => {
    try {
      const res = await fetch(`${apiUrl}/ml/datasets`, {
        headers: getAuthHeaders()
      })
      if (res.ok) {
        const data = await res.json()
        setDatasets(data)
        const savedDatasetId = typeof window !== 'undefined' ? sessionStorage.getItem('ml_selected_dataset_id') : null
        if (data.length > 0 && !selectedDatasetId && !savedDatasetId) {
          setSelectedDatasetId(data[0].id)
        }
      }
    } catch (err) {
      console.error('Error fetching datasets:', err)
    }
  }

  useEffect(() => {
    fetchDatasets()
  }, [])

  // Poll training job status
  useEffect(() => {
    if (!jobId || !isTraining) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${apiUrl}/ml/jobs/${jobId}`, {
          headers: getAuthHeaders()
        })
        if (res.ok) {
          const data = await res.json()
          setProgress(data.progress)
          setJobStatus(data.status)

          if (data.status === 'completed') {
            setIsTraining(false)
            sessionStorage.setItem('ml_is_training', 'false')
            showToast('¡Entrenamiento completado exitosamente! Evaluación de modelos finalizada.', 'success')
            fetchJobResults(jobId)
          } else if (data.status === 'failed') {
            setIsTraining(false)
            sessionStorage.setItem('ml_is_training', 'false')
            showToast(`Error en el entrenamiento: ${data.error_message || 'Fallo inesperado'}`, 'error')
          }
        }
      } catch (err) {
        console.error('Error polling job status:', err)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [jobId, isTraining])

  const fetchJobResults = async (id: string) => {
    try {
      const res = await fetch(`${apiUrl}/ml/jobs/${id}/results`, {
        headers: getAuthHeaders()
      })
      if (res.ok) {
        const data = await res.json()
        setModels(data.models || [])
        setStatsData(data.statistical_tests || null)
      }
    } catch (err) {
      console.error('Error fetching job results:', err)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`${apiUrl}/ml/datasets/upload`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      })
      if (res.ok) {
        const data = await res.json()
        setDatasets(prev => [data, ...prev])
        setSelectedDatasetId(data.id)
        setFile(null)
        showToast(`Dataset '${data.name}' subido correctamente con ${data.rows_count} registros.`, 'success')
      } else {
        const errData = await res.json().catch(() => ({}))
        const msg = (typeof errData.detail === 'string' ? errData.detail : errData.message) || 'Error al subir el dataset'
        if (res.status === 401) {
          showToast('Sesión no válida o expirada. Por favor vuelva a iniciar sesión.', 'error')
        } else {
          showToast(`No se pudo subir el dataset: ${msg}`, 'error')
        }
      }
    } catch (err: any) {
      console.error(err)
      showToast(`Error de conexión al servidor: ${err?.message || 'Fallo inesperado'}`, 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSeedBenchmark = async () => {
    setIsSeedingBenchmark(true)
    try {
      const res = await fetch(`${apiUrl}/ml/datasets/seed-benchmark`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      if (res.ok) {
        const data = await res.json()
        showToast('Dataset empírico real (1,000 registros) cargado con éxito.', 'success')
        await fetchDatasets()
        setSelectedDatasetId(data.id)
      } else {
        const errData = await res.json().catch(() => ({}))
        showToast(`No se pudo cargar el benchmark: ${errData.detail || 'Error'}`, 'error')
      }
    } catch (err: any) {
      console.error(err)
      showToast(`Error al cargar dataset real: ${err?.message || 'Servidor no disponible'}`, 'error')
    } finally {
      setIsSeedingBenchmark(false)
    }
  }

  const handleStartTraining = async () => {
    if (!selectedDatasetId) {
      showToast('Selecciona un dataset primero para iniciar el entrenamiento.', 'info')
      return
    }

    setIsTraining(true)
    setProgress(5)
    setJobStatus('queued')

    const formData = new FormData()
    formData.append('dataset_id', selectedDatasetId)
    formData.append('target_variable', targetVariable)
    formData.append('name', 'Entrenamiento 5 Modelos ML')

    try {
      const res = await fetch(`${apiUrl}/ml/train`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        setJobId(data.job_id)
        showToast('Entrenamiento de 5 modelos ML iniciado en segundo plano.', 'info')
      } else {
        setIsTraining(false)
        const errData = await res.json().catch(() => ({}))
        showToast(`Error al iniciar entrenamiento: ${errData.detail || 'Fallo en servidor'}`, 'error')
      }
    } catch (err: any) {
      console.error(err)
      setIsTraining(false)
      showToast(`Error de conexión: ${err?.message || 'Servidor no disponible'}`, 'error')
    }
  }

  const handleActivateModel = async (modelId: string) => {
    try {
      const res = await fetch(`${apiUrl}/ml/models/${modelId}/activate`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      if (res.ok) {
        setModels(prev =>
          prev.map(m => ({ ...m, is_active: m.id === modelId }))
        )
        const targetModel = models.find(m => m.id === modelId)
        showToast(`Modelo '${targetModel?.name || 'Seleccionado'}' activado oficialmente para el Dashboard.`, 'success')
      } else {
        const errData = await res.json().catch(() => ({}))
        showToast(`No se pudo activar el modelo: ${errData.detail || 'Error'}`, 'error')
      }
    } catch (err) {
      console.error(err)
      showToast('Error de conexión al activar el modelo', 'error')
    }
  }

  const getModelTypeBadge = (type: string) => {
    if (type === 'stacking') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 shrink-0">
          🔸 Híbrido 1 (Stacking)
        </span>
      )
    }
    if (type === 'cnn_lstm') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 shrink-0">
          🔸 Híbrido 2 (CNN-LSTM)
        </span>
      )
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 shrink-0">
        🔹 Tradicional
      </span>
    )
  }

  const activeModel = models.find(m => m.is_active)
  const winningModel = models.find(m => m.id === statsData?.winning_model_id) || models[0]

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`p-4 rounded-2xl border backdrop-blur-xl flex items-center justify-between shadow-2xl transition-all duration-300 ${
          toast.type === 'error'
            ? 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300'
            : toast.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
            : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-700 dark:text-cyan-300'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-xl">
              {toast.type === 'error' ? '❌' : toast.type === 'success' ? '✅' : 'ℹ️'}
            </span>
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-xs font-bold px-2 py-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-cyan-800 dark:from-cyan-950 dark:via-teal-900 dark:to-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden border border-teal-500/30 dark:border-teal-800/40">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-cyan-400/15 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 dark:text-teal-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-teal-400/30 dark:border-teal-500/30">
            <span>🤖</span> Motor de ML v2.0
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
            Entrenamiento y Selección de Modelos ML (3 Tradicionales + 2 Híbridos)
          </h1>
          <p className="text-teal-50 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            Entrena metamodelos sustitutos ultrarrápidos para predecir microclima en milisegundos en el Dashboard. Compara los 3 modelos tradicionales (<strong className="text-teal-200 dark:text-teal-300 font-bold">XGBoost</strong>, <strong className="text-teal-200 dark:text-teal-300 font-bold">Random Forest</strong>, <strong className="text-teal-200 dark:text-teal-300 font-bold">SVR</strong>) frente a los 2 híbridos (<strong className="text-amber-200 dark:text-amber-300 font-bold">Stacking Ensemble</strong> y <strong className="text-purple-200 dark:text-purple-300 font-bold">CNN-LSTM Neural Net</strong>) con validación cruzada 5-Fold.
          </p>
        </div>
      </div>

      {/* Dataset & Training Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Upload Dataset */}
        <div className="p-6 bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            1. Cargar Dataset Urbano (CSV / GeoJSON)
          </h3>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Selecciona un archivo (.csv o .geojson)</label>
              <input
                type="file"
                accept=".csv, .geojson, .json"
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-600 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-200 dark:file:bg-slate-800 file:text-teal-700 dark:file:text-teal-400 hover:file:bg-slate-300 dark:hover:file:bg-slate-700 cursor-pointer border border-slate-300 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 p-2"
              />
              {selectedDatasetId && (
                <div className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                  <span>📁 Dataset Activo en Memoria:</span>
                  <span className="font-bold">{datasets.find(d => d.id === selectedDatasetId)?.name || 'Dataset Cargado'}</span>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={!file || isUploading}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Subiendo dataset...</span>
                </>
              ) : (
                <span>Subir Dataset Personalizado</span>
              )}
            </button>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleSeedBenchmark}
                disabled={isSeedingBenchmark || isTraining}
                className="w-full py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition-all flex items-center justify-center gap-2 border border-emerald-500/30 shadow-sm"
              >
                {isSeedingBenchmark ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                    <span>Cargando Benchmark Real...</span>
                  </>
                ) : (
                  <>
                    <span>🔬 Cargar Dataset Real de Referencia (UTHECA - 1,000 filas)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Card 2: Training Controls */}
        <div className="p-6 bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            2. Configurar y Ejecutar 5 Modelos ML
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Dataset Seleccionado</label>
              <select
                value={selectedDatasetId}
                onChange={e => setSelectedDatasetId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-teal-500"
              >
                {datasets.length === 0 && <option value="">No hay datasets subidos</option>}
                {datasets.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.rows_count} filas)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Variable Microclimática Objetivo</label>
              <select
                value={targetVariable}
                onChange={e => setTargetVariable(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="temperature">Temperatura del Aire (°C)</option>
                <option value="humidity">Humedad Relativa (%)</option>
                <option value="pet">PET (Equivalente Fisiológico °C)</option>
                <option value="wind_speed">Velocidad del Viento (m/s)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleStartTraining}
              disabled={isTraining || !selectedDatasetId}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/20"
            >
              {isTraining ? `Entrenando 5 Modelos (${progress.toFixed(0)}%)...` : 'Iniciar Entrenamiento de 5 Modelos'}
            </button>
          </div>

          {/* Progress Bar */}
          {isTraining && (
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                <span>Estado: {jobStatus}</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-300 dark:border-slate-800">
                <div
                  className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🏆 Panel de Selección del Mejor Modelo (ÚNICO CONTROL DE ACTIVACIÓN) */}
      {models.length > 0 && (
        <div className="p-6 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-slate-50 dark:from-emerald-950/60 dark:via-slate-900 dark:to-teal-950/60 border border-emerald-300 dark:border-emerald-500/40 rounded-3xl shadow-xl space-y-4 relative overflow-hidden transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-200 dark:border-emerald-500/20 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-500/30">
                <span>🏆</span> Modelo Recomendado Estadísticamente
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <span>{winningModel?.name}</span>
                {getModelTypeBadge(winningModel?.model_type)}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {winningModel?.is_active ? (
                <span className="px-4 py-2 rounded-2xl bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-500/40 shadow-inner flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                  Modelo Activo para el Dashboard
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleActivateModel(winningModel?.id)}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-emerald-600/25 hover:scale-105 active:scale-95"
                >
                  ⭐ Activar este Modelo Recomendado
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-white dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-slate-600 dark:text-slate-400 block font-semibold mb-1">Error Cuadrático (RMSE)</span>
              <span className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">{winningModel?.metrics?.rmse?.toFixed(4)}</span>
            </div>
            <div className="p-3.5 bg-white dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-slate-600 dark:text-slate-400 block font-semibold mb-1">Precisión R² Score</span>
              <span className="text-lg font-mono font-bold text-teal-600 dark:text-teal-400">{(winningModel?.metrics?.r2 * 100).toFixed(2)}%</span>
            </div>
            <div className="p-3.5 bg-white dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-slate-600 dark:text-slate-400 block font-semibold mb-1">Cambiar Modelo Oficial Manualmente</span>
              <select
                value={activeModel?.id || ''}
                onChange={e => e.target.value && handleActivateModel(e.target.value)}
                className="w-full mt-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                {models.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.is_active ? 'Activo Actualmente' : 'Seleccionar'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Model Performance Comparison Table */}
      {models.length > 0 && (
        <div className="p-6 bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Tabla Comparativa (3 Tradicionales + 2 Híbridos)</span>
                <span className="text-xs font-normal text-slate-600 dark:text-slate-400">Validación Cruzada 5-Fold</span>
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {/* Controles de Zoom Tipográfico */}
              <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    if (tableFontSize === 'large') setTableFontSize('normal')
                    else if (tableFontSize === 'normal') setTableFontSize('compact')
                  }}
                  disabled={tableFontSize === 'compact'}
                  className="px-2 py-1 rounded-lg hover:text-slate-900 dark:hover:text-white font-bold font-mono disabled:opacity-40"
                  title="Disminuir Tamaño de Letra (A-)"
                >
                  A-
                </button>
                <span className="px-1 text-[10px] font-mono text-slate-400 uppercase">
                  {tableFontSize === 'compact' ? 'Min' : tableFontSize === 'normal' ? 'Norm' : 'Max'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (tableFontSize === 'compact') setTableFontSize('normal')
                    else if (tableFontSize === 'normal') setTableFontSize('large')
                  }}
                  disabled={tableFontSize === 'large'}
                  className="px-2 py-1 rounded-lg hover:text-slate-900 dark:hover:text-white font-bold font-mono disabled:opacity-40"
                  title="Aumentar Tamaño de Letra (A+)"
                >
                  A+
                </button>
              </div>

              {/* Descargar Tabla Excel */}
              <button
                type="button"
                onClick={handleExportModelsCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all"
                title="Descargar Métricas de Modelos en Formato Excel (.csv UTF-8)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel</span>
              </button>

              {/* Maximizar Tabla */}
              <button
                type="button"
                onClick={() => setIsTableFullscreen(true)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                title="Ampliar Tabla a Pantalla Completa"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className={`w-full text-left border-collapse ${
              tableFontSize === 'compact'
                ? 'text-xs [&_th]:py-2 [&_th]:px-3 [&_td]:py-2 [&_td]:px-3'
                : tableFontSize === 'large'
                ? 'text-base [&_th]:py-4 [&_th]:px-5 [&_td]:py-4 [&_td]:px-5'
                : 'text-sm [&_th]:py-3 [&_th]:px-4 [&_td]:py-3.5 [&_td]:px-4'
            }`}>
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-950/60 uppercase tracking-wider">
                  <th className="py-3 px-4">Modelo ML</th>
                  <th className="py-3 px-4">Tipo de Modelo</th>
                  <th className="py-3 px-4">RMSE</th>
                  <th className="py-3 px-4">MAE</th>
                  <th className="py-3 px-4">R² Score</th>
                  <th className="py-3 px-4">MSE</th>
                  <th className="py-3 px-4">MAPE (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
                {models.map(m => (
                  <tr key={m.id} className={`hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors ${m.is_active ? 'bg-teal-500/10' : ''}`}>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      {m.is_active && <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />}
                      {m.name}
                    </td>
                    <td className="py-3.5 px-4">{getModelTypeBadge(m.model_type)}</td>
                    <td className="py-3.5 px-4 font-mono text-teal-600 dark:text-teal-400">{m.metrics?.rmse?.toFixed(4)}</td>
                    <td className="py-3.5 px-4 font-mono">{m.metrics?.mae?.toFixed(4)}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-600 dark:text-emerald-400">{m.metrics?.r2?.toFixed(4)}</td>
                    <td className="py-3.5 px-4 font-mono">{m.metrics?.mse?.toFixed(4)}</td>
                    <td className="py-3.5 px-4 font-mono">{m.metrics?.mape?.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL FULLSCREEN: TABLA DE MODELOS MAXIMIZADA */}
      {isTableFullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-2xl animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-6xl h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-500">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Tabla Comparativa de Modelos ML (Vista Ampliada)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Evaluación y Desempeño en Validación Cruzada 5-Fold
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleExportModelsCSV}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Descargar Excel (.csv)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsTableFullscreen(false)}
                  className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                  title="Cerrar vista ampliada / Disminuir (Esc)"
                >
                  <Minimize2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto rounded-2xl border border-slate-200 dark:border-slate-800 p-2">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="py-3 px-4">Modelo ML</th>
                    <th className="py-3 px-4">Tipo de Modelo</th>
                    <th className="py-3 px-4">RMSE</th>
                    <th className="py-3 px-4">MAE</th>
                    <th className="py-3 px-4">R² Score</th>
                    <th className="py-3 px-4">MSE</th>
                    <th className="py-3 px-4">MAPE (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {models.map(m => (
                    <tr key={m.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${m.is_active ? 'bg-teal-500/10' : ''}`}>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {m.is_active && <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />}
                        {m.name}
                      </td>
                      <td className="py-3.5 px-4">{getModelTypeBadge(m.model_type)}</td>
                      <td className="py-3.5 px-4 font-mono text-teal-600 dark:text-teal-400 font-bold">{m.metrics?.rmse?.toFixed(4)}</td>
                      <td className="py-3.5 px-4 font-mono">{m.metrics?.mae?.toFixed(4)}</td>
                      <td className="py-3.5 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold">{m.metrics?.r2?.toFixed(4)}</td>
                      <td className="py-3.5 px-4 font-mono">{m.metrics?.mse?.toFixed(4)}</td>
                      <td className="py-3.5 px-4 font-mono">{m.metrics?.mape?.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 🔬 Suite Completa de Validación Científica y Gráficas para Publicación */}
      {models.length > 0 && (
        <ScientificValidationSuite
          models={models}
          statsData={statsData}
          targetVariable={targetVariable}
          onActivateModel={handleActivateModel}
        />
      )}
    </div>
  )
}
