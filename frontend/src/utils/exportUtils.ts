/**
 * Utilitarios de exportación de alta calidad (300 DPI / 4K) y manejo de datos tabulares
 * para el Gemelo Digital de Infraestructura Verde Urbana.
 */

export interface ExportChartOptions {
  title: string
  subtitle?: string
  scenarioName?: string
  theme?: 'dark' | 'light'
  scale?: number // Default: 3 (equivalente a ~300 DPI para publicación)
  includeWatermark?: boolean
}

/**
 * Exporta un canvas de Chart.js a una imagen PNG de máxima resolución (300 DPI / 4K)
 * con encabezados institucionales, fondo consistente y telemetría científica.
 */
export async function exportCanvasToHighResPNG(
  canvas: HTMLCanvasElement,
  filename: string,
  options: ExportChartOptions
): Promise<void> {
  const scale = options.scale || 3
  const isDark = options.theme !== 'light'

  // Dimensiones escaladas para ultra alta definición
  const headerHeight = 120 * (scale / 2)
  const footerHeight = 60 * (scale / 2)
  const padding = 40 * (scale / 2)

  const targetWidth = Math.max(canvas.width * scale, 2400)
  const chartHeight = (canvas.height / canvas.width) * (targetWidth - padding * 2)
  const targetHeight = chartHeight + headerHeight + footerHeight + padding

  // Canvas virtual offscreen de ultra alta densidad de píxeles
  const offscreen = document.createElement('canvas')
  offscreen.width = targetWidth
  offscreen.height = targetHeight
  const ctx = offscreen.getContext('2d', { alpha: false })
  if (!ctx) return

  // Habilitar máxima calidad de suavizado y renderizado
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // Fondo institucional (Oscuro slate profundo o Blanco publicación científica)
  const bgColor = isDark ? '#090d16' : '#ffffff'
  const textColor = isDark ? '#f8fafc' : '#0f172a'
  const subtextColor = isDark ? '#94a3b8' : '#475569'
  const accentColor = '#10b981' // Esmeralda institucional
  const borderColor = isDark ? '#1e293b' : '#e2e8f0'

  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, targetWidth, targetHeight)

  // Borde exterior decorativo elegante
  ctx.strokeStyle = borderColor
  ctx.lineWidth = 2 * (scale / 2)
  ctx.strokeRect(
    padding / 2,
    padding / 2,
    targetWidth - padding,
    targetHeight - padding
  )

  // 1. Encabezado institucional
  ctx.fillStyle = textColor
  ctx.font = `bold ${24 * (scale / 2)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  ctx.fillText(options.title, padding, padding + 35 * (scale / 2))

  if (options.subtitle) {
    ctx.fillStyle = subtextColor
    ctx.font = `${14 * (scale / 2)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
    ctx.fillText(options.subtitle, padding, padding + 65 * (scale / 2))
  }

  // Insignia de Escenario y Calidad
  const badgeText = `${options.scenarioName || 'Simulación Activa'} • 300 DPI Ultra HD`
  ctx.font = `bold ${12 * (scale / 2)}px monospace`
  const badgeWidth = ctx.measureText(badgeText).width + 30 * (scale / 2)
  const badgeX = targetWidth - padding - badgeWidth
  const badgeY = padding + 15 * (scale / 2)

  ctx.fillStyle = isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)'
  ctx.strokeStyle = accentColor
  ctx.lineWidth = 1.5 * (scale / 2)
  ctx.beginPath()
  ctx.roundRect(badgeX, badgeY, badgeWidth, 34 * (scale / 2), 8 * (scale / 2))
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = accentColor
  ctx.fillText(badgeText, badgeX + 15 * (scale / 2), badgeY + 22 * (scale / 2))

  // Línea divisoria superior
  ctx.strokeStyle = borderColor
  ctx.lineWidth = 1.5 * (scale / 2)
  ctx.beginPath()
  ctx.moveTo(padding, headerHeight)
  ctx.lineTo(targetWidth - padding, headerHeight)
  ctx.stroke()

  // 2. Renderizado del Gráfico en Alta Definición
  ctx.drawImage(
    canvas,
    padding,
    headerHeight + 20 * (scale / 2),
    targetWidth - padding * 2,
    chartHeight
  )

  // 3. Pie de página con telemetría de metadatos
  const footerY = targetHeight - footerHeight / 2
  ctx.strokeStyle = borderColor
  ctx.lineWidth = 1.5 * (scale / 2)
  ctx.beginPath()
  ctx.moveTo(padding, targetHeight - footerHeight)
  ctx.lineTo(targetWidth - padding, targetHeight - footerHeight)
  ctx.stroke()

  ctx.fillStyle = subtextColor
  ctx.font = `${11 * (scale / 2)}px monospace`
  const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
  ctx.fillText(
    `GEMELO DIGITAL URBANO • ENVI-MET 3D SOLVER • EPSG:4326 (TRUJILLO, PERÚ) • GENERADO: ${dateStr}`,
    padding,
    footerY + 5 * (scale / 2)
  )

  // 4. Descargar archivo
  const dataUrl = offscreen.toDataURL('image/png', 1.0)
  const link = document.createElement('a')
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Exporta datos tabulares estructurados directamente a un archivo CSV con UTF-8 BOM
 * (Compatible nativamente con Microsoft Excel, Google Sheets y LibreOffice sin errores de tildes o caracteres especiales).
 */
export function exportTableToCSV(
  headers: string[],
  rows: (string | number)[][],
  filename: string
): void {
  const sanitize = (val: string | number) => {
    if (val === null || val === undefined) return '""'
    const str = String(val).replace(/"/g, '""')
    return `"${str}"`
  }

  const csvContent =
    '\uFEFF' + // UTF-8 Byte Order Mark
    [
      headers.map(sanitize).join(','),
      ...rows.map(row => row.map(sanitize).join(','))
    ].join('\r\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute(
    'download',
    filename.endsWith('.csv') ? filename : `${filename}.csv`
  )
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Copia datos tabulares al portapapeles en formato TSV (Tab-Separated Values),
 * listo para pegar directamente en Excel (Ctrl+V) con formato de celdas automático.
 */
export async function copyTableToClipboard(
  headers: string[],
  rows: (string | number)[][]
): Promise<boolean> {
  try {
    const tsvContent = [
      headers.join('\t'),
      ...rows.map(row => row.map(cell => String(cell ?? '')).join('\t'))
    ].join('\n')

    await navigator.clipboard.writeText(tsvContent)
    return true
  } catch (err) {
    console.error('Error al copiar al portapapeles:', err)
    return false
  }
}

