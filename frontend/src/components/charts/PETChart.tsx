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

export default function PETChart({ scenarioId }: { scenarioId: string | null }) {
  const [chartData, setChartData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const activeId = scenarioId || '1'
    setLoading(false)

    const petCurves: Record<string, number[]> = {
      '1': [23, 22, 21, 27, 36, 39, 34, 28], // Estrés térmico fuerte en hora punta
      '2': [18, 17, 16, 21, 28, 31, 27, 22],
      '3': [16, 15, 14, 18, 24, 27, 23, 19], // Gran mejora por sombra arbórea
      '4': [17, 16, 15, 19, 25, 28, 24, 20],
      '5': [19, 18, 17, 22, 29, 32, 28, 23],
      '6': [15, 14, 13, 17, 22, 25, 21, 17]  // Confort óptimo en todas las horas
    }

    setChartData({
      labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
      datasets: [
        {
          label: 'Índice PET (°C)',
          data: petCurves[activeId] || petCurves['1'],
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          fill: true,
          tension: 0.4
        }
      ]
    })
  }, [scenarioId])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  if (!chartData) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
        Selecciona un escenario para ver el gráfico PET
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
          text: 'PET (°C)'
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
