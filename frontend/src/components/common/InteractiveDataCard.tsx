'use client'

import React, { useState, useRef } from 'react'
import { useTheme } from '../ThemeProvider'
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Table as TableIcon,
  BarChart3,
  Copy,
  Check,
  FileSpreadsheet,
  FileImage,
  ChevronDown,
  Sparkles,
  Type
} from 'lucide-react'
import {
  exportCanvasToHighResPNG,
  exportTableToCSV,
  copyTableToClipboard
} from '@/utils/exportUtils'

export interface InteractiveDataCardProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  badge?: React.ReactNode
  scenarioName?: string
  chartComponent?: React.ReactNode
  tableHeaders?: string[]
  tableRows?: (string | number)[][]
  defaultView?: 'chart' | 'table'
  heightClass?: string
  csvFilename?: string
  pngFilename?: string
}

export default function InteractiveDataCard({
  title,
  subtitle,
  icon,
  badge,
  scenarioName,
  chartComponent,
  tableHeaders,
  tableRows,
  defaultView = 'chart',
  heightClass = 'h-[460px]',
  csvFilename,
  pngFilename
}: InteractiveDataCardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [viewMode, setViewMode] = useState<'chart' | 'table'>(
    chartComponent ? defaultView : 'table'
  )
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  // Zoom de gráfico (1.0 = 100%, 1.25 = 125%, 1.5 = 150%, 1.75 = 175%, 2.0 = 200%)
  const [chartZoom, setChartZoom] = useState<number>(1.0)

  // Zoom de tabla ('compact', 'normal', 'large', 'xl')
  const [tableFontSize, setTableFontSize] = useState<'compact' | 'normal' | 'large' | 'xl'>('normal')

  // Menú de descargas
  const [isDownloadOpen, setIsDownloadOpen] = useState<boolean>(false)
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const [isExporting, setIsExporting] = useState<boolean>(false)

  const cardContainerRef = useRef<HTMLDivElement>(null)
  const chartWrapperRef = useRef<HTMLDivElement>(null)

  // Nombres de archivos normalizados
  const safeBaseName = (pngFilename || title || 'datos_gemelo_digital')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

  // Controles de zoom gráfico
  const handleZoomIn = () => {
    setChartZoom(prev => Math.min(Number((prev + 0.25).toFixed(2)), 2.5))
  }

  const handleZoomOut = () => {
    setChartZoom(prev => Math.max(Number((prev - 0.25).toFixed(2)), 0.75))
  }

  const handleResetZoom = () => {
    setChartZoom(1.0)
    setTableFontSize('normal')
  }

  // Controles de zoom tabla (tamaño tipográfico y espaciado)
  const tableFontClasses = {
    compact: 'text-[11px] [&_th]:py-1.5 [&_th]:px-2.5 [&_td]:py-1.5 [&_td]:px-2.5',
    normal: 'text-xs [&_th]:py-2.5 [&_th]:px-3 [&_td]:py-2.5 [&_td]:px-3',
    large: 'text-sm [&_th]:py-3.5 [&_th]:px-4 [&_td]:py-3.5 [&_td]:px-4',
    xl: 'text-base [&_th]:py-4.5 [&_th]:px-5 [&_td]:py-4.5 [&_td]:px-5'
  }[tableFontSize]

  // Exportar gráfico en Ultra HD (300 DPI / 4K)
  const handleExportChart = async (themeExport: 'dark' | 'light') => {
    setIsDownloadOpen(false)
    setIsExporting(true)
    try {
      const canvas = chartWrapperRef.current?.querySelector('canvas')
      if (canvas) {
        await exportCanvasToHighResPNG(
          canvas,
          `${safeBaseName}_${themeExport}_300dpi.png`,
          {
            title,
            subtitle,
            scenarioName,
            theme: themeExport,
            scale: 3
          }
        )
      } else {
        alert('No se encontró el elemento canvas del gráfico.')
      }
    } catch (err) {
      console.error('Error al exportar gráfico en alta resolución:', err)
    } finally {
      setIsExporting(false)
    }
  }

  // Exportar tabla a Excel (.csv con BOM)
  const handleExportCSV = () => {
    setIsDownloadOpen(false)
    if (tableHeaders && tableRows && tableRows.length > 0) {
      exportTableToCSV(
        tableHeaders,
        tableRows,
        `${csvFilename || safeBaseName}_tabla_excel.csv`
      )
    }
  }

  // Copiar tabla al portapapeles
  const handleCopyClipboard = async () => {
    if (tableHeaders && tableRows) {
      const ok = await copyTableToClipboard(tableHeaders, tableRows)
      if (ok) {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2500)
      }
    }
  }

  // Renderizado del contenido interno
  const renderCardBody = (expanded: boolean) => {
    return (
      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* VISTA 1: GRÁFICO CON ZOOM */}
        {viewMode === 'chart' && chartComponent && (
          <div
            ref={chartWrapperRef}
            className={`w-full ${expanded ? 'h-[72vh]' : heightClass} overflow-auto rounded-2xl relative transition-all duration-200 select-none`}
          >
            <div
              style={{
                width: chartZoom > 1.0 ? `${chartZoom * 100}%` : '100%',
                height: '100%',
                minHeight: expanded ? '540px' : '260px',
                transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              className="relative mx-auto"
            >
              {chartComponent}
            </div>

            {/* Indicador flotante del nivel de zoom cuando no es 100% */}
            {chartZoom !== 1.0 && (
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/90 dark:bg-slate-800/90 text-emerald-400 font-mono text-[11px] font-bold border border-emerald-500/30 backdrop-blur-md shadow-lg pointer-events-none">
                Escala: {Math.round(chartZoom * 100)}%
              </div>
            )}
          </div>
        )}

        {/* VISTA 2: TABLA DE DATOS ESTRUCTURADA */}
        {viewMode === 'table' && tableHeaders && tableRows && (
          <div
            className={`w-full ${expanded ? 'h-[72vh]' : heightClass} overflow-auto rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 backdrop-blur-md`}
          >
            <table className={`w-full text-left font-sans border-collapse ${tableFontClasses}`}>
              <thead className="sticky top-0 z-10 bg-slate-100/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                <tr>
                  {tableHeaders.map((head, idx) => (
                    <th key={idx} className="whitespace-nowrap">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
                {tableRows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="hover:bg-emerald-50/60 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    {row.map((cell, cellIdx) => {
                      const isFirst = cellIdx === 0
                      const cellStr = String(cell)
                      const isNegativeDelta = cellStr.startsWith('-') && cellStr.includes('°C')
                      const isPositiveDelta = cellStr.startsWith('+')

                      return (
                        <td
                          key={cellIdx}
                          className={`whitespace-nowrap ${
                            isFirst
                              ? 'font-bold text-slate-900 dark:text-white font-mono'
                              : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {isNegativeDelta ? (
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                              {cellStr}
                            </span>
                          ) : isPositiveDelta ? (
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                              {cellStr}
                            </span>
                          ) : (
                            cell
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* TARJETA PRINCIPAL EN EL FLUJO DEL DASHBOARD */}
      <div
        ref={cardContainerRef}
        className="flex flex-col bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl shadow-xl p-5 sm:p-6 transition-all relative group"
      >
        {/* Barra de herramientas superior */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/70">
          {/* Título e ícono */}
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 flex-shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white truncate flex items-center gap-2">
                <span>{title}</span>
                {badge}
              </h2>
              {subtitle && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                  {subtitle}
                </span>
              )}
            </div>
          </div>

          {/* Botones de acción: Cambiar Modo, Zoom, Maximizar y Descargar */}
          <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-center">
            {/* 1. Selector de modo: Gráfico <-> Tabla */}
            {chartComponent && tableHeaders && (
              <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setViewMode('chart')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'chart'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Ver Gráfico"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Gráfico</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Ver Tabla de Datos"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Tabla</span>
                </button>
              </div>
            )}

            {/* 2. Controles de Zoom In / Zoom Out / Reset */}
            {viewMode === 'chart' ? (
              <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={chartZoom <= 0.75}
                  className="p-1.5 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
                  title="Disminuir Escala del Gráfico (Zoom Out)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="px-1.5 py-1 text-[11px] font-mono font-bold hover:text-emerald-500 transition-colors"
                  title="Restaurar a 100%"
                >
                  {Math.round(chartZoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={chartZoom >= 2.5}
                  className="p-1.5 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
                  title="Ampliar Escala del Gráfico (Zoom In)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              /* Controles de Zoom Tipográfico para Tabla */
              <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    const sizes: Array<'compact' | 'normal' | 'large' | 'xl'> = ['compact', 'normal', 'large', 'xl']
                    const curIdx = sizes.indexOf(tableFontSize)
                    if (curIdx > 0) setTableFontSize(sizes[curIdx - 1])
                  }}
                  disabled={tableFontSize === 'compact'}
                  className="px-2 py-1 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors font-bold font-mono"
                  title="Disminuir tamaño de letra de tabla (A-)"
                >
                  A-
                </button>
                <span className="px-1.5 text-[10px] uppercase font-bold text-slate-400 font-mono">
                  {tableFontSize === 'compact' ? 'Min' : tableFontSize === 'normal' ? 'Norm' : tableFontSize === 'large' ? 'Med' : 'Max'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const sizes: Array<'compact' | 'normal' | 'large' | 'xl'> = ['compact', 'normal', 'large', 'xl']
                    const curIdx = sizes.indexOf(tableFontSize)
                    if (curIdx < sizes.length - 1) setTableFontSize(sizes[curIdx + 1])
                  }}
                  disabled={tableFontSize === 'xl'}
                  className="px-2 py-1 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors font-bold font-mono"
                  title="Ampliar tamaño de letra de tabla (A+)"
                >
                  A+
                </button>
              </div>
            )}

            {/* 3. Menú Desplegable de Descarga en Alta Calidad */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDownloadOpen(!isDownloadOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
                title="Descargar en Alta Calidad (300 DPI / Excel)"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exportar</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isDownloadOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsDownloadOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-40 p-2 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                      Descargas en Alta Fidelidad
                    </div>

                    {chartComponent && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleExportChart('dark')}
                          disabled={isExporting}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                        >
                          <FileImage className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <div>
                            <span className="block font-semibold">Gráfico Ultra HD (300 DPI)</span>
                            <span className="text-[10px] text-slate-400">Fondo Oscuro Dark Modern</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExportChart('light')}
                          disabled={isExporting}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                        >
                          <FileImage className="w-4 h-4 text-teal-500 flex-shrink-0" />
                          <div>
                            <span className="block font-semibold">Gráfico Publicación (300 DPI)</span>
                            <span className="text-[10px] text-slate-400">Fondo Blanco Científico Q1</span>
                          </div>
                        </button>
                      </>
                    )}

                    {tableHeaders && tableRows && (
                      <>
                        <button
                          type="button"
                          onClick={handleExportCSV}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors border-t border-slate-100 dark:border-slate-800 mt-1 pt-2"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                          <div>
                            <span className="block font-semibold">Tabla en Excel (.csv UTF-8)</span>
                            <span className="text-[10px] text-slate-400">Compatible con Microsoft Excel</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={handleCopyClipboard}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                        >
                          {isCopied ? (
                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <Copy className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          )}
                          <div>
                            <span className="block font-semibold">
                              {isCopied ? '¡Copiado a Portapapeles!' : 'Copiar Celdas (TSV)'}
                            </span>
                            <span className="text-[10px] text-slate-400">Pegar con Ctrl+V en Hoja de Cálculo</span>
                          </div>
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* 4. Botón de Maximizar a Pantalla Completa (Ampliar) */}
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Maximizar a Pantalla Completa (Ampliar vista)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Cuerpo del contenido (Gráfico o Tabla) */}
        {renderCardBody(false)}
      </div>

      {/* MODAL DE PANTALLA COMPLETA (VISTA MAXIMIZADA / AMPLIADA) */}
      {isExpanded && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-2xl animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-7xl h-[94vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden">
            {/* Cabecera del modal expandido */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-3">
                {icon && (
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                    {icon}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{title}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-mono">
                      Vista Ampliada HD
                    </span>
                  </h3>
                  {subtitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {subtitle} {scenarioName ? `• ${scenarioName}` : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Botón de Cerrar / Disminuir */}
              <div className="flex items-center gap-3">
                {/* Controles de zoom dentro del modal */}
                {viewMode === 'chart' ? (
                  <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    <button
                      type="button"
                      onClick={handleZoomOut}
                      disabled={chartZoom <= 0.75}
                      className="p-2 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
                      title="Disminuir Zoom (-)"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="px-2 text-xs font-mono font-bold">
                      {Math.round(chartZoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={handleZoomIn}
                      disabled={chartZoom >= 2.5}
                      className="p-2 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
                      title="Aumentar Zoom (+)"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        const sizes: Array<'compact' | 'normal' | 'large' | 'xl'> = ['compact', 'normal', 'large', 'xl']
                        const curIdx = sizes.indexOf(tableFontSize)
                        if (curIdx > 0) setTableFontSize(sizes[curIdx - 1])
                      }}
                      disabled={tableFontSize === 'compact'}
                      className="px-2.5 py-1.5 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors font-bold font-mono"
                      title="Disminuir tamaño de letra de tabla (A-)"
                    >
                      A-
                    </button>
                    <span className="px-2 text-xs font-mono font-bold text-slate-400">
                      Zoom Fuente
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const sizes: Array<'compact' | 'normal' | 'large' | 'xl'> = ['compact', 'normal', 'large', 'xl']
                        const curIdx = sizes.indexOf(tableFontSize)
                        if (curIdx < sizes.length - 1) setTableFontSize(sizes[curIdx + 1])
                      }}
                      disabled={tableFontSize === 'xl'}
                      className="px-2.5 py-1.5 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors font-bold font-mono"
                      title="Aumentar tamaño de letra de tabla (A+)"
                    >
                      A+
                    </button>
                  </div>
                )}

                {/* Botón de exportación rápida en modal */}
                {chartComponent && (
                  <button
                    type="button"
                    onClick={() => handleExportChart('dark')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar PNG 300 DPI</span>
                  </button>
                )}

                {tableHeaders && tableRows && (
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 transition-all"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Descargar Excel</span>
                  </button>
                )}

                {/* Botón para contraer / disminuir a tamaño normal */}
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                  title="Cerrar vista ampliada / Disminuir (Esc)"
                >
                  <Minimize2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenido en pantalla completa */}
            {renderCardBody(true)}
          </div>
        </div>
      )}
    </>
  )
}

