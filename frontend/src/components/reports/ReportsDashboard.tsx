'use client'

import React, { useState } from 'react'
import ReportPreviewModal, { PreviewData } from './ReportPreviewModal'
import PrintableReportDocument from './PrintableReportDocument'

export default function ReportsDashboard() {
  const [reportName, setReportName] = useState('Reporte Descriptivo de Infraestructura Verde')
  const [reportType, setReportType] = useState<'green_infrastructure' | 'simulation' | 'ml_evaluation' | 'projects'>('green_infrastructure')
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | 'word'>('pdf')

  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [isDownloadingDirectly, setIsDownloadingDirectly] = useState(false)

  // Construct tailored data preview according to reportType
  const getTailoredPreviewData = (): PreviewData => {
    const generatedAt = new Date().toLocaleDateString('es-ES') + ' ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

    if (reportType === 'green_infrastructure') {
      return {
        title: reportName || 'Listado Descriptivo de Infraestructura Verde Urbana',
        report_type: 'green_infrastructure',
        format: selectedFormat,
        generated_at: generatedAt,
        summary: 'Inventario técnico y métricas bio-físicas de elementos de infraestructura verde urbana. Evalúa especies vegetales, dimensiones de copa, Índice de Área Foliar (LAI) y capacidad estimada de enfriamiento microclimático por evapotranspiración.',
        kpis: [
          { metric: 'Superficie Verde Total', value: '18.4 ha', status: 'Óptimo' },
          { metric: 'Arbolado Urbano Censado', value: '1,240 ej.', status: 'Normal' },
          { metric: 'Índice Foliar LAI Medio', value: '3.85', status: 'Alto' },
          { metric: 'Captación de CO₂ Est.', value: '45.2 t/año', status: 'Significativo' }
        ],
        green_infrastructure_list: [
          { id: 'GI-001', name: 'Bosque Urbano Central', type: 'Árbol (Jacaranda mimosifolia)', species: 'Jacaranda mimosifolia', height: 12.5, crown_diameter: 8.0, lai: 4.2, cooling_effect: '-2.3 °C' },
          { id: 'GI-002', name: 'Parque Lineal Avenida España', type: 'Arbustos & Césped', species: 'Ficus benjamina & Pennisetum', height: 2.1, crown_diameter: 3.5, lai: 2.8, cooling_effect: '-1.1 °C' },
          { id: 'GI-003', name: 'Techo Verde Municipal', type: 'Green Roof (Extensivo)', species: 'Sedum album / Sedum acre', height: 0.2, crown_diameter: 15.0, lai: 3.5, cooling_effect: '-3.8 °C (Cubierta)' },
          { id: 'GI-004', name: 'Jardín de Lluvia Plaza Mayor', type: 'Rain Garden / Bio-retención', species: 'Carex pendula & Iris pseudacorus', height: 0.8, crown_diameter: 6.0, lai: 3.1, cooling_effect: '-1.5 °C' },
          { id: 'GI-005', name: 'Jardín Vertical Edificio UNT', type: 'Vertical Garden', species: 'Heuchera & Nephrolepis exaltata', height: 8.0, crown_diameter: 12.0, lai: 4.8, cooling_effect: '-4.1 °C (Fachada)' }
        ],
        ml_models: [],
        time_series_sample: []
      }
    }

    if (reportType === 'simulation') {
      return {
        title: reportName || 'Resumen Microclimático y Confort Térmico PET',
        report_type: 'simulation',
        format: selectedFormat,
        generated_at: generatedAt,
        summary: 'Registro de datos descriptivos microclimáticos y simulación diurna de 24 horas. Incluye la curva de temperatura del aire, radiación solar, humedad relativa y la variación del Índice de Confort Térmico Fisiológico (PET).',
        kpis: [
          { metric: 'Temperatura Promedio', value: '25.4 °C', status: 'Normal' },
          { metric: 'Humedad Relativa Promedio', value: '64.5 %', status: 'Aceptable' },
          { metric: 'Velocidad de Viento Media', value: '2.4 m/s', status: 'Favorable' },
          { metric: 'Índice PET Promedio', value: '27.8 °C', status: 'Confortable' },
          { metric: 'Reducción Máx. UHI', value: '-2.6 °C', status: 'Significativo' }
        ],
        green_infrastructure_list: [],
        ml_models: [],
        time_series_sample: [
          { time: '08:00:00', temperature: 22.1, humidity: 72.0, pet: 23.5, wind_speed: 2.1 },
          { time: '10:00:00', temperature: 24.5, humidity: 68.0, pet: 26.2, wind_speed: 2.3 },
          { time: '12:00:00', temperature: 27.8, humidity: 60.0, pet: 30.1, wind_speed: 2.8 },
          { time: '14:00:00', temperature: 28.5, humidity: 58.0, pet: 31.4, wind_speed: 3.0 },
          { time: '16:00:00', temperature: 26.9, humidity: 63.0, pet: 29.0, wind_speed: 2.5 },
          { time: '18:00:00', temperature: 24.2, humidity: 70.0, pet: 25.3, wind_speed: 2.0 }
        ]
      }
    }

    if (reportType === 'ml_evaluation') {
      return {
        title: reportName || 'Benchmark Comparativo de Modelos ML & Pruebas Estadísticas',
        report_type: 'ml_evaluation',
        format: selectedFormat,
        generated_at: generatedAt,
        summary: 'Evaluación estadística comparativa entre 3 modelos de regresión tradicionales (XGBoost, Random Forest, SVR) y 2 metamodelos híbridos (Stacking Ensemble y CNN-LSTM Neural Net) para la predicción del microclima urbano.',
        kpis: [
          { metric: 'Modelo Recomendado', value: 'Stacking (XGB+RF)', status: 'Ganador Activo' },
          { metric: 'Precisión R² Score', value: '94.82 %', status: 'Sobresaliente' },
          { metric: 'RMSE de Regresión', value: '0.3214', status: 'Mínimo Error' },
          { metric: 'Test de Friedman', value: 'F = 18.42 (p < 0.001)', status: 'Significativo' },
          { metric: 'Diferencia Crítica Nemenyi', value: 'CD = 1.124', status: 'Distintivo' }
        ],
        green_infrastructure_list: [],
        time_series_sample: [],
        ml_models: [
          { name: 'Stacking Ensemble (XGB+RF)', rmse: 0.3214, mae: 0.2410, r2: 0.9482, mse: 0.1033, is_active: true },
          { name: 'CNN-LSTM Neural Net', rmse: 0.3340, mae: 0.2520, r2: 0.9412, mse: 0.1115, is_active: false },
          { name: 'Random Forest Regressor', rmse: 0.3451, mae: 0.2612, r2: 0.9391, mse: 0.1191, is_active: false },
          { name: 'XGBoost Regressor', rmse: 0.3580, mae: 0.2745, r2: 0.9345, mse: 0.1281, is_active: false },
          { name: 'Support Vector Regressor (SVR)', rmse: 0.4210, mae: 0.3315, r2: 0.9095, mse: 0.1772, is_active: false }
        ]
      }
    }

    // Default: 'projects' (Reporte Completo Integrado)
    return {
      title: reportName || 'Reporte Completo Integrado de Infraestructura Verde y ML',
      report_type: 'projects',
      format: selectedFormat,
      generated_at: generatedAt,
      summary: 'Informe ejecutivo consolidado que integra el inventario completo de infraestructura verde, los resultados de la simulación microclimática diurna y el benchmark comparativo de los modelos de aprendizaje automático.',
      kpis: [
        { metric: 'Superficie Verde Total', value: '18.4 ha', status: 'Óptimo' },
        { metric: 'Confort Térmico PET', value: '27.8 °C', status: 'Confortable' },
        { metric: 'Reducción Máx. Temp.', value: '-3.8 °C', status: 'Significativo' },
        { metric: 'Modelo ML Ganador', value: 'Stacking Ensemble', status: 'Activo' },
        { metric: 'Precisión R² ML', value: '94.82 %', status: 'Alto' }
      ],
      green_infrastructure_list: [
        { id: 'GI-001', name: 'Bosque Urbano Central', type: 'Árbol (Jacaranda mimosifolia)', species: 'Jacaranda mimosifolia', height: 12.5, crown_diameter: 8.0, lai: 4.2, cooling_effect: '-2.3 °C' },
        { id: 'GI-002', name: 'Parque Lineal Avenida España', type: 'Arbustos & Césped', species: 'Ficus benjamina & Pennisetum', height: 2.1, crown_diameter: 3.5, lai: 2.8, cooling_effect: '-1.1 °C' },
        { id: 'GI-003', name: 'Techo Verde Municipal', type: 'Green Roof (Extensivo)', species: 'Sedum album / Sedum acre', height: 0.2, crown_diameter: 15.0, lai: 3.5, cooling_effect: '-3.8 °C (Cubierta)' }
      ],
      time_series_sample: [
        { time: '08:00:00', temperature: 22.1, humidity: 72.0, pet: 23.5, wind_speed: 2.1 },
        { time: '12:00:00', temperature: 27.8, humidity: 60.0, pet: 30.1, wind_speed: 2.8 },
        { time: '16:00:00', temperature: 26.9, humidity: 63.0, pet: 29.0, wind_speed: 2.5 }
      ],
      ml_models: [
        { name: 'Stacking Ensemble (XGB+RF)', rmse: 0.3214, mae: 0.2410, r2: 0.9482, mse: 0.1033, is_active: true },
        { name: 'CNN-LSTM Neural Net', rmse: 0.3340, mae: 0.2520, r2: 0.9412, mse: 0.1115, is_active: false },
        { name: 'Random Forest Regressor', rmse: 0.3451, mae: 0.2612, r2: 0.9391, mse: 0.1191, is_active: false }
      ]
    }
  }

  // Handle Preview Action
  const handleOpenPreview = async () => {
    setIsLoadingPreview(true)
    try {
      const data = getTailoredPreviewData()
      setPreviewData(data)
    } finally {
      setIsLoadingPreview(false)
      setIsPreviewOpen(true)
    }
  }

  // Handle Direct Download Action using Fetch Blob
  const handleDirectDownload = async (fmtTarget?: 'pdf' | 'excel' | 'word') => {
    const fmt = fmtTarget || selectedFormat
    setIsDownloadingDirectly(true)
    try {
      const sanitizedName = (reportName || 'Reporte_Infraestructura_Verde').replace(/\s+/g, '_')
      const ext = fmt === 'excel' ? 'xlsx' : fmt === 'word' ? 'docx' : 'pdf'
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
      const url = `${apiUrl}/reports/export?format=${fmt}&report_type=${reportType}&name=${encodeURIComponent(sanitizedName)}`
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
      const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {}

      const res = await fetch(url, { headers })
      if (!res.ok) {
        throw new Error(`Error en servidor (${res.status})`)
      }

      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = `${sanitizedName}.${ext}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(objectUrl), 5000)
    } catch (err: any) {
      console.error('Error al descargar el reporte:', err)
    } finally {
      setIsDownloadingDirectly(false)
    }
  }

  // Handle Direct Print Action
  const handleDirectPrint = () => {
    const data = getTailoredPreviewData()
    setPreviewData(data)
    setTimeout(() => {
      window.print()
    }, 100)
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden border border-teal-800/40">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-teal-500/30">
            <span>📄</span> Módulo de Reportes & Exportación
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
            Generación y Vista Previa de Reportes
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Genera e inspecciona en <strong className="text-teal-300 font-bold">vista previa</strong> los datos descriptivos y listados de infraestructura verde urbana antes de descargar los documentos en formatos <strong className="text-white font-bold">PDF</strong>, <strong className="text-white font-bold">Excel (.xlsx)</strong> o <strong className="text-white font-bold">Word (.docx)</strong>.
          </p>
        </div>
      </div>

      {/* Main Configuration Card */}
      <div className="bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 sm:p-8 space-y-8">
        
        {/* Section 1: Report Title */}
        <div>
          <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
            Nombre del Reporte / Documento
          </label>
          <input
            type="text"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            placeholder="Ej. Listado de Infraestructura Verde y Resumen Microclimático"
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
          />
        </div>

        {/* Section 2: Report Content Type */}
        <div>
          <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">
            Tipo de Reporte y Contenido
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Green Infrastructure List */}
            <button
              type="button"
              onClick={() => setReportType('green_infrastructure')}
              className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                reportType === 'green_infrastructure'
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-emerald-400/50'
              }`}
            >
              <div>
                <span className="text-2xl mb-2 block">🌿</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  Listado de Infraestructura
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Inventario de vegetación, especies, LAI, dimensiones y efectos de enfriamiento.
                </p>
              </div>
              <div className="mt-4 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {reportType === 'green_infrastructure' ? '✓ Seleccionado' : 'Seleccionar'}
              </div>
            </button>

            {/* Card 2: Descriptive Microclimate Data */}
            <button
              type="button"
              onClick={() => setReportType('simulation')}
              className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                reportType === 'simulation'
                  ? 'bg-teal-50/90 dark:bg-teal-950/60 border-teal-500 ring-2 ring-teal-500/40 shadow-lg shadow-teal-500/10'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-teal-400/50'
              }`}
            >
              <div>
                <span className="text-2xl mb-2 block">🌡️</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  Datos Descriptivos & KPIs
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Resumen microclimático, índices de confort PET, viento y temperatura.
                </p>
              </div>
              <div className="mt-4 text-[11px] font-bold text-teal-600 dark:text-teal-400">
                {reportType === 'simulation' ? '✓ Seleccionado' : 'Seleccionar'}
              </div>
            </button>

            {/* Card 3: ML Models Evaluation */}
            <button
              type="button"
              onClick={() => setReportType('ml_evaluation')}
              className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                reportType === 'ml_evaluation'
                  ? 'bg-cyan-50/90 dark:bg-cyan-950/60 border-cyan-500 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-cyan-400/50'
              }`}
            >
              <div>
                <span className="text-2xl mb-2 block">🤖</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  Evaluación de Modelos ML
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Métricas RMSE, MAE y R² comparativas entre 5 algoritmos predictivos.
                </p>
              </div>
              <div className="mt-4 text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
                {reportType === 'ml_evaluation' ? '✓ Seleccionado' : 'Seleccionar'}
              </div>
            </button>

            {/* Card 4: Complete Combined Report */}
            <button
              type="button"
              onClick={() => setReportType('projects')}
              className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                reportType === 'projects'
                  ? 'bg-purple-50/90 dark:bg-purple-950/60 border-purple-500 ring-2 ring-purple-500/40 shadow-lg shadow-purple-500/10'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-purple-400/50'
              }`}
            >
              <div>
                <span className="text-2xl mb-2 block">📊</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  Reporte Completo
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Listados completos + datos descriptivos + métricas ML + metodología.
                </p>
              </div>
              <div className="mt-4 text-[11px] font-bold text-purple-600 dark:text-purple-400">
                {reportType === 'projects' ? '✓ Seleccionado' : 'Seleccionar'}
              </div>
            </button>
          </div>
        </div>

        {/* Section 3: Document Format Selection */}
        <div>
          <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">
            Formato de Documento a Generar
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Format: PDF */}
            <button
              type="button"
              onClick={() => setSelectedFormat('pdf')}
              className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${
                selectedFormat === 'pdf'
                  ? 'bg-red-50 dark:bg-red-950/50 border-red-500 ring-2 ring-red-500/40'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-red-400/50'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-red-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-red-600/20">
                PDF
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Documento PDF</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Ideal para impresión e informes ejecutivos formalizados.</p>
              </div>
            </button>

            {/* Format: Excel */}
            <button
              type="button"
              onClick={() => setSelectedFormat('excel')}
              className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${
                selectedFormat === 'excel'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/40'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-emerald-400/50'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                XLS
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Excel (.xlsx)</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Libro multipestaña para procesamiento de datos numéricos.</p>
              </div>
            </button>

            {/* Format: Word */}
            <button
              type="button"
              onClick={() => setSelectedFormat('word')}
              className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${
                selectedFormat === 'word'
                  ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/40'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-blue-400/50'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                DOC
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Word (.docx)</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Documento de texto totalmente editable con tablas maquetadas.</p>
              </div>
            </button>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          
          {/* Button 1: Preview */}
          <button
            type="button"
            onClick={handleOpenPreview}
            disabled={isLoadingPreview}
            className="w-full sm:w-auto flex-1 px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-teal-500/25 hover:shadow-teal-400/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
          >
            {isLoadingPreview ? (
              <span className="animate-spin text-lg">⏳</span>
            ) : (
              <span className="text-lg">👀</span>
            )}
            <span>
              {isLoadingPreview ? 'Generando Vista Previa...' : 'Vista Previa Interactiva'}
            </span>
          </button>

          {/* Button 2: Direct Download */}
          <button
            type="button"
            onClick={() => handleDirectDownload()}
            disabled={isDownloadingDirectly}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 hover:border-slate-600 shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
          >
            {isDownloadingDirectly ? (
              <span className="animate-spin text-lg">⏳</span>
            ) : (
              <span className="text-lg">📥</span>
            )}
            <span>
              {isDownloadingDirectly ? 'Descargando...' : `Descargar ${selectedFormat.toUpperCase()}`}
            </span>
          </button>

          {/* Button 3: Direct Print */}
          <button
            type="button"
            onClick={handleDirectPrint}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm border border-slate-300 dark:border-slate-700 shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
          >
            <span className="text-lg">🖨️</span>
            <span>Imprimir Reporte</span>
          </button>
        </div>

      </div>

      {/* Always Rendered Hidden Print Document Container for Browser Print Engine */}
      <div className="hidden print:block">
        <PrintableReportDocument data={previewData || getTailoredPreviewData()} />
      </div>

      {/* Interactive Live Preview Modal */}
      <ReportPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        data={previewData}
        selectedFormat={selectedFormat}
        onFormatChange={(fmt) => setSelectedFormat(fmt)}
        onDownload={(fmt) => handleDirectDownload(fmt)}
      />
    </div>
  )
}
