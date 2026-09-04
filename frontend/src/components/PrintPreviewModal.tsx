'use client'

import React, { useState } from 'react'

interface PrintPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export default function PrintPreviewModal({
  isOpen,
  onClose,
  title = 'Vista Previa de Impresión - Gemelo Digital',
  children
}: PrintPreviewModalProps) {
  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 print:p-0 print:static print:bg-white print:overflow-visible">
      {/* Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden print:max-w-none print:max-h-none print:shadow-none print:border-none print:rounded-none print:w-full">
        
        {/* Header - Hidden on Print */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-sm transition-colors flex items-center gap-2 shadow-lg shadow-teal-600/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir / PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Printable Content Body */}
        <div className="p-8 overflow-y-auto flex-1 text-slate-900 dark:text-slate-100 print:p-0 print:overflow-visible print:text-black">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-6 print:border-black">
            <h1 className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 print:text-black">
              Gemelo Digital de Infraestructura Verde Urbana
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 print:text-gray-600">
              Reporte de Simulación y Predicción Microclimática por Machine Learning | Fecha: {new Date().toLocaleDateString('es-ES')}
            </p>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  )
}
