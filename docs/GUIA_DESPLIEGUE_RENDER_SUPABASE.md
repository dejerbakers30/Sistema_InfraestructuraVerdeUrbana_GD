# 🚀 Guía de Despliegue 100% Gratuito: Render + Supabase
**Gemelo Digital de Infraestructura Verde Urbana**

Esta guía detalla paso a paso cómo desplegar la solución completa en la nube sin costo alguno, utilizando la arquitectura recomendada:
* **Base de Datos Geoespacial (PostGIS):** [Supabase](https://supabase.com) (Plan Free permanente).
* **Backend API (FastAPI):** [Render](https://render.com) (Web Service Docker Free).
* **Frontend Web (Next.js):** [Render](https://render.com) (Web Service Docker Free).

---

## 🏛 Arquitectura en la Nube

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO / NAVEGADOR                      │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                FRONTEND WEB (Next.js 14)                    │
│   • Hosting: Render (Web Service Docker Free)               │
│   • URL: https://gemelo-digital-frontend.onrender.com       │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / REST API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND API (FastAPI)                      │
│   • Hosting: Render (Web Service Docker Free)               │
│   • URL: https://gemelo-digital-backend.onrender.com        │
└──────────────────────────────┬──────────────────────────────┘
                               │ TCP / SSL (:5432)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             BASE DE DATOS (Supabase Cloud)                  │
│   • Motor: PostgreSQL 15 + Extensión PostGIS 3.3            │
│   • Ventaja: 100% Gratuito, No caduca a los 30 días        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Paso 1: Crear la Base de Datos en Supabase (5 minutos)

1. Ingresa a [https://supabase.com](https://supabase.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"New Project"**.
3. Completa los datos:
   * **Name:** `gemelo-digital-urbano`
   * **Database Password:** Elige una contraseña segura (anótala, la necesitarás).
   * **Region:** Elige `East US (North Virginia)` o la más cercana a Ohio (la misma región que Render para menor latencia).
   * **Pricing Plan:** Free ($0/month).
4. Espera ~1 minuto a que el proyecto termine de crearse.

### Obtener la cadena de conexión (Connection String):
1. En tu panel de Supabase, ve a **Project Settings** (icono de engranaje abajo a la izquierda) → **Database**.
2. Desplázate hasta **Connection string** y selecciona la pestaña **URI**.
3. El formato que te da Supabase es:
   ```text
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   ```
   o conexión directa:
   ```text
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
4. **IMPORTANTE para FastAPI (Async SQLAlchemy):**
   Debes anteponer `+asyncpg` y añadir el parámetro SSL al final:
   ```text
   postgresql+asyncpg://postgres:[TU-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?ssl=require
   ```

---

## 📋 Paso 2: Inicializar Tablas y Usuario Administrador

Tienes dos formas sencillas de inicializar tu base de datos en Supabase:

### Opción A: Desde tu terminal local con el script automatizado (Recomendada)
Ejecuta en tu terminal el inicializador con tu cadena de conexión:
```bash
DATABASE_URL="postgresql+asyncpg://postgres:[TU-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?ssl=require" python3 scripts/seed_supabase.py
```
El script automáticamente:
1. Activa la extensión **PostGIS**.
2. Crea todas las tablas del Gemelo Digital (proyectos, escenarios, usuarios, sensores, etc.).
3. Inserta el usuario inicial:
   * **Email:** `admin@gemelodigital.com`
   * **Clave:** `admin123`

### Opción B: Desde el SQL Editor de Supabase
1. En Supabase, abre el menú **SQL Editor** en la barra lateral izquierda.
2. Abre en tu editor el archivo [`scripts/init_db.sql`](file:///run/media/pandaman/Datos1/UNT/4to%20A%C3%91O/VIII/Software%20II/GemelosDigitales/Sistema_InfraestructuraVerdeUrbana_GD/scripts/init_db.sql).
3. Pega su contenido en el SQL Editor de Supabase y presiona **Run**.

---

## 📋 Paso 3: Desplegar el Backend en Render

1. Sube tus cambios a tu repositorio de GitHub:
   ```bash
   git add .
   git commit -m "feat: configuracion para despliegue en Render y Supabase"
   git push origin main
   ```
2. Entra a [https://dashboard.render.com](https://dashboard.render.com) e inicia sesión con tu GitHub.
3. Haz clic en **"New +"** → **"Web Service"**.
4. Conecta tu repositorio de GitHub.
5. Configura el servicio del Backend:
   * **Name:** `gemelo-digital-backend`
   * **Region:** `Ohio (US East)`
   * **Branch:** `main`
   * **Root Directory:** *(dejar en blanco)*
   * **Runtime:** `Docker`
   * **Dockerfile Path:** `./backend/Dockerfile`
   * **Docker Build Context:** `.`
   * **Instance Type:** `Free`
6. En la sección **Environment Variables**, añade:

| Key | Value |
| :--- | :--- |
| `ENVIRONMENT` | `production` |
| `SECRET_KEY` | `gemelo-prod-secret-jwt-key-2026-super-safe` *(o genera una cadena aleatoria)* |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `120` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` |
| `USE_TIMESCALEDB` | `false` |
| `DATABASE_URL` | `postgresql+asyncpg://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres?ssl=require` |
| `CORS_ORIGINS` | `*` *(o pon la URL de tu frontend cuando la tengas)* |

7. Haz clic en **"Create Web Service"**.
8. Una vez desplegado, Render te asignará una URL como:
   `https://gemelo-digital-backend.onrender.com`
   *(Verifícalo abriendo `https://gemelo-digital-backend.onrender.com/docs` en tu navegador).*

---

## 📋 Paso 4: Desplegar el Frontend en Render

1. En Render, haz clic nuevamente en **"New +"** → **"Web Service"**.
2. Conecta el mismo repositorio de GitHub.
3. Configura el servicio del Frontend:
   * **Name:** `gemelo-digital-frontend`
   * **Region:** `Ohio (US East)`
   * **Branch:** `main`
   * **Runtime:** `Docker`
   * **Dockerfile Path:** `./frontend/Dockerfile`
   * **Docker Build Context:** `.`
   * **Instance Type:** `Free`
4. En **Docker Build Arguments** (o Environment Variables), añade:

| Key | Value |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://gemelo-digital-backend.onrender.com/api/v1` *(Usa la URL de tu backend del Paso 3)* |

5. En **Environment Variables**, añade:

| Key | Value |
| :--- | :--- |
| `PORT` | `3000` |
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_API_URL` | `https://gemelo-digital-backend.onrender.com/api/v1` |

6. Haz clic en **"Create Web Service"**.

---

## 📋 Paso 5: Ajuste de CORS Final

Una vez que tu Frontend termine de desplegarse y tenga su URL (ej: `https://gemelo-digital-frontend.onrender.com`):
1. Ve al panel de tu **Backend** en Render → pestaña **Environment**.
2. Edita la variable `CORS_ORIGINS` para agregar el dominio de tu frontend:
   ```text
   CORS_ORIGINS=https://gemelo-digital-frontend.onrender.com,http://localhost:3000
   ```
3. Guarda los cambios. Render reiniciará automáticamente el backend con los nuevos permisos.

---

## 💡 Consejos para la Presentación / Sustentación

1. **Tiempo de Inactividad (Cold Start) del Plan Gratuito:**
   En el plan gratuito de Render, si no hay visitas durante 15 minutos, el servidor entra en reposo (*sleep*). La primera petición puede tardar entre 30 y 45 segundos en despertar.
   * *Tip para la sustentación:* Abre la web 5 minutos antes de tu exposición para que los servidores estén calientes y respondan de forma instantánea.
2. **Credenciales de acceso para el docente:**
   * **Email:** `admin@gemelodigital.com`
   * **Contraseña:** `admin123`
