'use client'

import React, { useState } from 'react'
import { Sparkles } from 'lucide-react'
import KPIJustificationModal, { SelectedKPIInfo } from '@/components/dashboard/KPIJustificationModal'

interface AIReasoningBadgeProps {
  metricName: string
  value: string | number
  unit?: string
  scenarioName?: string
  className?: string
  size?: 'sm' | 'md'
}

export default function AIReasoningBadge({
  metricName,
  value,
  unit = '',
  scenarioName = 'Escenario 1 (Trujillo Centro)',
  className = '',
  size = 'sm',
}: AIReasoningBadgeProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedKPI: SelectedKPIInfo = {
    title: metricName,
    value: String(value),
    unit,
    description: `Diagnóstico y fundamentación biofísica para '${metricName}' en ${scenarioName}`,
    scenarioId: scenarioName.includes('2') ? '2' : scenarioName.includes('3') ? '3' : '1',
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1 font-semibold rounded-full transition-all group ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:border-amber-400 hover:shadow-sm hover:shadow-amber-500/20 ${className}`}
        title={`Ver justificación científica IA en modal para ${metricName}`}
      >
        <Sparkles className="w-3 h-3 text-amber-500 group-hover:rotate-12 transition-transform" />
        <span>Justificación IA</span>
      </button>

      {/* Centralized High-Level External Modal rendered via React Portal at z-[99999] */}
      <KPIJustificationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        kpi={selectedKPI}
      />
    </>
  )
}

