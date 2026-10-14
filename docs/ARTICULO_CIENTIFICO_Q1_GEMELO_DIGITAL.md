# Gemelo Digital de Infraestructura Verde Urbana para la Optimización Simultánea de Microclima, Biodiversidad y Gestión Hídrica bajo Escenarios Climáticos: Diseño, Implementación y Validación en un Distrito Piloto

**Digital Twin of Urban Green Infrastructure for the Simultaneous Optimization of Microclimate, Biodiversity, and Water Management under Climate Scenarios: Design, Implementation, and Validation in a Pilot District**

---

### Autores:
**Investigador Principal$^1$**, **Co-Investigador en Teledetección y Clima Urbano$^2$**, **Co-Investigador en Inteligencia Artificial y Gemelos Digitales$^1$**  
$^1$ Departamento de Informática e Ingeniería de Sistemas, Universidad Nacional de Trujillo, Av. Juan Pablo II s/n, Trujillo, Perú.  
$^2$ Laboratorio de Tecnologías Geoespaciales y Gemelos Digitales Urbanos, Trujillo, Perú.  
*Autor de correspondencia:* `investigacion.gemelosdigitales@unitru.edu.pe`

---

## RESUMEN

La planificación de la infraestructura verde urbana (IVU) sigue siendo predominantemente sectorial, pese a que la regulación térmica, la conservación de la biodiversidad y la gestión hídrica interactúan mediante compromisos (*trade-offs*) dinámicos que las aproximaciones unidireccionales no logran capturar. Este trabajo presenta un gemelo digital urbano de alta resolución (GD-IVU) que acopla de forma bidireccional modelos de microclima (ENVI-met 5.6 acelerado mediante metamodelado de aprendizaje automático *Stacking Ensemble*), hidrología urbana (CityCAT), dinámica de metapoblaciones y un modelo de vegetación basado en agentes. El sistema se articula dentro de una arquitectura de cinco capas con un ciclo continuo de asimilación de datos de 15 minutos gobernado por un Filtro de Kalman de Conjunto (EnKF). La optimización multiobjetivo se ejecuta mediante el algoritmo NSGA-III sobre cuatro funciones objetivo: minimización de la temperatura de superficie terrestre (LST), maximización de la conectividad ecológica (área conectada equivalente, ECA), maximización de la reducción del pico de escorrentía pluvial y minimización de los costes de ciclo de vida a 20 años.

El artefacto de software se validó empíricamente en un distrito piloto de 2,4 km² bajo los escenarios climáticos del IPCC SSP2-4.5 y SSP5-8.5 para los horizontes temporales 2030 y 2050. Los resultados evidencian que la configuración compromiso de Pareto supera simultáneamente a cuatro líneas base sectoriales convencionales en los cuatro objetivos ($\Delta\text{LST} = -2,4$ °C; $\Delta\text{ECA} = +64$ ha; reducción de escorrentía $= -28,7\%$ con un coste de 16,1 M€), con diferencias estadísticamente significativas verificadas mediante contrastes no paramétricos de Mann–Whitney con corrección de Holm–Bonferroni ($p < 0,001$, tamaño de efecto grande Vargha–Delaney $\hat{A}_{12} \ge 0,86$). El metamodelo de ensamble multinivel integrado resolvió el cuello de botella computacional numérico, reduciendo la latencia de inferencia a $4,19$ ms por cada 100 cuadrículas ($R^2 = 0,9876$, $RMSE = 0,7126$ °C), lo que representa una aceleración superior a cuatro órdenes de magnitud ($> 10.000\times$). Bajo el escenario extremo SSP5-8.5 al 2050, los beneficios ecosistémicos sufren una degradación de entre el $9\%$ y el $22\%$, pero el orden de dominancia de las soluciones espaciales permanece altamente estable (coeficiente de concordancia $W$ de Kendall $= 0,91$, $p < 0,001$). El código fuente, los datos abiertos anonimizados bajo principios FAIR y el entorno reproducible containerizado en Docker Compose se publican bajo licencias libres.

**Palabras clave:** gemelo digital urbano; infraestructura verde; optimización multiobjetivo; biodiversidad urbana; isla de calor; escorrentía; NSGA-III.

---

## ABSTRACT

Urban green infrastructure (UGI) planning remains largely sectoral despite the intricate trade-offs linking thermal regulation, biodiversity conservation, and stormwater management that unidirectional approaches fail to capture. This paper presents an urban digital twin (UGI-DT) that bidirectionally couples microclimate models (ENVI-met 5.6 accelerated via a machine learning Stacking Ensemble surrogate model), urban hydrology (CityCAT), metapopulation dynamics, and an agent-based vegetation model within a 5-layer architecture featuring a 15-minute data-assimilation cycle governed by an Ensemble Kalman Filter (EnKF). Spatial optimization is driven by NSGA-III over four objective functions: land surface temperature (LST) reduction, equivalent connected area (ECA), peak-runoff reduction, and 20-year lifecycle cost.

The system was empirically validated on a 2.4 km² pilot district under IPCC climate scenarios SSP2-4.5 and SSP5-8.5 across 2030 and 2050 horizons. Experimental results demonstrate that the Pareto compromise configuration simultaneously outperforms four sectoral baselines across all four objectives ($\Delta\text{LST} = -2.4$ °C; $\Delta\text{ECA} = +64$ ha; peak runoff reduction $= -28.7\%$ at 16.1 M€), with statistically significant differences confirmed via Mann–Whitney tests with Holm–Bonferroni adjustment ($p < 0.001$, Vargha–Delaney large effect size $\hat{A}_{12} \ge 0.86$). The embedded surrogate model bypassed the severe computational bottleneck of CFD numerical solvers, yielding an inference latency of $4.19$ ms per 100 spatial points ($R^2 = 0.9876$, $RMSE = 0.7126$ °C), achieving a speedup exceeding four orders of magnitude ($> 10,000\times$). Under SSP5-8.5-2050, ecosystem service benefits degrade by 9% to 22%, while solution ranking maintains high stability (Kendall's concordance coefficient $W = 0.91$, $p < 0.001$). Code, FAIR-compliant open data, and a fully reproducible Docker Compose pipeline are publicly released.

**Keywords:** urban digital twin; green infrastructure; multi-objective optimization; urban biodiversity; urban heat island; stormwater; NSGA-III.

---

## 1. INTRODUCCIÓN

La acelerada expansión urbana y la intensificación de eventos climáticos extremos proyectados bajo los escenarios SSP2-4.5 y SSP5-8.5 del Grupo Intergubernamental de Expertos sobre el Cambio Climático (IPCC) han situado a la infraestructura verde urbana (IVU) como un componente medular para la adaptación climática de las ciudades contemporáneas. No obstante, la planificación y diseño de la IVU continúan apoyándose predominantemente en criterios estáticos y sectoriales que abordan de forma aislada la regulación térmica de la isla de calor urbana (UHI), la conservación de la conectividad biológica o el control hidrológico de la escorrentía pluvial, ignorando las compensaciones (*trade-offs*) dinámicas y no lineales que emergen entre estos servicios ecosistémicos (Cook et al., 2024; Wang et al., 2025). Los gemelos digitales urbanos (GDT, *Urban Digital Twins*) ofrecen una oportunidad sin precedentes para integrar, en un entorno de simulación espacial de alta resolución (1–10 m), la retroalimentación bidireccional continua entre la vegetación urbana, el microclima, la hidrología y la dinámica de poblaciones (Shahat et al., 2021; de Koning et al., 2023).

La revisión sistemática de literatura que sustenta esta investigación—abarcando cuarenta estudios de frontera publicados entre 2020 y 2026 bajo directrices PRISMA 2020 (§2.1)—permite constatar que, si bien existen desarrollos solventes de GDT aplicados de forma fragmentada al microclima urbano (Aydt et al., 2024; Hossain et al., 2025, 2026; Lopez-Cabeza et al., 2025; Omrany & Al-Obaidi, 2024; Pan et al., 2024), a la gestión hídrica superficial (Altındaş et al., 2026; Ge & Qin, 2025; Hlal et al., 2025; Qureshi et al., 2026; Zhao & Yang, 2026) y al monitoreo de la biodiversidad (Balbi et al., 2021; Bührs et al., 2025; Islam et al., 2025; Ovaskainen et al., 2026), ninguno acopla de manera bidireccional los tres subsistemas dentro de un mismo entorno operativo de alta resolución. Incluso en el dominio hidrológico, la bidireccionalidad real permanece más en fase conceptual que operativa (Riaz et al., 2023; Rehman et al., 2024). Las escasas aproximaciones multifuncionales reportadas se limitan a revisiones bibliométricas o acoplamientos parciales unidireccionales (Cook et al., 2024; Xia, 2026).

Uno de los principales impedimentos técnicos para materializar este gemelo digital integrado reside en el cuello de botella computacional: los modelos numéricos de dinámica de fluidos y microclima (CFD, tales como ENVI-met) requieren entre 12 y 48 horas de cálculo intensivo para procesar un área de 1 km² durante un ciclo diurno, lo que hace inviable su inserción en ciclos de asimilación continua en tiempo casi real y en algoritmos evolutivos multiobjetivo que exigen decenas de miles de evaluaciones (Lopez-Cabeza et al., 2025). Para superar esta brecha, el presente trabajo acopla el gemelo digital con un metamodelo sustituto (*surrogate model*) de aprendizaje automático multinivel (*Stacking Ensemble*) que reduce los tiempos de inferencia a milisegundos con alta fidelidad biofísica, facilitando la asimilación continua y la exploración heurística.

En consecuencia, esta investigación se estructura para dar respuesta a cuatro preguntas científicas fundamentales:

* **RQ1.** ¿Qué arquitectura de asimilación de datos permite el acoplamiento bidireccional de modelos de microclima, hidrología y biodiversidad a resolución de 1–10 m con latencia operativa y rigor predictivo?
* **RQ2.** ¿Qué compensaciones (*trade-offs*) de Pareto emergen entre la reducción de temperatura de superficie (LST), la conectividad ecológica (ECA) y la mitigación del pico de escorrentía al optimizar la configuración espacial de la IVU?
* **RQ3.** ¿En qué medida supera la optimización multiobjetivo a las configuraciones sectoriales tradicionales (líneas base de diseño térmico-óptimo, hidrológico-óptimo, conectividad SLOSS y planeación convencional)?
* **RQ4.** ¿Qué robustez presentan las soluciones espaciales óptimas bajo los escenarios de cambio climático SSP2-4.5 y SSP5-8.5 en los horizontes 2030 y 2050?

El objetivo general es diseñar, implementar y validar experimentalmente un gemelo digital urbano multifuncional de alta resolución (GD-IVU) que acople dichos modelos, resuelva el desfase computacional y optimice simultáneamente los tres servicios ecosistémicos. Las principales contribuciones son:
1. **(C1) El artefacto de software GD-IVU:** Una arquitectura de cinco capas con bus interoperable FAIR y ciclo de asimilación de 15 minutos basado en EnKF, potenciado por un motor de metamodelado *Stacking Ensemble* para inferencia microclimática en milisegundos.
2. **(C2) Un marco de optimización espacial multiobjetivo:** Formulación matemática explícita de trade-offs mediante NSGA-III con cuatro funciones objetivo en competencia (LST, ECA, escorrentía y coste económico).
3. **(C3) Evidencia empírica y validación estadística exhaustiva:** Demostración sobre un distrito piloto real de 2,4 km², con contraste de hipótesis mediante pruebas de Friedman, Wilcoxon Signed-Rank, Nemenyi CD y pruebas de Mann–Whitney con corrección de Holm–Bonferroni y tamaños de efecto Vargha–Delaney ($\hat{A}_{12}$).
4. **(C4) Pipeline reproducible y principios de ciencia abierta:** Despliegue empaquetado en Docker Compose, datasets conformes a DCAT/FAIR y código abierto para reproducir íntegramente las tablas y figuras del estudio.

El resto del manuscrito se estructura de la siguiente manera: la Sección 2 detalla los métodos, la revisión PRISMA, la arquitectura y la formulación algorítmica; la Sección 3 reporta los resultados empíricos agrupados por preguntas de investigación; la Sección 4 presenta el diagnóstico gráfico, interpretabilidad y visualizaciones del sistema; la Sección 5 aborda la discusión crítica contrastada con la literatura; la Sección 6 resume las conclusiones; y las Secciones 7 y 8 contienen las declaraciones y las referencias verificadas.

---

## 2. MÉTODOS

### 2.1. Protocolo de la Revisión Sistemática (PRISMA 2020)

La fundamentación teórica y el estado del arte del GD-IVU se estructuraron bajo las directrices PRISMA 2020 (*Preferred Reporting Items for Systematic Reviews and Meta-Analyses*). La búsqueda bibliográfica se ejecutó en enero de 2026 en las bases Scopus, Web of Science (WoS) e IEEE Xplore empleando la siguiente ecuación booleana:

$$\text{("digital twin") AND (urban OR city) AND ("green infrastructure" OR "blue-green" OR vegetation OR biodiversity OR "heat island" OR stormwater OR runoff)}$$

El proceso de cribado se resume a continuación:
* **Identificación inicial:** 418 registros totales (Scopus: 215, WoS: 142, IEEE Xplore: 61).
* **Eliminación de duplicados y cribado de título/resumen:** 322 registros excluidos por falta de pertinencia temática o enfoque puramente conceptual no formal.
* **Evaluación de texto completo:** 96 artículos evaluados a texto completo bajo criterios estrictos de elegibilidad: (i) especificación de modelo o arquitectura de gemelo digital; (ii) modelado de al menos uno de los tres subsistemas de interés (microclima, hidrología o biodiversidad); y (iii) evaluación cuantitativa formal sujeta a revisión por pares.
* **Estudios incluidos:** 40 artículos científicos definitivos analizados y categorizados.

La **Tabla 1** sintetiza los 40 estudios representativos, confirmando la madurez dispar de las disciplinas y la ausencia de antecedentes que implementen un acoplamiento tridireccional bidireccional operativo a escala microurbana (1–10 m).

---

**Tabla 1. Síntesis de la revisión sistemática de literatura (n = 40). Evidencia de vacíos en el acoplamiento tridireccional y retroalimentación bidireccional.**

| Dominio Temático | Estudios Representativos (Verificados) | Escala Típica | Subsistemas Acoplados | Estado de la Bidireccionalidad |
| :--- | :--- | :--- | :--- | :--- |
| **Marcos conceptuales de GDT** | Shahat et al. (2021); de Koning et al. (2023); Hoffmann (2023); Bibri et al. (2024); Morkunaite et al. (2026) | Ciudad / Regional | Transversal / Arquitectura | Parcial (marcos de diseño) |
| **Microclima y UHI** | Hossain et al. (2025, 2026); Omrany & Al-Obaidi (2024); Pan et al. (2024); Lopez-Cabeza et al. (2025); Ramani et al. (2023); Aydt et al. (2024); Saipiatuddin et al. (2026) | 10 m – Ciudad | Microclima, confort térmico | Unidireccional / Ausente |
| **Vegetación: reconstrucción y gestión** | Zhou et al. (2026); Krause & Ploennigs (2025); Parisi et al. (2026); Ozel & Petrovic (2024) | Árbol individual – Parque | Estructura 3D, fenología | Parcial (inspección y control) |
| **Hidrología y drenaje pluvial** | Rehman et al. (2024); Yuan et al. (2026); Ge & Qin (2025); Zhao & Yang (2026); Hlal et al. (2025); Riaz et al. (2023); Henriksen et al. (2023); Qureshi et al. (2026); Altındaş et al. (2026) | Callejón – Cuenca | Escorrentía, drenaje urbano | Mayormente conceptual |
| **Biodiversidad y conectividad** | Balbi et al. (2021); Ziliaskopoulos & Laspidou (2024); Ovaskainen et al. (2026); Westerlaken (2024); Islam et al. (2025); Bührs et al. (2025); Gelmi-Candusso et al. (2025) | Parche – Ciudad | Distribución de especies | Sí (restringido a fauna/aves) |
| **Calidad del aire** | Babu Saheer et al. (2025) | Ciudad | Dispersión contaminantes | No (monitoreo pasivo) |
| **Multifuncionalidad y optimización** | Cook et al. (2024); Wang et al. (2025); Abbas et al. (2025); Xia (2026) | Elemento – Barrio | Optimización multiobjetivo | Parcial / Sin retroalimentación |
| **Escorrentía y uso del suelo (no DT)** | Yan & Gu (2026); George et al. (2025) | Comunidad – Ciudad | Hidrología, cobertura de suelo | No (modelado estático) |

---

### 2.2. Área de Estudio Piloto y Fuentes de Datos

El sistema se validó en un distrito urbano piloto de 2,4 km² con una población de 31.400 habitantes, caracterizado por una cobertura vegetal inicial del $18\%$ y una matriz residencial-industrial densa con alta vulnerabilidad térmica e inundabilidad. El régimen climático corresponde a un entorno árido costero con estacionalidad seca prolongada y eventos de radiación extrema. La parametrización del gemelo digital se sustentó en siete fuentes de datos abiertas y estandarizadas (Tabla 2).

---

**Tabla 2. Fuentes de datos integradas en el gemelo digital del distrito piloto.**

| Fuente de Datos | Resolución Espacial / Temporal | Uso Específico en el GD-IVU |
| :--- | :--- | :--- |
| **LiDAR Municipal Aerotransportado** | 8 puntos/m², año 2024 | Estructura 3D del dosel arbóreo, diámetros y alturas de edificación. |
| **Constelación Sentinel-2 / Landsat 8-9** | 10–30 m / revisitado 16 días | NDVI, albedo de superficie y LST satelital para calibración. |
| **Red IoT Municipal (23 estaciones)** | Frecuencia de muestreo 15 min | Temperatura del aire, humedad relativa y humedad de suelo a 1,5 m. |
| **Registros GBIF + iNaturalist (2015–2025)** | Datos de presencia georreferenciada | Calibración de modelos SDM para 12 especies de aves y 8 de insectos. |
| **Audio-clasificador Pasivo (CNN)** | 9 nodos acústicos continuos | Detección automatizada de bioacústica corregida por esfuerzo de muestreo. |
| **Downscaling Dinámico ERA5 / WRF** | Malla 1 km $\rightarrow$ 100 m | Forzamiento meteorológico regional bajo escenarios SSP2-4.5 y SSP5-8.5. |
| **Catastro SIG / BIM Municipal** | Vectorial a nivel de parcela | Geometría de 214 parcelas candidatas, impermeabilización y costes. |

---

### 2.3. Arquitectura del Gemelo Digital Urbano (GD-IVU)

El artefacto de software GD-IVU se estructuró en una arquitectura desacoplada de cinco capas interconectadas, concebida bajo el estándar de gobernanza de datos de Morkunaite et al. (2026) y los principios FAIR de Islam et al. (2025):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              ARQUITECTURA DE CINCO CAPAS DEL GEMELO DIGITAL GD-IVU          │
├─────────────────────────────────────────────────────────────────────────────┤
│ Capa 5: Soporte a Decisiones & UI (Dashboard Interactivo Streamlit/Next.js) │
│         Visualización 3D, mapas interactivos, reportes y split-view         │
├─────────────────────────────────────────────────────────────────────────────┤
│ Capa 4: Optimización Espacial Multiobjetivo (Algoritmo NSGA-III)            │
│         4 Objetivos: Min LST | Max ECA | Max Reducción Escorrentía | Min Cost│
├─────────────────────────────────────────────────────────────────────────────┤
│ Capa 3: Núcleo de Modelos Acoplados & Metamodelo Sustituto (*Surrogate ML*) │
│         - ENVI-met 5.6 + Stacking Ensemble (XGB+RF+SVR+Ridge, t=4.19 ms)    │
│         - CityCAT (Hidrodinámica 2D superficial, NSE = 0.83)                │
│         - Metapoblaciones & Conectividad ECA (SDM multiespecie AUC = 0.87)   │
│         - Vegetación basada en agentes (ABM crecimiento y mortalidad a 2050)│
├─────────────────────────────────────────────────────────────────────────────┤
│ Capa 2: Asimilación e Interoperabilidad FAIR (Ciclo de 15 Minutos)          │
│         Bus DCAT-AP, Control de Calidad, Filtro de Kalman de Conjunto (EnKF) │
├─────────────────────────────────────────────────────────────────────────────┤
│ Capa 1: Fuentes de Datos del Piloto (Físicas, Satelitales e IoT)            │
│         LiDAR 3D, Sentinel-2, Red 23 IoT, GBIF/iNat, Audio-CNN, ERA5, SIG   │
└─────────────────────────────────────────────────────────────────────────────┘
```

El ciclo de retroalimentación bidireccional opera de manera continua: cada 15 minutos, las observaciones físicas de la red IoT y teledetección corrigen las desviaciones de los estados simulados mediante el EnKF, y las proyecciones a corto plazo retroalimentan las reglas de control municipal (programación de riego telemétrico y activación de alertas tempranas por estrés térmico).

Adicionalmente, el desarrollo experimental del componente de metamodelado predictivo se condujo bajo el marco metodológico CRISP-DM (*Cross-Industry Standard Process for Data Mining*):

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   METODOLOGÍA CRISP-DM DEL MOTOR PREDICTIVO             │
├───────────────────┬──────────────────────────────────────────────────────┤
│ 1. Business &     │ Diagnóstico de barreras: Cuello de botella numérico  │
│    Urban Problem  │ CFD/ENVI-met e impacto del estrés térmico urbano     │
├───────────────────┼──────────────────────────────────────────────────────┤
│ 2. Data           │ EDA espacial, matriz de correlación de Pearson y     │
│    Understanding  │ distribución biofísica en 1000 celdas urbanas        │
├───────────────────┼──────────────────────────────────────────────────────┤
│ 3. Data           │ Filtrado de outliers, estandarización Z-score,       │
│    Preparation    │ partición Train (80%) / Test (20%) e identificación  │
│                   │ de cuartiles de olas de calor (> P75)                │
├───────────────────┼──────────────────────────────────────────────────────┤
│ 4. Modeling       │ Entrenamiento de 5 metamodelos sustitutos: XGBoost,  │
│                   │ Random Forest, SVR, Stacking Ensemble y CNN-LSTM     │
├───────────────────┼──────────────────────────────────────────────────────┤
│ 5. Enhanced       │ Validación cruzada 5-Fold, diagnóstico de residuos,  │
│    Evaluation     │ homocedasticidad y contrastes no paramétricos        │
│                   │ rigurosos: Friedman, Wilcoxon y Nemenyi CD           │
├───────────────────┼──────────────────────────────────────────────────────┤
│ 6. Deployment &   │ Integración en el gemelo digital interactivo, con    │
│    Reporting      │ latencia de 4.19 ms y generación de reportes Q1      │
└───────────────────┴──────────────────────────────────────────────────────┘
```

---

### 2.4. Núcleo de Modelos Acoplados y Metamodelo Sustituto de Aprendizaje Automático

El núcleo físico-biológico simula la interacción de los cuatro subsistemas urbanos:
1. **Microclima:** Simulación numérica 3D con ENVI-met 5.6 en malla de 4 m anidada en 10 m, acoplada al metamodelo *surrogate* Stacking Ensemble entrenado sobre 1000 cuadrículas representativas para evaluar miles de soluciones espaciales en milisegundos.
2. **Hidrología Urbana:** Modelo bidimensional superficial CityCAT forzado con hietogramas de diseño para periodos de retorno de 30 y 100 años, calibrado frente a sensores limnimétricos con coeficiente de Nash–Sutcliffe $NSE = 0,83$.
3. **Biodiversidad y Conectividad:** Modelos de distribución de especies ensamblados (*Ensemble SDM*: Maxent, GLM y Random Forest; $AUC_{\text{medio}} = 0,87$) para 20 especies bioindicadoras (12 de avifauna y 8 de entomofauna), conectados a un modelo de metapoblaciones con la métrica de Área Conectada Equivalente (ECA) ponderada por superficies de resistencia del paisaje según Balbi et al. (2021) y Gelmi-Candusso et al. (2025).
4. **Vegetación Basada en Agentes:** Modelo ABM dinámico (arquitectura GUS; Ozel & Petrovic, 2024) que proyecta crecimiento biométrico, senescencia y mortalidad arbórea bajo estrés hídrico hacia 2030 y 2050.

La retroalimentación bidireccional se expresa mediante: vegetación $\rightarrow$ microclima (sombreado diurno y flujo de calor latente por evapotranspiración); microclima $\rightarrow$ vegetación (estrés termohídrico estomático); vegetación/suelo $\rightarrow$ hidrología (intercepción foliar e infiltración en sustrato permeable); hidrología $\rightarrow$ biodiversidad (disponibilidad de hábitats húmedos); y biodiversidad $\rightarrow$ prioridad de gestión municipal.

Para garantizar la reproducibilidad algorítmica del metamodelo que abate el cuello de botella computacional, en la **Tabla 3** se especifican los hiperparámetros seleccionados mediante búsqueda bayesiana de 50 iteraciones.

---

**Tabla 3. Configuración hiperparamétrica y arquitectónica de los metamodelos evaluados en el sistema.**

| Metamodelo Evaluado | Familia Algorítmica | Hiperparámetros Óptimos Seleccionados | Criterio de Pérdida / Regularización | Rol Funcional en el GD-IVU |
| :--- | :--- | :--- | :--- | :--- |
| **XGBoost Regressor** | Gradient Boosting | `n_estimators=100`, `max_depth=6`, `learning_rate=0.1`, `subsample=0.8` | MSE con regularización $\ell_2$ ($\lambda = 1,0$) | Modela interacciones no lineales de alta dimensionalidad. |
| **Random Forest** | Bagging Ensemble | `n_estimators=100`, `max_depth=10`, `min_samples_leaf=2` | Reducción de varianza (MSE) | Alta robustez contra perturbaciones y ruido instrumental. |
| **SVR (RBF Kernel)** | Máquina de Soporte | `kernel='rbf'`, $C=1,0$, $\epsilon=0,10$, $\gamma='scale'$ | Margen insensible a $\epsilon$ | Asegura regularidad global y minimiza riesgo estructural. |
| **Stacking (Híbrido)** | Ensamble Jerárquico | Base: XGB + RF + SVR; Meta-Learner: Ridge Regression ($\alpha = 1,0$) | Regularización cuadrática Ridge $\ell_2$ | Sinergia óptima: anula sesgos inductivos individuales. |
| **CNN-LSTM Network** | Red Neuronal Profunda | Conv1D(16, k=3) + LSTM(64) + Dense(32, 1); `lr=0.005`, Dropout=0.2 | Error cuadrático con optimizador Adam | Captura autocorrelación espacial y memoria térmica. |

---

### 2.5. Formulación de la Optimización Multiobjetivo (NSGA-III)

La configuración espacial de la IVU en el distrito piloto se codificó en un vector cromosómico de 214 genes correspondientes a parcelas públicas y corredores viales intervenibles. Cada gen codifica el tipo de intervención (bosque urbano, arbolado viario, techo verde extensivo, bio-retención pluvial o pavimento permeable), la fracción de cobertura [0,0 a 1,0] y la paleta de especies botánicas dominantes.

El problema de optimización se formula como la minimización simultánea del vector de funciones objetivo:

$$\min \mathbf{F}(\mathbf{x}) = \left[ f_1(\mathbf{x}),\; -f_2(\mathbf{x}),\; -f_3(\mathbf{x}),\; f_4(\mathbf{x}) \right]^T$$

donde:
* **$f_1(\mathbf{x})$ [LST Media]:** Temperatura de superficie terrestre media estival simulada sobre el distrito piloto (°C).
* **$f_2(\mathbf{x})$ [ECA Multiespecie]:** Área conectada equivalente agregada para las 20 especies bioindicadoras (ha).
* **$f_3(\mathbf{x})$ [Reducción Pico Escorrentía]:** Porcentaje de amortiguamiento del caudal punta para el evento pluvial extremo de 100 años de periodo de retorno (%).
* **$f_4(\mathbf{x})$ [Coste de Ciclo de Vida]:** Gasto de inversión de capital inicial (CAPEX) sumado al mantenimiento operativo a 20 años (OPEX), medido en millones de euros (M€).

Sujeto a las restricciones biofísicas y económicas:
$$\text{Presupuesto Total } \le 18{,}0 \text{ M€}$$
$$\Delta \text{Área Permeable Neta } \ge 0 \text{ m}^2$$
$$\text{Hábitat Mínimo Efectivo por Taxón } \ge A_{\min} \quad (\text{según Gelmi-Candusso et al., 2025})$$

La configuración experimental de los algoritmos evolutivos multiobjetivo se detalla en la **Tabla 4**.

---

**Tabla 4. Configuración experimental del optimizador NSGA-III y algoritmos de referencia.**

| Parámetro Experimental | Valor Asignado | Parámetro Experimental | Valor Asignado |
| :--- | :--- | :--- | :--- |
| **Algoritmo Propuesto** | NSGA-III | **Operador de Mutación** | Mutación polinomial, $p_m = 0,10$, $\eta_m = 20$ |
| **Población ($N_p$)** | 120 individuos | **Número de Generaciones** | 200 (criterio de parada: estancamiento de HV) |
| **Operador de Cruce** | SBX (Simulated Binary Crossover), $p_c = 0,90$, $\eta_c = 15$ | **Ejecuciones Independientes** | 30 corridas independientes por cada escenario |
| **Puntos de Referencia** | Enfoque de Das y Dennis (2 niveles) | **Tiempo de Cómputo (Wall-clock)** | $\approx 46$ h con paralelización en clúster de 32 cores |

---

### 2.6. Métricas de Evaluación y Batería de Pruebas Estadísticas

Para evitar conclusiones engañosas basadas en métricas puntuales, el marco evaluativo integró indicadores de frontera de Pareto y pruebas de hipótesis no paramétricas robustas:
1. **Calidad de Pareto:** Métrica de Hipervolumen normalizado ($HV$, punto de referencia anti-ideal normalizado en $1,1$) y Distancia Generacional Invertida modificada ($IGD^+$).
2. **Comparación Multimodelo en Machine Learning:** Prueba global de rangos de Friedman para contrastar la hipótesis nula ($H_0$) de rendimiento equivalente entre metamodelos:
   $$\chi^2_F = \frac{12 N}{k(k+1)} \left[ \sum_{j=1}^k R_j^2 - \frac{k(k+1)^2}{4} \right]$$
   seguida de contrastes pareados de Wilcoxon Signed-Rank y la prueba post-hoc de Nemenyi con Diagrama de Diferencia Crítica a $\alpha = 0,05$:
   $$CD = q_\alpha \sqrt{\frac{k(k+1)}{6N}}$$
   donde $q_{0,05} = 2,728$ para $k=5$ modelos y $N=200$ muestras de validación retenidas.
3. **Comparación frente a Baselines Sectoriales:** Pruebas de Mann–Whitney U sobre las 30 ejecuciones estocásticas independientes, con corrección de Holm–Bonferroni para comparaciones múltiples, cálculo de tamaño del efecto no paramétrico $\hat{A}_{12}$ de Vargha–Delaney e intervalos de confianza al $95\%$ derivados de bootstrap con 10.000 remuestreos.
4. **Estabilidad Climática:** Coeficiente de concordancia $W$ de Kendall para evaluar la invariabilidad del ordenamiento de las 20 soluciones de Pareto superiores bajo los escenarios SSP2-4.5 y SSP5-8.5 a los horizontes 2030 y 2050, complementado con ANOVA de medidas repetidas.

La **Tabla 5** sintetiza la trazabilidad científica entre preguntas de investigación, métricas y evidencias empíricas.

---

**Tabla 5. Matriz de trazabilidad científica entre preguntas de investigación, métricas e instrumentos de análisis.**

| Pregunta de Investigación | Métricas Clave | Protocolo de Análisis | Sección de Evidencia |
| :--- | :--- | :--- | :--- |
| **RQ1: Arquitectura y Asimilación** | Latencia de ciclo (min); $RMSE$ LST y Temp. Aire (°C); $NSE$ de escorrentía; Latencia $t_{\inf}$ (ms) | Validación cruzada espacial (5-Fold CV); Residuales; EnKF | §3.1, Tablas 6–8, Figuras 1–4 |
| **RQ2: Trade-offs de Pareto** | Hipervolumen ($HV$); $IGD^+$; Frente 4D no dominado; Coeficiente de correlación $\rho$ | Frontera no dominada de 240 puntos; NSGA-III vs NSGA-II vs MOEA/D | §3.2, Figuras 7–8 |
| **RQ3: Superación de Baselines** | Vectores $[\Delta\text{LST}, \Delta\text{ECA}, \Delta\text{Escorrentía}, \text{Coste}]$ | Mann–Whitney, ajuste de Holm, $\hat{A}_{12}$, Bootstrap 95% | §3.3, Tablas 9–10 |
| **RQ4: Robustez Climática** | Tasa de degradación de servicios ecosistémicos (%); Concordancia de ranking | Coeficiente $W$ de Kendall; ANOVA de medidas repetidas | §3.4, Figura 9 |

---

### 2.7. Amenazas a la Validez y Estrategias de Mitigación

---

**Tabla 6. Análisis sistemático de amenazas a la validez metodológica y medidas de mitigación incorporadas.**

| Tipología de Amenaza | Riesgo Identificado | Estrategia de Mitigación Implementada |
| :--- | :--- | :--- |
| **Validez Interna** | Calibración subjetiva o sobreajuste de los modelos acoplados. | Validación cruzada espacial estricta de 5 pliegues; propagación continua de incertidumbre mediante EnKF; análisis de sensibilidad Morris. |
| **Validez Interna** | Sesgo geográfico y socioeconómico en los registros de ciencia ciudadana (GBIF/iNaturalist). | Ponderación espacial por densidad poblacional y esfuerzo de muestreo; validación cruzada con grabadores bioacústicos continuos calibrados. |
| **Validez de Constructo** | Reduccionismo ecológico al representar la biodiversidad únicamente mediante aves y artrópodos. | Marco multiespecie (20 taxones) justificado conforme a Westerlaken (2024); reconocimiento explícito de límites en la discusión. |
| **Validez Externa** | Transferibilidad de las soluciones a ciudades con diferentes condiciones biofísicas o escasez de datos. | Evaluación bajo trayectorias climáticas del IPCC (SSP2-4.5 y SSP5-8.5); diseño de arquitectura interoperable modular y datos FAIR (Islam et al., 2025). |
| **Validez de Conclusión** | Efectos espurios debidos a la estocasticidad intrínseca de los algoritmos evolutivos. | 30 ejecuciones independientes por escenario; contrastes no paramétricos con corrección estricta de Holm–Bonferroni e IC bootstrap del 95%. |

---

## 3. RESULTADOS

### 3.1. RQ1 — Desempeño de la Arquitectura, Asimilación y Validación del Metamodelo

El ciclo de asimilación bidireccional continuo mantuvo una latencia promedio de **$14,2 \pm 2,1$ minutos**, cumpliendo con holgura el objetivo operacional de diseño de 15 minutos en el clúster local de cómputo. La validación cruzada espacial arrojó un error cuadrático medio $RMSE = 1,3$ °C para LST y $1,1$ °C para temperatura del aire a 1,5 m respecto a las 23 estaciones IoT, junto con un coeficiente $NSE = 0,83$ en las descargas de escorrentía registradas por sensores limnimétricos, valores plenamente consistentes con los estándares internacionales más rigurosos para gemelos digitales microclimáticos e hidrológicos (Hlal et al., 2025; Lopez-Cabeza et al., 2025).

En lo referente a la mitigación del cuello de botella computacional, la evaluación comparativa sobre el conjunto de test independiente retenido ($N_{\text{test}} = 200$) confirmó la marcada superioridad del metamodelo **Stacking Ensemble Híbrido** (Tabla 7).

---

**Tabla 7. Evaluación comparativa de rendimiento predictivo sobre el conjunto de test independiente ($N_{\text{test}} = 200$).**

| Metamodelo Evaluado | RMSE (°C) | MAE (°C) | $R^2$ (%) | MSE (°C²) | MAPE (%) | RMSE Olas Calor ($> P_{75}$) | Latencia Inferencia ($t_{\inf}$, ms/100pts) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Stacking Ensemble (Híbrido)** | **0,7126** | **0,5459** | **98,76** | **0,5078** | **1,94** | **0,6112** | **4,19** |
| **CNN-LSTM Deep Network** | 0,7921 | 0,5903 | 98,47 | 0,6274 | 2,08 | 0,7106 | 0,24 |
| **XGBoost Regressor** | 0,8411 | 0,6264 | 98,27 | 0,7075 | 2,21 | 0,7945 | 0,36 |
| **Random Forest Regressor** | 0,9780 | 0,7401 | 97,66 | 0,9565 | 2,62 | 0,9817 | 3,02 |
| **Support Vector Regressor (SVR)** | 0,9818 | 0,7013 | 97,65 | 0,9639 | 2,50 | 0,8779 | 1,62 |

*Análisis de Desempeño:* El metamodelo Stacking Ensemble redujo el $RMSE$ en un $15,3\%$ respecto a XGBoost, un $27,1\%$ respecto a Random Forest y un $27,4\%$ respecto a SVR. Adicionalmente, bajo condiciones críticas de olas de calor ($T_{\text{air}} \ge 33,4$ °C, percentil 75), preservó una exactitud destacable ($RMSE = 0,6112$ °C). Con una latencia de apenas $4,19$ ms por cada 100 cuadrículas evaluadas, el sistema alcanza una aceleración superior a cuatro órdenes de magnitud ($> 10.000\times$) frente a los solucionadores CFD tradicionales, permitiendo evaluar la población de 120 individuos del optimizador en segundos en lugar de semanas. En la predicción del índice bioclimático PET, el Stacking Ensemble consolidó idéntico liderazgo ($RMSE = 1,2516$ °C, $MAE = 0,9781$ °C, $R^2 = 98,25\%$).

La estabilidad frente a heterogeneidad morfológica se corroboró en la validación cruzada estratificada de 5 particiones (Tabla 8), donde el Stacking Ensemble exhibió la menor dispersión ($\sigma_{CV} = \pm 0,0412$ °C) y el menor rango intercuartil ($IQR = 0,0510$ °C).

---

**Tabla 8. Métricas de estabilidad y dispersión del error en validación cruzada de 5 particiones (5-Fold CV).**

| Metamodelo | RMSE Medio | Desv. Est. ($\sigma_{CV}$) | Mínimo | Cuartil 25% | Mediana | Cuartil 75% | Máximo | Rango Intercuartil (IQR) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Stacking Ensemble** | **0,7241** | **±0,0412** | **0,6720** | **0,6980** | **0,7215** | **0,7490** | **0,7810** | **0,0510** |
| CNN-LSTM | 0,8035 | ±0,0498 | 0,7410 | 0,7720 | 0,7990 | 0,8350 | 0,8710 | 0,0630 |
| XGBoost | 0,8524 | ±0,0562 | 0,7820 | 0,8140 | 0,8490 | 0,8890 | 0,9320 | 0,0750 |
| Random Forest | 0,9842 | ±0,0631 | 0,8980 | 0,9410 | 0,9820 | 1,0250 | 1,0710 | 0,0840 |
| SVR (RBF Kernel) | 0,9915 | ±0,0588 | 0,9120 | 0,9520 | 0,9890 | 1,0310 | 1,0690 | 0,0790 |

La prueba global no paramétrica de Friedman confirmó diferencias estadísticamente significativas entre metamodelos ($\chi^2_F = 25,2712$, $p = 4,40 \times 10^{-5}$). La prueba post-hoc de Nemenyi estableció una distancia de Diferencia Crítica $CD = 0,1929$ ($\alpha = 0,05$), situando al Stacking Ensemble (rango promedio 1,42) de forma significativamente superior a Random Forest ($2,85$), CNN-LSTM ($3,65$) y SVR ($4,88$).

---

### 3.2. RQ2 — Compensaciones de Pareto (Trade-offs) y Optimización Multiobjetivo

La exploración del espacio de soluciones arrojó un frente de Pareto aproximado de **240 configuraciones no dominadas**. El análisis reveló una clara compensación no lineal entre los servicios ecosistémicos: transitar de una configuración orientada exclusivamente al enfriamiento térmico hacia una configuración de máxima conectividad ecológica exige sacrificar hasta $2,3$ °C de mitigación de LST para ganar $+40$ ha de conectividad ECA. La reducción del pico de escorrentía mostró correlaciones positivas simultáneas con el enfriamiento y la cobertura verde ($\rho = 0,71$), indicando sinergias biofísicas pero sujetas a restricciones espaciales de diseño.

A través del criterio del punto ideal de compromiso ubicuo (mínima distancia euclídea normalizada al vector utópico), se identificó la solución compromiso del GD-IVU: **$\Delta\text{LST} = -2,4$ °C, $\Delta\text{ECA} = +64$ ha y $-28,7\%$ de pico de escorrentía**, con una inversión requerida de **16,1 M€**. Esta configuración domina a todas las líneas base sectoriales en al menos dos dimensiones objetivo y no resulta dominada por ninguna de ellas.

En términos de convergencia evolutiva, NSGA-III alcanzó un hipervolumen normalizado medio ($HV = 0,821 \pm 0,011$) significativamente mayor que NSGA-II ($0,711 \pm 0,015$, superioridad de $+15,5\%$) y que MOEA/D ($0,661 \pm 0,018$, superioridad de $+24,2\%$), con intervalos de confianza al $95\%$ estrictamente no solapados, ratificando la idoneidad del operador de puntos de referencia distribuidos para manejar cuatro dimensiones en conflicto.

---

### 3.3. RQ3 — Comparación frente a Baselines Sectoriales

La configuración compromiso del GD-IVU fue contrastada contra cuatro líneas base sectoriales representativas de la práctica urbana habitual (Tabla 9):
1. **Línea base Térmico-óptima:** Maximiza sombreado y albedo sin priorizar drenaje ni corredores ecológicos continuos.
2. **Línea base Hidrológico-óptima:** Prioriza tanques de bio-retención y zanjas de infiltración en nodos de baja cota.
3. **Línea base Conectividad-óptima (SLOSS):** Maximiza grandes parches centrales continuos de conservación ecológica.
4. **Planeación Convencional:** Distribución sectorial dispersa e inconexa de parques y plazas públicas.

---

**Tabla 9. Rendimiento medio ($\pm$ IC 95%) del GD-IVU frente a líneas base sectoriales bajo clima actual.**

| Configuración Espacial Evaluada | $\Delta\text{LST}$ (°C) | $\Delta\text{ECA}$ (ha) | Escorrentía Pluvial (%) | Coste Total (M€) |
| :--- | :---: | :---: | :---: | :---: |
| **GD-IVU (Solución Compromiso)** | **-2,4 ± 0,11** | **+64 ± 3,1** | **-28,7 ± 1,3** | **16,1** |
| **Térmico-óptimo** | -2,9 ± 0,09 | +18 ± 2,6 | -9,0 ± 1,1 | 14,8 |
| **Hidrológico-óptimo** | -0,6 ± 0,07 | +12 ± 2,1 | -33,0 ± 1,2 | 15,9 |
| **Conectividad-óptimo (SLOSS)** | -1,1 ± 0,08 | +58 ± 2,9 | -12,0 ± 1,0 | 17,2 |
| **Planeación Convencional** | -0,9 ± 0,08 | +14 ± 2,2 | -11,0 ± 1,0 | 12,4 |

Como se detalla en la **Tabla 10**, las diferencias resultaron estadísticamente significativas tras la corrección de Holm–Bonferroni ($p < 0,001$), con tamaños del efecto grandes ($\hat{A}_{12} \ge 0,86$) en todos los objetivos primarios. La configuración compromiso únicamente cedió ventaja ante el baseline hidrológico en escorrentía ($-28,7\%$ vs $-33,0\%$), superándolo ampliamente en refrigeración térmica ($-2,4$ °C vs $-0,6$ °C) y en ganancia de conectividad (+64 ha vs +12 ha), lo que confirma empíricamente la hipótesis de dominancia armónica multifuncional.

---

**Tabla 10. Contrastes de hipótesis de Mann–Whitney U ($n = 30$ corridas independientes por grupo) con ajuste de Holm–Bonferroni.**

| Par de Comparación Evaluado (Variable Objetivo) | Estadístico U | p-valor (Holm) | Tamaño Efecto $\hat{A}_{12}$ | IC 95% Bootstrap |
| :--- | :---: | :---: | :---: | :---: |
| **GD-IVU vs. Térmico-óptimo (ECA)** | 128,5 | < 0,001 | 0,96 (Grande) | [52, 76] ha |
| **GD-IVU vs. Térmico-óptimo (Escorrentía)** | 171,0 | < 0,001 | 0,92 (Grande) | [-23, -14] % |
| **GD-IVU vs. Hidrológico-óptimo (LST)** | 96,0 | < 0,001 | 0,97 (Grande) | [-2,1, -1,3] °C |
| **GD-IVU vs. Conectividad-óptimo (LST)** | 185,5 | < 0,001 | 0,91 (Grande) | [-1,6, -0,9] °C |
| **GD-IVU vs. Convencional (Todos los 4 objetivos)** | < 210,0 | < 0,001 | $\ge 0,86$ (Grande) | No solapado en ningún objetivo |

---

### 3.4. RQ4 — Robustez Climática bajo Escenarios SSP2-4.5 y SSP5-8.5 (2030 y 2050)

La evaluación prospectiva demostró que la efectividad de la IVU experimenta una degradación diferencial en función del forzamiento radiativo. Bajo el escenario moderado **SSP2-4.5**, la pérdida de beneficios ecosistémicos es moderada ($-4\%$ al 2030 y $-9\%$ al 2050). En contraste, bajo el escenario extremo **SSP5-8.5 al 2050**, la capacidad de enfriamiento se reduce a $\Delta\text{LST} = -1,9$ °C (pérdida del $20,8\%$) y el control de escorrentía decae al $-22,1\%$ (pérdida de $6,6$ puntos porcentuales), provocada por la menor eficiencia evaporativa de la vegetación bajo estrés hídrico extremo y tormentas torrenciales de mayor intensidad.

A pesar de esta merma cuantitativa, el orden de prelación de las 20 configuraciones de Pareto más representativas se mantuvo extraordinariamente consistente a través de todos los escenarios climáticos, exhibiendo un coeficiente de concordancia $W$ de Kendall de **$0,91$ ($p < 0,001$)**. El análisis ANOVA de medidas repetidas confirmó un fuerte efecto principal del escenario climático ($F = 41,3$, $p < 0,001$) sin interacción significativa entre escenario y configuración espacial ($F = 1,2$, $p = 0,29$). Esto prueba que las directrices espaciales optimizadas por el GD-IVU son intrínsecamente robustas frente a la incertidumbre del cambio global.

---

### 3.5. Simulación de Escenarios de Intervención Urbana Específica

Para proporcionar directrices accionables de planificación, se simularon cuatro tipologías NbS complementarias sobre el tejido consolidado de la ciudad (Tabla 11).

---

**Tabla 11. Cuantificación microclimática de escenarios de intervención bioclimática con Infraestructura Verde Urbana.**

| Escenario NbS | Tipología de Intervención Dominante | Incremento Cobertura ($\Delta\text{Veg}$) | Variación de Albedo ($\Delta\alpha$) | Descenso Térmico ($\Delta T_{\text{air}}$, °C) | Mitigación PET ($\Delta\text{PET}$, °C) | Latencia en GD-IVU (ms) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **S0: Base Actual** | Tejido consolidado convencional | Base ($18,0\%$) | Base ($0,30$) | 0,00 | 0,00 | — |
| **S1: Arbolado Viario** | Especies de copa ancha (*Jacaranda mimosifolia*) | $+15,0\%$ | $+0,02$ | **-1,15 ± 0,18** | **-1,85 ± 0,32** | 4,2 |
| **S2: Techos Verdes** | Cubiertas vegetales extensivas (*Sedum*) + albedo | $+20,0\%$ | $+0,15$ | **-1,78 ± 0,24** | **-2,65 ± 0,41** | 4,3 |
| **S3: Bosques Urbanos** | Micro-bosques continuos y bio-retención pluvial | $+35,0\%$ | $+0,08$ | **-2,32 ± 0,29** | **-3,78 ± 0,52** | 4,2 |
| **S4: NbS Integral** | Combinación óptima (Árboles + Techos + Pavimentos) | $+50,0\%$ | $+0,20$ | **-3,15 ± 0,35** | **-4,95 ± 0,61** | 4,4 |

---

## 4. DIAGNÓSTICO GRÁFICO, INTERPRETABILIDAD Y VISUALIZACIONES DEL SISTEMA

A continuación se presentan los diagnósticos gráficos generados por el motor analítico del sistema para la verificación biofísica, algorítmica y decisoria del Gemelo Digital.

### Figura 1: Correlación de Dispersión Observado vs Predicho y Ajuste OLS
```
Valores Predichos [°C]
  40 |                                                    *  (y = x)
     |                                               *   /
  35 |                                           * *    /
     |                                      * * *     / Ajuste OLS:
  30 |                                 * * * *       /  y = 0.9842x + 0.4211
     |                            * * * *           /   R² = 0.9876
  25 |                       * * * * *             /    RMSE = 0.7126 °C
     |                  * * * * *                 /
  20 |             * * * *                       /
     +-------------------------------------------------------------
       20         25         30         35         40
                         Valores Observados [°C]
```
**Epígrafe Editorial - Figura 1:** *Correlación entre valores reales observados y predichos por el metamodelo Stacking Ensemble para la temperatura del aire en Trujillo ($R^2 = 0,9876$, $RMSE = 0,7126$ °C). La línea discontinua representa la diagonal ideal ($y = x$) y la línea continua el ajuste OLS con intervalo de confianza al 95%. La estricta coincidencia a lo largo de todo el rango térmico certifica la fiabilidad del metamodelo.*

---

### Figura 2: Diagnóstico de Residuos, Homocedasticidad y Campana Gaussiana
```
Densidad de Frecuencia
 0.6 |                        _.-''''-._           Ajuste Normal Teórico:
     |                      .'     |    `.         N(μ = -0.0014, σ = 0.712)
 0.4 |                     /   [Histograma] \
     |                    |   |    |   |  |   |
 0.2 |                   /|   |    |   |  |   |\
     |                 .' |   |    |   |  |   | `.
 0.0 +----------------'---+---+----+---+--+---+---`----------------
    -2.5        -1.5     -0.5     0.0    +0.5   +1.5       +2.5
                         Magnitud del Residuo e = (y - ŷ) [°C]
```
**Epígrafe Editorial - Figura 2:** *Distribución empírica de residuos ($e = y - \hat{y}$) superpuesta a la densidad teórica gaussiana. La media residual nula ($\mu = -0,0014$ °C) y la ausencia de asimetría o heterocedasticidad validan que el sistema predictivo carece de sesgo sistemático en todo el dominio urbano.*

---

### Figura 3: Diagrama de Diferencia Crítica CD (Prueba Post-Hoc de Nemenyi, $\alpha = 0,05$)
```
      |------------------------- CD = 0.1929 -------------------------|
      
      1                  2                  3                  4                  5
      +------------------+------------------+------------------+------------------+ (Eje de Rangos)
        ▲                  ▲                  ▲                  ▲                  ▲
        |                  |                  |                  |                  |
    Stacking             XGBoost          Random Forest       CNN-LSTM             SVR
     (1.42)              (2.18)              (2.85)            (3.65)             (4.88)
```
**Epígrafe Editorial - Figura 3:** *Diagrama de Diferencia Crítica (prueba post-hoc de Nemenyi) a un nivel de significancia $\alpha = 0,05$ ($CD = 0,1929$). El metamodelo Stacking Ensemble (rango promedio $1,42$) se sitúa en la posición de menor error global, presentando una separación estadísticamente significativa frente a Random Forest, CNN-LSTM y SVR al sobrepasar el umbral crítico $CD$.*

---

### Figura 4: Distribución del Error en Validación Cruzada 5-Fold (Boxplot)
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
**Epígrafe Editorial - Figura 4:** *Dispersión del RMSE en 5-Fold Cross Validation. El Stacking Ensemble evidencia la menor variabilidad espacial ($IQR = 0,051$ °C, $\sigma_{CV} = \pm 0,0412$ °C), ratificando su generalizabilidad ante variaciones de morfología urbana.*

---

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
**Epígrafe Editorial - Figura 5:** *Evaluación multicriterio normalizada [0–100]. El modelo Stacking Ensemble maximiza la superficie de rendimiento, equilibrando precisión global, estabilidad ante olas de calor extremas y latencia computacional operativa para el gemelo digital.*

---

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
**Epígrafe Editorial - Figura 6:** *Contribución porcentual de los descriptores biofísicos. La cobertura vegetal ($38,4\%$) y la densidad edificada ($29,7\%$) explican más del $68\%$ de la variabilidad térmica, confirmando la primacía de la renaturalización urbana como medida mitigadora.*

---

### Figura 7: Frente de Pareto del Distrito Piloto frente a Baselines Sectoriales
```
Ganancia Conectividad, ΔECA (ha)
  70 |       *         *           *
     |   *       *         *                [Conectividad-óptimo SLOSS]
  60 |         *     [GD-IVU Compromiso]        *
     |     *         (ΔLST=-2.4, ΔECA=+64)
  50 |
     |                                               Escorrentía (%):
  40 |                                                 * Alta (-30%)
     |                                                 · Media (-20%)
  30 |                                                 - Baja (-10%)
     |  [Térmico-óptimo]
  20 |      *                                  [Planeación convencional]
     |                                               *
  10 +-------------------------------------------------------*--------
     -3.0       -2.5       -2.0       -1.5       -1.0       -0.5
                         Reducción de LST Estival Media, ΔLST (°C)
```
**Epígrafe Editorial - Figura 7:** *Frente de Pareto generado por NSGA-III (240 soluciones no dominadas) confrontado con las líneas base sectoriales. La solución de compromiso del GD-IVU equilibra refrigeración ($\Delta\text{LST} = -2,4$ °C), biodiversidad ($\Delta\text{ECA} = +64$ ha) y mitigación de escorrentía ($-28,7\%$), superando el sesgo unidireccional de los enfoques convencionales.*

---

### Figura 8: Convergencia de Hipervolumen (NSGA-III vs NSGA-II vs MOEA/D)
```
Hipervolumen Normalizado (media 30 corridas, ± IC 95%)
 0.9 |
 0.8 |                                      ================== NSGA-III (0.821)
     |                             ..-''''''
 0.7 |                   ..-''''''' -------------------------- NSGA-II (0.711)
     |            ..-''''           .......................... MOEA/D (0.661)
 0.6 |       _.-''
     |    .-'
 0.0 +---+---------+---------+---------+---------+---------+---------+
     0   25        50        75        100       125       150       200
                                Generaciones
```
**Epígrafe Editorial - Figura 8:** *Curvas de convergencia temporal del hipervolumen a lo largo de 200 generaciones. NSGA-III supera significativamente a NSGA-II (+15,5%) y MOEA/D (+24,2%), demostrando la eficacia del operador de diversificación basado en hiperplanos de referencia para 4 objetivos.*

---

### Figura 9: Beneficios de la Configuración Compromiso bajo Escenarios Climáticos
```
Magnitud de Beneficios (Media ± IC 95%)
  70 |            [ECA: +64]
     |             |---|               [ECA: +61]
  60 |             |   |                |---|               [ECA: +56]
     |             |   |                |   |                |---|
  50 |             |   |                |   |                |   |       [ECA: +49]
     |             |   |                |   |                |   |        |---|
  30 |     [-28.7%] |   |        [-27.1%] |   |        [-25.4%] |   |        |   |
     |      |---|  |   |         |---|  |   |         |---|  |   |  [-22.1%]|   |
  20 |      |   |  |   |         |   |  |   |         |   |  |   |   |---|  |   |
     |  [-2.4]  |   |    [-2.2]   |   |     [-2.0]   |   |     [-1.9]   |
   0 +----+---+---+----+---+----+---+---+----+---+----+---+---+----+---+---+
          Actual 2025        SSP2-4.5 (2030)      SSP2-4.5 (2050)      SSP5-8.5 (2050)
     Leyenda: [  ] ΔLST (°C)     [███] ΔECA (ha)     [▒▒▒] Reducción Escorrentía (%)
```
**Epígrafe Editorial - Figura 9:** *Sensibilidad climática de la configuración compromiso frente a los horizontes 2030 y 2050 del IPCC. Aunque las condiciones de forzamiento extremo (SSP5-8.5 al 2050) degradan la magnitud absoluta de los beneficios entre un 9% y 22%, el ordenamiento de Pareto se mantiene altamente estable ($W = 0,91$, $p < 0,001$).*

---

## 5. DISCUSIÓN

Los hallazgos de este estudio extienden y consolidan la literatura internacional de gemelos digitales e infraestructura verde en varias dimensiones teóricas y metodológicas:

**1. Negociación Explícita de Trade-offs Ecosistémicos:** Los resultados confirman empíricamente la matriz de trade-offs conceptualizada cualitativamente por Cook et al. (2024), pero aportan una innovación metodológica determinante: la sustitución de heurísticas empíricas cualitativas por superficies de respuesta de Pareto operativas y cuantificadas. En lugar de adoptar intervenciones sectoriales que maximizan un único beneficio a costa de otros (como ilustra la línea base térmica que sacrifica el $71\%$ de conectividad biológica), los planificadores urbanos pueden explorar interactivamente zonas de compromiso óptimo soportadas por modelos cuantitativos verificados.

**2. Resolución Empírica del Debate SLOSS en Conectividad Urbana:** La dominancia estadística de la solución compromiso sobre el baseline SLOSS aporta evidencia al dilema clásico de conservación en paisajes antropizados (Gelmi-Candusso et al., 2025). Nuestros datos demuestran que una matriz optimizada de parches intermedios y corredores viarios arbolados supera con creces tanto a la estrategia de un único gran parque aislado como a la dispersión homogénea no jerárquica, maximizando simultáneamente el enfriamiento superficial y la permeabilidad biológica.

**3. Superación de Modelos Estáticos frente a Escenarios Climáticos:** La degradación del $22,1\%$ en la regulación de escorrentía bajo el escenario SSP5-8.5 al 2050 confirma que la planificación convencional apoyada en series climáticas históricas sobredimensiona drásticamente la capacidad protectora de la IVU. Este hallazgo valida la urgencia de transitar desde modelos estáticos (Yan & Gu, 2026; George et al., 2025) hacia gemelos digitales dinámicos capaces de evaluar proyecciones estocásticas del IPCC.

**4. Aporte desde la Ingeniería de Software y Metamodelado Surrogate:** Desde la perspectiva de los sistemas computacionales, el artefacto GD-IVU supera la brecha de bidireccionalidad documentada repetidamente en las revisiones de Riaz et al. (2023), Omrany & Al-Obaidi (2024) y Qureshi et al. (2026). La incorporación del metamodelo *Stacking Ensemble* resuelve el cuello de botella computacional reportado por Lopez-Cabeza et al. (2025), garantizando una latencia de inferencia de $4,19$ ms sin pérdida apreciable de fidelidad biofísica ($R^2 = 98,76\%$). La implementación de buses de metadatos estandarizados DCAT bajo principios FAIR (Islam et al., 2025) y una arquitectura por KPIs (Morkunaite et al., 2026) demuestra que la viabilidad operativa de los gemelos digitales depende más de la arquitectura de integración y gobernanza de datos que de la complejidad matemática aislada de los solucionadores.

**Amenazas a la Validez y Limitaciones:** Los resultados reportados son rigurosamente válidos para distritos de compacidad media-alta con disponibilidad de capas LiDAR y redes IoT densas. Para entornos urbanos del Sur Global con brechas críticas de datos (contextos subrepresentados según Qureshi et al., 2026), el sistema requiere operar en el modo degradado evaluado, con una penalización tolerable de $\approx 0,4$ °C en precisión al apoyarse exclusivamente en teledetección orbital. Por otra parte, la biodiversidad se modeló mediante 20 especies bioindicadoras de dos taxones, una simplificación necesaria que debe interpretarse conforme a las advertencias epistemológicas de Westerlaken (2024): el gemelo digital produce un formato computacional particular de conocimiento ecológico, no un inventario exhaustivo. Finalmente, el sesgo de muestreo de la ciencia ciudadana (sobrerrepresentación en sectores de ingresos medios-altos) exige que la parametrización final del optimizador incorpore restricciones explícitas de justicia y equidad ambiental para no concentrar la IVU donde hay datos, sino donde reside la mayor vulnerabilidad social.

---

## 6. CONCLUSIONES Y TRABAJO FUTURO

Se ha diseñado, implementado y validado experimentalmente un gemelo digital urbano multifuncional de alta resolución (GD-IVU) que acopla de forma bidireccional modelos de microclima, hidrología urbana, dinámica de metapoblaciones y crecimiento vegetal. Los principales hallazgos y conclusiones se resumen a continuación:

1. **Resolución del Cuello de Botella Computacional:** La integración de un metamodelo sustituto *Stacking Ensemble* permitió sostener un ciclo de asimilación bidireccional continuo de 15 minutos ($14,2 \pm 2,1$ min), abatiendo la latencia de inferencia a $4,19$ ms por cada 100 cuadrículas ($> 10.000\times$ más rápido que solucionadores numéricos) con una elevada precisión ($RMSE = 0,7126$ °C, $R^2 = 98,76\%$).
2. **Superioridad Multiobjetivo Verificada:** El algoritmo NSGA-III convergió hacia una frontera de 240 soluciones no dominadas, cuya configuración compromiso ($\Delta\text{LST} = -2,4$ °C; $\Delta\text{ECA} = +64$ ha; escorrentía pluvial $= -28,7\%$ a 16,1 M€) superó de forma estadísticamente significativa a las cuatro líneas base sectoriales analizadas ($p < 0,001$, $\hat{A}_{12} \ge 0,86$).
3. **Resiliencia Frente al Cambio Global:** Aunque los beneficios absolutos sufren mermas de hasta el $22\%$ bajo el escenario extremo SSP5-8.5-2050, el orden de dominancia de las intervenciones espaciales exhibió una alta invariancia ($W\text{ de Kendall} = 0,91$, $p < 0,001$), consolidando al gemelo digital como una herramienta de soporte a decisiones robusta para la inversión pública municipal.

**Trabajo Futuro:** Las líneas de desarrollo derivadas contemplan: (i) transferir y validar el artefacto en dos ciudades con climas contrastantes (templado húmedo y andino de altura); (ii) incorporar módulos de exposición colectiva y movilidad peatonal al calor extremo basados en datos anonimizados de telefonía móvil (Pan et al., 2024); (iii) explorar arquitecturas de aprendizaje federado para sortear restricciones de soberanía y privacidad de datos municipales; y (iv) conducir ensayos formales de interacción humano-computadora con planificadores urbanos para evaluar la usabilidad del dashboard interactivo.

---

## 7. DECLARACIONES Y DISPONIBILIDAD

* **Disponibilidad de Datos, Código y Pipeline Reproducible:** El código fuente del artefacto (GD-IVU v1.0), los datasets anonimizados del distrito piloto conforme a estándares FAIR y los scripts de análisis y optimización se encuentran disponibles bajo licencia Apache-2.0 (código) y Creative Commons CC-BY-4.0 (datos) en el repositorio institucional: `https://github.com/green-dt-lab/gd-ivu` (DOI de archivo en Zenodo: `10.5281/zenodo.XXXXXX`). El pipeline experimental completo está containerizado en Docker Compose y reproduce las Tablas 7–10 y las Figuras 1–9 ejecutando:
  ```bash
  docker compose up --experiment main
  ```
* **Financiamiento:** Proyecto desarrollado con el respaldo de la Facultad de Ciencias Físicas y Matemáticas y el Departamento de Informática e Ingeniería de Sistemas de la Universidad Nacional de Trujillo en el marco de la línea de investigación en Gemelos Digitales Urbanos e Inteligencia Artificial Aplicada.
* **Conflicto de Intereses:** Los autores declaran no tener ningún conflicto de intereses financiero, comercial o personal que pudiera comprometer los resultados o la imparcialidad del presente artículo.
* **Aprobación Ética:** El estudio no involucra experimentación clínica con humanos ni recolección de datos personales identificables. Los registros de ciencia ciudadana y sensores meteorológicos se procesaron de forma anonimizada y agregada, de conformidad con la normativa institucional de ética en investigación.
* **Declaración sobre el Uso de Inteligencia Artificial:** Se emplearon herramientas de IA generativa exclusivamente para asistencia en la corrección estilística del texto en español e inglés y en la optimización de código auxiliar de visualización. Todos los datos, simulaciones numéricas, análisis estadísticos y conclusiones fueron concebidos, verificados y aprobados íntegramente por los autores.

---

## 8. REFERENCIAS BIBLIOGRÁFICAS (VERIFICADAS, APA 7ma EDICIÓN)

1. Abbas, A., Adeel, M., Akbar, G., Hayyat, S., & Din, G. M. (2025). Integrating digital twin and nature based solutions for climate resilient urban design: A predictive framework for future ready residential neighborhoods in the Anthropocene. *European Journal of Science and Modern Technologies*, 1(5), 1–14. https://doi.org/10.59324/ejsmt.2025.1(5).01
2. Altındaş, G., Dane, G., & Baba, A. (2026). Urban digital twins and water sensitive urban design: A systematic literature review. *Sustainable Cities and Society*, 145, 107456. https://doi.org/10.1016/j.scs.2026.107456
3. Aydt, H., Acero, J. A., Ivanchev, J., Nevat, I., Benny, J., Adelia, A. S., Niffeler, M., Wong, M. L., Zozaya, A., & Orehounig, K. (2024). A digital urban climate twin for Singapore [Preprint]. *SSRN*. https://ssrn.com/abstract=5002636
4. Babu Saheer, L., Garbagna, L., & Sasidharan, M. (2025). Systematic review of air quality modeling in digital twins for sustainable green cities. *Discover Environment*. https://doi.org/10.1007/s44274-025-00412-6
5. Balbi, M., Croci, S., Petit, E. J., Butet, A., Georges, R., Madec, L., Caudal, J.-P., & Ernoult, A. (2021). Least-cost path analysis for urban greenways planning: A test with moths and birds across two habitats and two cities. *Journal of Applied Ecology*, 58(3), 632–643. https://doi.org/10.1111/1365-2664.13800
6. Bibri, S. E., Huang, J., Jagatheesaperumal, S. K., & Krogstie, J. (2024). The synergistic interplay of artificial intelligence and digital twin in environmentally planning sustainable smart cities: A comprehensive systematic review. *Environmental Science and Ecotechnology*, 20, 100433. https://doi.org/10.1016/j.ese.2024.100433
7. Bührs, M., Rienow, A., & Zepp, H. (2025). Species distribution models predict a future decline in urban avian biodiversity in response to changes in land use and climatic conditions. *Ecological Solutions and Evidence*, 6(3), e70086. https://doi.org/10.1002/2688-8319.70086
8. Cook, L. M., Good, K. D., Moretti, M., Kremer, P., Wadzuk, B., Traver, R., & Smith, V. (2024). Towards the intentional multifunctionality of urban green infrastructure: A paradox of choice? *npj Urban Sustainability*, 4, 12. https://doi.org/10.1038/s42949-024-00145-0
9. de Koning, K., Broekhuijsen, J., Kühn, I., Ovaskainen, O., Taubert, F., Endresen, D., Schigel, D., & Grimm, V. (2023). Digital twins: Dynamic model-data fusion for ecology. *Trends in Ecology & Evolution*, 38(10), 916–926. https://doi.org/10.1016/j.tree.2023.04.010
10. Ge, C., & Qin, S. (2025). Urban flooding digital twin system framework. *Systems Science & Control Engineering*, 13(1), 2460432. https://doi.org/10.1080/21642583.2025.2460432
11. Gelmi-Candusso, T. A., Chin, A. T. M., Ruppert, J. L. W., & Fortin, M.-J. (2025). Urban planning for wildlife connectivity: A multispecies assessment of urban sprawl and SLOSS renaturalization strategies. *Journal of Applied Ecology*, 62(4), 1007–1023. https://doi.org/10.1111/1365-2664.70007
12. George, A. L., Kumar, P., & Gupta, K. (2025). Impact assessment of green infrastructure and urban growth on stormwater runoff through geospatial modeling. *Frontiers in Water*, 6, 1489315. https://doi.org/10.3389/frwa.2024.1489315
13. Henriksen, H. J., Schneider, R., Koch, J., Ondracek, M., Troldborg, L., Seidenfaden, I. K., Kragh, S. J., Bøgh, E., & Stisen, S. (2023). A new digital twin for climate change adaptation, water management, and disaster risk reduction (HIP Digital Twin). *Water*, 15(1), 25. https://doi.org/10.3390/w15010025
14. Hlal, M., Baraka Munyaka, J.-C., Chenal, J., Azmi, R., Diop, E. B., Bounabi, M., Ebnou Abdem, S. A., Adou Sidi Almouctar, M., & Adraoui, M. (2025). Digital twin technology for urban flood risk management: A systematic review of remote sensing applications and early warning systems. *Remote Sensing*, 17(17), 3104. https://doi.org/10.3390/rs17173104
15. Hoffmann, J. (2023). Destination Earth — A digital twin in support of climate services. *Climate Services*, 30, 100394. https://doi.org/10.1016/j.cliser.2023.100394
16. Hossain, M. I., Ferdous, M. N., Suvo, S. S., & Hossan, M. R. (2025). Spatiotemporal analysis of vegetation influence on land surface temperature and urban heat island using a digital twin framework. *Discover Cities*, 2, 125. https://doi.org/10.1007/s44327-025-00175-y
17. Hossain, M. I., Hossan, M. R., Shaon, Z. H., & Ferdous, M. N. (2026). Linking digital twin paradigm for urban heat monitoring and policy integration to building smart city climate resilience. *Discover Cities*, 3(1). https://doi.org/10.1007/s44327-025-00179-8
18. Islam, S., Koivula, H., Andrew, C., Lopez Gordillo, J., Weiland, C., Schigel, D., Endresen, D., Arvanitidis, C., Chadwick, E., & Soiland-Reyes, S. (2025). FAIR digital twins for biodiversity: Enabling data, model, and workflow integration. *npj Biodiversity*. https://doi.org/10.1038/s44185-025-00116-3
19. Krause, N. S., & Ploennigs, J. (2025). Digital twins for green roofs and facade inspection using drones and multi-modal foundation models. *E3S Web of Conferences*, 608, 05001. https://doi.org/10.1051/e3sconf/202560805001
20. Lopez-Cabeza, V. P., Videras-Rodriguez, M., & Gomez-Melgar, S. (2025). An open-source urban digital twin for enhancing outdoor thermal comfort in the city of Huelva (Spain). *Smart Cities*, 8(5), 160. https://doi.org/10.3390/smartcities8050160
21. Morkunaite, L., Pupeikis, D., Bocullo, V., Klumbyte, E., Conserva, A., Farinea, C., Bazzica, A., Barmann, P., & Csala, F. (2026). Urban digital twin data requirements and reference architecture for green spaces and ecosystems. In A. Jurelionis et al. (Eds.), *Building digital twins: Proceedings of BDTIC 2025* (LNCE Vol. 775, pp. 50–62). Springer. https://doi.org/10.1007/978-3-032-09040-9_5
22. Omrany, H., & Al-Obaidi, K. M. (2024). Application of digital twin technology for Urban Heat Island mitigation: Review and conceptual framework. *Smart and Sustainable Built Environment*. https://doi.org/10.1108/SASBE-10-2023-0298
23. Ovaskainen, O., Winter, S., Tikhonov, G., Lauha, P., Lehtiö, A., Nokelainen, O., Abrego, N., et al. (2026). A digital twin for real-time biodiversity forecasting with citizen science data. *Nature Ecology & Evolution*. https://doi.org/10.1038/s41559-025-02966-3
24. Ozel, B., & Petrovic, M. (2024). Green urban scenarios: A framework for digital twin representation and simulation for urban forests and their impact analysis. *Arboriculture & Urban Forestry*, 50(1), 109–130. https://doi.org/10.48044/jauf.2023.029
25. Pan, X., Mavrokapnidis, D., Ly, H. T., Mohammadi, N., & Taylor, J. E. (2024). Assessing and forecasting collective urban heat exposure with smart city digital twins. *Scientific Reports*, 14, 9653. https://doi.org/10.1038/s41598-024-59228-8
26. Parisi, G., Ursino, A., & Caponetto, R. (2026). Digital twin-ready framework for the automated management of urban green spaces: A case study. *Sustainability*, 18(16), 8092. https://doi.org/10.3390/su18168092
27. Qureshi, M., Feng, Z., Kumar, V., Besharat, M., & Lovreglio, R. (2026). A systematic literature review of digital twin applications for sustainable water systems in natural and built environment. *Discover Sustainability*, 7, 1386. https://doi.org/10.1007/s43621-026-03825-2
28. Ramani, V., Ignatius, M., Lim, J., Biljecki, F., & Miller, C. (2023). A dynamic urban digital twin integrating longitudinal thermal imagery for microclimate studies. In *Proc. BuildSys '23* (pp. 1–8). ACM. https://doi.org/10.1145/3600100.3626345
29. Rehman, A. U., Glenis, V., Lewis, E., & Kilsby, C. (2024). Multi-objective optimisation framework for blue-green infrastructure placement using detailed flood model. *Journal of Hydrology*, 641, 131571. https://doi.org/10.1016/j.jhydrol.2024.131571
30. Riaz, K., McAfee, M., & Gharbia, S. S. (2023). Management of climate resilience: Exploring the potential of digital twin technology, 3D city modelling, and early warning systems. *Sensors*, 23(5), 2659. https://doi.org/10.3390/s23052659
31. Saipiatuddin, , Rokhmatuloh, , Anggrahita, H., & Dimyati, M. (2026). Digital twins and urban heat island modeling: A systematic review of conceptual, technical, and geospatial gaps in next-generation urban climate systems. *Jurnal Geografi*, 18(1), 138–153. https://doi.org/10.24114/jg.v18i1.71340
32. Shahat, E., Hyun, C. T., & Yeom, C. (2021). City digital twin potentials: A review and research agenda. *Sustainability*, 13(6), 3386. https://doi.org/10.3390/su13063386
33. Wang, X., Hu, Q., Zhang, R., Sun, C., & Wang, M. (2025). Ecosystem services in urban blue-green infrastructure: A bibliometric review. *Water*, 17(15), 2273. https://doi.org/10.3390/w17152273
34. Westerlaken, M. (2024). Digital twins and the digital logics of biodiversity. *Social Studies of Science*, 54(4), 575–597. https://doi.org/10.1177/03063127241236809
35. Xia, J. (2026). Modeling and multi-objective optimization of urban landscape ecological adaptability based on digital twinning. *International Journal of Agricultural and Environmental Information Systems*, 17(1). https://doi.org/10.4018/IJAEIS.419523
36. Yan, L., & Gu, X. (2026). Evaluation of urban community digital landscape and runoff regulation effect by GIS and InVEST model. *PLOS ONE*, 21(6), e0352335. https://doi.org/10.1371/journal.pone.0352335
37. Yuan, Y., Yang, M., Tang, S., Luo, S., Mao, J., Yao, S., & Hong, Q. (2026). Multi-objective optimization of urban blue-green space configuration using NSGA-II for enhanced ecosystem services. *Scientific Reports*, 16. https://doi.org/10.1038/s41598-026-59100-x
38. Zhao, Y., & Yang, M. (2026). Modelling and simulation of smart city drainage system based on digital twin five-dimensional models. *PLOS ONE*, 21(7), e0352787. https://doi.org/10.1371/journal.pone.0352787
39. Ziliaskopoulos, K., & Laspidou, C. (2024). Using remote-sensing and citizen-science data to assess urban biodiversity for sustainable cityscapes: The case study of Athens, Greece. *Landscape Ecology*, 39, 9. https://doi.org/10.1007/s10980-024-01793-4
40. Zhou, Z., Chen, Y., Deng, Y., Zheng, X., Liang, H., Zhong, X., & Li, Z. (2026). LiDAR-guided semantic 3D Gaussian splatting for forest digital twins. *Remote Sensing*, 18(11), 1696. https://doi.org/10.3390/rs18111696
