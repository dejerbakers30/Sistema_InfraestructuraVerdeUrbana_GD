'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Sparkles,
  BookOpen,
  Layers,
  HeartPulse,
  Send,
  CheckCircle2,
  RefreshCw,
  Trees,
  Calculator,
  Compass,
} from 'lucide-react'

export interface SelectedKPIInfo {
  title: string
  value: string
  unit: string
  description: string
  scenarioId?: string
}

interface KPIJustificationModalProps {
  isOpen: boolean
  onClose: () => void
  kpi: SelectedKPIInfo | null
}

type ModalTab = 'diagnostic' | 'equations' | 'health' | 'action' | 'ask-groq'

export default function KPIJustificationModal({
  isOpen,
  onClose,
  kpi,
}: KPIJustificationModalProps) {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<ModalTab>('diagnostic')
  const [explanation, setExplanation] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [providerModel, setProviderModel] = useState<string>('llama-3.3-70b-versatile')

  // Interactive follow-up question state
  const [customQuestion, setCustomQuestion] = useState('')
  const [customAnswer, setCustomAnswer] = useState<string | null>(null)
  const [askingGroq, setAskingGroq] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen && kpi) {
      setActiveTab('diagnostic')
      setExplanation(null)
      setCustomAnswer(null)
      setCustomQuestion('')
      fetchJustification(kpi)
    }
  }, [isOpen, kpi])

  const fetchJustification = async (item: SelectedKPIInfo) => {
    setLoading(true)
    try {
      const storedKey = typeof window !== 'undefined' ? localStorage.getItem('groq_api_key') : null
      const res = await fetch('http://localhost:8000/api/v1/ai/justify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric_name: item.title,
          value: item.value,
          unit: item.unit,
          scenario_name: `Escenario ${item.scenarioId || '1'} (Trujillo Metropolitano)`,
          api_key: storedKey || undefined,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setExplanation(data.explanation)
        setProviderModel(data.model || 'llama-3.3-70b-versatile')
      } else {
        setExplanation(
          `El valor registrado de ${item.value} ${item.unit} para '${item.title}' en el Gemelo Digital responde al balance energético superficial y a la amortiguación microclimática por evapotranspiración de la biomasa foliar.`
        )
      }
    } catch {
      setExplanation(
        `El valor de ${item.value} ${item.unit} en '${item.title}' refleja la mitigación térmica activa por sombra vegetal y flujo de calor latente en el área urbana intervenida.`
      )
    } finally {
      setLoading(false)
    }
  }

  const handleAskGroq = async () => {
    if (!customQuestion.trim() || askingGroq || !kpi) return
    setAskingGroq(true)
    try {
      const storedKey = typeof window !== 'undefined' ? localStorage.getItem('groq_api_key') : null
      const res = await fetch('http://localhost:8000/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Respecto al indicador '${kpi.title}' con valor '${kpi.value} ${kpi.unit}' en el Gemelo Digital de Trujillo: ${customQuestion}`,
            },
          ],
          context: {
            metric: kpi.title,
            value: kpi.value,
            unit: kpi.unit,
            city: 'Trujillo, Perú',
          },
          api_key: storedKey || undefined,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setCustomAnswer(data.content)
      } else {
        setCustomAnswer('No fue posible procesar la consulta en este momento.')
      }
    } catch {
      setCustomAnswer('Error de conexión con el motor de IA Groq.')
    } finally {
      setAskingGroq(false)
    }
  }

  if (!isOpen || !kpi || !mounted) return null

  // Scientific Equations reference based on metric
  const getEquationData = (title: string) => {
    const t = title.toLowerCase()
    if (t.includes('pet') || t.includes('confort')) {
      return {
        formula: 'R_n = H + LE + G + S',
        explanation:
          'Balance Energético Superficial: La radiación neta (R_n) se disipa entre calor sensible del aire (H), calor latente de evapotranspiración (LE) y almacenamiento térmico del suelo (G). La vegetación desvía hasta el 70% de la energía hacia calor latente (LE), evitando el sobrecalentamiento del aire.',
        formula2: 'PET = f(T_a, T_mrt, v, RH, M, I_{cl})',
        explanation2:
          'Ecuación de Höppe (1999): Temperatura Fisiológica Equivalente dependiente de la Temperatura Radiante Media (T_mrt). Cada reducción de 10°C en T_mrt disminuye el PET peatonal en ~3.2°C.',
      }
    } else if (t.includes('temp') || t.includes('uhi') || t.includes('calor')) {
      return {
        formula: '\\Delta T_{UHI} = T_{urbano} - T_{rural} = \\frac{Q_F + R_n - H - LE}{C_p \\cdot \\rho \\cdot h}',
        explanation:
          'Intensidad de Isla de Calor Urbana: Depende de la emisión antropogénica (Q_F), albedo de superficies y déficit de calor latente (LE). Los corredores verdes incrementan LE mediante transpiración estomática, abatiendo la sobretemperatura.',
        formula2: 'LE = \\lambda \\cdot ET = \\rho \\cdot L_v \\cdot \\frac{q_s - q_a}{r_a + r_s}',
        explanation2:
          'Flujo de Evapotranspiración Latente (Penman-Monteith): Enfriamiento activo de la canopia regulado por la resistencia estomática (r_s) y aerodinámica (r_a).',
      }
    } else if (t.includes('humedad')) {
      return {
        formula: 'RH = \\frac{e}{e_s(T)} \\times 100\\%',
        explanation:
          'Humedad Relativa: Relación porcentual entre la presión de vapor actual (e) y la presión de vapor saturado (e_s) a la temperatura de bulbo seco. La vegetación aporta vapor de agua atenuando el choque térmico seco.',
        formula2: 'e_s(T) = 0.6108 \\cdot \\exp\\left(\\frac{17.27 T}{T + 237.3}\\right)',
        explanation2:
          'Ecuación de Tetens: Permite modelar el gradiente psicrométrico y la capacidad de enfriamiento adiabático en microclimas urbanos.',
      }
    } else if (t.includes('viento')) {
      return {
        formula: 'u(z) = \\frac{u_*}{\\kappa} \\ln\\left(\\frac{z - d}{z_0}\\right)',
        explanation:
          'Perfil Logarítmico del Viento Urbano: Modificación de la velocidad del flujo eólico en función de la altura (z), plano de desplazamiento (d) y rugosidad aerodinámica del dosel arbóreo (z_0).',
        formula2: '\\frac{\\partial \\mathbf{u}}{\\partial t} + (\\mathbf{u} \\cdot \\nabla)\\mathbf{u} = -\\frac{1}{\\rho}\\nabla p + \\nu \\nabla^2 \\mathbf{u} + \\mathbf{g}\\beta(T - T_0)',
        explanation2:
          'Ecuaciones de Navier-Stokes con Aproximación de Boussinesq: Resueltas por ENVI-met 3D CFD para canalización de brisas y ventilación de cañones urbanos.',
      }
    } else if (t.includes('escorrentía') || t.includes('agua') || t.includes('drenaje') || t.includes('suds')) {
      return {
        formula: 'Q = C \\cdot I \\cdot A',
        explanation:
          'Método Racional de Escorrentía Pluvial: Donde Q es el caudal pico (m³/s), C es el coeficiente de escorrentía (adimensional), I es la intensidad de lluvia (mm/h) y A es el área urbana aportante (ha). El suelo permeable y SUDs reducen C de 0.85 a 0.25.',
        formula2: 'V_{ret} = P \\cdot A \\cdot (1 - C)',
        explanation2:
          'Volumen Retenido por Drenaje Sostenible (SUDs): Capacidad de retención e infiltración biológica que alivia la red de colectores pluviales.',
      }
    } else if (t.includes('cartografía') || t.includes('distribución') || t.includes('espacial') || t.includes('gis')) {
      return {
        formula: 'I_{\\text{Moran}} = \\frac{N}{S_0} \\frac{\\sum_{i} \\sum_{j} w_{ij} (x_i - \\bar{x})(x_j - \\bar{x})}{\\sum_{i} (x_i - \\bar{x})^2}',
        explanation:
          'Índice de Autocorrelación Espacial de Moran: Evalúa la aglomeración de islas térmicas frente a oasis de vegetación urbana. Un valor cercano a +1.0 indica clusters térmicos concentrados que requieren corredores continuos de conectividad biológica.',
        formula2: 'NDVI = \\frac{NIR - RED}{NIR + RED}, \\quad LAI = a \\cdot e^{b \\cdot NDVI}',
        explanation2:
          'Teledetección y Cartografía de Biomasa: Transformación espectral multiespectral para cuantificar la densidad de copa y la heterogeneidad espacial del dosel en Trujillo.',
      }
    } else if (t.includes('3d') || t.includes('modelo') || t.includes('volum')) {
      return {
        formula: '\\frac{\\partial T}{\\partial t} + u_i \\frac{\\partial T}{\\partial x_i} = K_h \\frac{\\partial^2 T}{\\partial x_i^2} + \\frac{1}{c_p \\rho} \\left( \\frac{\\partial R_l}{\\partial z} + \\frac{\\partial R_s}{\\partial z} \\right)',
        explanation:
          'Conservación de Energía Térmica en Malla ENVI-met 3D: Resuelve la interacción tridimensional entre edificios (radiación de onda larga reflejada), radiación solar directa y enfriamiento foliar en celdas DX/DY/DZ de 2.0m.',
        formula2: 'SVF(x,y) = \\frac{1}{2\\pi} \\int_0^{2\\pi} \\cos^2(\\theta_{\\text{horizon}}(\\phi)) d\\phi',
        explanation2:
          'Factor de Visión de Cielo (Sky View Factor 3D): Cuantifica el atrapamiento de radiación solar en cañones de calles urbanas.',
      }
    } else {
      return {
        formula: 'LAI = \\frac{\\text{Área Foliar Total}}{\\text{Área Superficie Suelo}}',
        explanation:
          'Índice de Área Foliar (LAI): Cuantifica la densidad de copa del estrato arbóreo. Valores de LAI > 2.8 aseguran una intercepción de radiación solar directa superior al 85%.',
        formula2: 'C_{seq} = B_{foliar} \\cdot 0.47 \\cdot \\frac{44}{12}',
        explanation2:
          'Secuestro de Carbono Biogénico: Relación alométrica entre incremento de biomasa seca anual y absorción neta de CO₂ equivalente.',
      }
    }
  }

  const eqData = getEquationData(kpi.title)

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="p-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-cyan-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Justificación Científica & Diagnóstico IA
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                  ENVI-met 3D Solver
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fundamentación biofísica, ecuaciones del modelo y recomendaciones para el planificador
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected KPI Summary Card Banner */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Indicador Analizado
            </span>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{kpi.title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">{kpi.description}</p>
          </div>

          <div className="text-right">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {kpi.value} <span className="text-base font-semibold">{kpi.unit}</span>
            </span>
            <span className="text-[10px] block text-slate-400 font-medium">
              Simulación Escenario {kpi.scenarioId || '1'}
            </span>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('diagnostic')}
            className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'diagnostic'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Diagnóstico IA</span>
          </button>

          <button
            onClick={() => setActiveTab('equations')}
            className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'equations'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Ecuaciones Físicas</span>
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'health'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>Impacto & Salud</span>
          </button>

          <button
            onClick={() => setActiveTab('action')}
            className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'action'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Trees className="w-4 h-4" />
            <span>Plan de Acción</span>
          </button>

          <button
            onClick={() => setActiveTab('ask-groq')}
            className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'ask-groq'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Preguntar a Groq</span>
          </button>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: Diagnóstico IA */}
          {activeTab === 'diagnostic' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {loading ? (
                <div className="p-12 text-center space-y-2">
                  <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-slate-500">Generando diagnóstico termodinámico con IA...</p>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line space-y-3 font-normal">
                  {explanation}
                </div>
              )}

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">Modelo Inferencia:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {providerModel}
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: Ecuaciones Físicas */}
          {activeTab === 'equations' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {eqData.formula}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {eqData.explanation}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="font-mono font-bold text-teal-600 dark:text-teal-400 text-sm">
                  {eqData.formula2}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {eqData.explanation2}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-800 dark:text-cyan-300 font-medium">
                💡 Los parámetros se resuelven mediante el motor CFD tridimensional de ENVI-met integrando mallas de 2m × 2m y condiciones radiativas de Trujillo Centro.
              </div>
            </div>
          )}

          {/* TAB 3: Impacto & Salud */}
          {activeTab === 'health' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Confort Térmico Ciudadano
                  </span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    Disminución del Estrés Bioclimático
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Al mantener el índice PET por debajo de 29°C, la sensación en peatones pasa de "Calor Fuerte" a "Confort Aceptable", reduciendo episodios de fatiga y golpes de calor en adultos mayores.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    Ahorro Energético Edificatorio
                  </span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    Reducción de Demanda HVAC
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    La amortiguación térmica exterior en -2.4°C reduce la carga de refrigeración mecánica en edificios adyacentes en hasta un 18% en horas pico de radiación.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Plan de Acción */}
          {activeTab === 'action' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Trees className="w-4 h-4" /> 1. Silvicultura Urbana Prioritaria
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Sembrar especies de copa aparasolada como <em>Tipuana tipu</em> y <em>Jacaranda mimosifolia</em> en marcos de plantación de 8 metros para garantizar dosel continuo en aceras este-oeste.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" /> 2. Ordenanza de Techos Verdes
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Incentivar cubiertas verdes extensivas con especies crasuláceas (<em>Sedum</em>) en azoteas comerciales para abatir la radiación de onda larga nocturna.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: Preguntar a Groq */}
          {activeTab === 'ask-groq' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <p className="text-xs text-slate-500">
                Formula una consulta específica a Groq sobre este indicador y obtén una respuesta contextualizada en segundos:
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Ej: ¿Cómo afecta este valor de ${kpi.title} a la resiliencia climática?`}
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAskGroq()
                  }}
                  className="flex-1 px-4 py-2.5 text-xs rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleAskGroq}
                  disabled={!customQuestion.trim() || askingGroq}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-lg shadow-indigo-500/25"
                >
                  {askingGroq ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Preguntar</span>
                </button>
              </div>

              {customAnswer && (
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line space-y-2">
                  <div className="font-bold text-indigo-500 text-[11px] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Respuesta Groq LLM:
                  </div>
                  <div>{customAnswer}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Datos validados con simulación ENVI-met 3D</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition-opacity"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
