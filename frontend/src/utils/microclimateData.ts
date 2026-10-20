/**
 * Datasets y funciones de extracción de series temporales microclimáticas
 * para los escenarios del Gemelo Digital Urbano.
 */

export const SCENARIO_NAMES: Record<string, string> = {
  '1': 'Línea Base (Sin intervención)',
  '2': 'Techos Verdes (50%)',
  '3': 'Arbolado Masivo (-2.4 °C)',
  '4': 'Corredores Ecológicos',
  '5': 'Pavimentos Fríos / Reflectivos',
  '6': 'Intervención Híbrida Integral'
}

export const TIME_LABELS = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00']

export const TEMPERATURE_CURVES: Record<string, number[]> = {
  '1': [20, 19, 18, 23, 29, 32, 29, 24],
  '2': [18, 17, 16, 20, 25, 28, 26, 22],
  '3': [17, 16, 15, 19, 23, 26, 24, 20],
  '4': [18, 17, 16, 19, 24, 27, 25, 21],
  '5': [19, 18, 17, 21, 26, 29, 27, 23],
  '6': [16, 15, 14, 18, 22, 24, 22, 19]
}

export const HUMIDITY_CURVES: Record<string, number[]> = {
  '1': [65, 70, 75, 60, 48, 42, 46, 58],
  '2': [78, 82, 88, 75, 62, 55, 60, 72],
  '3': [82, 86, 92, 80, 68, 62, 67, 78],
  '4': [79, 84, 89, 76, 64, 58, 63, 74],
  '5': [67, 72, 77, 62, 50, 44, 48, 60],
  '6': [85, 90, 95, 84, 72, 66, 71, 82]
}

export const WIND_CURVES: Record<string, number[]> = {
  '1': [1.4, 1.1, 0.9, 1.7, 3.1, 3.8, 3.2, 2.0],
  '2': [1.0, 0.8, 0.6, 1.2, 2.2, 2.8, 2.3, 1.5],
  '3': [0.8, 0.6, 0.5, 1.0, 1.8, 2.2, 1.9, 1.2],
  '4': [0.9, 0.7, 0.5, 1.1, 2.0, 2.5, 2.1, 1.4],
  '5': [1.3, 1.0, 0.8, 1.6, 3.0, 3.6, 3.0, 1.9],
  '6': [0.7, 0.5, 0.4, 0.9, 1.6, 2.0, 1.7, 1.1]
}

export const PET_CURVES: Record<string, number[]> = {
  '1': [23, 22, 21, 27, 36, 39, 34, 28],
  '2': [18, 17, 16, 21, 28, 31, 27, 22],
  '3': [16, 15, 14, 18, 24, 27, 23, 19],
  '4': [17, 16, 15, 19, 25, 28, 24, 20],
  '5': [19, 18, 17, 22, 29, 32, 28, 23],
  '6': [15, 14, 13, 17, 22, 25, 21, 17]
}

export function getTemperatureTable(scenarioId: string | null) {
  const activeId = scenarioId || '1'
  const current = TEMPERATURE_CURVES[activeId] || TEMPERATURE_CURVES['1']
  const baseline = TEMPERATURE_CURVES['1']

  const headers = ['Hora', 'Temp. Simulación (°C)', 'Línea Base Ref. (°C)', 'Delta Térmico (ΔT)', 'Condición Microclimática']
  const rows = TIME_LABELS.map((time, idx) => {
    const val = current[idx]
    const base = baseline[idx]
    const diff = Number((val - base).toFixed(1))
    const diffStr = diff > 0 ? `+${diff} °C` : diff < 0 ? `${diff} °C` : '0.0 °C'
    const status = val >= 31 ? 'Estrés Térmico Alto' : val >= 26 ? 'Moderado' : 'Confort Térmico'
    return [time, `${val} °C`, `${base} °C`, diffStr, status]
  })

  return { headers, rows }
}

export function getHumidityTable(scenarioId: string | null) {
  const activeId = scenarioId || '1'
  const current = HUMIDITY_CURVES[activeId] || HUMIDITY_CURVES['1']
  const baseline = HUMIDITY_CURVES['1']

  const headers = ['Hora', 'Humedad Relativa (%)', 'Línea Base Ref. (%)', 'Delta Humedad (ΔHR)', 'Evapotranspiración Estimada']
  const rows = TIME_LABELS.map((time, idx) => {
    const val = current[idx]
    const base = baseline[idx]
    const diff = Number((val - base).toFixed(1))
    const diffStr = diff > 0 ? `+${diff}%` : `${diff}%`
    const status = val >= 75 ? 'Alta Evapotranspiración' : val >= 55 ? 'Moderada' : 'Baja (Ambiente Seco)'
    return [time, `${val}%`, `${base}%`, diffStr, status]
  })

  return { headers, rows }
}

export function getWindTable(scenarioId: string | null) {
  const activeId = scenarioId || '1'
  const current = WIND_CURVES[activeId] || WIND_CURVES['1']
  const baseline = WIND_CURVES['1']

  const headers = ['Hora', 'Velocidad de Viento (m/s)', 'Línea Base (m/s)', 'Delta Fricción (ΔV)', 'Efecto de Rugosidad Vegetal']
  const rows = TIME_LABELS.map((time, idx) => {
    const val = current[idx]
    const base = baseline[idx]
    const diff = Number((val - base).toFixed(1))
    const diffStr = diff > 0 ? `+${diff} m/s` : `${diff} m/s`
    const effect = val <= 1.0 ? 'Brisa Suave / Amortiguada' : val <= 2.5 ? 'Ventilación Óptima' : 'Flujo Turbulento en Cañón'
    return [time, `${val} m/s`, `${base} m/s`, diffStr, effect]
  })

  return { headers, rows }
}

export function getPETTable(scenarioId: string | null) {
  const activeId = scenarioId || '1'
  const current = PET_CURVES[activeId] || PET_CURVES['1']
  const baseline = PET_CURVES['1']

  const headers = ['Hora', 'Índice PET (°C)', 'Línea Base (°C)', 'Mitigación Fisiológica', 'Nivel de Estrés Térmico Humano']
  const rows = TIME_LABELS.map((time, idx) => {
    const val = current[idx]
    const base = baseline[idx]
    const diff = Number((val - base).toFixed(1))
    const diffStr = diff > 0 ? `+${diff} °C` : `${diff} °C`

    let category = 'Confort Térmico Óptimo'
    if (val >= 35) category = 'Estrés Térmico Extremo'
    else if (val >= 29) category = 'Estrés Térmico Fuerte'
    else if (val >= 23) category = 'Estrés Térmico Moderado'
    else if (val < 18) category = 'Estrés por Frío Leve'

    return [time, `${val} °C`, `${base} °C`, diffStr, category]
  })

  return { headers, rows }
}

