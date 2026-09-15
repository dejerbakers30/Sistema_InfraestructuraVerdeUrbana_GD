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

export default function HumidityChart({ scenarioId }: { scenarioId: string | null }) {
  const [chartData, setChartData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const activeId = scenarioId || '1'
    setLoading(false)

    const humidityCurves: Record<string, number[]> = {
      '1': [65, 70, 75, 60, 48, 42, 46, 58],
      '2': [78, 82, 88, 75, 62, 55, 60, 72],
      '3': [82, 86, 92, 80, 68, 62, 67, 78],
      '4': [79, 84, 89, 76, 64, 58, 63, 74],
      '5': [67, 72, 77, 62, 50, 44, 48, 60],
      '6': [85, 90, 95, 84, 72, 66, 71, 82]
    }

    setChartData({
      labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
      datasets: [
        {
          label: 'Humedad Relativa (%)',
          data: humidityCurves[activeId] || humidityCurves['1'],
          borderColor: 'rgb(14, 165, 233)',
          backgroundColor: 'rgba(14, 165, 233, 0.15)',
          fill: true,
          tension: 0.4
        }
      ]
    })
  }, [scenarioId])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    )
  }

  if (!chartData) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
        Selecciona un escenario para ver el gráfico de humedad
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
          text: 'Humedad (%)'
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
