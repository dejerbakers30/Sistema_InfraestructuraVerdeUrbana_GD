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
} from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  model?: string
}

const QUICK_PROMPTS = [
  '¿Cómo influyen los árboles en el índice PET?',
  '¿Qué especies arbóreas son mejores para reducir 2°C?',
  '¿Cómo mitigan los techos verdes la escorrentía?',
  'Analiza el escenario actual y dame 3 recomendaciones.',
]

export default function GroqChatDrawer({
  scenarioId,
  isOpen,
  onClose,
}: {
  scenarioId?: string | null
  isOpen?: boolean
  onClose?: () => void
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '👋 Hola, soy tu Asistente de IA y Gemelos Digitales Urbanos con Groq. Puedo ayudarte a analizar microclima, evaluar confort térmico PET, simular escenarios de cobertura verde y optimizar el diseño de tu infraestructura urbana. ¿En qué puedo asistirte hoy?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: 'llama-3.3-70b-versatile',
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showKeyConfig, setShowKeyConfig] = useState(false)
  const [keySaved, setKeySaved] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

    try {
      const storedKey = typeof window !== 'undefined' ? localStorage.getItem('groq_api_key') : null
      const res = await fetch('http://localhost:8000/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          context: {
            scenario_id: scenarioId || '1',
            active_model: 'ENVI-met 3D microclimate simulation',
            kpis: { avg_pet: 28.5, green_area: 15.3, runoff: 0.35, temp_reduction: 2.4 },
          },
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
        }
        setMessages((prev) => [...prev, botMsg])
      } else {
        const botMsg: ChatMessage = {
          id: String(Date.now() + 1),
          role: 'assistant',
          content:
            '⚠️ Hubo una respuesta inesperada del servicio de IA. Verifica tu API Key de Groq o inténtalo nuevamente.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages((prev) => [...prev, botMsg])
      }
    } catch (err) {
      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content:
          '⚠️ No fue posible conectar con el backend de IA. Verifica que el contenedor backend esté activo.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
        content: 'Historial reiniciado. ¿En qué puedo asistirte?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'llama-3.3-70b-versatile',
      },
    ])
  }

  return (
    <div className="flex flex-col h-[700px] bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-r from-indigo-500/10 via-emerald-500/5 to-cyan-500/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-500 shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Asistente Groq IA
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                Llama 3.3 70B
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Inferencia ultra-rápida & Consultoría Microclimática
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKeyConfig(!showKeyConfig)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              apiKey
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
            }`}
            title="Configurar Groq API Key"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{apiKey ? 'Key Activa' : 'Configurar Key'}</span>
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

      {/* Optional Groq API Key Dropdown Banner */}
      {showKeyConfig && (
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-500" /> Clave de API de Groq Cloud (Opcional)
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Se guarda en tu navegador</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="password"
              placeholder="gsk_..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={handleSaveApiKey}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors flex items-center gap-1"
            >
              {keySaved ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{keySaved ? 'Guardado' : 'Guardar'}</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Si no ingresas una clave, el asistente utilizará la base de conocimiento y el motor científico integrado del sistema.
          </p>
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
                    : 'bg-gradient-to-tr from-indigo-500 to-emerald-500 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-1.5 shadow-md ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-100/90 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
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
                  {msg.model && <span>{msg.model}</span>}
                </div>
              </div>
            </div>
          )
        })}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800/60 rounded-2xl w-48 text-xs text-slate-500 dark:text-slate-400">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" />
            <span>Generando respuesta...</span>
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
          placeholder="Pregunta sobre microclima, confort PET, especies de árboles o ENVI-met..."
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
