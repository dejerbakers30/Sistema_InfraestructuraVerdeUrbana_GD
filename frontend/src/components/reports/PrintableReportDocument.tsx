'use client'

import React from 'react'
import { PreviewData } from './ReportPreviewModal'

interface PrintableReportDocumentProps {
  data: PreviewData
  className?: string
}

export default function PrintableReportDocument({ data, className = '' }: PrintableReportDocumentProps) {
  if (!data) return null

  return (
    <div
      id="printable-report-document"
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 max-w-4xl mx-auto print:shadow-none print:border-none print:p-0 print:bg-white print:text-black ${className}`}
    >
      {/* PDF / Print Document Header */}
      <div className="border-b-2 border-teal-600 pb-4 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-teal-800 dark:text-teal-400 print:text-black tracking-tight">
            Gemelo Digital de Infraestructura Verde Urbana
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 print:text-gray-700 font-semibold uppercase tracking-wider mt-1">
            Informe Técnico & Análisis Microclimático | Fecha: {data.generated_at}
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 rounded-full border border-teal-300 dark:border-teal-700 print:hidden">
          Documento Oficial GD-IVU
        </span>
      </div>

      {/* Title & Executive Summary */}
      <div className="mb-6 bg-teal-50/50 dark:bg-slate-800/40 p-5 rounded-2xl border border-teal-100 dark:border-slate-800 print:border-slate-300 print:bg-slate-50">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white print:text-black mb-2">
          {data.title}
        </h2>
        <p className="text-sm text-slate-700 dark:text-slate-300 print:text-black leading-relaxed">
          {data.summary}
        </p>
      </div>

      {/* Section 1: KPIs Grid */}
      {data.kpis && data.kpis.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-bold text-teal-700 dark:text-teal-400 print:text-black uppercase tracking-wider mb-3">
            1. Indicadores y KPIs Clave
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 print:grid-cols-3">
            {data.kpis.map((kpi, i) => (
              <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700/80 print:bg-white print:border-slate-300">
                <div className="text-xs text-slate-500 dark:text-slate-400 print:text-gray-700 font-medium">{kpi.metric}</div>
                <div className="text-lg font-extrabold text-teal-600 dark:text-teal-300 print:text-black my-0.5">{kpi.value}</div>
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 print:bg-slate-200 print:text-black">
                  {kpi.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Green Infrastructure List Table (Only if present) */}
      {data.green_infrastructure_list && data.green_infrastructure_list.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-bold text-teal-700 dark:text-teal-400 print:text-black uppercase tracking-wider mb-3">
            2. Inventario Descriptivo de Infraestructura Verde Urbana
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 print:border-slate-300">
            <table className="w-full text-left text-xs">
              <thead className="bg-teal-700 text-white font-semibold print:bg-slate-200 print:text-black">
                <tr>
                  <th className="p-2.5">Código</th>
                  <th className="p-2.5">Nombre Elemento</th>
                  <th className="p-2.5">Especie / Tipo</th>
                  <th className="p-2.5 text-center">Altura</th>
                  <th className="p-2.5 text-center">LAI</th>
                  <th className="p-2.5 text-right">Efecto Enfriamiento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 print:divide-slate-300">
                {data.green_infrastructure_list.map((item, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}>
                    <td className="p-2.5 font-bold text-teal-600 dark:text-teal-400 print:text-black">{item.id}</td>
                    <td className="p-2.5 font-medium text-slate-900 dark:text-white print:text-black">{item.name}</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300 print:text-black">{item.type}</td>
                    <td className="p-2.5 text-center print:text-black">{item.height} m</td>
                    <td className="p-2.5 text-center font-semibold print:text-black">{item.lai}</td>
                    <td className="p-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400 print:text-black">{item.cooling_effect}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 3: Time Series Data Sample (Only if present) */}
      {data.time_series_sample && data.time_series_sample.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-bold text-teal-700 dark:text-teal-400 print:text-black uppercase tracking-wider mb-3">
            {data.green_infrastructure_list && data.green_infrastructure_list.length > 0 ? '3.' : '2.'} Datos Microclimáticos y Series Temporales (24h)
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 print:border-slate-300">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-white font-semibold print:bg-slate-200 print:text-black">
                <tr>
                  <th className="p-2.5">Hora</th>
                  <th className="p-2.5 text-center">Temperatura (°C)</th>
                  <th className="p-2.5 text-center">Humedad (%)</th>
                  <th className="p-2.5 text-center">PET Confort (°C)</th>
                  <th className="p-2.5 text-right">Viento (m/s)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 print:divide-slate-300">
                {data.time_series_sample.map((ts, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    <td className="p-2.5 font-bold text-slate-900 dark:text-white print:text-black">{ts.time}</td>
                    <td className="p-2.5 text-center font-medium print:text-black">{ts.temperature} °C</td>
                    <td className="p-2.5 text-center print:text-black">{ts.humidity} %</td>
                    <td className="p-2.5 text-center font-bold text-teal-600 dark:text-teal-400 print:text-black">{ts.pet} °C</td>
                    <td className="p-2.5 text-right print:text-black">{ts.wind_speed ?? 2.4} m/s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 4: ML Benchmark (Only if present) */}
      {data.ml_models && data.ml_models.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-teal-700 dark:text-teal-400 print:text-black uppercase tracking-wider mb-3">
            {data.green_infrastructure_list?.length && data.time_series_sample?.length ? '4.' : (data.green_infrastructure_list?.length || data.time_series_sample?.length) ? '3.' : '2.'} Evaluación Comparativa de Modelos ML
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 print:border-slate-300">
            <table className="w-full text-left text-xs">
              <thead className="bg-teal-900 text-white font-semibold print:bg-slate-200 print:text-black">
                <tr>
                  <th className="p-2.5">Modelo ML</th>
                  <th className="p-2.5 text-center">RMSE</th>
                  <th className="p-2.5 text-center">MAE</th>
                  <th className="p-2.5 text-center">R² Score</th>
                  <th className="p-2.5 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 print:divide-slate-300">
                {data.ml_models.map((m, i) => (
                  <tr key={i} className={m.is_active ? 'bg-teal-50/80 dark:bg-teal-950/40 font-bold' : ''}>
                    <td className="p-2.5 text-slate-900 dark:text-white print:text-black">{m.name}</td>
                    <td className="p-2.5 text-center print:text-black">{m.rmse.toFixed(4)}</td>
                    <td className="p-2.5 text-center print:text-black">{m.mae.toFixed(4)}</td>
                    <td className="p-2.5 text-center font-mono text-emerald-600 dark:text-emerald-400 print:text-black">{m.r2.toFixed(4)}</td>
                    <td className="p-2.5 text-right print:text-black">
                      {m.is_active ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold print:bg-slate-300 print:text-black">
                          ⭐ Activo Ganador
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px] print:text-gray-600">Evaluado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 5: Methodology & Footer Signatures for Print */}
      <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 print:border-slate-400 text-xs text-slate-500 dark:text-slate-400 print:text-black">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-200 print:text-black">
              Gemelo Digital de Infraestructura Verde Urbana
            </p>
            <p className="text-[11px] text-slate-500 print:text-gray-600">
              Simulación ENVI-met + Machine Learning Ensembles | Certificación Digital
            </p>
          </div>
          <div className="text-right text-[11px] print:text-black">
            <p><b>Página 1 de 1</b></p>
            <p className="text-slate-400 print:text-gray-600 font-mono text-[10px]">ID: {data.report_id || 'GD-IVU-2026-EXP'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
