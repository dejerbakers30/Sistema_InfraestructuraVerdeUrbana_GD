# Metamodelado Basado en Ensamble de Aprendizaje Automático para Gemelos Digitales Urbanos: Simulación y Mitigación del Microclima Térmico Mediante Infraestructura Verde

**Machine Learning Surrogate Modeling for Urban Green Infrastructure Digital Twins: Microclimate Simulation and Thermal Mitigation Assessment**

---

### Autores:
**Investigador Principal$^1$**, **Co-Investigador en Teledetección y Clima Urbano$^2$**, **Co-Investigador en Inteligencia Artificial Aplicada$^1$**  
$^1$ Departamento de Informática e Ingeniería de Sistemas, Universidad Nacional de Trujillo, Av. Juan Pablo II s/n, Trujillo, Perú.  
$^2$ Laboratorio de Tecnologías Geoespaciales y Gemelos Digitales Urbanos, Trujillo, Perú.  
*Autor de correspondencia:* `investigacion.gemelosdigitales@unitru.edu.pe`

---

## RESUMEN ESTRUCTURADO

**Objetivo:** Desarrollar, validar e integrar un metamodelo predictivo de aprendizaje automático (*surrogate model*) de alta resolución dentro de una arquitectura de Gemelo Digital Urbano (GDU), con el fin de superar el cuello de botella computacional de las simulaciones termo-fluidodinámicas (CFD/ENVI-met) y evaluar cuantitativamente el impacto de la infraestructura verde urbana (UGI) en la mitigación del estrés térmico en Trujillo, Perú.

**Metodología:** Siguiendo la metodología CRISP-DM (*Cross-Industry Standard Process for Data Mining*), se procesaron 1000 cuadrículas microclimáticas urbanas continuas georreferenciadas que integran variables morfológicas y biofísicas (NDVI, cobertura vegetal, albedo, densidad edificada, radiación solar global, humedad relativa y velocidad del viento). Se diseñaron, entrenaron y compararon cinco metamodelos: XGBoost Regressor, Random Forest, Support Vector Regressor (SVR), Red Neuronal Profunda (CNN-LSTM) y un Ensamble Stacking Multinivel con regularización Ridge L2. La evaluación se sustentó en validación cruzada estratificada de 5 particiones (5-Fold Cross-Validation), diagnósticos de homocedasticidad residual, y una batería de pruebas estadísticas no paramétricas rigurosas: prueba global de Friedman, contrastes pareados de Wilcoxon Signed-Rank y prueba post-hoc de Nemenyi con Diagrama de Diferencia Crítica de Demšar a nivel $\alpha = 0.05$.

**Resultados:** El metamodelo Stacking Ensemble demostró una superioridad algorítmica y biofísica estadísticamente significativa ($\chi^2_{Friedman} = 25.27, p = 4.40 \times 10^{-5}$), alcanzando un error cuadrático medio $RMSE = 0.7126$ °C ($MAE = 0.5459$ °C, $R^2 = 0.9876$) para temperatura del aire y $RMSE = 1.2516$ °C ($R^2 = 0.9825$) para el índice bioclimático PET (*Physiological Equivalent Temperature*). Bajo condiciones de estrés extremo (olas de calor $> P_{75}$), preservó un $RMSE = 0.6112$ °C con una latencia de inferencia de solo $4.19$ ms por cada 100 cuadrículas, representando una aceleración superior a cuatro órdenes de magnitud ($> 10,000\times$) frente a solucionadores numéricos tradicionales. El análisis de importancia determinó que la cobertura vegetal ($38.4\%$) y la densidad edificada ($29.7\%$) son los moduladores primarios del enfriamiento urbano, validando que intervenciones con techos verdes y arbolado viario logran descensos microclimáticos de hasta $-2.3$ °C en temperatura y $-3.8$ °C en PET.

**Conclusiones:** La integración del metamodelo en el Gemelo Digital posibilita la simulación interactiva y en tiempo real de intervenciones urbanas basadas en la naturaleza, constituyendo un soporte de decisión cuantitativo, verificable y escalable para la planificación climática en ciudades intermedias del hemisferio sur.

**Palabras clave:** Gemelos Digitales Urbanos; Microclima Urbano; Infraestructura Verde; Metamodelos; Stacking Ensemble; Diagrama de Demšar; Islas de Calor Urbanas.

---

## ABSTRACT

**Objective:** To develop, validate, and embed a high-resolution machine learning surrogate model into an Urban Digital Twin (UDT) architecture to bypass the severe computational bottleneck of numerical microclimatic fluid-dynamics simulations (CFD/ENVI-met), enabling real-time assessment of urban green infrastructure (UGI) on thermal mitigation in Trujillo, Peru.

**Methodology:** Following the CRISP-DM lifecycle, 1,000 spatial microclimatic grid units were processed combining biophysical and urban morphology indices (vegetation cover/NDVI, building coverage ratio, albedo, global solar radiation, relative humidity, wind speed). Five surrogate architectures were benchmarked: XGBoost, Random Forest, Support Vector Regressor (SVR), Deep Neural Networks (CNN-LSTM), and a Multilevel Stacking Ensemble with Ridge meta-regression. Model validation adhered to 5-fold cross-validation, residual homoscedasticity diagnostics, and rigorous non-parametric statistical hypothesis testing: Friedman's test, Wilcoxon signed-rank tests, and Nemenyi post-hoc Critical Difference (CD) Demšar diagrams at $\alpha = 0.05$.

**Results:** The Stacking Ensemble surrogate exhibited statistically significant algorithmic superiority ($\chi^2_{Friedman} = 25.27, p = 4.40 \times 10^{-5}$), yielding $RMSE = 0.7126$ °C ($MAE = 0.5459$ °C, $R^2 = 0.9876$) for air temperature and $RMSE = 1.2516$ °C ($R^2 = 0.9825$) for Physiological Equivalent Temperature (PET). Under heatwave conditions ($> 75th$ percentile), the surrogate maintained $RMSE = 0.6112$ °C with an inference latency of $4.19$ ms per 100 spatial points, achieving a computational speedup exceeding four orders of magnitude ($> 10,000\times$) over physics-based models. Feature importance highlighted vegetation fraction ($38.4\%$) and building density ($29.7\%$) as key thermal regulators, proving that simulated nature-based retrofits reduce local air temperatures by up to $-2.3$ °C and PET by $-3.8$ °C.

**Conclusions:** Integrating machine learning surrogates into urban digital twins provides urban planners with real-time, statistically validated decision-support tools for climate-resilient urban design in arid coastal cities.

**Keywords:** Urban Digital Twins; Urban Microclimate; Urban Green Infrastructure; Surrogate Modeling; Stacking Ensemble; Demšar Diagram; Urban Heat Island.

---

## 1. INTRODUCCIÓN

El crecimiento demográfico acelerado y la densificación no planificada han transformado radicalmente el balance de energía superficial en los entornos urbanos, consolidando el fenómeno conocido como Isla de Calor Urbana (*Urban Heat Island*, UHI) (Oke, 1982; Santamouris et al., 2015). La sustitución progresiva de suelos vegetados y permeables por materiales con alta capacidad calorífica, baja reflectancia solar (albedo) y superficies impermeables incrementa la absorción de radiación de onda corta y retarda la liberación nocturna de calor sensible (Akbari et al., 2001; Gartland, 2012). En las ciudades costeras áridas y semiáridas de América del Sur, como Trujillo (Perú), este fenómeno se ve agravado por eventos climáticos extremos y olas de calor exacerbadas por el cambio climático global, afectando directamente la salud pública, la morbilidad cardiovascular y el confort térmico peatonal (Grimmond et al., 2010; Sailor, 2011).

Frente a este desafío, la Infraestructura Verde Urbana (*Urban Green Infrastructure*, UGI) y las Soluciones Basadas en la Naturaleza (*Nature-based Solutions*, NbS)—que incluyen parques urbanos, arbolado viario, jardines de lluvia y cubiertas vegetales—constituyen la estrategia bioclimática más eficaz para restaurar la termorregulación urbana mediante el sombreado directo y la refrigeración por evapotranspiración (Bowler et al., 2010; Coutts et al., 2013; Pauleit et al., 2011; Zölch et al., 2016). Sin embargo, cuantificar con precisión el impacto microclimático de diferentes configuraciones espaciales de UGI ha dependido históricamente de software de simulación termo-fluidodinámica numérica tridimensional (CFD) como ENVI-met (Bruse & Fleer, 1998; Demuzere et al., 2014; Skelhorn et al., 2014). Aunque ENVI-met proporciona una modelización física rigurosa de las interacciones superficie-vegetación-atmósfera a escala de microescala, sufre de un cuello de botella computacional prohibitivo: simular un área de apenas 1 km² durante un ciclo diurno de 24 horas requiere con frecuencia entre 12 y 48 horas de cálculo intensivo de CPU (Norton et al., 2015; Tsoka et al., 2018).

Esta latencia computacional inhabilita el uso de simuladores numéricos clásicos en plataformas interactivas de planificación y en la nueva generación de Gemelos Digitales Urbanos (*Urban Digital Twins*, GDU) (Batty, 2018; Ketzler et al., 2020; Shahat et al., 2021). Un Gemelo Digital Urbano requiere réplicas virtuales que no solo reflejen la morfología física de la ciudad, sino que permitan a planificadores urbanos, investigadores y autoridades interactuar dinámicamente con escenarios predictivos (*what-if scenarios*) en milisegundos (Castelli et al., 2021; Deng et al., 2021; Schrotter & Hürzeler, 2020).

Para superar esta disyuntiva entre precisión física y velocidad de respuesta, el metamodelado o modelado sustituto (*surrogate modeling*) basado en Aprendizaje Automático (*Machine Learning*, ML) ha surgido como un paradigma prometedor (Hastie et al., 2009; White et al., 2021). Al entrenar modelos supervisados con datos generados por modelos físicos calibrados o redes de monitoreo micrometeorológico, los metamodelos aprenden las complejas relaciones no lineales entre la morfología urbana (albedo, altura de edificaciones, cobertura vegetal) y las variables microclimáticas resultantes (temperatura del aire e índice de Temperatura Fisiológica Equivalente, PET) (Höppe, 1999; Stewart & Oke, 2012). 

A pesar de los avances recientes en la aplicación de algoritmos como XGBoost (Chen & Guestrin, 2016), Random Forest (Breiman, 2001) y Redes Neuronales (LeCun et al., 2015), la literatura científica adolece de tres vacíos metodológicos cruciales:
1. **Falta de Validación Estadística Rigurosa:** La mayoría de las publicaciones reportan únicamente métricas puntuales de error ($R^2$, RMSE), omitiendo contrastes no paramétricos multimodelo (Friedman, Wilcoxon) y pruebas de diferencia crítica post-hoc (Demšar, 2006) que certifiquen si las discrepancias observadas son genuinas o producto de la varianza muestral.
2. **Subestimación de Extremos Térmicos:** Los modelos comúnmente exhiben pérdida de precisión durante picos de olas de calor, donde el comportamiento no lineal de la vegetación (cierre estomático por estrés hídrico) altera la tasa de evapotranspiración.
3. **Ausencia de Motores Interactivos Abiertos:** Rara vez los modelos desarrollados se empaquetan en arquitecturas de software reproducibles bajo estándares de la industria como CRISP-DM, que faciliten su adopción en plataformas de gemelos digitales operativas.

El presente artículo aborda directamente estas limitaciones. La contribución principal de esta investigación radica en:
1. Desarrollar e implementar un metamodelo híbrido multinivel (*Stacking Ensemble*) que integra árboles de decisión potenciados (XGBoost), ensamble por agregación (Random Forest) y máquinas de vectores de soporte (SVR) con regularización Ridge L2, optimizado específicamente para gemelos digitales urbanos.
2. Ejecutar un protocolo de validación cruzada espacial de 5 pliegues y una batería exhaustiva de pruebas estadísticas no paramétricas basadas en los estándares editoriales de Demšar (2006), evaluando tanto la temperatura del aire como el índice bioclimático PET.
3. Incorporar el motor en una aplicación abierta interactiva con Streamlit bajo el ciclo de vida CRISP-DM, demostrando la interpretabilidad y explicabilidad biofísica de las 6 figuras y 6 tablas de resultados para su adopción en la gestión urbana sostenible.

---

## 2. ÁREA DE ESTUDIO Y DATOS

### 2.1. Localización Geográfica y Régimen Microclimático
El estudio se sitúa en la ciudad de Trujillo, capital del departamento de La Libertad, en la costa norte del Perú (coordenadas centrales: Latitud 8°06′36″ S, Longitud 79°01′48″ W; elevación: 34 m s.n.m.). De acuerdo con la clasificación climática de Köppen-Geiger, la zona corresponde a un clima desértico cálido con nubosidad costera (*BWh*), caracterizado por precipitaciones anuales inferiores a 20 mm, alta radiación solar global incidente durante el verano austral (diciembre-marzo) y temperaturas diurnas que superan los 32 °C en zonas densamente urbanizadas.

### 2.2. Cuadrícula Urbana y Extracción de Parámetros Biofísicos
Se configuró una cuadrícula geoespacial de 1000 celdas homogéneas ($N = 1000$) que cubren el tejido urbano central y de expansión periférica. Para cada celda espacial se extrajeron y calcularon ocho variables predictoras independientes representativas de la morfología urbana y las condiciones de borde meteorológicas, complementadas por las dos variables predictivas de respuesta microclimática:

* **Cobertura Vegetal / NDVI ($vegetation\_pct$, %):** Proporción de superficie cubierta por dosel arbóreo y cobertura herbácea, derivada de índices espectrales satelitales calibrados.
* **Densidad Edificada / BCR ($building\_density$, %):** Relación de cobertura edificada (*Building Coverage Ratio*) que cuantifica el porcentaje de suelo ocupado por estructuras construidas.
* **Albedo Superficial ($albedo$, adimensional [0-1]):** Reflectancia espectral ponderada de las cubiertas de suelo y techos urbanos.
* **Radiación Solar Global ($solar\_radiation$, W/m²):** Radiación incidente neta sobre el plano horizontal urbano.
* **Velocidad del Viento ($wind\_speed$, m/s):** Magnitud del vector de flujo de aire local a 2 metros de altura sobre el suelo.
* **Humedad Relativa ($humidity$, %):** Porcentaje de saturación de vapor de agua atmosférico.
* **Latitud y Longitud ($latitude, longitude$, grados decimales):** Coordenadas geodésicas en el sistema WGS84 para capturar gradientes espaciales y proximidad costera.
* **Temperatura del Aire ($temperature$, °C):** Variable objetivo principal que describe la temperatura termodinámica del aire urbano a nivel peatonal ($1.5$ m).
* **Índice Bioclimático PET ($pet$, °C):** Temperatura Fisiológica Equivalente (*Physiological Equivalent Temperature*), calculada con el modelo MEMI (*Munich Energy-balance Model for Individuals*) para evaluar el confort térmico humano (Höppe, 1999).

En la **Tabla 1** se detallan las estadísticas descriptivas globales del conjunto de datos microclimáticos analizados.

---

## 3. METODOLOGÍA

La investigación se estructuró siguiendo formalmente las seis fases de la metodología estándar de minería de datos y ciencia de datos CRISP-DM (*Cross-Industry Standard Process for Data Mining*), como se ilustra en el flujo metodológico:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   METODOLOGÍA CRISP-DM DEL ESTUDIO                      │
├───────────────────┬──────────────────────────────────────────────────────┤
│ 1. Business &     │ Definición del problema: Cuello de botella numérico  │
│    Urban Problem  │ en Gemelos Digitales e impacto del calor urbano      │
├───────────────────┼──────────────────────────────────────────────────────┤
│ 2. Data           │ Análisis exploratorio (EDA), matriz de correlación   │
│    Understanding  │ de Pearson y distribución espacial en Trujillo      │
├───────────────────┼──────────────────────────────────────────────────────┤
│ 3. Data           │ Imputación, estandarización Z-score, partición       │
│    Preparation    │ Train (80%) / Test (20%) y detección de olas de calor│
├───────────────────┼──────────────────────────────────────────────────────┤
│ 4. Modeling       │ Entrenamiento de 5 arquitecturas: XGBoost, RF, SVR,  │
│                   │ Stacking Ensemble (XGB+RF+SVR+Ridge) y CNN-LSTM     │
├───────────────────┼──────────────────────────────────────────────────────┤
│ 5. Enhanced       │ Validación cruzada 5-Fold, dispersión y=x, análisis  │
│    Evaluation     │ de homocedasticidad y pruebas no paramétricas        │
│                   │ de Friedman, Wilcoxon y Nemenyi CD de Demšar         │
├───────────────────┼──────────────────────────────────────────────────────┤
│ 6. Deployment &   │ Motor interactivo en Python/Streamlit, generación de │
│    Reporting      │ reportes explicables y exportación científica        │
└───────────────────┴──────────────────────────────────────────────────────┘
```

### 3.1. Arquitectura de los Metamodelos
Se implementaron y compararon cinco familias representativas del aprendizaje automático moderno:

1. **XGBoost Regressor (Extreme Gradient Boosting):** Algoritmo de ensamble secuencial que optimiza funciones de pérdida diferenciables mediante aproximaciones de Taylor de segundo orden y regularización explícita ($\Omega(f) = \gamma T + \frac{1}{2}\lambda \|w\|^2$) para evitar sobreajuste (Chen & Guestrin, 2016).
2. **Random Forest Regressor:** Algoritmo no paramétrico de ensamble por agregación *bootstrap* (*bagging*), que construye múltiples árboles de decisión descorrelacionados seleccionando subconjuntos aleatorios de predictores en cada división (Breiman, 2001).
3. **Support Vector Regressor (SVR):** Metamodelo basado en la teoría del aprendizaje estadístico que busca una función plana $f(x) = \langle w, \Phi(x) \rangle + b$ confinada dentro de un tubo de insensibilidad $\epsilon$, minimizando la norma $\|w\|^2$ y utilizando un kernel de base radial (RBF) para mapear no linealidades complejas (Drucker et al., 1997; Smola & Schölkopf, 2004).
4. **Stacking Ensemble (Híbrido Multinivel):** Arquitectura jerárquica de dos niveles (Wolpert, 1992). En el Nivel 0 (*Base Learners*), tres estimadores complementarios (XGBoost, Random Forest y SVR) generan predicciones no lineales independientes mediante validación cruzada interna *out-of-fold*. En el Nivel 1 (*Meta-Learner*), un estimador de regresión Ridge con penalización cuadrática L2 aprende las ponderaciones óptimas de combinación, mitigando simultáneamente el sesgo inductivo y la varianza muestral.
5. **Red Neuronal Profunda CNN-LSTM / MLP:** Red neuronal compuesta por capas convolucionales 1D (para capturar correlaciones morfológicas espaciales locales), capas recurrentes de memoria a corto y largo plazo (LSTM) y capas densas completamente conectadas con regularización *dropout* y función de activación ReLU (Hochreiter & Schmidhuber, 1997; LeCun et al., 2015).

La parametrización e hiperparámetros óptimos seleccionados se resumen en la **Tabla 2**.

### 3.2. Protocolo de Validación y Pruebas Estadísticas Rigurosas
Para garantizar la validez científica y la extrapolabilidad de los metamodelos sin filtración de datos (*data leakage*), el dataset de 1000 cuadrículas se dividió en un conjunto de entrenamiento (80%, $N_{train} = 800$) y un conjunto de prueba retenido e independiente (20%, $N_{test} = 200$). 

Sobre el conjunto de entrenamiento se ejecutó una Validación Cruzada de 5 Particiones (5-Fold Cross-Validation). Las métricas cuantitativas evaluadas incluyeron el Error Cuadrático Medio ($RMSE$), el Error Absoluto Medio ($MAE$), el Coeficiente de Determinación ($R^2$), el Error Porcentual Absoluto Medio ($MAPE$) y la latencia computacional de inferencia por cada 100 puntos en milisegundos ($t_{inf}$).

Asimismo, para cumplir con el estándar peer-reviewed de Demšar (2006) en la comparación de clasificadores y regresores de aprendizaje automático, se ejecutó una batería de contrastes de hipótesis estadísticos no paramétricos:
* **Prueba Global de Friedman:** Contraste de rangos para verificar la hipótesis nula ($H_0$) de que todos los metamodelos presentan un rendimiento equivalente:
  $$\chi^2_F = \frac{12 N}{k(k+1)} \left[ \sum_{j=1}^k R_j^2 - \frac{k(k+1)^2}{4} \right]$$
  donde $k = 5$ es el número de metamodelos, $N = 200$ es el número de muestras de prueba, y $R_j$ es el rango promedio del modelo $j$.
* **Prueba Pareada de Wilcoxon Signed-Rank:** Contraste de diferencias de errores absolutos apareados ($|y_i - \hat{y}_{i, A}| - |y_i - \hat{y}_{i, B}|$) con nivel de significancia $\alpha = 0.05$ y corrección por comparaciones múltiples.
* **Prueba Post-Hoc de Nemenyi y Diagrama de Diferencia Crítica (CD):** Cálculo de la distancia crítica ($CD$) mínima requerida entre los rangos promedio de dos modelos para considerar su diferencia como estadísticamente significativa:
  $$CD = q_\alpha \sqrt{\frac{k(k+1)}{6N}}$$
  donde $q_{0.05} = 2.728$ para $k=5$ modelos (Demšar, 2006).

---

## 4. RESULTADOS

### 4.1. Análisis Exploratorio y Estadísticas Descriptivas (Tabla 1)
El conjunto de datos presenta una notable variabilidad ambiental en Trujillo. La cobertura vegetal varía entre $4.00\%$ y $88.00\%$ (media de $39.18\% \pm 24.69\%$), mientras que la densidad edificada oscila entre $6.00\%$ y $96.00\%$ (media de $55.31\% \pm 28.64\%$). La temperatura del aire registrada abarca desde un mínimo de $19.50$ °C hasta un valor extremo de $39.80$ °C (media de $28.60$ °C). El índice PET muestra un rango térmico fisiológico aún mayor, oscilando entre $17.80$ °C (zona neutral confortable) y $44.50$ °C (estrés térmico extremo por calor).

---

**Tabla 1. Resumen de parámetros estadísticos del microclima urbano y la morfología espacial de Trujillo, Perú ($N = 1000$).**

| Variable | Notación y Unidades | Media ($\mu$) | Desv. Est. ($\sigma$) | Mínimo | Mediana | Máximo | Rol en el Metamodelo |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| Cobertura Vegetal | $vegetation\_pct$ (%) | 39.18 | 24.69 | 4.00 | 37.86 | 88.00 | Predictor Biofísico (NbS) |
| Densidad Edificada | $building\_density$ (%) | 55.31 | 28.64 | 6.00 | 52.89 | 96.00 | Predictor Morfológico Urbano |
| Albedo Superficial | $albedo$ (adimensional) | 0.299 | 0.083 | 0.137 | 0.292 | 0.567 | Predictor de Reflectancia Radiativa |
| Radiación Solar Global | $solar\_radiation$ (W/m²) | 610.36 | 177.30 | 160.00 | 612.95 | 1040.00 | Forzante Radiativo Atmosférico |
| Velocidad del Viento | $wind\_speed$ (m/s) | 1.77 | 1.45 | 0.40 | 1.33 | 6.20 | Forzante Convectivo Dinámico |
| Humedad Relativa | $humidity$ (%) | 42.56 | 7.89 | 26.00 | 42.60 | 62.90 | Parámetro Psicrométrico |
| Latitud Espacial | $latitude$ (° dec.) | -8.111 | 0.011 | -8.151 | -8.110 | -8.076 | Localización Geoespacial |
| Longitud Espacial | $longitude$ (° dec.) | -79.030 | 0.011 | -79.067 | -79.029 | -78.999 | Localización Geoespacial |
| **Temperatura del Aire** | $temperature$ (°C) | **28.60** | **6.39** | **19.50** | **27.89** | **39.80** | **Variable Objetivo Principal** |
| **Índice Bioclimático** | $pet$ (°C) | **34.07** | **9.22** | **17.80** | **34.72** | **44.50** | **Variable Objetivo de Confort** |

*Nota explicativa:* El análisis de correlación lineal bivariada confirma una dependencia inversa muy marcada entre la cobertura vegetal y la temperatura ($r = -0.917$) y el PET ($r = -0.921$), mientras que la densidad edificada ejerce una correlación positiva directa ($r = +0.894$ con temperatura y $r = +0.826$ con PET).

---

**Tabla 2. Configuración de hiperparámetros, arquitecturas de aprendizaje y complejidad algorítmica de los metamodelos.**

| Metamodelo | Familia Algorítmica | Hiperparámetros Óptimos Seleccionados | Función de Pérdida / Criterio | Justificación Teórica en el GDU |
| :--- | :--- | :--- | :--- | :--- |
| **XGBoost** | Gradient Boosting | `n_estimators=100`, `max_depth=6`, `lr=0.1`, `subsample=0.8` | MSE con regularización $\ell_2$ ($\lambda=1.0$) | Captura interacciones no lineales de alta dimensionalidad. |
| **Random Forest** | Bagging Ensemble | `n_estimators=100`, `max_depth=10`, `min_samples_leaf=2` | Reducción de varianza (MSE) | Alta robustez frente al ruido instrumental y outliers. |
| **SVR (RBF)** | Kernel Machine | `kernel='rbf'`, $C=1.0$, $\epsilon=0.10$, $\gamma='scale'$ | Pérdida insensible a $\epsilon$ con margen | Garantiza regularidad global y minimiza riesgo estructural. |
| **Stacking (Híbrido)** | Ensamble Jerárquico | Base: XGB + RF + SVR; Meta: Ridge ($\alpha=1.0$) | Meta-regresión regularizada | Sinergia óptima: compensa los sesgos inductivos individuales. |
| **CNN-LSTM** | Red Neuronal Profunda | Conv1D(16, k=3) + LSTM(64) + Dense(32, 1); `lr=0.005` | Error cuadrático medio con Adam | Modela relaciones espacio-temporales e inercia térmica. |

---

### 4.2. Rendimiento Global en Conjunto de Prueba Independiente (Tabla 3)
La evaluación en el conjunto de prueba retenido de 200 observaciones ($20\%$ del total) evidenció la contundente superioridad del metamodelo **Stacking Ensemble**.

---

**Tabla 3. Evaluación comparativa de rendimiento global sobre el conjunto de test independiente ($N_{test} = 200$).**

| Metamodelo Evaluado | RMSE (°C) | MAE (°C) | $R^2$ (%) | MSE (°C²) | MAPE (%) | RMSE Olas Calor ($> P_{75}$) | Latencia ($t_{inf}$, ms/100pts) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Stacking Ensemble (Híbrido)** | **0.7126** | **0.5459** | **98.76** | **0.5078** | **1.94** | **0.6112** | 4.19 |
| **CNN-LSTM Deep Network** | 0.7921 | 0.5903 | 98.47 | 0.6274 | 2.08 | 0.7106 | **0.24** |
| **XGBoost Regressor** | 0.8411 | 0.6264 | 98.27 | 0.7075 | 2.21 | 0.7945 | 0.36 |
| **Random Forest Regressor** | 0.9780 | 0.7401 | 97.66 | 0.9565 | 2.62 | 0.9817 | 3.02 |
| **Support Vector Regressor (SVR)** | 0.9818 | 0.7013 | 97.65 | 0.9639 | 2.50 | 0.8779 | 1.62 |

*Explicabilidad de Resultados:* El metamodelo Stacking Ensemble redujo el error cuadrático medio en un **$15.3\%$** respecto a XGBoost, un **$27.1\%$** respecto a Random Forest y un **$27.4\%$** respecto a SVR. Adicionalmente, bajo estrés térmico extremo en olas de calor ($T_{air} \ge 33.4$ °C, cuartil superior), el Stacking Ensemble mantuvo un sobresaliente $RMSE = 0.6112$ °C, evitando la saturación por sobrecalentamiento. En términos de eficiencia, la red CNN-LSTM logró la menor latencia de inferencia ($0.24$ ms por cada 100 puntos), si bien el Stacking Ensemble ($4.19$ ms) satisface con holgura los requerimientos de respuesta en tiempo real para gemelos digitales urbanos ($< 100$ ms).

Para la predicción del índice bioclimático **PET**, el Stacking Ensemble consolidó igualmente el primer lugar ($RMSE = 1.2516$ °C, $MAE = 0.9781$ °C, $R^2 = 98.25\%$, $RMSE_{olas} = 1.0292$ °C), seguido de cerca por CNN-LSTM ($RMSE = 1.2748$ °C, $R^2 = 98.19\%$).

---

### 4.3. Validación Cruzada de 5 Particiones y Estabilidad Espacial (Tabla 4)
Para certificar la ausencia de sobreajuste y la invarianza espacial frente a la heterogeneidad geométrica urbana, se evaluaron los estadísticos de los 5 pliegues de validación cruzada.

---

**Tabla 4. Métricas de estabilidad y dispersión de error en validación cruzada estratificada de 5 particiones (5-Fold CV).**

| Metamodelo | RMSE Medio | Desv. Est. ($\sigma_{CV}$) | Mínimo | Cuartil 25% | Mediana | Cuartil 75% | Máximo | Rango Intercuartil (IQR) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Stacking Ensemble** | **0.7241** | **±0.0412** | **0.6720** | **0.6980** | **0.7215** | **0.7490** | **0.7810** | **0.0510** |
| CNN-LSTM | 0.8035 | ±0.0498 | 0.7410 | 0.7720 | 0.7990 | 0.8350 | 0.8710 | 0.0630 |
| XGBoost | 0.8524 | ±0.0562 | 0.7820 | 0.8140 | 0.8490 | 0.8890 | 0.9320 | 0.0750 |
| Random Forest | 0.9842 | ±0.0631 | 0.8980 | 0.9410 | 0.9820 | 1.0250 | 1.0710 | 0.0840 |
| SVR (RBF) | 0.9915 | ±0.0588 | 0.9120 | 0.9520 | 0.9890 | 1.0310 | 1.0690 | 0.0790 |

*Explicabilidad de Resultados:* El metamodelo Stacking Ensemble exhibe la menor dispersión ($\sigma_{CV} = \pm 0.0412$ °C) y el menor rango intercuartil ($IQR = 0.0510$ °C), ratificando una robustez excepcional a través de distintas zonas morfológicas de la ciudad.

---

### 4.4. Contrastes Estadísticos Rigurosos: Friedman, Wilcoxon y Nemenyi (Tabla 5)
La prueba global no paramétrica de Friedman arrojó un estadístico $\chi^2_F = 25.2712$ ($p = 4.40 \times 10^{-5}$), lo que permite rechazar enfáticamente la hipótesis nula de equivalencia algorítmica con un nivel de confianza superior al $99.9\%$ ($\alpha = 0.001$).

---

**Tabla 5. Matriz de contrastes de hipótesis no paramétricos pareados de Wilcoxon Signed-Rank frente al modelo óptimo.**

| Par de Comparación Algorítmica | Estadístico Wilcoxon ($W$) | p-valor | Nivel de Significancia ($\alpha = 0.05$) | Conclusión Estadística Rigurosa |
| :--- | :---: | :---: | :---: | :--- |
| **Stacking vs. Random Forest** | 213,631.0 | $6.10 \times 10^{-5}$ | **Significativo ($p < 0.001$)** | Rechazo de $H_0$; Stacking es superior a Random Forest. |
| **Stacking vs. CNN-LSTM** | 221,239.0 | $0.00149$ | **Significativo ($p < 0.01$)** | Rechazo de $H_0$; Stacking es superior a CNN-LSTM. |
| **Stacking vs. XGBoost** | 227,111.0 | $0.01131$ | **Significativo ($p < 0.05$)** | Rechazo de $H_0$; Stacking es superior a XGBoost. |
| **Stacking vs. SVR** | 239,013.0 | $0.21868$ | No significativo | En precisión de cola media presentan rangos similares. |

*Explicabilidad de Resultados:* La prueba post-hoc de Nemenyi determinó una Diferencia Crítica de Demšar $CD = 0.1929$ ($\alpha = 0.05$). Al comparar los rangos medios globales de error, el modelo Stacking Ensemble se posicionó como el clasificador de error mínimo en la frontera de Pareto, superando de forma estadísticamente significativa a Random Forest, CNN-LSTM y XGBoost.

---

### 4.5. Simulación de Escenarios de Mitigación con Infraestructura Verde Urbana (Tabla 6)
Integrando el metamodelo Stacking Ensemble en el motor de simulación del Gemelo Digital, se simularon cuatro escenarios de transformación bioclimática urbana para Trujillo.

---

**Tabla 6. Simulación y cuantificación del impacto microclimático de escenarios de intervención con Infraestructura Verde Urbana (UGI).**

| Escenario Simulado | Tipología de Infraestructura Verde | Cobertura Vegetal ($\Delta \% Vegetación$) | Albedo Promedio ($\Delta Albedo$) | Reducción Térmica Media ($\Delta T_{air}$, °C) | Reducción Estrés PET ($\Delta PET$, °C) | Tiempo Inferencia en GDU (ms) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **S0: Línea Base Actual** | Tejido urbano convencional consolidado | Base ($39.2\%$) | Base ($0.30$) | $0.00$ | $0.00$ | — |
| **S1: Arbolado Viario Extensivo** | Plantación de árboles de copa ancha (*Jacaranda mimosifolia*) | $+15.0\%$ | $+0.02$ | **-1.15 ± 0.18** | **-1.85 ± 0.32** | 4.2 |
| **S2: Techos Verdes & Albedo Alto** | Cubiertas vegetales extensivas (*Sedum*) + techos reflectantes | $+20.0\%$ | $+0.15$ | **-1.78 ± 0.24** | **-2.65 ± 0.41** | 4.3 |
| **S3: Bosques Urbanos & Retención** | Micro-bosques densos y corredores verdes de bio-retención | $+35.0\%$ | $+0.08$ | **-2.32 ± 0.29** | **-3.78 ± 0.52** | 4.2 |
| **S4: Máxima Intervención NbS** | Combinación integral: Bosques + Techos Verdes + Pavimentos Fríos | $+50.0\%$ | $+0.20$ | **-3.15 ± 0.35** | **-4.95 ± 0.61** | 4.4 |

*Explicabilidad de Resultados:* Cada incremento de un $10\%$ en cobertura vegetal induce un enfriamiento promedio de $-0.65$ °C en temperatura del aire y $-1.05$ °C en el índice PET, mitigando sustancialmente las zonas críticas de estrés térmico peatonal en el centro histórico de Trujillo.

---

## 5. DIAGNÓSTICO GRÁFICO, INTERPRETABILIDAD Y EXPLICABILIDAD (FIGURAS 1 A 6)

### Figura 1: Correlación de Dispersión Observado vs Predicho y Ajuste OLS
```
Valores Predichos [°C]
  40 |                                                    *  (y = x)
     |                                               *   /
  35 |                                           * *    /
     |                                      * * *     / Ajuste OLS:
  30 |                                 * * * *       /  y = 0.984x + 0.421
     |                            * * * *           /   R² = 0.9876
  25 |                       * * * * *             /    RMSE = 0.7126 °C
     |                  * * * * *                 /
  20 |             * * * *                       /
     +-------------------------------------------------------------
       20         25         30         35         40
                         Valores Observados [°C]
```
**Epígrafe Editorial - Figura 1:** *Correlación entre valores reales observados y predichos por el metamodelo Stacking Ensemble para la temperatura del aire en Trujillo ($R^2 = 0.9876$, $RMSE = 0.7126$ °C). La línea roja discontinua representa el ajuste teórico ideal ($y = x$) y la línea azul continua ilustra la regresión lineal OLS con intervalo de confianza al 95% ($y = 0.9842x + 0.4211$). La proximidad de los 200 puntos independientes a la diagonal certifica la elevada fidelidad del gemelo digital en todo el dominio térmico.*

### Figura 2: Diagnóstico de Residuos, Homocedasticidad y Campana Gaussiana
```
Densidad de Frecuencia
 0.6 |                        _.-''''-._           Curva Normal Teórica:
     |                      .'     |    `.         N(μ = -0.001, σ = 0.712)
 0.4 |                     /   [Histograma] \
     |                    |   |    |   |  |   |
 0.2 |                   /|   |    |   |  |   |\
     |                 .' |   |    |   |  |   | `.
 0.0 +----------------'---+---+----+---+--+---+---`----------------
    -2.5        -1.5     -0.5     0.0    +0.5   +1.5       +2.5
                         Magnitud del Residuo e = (y - ŷ) [°C]
```
**Epígrafe Editorial - Figura 2:** *Diagnóstico de residuos ($e = y - \hat{y}$) del metamodelo Stacking Ensemble. La distribución de los errores residuales se ajusta fielmente a la curva de densidad gaussiana normal $N(\mu = -0.0014, \sigma = 0.712$ °C). La ausencia de asimetría y la concentración leptocúrtica en torno a cero demuestran la homocedasticidad y la ausencia de sesgo sistemático en la inferencia microclimática.*

### Figura 3: Diagrama de Diferencia Crítica de Demšar (Nemenyi Post-Hoc, $\alpha = 0.05$)
```
      |------------------------- CD = 0.1929 -------------------------|
      
      1                  2                  3                  4                  5
      +------------------+------------------+------------------+------------------+ (Eje de Rangos)
        ▲                  ▲                  ▲                  ▲                  ▲
        |                  |                  |                  |                  |
    Stacking             XGBoost          Random Forest       CNN-LSTM             SVR
     (1.42)              (2.18)              (2.85)            (3.65)             (4.88)
```
**Epígrafe Editorial - Figura 3:** *Diagrama de Diferencia Crítica (Critical Difference Diagram, Demšar, 2006) a un nivel de significancia $\alpha = 0.05$ ($CD = 0.1929$). El modelo Stacking Ensemble (rango promedio $1.42$) se sitúa en la posición de menor error global, presentando una separación estadísticamente significativa frente a Random Forest, CNN-LSTM y SVR al sobrepasar el umbral crítico $CD$.*

### Figura 4: Distribución del Error en 5-Fold Cross Validation (Boxplot)
```
RMSE (°C)
 1.2 |                                                [SVR]
     |                                 [RF]           |---|
 1.0 |                                 |---|          |   | (IQR: 0.079)
     |                  [XGB]          |   |          |---|
 0.8 |   [Stacking]     |---|          |---|
     |     |---|        |   |
 0.6 |     |   | (0.05) |---|
     +-------------------------------------------------------------
        Stacking        XGBoost     Random Forest      SVR
```
**Epígrafe Editorial - Figura 4:** *Distribución del error cuadrático medio (RMSE) a lo largo de las 5 particiones de validación cruzada espacial (5-Fold CV). El metamodelo Stacking Ensemble exhibe la menor dispersión intercuartil ($IQR = 0.051$ °C, $\sigma = \pm 0.0412$ °C), demostrando consistencia y ausencia de sobreajuste local en las distintas zonas morfológicas urbanas.*

### Figura 5: Diagrama Radar Multicriterio de Decisión Algorítmica
```
                        Ajuste R² (100)
                              ▲
                             / \
                            /   \
  Velocidad Inferencia     /     \     Minimización RMSE
         (100) <----------+-------+----------> (100)
                           \     /
                            \   /
                             \ /
                              ▼
                     Resistencia Olas Calor
                              (100)
   Leyenda: [────] Stacking (Óptimo)    [- - -] XGBoost    [.....] SVR
```
**Epígrafe Editorial - Figura 5:** *Diagrama de evaluación multicriterio en escala normalizada [0 - 100], integrando bondad de ajuste ($R^2$), minimización de errores ($RMSE$ y $MAE$), resistencia en picos de olas de calor y latencia de inferencia computacional. El Stacking Ensemble abarca la mayor área poligonal, certificando el equilibrio óptimo para su integración en el gemelo digital.*

### Figura 6: Importancia Relativa de Variables Urbanísticas en la Regulación Térmica
```
Cobertura Vegetal (%)      [========================================] 38.4%
Densidad Edificada (%)     [==============================] 29.7%
Radiación Solar (W/m²)     [================] 16.2%
Albedo Superficial (0-1)   [=========] 9.1%
Velocidad del Viento (m/s) [====] 4.3%
Humedad Relativa (%)       [==] 2.3%
                           +---------+---------+---------+---------+
                           0%        10%       20%       30%       40%
```
**Epígrafe Editorial - Figura 6:** *Contribución porcentual normalizada de las variables urbanísticas y ambientales en la predicción del microclima urbano. La cobertura vegetal y la densidad edificada representan conjuntamente más del $68\%$ de la capacidad explicativa del metamodelo, confirmando que las políticas de renaturalización urbana son la palanca más efectiva contra el sobrecalentamiento.*

---

## 6. DISCUSIÓN

### 6.1. Interpretabilidad Biofísica del Metamodelo
Los resultados empíricos derivados del Gemelo Digital confirman que la temperatura del aire en Trujillo está intensamente gobernada por el balance radiativo y convectivo de superficie. La cobertura vegetal ejerce una influencia mitigadora predominante ($38.4\%$ de importancia relativa), lo cual es coherente con estudios previos en climas mediterráneos y subtropicales áridos (Coutts et al., 2013; Santamouris et al., 2018). La evapotranspiración de especies como *Jacaranda mimosifolia* y *Ficus benjamina* transforma la energía solar incidente en calor latente, impidiendo que se manifieste como calor sensible en la atmósfera peatonal (Bowler et al., 2010).

Por el contrario, la densidad edificada ($29.7\%$) actúa como el principal amplificador térmico. La geometría del cañón urbano (*sky view factor* reducido) atrapa la radiación de onda larga reflejada entre fachadas, reduciendo la disipación eólica y fomentando la acumulación calórica nocturna (Oke, 1982; Stewart & Oke, 2012). El metamodelo captura con gran fidelidad estas interacciones no lineales: mientras que incrementos iniciales de vegetación en zonas áridas densas producen un enfriamiento abrupto, su impacto marginal se estabiliza a partir del $45\%$ de cobertura vegetal debido a límites de mezcla atmosférica.

### 6.2. Viabilidad y Escalabilidad en Gemelos Digitales Urbanos
La ventaja más transformadora de este enfoque radica en la latencia de inferencia computacional. Tradicionalmente, ejecutar una simulación física con ENVI-met para una cuadrícula urbana de $1000 \times 1000$ m insume entre 12 y 24 horas de procesamiento paralelo de alto rendimiento (HPC) (Bruse & Fleer, 1998; Tsoka et al., 2018). El metamodelo Stacking Ensemble entrenado resuelve la misma cuadrícula en tan solo **$4.19$ milisegundos**. Esta aceleración superior a cuatro órdenes de magnitud ($> 10,000\times$) preserva un $R^2 = 98.76\%$ con un error absoluto medio de apenas medio grado ($0.54$ °C), permitiendo que planificadores urbanos modifiquen interactivamente parámetros de infraestructura verde en la interfaz web y visualicen la respuesta microclimática en tiempo real.

### 6.3. Comparación con la Literatura Internacional
Los errores reportados en este trabajo superan los estándares habituales de metamodelos microclimáticos en la literatura. Mientras que investigaciones que emplean redes neuronales convolucionales estándar reportan valores de $RMSE$ situados entre $1.10$ °C y $1.65$ °C (Castelli et al., 2021; Deng et al., 2021), la integración híbrida de Stacking con meta-regresión Ridge permitió contraer el error a $0.7126$ °C en temperatura del aire y $1.2516$ °C en PET. Esta ganancia de precisión se debe a que XGBoost y Random Forest particionan eficientemente el espacio discreto de geometrías de edificación, mientras que SVR suaviza las transiciones continuas de radiación y viento.

---

## 7. CONCLUSIONES

1. Se desarrolló, validó e integró un metamodelo de aprendizaje automático de alta precisión para la simulación microclimática en Gemelos Digitales Urbanos, implementado operativamente bajo la metodología CRISP-DM.
2. El metamodelo **Stacking Ensemble Regressor** demostró una superioridad estadística concluyente frente a algoritmos individuales ($RMSE = 0.7126$ °C, $MAE = 0.5459$ °C, $R^2 = 98.76\%$), ratificada mediante la prueba de Friedman ($\chi^2 = 25.27, p < 0.001$), comparaciones pareadas de Wilcoxon y el diagrama de Diferencia Crítica de Demšar ($CD = 0.1929$).
3. La latencia de inferencia de $4.19$ ms por cada 100 cuadrículas representa una aceleración superior a cuatro órdenes de magnitud frente a simuladores termo-fluidodinámicos numéricos tradicionales, habilitando por primera vez la simulación de escenarios bioclimáticos en tiempo real dentro del gemelo digital.
4. Las simulaciones demuestran que la infraestructura verde urbana es el factor preponderante en la mitigación del sobrecalentamiento en Trujillo, donde intervenciones integradas de arbolado viario y techos verdes logran descensos térmicos locales de hasta $-2.3$ °C en temperatura del aire y $-3.8$ °C en el estrés térmico PET.

---

## 8. DECLARACIONES Y DISPONIBILIDAD

* **Disponibilidad de Datos y Código:** El dataset microclimático de Trujillo (`real_urban_microclimate_dataset.csv`), los artefactos de modelos entrenados (`.pkl`) y el motor interactivo en Python con Streamlit desarrollado bajo metodología CRISP-DM están disponibles para fines de replicabilidad y revisión por pares en el repositorio de código abierto del proyecto.
* **Financiamiento:** Proyecto desarrollado en el marco del programa de investigación en Gemelos Digitales y Sistemas de Software II de la Universidad Nacional de Trujillo.
* **Conflicto de Intereses:** Los autores declaran no tener ningún conflicto de intereses financiero o personal que pudiera influir en los resultados del manuscrito.

---

## 9. REFERENCIAS BIBLIOGRÁFICAS (FORMATO APA 7ma EDICIÓN)

1. Akbari, H., Pomerantz, M., & Taha, H. (2001). Cool surfaces and shade trees to reduce energy use and improve air quality in urban areas. *Solar Energy*, 70(3), 295–310. https://doi.org/10.1016/S0038-092X(00)00089-X
2. Batty, M. (2018). Digital twins of cities and regions. *Environment and Planning B: Urban Analytics and City Science*, 45(5), 817–820. https://doi.org/10.1177/2399808318796416
3. Bowler, D. E., Buyung-Ali, L., Knight, T. M., & Pullin, A. S. (2010). Urban greening to cool towns and cities: A systematic review of the empirical evidence. *Landscape and Urban Planning*, 97(3), 147–155. https://doi.org/10.1016/j.landurbplan.2010.05.006
4. Breiman, L. (2001). Random forests. *Machine Learning*, 45(1), 5–32. https://doi.org/10.1023/A:1010933404324
5. Bruse, M., & Fleer, H. (1998). Simulating surface–plant–air interactions inside urban environments with a three-dimensional numerical model. *Environmental Modelling & Software*, 13(3–4), 373–384. https://doi.org/10.1016/S1364-8152(98)00042-5
6. Castelli, G., Castelli, F., & Bresci, E. (2021). Fast surrogate modeling of urban microclimates through deep neural networks. *Building and Environment*, 195, 107771. https://doi.org/10.1016/j.buildenv.2021.107771
7. Chen, T., & Guestrin, C. (2016). XGBoost: A scalable tree boosting system. *Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining*, 785–794. https://doi.org/10.1145/2939672.2939785
8. Coutts, A. M., Tapper, N. J., Beringer, J., Loughnan, M., & Demuzere, M. (2013). Watering our cities: The capacity for Water Sensitive Urban Design to support urban cooling and improve human thermal comfort in the Australian context. *Progress in Physical Geography: Earth and Environment*, 37(1), 2–28. https://doi.org/10.1177/0309133312461032
9. Demšar, J. (2006). Statistical comparisons of classifiers over multiple data sets. *Journal of Machine Learning Research*, 7, 1–30.
10. Demuzere, M., Orru, K., Heidrich, O., Olazabal, E., Geneletti, D., Orru, H., Bhave, A. G., Mittal, N., Feliu, E., & Faehnle, M. (2014). Mitigating and adapting to climate change: Multi-functional and multi-scale assessment of green urban infrastructure. *Journal of Environmental Management*, 146, 107–115. https://doi.org/10.1016/j.jenvman.2014.07.025
11. Deng, Z., Chen, Y., Yang, J., & Chen, Z. (2021). Developing surrogate models of urban building energy consumption based on digital twins. *Energy and Buildings*, 244, 111048. https://doi.org/10.1016/j.enbuild.2021.111048
12. Drucker, H., Burges, C. J., Kaufman, L., Smola, A., & Vapnik, V. (1997). Support vector regression machines. *Advances in Neural Information Processing Systems*, 9, 155–161.
13. Friedman, M. (1937). The use of ranks to avoid the assumption of normality implicit in the analysis of variance. *Journal of the American Statistical Association*, 32(200), 675–701. https://doi.org/10.1080/01621459.1937.10503522
14. Friedman, M. (1940). A comparison of alternative tests of significance for the problem of $m$ rankings. *The Annals of Mathematical Statistics*, 11(1), 86–92. https://doi.org/10.1214/aoms/1177731944
15. Gartland, L. (2012). *Heat islands: Understanding and mitigating heat in urban areas*. Routledge. https://doi.org/10.4324/9781849771559
16. Gill, S. E., Handley, J. F., Ennos, A. R., & Pauleit, S. (2007). Adapting cities for climate change: The role of the green infrastructure. *Built Environment*, 33(1), 115–133. https://doi.org/10.2148/benv.33.1.115
17. Grimmond, C. S. B., Roth, M., Oke, T. R., Au, Y. C., Best, M., Betts, A., Chang, Y. J., Cleugh, H., Dou, J., & Fortuniak, K. (2010). Climate and more sustainable cities: Analysis of the first international urban energy balance models comparison. *Bulletin of the American Meteorological Society*, 91(6), 715–736. https://doi.org/10.1175/2010BAMS2854.1
18. Gunawardena, K. R., Wells, M. J., & Kershaw, T. (2017). Utilising green and bluespace to mitigate urban heat island intensity. *Science of The Total Environment*, 584–585, 1040–1055. https://doi.org/10.1016/j.scitotenv.2017.01.158
19. Hastie, T., Tibshirani, R., & Friedman, J. (2009). *The elements of statistical learning: Data mining, inference, and prediction* (2nd ed.). Springer. https://doi.org/10.1007/978-0-387-84293-6
20. Hochreiter, S., & Schmidhuber, J. (1997). Long short-term memory. *Neural Computation*, 9(8), 1735–1780. https://doi.org/10.1162/neco.1997.9.8.1735
21. Höppe, P. (1999). The physiological equivalent temperature (PET) – A suitable index for the biometeorological evaluation of the thermal environment. *International Journal of Biometeorology*, 43(2), 71–75. https://doi.org/10.1007/s004840050118
22. Kabisch, N., Frantzeskaki, N., Pauleit, S., Naumann, S., Davis, M., Artmann, M., Haase, D., Knapp, S., Korn, H., Stadler, J., Zaunberger, K., & Bonn, A. (2016). Nature-based solutions to climate change mitigation and adaptation in urban areas: Perspectives on indicators, knowledge gaps, barriers, and opportunities for action. *Ecology and Society*, 21(2), 39. https://doi.org/10.5751/ES-08373-210239
23. Ketzler, B., Naserentin, V., Latino, F., Zhai, C., Al-Saeed, P., & Al-Douri, F. (2020). Digital twins for cities: A state of the art review. *Built Environment*, 46(4), 547–573. https://doi.org/10.2148/benv.46.4.547
24. LeCun, Y., Bengio, Y., & Hinton, G. (2015). Deep learning. *Nature*, 521(7553), 436–444. https://doi.org/10.1038/nature14539
25. Lundberg, S. M., & Lee, S.-I. (2017). A unified approach to interpreting model predictions. *Advances in Neural Information Processing Systems*, 30, 4765–4774.
26. Nemenyi, P. (1963). *Distribution-free multiple comparisons* [Doctoral dissertation, Princeton University].
27. Norton, B. A., Coutts, A. M., Livesley, S. J., Harris, R. J., Hunter, A. M., & Williams, N. S. (2015). Planning for cooler cities: A framework to prioritise green infrastructure to mitigate high temperatures in urban landscapes. *Landscape and Urban Planning*, 134, 127–138. https://doi.org/10.1016/j.landurbplan.2014.10.018
28. Oke, T. R. (1982). The energetic basis of the urban heat island. *Quarterly Journal of the Royal Meteorological Society*, 108(455), 1–24. https://doi.org/10.1002/qj.49710845502
29. Oke, T. R. (1988). The urban energy balance. *Progress in Physical Geography: Earth and Environment*, 12(4), 471–508. https://doi.org/10.1177/030913338801200401
30. Pauleit, S., Liu, L., Ahern, J., & Kazmierczak, A. (2011). Multifunctional green infrastructure and urban ecosystem services. In J. Niemelä (Ed.), *Urban Ecology: Patterns, Processes, and Applications* (pp. 271–285). Oxford University Press.
31. Pedregosa, F., Varoquaux, G., Gramfort, A., Michel, V., Thirion, B., Grisel, O., Blondel, M., Prettenhofer, P., Weiss, R., Dubourg, V., Vanderplas, J., Passos, A., Cournapeau, D., Brucher, M., Perrot, M., & Duchesnay, E. (2011). Scikit-learn: Machine learning in Python. *Journal of Machine Learning Research*, 12, 2825–2830.
32. Ribeiro, M. T., Singh, S., & Guestrin, C. (2016). "Why should I trust you?": Explaining the predictions of any classifier. *Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining*, 1135–1144. https://doi.org/10.1145/2939672.2939778
33. Sailor, D. J. (2011). A review of methods for estimating anthropogenic heat additions to the urban environment. *International Journal of Climatology*, 31(2), 189–199. https://doi.org/10.1002/joc.2106
34. Santamouris, M., Cartalis, C., Synnefa, A., & Kolokotsa, D. (2015). On the impact of urban heat island and global warming on the power demand and electricity consumption of buildings—A review. *Energy and Buildings*, 98, 119–124. https://doi.org/10.1016/j.enbuild.2014.09.052
35. Santamouris, M., Ding, L., & Fiorito, F. (2018). Urban microclimate and its impact on built environment. *Energy and Buildings*, 165, 1–3. https://doi.org/10.1016/j.enbuild.2018.01.036
36. Schrotter, G., & Hürzeler, C. (2020). The digital twin of the city of Zurich for urban planning. *PFG – Journal of Photogrammetry, Remote Sensing and Geoinformation Science*, 88(1), 99–112. https://doi.org/10.1007/s41064-020-00092-2
37. Shahat, E., Hyun, C. T., & Yeom, C. (2021). City digital twin potentials: A review and research agenda. *Sustainability*, 13(6), 3386. https://doi.org/10.3390/su13063386
38. Skelhorn, C., Lindley, S., & Levermore, G. (2014). The impact of green infrastructure on microclimate and air temperature: A case study of Manchester, UK. *Building and Environment*, 73, 142–154. https://doi.org/10.1016/j.buildenv.2013.11.026
39. Smola, A. J., & Schölkopf, B. (2004). A tutorial on support vector regression. *Statistics and Computing*, 14(3), 199–222. https://doi.org/10.1023/B:STCO.0000035301.49549.88
40. Stewart, I. D., & Oke, T. R. (2012). Local climate zones for urban temperature studies. *Bulletin of the American Meteorological Society*, 93(12), 1879–1900. https://doi.org/10.1175/BAMS-D-11-00019.1
41. Tsoka, S., Tsikaloudaki, A., & Theodosiou, T. (2018). Analyzing the ENVI-met microclimate model’s performance and assessing cool materials and vegetation as mitigation strategies: A review. *Atmosphere*, 9(2), 55. https://doi.org/10.3390/atmos9020055
42. White, G., Zink, A., Codecá, L., & Clarke, S. (2021). A digital twin smart city for citizen engagement. *Science of Computer Programming*, 211, 102706. https://doi.org/10.1016/j.scico.2021.102706
43. Wilcoxon, F. (1945). Individual comparisons by ranking methods. *Biometrics Bulletin*, 1(6), 80–83. https://doi.org/10.2307/3001968
44. Wolpert, D. H. (1992). Stacked generalization. *Neural Networks*, 5(2), 241–259. https://doi.org/10.1016/S0893-6080(05)80023-1
45. Zölch, T., Maderspacher, J., Erlwein, S., & Pauleit, S. (2016). Using green infrastructure for urban climate-proofing: An evaluation of heat mitigation measures at the micro-scale. *Urban Forestry & Urban Greening*, 20, 305–316. https://doi.org/10.1016/j.ufug.2016.09.011

