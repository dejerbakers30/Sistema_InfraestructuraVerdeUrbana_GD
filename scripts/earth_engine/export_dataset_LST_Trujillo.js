// ===== Dataset real LST Trujillo (Landsat 8-9 + Sentinel-2 + ERA5-Land) =====
// Ejecutado en Google Earth Engine Code Editor (proyecto no comercial) el 26/10/2026.
var centro = ee.Geometry.Point([-79.0287, -8.1116]);
var aoi = centro.buffer(4000).bounds();
var inicio = '2023-01-01', fin = '2025-12-31';
Map.centerObject(aoi, 13); Map.addLayer(aoi, {}, 'AOI');

function lstLandsat(img) {
  var qa = img.select('QA_PIXEL');
  var ok = qa.bitwiseAnd(1 << 3).eq(0).and(qa.bitwiseAnd(1 << 4).eq(0));
  var lst = img.select('ST_B10').multiply(0.00341802).add(149.0).subtract(273.15)
              .rename('lst').updateMask(ok);
  return ee.Image(lst.copyProperties(img, ['system:time_start']));
}
var landsat = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
  .merge(ee.ImageCollection('LANDSAT/LC09/C02/T1_L2'))
  .filterBounds(aoi).filterDate(inicio, fin)
  .filter(ee.Filter.lt('CLOUD_COVER', 30))
  .map(lstLandsat);
print('Escenas Landsat:', landsat.size());

function maskS2(img) {
  var scl = img.select('SCL');
  var ok = scl.neq(3).and(scl.neq(8)).and(scl.neq(9)).and(scl.neq(10));
  return img.updateMask(ok).divide(10000);
}
var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(aoi).filterDate(inicio, fin)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
  .map(maskS2).median();
var ndvi = s2.normalizedDifference(['B8', 'B4']).rename('ndvi');
var ndbi = s2.normalizedDifference(['B11', 'B8']).rename('ndbi');
var albedo = s2.expression(
  '0.356*B2 + 0.130*B4 + 0.373*B8 + 0.085*B11 + 0.072*B12 - 0.0018',
  {B2: s2.select('B2'), B4: s2.select('B4'), B8: s2.select('B8'),
   B11: s2.select('B11'), B12: s2.select('B12')}).rename('albedo');

var wc = ee.ImageCollection('ESA/WorldCover/v200').first().select('Map');
var vegFrac = wc.eq(10).or(wc.eq(20)).or(wc.eq(30))
  .focalMean(50, 'circle', 'meters').rename('veg_frac');
var builtFrac = wc.eq(50).focalMean(50, 'circle', 'meters').rename('built_frac');
var landcover = wc.rename('landcover');
var elev = ee.Image('USGS/SRTMGL1_003').select('elevation');
var estaticas = ndvi.addBands([ndbi, albedo, vegFrac, builtFrac, landcover, elev]);

var puntos = ee.FeatureCollection.randomPoints({region: aoi, points: 1500, seed: 42});

var muestras = landsat.map(function(img) {
  var t = img.date();
  var era = ee.Image(ee.ImageCollection('ECMWF/ERA5_LAND/HOURLY')
    .filterDate(t.advance(-1, 'hour'), t).first());
  var T = era.select('temperature_2m').subtract(273.15);
  var Td = era.select('dewpoint_temperature_2m').subtract(273.15);
  var rh = Td.expression('100*exp(17.625*Td/(243.04+Td))/exp(17.625*T/(243.04+T))',
                         {Td: Td, T: T}).rename('rh');
  var wind = era.select('u_component_of_wind_10m').hypot(
             era.select('v_component_of_wind_10m')).rename('wind');
  var ssrd = era.select('surface_solar_radiation_downwards_hourly')
             .divide(3600).rename('ssrd');
  var stack = img.addBands(estaticas).addBands([T.rename('t2m'), rh, wind, ssrd]);
  return stack.sampleRegions({collection: puntos, scale: 30, geometries: true})
    .map(function(f) {
      var c = f.geometry().coordinates();
      return f.set({date: t.format('YYYY-MM-dd'),
                    longitude: c.get(0), latitude: c.get(1)});
    });
}).flatten();

print('Ejemplo:', muestras.limit(5));
Export.table.toDrive({
  collection: muestras,
  description: 'dataset_real_LST_Trujillo',
  fileFormat: 'CSV',
  selectors: ['date','latitude','longitude','lst','ndvi','ndbi','albedo',
              'veg_frac','built_frac','landcover','elevation','t2m','rh','wind','ssrd']
});
