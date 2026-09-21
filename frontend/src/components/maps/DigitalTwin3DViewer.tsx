'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useTheme } from '@/components/ThemeProvider'
import {
  Layers,
  Sun,
  Camera,
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  Compass,
  Wind,
  Activity,
  Building2,
  TreeDeciduous,
  ShieldAlert,
  Droplets,
  Flame,
  Zap,
  HelpCircle,
} from 'lucide-react'

export interface SelectedElementData {
  name: string
  type: 'building' | 'tree' | 'green_roof' | 'sensor' | 'suds' | 'pergola' | 'water' | 'hotspot' | 'solar_light'
  height?: number
  surfaceTemp: string
  coolingImpact: string
  runoffReduction?: string
  carbonAbsorbed?: string
  lai?: number
  thermalConductivity?: string
  airQuality?: string
  humidity?: string
  svf?: string
  energyGen?: string
  details: string
}

export default function DigitalTwin3DViewer({ scenarioId }: { scenarioId?: string | null }) {
  const { theme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null)
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null)
  const groundRef = useRef<THREE.Mesh | null>(null)
  const gridHelperRef = useRef<THREE.GridHelper | null>(null)

  // Layer toggles
  const [showBuildings, setShowBuildings] = useState(true)
  const [showTrees, setShowTrees] = useState(true)
  const [showGreenRoofs, setShowGreenRoofs] = useState(true)
  const [showHeatMap, setShowHeatMap] = useState(true)
  const [showWindVectors, setShowWindVectors] = useState(true)
  const [isAutoRotating, setIsAutoRotating] = useState(false)
  const [solarHour, setSolarHour] = useState(13) // 13:00h
  const [selectedElement, setSelectedElement] = useState<SelectedElementData | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // References to toggled object groups
  const buildingsGroupRef = useRef<THREE.Group>(new THREE.Group())
  const treesGroupRef = useRef<THREE.Group>(new THREE.Group())
  const greenRoofsGroupRef = useRef<THREE.Group>(new THREE.Group())
  const heatMapGroupRef = useRef<THREE.Group>(new THREE.Group())
  const windVectorsGroupRef = useRef<THREE.Group>(new THREE.Group())
  const interactiveObjectsRef = useRef<THREE.Object3D[]>([])
  const buildingMeshesRef = useRef<THREE.Mesh[]>([])

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    const isDark = theme === 'dark'

    // Scene
    const scene = new THREE.Scene()
    const bgColor = isDark ? 0x0a0f1d : 0xf1f5f9
    scene.background = new THREE.Color(bgColor)
    scene.fog = new THREE.FogExp2(bgColor, isDark ? 0.0035 : 0.002)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000)
    camera.position.set(130, 110, 140)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxPolarAngle = Math.PI / 2 - 0.05
    controls.minDistance = 25
    controls.maxDistance = 400
    controls.target.set(0, 8, 0)
    controlsRef.current = controls

    // Lighting
    const ambientLight = new THREE.AmbientLight(isDark ? 0xddeeff : 0xffffff, isDark ? 0.55 : 0.85)
    scene.add(ambientLight)
    ambientLightRef.current = ambientLight

    const sunLight = new THREE.DirectionalLight(0xfff7e6, isDark ? 1.4 : 1.6)
    sunLight.position.set(90, 150, 60)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 2048
    sunLight.shadow.mapSize.height = 2048
    sunLight.shadow.camera.near = 10
    sunLight.shadow.camera.far = 350
    sunLight.shadow.camera.left = -130
    sunLight.shadow.camera.right = 130
    sunLight.shadow.camera.top = 130
    sunLight.shadow.camera.bottom = -130
    sunLight.shadow.bias = -0.0005
    scene.add(sunLight)
    sunLightRef.current = sunLight

    // Ground Plane & Grid
    const groundGeo = new THREE.PlaneGeometry(320, 320)
    const groundMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x111827 : 0xcbd5e1,
      roughness: 0.85,
      metalness: 0.1,
    })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)
    groundRef.current = ground

    const gridHelper = new THREE.GridHelper(
      320,
      64,
      isDark ? 0x10b981 : 0x059669,
      isDark ? 0x1f2937 : 0x94a3b8
    )
    gridHelper.position.y = 0.05
    scene.add(gridHelper)
    gridHelperRef.current = gridHelper

    // Water Canal / Corredor Hídrico
    const canalGeo = new THREE.PlaneGeometry(28, 300)
    const canalMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85,
    })
    const canal = new THREE.Mesh(canalGeo, canalMat)
    canal.rotation.x = -Math.PI / 2
    canal.position.set(-65, 0.1, 0)
    canal.receiveShadow = true
    scene.add(canal)

    // Groups
    const buildingsGroup = new THREE.Group()
    const treesGroup = new THREE.Group()
    const greenRoofsGroup = new THREE.Group()
    const heatMapGroup = new THREE.Group()
    const windVectorsGroup = new THREE.Group()

    buildingsGroupRef.current = buildingsGroup
    treesGroupRef.current = treesGroup
    greenRoofsGroupRef.current = greenRoofsGroup
    heatMapGroupRef.current = heatMapGroup
    windVectorsGroupRef.current = windVectorsGroup

    scene.add(buildingsGroup)
    scene.add(treesGroup)
    scene.add(greenRoofsGroup)
    scene.add(heatMapGroup)
    scene.add(windVectorsGroup)

    const interactiveObjs: THREE.Object3D[] = []
    const buildingMeshes: THREE.Mesh[] = []

    // 1. Generate 3D Procedural Buildings
    const darkBuildingMats = [
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.2 }),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.3 }),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6, metalness: 0.1 }),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.4 }),
    ]
    const lightBuildingMats = [
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.1 }),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4, metalness: 0.2 }),
      new THREE.MeshStandardMaterial({ color: 0xdbeafe, roughness: 0.5, metalness: 0.15 }),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3, metalness: 0.25 }),
    ]

    const activeBuildingMats = isDark ? darkBuildingMats : lightBuildingMats

    const buildingLayouts = [
      { x: -20, z: -45, w: 20, d: 20, h: 36, name: 'Complejo Residencial Pizarro A1', hasGreenRoof: true, floors: 10 },
      { x: 18, z: -45, w: 24, d: 18, h: 54, name: 'Torre Empresarial Trujillo', hasGreenRoof: true, floors: 16 },
      { x: 55, z: -40, w: 18, d: 22, h: 28, name: 'Centro Cultural de La Libertad', hasGreenRoof: false, floors: 7 },
      { x: -22, z: 5, w: 18, d: 26, h: 44, name: 'Sede Administrativa Regional', hasGreenRoof: true, floors: 12 },
      { x: 22, z: 12, w: 26, d: 22, h: 62, name: 'Torre Financiera Mansiche', hasGreenRoof: false, floors: 18 },
      { x: 60, z: 16, w: 20, d: 20, h: 24, name: 'Complejo Cívico Bicentenario', hasGreenRoof: true, floors: 6 },
      { x: -22, z: 55, w: 22, d: 20, h: 32, name: 'Edificio Multifamiliar Los Sauces', hasGreenRoof: true, floors: 9 },
      { x: 18, z: 60, w: 18, d: 24, h: 40, name: 'Hub Tecnológico & Biblioteca', hasGreenRoof: true, floors: 11 },
      { x: 56, z: 58, w: 22, d: 18, h: 48, name: 'Campus Universitario Central', hasGreenRoof: false, floors: 14 },
    ]

    buildingLayouts.forEach((b, i) => {
      const bGeo = new THREE.BoxGeometry(b.w, b.h, b.d)
      const bMat = activeBuildingMats[i % activeBuildingMats.length]
      const mesh = new THREE.Mesh(bGeo, bMat)
      mesh.position.set(b.x, b.h / 2, b.z)
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.userData = {
        name: b.name,
        type: 'building',
        height: b.h,
        surfaceTemp: b.hasGreenRoof ? '28.9 °C' : '37.4 °C',
        coolingImpact: b.hasGreenRoof ? '-3.4 °C' : '+1.8 °C (UHI)',
        thermalConductivity: b.hasGreenRoof ? '0.28 W/m·K (Aislado)' : '1.15 W/m·K (Concreto)',
        details: b.hasGreenRoof
          ? `Edificación de ${b.floors} niveles con cubierta vegetal extensiva. Amortigua la radiación solar y ahorra un 22% en climatización.`
          : `Edificación de ${b.floors} niveles con alta inercia térmica en cubierta de losa plana. Candidato óptimo para techo verde.`,
      }
      buildingsGroup.add(mesh)
      interactiveObjs.push(mesh)
      buildingMeshes.push(mesh)

      // Green Roof on Top
      if (b.hasGreenRoof) {
        const grGeo = new THREE.BoxGeometry(b.w - 1.2, 0.9, b.d - 1.2)
        const grMat = new THREE.MeshStandardMaterial({
          color: 0x10b981,
          roughness: 0.8,
          metalness: 0.05,
        })
        const grMesh = new THREE.Mesh(grGeo, grMat)
        grMesh.position.set(b.x, b.h + 0.45, b.z)
        grMesh.castShadow = true
        grMesh.receiveShadow = true
        grMesh.userData = {
          name: `Techo Verde en ${b.name}`,
          type: 'green_roof',
          height: b.h,
          surfaceTemp: '26.4 °C',
          coolingImpact: '-4.6 °C superficial',
          runoffReduction: '76% retenido en sustrato',
          details: 'Cubierta extensiva con sedum y gramíneas nativas. Retiene hasta 38 L/m² de agua de lluvia.',
        }
        greenRoofsGroup.add(grMesh)
        interactiveObjs.push(grMesh)
      }
    })

    buildingMeshesRef.current = buildingMeshes

    // 2. Generate 3D Trees with High-Density Foliage
    const treePositions = [
      { x: -44, z: -60, h: 15, r: 5.2, species: 'Tipuana tipu' },
      { x: -44, z: -35, h: 13, r: 4.6, species: 'Jacaranda mimosifolia' },
      { x: -44, z: -10, h: 16, r: 5.5, species: 'Tipuana tipu' },
      { x: -44, z: 15, h: 14, r: 4.8, species: 'Schinus molle' },
      { x: -44, z: 40, h: 15, r: 5.2, species: 'Tipuana tipu' },
      { x: -44, z: 65, h: 13, r: 4.4, species: 'Jacaranda mimosifolia' },
      // Canal Park
      { x: -80, z: -45, h: 17, r: 5.8, species: 'Salix humboldtiana' },
      { x: -80, z: -15, h: 15, r: 5.0, species: 'Tipuana tipu' },
      { x: -80, z: 20, h: 16, r: 5.4, species: 'Salix humboldtiana' },
      { x: -80, z: 50, h: 14, r: 4.7, species: 'Schinus molle' },
      // Plaza Mayor central oases
      { x: 38, z: -12, h: 17, r: 6.0, species: 'Ficus benjamina' },
      { x: 46, z: -10, h: 15, r: 5.0, species: 'Tipuana tipu' },
      { x: 42, z: 5, h: 14, r: 4.6, species: 'Jacaranda mimosifolia' },
    ]

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x543d2b, roughness: 0.9 })
    const foliageMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      roughness: 0.65,
      metalness: 0.05,
      flatShading: true,
    })

    treePositions.forEach((tp) => {
      const trunkGeo = new THREE.CylinderGeometry(0.55, 0.75, tp.h * 0.45, 8)
      const trunk = new THREE.Mesh(trunkGeo, trunkMat)
      trunk.position.set(tp.x, (tp.h * 0.45) / 2, tp.z)
      trunk.castShadow = true

      const foliageGeo = new THREE.DodecahedronGeometry(tp.r, 1)
      const foliage = new THREE.Mesh(foliageGeo, foliageMat)
      foliage.position.set(tp.x, tp.h * 0.75, tp.z)
      foliage.castShadow = true
      foliage.receiveShadow = true

      foliage.userData = {
        name: `Árbol Urbano (${tp.species})`,
        type: 'tree',
        height: tp.h,
        surfaceTemp: '24.2 °C',
        coolingImpact: '-4.1 °C (radio de 22m)',
        carbonAbsorbed: '48.5 kg CO₂/año',
        lai: 3.4,
        details: `Dosel denso maduro con índice foliar LAI 3.4. Bloquea hasta el 88% de la radiación solar directa.`,
      }

      treesGroup.add(trunk)
      treesGroup.add(foliage)
      interactiveObjs.push(foliage)
    })

    // 3. Estaciones Meteorológicas IoT (Sensor Nodes)
    const sensorMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
    })
    const sensorPoleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 })

    const sensorPositions = [
      {
        x: 35,
        z: -25,
        name: 'Estación Meteorológica IoT #TRU-01 (Plaza Mayor)',
        temp: '25.4 °C',
        cooling: 'Microclima Amortiguado (-3.1 °C)',
        humidity: '66% RH',
        airQuality: 'AQI 28 (Excelente) • PM2.5: 7.4 µg/m³',
        details: 'Estación de grado micrometeorológico conectada al gemelo digital. Registra radiación global de 680 W/m² y viento a 2.1 m/s.',
      },
      {
        x: -65,
        z: 15,
        name: 'Sensor Microclimático IoT #TRU-02 (Corredor Canal)',
        temp: '23.8 °C',
        cooling: '-3.8 °C por enfriamiento evaporativo',
        humidity: '74% RH',
        airQuality: 'AQI 22 (Puro) • PM2.5: 5.1 µg/m³',
        details: 'Nodo hidrometeorológico continuo. Registra elevado calor latente por la cercanía a la lámina de agua y vegetación riparia.',
      },
      {
        x: 35,
        z: 45,
        name: 'Sensor Térmico & Tráfico IoT #TRU-03 (Av. España)',
        temp: '33.2 °C',
        cooling: 'Estrés Térmico Moderado (+2.2 °C)',
        humidity: '52% RH',
        airQuality: 'AQI 68 (Aceptable) • PM2.5: 22.1 µg/m³',
        details: 'Sensor en cañón vial con alta carga antropogénica. Monitorea dispersión de partículas y temperatura de asfalto circundante.',
      },
    ]

    sensorPositions.forEach((sp) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 8, 8), sensorPoleMat)
      pole.position.set(sp.x, 4, sp.z)
      pole.castShadow = true

      const head = new THREE.Mesh(new THREE.SphereGeometry(1.1, 16, 16), sensorMat)
      head.position.set(sp.x, 8.4, sp.z)
      head.castShadow = true

      head.userData = {
        name: sp.name,
        type: 'sensor',
        surfaceTemp: sp.temp,
        coolingImpact: sp.cooling,
        humidity: sp.humidity,
        airQuality: sp.airQuality,
        details: sp.details,
      }

      buildingsGroup.add(pole)
      buildingsGroup.add(head)
      interactiveObjs.push(head)
    })

    // 4. Celdas SUDs / Jardines de Lluvia y Biorretención
    const sudsPositions = [
      {
        x: -42,
        z: -15,
        name: 'Jardín de Lluvia SUDs #01 (Mansiche)',
        temp: '23.9 °C',
        cooling: '-3.5 °C en radio de 15m',
        runoff: '88% de agua pluvial retenida',
        details: 'Superficie drenante con suelo filtrante estratificado (arena, compost y grava volcánica). Capacidad de retención: 75 m³.',
      },
      {
        x: -42,
        z: 30,
        name: 'Cuneta Verde de Infiltración SUDs #02',
        temp: '24.5 °C',
        cooling: '-2.9 °C superficial',
        runoff: '82% retención en tormenta',
        details: 'Zanja biológica con especies vegetales depuradoras de escorrentía vial. Evita el arrastre de metales pesados al colector.',
      },
    ]

    const sudsBedMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.9 })
    const sudsPlantMat = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.6 })

    sudsPositions.forEach((s) => {
      const bed = new THREE.Mesh(new THREE.BoxGeometry(14, 0.35, 9), sudsBedMat)
      bed.position.set(s.x, 0.18, s.z)
      bed.receiveShadow = true

      const plant = new THREE.Mesh(new THREE.ConeGeometry(1.8, 2.2, 6), sudsPlantMat)
      plant.position.set(s.x, 1.2, s.z)
      plant.castShadow = true

      bed.userData = {
        name: s.name,
        type: 'suds',
        surfaceTemp: s.temp,
        coolingImpact: s.cooling,
        runoffReduction: s.runoff,
        details: s.details,
      }
      plant.userData = bed.userData

      buildingsGroup.add(bed)
      buildingsGroup.add(plant)
      interactiveObjs.push(bed)
      interactiveObjs.push(plant)
    })

    // 5. Pérgolas Bioclimáticas con Enredaderas Sombreadas
    const pergolaPositions = [
      {
        x: -2,
        z: -12,
        name: 'Pérgola Bioclimática con Bougainvillea #A',
        temp: '25.2 °C bajo sombra',
        cooling: '-5.8 °C en PET peatonal',
        svf: '0.24 (Excelente apantallamiento)',
        details: 'Estructura de madera tecnológica con enredadera caducifolia. Proporciona 96 m² de sombra continua protegiendo a los peatones.',
      },
      {
        x: -2,
        z: 32,
        name: 'Pérgola de Descanso Bioclimática #B',
        temp: '25.8 °C',
        cooling: '-5.1 °C en PET peatonal',
        svf: '0.28',
        details: 'Módulo de estancia con bancos urbanos de madera reciclada. Reduce el estrés térmico en las horas de radiación más intensa (11:00h - 15:00h).',
      },
    ]

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 })
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 })

    pergolaPositions.forEach((p) => {
      // 4 thin posts
      ;[[-5, -3], [-5, 3], [5, -3], [5, 3]].forEach(([dx, dz]) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 6, 6), woodMat)
        post.position.set(p.x + dx, 3, p.z + dz)
        post.castShadow = true
        buildingsGroup.add(post)
      })

      // Vegetated shade roof
      const roof = new THREE.Mesh(new THREE.BoxGeometry(13, 0.45, 8.5), canopyMat)
      roof.position.set(p.x, 6.2, p.z)
      roof.castShadow = true
      roof.receiveShadow = true

      roof.userData = {
        name: p.name,
        type: 'pergola',
        surfaceTemp: p.temp,
        coolingImpact: p.cooling,
        svf: p.svf,
        details: p.details,
      }

      buildingsGroup.add(roof)
      interactiveObjs.push(roof)
    })

    // 6. Fuente & Espejo de Agua Bioclimático Central
    const fountainBasin = new THREE.Mesh(
      new THREE.CylinderGeometry(10, 11, 1.2, 24),
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.6 })
    )
    fountainBasin.position.set(42, 0.6, -2)
    fountainBasin.castShadow = true
    fountainBasin.receiveShadow = true

    const fountainWater = new THREE.Mesh(
      new THREE.CylinderGeometry(9.6, 9.6, 0.2, 24),
      new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        roughness: 0.05,
        metalness: 0.8,
        transparent: true,
        opacity: 0.85,
      })
    )
    fountainWater.position.set(42, 1.1, -2)

    const fountainSpout = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 1.2, 3.2, 12),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8,
      })
    )
    fountainSpout.position.set(42, 2.7, -2)

    fountainWater.userData = {
      name: 'Fuente & Espejo de Agua Bioclimático Central',
      type: 'water',
      surfaceTemp: '21.4 °C (Agua superficial)',
      coolingImpact: '-3.9 °C en microclima circundante',
      humidity: '+18% amortiguación en radio 25m',
      details: 'Cuerpo de agua con recirculación solar continua. Facilita el enfriamiento por evaporación directa y reduce la temperatura del aire ambiente.',
    }
    fountainBasin.userData = fountainWater.userData

    buildingsGroup.add(fountainBasin)
    buildingsGroup.add(fountainWater)
    buildingsGroup.add(fountainSpout)
    interactiveObjs.push(fountainWater)
    interactiveObjs.push(fountainBasin)

    // 7. Puntos Críticos de Calor Vial (Hotspots Asfálticos)
    const hotspotPositions = [
      {
        x: -2,
        z: -70,
        name: 'Isla de Calor Vial #01 (Cruce Norte)',
        temp: '46.2 °C (Crítica)',
        impact: '+4.8 °C emisión a fachada',
        cond: '2.10 W/m·K (Asfalto negro denso)',
        details: 'Intersección vial con albedo extremadamente bajo (0.08). Emite hasta 98 W/m² de radiación de onda larga. Recomendación IA: cool-pavement reflectante.',
      },
      {
        x: 75,
        z: 2,
        name: 'Isla de Calor Vial #02 (Estacionamiento Superficial)',
        temp: '44.5 °C',
        impact: '+3.9 °C sobrecalentamiento',
        cond: '1.95 W/m·K',
        details: 'Área impermeable descubierta. Acumula calor diurno y lo libera lentamente por la noche, prolongando la isla de calor urbana nocturna.',
      },
    ]

    const hotspotMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.45,
      roughness: 0.9,
    })

    hotspotPositions.forEach((h) => {
      const hsMesh = new THREE.Mesh(new THREE.BoxGeometry(18, 0.15, 18), hotspotMat)
      hsMesh.position.set(h.x, 0.1, h.z)
      hsMesh.userData = {
        name: h.name,
        type: 'hotspot',
        surfaceTemp: h.temp,
        coolingImpact: h.impact,
        thermalConductivity: h.cond,
        details: h.details,
      }
      buildingsGroup.add(hsMesh)
      interactiveObjs.push(hsMesh)
    })

    // 8. Farolas Solares Fotovoltaicas Inteligentes
    const solarPositions = [
      { x: -36, z: -35, name: 'Farola Solar Fotovoltaica LED #01' },
      { x: -36, z: 0, name: 'Farola Solar Fotovoltaica LED #02' },
      { x: -36, z: 35, name: 'Farola Solar Fotovoltaica LED #03' },
      { x: 0, z: -40, name: 'Farola Solar Fotovoltaica LED #04' },
    ]

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 })
    const pvMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.2, metalness: 0.6 })
    const ledMat = new THREE.MeshStandardMaterial({
      color: 0xffedd5,
      emissive: 0xfef08a,
      emissiveIntensity: 0.8,
    })

    solarPositions.forEach((sl) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 7.5, 8), poleMat)
      pole.position.set(sl.x, 3.75, sl.z)
      pole.castShadow = true

      const pvPanel = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 1.2), pvMat)
      pvPanel.position.set(sl.x, 7.7, sl.z)
      pvPanel.rotation.x = 0.25

      const led = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.15, 0.6), ledMat)
      led.position.set(sl.x, 7.3, sl.z)

      pvPanel.userData = {
        name: sl.name,
        type: 'solar_light',
        surfaceTemp: '30.2 °C',
        coolingImpact: '0.0 °C (Cero calor residual)',
        energyGen: '2.2 kWh/día limpia',
        details: 'Luminaria solar autónoma con sensor crepuscular y microestación ambiental. Alimenta la red mesh del Gemelo Digital.',
      }

      buildingsGroup.add(pole)
      buildingsGroup.add(pvPanel)
      buildingsGroup.add(led)
      interactiveObjs.push(pvPanel)
    })

    // 9. UHI Thermal Heatmap Mesh
    const hmCanvas = document.createElement('canvas')
    hmCanvas.width = 512
    hmCanvas.height = 512
    const ctx = hmCanvas.getContext('2d')
    if (ctx) {
      const grad = ctx.createRadialGradient(256, 256, 40, 256, 256, 250)
      grad.addColorStop(0, 'rgba(239, 68, 68, 0.50)') // Hot Red
      grad.addColorStop(0.35, 'rgba(245, 158, 11, 0.40)') // Amber
      grad.addColorStop(0.7, 'rgba(16, 185, 129, 0.45)') // Oasis Green
      grad.addColorStop(1, 'rgba(6, 182, 212, 0.30)') // Cool Cyan
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 512, 512)
    }
    const hmTexture = new THREE.CanvasTexture(hmCanvas)
    const hmGeo = new THREE.PlaneGeometry(300, 300)
    const hmMat = new THREE.MeshBasicMaterial({
      map: hmTexture,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    })
    const heatMapMesh = new THREE.Mesh(hmGeo, hmMat)
    heatMapMesh.rotation.x = -Math.PI / 2
    heatMapMesh.position.y = 0.2
    heatMapGroup.add(heatMapMesh)

    // 4. Wind Vectors (Canalización de brisa marina)
    const arrowHelperPositions = [
      { x: -100, y: 12, z: -30, dir: new THREE.Vector3(1, 0, 0.3).normalize(), len: 16 },
      { x: -70, y: 14, z: 0, dir: new THREE.Vector3(1, 0, 0.2).normalize(), len: 18 },
      { x: -35, y: 15, z: 25, dir: new THREE.Vector3(0.8, 0, -0.2).normalize(), len: 16 },
      { x: 0, y: 16, z: -10, dir: new THREE.Vector3(1, 0, 0.1).normalize(), len: 15 },
      { x: 30, y: 14, z: 20, dir: new THREE.Vector3(0.9, 0, 0.3).normalize(), len: 17 },
    ]

    arrowHelperPositions.forEach((pos) => {
      const arrow = new THREE.ArrowHelper(
        pos.dir,
        new THREE.Vector3(pos.x, pos.y, pos.z),
        pos.len,
        0x06b6d4,
        4,
        2
      )
      windVectorsGroup.add(arrow)
    })

    interactiveObjectsRef.current = interactiveObjs

    // Raycaster
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const onPointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(interactiveObjectsRef.current)

      if (intersects.length > 0) {
        const target = intersects[0].object
        if (target.userData && target.userData.name) {
          setSelectedElement(target.userData as SelectedElementData)
        }
      }
    }

    const onPointerMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(interactiveObjectsRef.current)
      renderer.domElement.style.cursor = intersects.length > 0 ? 'pointer' : 'default'
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointermove', onPointerMove)

    // Animation Loop
    let animationFrameId: number
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      if (controlsRef.current) {
        controlsRef.current.autoRotate = isAutoRotating
        controlsRef.current.autoRotateSpeed = 1.0
        controlsRef.current.update()
      }
      renderer.render(scene, camera)
    }
    animate()

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return
      const newWidth = containerRef.current.clientWidth
      const newHeight = containerRef.current.clientHeight
      cameraRef.current.aspect = newWidth / newHeight
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(newWidth, newHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [theme]) // Re-run cleanly when theme changes!

  // Toggles
  useEffect(() => {
    buildingsGroupRef.current.visible = showBuildings
  }, [showBuildings])

  useEffect(() => {
    treesGroupRef.current.visible = showTrees
  }, [showTrees])

  useEffect(() => {
    greenRoofsGroupRef.current.visible = showGreenRoofs
  }, [showGreenRoofs])

  useEffect(() => {
    heatMapGroupRef.current.visible = showHeatMap
  }, [showHeatMap])

  useEffect(() => {
    windVectorsGroupRef.current.visible = showWindVectors
  }, [showWindVectors])

  // Solar Trajectory
  useEffect(() => {
    if (!sunLightRef.current) return
    const angle = ((solarHour - 8) / 10) * Math.PI - Math.PI / 2
    const sunX = Math.cos(angle) * 130
    const sunY = Math.sin(angle) * 140 + 25
    const sunZ = 55 * Math.sin(angle * 0.5)
    sunLightRef.current.position.set(sunX, Math.max(15, sunY), sunZ)
  }, [solarHour])

  // Camera presets
  const setCameraView = (view: 'iso' | 'top' | 'pedestrian') => {
    if (!cameraRef.current || !controlsRef.current) return
    if (view === 'iso') {
      cameraRef.current.position.set(130, 110, 140)
      controlsRef.current.target.set(0, 8, 0)
    } else if (view === 'top') {
      cameraRef.current.position.set(0, 200, 0.1)
      controlsRef.current.target.set(0, 0, 0)
    } else if (view === 'pedestrian') {
      cameraRef.current.position.set(-35, 4, -15)
      controlsRef.current.target.set(-10, 8, 10)
    }
    controlsRef.current.update()
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[720px]'
      }`}
    >
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating HUD Top-Left: Model Title & Telemetry */}
      <div className="absolute top-4 left-4 z-10 flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <div className="px-4 py-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <div>
            <div className="text-xs font-black text-slate-900 dark:text-white">
              Gemelo Digital 3D ({theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro'})
            </div>
            <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">
              ENVI-met 3D Solver • Trujillo Centro
            </div>
          </div>
        </div>

        <div className="px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl text-[11px] font-mono text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-emerald-500" />
          <span>8°06′43″S 79°01′47″W • Alt: 34m snm</span>
        </div>
      </div>

      {/* Floating HUD Top-Right: Camera Presets & Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        <div className="p-1 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center gap-1">
          <button
            onClick={() => setCameraView('iso')}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Vista 3D Isométrica"
          >
            3D ISO
          </button>
          <button
            onClick={() => setCameraView('top')}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Vista Cenital (Planta)"
          >
            Cenital
          </button>
          <button
            onClick={() => setCameraView('pedestrian')}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Nivel Peatonal"
          >
            Peatonal
          </button>
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`p-1.5 rounded-xl transition-colors ${
              isAutoRotating
                ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/40'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Auto-rotación panorámica"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating HUD Bottom-Left: Volumetric Stats & Layer Manager */}
      <div className="absolute bottom-4 left-4 z-10 p-4 rounded-3xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3 max-w-sm">
        {/* Volumetric Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-2xl bg-slate-100/90 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 font-medium block">Volumen Edificado</span>
            <span className="font-extrabold text-slate-900 dark:text-white font-mono">185,400 m³</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-100/90 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 font-medium block">Sombra Proyectada</span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">14,280 m²</span>
          </div>
        </div>

        {/* 3D Layers */}
        <div className="space-y-1.5 border-t border-slate-200 dark:border-slate-800 pt-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 pb-1">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-500" /> Capas del Modelo 3D
            </span>
            <span className="text-[10px] text-slate-400 font-mono">5 Capas</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-medium">
            <button
              onClick={() => setShowBuildings(!showBuildings)}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl border transition-all ${
                showBuildings
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showBuildings ? 'bg-indigo-500' : 'bg-slate-400'}`} />
              <span>Edificios 3D</span>
            </button>

            <button
              onClick={() => setShowTrees(!showTrees)}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl border transition-all ${
                showTrees
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showTrees ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span>Árboles (LAI)</span>
            </button>

            <button
              onClick={() => setShowGreenRoofs(!showGreenRoofs)}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl border transition-all ${
                showGreenRoofs
                  ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-500/40'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showGreenRoofs ? 'bg-teal-500' : 'bg-slate-400'}`} />
              <span>Techos Verdes</span>
            </button>

            <button
              onClick={() => setShowHeatMap(!showHeatMap)}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl border transition-all ${
                showHeatMap
                  ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/40'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showHeatMap ? 'bg-amber-500' : 'bg-slate-400'}`} />
              <span>Malla UHI</span>
            </button>

            <button
              onClick={() => setShowWindVectors(!showWindVectors)}
              className={`col-span-2 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl border transition-all ${
                showWindVectors
                  ? 'bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/40'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-800'
              }`}
            >
              <Wind className="w-3.5 h-3.5 text-cyan-500" />
              <span>Vectores de Viento Microclimático</span>
            </button>
          </div>
        </div>

        {/* Sun Slider */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-2.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-500" /> Posición Solar
            </span>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{solarHour}:00h</span>
          </div>
          <input
            type="range"
            min={8}
            max={18}
            step={1}
            value={solarHour}
            onChange={(e) => setSolarHour(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
          />
        </div>
      </div>

      {/* Floating HUD Bottom-Right: Interactive Inspector */}
      {selectedElement && (
        <div className="absolute bottom-4 right-4 z-10 p-5 rounded-3xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl border border-emerald-500/40 shadow-2xl max-w-sm animate-in slide-in-from-bottom-3 duration-200 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="mb-1">
                {selectedElement.type === 'sensor' && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 font-bold border border-sky-500/30">
                    <Activity className="w-3 h-3" /> Estación IoT Microclimática
                  </span>
                )}
                {selectedElement.type === 'suds' && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 font-bold border border-teal-500/30">
                    <Droplets className="w-3 h-3" /> Celda SUDs / Biorretención
                  </span>
                )}
                {selectedElement.type === 'pergola' && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30">
                    <Sun className="w-3 h-3" /> Pérgola Sombreada Bioclimática
                  </span>
                )}
                {selectedElement.type === 'water' && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-500/30">
                    <Droplets className="w-3 h-3" /> Fuente & Espejo de Agua
                  </span>
                )}
                {selectedElement.type === 'hotspot' && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 font-bold border border-red-500/30">
                    <Flame className="w-3 h-3" /> Isla de Calor Vial (Crítica)
                  </span>
                )}
                {selectedElement.type === 'solar_light' && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 font-bold border border-yellow-500/30">
                    <Zap className="w-3 h-3" /> Farola Solar Fotovoltaica
                  </span>
                )}
                {selectedElement.type === 'tree' && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                    <TreeDeciduous className="w-3 h-3" /> Árbol Urbano Censado
                  </span>
                )}
                {selectedElement.type === 'building' && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/30">
                    <Building2 className="w-3 h-3" /> Edificación Volumétrica 3D
                  </span>
                )}
                {selectedElement.type === 'green_roof' && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 font-bold border border-teal-500/30">
                    <Sparkles className="w-3 h-3" /> Techo Verde Activo
                  </span>
                )}
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                {selectedElement.name}
              </h4>
            </div>
            <button
              onClick={() => setSelectedElement(null)}
              className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 block">Temp. Superficial</span>
              <span className={`font-black font-mono ${selectedElement.type === 'hotspot' ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {selectedElement.surfaceTemp}
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 block">Impacto Térmico</span>
              <span className={`font-black font-mono ${selectedElement.type === 'hotspot' ? 'text-red-500' : 'text-cyan-600 dark:text-cyan-400'}`}>
                {selectedElement.coolingImpact}
              </span>
            </div>

            {selectedElement.airQuality && (
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 col-span-2">
                <span className="text-[10px] text-slate-500 block">Calidad del Aire (IoT)</span>
                <span className="font-bold text-sky-600 dark:text-sky-400 font-mono">
                  {selectedElement.airQuality}
                </span>
              </div>
            )}

            {selectedElement.humidity && (
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 block">Humedad Microclima</span>
                <span className="font-bold text-teal-600 dark:text-teal-400 font-mono">
                  {selectedElement.humidity}
                </span>
              </div>
            )}

            {selectedElement.svf && (
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 block">Sky View Factor</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                  {selectedElement.svf}
                </span>
              </div>
            )}

            {selectedElement.energyGen && (
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 block">Generación Solar</span>
                <span className="font-bold text-yellow-600 dark:text-yellow-400 font-mono">
                  {selectedElement.energyGen}
                </span>
              </div>
            )}

            {selectedElement.thermalConductivity && (
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 col-span-2">
                <span className="text-[10px] text-slate-500 block">Transmitancia Térmica</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {selectedElement.thermalConductivity}
                </span>
              </div>
            )}

            {selectedElement.runoffReduction && (
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 block">Retención Pluvial</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                  {selectedElement.runoffReduction}
                </span>
              </div>
            )}

            {selectedElement.carbonAbsorbed && (
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 block">Captura de CO₂</span>
                <span className="font-bold text-teal-600 dark:text-teal-400 font-mono">
                  {selectedElement.carbonAbsorbed}
                </span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            {selectedElement.details}
          </p>
        </div>
      )}
    </div>
  )
}
