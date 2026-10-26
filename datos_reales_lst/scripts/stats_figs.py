import os
import json
import pandas as pd
import numpy as np
from scipy import stats
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, 'out')
plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 10})
R = json.load(open(os.path.join(OUT, 'resultados.json')))
MODELS = ['Stacking Ensemble', 'CNN-LSTM', 'XGBoost', 'Random Forest', 'SVR']
S = {}
for scheme in ['espacial', 'temporal']:
    o = pd.read_csv(os.path.join(OUT, f'oof_{scheme}.csv'))
    per=o.groupby('date').apply(lambda g: pd.Series({m:np.sqrt(((g[m]-g.lst)**2).mean()) for m in MODELS}))
    N,k=per.shape
    chi,p=stats.friedmanchisquare(*[per[m] for m in MODELS])
    ranks=per.rank(axis=1).mean()
    cd=2.728*np.sqrt(k*(k+1)/(6*N))
    pairs=[]
    for i in range(k):
        for j in range(i+1,k):
            w=stats.wilcoxon(per[MODELS[i]],per[MODELS[j]]); pairs.append([MODELS[i],MODELS[j],float(w.statistic),float(w.pvalue)])
    # Holm
    order=np.argsort([x[3] for x in pairs]); m=len(pairs); prev=0
    for r,idx in enumerate(order):
        adj=min(1,max(prev,(m-r)*pairs[idx][3])); pairs[idx].append(adj); prev=adj
    S[scheme]={'N_fechas':int(N),'friedman_chi2':float(chi),'friedman_p':float(p),'rangos':ranks.round(3).to_dict(),'CD':float(cd),
               'wilcoxon_holm':pairs,'rmse_por_fecha':per.round(4).to_dict()}
    if scheme=='espacial': per_sp=per; o_sp=o
# heat subset (upper quartile LST) for stacking, spatial
q=np.percentile(o_sp.lst,75); h=o_sp.lst>=q
S['calor']={'umbral':float(q),'rmse':{m:float(np.sqrt(((o_sp[m][h]-o_sp.lst[h])**2).mean())) for m in MODELS}}
json.dump(S,open(os.path.join(OUT, 'estadistica.json'),'w'),indent=1,default=float)
sp=R['espacial']
# ---- Fig 2: observed vs predicted
st='Stacking Ensemble'; y=o_sp.lst; p=o_sp[st]
fig,ax=plt.subplots(figsize=(6,4.2),dpi=300)
hb=ax.hexbin(y,p,gridsize=60,cmap='viridis',mincnt=1,bins='log'); plt.colorbar(hb,label='n.º de observaciones (log)')
lim=[min(y.min(),p.min())-1,max(y.max(),p.max())+1]; ax.plot(lim,lim,'r--',lw=1,label='1:1')
ax.set_xlim(lim); ax.set_ylim(lim); ax.set_xlabel('LST observada (°C)'); ax.set_ylabel('LST predicha (°C)')
ax.legend(loc='upper left'); ax.set_title(f"Stacking Ensemble — validación espacial (R² = {sp[st]['R2']:.3f}; RMSE = {sp[st]['RMSE']:.2f} °C)",fontsize=9)
fig.tight_layout(); fig.savefig(os.path.join(OUT, 'fig2_obs_pred.png')); plt.close()
# ---- Fig 3: residuals
e=(y-p).values; mu,sd=e.mean(),e.std()
fig,ax=plt.subplots(figsize=(6,4),dpi=300)
ax.hist(e,bins=80,density=True,color='#4C72B0',alpha=.75,label='Residuos')
xx=np.linspace(e.min(),e.max(),300); ax.plot(xx,stats.norm.pdf(xx,mu,sd),'r',lw=1.5,label=f'Normal (μ = {mu:.3f}; σ = {sd:.2f})')
ax.set_xlabel('Residuo e = y − ŷ (°C)'); ax.set_ylabel('Densidad'); ax.legend(); fig.tight_layout(); fig.savefig(os.path.join(OUT, 'fig3_residuos.png')); plt.close()
S['residuos']={'media':float(mu),'sd':float(sd),'skew':float(stats.skew(e)),'kurt':float(stats.kurtosis(e))}
# ---- Fig 4: CD diagram
r=S['espacial']['rangos']; cd=S['espacial']['CD']; k=len(MODELS)
fig,ax=plt.subplots(figsize=(7,2.8),dpi=300); ax.set_xlim(0.8,k+0.2); ax.set_ylim(0,3); ax.axis('off')
ax.hlines(2.4,1,k,color='k'); 
for t in range(1,k+1): ax.vlines(t,2.35,2.45,color='k'); ax.text(t,2.55,str(t),ha='center',fontsize=9)
ax.hlines(2.85,1,1+cd,color='r',lw=2); ax.text(1+cd/2,2.92,f'CD = {cd:.3f}',ha='center',color='r',fontsize=9)
srt=sorted(r.items(),key=lambda x:x[1])
for i,(m,v) in enumerate(srt):
    yy=2.0-i*0.35; ax.plot([v,v],[2.4,yy],'k',lw=.8)
    left=i<(k/2)
    ax.plot([v, 0.85 if left else k+0.15],[yy,yy],'k',lw=.8)
    ax.text(0.85 if left else k+0.15,yy+0.05,f'{m} ({v:.2f})',ha='left' if left else 'right',va='bottom',fontsize=8.5)
# cliques (non-significant groups)
vals=[v for _,v in srt]; yb=2.25; drawn=[]
for i in range(k):
    j=max([jj for jj in range(i,k) if vals[jj]-vals[i]<=cd])
    if j>i and not any(a<=i and j<=b for a,b in drawn):
        ax.hlines(yb,vals[i]-0.03,vals[j]+0.03,color='#555',lw=3); drawn.append((i,j)); yb-=0.1
fig.tight_layout(); fig.savefig(os.path.join(OUT, 'fig4_cd.png')); plt.close()
# ---- Fig 5: per-date RMSE boxplot
fig,ax=plt.subplots(figsize=(6.5,4),dpi=300)
ax.boxplot([per_sp[m] for m in MODELS],tick_labels=[m.replace(' Ensemble','\nEnsemble').replace('Random ','Random\n') for m in MODELS],patch_artist=True,
           boxprops=dict(facecolor='#A6C8E0'),medianprops=dict(color='k'))
ax.set_ylabel('RMSE por escena (°C)'); ax.set_title('Validación espacial por bloques: RMSE en cada una de las escenas',fontsize=9)
fig.tight_layout(); fig.savefig(os.path.join(OUT, 'fig5_boxplot.png')); plt.close()
iqr={m:float(np.subtract(*np.percentile(per_sp[m],[75,25]))) for m in MODELS}; S['iqr_por_fecha']=iqr
# ---- Fig 6: multicriteria normalized 10-100
lat=R['latencia_ms_100']
crit={'Precisión (1/RMSE)':{m:1/sp[m]['RMSE'] for m in MODELS},'Ajuste (R²)':{m:sp[m]['R2'] for m in MODELS},
      'Estabilidad (1/σCV)':{m:1/sp[m]['sd_cv'] for m in MODELS},'Velocidad (1/latencia)':{m:1/lat[m] for m in MODELS}}
fig,ax=plt.subplots(figsize=(7,4),dpi=300); w=0.16
for i,m in enumerate(MODELS):
    vals=[]
    for c,dct in crit.items():
        a=np.array(list(dct.values())); vals.append(10+90*(dct[m]-a.min())/(a.max()-a.min()) if a.max()>a.min() else 100)
    ax.bar(np.arange(4)+(i-2)*w,vals,w,label=m)
ax.set_xticks(range(4)); ax.set_xticklabels(list(crit.keys()),fontsize=8.5); ax.set_ylabel('Puntuación normalizada [10–100]')
ax.legend(fontsize=7.5,ncol=3,loc='upper center',bbox_to_anchor=(0.5,-0.12)); fig.tight_layout(); fig.savefig(os.path.join(OUT, 'fig6_multicriterio.png')); plt.close()
# ---- Fig 7: permutation importance
imp=pd.Series(R['importancia']).clip(lower=0); pct=(imp/imp.sum()*100).sort_values()
names={'ndvi':'NDVI','ndbi':'NDBI','albedo':'Albedo','veg_frac':'Fracción vegetal','built_frac':'Fracción edificada','elevation':'Elevación',
       't2m':'T aire 2 m (ERA5)','rh':'Humedad relativa (ERA5)','wind':'Viento 10 m (ERA5)','ssrd':'Radiación solar (ERA5)'}
fig,ax=plt.subplots(figsize=(6,4),dpi=300); ax.barh([names[i] for i in pct.index],pct.values,color='#55A868')
for i,v in enumerate(pct.values): ax.text(v+0.3,i,f'{v:.1f} %',va='center',fontsize=8)
ax.set_xlabel('Contribución relativa (%) — importancia por permutación'); fig.tight_layout(); fig.savefig(os.path.join(OUT, 'fig7_importancia.png')); plt.close()
S['importancia_pct']=pct.round(2).to_dict()
json.dump(S,open(os.path.join(OUT, 'estadistica.json'),'w'),indent=1,default=float)
print(json.dumps({k:v for k,v in S['espacial'].items() if k!='rmse_por_fecha'},indent=1,default=float)); print(S['calor'],S['residuos'],S['iqr_por_fecha'],S['importancia_pct'])
