import os
import json
import warnings
import pandas as pd
import numpy as np
from sklearn.model_selection import KFold, GroupKFold
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_squared_error
import xgboost as xgb

warnings.filterwarnings('ignore')
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, 'out')
d = pd.read_csv(os.path.join(BASE, 'data', 'final.csv'))
H = json.load(open(os.path.join(OUT, 'hiperparametros.json')))
F = ['ndvi', 'ndbi', 'albedo', 'veg_frac', 'built_frac', 'elevation', 't2m', 'rh', 'wind', 'ssrd']
X = d[F].values
y = d.lst.values
M = {
    'XGBoost': lambda: xgb.XGBRegressor(**H['xgb'], random_state=42, n_jobs=1),
    'Random Forest': lambda: RandomForestRegressor(**H['rf'], random_state=42, n_jobs=1)
}
res = {}
for name, mk in M.items():
    for scheme, spl in [('aleatoria', KFold(5, shuffle=True, random_state=42).split(X)),
                        ('espacial', GroupKFold(5, shuffle=True, random_state=42).split(X, y, d.block))]:
        p = np.zeros(len(y))
        for tr, te in spl:
            m = mk()
            m.fit(X[tr], y[tr])
            p[te] = m.predict(X[te])
        res[f'{name}|{scheme}'] = {'RMSE': float(np.sqrt(mean_squared_error(y, p))), 'R2': float(r2_score(y, p))}
json.dump(res, open(os.path.join(OUT, 'random_vs_spatial.json'), 'w'), indent=1)
print(res)
