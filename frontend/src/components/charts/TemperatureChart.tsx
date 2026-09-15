'use client'

import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function TemperatureChart({ scenarioId }: { scenarioId: string | null }) {
  const [chartData, setChartData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const activeId = scenarioId || '1'
    setLoading(false)

    const curves: Record<string, number[]> = {
      '1': [20, 19, 18, 23, 29, 32, 29, 24], // Base (sin intervención) - Temperatura alta
      '2': [18, 17, 16, 20, 25, 28, 26, 22], // Techos Verdes (-1.8 °C)
      '3': [17, 16, 15, 19, 23, 26, 24, 20], // Arbolado Masivo (-2.4 °C)
      '4': [18, 17, 16, 19, 24, 27, 25, 21], // Corredores Ecológicos (-2.1 °C)
      '5': [19, 18, 17, 21, 26, 29, 27, 23], // Pavimentos Fríos (-1.5 °C)
      '6': [16, 15, 14, 18, 22, 24, 22, 19]  // Híbrida Sintética (-3.2 °C)
    }

    const scenarioNames: Record<string, string> = {
      '1': 'Escenario Base',
      '2': 'Techos Verdes (50%)',
      '3': 'Arbolado Masivo',
      '4': 'Corredores Ecológicos',
      '5': 'Pavimentos Fríos',
      '6': 'Intervención Híbrida'
    }

    setChartData({
      labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
      datasets: [
        {
          label: `Temp. (°C) - ${scenarioNames[activeId] || 'Simulación'}`,
          data: curves[activeId] || curves['1'],
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Línea Base Ref. (°C)',
          data: curves['1'],
          borderColor: 'rgba(239, 68, 68, 0.4)',
          borderDash: [5, 5],
          fill: false,
          tension: 0.4
        }
      ]
    })
  }, [scenarioId])

  if (loading || !chartData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Temperatura (°C)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Tiempo'
        }
      }
    },
  }

  return <Line data={chartData} options={options} />
}
