import os
import json
import pandas as pd
import numpy as np

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = pd.read_csv(os.path.join(BASE, 'data', 'clean.csv'))
log = json.load(open(os.path.join(BASE, 'out', 'clean_log.json')))
g = d.groupby('date').agg(n=('lst', 'size'), med=('lst', 'median'), t2m=('t2m', 'first'))
npts = d.point_id.nunique()
bad_cloud = g[(g.med - g.t2m) < 5].index.tolist()
bad_cov = g[g.n < 0.25 * npts].index.tolist()
d = d[~d.date.isin(bad_cloud + bad_cov)]
med = d.groupby('date').lst.transform('median')
mad = d.groupby('date').lst.transform(lambda s: (s - s.median()).abs().median()) * 1.4826
out = (d.lst - med).abs() > 4 * mad
log.update(excl_cloud=bad_cloud, excl_cov=bad_cov, pixel_outliers=int(out.sum()))
d = d[~out]
log.update(final_rows=len(d), final_dates=d.date.nunique(), final_points=d.point_id.nunique(), final_blocks=d.block.nunique())
d.to_csv(os.path.join(BASE, 'data', 'final.csv'), index=False)
F = ['lst', 'ndvi', 'ndbi', 'albedo', 'veg_frac', 'built_frac', 'elevation', 't2m', 'rh', 'wind', 'ssrd']
d[F].describe().T[['mean', 'std', 'min', 'max']].to_csv(os.path.join(BASE, 'out', 'descriptivos.csv'))
print(d[F].describe().T[['mean', 'std', 'min', 'max']].round(3))
json.dump(log, open(os.path.join(BASE, 'out', 'clean_log.json'), 'w'), default=str, indent=1)
print(json.dumps(log, default=str))
