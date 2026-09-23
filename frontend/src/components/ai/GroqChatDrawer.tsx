'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  MessageSquare,
  Send,
  Key,
  Sparkles,
  Bot,
  User,
  Trash2,
  Check,
  AlertCircle,
  Cpu,
  RefreshCw,
  Workflow,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  model?: string
  provider?: string
}

const QUICK_PROMPTS = [
  '¿Cuáles son los KPIs actuales del gemelo digital y su impacto en PET?',
  '¿Qué beneficios aporta el Molle en zonas urbanas según el sistema?',
  '¿Cómo mitigan los techos verdes y jardines de lluvia la escorrentía?',
  '¿Qué escenarios de simulación ENVI-met están disponibles en el gemelo?',
]

const LANGFLOW_URL = 'http://localhost:7860'
const LANGFLOW_FLOW_ID = '311bf9f2-f7e5-41bb-8d34-dcf73ba2d176'
const LANGFLOW_API_KEY = 'sk-2BkMQeosmoYUIMHmMkoTli4x3VgaOQFyEFnpHzlkcmo'

export default function GroqChatDrawer({
  scenarioId,
  isOpen,
  onClose,
}: {
  scenarioId?: string | null
  isOpen?: boolean
  onClose?: () => void
}) {
  const [provider, setProvider] = useState<'langflow' | 'groq'>('langflow')
  const [langflowStatus, setLangflowStatus] = useState<{
    online: boolean
    flowName?: string
    checked: boolean
  }>({ online: false, checked: false })

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '👋 Hola, soy el **Agente Inteligente del Gemelo Digital de Infraestructura Verde Urbana**.\n\nEstoy enlazado con la base de conocimiento y los módulos de simulación **ENVI-met 3D**, confort térmico **PET**, selección de especies vegetales y mitigación de islas de calor urbanas (ICU).\n\n¿Qué análisis o métricas del gemelo digital deseas consultar hoy?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: 'Agente Gemelo Digital Urbano',
      provider: 'Langflow',
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showConfig, setShowConfig] = useState(false)
  const [keySaved, setKeySaved] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Verify Langflow status
  useEffect(() => {
    async function checkLangflow() {
      try {
        // Try backend langflow status endpoint first
        const res = await fetch('http://localhost:8000/api/v1/ai/langflow/status', {
          signal: AbortSignal.timeout(3000),
        })
        if (res.ok) {
          const data = await res.json()
          setLangflowStatus({
            online: data.status === 'connected',
            flowName: data.flow_name || 'Agente Gemelo Digital Urbano',
            checked: true,
          })
          return
        }
      } catch {
        // Fallback to checking Langflow directly
        try {
          const direct = await fetch(`${LANGFLOW_URL}/health`, {
            signal: AbortSignal.timeout(2000),
          })
          if (direct.ok) {
            setLangflowStatus({
              online: true,
              flowName: 'Agente Gemelo Digital Urbano',
              checked: true,
            })
            return
          }
        } catch {
          // offline
        }
      }
      setLangflowStatus({ online: false, checked: true })
    }

    checkLangflow()
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('groq_api_key')
      if (storedKey) setApiKey(storedKey)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSaveApiKey = () => {
    if (typeof window !== 'undefined') {
      if (apiKey.trim()) {
        localStorage.setItem('groq_api_key', apiKey.trim())
        setKeySaved(true)
        setTimeout(() => setKeySaved(false), 2500)
      } else {
        localStorage.removeItem('groq_api_key')
      }
    }
  }

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage
    if (!text.trim() || loading) return

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInputMessage('')
    setLoading(true)

    const digitalTwinContext = {
      scenario_id: scenarioId || '1',
      active_model: 'ENVI-met 3D microclimate simulation',
      kpis: { avg_pet: 28.5, green_area: 15.3, runoff: 0.35, temp_reduction: 2.4 },
    }

    try {
      if (provider === 'langflow') {
        let agentContent = ''
        let agentModel = 'Agente Gemelo Digital Urbano (Langflow)'

        // Method A: Via Backend FastAPI
        try {
          const res = await fetch('http://localhost:8000/api/v1/ai/langflow/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: text.trim(),
              context: digitalTwinContext,
            }),
            signal: AbortSignal.timeout(45000),
          })
          if (res.ok) {
            const data = await res.json()
            agentContent = data.content
            if (data.flow_name) agentModel = data.flow_name
          }
        } catch {
          // fallback to Direct Langflow Execution
        }

        // Method B: Direct Langflow API fallback if backend proxy not available
        if (!agentContent) {
          const directRes = await fetch(`${LANGFLOW_URL}/api/v1/run/${LANGFLOW_FLOW_ID}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': LANGFLOW_API_KEY,
            },
            body: JSON.stringify({
              input_value: text.trim(),
              input_type: 'chat',
              output_type: 'chat',
            }),
          })
          if (directRes.ok) {
            const flowData = await directRes.json()
            const outputs = flowData.outputs || []
            for (const out of outputs) {
              for (const sub of out.outputs || []) {
                const msg = sub.results?.message
                if (typeof msg === 'object' && msg?.text) {
                  agentContent = msg.text
                  break
                } else if (typeof msg === 'string') {
                  agentContent = msg
                  break
                }
              }
              if (agentContent) break
            }
          }
        }

        if (agentContent) {
          const botMsg: ChatMessage = {
            id: String(Date.now() + 1),
            role: 'assistant',
            content: agentContent,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            model: agentModel,
            provider: 'Langflow',
          }
          setMessages((prev) => [...prev, botMsg])
        } else {
          throw new Error('No se pudo obtener respuesta del agente Langflow')
        }
      } else {
        // Groq Provider
        const storedKey = typeof window !== 'undefined' ? localStorage.getItem('groq_api_key') : null
        const res = await fetch('http://localhost:8000/api/v1/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
            context: digitalTwinContext,
            api_key: storedKey || undefined,
          }),
        })

        if (res.ok) {
          const data = await res.json()
          const botMsg: ChatMessage = {
            id: String(Date.now() + 1),
            role: 'assistant',
            content: data.content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            model: data.model || 'llama-3.3-70b-versatile',
            provider: 'Groq Cloud',
          }
          setMessages((prev) => [...prev, botMsg])
        } else {
          throw new Error('Error al consultar Groq')
        }
      }
    } catch (err) {
      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content:
          provider === 'langflow'
            ? '⚠️ No fue posible comunicar con el Agente de Langflow en http://localhost:7860/. Verifica que el contenedor Langflow esté activo y el flujo sincronizado.'
            : '⚠️ No fue posible conectar con el servicio Groq de IA. Verifica tu API Key o inténtalo nuevamente.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: provider === 'langflow' ? 'Langflow' : 'Groq',
      }
      setMessages((prev) => [...prev, botMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Historial reiniciado. ¿Qué tema del Gemelo Digital deseas analizar?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: provider === 'langflow' ? 'Agente Gemelo Digital Urbano' : 'Groq Cloud',
        provider: provider === 'langflow' ? 'Langflow' : 'Groq',
      },
    ])
  }

  return (
    <div className="flex flex-col h-[700px] bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-cyan-500/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-md">
            {provider === 'langflow' ? <Workflow className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {provider === 'langflow' ? 'Agente Langflow' : 'Asistente Groq'}
              </h3>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold flex items-center gap-1 ${
                  langflowStatus.online
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    langflowStatus.online ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                {provider === 'langflow'
                  ? langflowStatus.online
                    ? 'Langflow v1.12 Online'
                    : 'Langflow :7860'
                  : 'Groq Cloud'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {provider === 'langflow'
                ? 'Agente Gemelo Digital Urbano · ENVI-met & Confort PET'
                : 'Inferencia ultra-rápida & Consultoría Microclimática'}
            </p>
          </div>
        </div>

        {/* Action Controls & Provider Selector */}
        <div className="flex items-center gap-2">
          {/* Provider toggle button */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setProvider('langflow')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                provider === 'langflow'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Usar Agente de Langflow local (http://localhost:7860)"
            >
              <Workflow className="w-3 h-3" />
              <span>Langflow</span>
            </button>
            <button
              onClick={() => setProvider('groq')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                provider === 'groq'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Usar Groq Cloud"
            >
              <Cpu className="w-3 h-3" />
              <span>Groq</span>
            </button>
          </div>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-xs transition-all"
            title="Configuración de conexiones"
          >
            <Key className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleClearChat}
            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Limpiar conversación"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Configuration Drawer */}
      {showConfig && (
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Workflow className="w-4 h-4 text-emerald-500" /> Servidor Langflow Activo
            </span>
            <a
              href="http://localhost:7860/"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-600 hover:underline flex items-center gap-1 text-[11px]"
            >
              <span>Abrir UI Langflow</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <div className="flex justify-between font-mono text-[11px]">
              <span>URL:</span>
              <span className="text-slate-900 dark:text-white font-bold">http://localhost:7860/</span>
            </div>
            <div className="flex justify-between font-mono text-[11px]">
              <span>Usuario:</span>
              <span className="text-slate-900 dark:text-white font-bold">langflow</span>
            </div>
            <div className="flex justify-between font-mono text-[11px]">
              <span>Flujo:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                Agente Gemelo Digital Urbano
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-500" /> Clave Groq Cloud (Opcional)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                placeholder="gsk_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleSaveApiKey}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors flex items-center gap-1"
              >
                {keySaved ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{keySaved ? 'Guardado' : 'Guardar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user'
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs flex-shrink-0 font-bold shadow-sm ${
                  isUser
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : msg.provider === 'Langflow'
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white'
                    : 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-1.5 shadow-md ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-100/95 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                <div className="whitespace-pre-line font-normal">{msg.content}</div>
                <div
                  className={`text-[9px] font-mono flex items-center justify-between pt-1 border-t ${
                    isUser
                      ? 'border-white/20 text-emerald-100'
                      : 'border-slate-200 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.model && (
                    <span className="flex items-center gap-1 font-semibold">
                      {msg.provider === 'Langflow' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      )}
                      {msg.model}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800/60 rounded-2xl w-56 text-xs text-slate-500 dark:text-slate-400">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" />
            <span>
              {provider === 'langflow'
                ? 'Agente Langflow razonando...'
                : 'Generando respuesta con Groq...'}
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2 bg-slate-50/70 dark:bg-slate-950/40 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-2 overflow-x-auto text-[11px] scrollbar-none">
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            className="flex-shrink-0 px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400 text-slate-600 dark:text-slate-400 transition-all font-medium truncate max-w-xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSendMessage()
        }}
        className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={
            provider === 'langflow'
              ? 'Pregunta al Agente Langflow sobre KPIs, PET, especies o simulación...'
              : 'Pregunta sobre microclima, confort térmico o ENVI-met...'
          }
          className="flex-1 px-4 py-2.5 text-xs rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || loading}
          className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-lg shadow-emerald-500/25 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
