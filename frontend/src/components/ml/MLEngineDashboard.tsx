'use client'

import React, { useState, useEffect } from 'react'
import PrintPreviewModal from '../PrintPreviewModal'

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
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState<boolean>(false)

  // Fetch available datasets
  const fetchDatasets = async () => {
    try {
      const res = await fetch('/api/v1/ml/datasets')
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
        const res = await fetch(`/api/v1/ml/jobs/${jobId}`)
        if (res.ok) {
          const data = await res.json()
          setProgress(data.progress)
          setJobStatus(data.status)

          if (data.status === 'completed') {
            setIsTraining(false)
            fetchJobResults(jobId)
          } else if (data.status === 'failed') {
            setIsTraining(false)
            alert(`Error en el entrenamiento: ${data.error_message}`)
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
      const res = await fetch(`/api/v1/ml/jobs/${id}/results`)
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
      const res = await fetch('/api/v1/ml/datasets/upload', {
        method: 'POST',
        body: formData
      })
      if (res.ok) {
        const data = await res.json()
        setDatasets(prev => [data, ...prev])
        setSelectedDatasetId(data.id)
        setFile(null)
        alert('Dataset subido correctamente')
      } else {
        alert('Error al subir el dataset')
      }
    } catch (err) {
      console.error(err)
      alert('Error de conexión al subir dataset')
    } finally {
      setIsUploading(false)
    }
  }

  const handleStartTraining = async () => {
    if (!selectedDatasetId) {
      alert('Selecciona un dataset primero')
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
      const res = await fetch('/api/v1/ml/train', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        setJobId(data.job_id)
      } else {
        setIsTraining(false)
        alert('Error al iniciar el entrenamiento')
      }
    } catch (err) {
      console.error(err)
      setIsTraining(false)
      alert('Error de conexión')
    }
  }

  const handleActivateModel = async (modelId: string) => {
    try {
      const res = await fetch(`/api/v1/ml/models/${modelId}/activate`, {
        method: 'POST'
      })
      if (res.ok) {
        setModels(prev =>
          prev.map(m => ({ ...m, is_active: m.id === modelId }))
        )
        alert('Modelo activado oficialmente')
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-xl shadow-lg">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              Motor de ML v2.0
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Predicción Microclimática y Pruebas Estadísticas</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Entrenamiento de 5 modelos de ML (XGBoost, Random Forest, SVR, Stacking e Híbrido CNN-LSTM) con validación cruzada y análisis Nemenyi CD.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsPrintPreviewOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-sm font-semibold flex items-center gap-2 transition-all shadow-md"
        >
          <svg className="w-4 h-4 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Vista Previa a Impresión
        </button>
      </div>

      {/* Dataset & Training Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Upload Dataset */}
        <div className="p-6 bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            1. Cargar Dataset (CSV / GeoJSON)
          </h3>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Selecciona un archivo urbano (.csv o .geojson)</label>
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
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg shadow-teal-600/20"
            >
              {isUploading ? 'Subiendo...' : 'Subir Dataset'}
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
              {isTraining ? `Entrenando (${progress.toFixed(0)}%)...` : 'Iniciar Entrenamiento de 5 Modelos'}
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

      {/* Model Performance Comparison Table */}
      {models.length > 0 && (
        <div className="p-6 bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
            <span>Tabla Comparativa de Rendimiento (5 Modelos)</span>
            <span className="text-xs font-normal text-slate-600 dark:text-slate-400">Validación Cruzada 5-Fold</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-950/60">
                  <th className="py-3 px-4">Modelo ML</th>
                  <th className="py-3 px-4">RMSE</th>
                  <th className="py-3 px-4">MAE</th>
                  <th className="py-3 px-4">R² Score</th>
                  <th className="py-3 px-4">MSE</th>
                  <th className="py-3 px-4">MAPE (%)</th>
                  <th className="py-3 px-4 text-center">Estado / Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
                {models.map(m => (
                  <tr key={m.id} className={`hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors ${m.is_active ? 'bg-teal-500/10' : ''}`}>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      {m.is_active && <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />}
                      {m.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-teal-600 dark:text-teal-400">{m.metrics?.rmse?.toFixed(4)}</td>
                    <td className="py-3.5 px-4 font-mono">{m.metrics?.mae?.toFixed(4)}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-600 dark:text-emerald-400">{m.metrics?.r2?.toFixed(4)}</td>
                    <td className="py-3.5 px-4 font-mono">{m.metrics?.mse?.toFixed(4)}</td>
                    <td className="py-3.5 px-4 font-mono">{m.metrics?.mape?.toFixed(2)}%</td>
                    <td className="py-3.5 px-4 text-center">
                      {m.is_active ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                          Ganador Activo
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleActivateModel(m.id)}
                          className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          Activar Modelo
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {/* Print Preview Modal */}
      <PrintPreviewModal
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        title="Vista Previa de Impresión - Gemelo Digital ML"
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold">Resumen de Predicción Microclimática con ML</h2>
            <p className="text-sm text-gray-600">Evaluación rigurosa de 5 modelos de aprendizaje automático sobre variables ambientales.</p>
          </div>

          {models.length > 0 && (
            <div>
              <h3 className="text-sm font-bold border-b pb-1 mb-2">Tabla de Rendimiento de Modelos</h3>
              <table className="w-full text-xs text-left border">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="p-2 border">Modelo ML</th>
                    <th className="p-2 border">RMSE</th>
                    <th className="p-2 border">MAE</th>
                    <th className="p-2 border">R²</th>
                    <th className="p-2 border">MSE</th>
                    <th className="p-2 border">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map(m => (
                    <tr key={m.id} className="border-b">
                      <td className="p-2 border font-medium">{m.name}</td>
                      <td className="p-2 border font-mono">{m.metrics?.rmse?.toFixed(4)}</td>
                      <td className="p-2 border font-mono">{m.metrics?.mae?.toFixed(4)}</td>
                      <td className="p-2 border font-mono">{m.metrics?.r2?.toFixed(4)}</td>
                      <td className="p-2 border font-mono">{m.metrics?.mse?.toFixed(4)}</td>
                      <td className="p-2 border">{m.is_active ? 'Ganador Activo' : 'Evaluado'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {statsData && (
            <div>
              <h3 className="text-sm font-bold border-b pb-1 mb-2">Resultados Estadísticos (Friedman / Nemenyi)</h3>
              <p className="text-xs text-gray-700 leading-relaxed">{statsData.conclusion_text}</p>
            </div>
          )}
        </div>
      </PrintPreviewModal>
    </div>
  )
}
