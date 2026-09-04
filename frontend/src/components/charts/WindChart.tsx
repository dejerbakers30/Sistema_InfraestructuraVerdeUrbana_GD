'use client'

import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export default function WindChart({ scenarioId }: { scenarioId: string | null }) {
  const [chartData, setChartData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (scenarioId) {
      setLoading(false)
      const data = scenarioId === '2' 
        ? [1.0, 0.8, 0.6, 1.2, 2.2, 2.8, 2.3, 1.5]
        : [1.4, 1.1, 0.9, 1.7, 3.1, 3.8, 3.2, 2.0]

      setChartData({
        labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
        datasets: [
          {
            label: 'Velocidad del Viento (m/s)',
            data: data,
            backgroundColor: 'rgba(99, 102, 241, 0.7)',
            borderColor: 'rgb(99, 102, 241)',
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      })
    } else {
      setLoading(false)
      setChartData(null)
    }
  }, [scenarioId])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!chartData) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
        Selecciona un escenario para ver el gráfico de viento
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
        beginAtZero: true,
        title: {
          display: true,
          text: 'Velocidad (m/s)'
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

  return <Bar data={chartData} options={options} />
}
