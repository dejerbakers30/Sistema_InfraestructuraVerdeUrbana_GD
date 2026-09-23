'use client'

import React from 'react'
import {
  LayoutDashboard,
  Box,
  MapPin,
  Sparkles,
  Cpu,
  MessageSquare,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Leaf,
  LogOut,
  Radio,
  FileText,
  Workflow,
} from 'lucide-react'

export type ActiveModule = 'dashboard' | '3d-twin' | 'maps' | 'predictive' | 'reports' | 'ml' | 'groq-chat' | 'settings'

interface ExecutiveSidebarProps {
  activeModule: ActiveModule
  onSelectModule: (module: ActiveModule) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  groqKeyActive?: boolean
}

export default function ExecutiveSidebar({
  activeModule,
  onSelectModule,
  isCollapsed,
  onToggleCollapse,
  groqKeyActive = false,
}: ExecutiveSidebarProps) {
  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.href = '/login'
  }

  const navItems: {
    id: ActiveModule
    label: string
    shortLabel: string
    icon: React.ReactNode
    badge?: string
    badgeColor?: string
  }[] = [
    {
      id: 'dashboard',
      label: 'Panel Ejecutivo GIS',
      shortLabel: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      badge: 'Live',
      badgeColor: 'emerald',
    },
    {
      id: '3d-twin',
      label: 'Gemelo Digital 3D',
      shortLabel: 'Visor 3D',
      icon: <Box className="w-5 h-5 text-cyan-400" />,
      badge: 'WebGL',
      badgeColor: 'cyan',
    },
    {
      id: 'maps',
      label: 'Cartografía 2D GIS',
      shortLabel: 'Mapas',
      icon: <MapPin className="w-5 h-5 text-teal-400" />,
      badge: 'Capas',
      badgeColor: 'teal',
    },
    {
      id: 'predictive',
      label: 'IA Predictiva & Casos',
      shortLabel: 'Predicción',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      badge: 'Groq IA',
      badgeColor: 'amber',
    },
    {
      id: 'reports',
      label: 'Reportes Técnicos',
      shortLabel: 'Reportes',
      icon: <FileText className="w-5 h-5 text-blue-400" />,
      badge: 'PDF/DOC',
      badgeColor: 'blue',
    },
    {
      id: 'ml',
      label: 'Motor ML (5 Modelos)',
      shortLabel: 'Modelos',
      icon: <Cpu className="w-5 h-5 text-emerald-400" />,
      badge: 'Hybrid',
      badgeColor: 'purple',
    },
    {
      id: 'groq-chat',
      label: 'Asistente IA Langflow',
      shortLabel: 'Langflow',
      icon: <Workflow className="w-5 h-5 text-emerald-400" />,
      badge: 'Agente',
      badgeColor: 'emerald',
    },
    {
      id: 'settings',
      label: 'Configuración & APIs',
      shortLabel: 'Ajustes',
      icon: <Sliders className="w-5 h-5 text-slate-400" />,
    },
  ]

  return (
    <aside
      className={`h-screen sticky top-0 z-30 flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/95 backdrop-blur-2xl ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Top Header & Brand */}
      <div>
        <div className="h-20 flex items-center justify-between px-4 border-b border-slate-200/80 dark:border-slate-800/80">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Leaf className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white truncate">
                  GEMELO DIGITAL
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-600 dark:text-emerald-400">
                  Infraestructura Verde
                </span>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Leaf className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Telemetry Status Block (only shown expanded) */}
        {!isCollapsed && (
          <div className="p-3 mx-3 my-3 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" /> Telemetría GIS
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                EPSG:4326
              </span>
            </div>
            <div className="px-2.5 py-1.5 rounded-lg bg-white/80 dark:bg-slate-950/80 border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-[10px]">
              <span className="text-slate-500 font-medium">Área Territorial:</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold">Trujillo Centro</span>
            </div>
          </div>
        )}

        {/* Navigation List */}
        <nav className="px-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const isActive = activeModule === item.id
            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/5'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/60 border border-transparent'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <div
                  className={`flex-shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-emerald-600 dark:text-emerald-400' : ''
                  }`}
                >
                  {item.icon}
                </div>

                {!isCollapsed && (
                  <div className="flex items-center justify-between w-full overflow-hidden">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md border font-bold ${
                          item.badgeColor === 'emerald'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : item.badgeColor === 'cyan'
                            ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
                            : item.badgeColor === 'amber'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            : item.badgeColor === 'purple'
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
                            : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Footer / User Profile Card */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80">
        {!isCollapsed ? (
          <div className="p-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                AD
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  Admin Territorial
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  admin@gemelodigital.com
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex justify-center p-2 rounded-xl text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            title="Cerrar Sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  )
}
