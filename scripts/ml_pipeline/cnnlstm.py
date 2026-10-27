# Misma arquitectura CNN-LSTM que backend/app/services/ml_engine.py:
# Conv1D(16, k=3, same, ReLU) -> LSTM(64) -> Dense(32, ReLU) -> Dense(1); Adam lr=0.005, MSE, 35 épocas, batch 32
import numpy as np
from sklearn.preprocessing import StandardScaler
try:
    import os; os.environ.setdefault('TF_CPP_MIN_LOG_LEVEL','3')
    import tensorflow as tf
    BACKEND='tensorflow-keras '+tf.__version__
    class CNNLSTMRegressor:
        def __init__(s,input_dim,epochs=35,batch_size=32,lr=0.005,seed=42):
            s.input_dim,s.epochs,s.bs,s.lr,s.seed=input_dim,epochs,batch_size,lr,seed
        def fit(s,X,y):
            tf.keras.utils.set_random_seed(s.seed)
            s.sx,s.sy=StandardScaler().fit(X),StandardScaler().fit(y.reshape(-1,1))
            L=tf.keras.layers
            s.m=tf.keras.Sequential([L.Input((s.input_dim,1)),L.Conv1D(16,3,padding='same',activation='relu'),
                 L.LSTM(64),L.Dense(32,activation='relu'),L.Dense(1)])
            s.m.compile(optimizer=tf.keras.optimizers.Adam(s.lr),loss='mse')
            s.m.fit(s.sx.transform(X)[...,None],s.sy.transform(y.reshape(-1,1)).ravel(),epochs=s.epochs,batch_size=s.bs,verbose=0,shuffle=True)
            return s
        def predict(s,X):
            p=s.m.predict(s.sx.transform(X)[...,None],batch_size=4096,verbose=0)
            return s.sy.inverse_transform(p.reshape(-1,1)).ravel()
except Exception as e:
    BACKEND='sklearn-MLP-fallback'
    class CNNLSTMRegressor:
        def __init__(s,*a,**k): raise RuntimeError('TensorFlow no disponible')
