'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'

export default function Home() {
  const router = useRouter()

  const handleGoToDashboard = (e: React.MouseEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('access_token')
    if (token) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white relative overflow-hidden transition-colors duration-300">
      {/* Background Radial Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-cyan-500/20 dark:from-emerald-600/20 dark:via-teal-500/10 dark:to-cyan-500/20 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 left-[-10%] w-[500px] h-[500px] bg-emerald-400/10 dark:bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Header Bar */}
      <nav className="relative z-10 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/60 backdrop-blur-xl transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <span className="text-xl font-black text-slate-950">🌱</span>
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight block leading-none">Gemelo Digital</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium tracking-wide">Infraestructura Verde</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link
              href="/login"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white transition-colors px-4 py-2"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-5 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:shadow-emerald-500/30"
            >
              Crear Cuenta
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300/60 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-8 backdrop-blur-md shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
          Plataforma de Simulación Urbana & ENVI-met v1.0
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-8">
          Gemelo Digital de <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">
            Infraestructura Verde Urbana
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed mb-12">
          Modelado inteligente y análisis del impacto de vegetación urbana en el microclima, confort térmico (PET), biodiversidad y gestión hídrica bajo múltiples escenarios climáticos.
        </p>

        {/* CTA Buttons Container */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 max-w-xl mx-auto">
          {/* Main Dashboard Button */}
          <button
            onClick={handleGoToDashboard}
            className="w-full sm:w-auto group relative px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-base rounded-2xl shadow-xl shadow-emerald-500/25 hover:shadow-emerald-400/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-3"
          >
            <span>Ir al Dashboard</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          {/* Login Button */}
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 bg-white/80 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800/90 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-semibold text-base rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500/50 backdrop-blur-xl shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span>Iniciar Sesión</span>
          </Link>

          {/* Register Button */}
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold text-base rounded-2xl border border-emerald-300 dark:border-emerald-500/40 hover:border-emerald-400 backdrop-blur-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span>Crear Cuenta</span>
          </Link>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16 p-6 rounded-3xl bg-white/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-2xl shadow-xl">
          <div className="p-4 text-center border-r border-slate-200 dark:border-slate-800/80 last:border-r-0">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-300">
              100%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Resolución Microclimática</div>
          </div>
          <div className="p-4 text-center border-r border-slate-200 dark:border-slate-800/80 last:border-r-0">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1 bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-300 dark:to-cyan-400">
              +50
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Indicadores Ambientales</div>
          </div>
          <div className="p-4 text-center col-span-2 md:col-span-1 border-r-0">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1 bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-emerald-600 dark:from-cyan-400 dark:to-emerald-400">
              ENVI-met
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Simulación Integrada</div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="group bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-emerald-500/10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
              Simulación ENVI-met
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Ejecuta simulaciones tridimensionales de alta precisión para evaluar temperatura, viento, humedad y confort térmico en áreas urbanas.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-teal-500/40 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-teal-500/10">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 02-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">
              Análisis Interactivo
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Explora datos espacio-temporales mediante tableros dinámicos, gráficos de Chart.js y mapas GIS interactivos en tiempo real.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-cyan-500/10">
            <div className="w-14 h-14 rounded-2xl bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
              Reportes Automáticos
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Genera e exporta informes ejecutivos en formatos PDF, Word y Excel con comparativas de escenarios de cobertura vegetal.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
