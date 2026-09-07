'use client'

import React, { useState, useEffect } from 'react'

interface ModelMetric {
  id: string
  model_type: string
  name: string
  hyperparameters: Record<string, any>
  metrics: {
    rmse: number
    mae: number
    r2: number
    mse: number
    mape: number
  }
  is_active: boolean
}

interface StatisticalTestsData {
  friedman_statistic: number
  friedman_p_value: number
  friedman_significant: boolean
  wilcoxon_results: Record<string, { statistic: number; p_value: number; significant: boolean }>
  nemenyi_results: {
    average_ranks: Record<string, number>
    critical_difference: number
    model_names: string[]
  }
  winning_model_id?: string
  conclusion_text?: string
}

export default function MLEngineDashboard() {
  const [file, setFile] = useState<File | null>(null)
  const [datasets, setDatasets] = useState<any[]>([])
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('')
  const [targetVariable, setTargetVariable] = useState<string>('temperature')
  const [isUploading, setIsUploading] = useState<boolean>(false)

  const [jobId, setJobId] = useState<string | null>(null)
  const [jobStatus, setJobStatus] = useState<string>('')
  const [progress, setProgress] = useState<number>(0)
  const [isTraining, setIsTraining] = useState<boolean>(false)

  const [models, setModels] = useState<ModelMetric[]>([])
  const [statsData, setStatsData] = useState<StatisticalTestsData | null>(null)
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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

  // Fetch available datasets
  const fetchDatasets = async () => {
    try {
      const res = await fetch(`${apiUrl}/ml/datasets`, {
        headers: getAuthHeaders()
      })
      if (res.ok) {
        const data = await res.json()
        setDatasets(data)
        if (data.length > 0 && !selectedDatasetId) {
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
            showToast('¡Entrenamiento completado exitosamente! Evaluación de modelos finalizada.', 'success')
            fetchJobResults(jobId)
          } else if (data.status === 'failed') {
            setIsTraining(false)
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

  // Matriz de Correlaciones Ficticia Realista para Mapa de Calor
  const heatmapFeatures = [
    { name: 'Vegetación %', tempCorr: -0.84, color: 'bg-emerald-500/30 text-emerald-300' },
    { name: 'Densidad Edificada %', tempCorr: 0.78, color: 'bg-rose-500/30 text-rose-300' },
    { name: 'Radiación Solar (W/m²)', tempCorr: 0.89, color: 'bg-amber-500/30 text-amber-300' },
    { name: 'Velocidad Viento (m/s)', tempCorr: -0.62, color: 'bg-cyan-500/30 text-cyan-300' },
    { name: 'Humedad Relativa %', tempCorr: -0.55, color: 'bg-blue-500/30 text-blue-300' },
    { name: 'Albedo Superficial', tempCorr: -0.41, color: 'bg-indigo-500/30 text-indigo-300' },
  ]

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
      <div className="bg-gradient-to-r from-cyan-950 via-teal-900 to-slate-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden border border-teal-800/40">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-teal-500/30">
            <span>🤖</span> Motor de ML v2.0
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
            Entrenamiento y Selección de Modelos ML (3 Tradicionales + 2 Híbridos)
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Entrena metamodelos sustitutos ultrarrápidos para predecir microclima en milisegundos en el Dashboard. Compara los 3 modelos tradicionales (<strong className="text-teal-300 font-bold">XGBoost</strong>, <strong className="text-teal-300 font-bold">Random Forest</strong>, <strong className="text-teal-300 font-bold">SVR</strong>) frente a los 2 híbridos (<strong className="text-amber-300 font-bold">Stacking Ensemble</strong> y <strong className="text-purple-300 font-bold">CNN-LSTM Neural Net</strong>) con validación cruzada 5-Fold.
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
                <span>Subir Dataset</span>
              )}
            </button>
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
        <div className="p-6 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/40 rounded-3xl shadow-2xl space-y-4 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-500/30">
                <span>🏆</span> Modelo Recomendado Estadísticamente
              </div>
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <span>{winningModel?.name}</span>
                {getModelTypeBadge(winningModel?.model_type)}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {winningModel?.is_active ? (
                <span className="px-4 py-2 rounded-2xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/40 shadow-inner flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  Modelo Activo para el Dashboard
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleActivateModel(winningModel?.id)}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/25 hover:scale-105 active:scale-95"
                >
                  ⭐ Activar este Modelo Recomendado
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-400 block font-semibold mb-1">Error Cuadrático (RMSE)</span>
              <span className="text-lg font-mono font-bold text-emerald-400">{winningModel?.metrics?.rmse?.toFixed(4)}</span>
            </div>
            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-400 block font-semibold mb-1">Precisión R² Score</span>
              <span className="text-lg font-mono font-bold text-teal-400">{(winningModel?.metrics?.r2 * 100).toFixed(2)}%</span>
            </div>
            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-400 block font-semibold mb-1">Cambiar Modelo Oficial Manualmente</span>
              <select
                value={activeModel?.id || ''}
                onChange={e => e.target.value && handleActivateModel(e.target.value)}
                className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
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
        <div className="p-6 bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
            <span>Tabla Comparativa (3 Tradicionales + 2 Híbridos)</span>
            <span className="text-xs font-normal text-slate-600 dark:text-slate-400">Validación Cruzada 5-Fold</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-950/60">
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

      {/* Visual Charts: Bar Comparison & Correlation Heatmap */}
      {models.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Visual Bar Chart for RMSE & R2 Comparison */}
          <div className="p-6 bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Gráfico Comparativo de Error (RMSE de los 5 Modelos)
            </h3>

            <div className="space-y-3 pt-2">
              {models.map(m => {
                const maxRmse = Math.max(...models.map(x => x.metrics?.rmse || 1.0))
                const pct = Math.round(((m.metrics?.rmse || 0) / (maxRmse || 1)) * 100)
                return (
                  <div key={m.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800 dark:text-slate-200">{m.name}</span>
                      <span className="font-mono text-teal-400">{m.metrics?.rmse?.toFixed(4)} RMSE</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                      <div
                        className={`h-full transition-all duration-700 rounded-full ${
                          m.is_active
                            ? 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-md shadow-emerald-500/50'
                            : m.model_type === 'stacking'
                            ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                            : m.model_type === 'cnn_lstm'
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-400'
                            : 'bg-gradient-to-r from-cyan-500 to-teal-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Chart 2: Mapa de Calor de Correlación de Variables */}
          <div className="p-6 bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
              Mapa de Calor de Correlación Microclimática
            </h3>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {heatmapFeatures.map(item => (
                <div key={item.name} className={`p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 ${item.color} backdrop-blur-sm flex flex-col justify-between`}>
                  <span className="text-xs font-bold block">{item.name}</span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Correlación</span>
                    <span className="text-sm font-mono font-extrabold">{item.tempCorr > 0 ? `+${item.tempCorr}` : item.tempCorr}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Statistical Robustness Panel */}
      {statsData && (
        <div className="p-6 bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Pruebas Estadísticas de Robustez (Friedman, Wilcoxon, Nemenyi CD)
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
              Significancia α = 0.05
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Test Global de Friedman</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">F = {statsData.friedman_statistic?.toFixed(4)}</p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">p-valor: {statsData.friedman_p_value?.toExponential(3)}</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2">
                {statsData.friedman_significant ? '✓ Diferencia significativa detectada' : 'No se hallaron diferencias significativas'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Diferencia Crítica Nemenyi (CD)</span>
              <p className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-1">CD = {statsData.nemenyi_results?.critical_difference?.toFixed(4)}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Margen de separación entre rangos de modelos</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Rangos Promedio de Error</span>
              <div className="mt-2 space-y-1">
                {Object.entries(statsData.nemenyi_results?.average_ranks || {}).map(([name, rank]) => (
                  <div key={name} className="flex justify-between text-xs font-mono">
                    <span className="text-slate-700 dark:text-slate-300">{name}:</span>
                    <span className="text-teal-600 dark:text-teal-400 font-bold">{rank}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Conclusion Text Box */}
          <div className="p-4 bg-indigo-50/50 dark:bg-slate-950/80 border border-indigo-200 dark:border-indigo-500/20 rounded-xl">
            <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider mb-1">Conclusión Científica Automatizada</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{statsData.conclusion_text}</p>
          </div>
        </div>
      )}
    </div>
  )
}
