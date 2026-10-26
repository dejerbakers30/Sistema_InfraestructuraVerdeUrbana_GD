import os
import json
import time
import warnings
import sys
import pandas as pd
import numpy as np

warnings.filterwarnings('ignore')
from sklearn.model_selection import GroupKFold
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.svm import SVR
from sklearn.ensemble import RandomForestRegressor, StackingRegressor
from sklearn.linear_model import Ridge, LinearRegression
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import xgboost as xgb, optuna
optuna.logging.set_verbosity(optuna.logging.WARNING)

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE, 'scripts'))
from cnnlstm import CNNLSTMRegressor, BACKEND

OUT = os.path.join(BASE, 'out')
SEED = 42
d = pd.read_csv(os.path.join(BASE, 'data', 'final.csv'))
F = ['ndvi', 'ndbi', 'albedo', 'veg_frac', 'built_frac', 'elevation', 't2m', 'rh', 'wind', 'ssrd']
X = d[F].values
y = d.lst.values
rmse = lambda a, b: float(np.sqrt(mean_squared_error(a, b)))

# ---------- hyperparameter tuning (Optuna TPE) on 30% of points, spatial 3-fold ----------
rng=np.random.default_rng(SEED); pts=d.point_id.unique(); sub=d.point_id.isin(rng.choice(pts,int(.3*len(pts)),replace=False)).values
Xs,ys,gs=X[sub],y[sub],d.block.values[sub]
def cvscore(make):
    s=[]
    for tr,te in GroupKFold(3,shuffle=True,random_state=SEED).split(Xs,ys,gs):
        m=make(); m.fit(Xs[tr],ys[tr]); s.append(rmse(ys[te],m.predict(Xs[te])))
    return np.mean(s)
best=json.load(open(os.path.join(OUT, 'hiperparametros.json'))) if os.path.exists(os.path.join(OUT, 'hiperparametros.json')) else {}
def tune(name,obj,n):
    if name in best: return
    st=optuna.create_study(direction='minimize',sampler=optuna.samplers.TPESampler(seed=SEED)); st.optimize(obj,n_trials=n)
    best[name]=st.best_params; print(name,st.best_params,round(st.best_value,3),flush=True)
tune('xgb',lambda t: cvscore(lambda: xgb.XGBRegressor(n_estimators=t.suggest_int('n_estimators',100,600),max_depth=t.suggest_int('max_depth',3,10),
    learning_rate=t.suggest_float('learning_rate',0.01,0.3,log=True),subsample=t.suggest_float('subsample',0.6,1.0),
    colsample_bytree=t.suggest_float('colsample_bytree',0.6,1.0),min_child_weight=t.suggest_int('min_child_weight',1,20),random_state=SEED,n_jobs=2)),30)
tune('rf',lambda t: cvscore(lambda: RandomForestRegressor(n_estimators=t.suggest_int('n_estimators',100,400),max_depth=t.suggest_int('max_depth',5,25),
    min_samples_leaf=t.suggest_int('min_samples_leaf',1,20),max_features=t.suggest_float('max_features',0.3,1.0),random_state=SEED,n_jobs=2)),20)
tune('svr',lambda t: cvscore(lambda: make_pipeline(StandardScaler(),SVR(C=t.suggest_float('C',0.5,100,log=True),gamma=t.suggest_float('gamma',0.005,1,log=True),
    epsilon=t.suggest_float('epsilon',0.05,1.0)))),20)
json.dump(best,open(os.path.join(OUT, 'hiperparametros.json'),'w'),indent=1)
if os.environ.get('TUNE_ONLY'): sys.exit(0)
assert BACKEND!='sklearn-MLP-fallback', 'CNN-LSTM backend missing'

def models():
    mx=lambda: xgb.XGBRegressor(**best['xgb'],random_state=SEED,n_jobs=2)
    mr=lambda: RandomForestRegressor(**best['rf'],random_state=SEED,n_jobs=2)
    ms=lambda: make_pipeline(StandardScaler(),SVR(**best['svr']))
    return {'Stacking Ensemble':lambda: StackingRegressor([('xgb',mx()),('rf',mr()),('svr',ms())],final_estimator=Ridge(alpha=1.0),cv=5,n_jobs=1),
            'CNN-LSTM':lambda: CNNLSTMRegressor(len(F),epochs=35,batch_size=32,seed=SEED),
            'XGBoost':mx,'Random Forest':mr,'SVR':ms,
            'Regresión lineal (referencia)':lambda: make_pipeline(StandardScaler(),LinearRegression())}
M=models()
res={'backend_cnn':BACKEND,'n':len(d),'features':F}
for scheme,groups in [('espacial',d.block.values),('temporal',d.date.values)]:
    oof={k:np.zeros(len(y)) for k in M}; fold_rmse={k:[] for k in M}; fold_id=np.zeros(len(y),int)
    for f,(tr,te) in enumerate(GroupKFold(5,shuffle=True,random_state=SEED).split(X,y,groups)):
        fold_id[te]=f
        for k,mk in M.items():
            t0=time.time(); m=mk(); m.fit(X[tr],y[tr]); p=m.predict(X[te]); oof[k][te]=p; fold_rmse[k].append(rmse(y[te],p))
            print(scheme,f,k,round(fold_rmse[k][-1],3),f'{time.time()-t0:.0f}s',flush=True)
    res[scheme]={k:{'RMSE':rmse(y,oof[k]),'MAE':float(mean_absolute_error(y,oof[k])),'R2':float(r2_score(y,oof[k])),
                    'sd_cv':float(np.std(fold_rmse[k],ddof=1)),'fold_rmse':fold_rmse[k]} for k in M}
    pd.DataFrame({**{'date':d.date,'block':d.block,'lst':y,'fold':fold_id},**oof}).to_csv(os.path.join(OUT, f'oof_{scheme}.csv'),index=False)
    json.dump(res,open(os.path.join(OUT, 'resultados.json'),'w'),indent=1)

# ---------- final models on all data: latency + importance ----------
try:
    cpu=open('/proc/cpuinfo').read().split('model name')[1].split('\n')[0].strip(': ')
except Exception:
    import platform
    cpu=platform.processor() or "CPU"
res['hardware']=f'{cpu}, 2 vCPU, 8 GB RAM'
Xb=np.tile(X,(1,1))[:10000]; lat={}
import joblib
for k,mk in M.items():
    m=mk(); m.fit(X,y); m.predict(Xb[:100])
    ts=[]
    for _ in range(5):
        t0=time.perf_counter(); m.predict(Xb); ts.append(time.perf_counter()-t0)
    lat[k]=float(np.median(ts)/len(Xb)*100*1000)  # ms per 100 points
    if k=='Stacking Ensemble': stack=m
    print('lat',k,round(lat[k],3),flush=True)
res['latencia_ms_100']=lat
from sklearn.inspection import permutation_importance
tr,te=next(GroupKFold(5,shuffle=True,random_state=SEED).split(X,y,d.block.values))
m=M['Stacking Ensemble'](); m.fit(X[tr],y[tr])
pi=permutation_importance(m,X[te],y[te],n_repeats=5,random_state=SEED,scoring='neg_root_mean_squared_error')
res['importancia']={f:float(v) for f,v in zip(F,pi.importances_mean)}
res['importancia_sd']={f:float(v) for f,v in zip(F,pi.importances_std)}
json.dump(res,open(os.path.join(OUT, 'resultados.json'),'w'),indent=1); print('FIN')
