import os
import json
import pandas as pd
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.environ.get('DATA_DIR', os.path.join(ROOT, 'data'))
OUT_DIR = os.environ.get('OUT_DIR', os.path.join(ROOT, 'backend', 'app', 'data', 'real_results'))
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

d = pd.read_csv(os.path.join(DATA_DIR, 'dataset_real_LST_Trujillo.csv'))
log = {'raw_rows': len(d), 'raw_dates': d.date.nunique()}
d = d[d.landcover != 80]; log['after_water'] = len(d)
d = d.dropna(); d = d[(d.lst >= 10) & (d.lst <= 60)]; log['after_range'] = len(d)
# 500 m spatial blocks
lat0, lon0 = d.latitude.mean(), d.longitude.mean()
y_m = (d.latitude - lat0) * 111320; x_m = (d.longitude - lon0) * 111320 * np.cos(np.radians(lat0))
d['block'] = (np.floor(x_m / 500)).astype(int).astype(str) + '_' + (np.floor(y_m / 500)).astype(int).astype(str)
d['point_id'] = d.latitude.round(6).astype(str) + '_' + d.longitude.round(6).astype(str)
log.update(rows=len(d), dates=d.date.nunique(), points=d.point_id.nunique(), blocks=d.block.nunique(),
  date_min=d.date.min(), date_max=d.date.max(),
  lat=[d.latitude.min(), d.latitude.max()], lon=[d.longitude.min(), d.longitude.max()],
  area_km2=float((d.latitude.max() - d.latitude.min()) * 111.32 * (d.longitude.max() - d.longitude.min()) * 111.32 * np.cos(np.radians(lat0))))
d.to_csv(os.path.join(DATA_DIR, 'clean.csv'), index=False)
F = ['lst', 'ndvi', 'ndbi', 'albedo', 'veg_frac', 'built_frac', 'elevation', 't2m', 'rh', 'wind', 'ssrd']
desc = d[F].describe().T[['mean', 'std', 'min', 'max']]
desc.to_csv(os.path.join(OUT_DIR, 'descriptivos.csv'))
print(json.dumps(log, indent=1, default=str)); print(desc.round(3))
print(d.landcover.value_counts())
json.dump(log, open(os.path.join(OUT_DIR, 'clean_log.json'), 'w'), default=str, indent=1)

