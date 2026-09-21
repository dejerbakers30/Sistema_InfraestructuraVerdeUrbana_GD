'use client'

import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTheme } from '@/components/ThemeProvider'
import {
  Layers,
  Compass,
  Eye,
  Info,
  Maximize2,
  Minimize2,
  Thermometer,
  Trees,
  Droplets,
  MapPin,
} from 'lucide-react'

// Fix default leaflet marker icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface LeafletMapProps {
  data?: any
  scenarioId?: string | null
}

export default function LeafletMap({ data, scenarioId }: LeafletMapProps) {
  const { theme } = useTheme()
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)

  // Layer toggles
  const [showGreenery, setShowGreenery] = useState(true)
  const [showHeatIsland, setShowHeatIsland] = useState(true)
  const [showTrees, setShowTrees] = useState(true)
  const [showDrainage, setShowDrainage] = useState(true)
  const [baseMapType, setBaseMapType] = useState<'streets' | 'satellite'>('streets')

  // Live cursor telemetry
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: -8.1116, lng: -79.0287 })
  const [zoomLevel, setZoomLevel] = useState<number>(14)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Layer groups refs
  const greeneryGroupRef = useRef<L.LayerGroup>(L.layerGroup())
  const heatIslandGroupRef = useRef<L.LayerGroup>(L.layerGroup())
  const treesGroupRef = useRef<L.LayerGroup>(L.layerGroup())
  const drainageGroupRef = useRef<L.LayerGroup>(L.layerGroup())

  // Base tile URLs (100% Free - No API Key Required)
  const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
  const lightTileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
  const satelliteTileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

  const getActiveTileUrl = () => {
    if (baseMapType === 'satellite') return satelliteTileUrl
    // Streets mode adapts automatically to the application's global theme (Light / Dark)
    return theme === 'dark' ? darkTileUrl : lightTileUrl
  }

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const initialCenter: L.LatLngExpression = [-8.1116, -79.0287] // Trujillo Centro
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 14,
      zoomControl: false,
    })
    mapRef.current = map

    // Zoom control on top-right
    L.control.zoom({ position: 'topright' }).addTo(map)

    // Base Tile Layer
    const tileLayer = L.tileLayer(getActiveTileUrl(), {
      attribution: '&copy; CartoDB &copy; OpenStreetMap contributors &copy; Gemelo Digital',
      maxZoom: 19,
    }).addTo(map)
    tileLayerRef.current = tileLayer

    // Add Layer Groups to Map
    greeneryGroupRef.current.addTo(map)
    heatIslandGroupRef.current.addTo(map)
    treesGroupRef.current.addTo(map)
    drainageGroupRef.current.addTo(map)

    // Mouse move tracking
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCoords({ lat: Number(e.latlng.lat.toFixed(5)), lng: Number(e.latlng.lng.toFixed(5)) })
    })

    map.on('zoomend', () => {
      setZoomLevel(map.getZoom())
    })

    // Populate Initial Spatial Layers
    buildSpatialFeatures()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // React to theme change or basemap change
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return
    const newUrl = getActiveTileUrl()
    tileLayerRef.current.setUrl(newUrl)
  }, [theme, baseMapType])

  // Build high-resolution spatial layers for Trujillo
  const buildSpatialFeatures = () => {
    greeneryGroupRef.current.clearLayers()
    heatIslandGroupRef.current.clearLayers()
    treesGroupRef.current.clearLayers()
    drainageGroupRef.current.clearLayers()

    // 1. Parques Urbanos & Cobertura Vegetal
    const plazaMayor = L.polygon(
      [
        [-8.1110, -79.0293],
        [-8.1110, -79.0280],
        [-8.1122, -79.0280],
        [-8.1122, -79.0293],
      ],
      {
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.55,
        weight: 2,
      }
    ).bindPopup(`
      <div class="p-2 space-y-1 text-slate-900 font-sans">
        <h4 class="font-bold text-xs text-emerald-700">🌳 Plaza Mayor de Trujillo</h4>
        <p class="text-[11px] text-slate-600">Superficie: 1.42 ha • Cobertura de dosel: 48%</p>
        <div class="text-[10px] bg-emerald-50 text-emerald-800 p-1.5 rounded font-mono">
          Temp. Superficial: 24.8°C (Delta -3.6°C)
        </div>
      </div>
    `)
    greeneryGroupRef.current.addLayer(plazaMayor)

    const parqueMansiche = L.polygon(
      [
        [-8.1060, -79.0340],
        [-8.1055, -79.0315],
        [-8.1075, -79.0310],
        [-8.1080, -79.0335],
      ],
      {
        color: '#059669',
        fillColor: '#059669',
        fillOpacity: 0.6,
        weight: 2,
      }
    ).bindPopup(`
      <div class="p-2 space-y-1 text-slate-900 font-sans">
        <h4 class="font-bold text-xs text-emerald-700">🌲 Alameda y Parque Mansiche</h4>
        <p class="text-[11px] text-slate-600">Superficie: 3.25 ha • Corredor Ecológico Noroeste</p>
        <div class="text-[10px] bg-emerald-50 text-emerald-800 p-1.5 rounded font-mono">
          PET Promedio: 26.2°C • LAI medio: 3.4
        </div>
      </div>
    `)
    greeneryGroupRef.current.addLayer(parqueMansiche)

    // 2. Capa Térmica de Isla de Calor Urbana (UHI)
    const hotZone1 = L.polygon(
      [
        [-8.1160, -79.0220],
        [-8.1140, -79.0190],
        [-8.1180, -79.0180],
        [-8.1195, -79.0215],
      ],
      {
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.45,
        weight: 1.5,
        dashArray: '4, 4',
      }
    ).bindPopup(`
      <div class="p-2 space-y-1 text-slate-900 font-sans">
        <h4 class="font-bold text-xs text-red-600">🔥 Zona Crítica UHI - Mercado Mayorista</h4>
        <p class="text-[11px] text-slate-600">Superficie impermeable: 92% • Alta carga radiante</p>
        <div class="text-[10px] bg-red-50 text-red-800 p-1.5 rounded font-mono">
          Temp. Superficial: 35.8°C (Sobretemperatura +5.2°C)
        </div>
      </div>
    `)
    heatIslandGroupRef.current.addLayer(hotZone1)

    const moderateZone = L.polygon(
      [
        [-8.1145, -79.0300],
        [-8.1130, -79.0240],
        [-8.1170, -79.0245],
        [-8.1180, -79.0295],
      ],
      {
        color: '#f59e0b',
        fillColor: '#f59e0b',
        fillOpacity: 0.35,
        weight: 1.5,
      }
    ).bindPopup(`
      <div class="p-2 space-y-1 text-slate-900 font-sans">
        <h4 class="font-bold text-xs text-amber-600">⚠️ Zona de Transición Térmica</h4>
        <p class="text-[11px] text-slate-600">Cañones urbanos con ventilación moderada</p>
        <div class="text-[10px] bg-amber-50 text-amber-800 p-1.5 rounded font-mono">
          Temp. Superficial: 31.4°C
        </div>
      </div>
    `)
    heatIslandGroupRef.current.addLayer(moderateZone)

    // 3. Arbolado Urbano Censado
    const treeData = [
      { lat: -8.1118, lng: -79.0289, species: 'Tipuana tipu', h: 14, lai: 3.4 },
      { lat: -8.1114, lng: -79.0285, species: 'Jacaranda mimosifolia', h: 12, lai: 3.1 },
      { lat: -8.1120, lng: -79.0282, species: 'Ficus benjamina', h: 15, lai: 3.6 },
      { lat: -8.1124, lng: -79.0286, species: 'Schinus molle', h: 11, lai: 2.9 },
      { lat: -8.1105, lng: -79.0298, species: 'Tipuana tipu', h: 14, lai: 3.3 },
      { lat: -8.1095, lng: -79.0310, species: 'Jacaranda mimosifolia', h: 13, lai: 3.2 },
      { lat: -8.1070, lng: -79.0325, species: 'Tipuana tipu', h: 16, lai: 3.5 },
      { lat: -8.1065, lng: -79.0330, species: 'Salix humboldtiana', h: 14, lai: 3.0 },
    ]

    treeData.forEach((t) => {
      const circle = L.circleMarker([t.lat, t.lng], {
        radius: 6,
        fillColor: '#10b981',
        color: '#064e3b',
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.85,
      }).bindPopup(`
        <div class="p-2 space-y-1 text-slate-900 font-sans">
          <h4 class="font-bold text-xs text-emerald-800">🌳 ${t.species}</h4>
          <p class="text-[10px] text-slate-600">Altura: ${t.h}m • Índice Foliar (LAI): ${t.lai}</p>
          <div class="text-[10px] bg-emerald-50 text-emerald-700 p-1 rounded font-mono">
            Sombra proyectada: 68 m²
          </div>
        </div>
      `)
      treesGroupRef.current.addLayer(circle)
    })

    // 4. Corredor de Drenaje Sostenible (SUDs)
    const drainageLine = L.polyline(
      [
        [-8.1050, -79.0360],
        [-8.1080, -79.0320],
        [-8.1140, -79.0290],
        [-8.1200, -79.0270],
      ],
      {
        color: '#06b6d4',
        weight: 4,
        opacity: 0.8,
        dashArray: '6, 6',
      }
    ).bindPopup(`
      <div class="p-2 space-y-1 text-slate-900 font-sans">
        <h4 class="font-bold text-xs text-cyan-700">💧 Corredor Hídrico y Drenaje Sostenible</h4>
        <p class="text-[11px] text-slate-600">Eje de amortiguación pluvial con cunetas verdes</p>
        <div class="text-[10px] bg-cyan-50 text-cyan-800 p-1 rounded font-mono">
          Capacidad de retención: 18,200 m³/evento
        </div>
      </div>
    `)
    drainageGroupRef.current.addLayer(drainageLine)
  }

  // Handle layer toggles
  useEffect(() => {
    if (!mapRef.current) return
    if (showGreenery) greeneryGroupRef.current.addTo(mapRef.current)
    else greeneryGroupRef.current.remove()
  }, [showGreenery])

  useEffect(() => {
    if (!mapRef.current) return
    if (showHeatIsland) heatIslandGroupRef.current.addTo(mapRef.current)
    else heatIslandGroupRef.current.remove()
  }, [showHeatIsland])

  useEffect(() => {
    if (!mapRef.current) return
    if (showTrees) treesGroupRef.current.addTo(mapRef.current)
    else treesGroupRef.current.remove()
  }, [showTrees])

  useEffect(() => {
    if (!mapRef.current) return
    if (showDrainage) drainageGroupRef.current.addTo(mapRef.current)
    else drainageGroupRef.current.remove()
  }, [showDrainage])

  return (
    <div
      className={`relative w-full overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[680px]'
      }`}
    >
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating HUD Top-Left: Territorial Title Badge */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <div className="px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center gap-2.5 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-800 dark:text-slate-200">Trujillo Centro</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
            Mosaicos Libres
          </span>
        </div>

        {/* Spatial Coordinates & Telemetry (Safely placed below title to avoid any overlap) */}
        <div className="px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-lg text-[11px] font-mono text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-teal-500" />
          <span>
            {coords.lat.toFixed(4)}°, {coords.lng.toFixed(4)}° • Zoom {zoomLevel}x
          </span>
        </div>
      </div>

      {/* Floating HUD Top-Right: Fullscreen & Basemap Switcher (Callejero vs Satélite) */}
      <div className="absolute top-4 right-14 z-[1000] flex items-center gap-2">
        {/* Basemap Switcher: Only Callejero and Satélite (Dark/Light mode is handled globally by Navbar) */}
        <div className="p-1 rounded-2xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center gap-1 text-[11px] font-semibold">
          <button
            onClick={() => setBaseMapType('streets')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              baseMapType === 'streets'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Mapa Callejero Vectorial (se adapta automáticamente al tema Claro / Oscuro del sistema)"
          >
            Callejero
          </button>
          <button
            onClick={() => setBaseMapType('satellite')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              baseMapType === 'satellite'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Vista Satelital de Alta Resolución (Esri World Imagery)"
          >
            Satélite
          </button>
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Floating HUD Bottom-Left: Layer Controls */}
      <div className="absolute bottom-4 left-4 z-[1000] p-3 rounded-2xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-2 max-w-xs">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-1.5">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-500" /> Capas Espaciales GIS
          </span>
          <span className="text-[10px] text-slate-400 font-mono">4 Capas</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[11px] font-medium">
          <button
            onClick={() => setShowGreenery(!showGreenery)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all ${
              showGreenery
                ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
                : 'bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${showGreenery ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            <span>Parques (ha)</span>
          </button>

          <button
            onClick={() => setShowHeatIsland(!showHeatIsland)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all ${
              showHeatIsland
                ? 'bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border-red-300 dark:border-red-500/40'
                : 'bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${showHeatIsland ? 'bg-red-500' : 'bg-slate-400'}`} />
            <span>Malla UHI (°C)</span>
          </button>

          <button
            onClick={() => setShowTrees(!showTrees)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all ${
              showTrees
                ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-500/40'
                : 'bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${showTrees ? 'bg-teal-500' : 'bg-slate-400'}`} />
            <span>Arbolado Censo</span>
          </button>

          <button
            onClick={() => setShowDrainage(!showDrainage)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all ${
              showDrainage
                ? 'bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/40'
                : 'bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${showDrainage ? 'bg-cyan-500' : 'bg-slate-400'}`} />
            <span>Drenaje SUDs</span>
          </button>
        </div>
      </div>

      {/* Floating HUD Bottom-Right: Map Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] p-3 rounded-2xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-2 text-[11px] max-w-xs">
        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-1">
          <Thermometer className="w-3.5 h-3.5 text-amber-500" />
          <span>Gradiente Térmico Superficial</span>
        </div>

        {/* Gradient Bar */}
        <div className="space-y-1">
          <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500" />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>24°C (Oasis)</span>
            <span>30°C</span>
            <span>36°C (Crítico)</span>
          </div>
        </div>

        {/* Spatial Stats Summary */}
        <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-1.5 text-[10px] text-slate-600 dark:text-slate-400">
          <div>Área: <span className="font-bold text-slate-900 dark:text-white">142.5 ha</span></div>
          <div>Dosel: <span className="font-bold text-emerald-600 dark:text-emerald-400">24.6%</span></div>
        </div>
      </div>
    </div>
  )
}
