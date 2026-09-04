'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import Leaflet to avoid SSR issues
const Map = dynamic(() => import('./LeafletMap'), { ssr: false })

export default function MapContainer({ scenarioId }: { scenarioId: string | null }) {
  const [mapData, setMapData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch spatial data from API
    if (scenarioId) {
      setLoading(false)
      setMapData({
        center: [-12.0464, -77.0428], // Lima coordinates
        zoom: 13,
        layers: [
          {
            type: 'heatmap',
            data: [],
            variable: 'temperature'
          }
        ]
      })
    }
  }, [scenarioId])

  if (loading) {
    return (
      <div className="h-full bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return <Map data={mapData} />
}
