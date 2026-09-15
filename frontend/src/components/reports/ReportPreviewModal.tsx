'use client'

import React, { useState } from 'react'
import PrintableReportDocument from './PrintableReportDocument'

export interface PreviewData {
  title: string
  report_type: string
  report_id?: string
  format: 'pdf' | 'excel' | 'word'
  generated_at: string
  summary: string
  kpis: Array<{ metric: string; value: string; status: string }>
  green_infrastructure_list: Array<{
    id: string
    name: string
    type: string
    species: string
    height: number
    crown_diameter: number
    lai: number
    cooling_effect: string
  }>
  ml_models: Array<{
    name: string
    rmse: number
    mae: number
    r2: number
    mse: number
    is_active: boolean
  }>
  time_series_sample: Array<{
    time: string
    temperature: number
    humidity: number
    pet: number
    wind_speed?: number
  }>
}

interface ReportPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  data: PreviewData | null
  selectedFormat: 'pdf' | 'excel' | 'word'
  onFormatChange: (fmt: 'pdf' | 'excel' | 'word') => void
  onDownload: (fmt: 'pdf' | 'excel' | 'word') => void
}

export default function ReportPreviewModal({
  isOpen,
  onClose,
  data,
  selectedFormat,
  onFormatChange,
  onDownload
}: ReportPreviewModalProps) {
  const [activeSheetTab, setActiveSheetTab] = useState<'kpi' | 'gi' | 'ts' | 'ml'>('gi')
  const [isDownloading, setIsDownloading] = useState(false)

  React.useEffect(() => {
    if (!data) return
    if (data.report_type === 'green_infrastructure') {
      setActiveSheetTab('gi')
    } else if (data.report_type === 'simulation') {
      setActiveSheetTab('ts')
    } else if (data.report_type === 'ml_evaluation') {
      setActiveSheetTab('ml')
    } else {
      setActiveSheetTab('kpi')
    }
  }, [data])

  if (!isOpen || !data) return null

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      await onDownload(selectedFormat)
    } finally {
      setIsDownloading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 print:p-0 print:static print:bg-white print:overflow-visible animate-fadeIn">
      {/* Modal Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden print:max-w-none print:max-h-none print:shadow-none print:border-none print:rounded-none print:w-full transition-all">
        
        {/* Header - Hidden when Printing */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-50/90 dark:bg-slate-900/80 backdrop-blur-md print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 dark:bg-teal-400/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xl border border-teal-500/20">
              👁️
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Vista Previa del Reporte
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verifica el contenido antes de descargar en PDF, Excel o Word
              </p>
            </div>
          </div>

          {/* Format Switcher Selector */}
          <div className="flex items-center p-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl border border-slate-300 dark:border-slate-700">
            <button
              type="button"
              onClick={() => onFormatChange('pdf')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedFormat === 'pdf'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🔴</span> PDF
            </button>
            <button
              type="button"
              onClick={() => onFormatChange('excel')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedFormat === 'excel'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🟩</span> Excel (.xlsx)
            </button>
            <button
              type="button"
              onClick={() => onFormatChange('word')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedFormat === 'word'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🔷</span> Word (.docx)
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all flex items-center gap-1.5 border border-slate-300 dark:border-slate-700"
              title="Imprimir vista de reporte"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className={`px-4 py-2 rounded-xl font-bold text-xs text-white transition-all flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 ${
                selectedFormat === 'pdf'
                  ? 'bg-red-600 hover:bg-red-500 shadow-red-600/25'
                  : selectedFormat === 'excel'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/25'
              }`}
            >
              {isDownloading ? (
                <span className="animate-spin text-sm">⏳</span>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              <span>
                {isDownloading ? 'Generando...' : `Descargar ${selectedFormat.toUpperCase()}`}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Dynamic Document Preview Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-slate-950/80 print:bg-white print:p-0">
          
          {/* Printable Report Document - Visible on Print and on PDF tab */}
          <PrintableReportDocument
            data={data}
            className={selectedFormat === 'pdf' ? 'block' : 'hidden print:block'}
          />

          {selectedFormat === 'excel' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto print:hidden">
              {/* Excel Spreadsheet Header Bar */}
              <div className="bg-emerald-700 text-white p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <span className="text-lg">📊</span>
                  <span>Microsoft Excel - {data.title}.xlsx</span>
                </div>
                <span className="text-xs bg-emerald-800 px-3 py-1 rounded font-mono">
                  Libro Abierto
                </span>
              </div>

              {/* Excel Sheet Tabs (Tailored to non-empty data) */}
              <div className="bg-slate-200 dark:bg-slate-800 p-1 flex items-center gap-1 border-b border-slate-300 dark:border-slate-700 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveSheetTab('kpi')}
                  className={`px-3 py-1.5 rounded-t-lg text-xs font-bold transition-all ${
                    activeSheetTab === 'kpi'
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border-t-2 border-emerald-600 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  📈 Resumen & KPIs
                </button>
                {data.green_infrastructure_list && data.green_infrastructure_list.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveSheetTab('gi')}
                    className={`px-3 py-1.5 rounded-t-lg text-xs font-bold transition-all ${
                      activeSheetTab === 'gi'
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border-t-2 border-emerald-600 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    🍃 Infraestructura Verde
                  </button>
                )}
                {data.time_series_sample && data.time_series_sample.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveSheetTab('ts')}
                    className={`px-3 py-1.5 rounded-t-lg text-xs font-bold transition-all ${
                      activeSheetTab === 'ts'
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border-t-2 border-emerald-600 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    ⏱️ Series Temporales
                  </button>
                )}
                {data.ml_models && data.ml_models.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveSheetTab('ml')}
                    className={`px-3 py-1.5 rounded-t-lg text-xs font-bold transition-all ${
                      activeSheetTab === 'ml'
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border-t-2 border-emerald-600 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    🤖 Modelos ML Benchmark
                  </button>
                )}
              </div>

              {/* Grid Content */}
              <div className="p-4 overflow-x-auto font-mono text-xs">
                {activeSheetTab === 'gi' && (
                  <table className="w-full border-collapse border border-slate-300 dark:border-slate-700 text-left">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-500">
                        <th className="border border-slate-300 dark:border-slate-700 p-1 text-center w-8 bg-slate-200 dark:bg-slate-800">#</th>
                        <th className="border border-slate-300 dark:border-slate-700 p-2 bg-emerald-800 text-white font-bold">A: Código</th>
                        <th className="border border-slate-300 dark:border-slate-700 p-2 bg-emerald-800 text-white font-bold">B: Elemento</th>
                        <th className="border border-slate-300 dark:border-slate-700 p-2 bg-emerald-800 text-white font-bold">C: Especie / Tipo</th>
                        <th className="border border-slate-300 dark:border-slate-700 p-2 bg-emerald-800 text-white font-bold text-center">D: Altura (m)</th>
                        <th className="border border-slate-300 dark:border-slate-700 p-2 bg-emerald-800 text-white font-bold text-center">E: LAI</th>
                        <th className="border border-slate-300 dark:border-slate-700 p-2 bg-emerald-800 text-white font-bold text-right">F: Enfriamiento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.green_infrastructure_list.map((item, r) => (
                        <tr key={r} className="hover:bg-emerald-50/50 dark:hover:bg-slate-800/60">
                          <td className="border border-slate-300 dark:border-slate-700 p-1 text-center text-slate-400 bg-slate-100 dark:bg-slate-800">{r + 2}</td>
                          <td className="border border-slate-300 dark:border-slate-700 p-2 font-bold text-emerald-600 dark:text-emerald-400">{item.id}</td>
                          <td className="border border-slate-300 dark:border-slate-700 p-2 font-sans font-medium">{item.name}</td>
                          <td className="border border-slate-300 dark:border-slate-700 p-2 font-sans text-slate-600 dark:text-slate-300">{item.type}</td>
                          <td className="border border-slate-300 dark:border-slate-700 p-2 text-center">{item.height}</td>
                          <td className="border border-slate-300 dark:border-slate-700 p-2 text-center font-bold">{item.lai}</td>
                          <td className="border border-slate-300 dark:border-slate-700 p-2 text-right font-bold text-emerald-600">{item.cooling_effect}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeSheetTab === 'kpi' && (
                  <table className="w-full border-collapse border border-slate-300 dark:border-slate-700 text-left">
                    <thead>
                      <tr className="bg-emerald-800 text-white font-bold">
                        <th className="border border-slate-300 p-2">Indicador Microclimático</th>
                        <th className="border border-slate-300 p-2 text-center">Valor</th>
                        <th className="border border-slate-300 p-2 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.kpis.map((kpi, r) => (
                        <tr key={r} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="border border-slate-300 dark:border-slate-700 p-2 font-sans">{kpi.metric}</td>
                          <td className="border border-slate-300 dark:border-slate-700 p-2 text-center font-bold text-teal-600">{kpi.value}</td>
                          <td className="border border-slate-300 dark:border-slate-700 p-2 text-center">{kpi.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeSheetTab === 'ts' && (
                  <table className="w-full border-collapse border border-slate-300 dark:border-slate-700 text-left">
                    <thead>
                      <tr className="bg-teal-800 text-white font-bold">
                        <th className="border border-slate-300 p-2">Hora</th>
                        <th className="border border-slate-300 p-2 text-center">Temperatura (°C)</th>
                        <th className="border border-slate-300 p-2 text-center">Humedad (%)</th>
                        <th className="border border-slate-300 p-2 text-center">PET Confort (°C)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.time_series_sample.map((ts, r) => (
                        <tr key={r} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="border border-slate-300 dark:border-slate-700 p-2 font-bold">{ts.time}</td>
                          <td className="border border-slate-300 dark:border-slate-700 p-2 text-center">{ts.temperature}</td>
                          <td className="border border-slate-300 dark:border-slate-700 p-2 text-center">{ts.humidity}</td>
                          <td className="border border-slate-300 dark:border-slate-700 p-2 text-center font-bold text-emerald-600">{ts.pet}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeSheetTab === 'ml' && (
                  <table className="w-full border-collapse border border-slate-300 dark:border-slate-700 text-left">
                    <thead>
                      <tr className="bg-emerald-900 text-white font-bold">
                        <th className="border border-slate-300 p-2">Modelo ML</th>
                        <th className="border border-slate-300 p-2 text-center">RMSE</th>
                        <th className="border border-slate-300 p-2 text-center">MAE</th>
                        <th className="border border-slate-300 p-2 text-center">R² Score</th>
                        <th className="border border-slate-300 p-2 text-right">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.ml_models.map((m, r) => (
                        <tr key={r} className={m.is_active ? 'bg-emerald-50 dark:bg-emerald-950/40 font-bold' : ''}>
                          <td className="border border-slate-300 dark:border-slate-700 p-2 font-sans">{m.name}</td>
                          <td className="border border-slate-300 dark:border-slate-700 p-2 text-center">{m.rmse.toFixed(4)}</td>
                          <td className="border border-slate-300 dark:border-slate-700 p-2 text-center">{m.mae.toFixed(4)}</td>
                          <td className="border border-slate-300 dark:border-slate-700 p-2 text-center text-emerald-600">{m.r2.toFixed(4)}</td>
                          <td className="border border-slate-300 dark:border-slate-700 p-2 text-right">{m.is_active ? 'Ganador Activo' : 'Evaluado'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {selectedFormat === 'word' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-xl p-10 max-w-4xl mx-auto font-sans leading-relaxed text-slate-800 dark:text-slate-200 print:hidden">
              {/* Word Document Banner Header */}
              <div className="border-b border-blue-600 pb-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-xl flex items-center justify-center">
                    W
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-blue-900 dark:text-blue-400">
                      Documento Word Editable (.docx)
                    </h2>
                    <p className="text-xs text-slate-500">Gemelo Digital de Infraestructura Verde Urbana</p>
                  </div>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full border border-blue-300">
                  Microsoft Word Layout
                </span>
              </div>

              {/* Title & Document Content */}
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {data.title}
              </h1>
              <p className="text-xs text-slate-500 mb-6 italic">Generado el {data.generated_at}</p>

              <h2 className="text-base font-bold text-blue-800 dark:text-blue-400 border-b border-slate-200 dark:border-slate-800 pb-1 mb-3">
                1. Resumen Ejecutivo y Descripción General
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-6">
                {data.summary}
              </p>

              {data.green_infrastructure_list && data.green_infrastructure_list.length > 0 && (
                <>
                  <h2 className="text-base font-bold text-blue-800 dark:text-blue-400 border-b border-slate-200 dark:border-slate-800 pb-1 mb-3">
                    2. Listado Descriptivo de Infraestructura Verde Urbana
                  </h2>
                  <table className="w-full text-xs text-left mb-6 border border-slate-300 dark:border-slate-700">
                    <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                      <tr>
                        <th className="p-2 border border-slate-300 dark:border-slate-700">Código</th>
                        <th className="p-2 border border-slate-300 dark:border-slate-700">Nombre</th>
                        <th className="p-2 border border-slate-300 dark:border-slate-700">Tipo</th>
                        <th className="p-2 border border-slate-300 dark:border-slate-700 text-center">LAI</th>
                        <th className="p-2 border border-slate-300 dark:border-slate-700 text-right">Efecto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.green_infrastructure_list.map((item, i) => (
                        <tr key={i}>
                          <td className="p-2 border border-slate-300 dark:border-slate-700 font-bold text-blue-600">{item.id}</td>
                          <td className="p-2 border border-slate-300 dark:border-slate-700 font-medium">{item.name}</td>
                          <td className="p-2 border border-slate-300 dark:border-slate-700">{item.type}</td>
                          <td className="p-2 border border-slate-300 dark:border-slate-700 text-center">{item.lai}</td>
                          <td className="p-2 border border-slate-300 dark:border-slate-700 text-right font-semibold text-emerald-600">{item.cooling_effect}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {data.time_series_sample && data.time_series_sample.length > 0 && (
                <>
                  <h2 className="text-base font-bold text-blue-800 dark:text-blue-400 border-b border-slate-200 dark:border-slate-800 pb-1 mb-3">
                    {data.green_infrastructure_list?.length ? '3.' : '2.'} Registros de Series Temporales (Muestra 24h)
                  </h2>
                  <table className="w-full text-xs text-left mb-6 border border-slate-300 dark:border-slate-700">
                    <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                      <tr>
                        <th className="p-2 border border-slate-300 dark:border-slate-700">Hora</th>
                        <th className="p-2 border border-slate-300 dark:border-slate-700 text-center">Temperatura (°C)</th>
                        <th className="p-2 border border-slate-300 dark:border-slate-700 text-center">Humedad (%)</th>
                        <th className="p-2 border border-slate-300 dark:border-slate-700 text-right">PET (°C)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.time_series_sample.map((ts, i) => (
                        <tr key={i}>
                          <td className="p-2 border border-slate-300 dark:border-slate-700 font-bold">{ts.time}</td>
                          <td className="p-2 border border-slate-300 dark:border-slate-700 text-center">{ts.temperature} °C</td>
                          <td className="p-2 border border-slate-300 dark:border-slate-700 text-center">{ts.humidity} %</td>
                          <td className="p-2 border border-slate-300 dark:border-slate-700 text-right font-semibold text-blue-600">{ts.pet} °C</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {data.ml_models && data.ml_models.length > 0 && (
                <>
                  <h2 className="text-base font-bold text-blue-800 dark:text-blue-400 border-b border-slate-200 dark:border-slate-800 pb-1 mb-3">
                    {data.green_infrastructure_list?.length && data.time_series_sample?.length ? '4.' : (data.green_infrastructure_list?.length || data.time_series_sample?.length) ? '3.' : '2.'} Benchmark de Modelos ML
                  </h2>
                  <table className="w-full text-xs text-left mb-6 border border-slate-300 dark:border-slate-700">
                    <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                      <tr>
                        <th className="p-2 border border-slate-300 dark:border-slate-700">Modelo ML</th>
                        <th className="p-2 border border-slate-300 dark:border-slate-700 text-center">RMSE</th>
                        <th className="p-2 border border-slate-300 dark:border-slate-700 text-center">MAE</th>
                        <th className="p-2 border border-slate-300 dark:border-slate-700 text-right">R² Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.ml_models.map((m, i) => (
                        <tr key={i} className={m.is_active ? 'bg-blue-50/60 font-bold' : ''}>
                          <td className="p-2 border border-slate-300 dark:border-slate-700 font-medium">{m.name}</td>
                          <td className="p-2 border border-slate-300 dark:border-slate-700 text-center">{m.rmse.toFixed(4)}</td>
                          <td className="p-2 border border-slate-300 dark:border-slate-700 text-center">{m.mae.toFixed(4)}</td>
                          <td className="p-2 border border-slate-300 dark:border-slate-700 text-right font-mono text-emerald-600">{m.r2.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              <h2 className="text-base font-bold text-blue-800 dark:text-blue-400 border-b border-slate-200 dark:border-slate-800 pb-1 mb-3">
                Metodología & Notas
              </h2>
              <div className="bg-blue-50/60 dark:bg-slate-800/60 p-4 rounded-xl text-xs text-slate-700 dark:text-slate-300 border border-blue-200 dark:border-slate-700">
                Este reporte integra simulaciones espacio-temporales microclimáticas ENVI-met con modelos de ensamble ML para guiar la toma de decisiones en infraestructura urbana sostenible.
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Vista previa renderizada en formato <b>{selectedFormat.toUpperCase()}</b></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-colors"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white transition-all shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2 ${
                selectedFormat === 'pdf'
                  ? 'bg-red-600 hover:bg-red-500 shadow-red-600/25'
                  : selectedFormat === 'excel'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/25'
              }`}
            >
              {isDownloading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <span>📥</span>
              )}
              <span>
                {isDownloading ? 'Generando Documento...' : `Confirmar y Descargar ${selectedFormat.toUpperCase()}`}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
