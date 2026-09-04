'use client'

import React from 'react'
import { useTheme } from './ThemeProvider'

interface ThemeToggleProps {
  className?: string
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Cambiar tema claro / oscuro"
      title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
      className={`relative p-2.5 rounded-xl border transition-all duration-300 flex items-center gap-2 text-sm font-medium ${
        theme === 'dark'
          ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-700/80 text-emerald-400 hover:text-emerald-300 shadow-md shadow-emerald-500/10'
          : 'bg-white/90 hover:bg-slate-100 border-slate-200 text-teal-700 hover:text-teal-900 shadow-md'
      } ${className}`}
    >
      {theme === 'dark' ? (
        <>
          <svg className="w-5 h-5 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="hidden sm:inline text-xs font-semibold text-slate-300">Modo Claro</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5 text-slate-700 transition-transform duration-300 -rotate-12 hover:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <span className="hidden sm:inline text-xs font-semibold text-slate-700">Modo Oscuro</span>
        </>
      )}
    </button>
  )
}
