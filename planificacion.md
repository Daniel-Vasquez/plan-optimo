# Planificación — TrackFit → Plataforma integral de Fitness, Rendimiento y Nutrición

> **Documento de arquitectura y hoja de ruta.** Fase 1: análisis y planificación. No se ha escrito ni modificado código de aplicación.
> **Fuentes del análisis:** estructura real del repositorio (`src/`, `astro.config.mjs`, `package.json`, `tailwind.config.js`) y el plan de entrenamiento `rutina.md`.
> **Fecha:** 2026-09-14 · **Estado:** Tandas 0-4 ✅ completadas · siguiente: Tanda 5 (plan y fuerza).

---

## Índice

1. [Análisis del Estado Actual y Rediseño](#1-análisis-del-estado-actual-y-rediseño)
2. [Especificación de Nuevas Funcionalidades y Rutas](#2-especificación-de-nuevas-funcionalidades-y-rutas)
3. [Hoja de Ruta por Tandas](#3-hoja-de-ruta-por-tandas-roadmap-incremental)
4. [Requerimientos consolidados de tu lado](#4-requerimientos-consolidados-de-tu-lado)
5. [Riesgos y decisiones abiertas](#5-riesgos-y-decisiones-abiertas)

---

## 1. Análisis del Estado Actual y Rediseño

### 1.1 Diagnóstico técnico del repositorio

**Stack actual:** Astro 7.3.2 · Tailwind v3 (vía `@astrojs/tailwind`) · Alpine.js 3 · Chart.js 4 (desde CDN) · persistencia 100 % en `localStorage`. Sin backend, sin adaptador SSR, sin base de datos, sin autenticación.

**⚠️ Hallazgo bloqueante — ✅ RESUELTO en la Tanda 0** (verificado ejecutando `npm run build`):

```
[ERROR] [@astrojs/tailwind] An unhandled error occurred while running the "astro:config:setup" hook
Cannot read properties of undefined (reading 'postcss')
```

El árbol de trabajo tiene `@astrojs/tailwind@2.1.3` instalado junto a `astro@7.3.2`. La versión 2.x de esa integración es de la era Astro 1.x y es incompatible: **el proyecto no compila hoy**. El `git diff` de `package.json` muestra que se bajó de `^5.1.0` a `^2.1.3` mientras se subía Astro de `^5.18.2` a `^7.3.2` — presumiblemente un ajuste manual equivocado durante la pelea con el build de Vercel. Esto se arregla en la Tanda 0 antes de tocar nada más.

> **Resolución:** se migró a Tailwind v4 con el plugin oficial `@tailwindcss/vite`, que es el camino soportado en Astro 7. Detalle en la Tanda 0 (§3).

### 1.2 Inventario: qué se reutiliza, qué se adapta, qué se retira

| Archivo actual | Destino | Justificación |
|---|---|---|
| `src/layouts/Layout.astro` (678 líneas) | **Reescritura profunda** | Contiene sidebar lateral `w-60` + bottom-nav mobile. El nuevo requisito es header `fixed top-0`. Se conserva el script inline de tema (dark/light sin flash), el `<ClientRouter />` y los metas PWA; se extrae el modal de onboarding a un flujo de registro real. |
| `src/styles/global.css` | **Adaptado en Tanda 0** | El sistema de tokens como tripletes RGB + `--edge` para overlays es sólido y soporta dark/light; se conserva tal cual. Los tripletes se movieron de `--color-*` a `--rgb-*` porque en v4 el namespace `--color-*` le pertenece al motor de temas. Es la base visual de todo lo nuevo. |
| ~~`tailwind.config.js`~~ | **Eliminado en Tanda 0** | Tailwind v4 no usa config JS: el tema vive en `global.css` dentro de `@theme inline`. El helper `withOpacity` ya no hace falta — v4 resuelve los modificadores de opacidad con `color-mix()`. Los colores de dominio (`protein`, `carbs`, `fat`, `water`, `strength`, `run`) se añadirán a ese bloque. |
| `src/scripts/storage.js` (300 líneas) | **Se sustituye por una capa de datos** | Toda la lógica de negocio útil (`toDateStr`, `todayStr`, `getStreak`, `getWeekCompletion`, `getCurrentWeek`, cálculo de rachas y ritmos) **se rescata** y migra a `src/lib/date.ts` y `src/lib/metrics.ts`. El acceso a `localStorage` se reemplaza por llamadas a `/api/*`. El comentario de `toDateStr` sobre no usar `toISOString()` es correcto y se mantiene como regla del proyecto. |
| `src/components/LineChart.astro` | **Se adapta** | Buen wrapper de Chart.js con soporte de tema, línea de referencia, eje Y invertido para ritmo. Se le añade `BarChart.astro` y `DonutChart.astro` hermanos y se corrige la dependencia de un `Chart` global. |
| `src/components/MetricCard.astro`, `SessionBadge.astro`, `DayPill.astro`, `WeekBar.astro`, `Toast.astro` | **Se conservan** | Componentes pequeños y bien acotados; sólo se amplían props (p. ej. `SessionBadge` necesita los tipos nuevos: `fuerza-a`, `fuerza-b`, `fuerza-c`, `vo2max`, `umbral`, `tirada`, `voleibol`, `caminata`). |
| `src/pages/index.astro` | **Se adapta** | Sigue siendo el dashboard; pasa de leer `localStorage` a recibir datos del servidor y gana tarjetas de agua, nutrición y adherencia. |
| `src/pages/calendar.astro` | **Se adapta y renombra** a `/calendario` | La lógica de rejilla semana/mes se reutiliza; se conecta a la colección `attendance`. |
| `src/pages/day/index.astro` (329 líneas) | **Se descompone** | Hoy mezcla fuerza, agua, carrera y notas en un solo render imperativo de 200 líneas de plantilla en string. Se parte en componentes por módulo. |
| `src/pages/progress.astro` | **Se divide** en `/progreso-running` y `/progreso-fuerza` | Hoy mezcla ritmo, distancia y agua en una sola página. |
| `src/pages/notes.astro` | **Se conserva** | Funcionalidad válida; sólo cambia la persistencia a Mongo. |
| `src/pages/settings.astro` | **Se adapta** a `/ajustes` | Pasa a editar el perfil real del usuario autenticado (peso, altura, metas de macros, meta de agua). |
| **Plan hardcodeado** `DAY_SESSION_MAP` (duplicado en `storage.js` **y** en `day/index.astro`) | **Se elimina y sustituye** | Es el mayor problema de diseño actual: el plan está duplicado en dos archivos y **no corresponde a `rutina.md`** (dice «Sentadilla goblet», «Hip thrust», «Zancadas»; la rutina real es búlgara, RDL y elevación de talón). Pasa a ser una única fuente de verdad versionada: `src/data/plan.ts` sembrado en la colección `plan_templates`. |

### 1.3 Del `rutina.md` al modelo de dominio

`rutina.md` no es documentación suelta: es **la especificación funcional del dominio**. Lo que define y que el modelo debe capturar:

- **Ciclo semanal fijo** (7 días con estímulo asignado): Lun Fuerza A · Mar VO₂máx AM + Fuerza B PM · Mié descanso · Jue Umbral AM + Fuerza C PM · Vie caminata + core · Sáb voleibol 4 h · Dom tirada larga.
- **3 sesiones de fuerza** con ejercicios prescritos: series × rango de reps, RIR/RPE objetivo, descanso en segundos, tempo y peso de partida en libras. Ej.: *Press banca mancuernas 2×35 lb — 4 series × 8-10 reps — RIR 2 — 90" — tempo 3-1-1*.
- **Superserie** (3A/3B en Sesión C) → el modelo necesita un campo `supersetGroup`.
- **Doble progresión** + **Escalera de Densificación de 10 peldaños** → cada ejercicio del usuario lleva un `densificationStep` (1-10) y un histórico.
- **Bloques de 4 semanas** con semana 4 de descarga (RIR 4, mitad de series) → el plan es función de la semana del ciclo.
- **Progresión mensual de carrera** por rango de semanas (1-2, 3-4, 5-6, 7-8) con sesiones distintas.
- **Ritmos objetivo por tipo de sesión** (fácil 7:15-7:45, umbral 6:15-6:25, VO₂máx 5:45-5:55, velocidad 5:20-5:30) → el gráfico de ritmo necesita bandas objetivo, no sólo una línea.
- **Metas nutricionales cuantificadas**: 125-140 g proteína/día, 270-400 g carbos en días de entreno, 55-70 g grasa, 2.300-2.400 kcal días de entreno / 2.000-2.100 miércoles y viernes.
- **Meta de hidratación**: 2,5-3 L base; sábado de voleibol +750 ml/hora.
- **Métricas de seguimiento semanal**: peso (promedio de 3-4 pesajes), perímetro de cintura, foto cada 4 semanas, contrarreloj 5K en semanas 6 y 12.

**Decisión de diseño clave:** el plan vive en la base de datos como **plantilla versionada** (`plan_templates`), no hardcodeado. Al registrar una sesión se copia un *snapshot* de lo asignado dentro del documento de la sesión. Así, si mañana cambias el peso objetivo del press banca, las sesiones históricas siguen mostrando contra qué se comparó realmente ese día.

### 1.4 Modelo de datos en MongoDB

**Convenciones transversales**
- Todo documento de dominio lleva `userId: string` (el `_id` del usuario de Better Auth) **como primer campo de todo índice**.
- Fechas de calendario: `date: string` en formato `YYYY-MM-DD` **en hora local del usuario**, nunca `Date` UTC (evita el bug de corrimiento de día ya documentado en `storage.js`). Las marcas de tiempo de auditoría (`createdAt`, `updatedAt`) sí son `Date` UTC.
- Pesos en **kg** internamente, con `displayUnit: 'kg' | 'lb'` en el perfil (la rutina está en libras; se muestra en libras, se guarda en kg para poder graficar).
- Distancias en **km**, duraciones en **segundos**, volúmenes en **ml**, macros en **gramos**.

#### Colecciones de Better Auth (gestionadas por la librería)

| Colección | Contenido |
|---|---|
| `user` | `_id`, `name`, `email` (único), `emailVerified`, `image`, `createdAt`, `updatedAt` |
| `account` | credenciales; para email/password guarda el hash (scrypt por defecto). `userId`, `providerId`, `password` |
| `session` | `userId`, `token`, `expiresAt`, `ipAddress`, `userAgent` |
| `verification` | tokens de verificación / reset de contraseña |

No se escriben a mano: Better Auth crea e indexa estas colecciones. Se extiende `user` con campos adicionales sólo si hacen falta a nivel de sesión; el resto del perfil va en `profiles`.

#### `profiles` — perfil físico y metas

```js
{
  _id, userId,                      // 1:1 con user
  displayName: "Daniel",
  birthDate: "1995-03-12",
  heightCm: 165,
  startWeightKg: 66.3,
  displayUnit: "lb",
  timezone: "America/Mexico_City",  // fuente de verdad para "hoy"
  planStartDate: "2026-09-15",      // ancla de "semana N del plan"
  planWeeks: 12,
  goals: {
    waterMlPerDay: 2750,
    waterVolleyballExtraMlPerHour: 750,
    proteinG: 130, carbsTrainingG: 330, carbsRestG: 250,
    fatG: 62, kcalTraining: 2350, kcalRest: 2050,
    target5kSeconds: 1725               // 28:45
  },
  baselines: { fiveKSeconds: 1840, tenKPaceSeconds: 378 },
  createdAt, updatedAt
}
```
Índice: `{ userId: 1 }` único.

#### `plan_templates` — el plan de 12 semanas versionado

```js
{
  _id, userId,                      // sembrado desde src/data/plan.ts al registrarse
  name: "Recomposición + 5K — 12 semanas",
  version: 1,
  active: true,
  weekPattern: {                    // 0=domingo … 6=sábado
    1: { sessions: [{ kind: "strength", templateId: "A", slot: "pm" }] },
    2: { sessions: [
          { kind: "running", runType: "vo2max", slot: "am" },
          { kind: "strength", templateId: "B", slot: "pm" }] },
    3: { sessions: [{ kind: "rest" }] },
    4: { sessions: [
          { kind: "running", runType: "threshold", slot: "am" },
          { kind: "strength", templateId: "C", slot: "pm" }] },
    5: { sessions: [{ kind: "walk", minutes: 20 }, { kind: "core", optional: true }] },
    6: { sessions: [{ kind: "volleyball", hours: 4, startHour: 8 }] },
    0: { sessions: [{ kind: "running", runType: "long", slot: "am" }] }
  },
  strengthTemplates: [{
    templateId: "A",
    label: "Pecho + Espalda",
    exercises: [{
      exerciseId: "press-banca-mancuernas",
      order: 1,
      sets: 4, repMin: 8, repMax: 10,
      targetRir: 2, targetRpe: 8,
      restSeconds: 90,
      tempo: "3-1-1",
      startLoadKg: 15.9,            // 35 lb por mancuerna
      loadMode: "perHand",
      supersetGroup: null,
      cue: "3\" bajando, 1\" pausa a 2 cm del pecho, subida explosiva"
    }, …]
  }, …],                            // A (4 ej.), B (3 ej.), C (4 ej. con superserie 3A/3B)
  runProgression: [                 // por rango de semanas
    { weekFrom: 1, weekTo: 2,
      vo2max:    { reps: 6, distanceM: 400, targetSeconds: 140, recoverySeconds: 90 },
      threshold: { reps: 3, distanceM: 1000, targetPaceSeconds: 380, recoverySeconds: 90 },
      long:      { minKm: 10, maxKm: 11, targetPaceSeconds: 450 } }, …
  ],
  blockRules: { deloadEveryWeeks: 4, deloadRir: 4, deloadSetMultiplier: 0.5, deloadRunVolumeCut: 0.3 },
  paceZones: {
    easy:     { minSeconds: 435, maxSeconds: 465 },
    threshold:{ minSeconds: 375, maxSeconds: 385 },
    vo2max:   { minSeconds: 345, maxSeconds: 355 },
    speed:    { minSeconds: 320, maxSeconds: 330 }
  },
  createdAt, updatedAt
}
```
Índices: `{ userId: 1, active: 1 }`, `{ userId: 1, version: -1 }`.

#### `exercises` — catálogo de ejercicios

```js
{
  _id, userId,                      // userId null = catálogo global semilla
  slug: "sentadilla-bulgara",
  name: "Sentadilla búlgara",
  muscleGroups: ["cuádriceps", "glúteo"],
  equipment: ["mancuernas", "banco"],
  unilateral: true,
  isCustom: false
}
```
Índices: `{ userId: 1, slug: 1 }` único, `{ slug: 1 }`.

#### `strength_sessions` — sesión de fuerza ejecutada

Núcleo del módulo de fuerza: guarda **asignado vs. realizado** por serie.

```js
{
  _id, userId,
  date: "2026-09-15",
  planWeek: 1,
  blockWeek: 1,                     // 1-4 dentro del bloque; 4 = descarga
  templateId: "A",
  label: "Fuerza A · Pecho + Espalda",
  status: "completed",              // planned | in_progress | completed | skipped | partial
  startedAt, finishedAt,
  durationSeconds: 3480,
  exercises: [{
    exerciseId: "press-banca-mancuernas",
    name: "Press banca con mancuernas",
    order: 1,
    supersetGroup: null,
    assigned: {                     // snapshot de la plantilla ese día
      sets: 4, repMin: 8, repMax: 10,
      targetRir: 2, restSeconds: 90, tempo: "3-1-1", loadKg: 15.9
    },
    densificationStep: 1,           // peldaño 1-10 de la Escalera
    sets: [
      { index: 1, reps: 8, loadKg: 15.9, rir: 2, completed: true, restTakenSeconds: 92, note: "" },
      { index: 2, reps: 8, loadKg: 15.9, rir: 2, completed: true },
      { index: 3, reps: 8, loadKg: 15.9, rir: 1, completed: true },
      { index: 4, reps: 7, loadKg: 15.9, rir: 0, completed: true }
    ],
    // campos derivados, calculados y persistidos al cerrar la sesión:
    totalReps: 31,                  // → métrica "reps totales por ejercicio" de rutina.md §4E
    volumeKg: 492.9,                // Σ(reps × loadKg × (unilateral ? 2 : 1))
    assignedReps: 32,
    completionPct: 96.9,            // realizado / asignado → la comparación que pediste
    bestSetE1rm: 20.1               // Epley, para la gráfica de progresión de fuerza
  }, …],
  sessionVolumeKg: 3120,
  sessionCompletionPct: 98,
  rpeGlobal: 8,
  sleepHours: 7.5,                  // alimenta la regla de autorregulación "<6 h → RIR 4"
  note: "",
  createdAt, updatedAt
}
```
Índices: `{ userId: 1, date: -1 }` único, `{ userId: 1, "exercises.exerciseId": 1, date: 1 }` (para la gráfica de progresión por ejercicio).

#### `running_sessions` — sesión de carrera

```js
{
  _id, userId,
  date: "2026-09-16",
  runType: "vo2max",                // vo2max | threshold | easy | long | race | timetrial
  planWeek: 1,
  status: "completed",
  distanceKm: 8.4,
  durationSeconds: 3120,
  avgPaceSeconds: 371,              // derivado: durationSeconds / distanceKm
  targetPaceSeconds: 350,
  paceDeltaSeconds: 21,             // realizado − objetivo; alimenta la alerta de fatiga (>5"/km, 2 semanas)
  elevationGainM: 45,
  avgHeartRate: 162, maxHeartRate: 178,
  intervals: [                      // sólo en sesiones de series
    { index: 1, distanceM: 400, durationSeconds: 139, paceSeconds: 348, recoverySeconds: 90 }, …
  ],
  perceivedEffort: 8,
  weather: { tempC: 22, humidity: 65 },
  shoes: "Pegasus 40",
  note: "",
  createdAt, updatedAt
}
```
Índices: `{ userId: 1, date: -1 }`, `{ userId: 1, runType: 1, date: -1 }`.

#### `water_logs` — hidratación, un documento por día

```js
{
  _id, userId,
  date: "2026-09-15",
  goalMl: 2750,                     // copiado del perfil; sube los sábados de voleibol
  totalMl: 2250,                    // desnormalizado para lectura rápida del dashboard
  entries: [
    { id, ml: 250, at: ISODate, source: "quick" },   // quick | custom | during-set
    { id, ml: 500, at: ISODate, source: "during-set", strengthSessionId, exerciseIndex: 2, setIndex: 3 }
  ],
  createdAt, updatedAt
}
```
Índice: `{ userId: 1, date: -1 }` único.
> El campo `source: "during-set"` con referencia a la serie es lo que habilita el requisito de «contador de agua por serie»: desde la pantalla de fuerza, cada descanso entre series ofrece un botón rápido de +250 ml que queda trazado a esa serie concreta.

#### `nutrition_logs` — nutrición, un documento por día

```js
{
  _id, userId,
  date: "2026-09-15",
  dayType: "training",              // training | rest  → determina la meta de kcal/carbos
  goals: { kcal: 2350, proteinG: 130, carbsG: 330, fatG: 62 },
  meals: [{
    id,
    slot: "breakfast",              // breakfast | lunch | dinner | snack | pre | post
    time: "08:30",
    items: [{
      foodId,                       // ref a `foods`, opcional
      name: "Huevo entero",
      quantity: 3, unit: "pieza",
      grams: 150,
      kcal: 233, proteinG: 19.8, carbsG: 1.1, fatG: 16.5
    }],
    kcal: 233, proteinG: 19.8, carbsG: 1.1, fatG: 16.5   // subtotal
  }],
  totals: { kcal: 2280, proteinG: 128, carbsG: 310, fatG: 60 },
  adherence: { kcalPct: 97, proteinPct: 98, carbsPct: 94, fatPct: 97 },
  note: "",
  createdAt, updatedAt
}
```
Índice: `{ userId: 1, date: -1 }` único.

#### `foods` — alimentos frecuentes (evita re-teclear macros)

```js
{
  _id, userId,                      // userId null = semilla global
  name: "Pechuga de pollo (crudo)",
  brand: null,
  servingGrams: 100,
  per100g: { kcal: 165, proteinG: 31, carbsG: 0, fatG: 3.6 },
  favorite: true,
  usageCount: 42
}
```
Índices: `{ userId: 1, name: "text" }`, `{ userId: 1, usageCount: -1 }`.

#### `attendance` — asistencia diaria (el calendario)

Documento por día y usuario. Es una **proyección** derivada de las sesiones, persistida para que el calendario mensual se resuelva con una sola consulta por rango.

```js
{
  _id, userId,
  date: "2026-09-15",
  planWeek: 1, blockWeek: 1,
  isDeloadWeek: false,
  planned: [{ kind: "strength", templateId: "A", slot: "pm" }],
  completed: [{ kind: "strength", refId: ObjectId, status: "completed" }],
  status: "completed",              // completed | partial | missed | rest | future
  adherencePct: 100,
  water: { totalMl: 2250, goalMl: 2750, pct: 82 },
  nutrition: { kcal: 2280, proteinG: 128, pct: 97 },
  weightKg: 66.1,                   // pesaje matutino opcional
  createdAt, updatedAt
}
```
Índices: `{ userId: 1, date: -1 }` único, `{ userId: 1, planWeek: 1 }`.
Se recalcula de forma idempotente (`upsert`) cada vez que se guarda una sesión, un log de agua o uno de nutrición de ese día.

#### `body_metrics` — seguimiento corporal semanal (rutina.md §4E)

```js
{ _id, userId, date, weightKg: 66.1, waistCm: 82.5, photoUrls: [], note, createdAt }
```
Índice: `{ userId: 1, date: -1 }` único.

#### `notes` — bitácora (migración de la página actual)

```js
{ _id, userId, date, title, content, tags: [String], linkedSessionId, createdAt, updatedAt }
```
Índices: `{ userId: 1, date: -1 }`, `{ userId: 1, title: "text", content: "text" }`.

#### Diagrama de relaciones

```
user (Better Auth)
 └─ 1:1 profiles
 └─ 1:N plan_templates ──► strengthTemplates[] ──► exercises (por slug)
 └─ 1:N strength_sessions ─┐
 └─ 1:N running_sessions ──┤
 └─ 1:N water_logs ────────┼──► attendance (proyección diaria, upsert por date)
 └─ 1:N nutrition_logs ────┘         └─ consumida por /calendario y el dashboard
 └─ 1:N body_metrics, notes, foods
```

### 1.5 Autenticación con Better Auth

**Configuración (`src/lib/auth.ts`)**

- Adaptador oficial `mongodbAdapter` sobre una instancia única del driver `mongodb` (patrón singleton con caché global para sobrevivir al hot-reload de dev y a la reutilización de contenedores serverless).
- `emailAndPassword: { enabled: true, minPasswordLength: 8, autoSignIn: true }`. Sin OAuth, sin magic links: autenticación simple, tal como pediste.
- `session: { expiresIn: 60*60*24*30, updateAge: 60*60*24, cookieCache: { enabled: true, maxAge: 300 } }` — 30 días, con caché de cookie firmada para no golpear Mongo en cada request.
- `trustedOrigins` con el dominio de producción; `advanced.cookiePrefix: "trackfit"`.
- Handler catch-all en `src/pages/api/auth/[...all].ts` exportando `ALL` → `auth.handler`.
- Cliente en `src/lib/auth-client.ts` (`createAuthClient` de `better-auth/client`) para `signIn`, `signUp`, `signOut` desde el navegador.

**Aislamiento estricto de datos por `userId` — cuatro capas, no una**

1. **Middleware** (`src/middleware.ts`): resuelve la sesión con `auth.api.getSession({ headers: context.request.headers })` una sola vez por request y la deja en `context.locals.user` / `context.locals.session`. Rutas públicas en una lista blanca explícita (`/login`, `/registro`, `/api/auth/*`, assets); todo lo demás redirige a `/login?redirect=<ruta>`.
2. **Repositorios** (`src/lib/db/repos/*.ts`): **ninguna consulta se construye sin `userId`**. Cada repositorio recibe el `userId` como primer argumento obligatorio y lo inyecta en el filtro. No se exportan funciones que acepten un filtro crudo desde fuera.
3. **Endpoints API**: helper `requireUser(locals)` que lanza 401 si no hay sesión. El `userId` **jamás** se lee del body ni de la query string — sólo de `locals`. Esto cierra la puerta al IDOR por parámetro manipulado.
4. **Índices únicos compuestos** con `userId` como prefijo: aunque un bug lograse pasar un filtro sin `userId`, la unicidad por día sigue siendo por usuario y no puede colisionar entre cuentas.

**Cambio de arquitectura que esto implica:** el sitio deja de ser estático. `astro.config.mjs` pasa a `output: 'server'` con `@astrojs/vercel` como adaptador, y las páginas que hoy renderizan desde `localStorage` en el cliente pasan a renderizar en servidor con datos ya filtrados por usuario.

**Migración de datos existentes:** en la primera sesión autenticada, si se detecta `trackfit_sessions` / `trackfit_notes` / `trackfit_config` en `localStorage`, se ofrece un botón «Importar mis datos locales» que hace un `POST /api/migrate` único, mapea el formato viejo al nuevo y marca una bandera para no volver a preguntar. Nada se borra del `localStorage` automáticamente.

---

## 2. Especificación de Nuevas Funcionalidades y Rutas

### 2.1 Layout y navegación

**Header fijo superior** (`fixed top-0 left-0 right-0 z-50 h-14 lg:h-16`), reemplaza sidebar + bottom-nav actuales.

- **Desktop (`lg:` ≥1024 px):** logo a la izquierda · navegación centrada con **icono + texto** (`flex items-center gap-2`) · a la derecha: indicador «Sem 3/12», toggle de tema y menú de usuario (avatar → Ajustes / Cerrar sesión).
- **Mobile (<1024 px):** logo compacto · navegación **sólo iconos**, distribuidos con `justify-around` y `aria-label` obligatorio en cada enlace por accesibilidad (el texto se oculta con `hidden lg:inline`, no se elimina del DOM). Con 7 destinos, en pantallas muy estrechas los 5 principales quedan visibles y el resto entra en un botón «Más» (`⋯`) que despliega una hoja inferior.
- El `<main>` compensa con `pt-14 lg:pt-16`. Desaparece el `pb-24` del bottom-nav.
- Estado activo por `currentPage`, con subrayado inferior en desktop y color de acento en mobile.
- Se conserva el script inline anti-flash de tema y el `<ClientRouter />` (las transiciones de vista ya funcionan y no deben romperse).

**Destinos de navegación**

| Icono | Texto (desktop) | Ruta |
|---|---|---|
| Cuadrícula | Inicio | `/` |
| Pesa | Fuerza | `/fuerza` |
| Zapatilla | Running | `/progreso-running` |
| Manzana | Nutrición | `/nutricion` |
| Gota | Agua | `/hidratacion` |
| Calendario | Calendario | `/calendario` |
| Libreta | Notas | `/notas` |

### 2.2 Módulo de Fuerza y Ejercicios

**Rutas:** `/fuerza` (hoy / sesión activa) · `/fuerza/[date]` (sesión de una fecha) · `/fuerza/historial` · `/progreso-fuerza` (gráficas) · `/ejercicios` y `/ejercicios/[slug]` (catálogo y ficha por ejercicio).

**Pantalla de ejecución** — el corazón del módulo:

- Cabecera: sesión del día (A / B / C), semana del plan, aviso visible si es **semana de descarga**.
- Por ejercicio, una tarjeta con: nombre, prescripción (`4 × 8-10 · RIR 2 · 90" · tempo 3-1-1 · 2×35 lb`), tempo y *cue* técnico colapsables.
- **Rejilla de series: una fila por serie con `reps` y `peso` reales frente a lo asignado en gris**. Estado por serie: pendiente / hecha / fallada. Feedback inmediato: si `reps ≥ repMax` en todas las series, badge «peso maxeado → sube un peldaño».
- **Temporizador de descanso** por serie, arrancado automáticamente al marcar la serie, con la duración prescrita. Durante el descanso aparece el **botón rápido de agua +250 ml** (registro por serie, ver §2.5).
- Selector de **peldaño de densificación (1-10)** por ejercicio, con el nombre y la descripción del método tomados de `rutina.md §4B`, y aviso si se intenta saltar peldaños.
- Barra de progreso de sesión: `% completado = reps realizadas / reps asignadas`.
- Autoguardado con *debounce* (patrón ya presente en `day/index.astro`, se conserva) + guardado explícito al cerrar la sesión.

**Gráficas de progresión (`/progreso-fuerza`)**

1. **Volumen por sesión** (kg totales) — barras, con las semanas de descarga marcadas.
2. **Progresión por ejercicio** — selector de ejercicio; línea doble de *reps totales* y *e1RM estimado* (Epley) en el tiempo. Es la métrica que `rutina.md §4E` pide seguir («+30-50 % de volumen total en 12 semanas»).
3. **Realizado vs. asignado** — % de cumplimiento por sesión, línea con referencia en 100 %.
4. **Mapa de calor de peldaño de densificación** por ejercicio y semana.
5. **Volumen por grupo muscular** — barras apiladas por semana.

### 2.3 Módulo Running — `/progreso-running`

**Rutas:** `/progreso-running` (panel + gráficas) · `/running/nueva` (alta manual) · `/running/[id]` (detalle con desglose de intervalos).

- **Formulario de registro:** tipo de sesión (VO₂máx / umbral / fácil / tirada larga / contrarreloj), distancia, duración (mm:ss o hh:mm:ss), **ritmo calculado en vivo** al teclear, FC media/máx, esfuerzo percibido, clima, calzado, nota. En sesiones de series, tabla de intervalos (repetición, distancia, tiempo, recuperación) con ritmo por repetición calculado.
- **Gráficas:**
  1. **Ritmo en el tiempo** — eje Y invertido (ya soportado por `LineChart.astro`), con **bandas de color de las zonas objetivo** de `rutina.md` y una serie por tipo de sesión. Detecta directamente el problema diagnosticado en la rutina («estás corriendo todo en tierra de nadie»).
  2. **Distancia por sesión** + **volumen semanal acumulado** (barras), con la meta de 17-20 km/semana.
  3. **Tiempo total en carrera** por semana.
  4. **Distribución por zona de intensidad** — dónut: ¿qué % del volumen es realmente fácil? La rutina dice que debería ser la mayoría.
  5. **Proyección de 5K** — línea con la marca base (30:40), las contrarrelojes de las semanas 6 y 12, y la meta (28:30-29:15).
- **Alerta de autorregulación automatizada:** si los intervalos salen >5 s/km más lentos que el objetivo dos semanas seguidas, se muestra el aviso de fatiga acumulada que prescribe `rutina.md §4D`.

### 2.4 Módulo Nutrición — `/nutricion`

**Rutas:** `/nutricion` (día actual) · `/nutricion/[date]` · `/nutricion/alimentos` (catálogo personal).

- Vista de día dividida en comidas (desayuno / comida / cena / snack / pre / post-entreno), tal como está estructurada la dieta real en `rutina.md §1`.
- **Anillos de macros** (kcal, proteína, carbos, grasa) contra la meta del día. El tipo de día (`training` / `rest`) se deduce del plan: miércoles y viernes usan la meta baja (2.000-2.100 kcal), el resto la alta.
- **Proteína como métrica destacada**: es «el ajuste #1» según el diagnóstico de la rutina, así que va en grande, con barra propia y semáforo contra los 125-140 g.
- Alta rápida de alimentos: buscador sobre `foods` con favoritos y recientes ordenados por `usageCount`; alta manual de alimentos nuevos con macros por 100 g y cálculo automático al cambiar la cantidad.
- **Duplicar día anterior** y **plantillas de comida** — la dieta es repetitiva; teclearla entera cada día garantiza abandono.
- Gráficas: proteína diaria (14 días, línea de referencia en 130 g), kcal vs. meta, distribución media de macros, adherencia semanal.

### 2.5 Módulo de Hidratación — `/hidratacion`

- **Contador diario** con vaso que se llena, total en ml/L y % de la meta.
- **Botones rápidos** +250 / +500 / +750 ml y entrada personalizada; cada toque queda registrado con su hora → se puede graficar la distribución horaria del consumo.
- **Integración por serie:** durante el descanso entre series en `/fuerza`, un botón compacto de +250 ml registra la toma con `source: "during-set"` y la referencia a la serie exacta. Esto responde al requisito de contador «por serie».
- **Widget persistente** en el header (icono de gota con el % del día) y tarjeta en el dashboard.
- **Meta dinámica:** los sábados con voleibol la meta sube automáticamente (+750 ml/hora × 4 h) según `rutina.md §1`.
- Historial de 30 días en barras con la línea de meta, y racha de días cumplidos.

### 2.6 Calendario de Asistencia — `/calendario`

- **Vista mensual interactiva** por defecto (rejilla de 7 columnas), con conmutador a vista semanal (se reutiliza la lógica existente de `calendar.astro`).
- Cada celda muestra: número de día, **puntos de color por tipo de sesión planificada** (fuerza / running / voleibol / caminata / descanso) y relleno según el estado de ejecución — completada, parcial, omitida, descanso, futura.
- **Micro-indicadores** en la celda: gota si se cumplió la meta de agua, punto si se cumplió la de proteína.
- Clic en un día → panel lateral (desktop) o hoja inferior (mobile) con el detalle: lo planificado, lo ejecutado, agua, macros y acceso directo a registrar.
- Cabecera del mes con **% de adherencia**, racha actual y racha máxima (`getStreak` / `getMaxStreak` rescatadas de `storage.js`).
- Las **semanas de descarga** se sombrean, y la semana en curso se resalta.

### 2.7 Mapa completo de rutas

| Ruta | Tipo | Descripción |
|---|---|---|
| `/login`, `/registro` | Pública | Email + contraseña |
| `/` | Privada | Dashboard: sesión de hoy, agua, macros, racha, próximos hitos |
| `/fuerza`, `/fuerza/[date]`, `/fuerza/historial` | Privada | Ejecución y registro de fuerza |
| `/progreso-fuerza` | Privada | Gráficas de fuerza |
| `/ejercicios`, `/ejercicios/[slug]` | Privada | Catálogo y ficha histórica por ejercicio |
| `/progreso-running`, `/running/nueva`, `/running/[id]` | Privada | Módulo de carrera |
| `/nutricion`, `/nutricion/[date]`, `/nutricion/alimentos` | Privada | Módulo de nutrición |
| `/hidratacion` | Privada | Hidratación |
| `/calendario` | Privada | Asistencia mensual |
| `/notas` | Privada | Bitácora |
| `/ajustes` | Privada | Perfil, metas, unidades, tema, exportar datos |
| `/api/auth/[...all]` | API | Better Auth |
| `/api/strength`, `/api/running`, `/api/water`, `/api/nutrition`, `/api/foods`, `/api/attendance`, `/api/notes`, `/api/profile`, `/api/metrics`, `/api/migrate` | API | REST por recurso, todos con `requireUser` |

---

## 3. Hoja de Ruta por Tandas (Roadmap Incremental)

Cada tanda deja la aplicación **funcionando y desplegable**. No se empieza una sin cerrar la anterior.

---

### Tanda 0 — Estabilización del build ✅ *completada*

**Objetivo:** que `npm run build` vuelva a pasar. Estaba roto.

**Lo que se hizo**
- Se eliminó `@astrojs/tailwind` y se instaló **Tailwind v4** (`tailwindcss@4.3.3` + `@tailwindcss/vite@4.3.3`), registrado como plugin de Vite en `astro.config.mjs`.
- `tailwind.config.js` **eliminado**. El tema se declara ahora en `src/styles/global.css`:
  - Los tripletes RGB se renombraron de `--color-*` a **`--rgb-*`** para no colisionar con el namespace de temas de v4.
  - Un bloque **`@theme inline`** mapea `--color-base: rgb(var(--rgb-base))`, etc. El `inline` es lo que hace que alternar `.light` en `<html>` repinte toda la paleta sin regenerar CSS — verificado en el CSS emitido: `.bg-surface2 { background-color: rgb(var(--rgb-surface2)) }`.
  - `@source "../"` para que se escaneen también las clases generadas dentro de plantillas de string en los bloques `<script>`.
  - Se restauró el color de borde por defecto de v3 (v4 lo cambia a `currentColor`).
  - `scrollbar-hide` pasó a `@utility`; el `.line-clamp-2` custom se eliminó porque v4 ya lo trae de serie.
- **Codemods de clases** (25 ocurrencias): `flex-shrink-0`→`shrink-0` (4), `placeholder-muted2`→`placeholder:text-muted2` (7), `backdrop-blur-sm`→`backdrop-blur-xs` (3), `outline-none`→`outline-hidden` (11).
- Los 4 helpers JS que leían `--color-*` (`progress.astro`, `LineChart.astro`, `notes.astro`, `day/index.astro`) ahora leen `--rgb-*`.
- `.gitignore`: **`.env` no estaba ignorado** — se añadió (junto con `.env.*`, `!.env.example` y `.vercel`) antes de crear ningún archivo de entorno.
- `.env.example` creado con las variables de la Tanda 1 documentadas.
- `README.md` alineado: decía «Astro 4», «Tailwind v3» y «16 semanas»; ahora refleja Astro 7, Tailwind v4 y las 12 semanas de `rutina.md`.

**Verificación**
- `npm run build` ✓ — 6 páginas en ~200 ms.
- `npm run dev` ✓ — las 6 rutas responden 200, sin errores en consola.
- CSS emitido revisado: tokens de color, modificadores de opacidad (`bg-base/90` → `color-mix`), las 7 utilidades arbitrarias `rgb(var(--edge)/α)`, `placeholder:text-*`, `focus:outline-hidden` y `scrollbar-hide` se generan correctamente.

**Archivos modificados:** `package.json`, `package-lock.json`, `astro.config.mjs`, `src/styles/global.css`, `.gitignore`, `README.md`, y 6 archivos de `src/` por los codemods
**Archivos creados:** `.env.example`
**Archivos eliminados:** `tailwind.config.js`

> **Nota sobre Astro 7 y Vercel.** El último commit bajó Astro a 5.18.2 «para desbloquear el build en Vercel», pero el árbol de trabajo ya estaba en 7.3.2. Astro 7 exige **Node >= 22.12**; si el proyecto en Vercel tiene fijada una versión anterior de Node, el build fallará por ahí y no por Tailwind. Conviene comprobarlo en Vercel → Settings → General → Node.js Version antes del próximo despliegue.

---

### Tanda 1 — Infraestructura: SSR, MongoDB y Better Auth ✅ *completada*

**Objetivo:** el usuario puede registrarse, iniciar sesión y ver una página privada vacía. Cero funcionalidad de fitness aún.

**Alcance**
- `output: 'server'` + adaptador `@astrojs/vercel`.
- Conexión singleton a MongoDB con caché global (`src/lib/db/client.ts`).
- Better Auth con `mongodbAdapter`, email/password, sesión de 30 días.
- Middleware de protección de rutas + `locals.user` tipado en `env.d.ts`.
- Páginas `/login` y `/registro` con el sistema visual existente.
- Script de creación de índices (`npm run db:indexes`), ejecutable e idempotente.
- Helper `requireUser()` y el patrón de repositorio con `userId` obligatorio.

**Archivos a crear:** `src/lib/db/client.ts`, `src/lib/db/collections.ts`, `src/lib/db/indexes.ts`, `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/lib/api.ts`, `src/middleware.ts`, `src/pages/api/auth/[...all].ts`, `src/pages/login.astro`, `src/pages/registro.astro`, `src/types/models.ts`, `.env.example`
**Archivos a modificar:** `astro.config.mjs`, `package.json`, `src/env.d.ts`

**Verificación (extremo a extremo, contra el Atlas real)**
- Alta, sesión de 30 días, ruta privada, logout y sesión invalidada ✓
- Ruta privada sin sesión → 302 a `/login?redirect=…` conservando el destino ✓
- API sin sesión → 401 JSON (no una redirección a HTML) ✓
- Contraseña incorrecta → 401, con mensaje genérico en la interfaz ✓
- **IDOR:** el usuario A manda el `userId` de B en el cuerpo → se ignora y opera sobre A; el perfil de B queda intacto ✓
- Dos usuarios simultáneos ven perfiles distintos y aislados ✓
- `ensureProfile` es idempotente: dos altas seguidas no duplican documento ✓
- Los usuarios de prueba se borraron al terminar; la base queda vacía.

> **Node en Vercel resuelto.** El adaptador avisa en cada build de la versión que va a usar y fija **Node 24** por su cuenta (>= 22.12), así que la preocupación de la Tanda 0 queda cubierta sin tocar nada.

**Requisitos que quedaron cubiertos:**
1. **Cluster de MongoDB Atlas** (el tier M0 gratuito basta) con un usuario de base de datos y `0.0.0.0/0` en la lista de acceso de red (Vercel usa IPs dinámicas).
2. Un archivo `.env` en la raíz con:
   ```
   MONGODB_URI="mongodb+srv://usuario:password@cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority"
   MONGODB_DB="trackfit"
   BETTER_AUTH_SECRET="<32+ caracteres aleatorios: openssl rand -base64 32>"
   BETTER_AUTH_URL="http://localhost:4321"
   ```
3. Las mismas variables cargadas en **Vercel → Settings → Environment Variables**, con `BETTER_AUTH_URL` apuntando al dominio de producción.
4. Confirmación de que el despliegue es **Vercel** (lo deduzco del `.gitignore` y del último commit). Si es otro, cambia el adaptador.

---

### Tanda 2 — Layout nuevo y perfil de usuario ✅ *completada*

**Objetivo:** header fijo superior funcionando en desktop y mobile; el usuario configura su perfil y sus metas.

**Alcance**
- Reescritura del layout con header `fixed top-0`: icono + texto en desktop, sólo iconos en mobile (con `aria-label`), menú de usuario, toggle de tema conservado, indicador de semana del plan.
- Eliminación del sidebar y del bottom-nav.
- `/ajustes` conectado a la colección `profiles`: nombre, altura, peso inicial, fecha de inicio, zona horaria, unidad de peso, metas de agua y macros.
- Rescate de `toDateStr`, `todayStr`, `getCurrentWeek`, `getStreak`, `getWeekCompletion` a `src/lib/date.ts` y `src/lib/metrics.ts` (tipadas, con pruebas de los casos de zona horaria).
- Dashboard `/` provisional con datos reales del perfil.

**Archivos a crear:** `src/components/nav/TopNav.astro`, `src/components/nav/NavLink.astro`, `src/components/nav/UserMenu.astro`, `src/lib/date.ts`, `src/lib/metrics.ts`, `src/lib/db/repos/profiles.ts`, `src/pages/api/profile.ts`
**Archivos a modificar:** `src/layouts/Layout.astro`, `src/pages/settings.astro` → `src/pages/ajustes.astro`, `src/pages/index.astro`, `tailwind.config.js`
**Archivos a eliminar:** el modal de onboarding dentro de `Layout.astro` (lo sustituye `/registro` + `/ajustes`)

**Destinos confirmados:** Inicio · Fuerza · Running · Nutrición · Agua · Calendario · Notas.

**Notas de ejecución**
- `Layout.astro` pasa de 593 a 108 líneas: la barra lateral y la inferior mantenían la misma lista de destinos duplicada, y ahora hay una sola.
- Con 7 destinos los iconos no caben siempre en móvil: la tira desplaza en horizontal en vez de esconder destinos en un menú «más», donde nadie los encuentra.
- Rutas renombradas al esquema definitivo: `/calendar`→`/calendario`, `/notes`→`/notas`, `/settings`→`/ajustes`.
- Los cuatro módulos aún sin construir (`/fuerza`, `/progreso-running`, `/nutricion`, `/hidratacion`) tienen página de marcador en vez de dar 404, cada una indicando su tanda. `/progreso-running` enlaza a `/progress`, que sigue sirviendo las gráficas actuales.
- **Regresión detectada y corregida:** el dashboard leía el nombre de `trackfit_config` en `localStorage`, que dejó de escribirse al quitar el modal de onboarding. Hacía `return` temprano y se quedaba **en blanco**. Ahora los datos del plan llegan del servidor en `data-attributes`.
- Las «fases» de 16 semanas del dashboard eran inventadas; se sustituyen por los bloques de 4 semanas reales de `rutina.md §4C`, con aviso visible en la semana de descarga.
- Se añaden `vitest` y 27 pruebas sobre `date.ts` y `metrics.ts`, centradas en los casos que más fallan: día local frente a UTC, zona horaria del usuario frente a la del servidor, el domingo como final de semana y los límites de la semana del plan.

---

### Tanda 3 — Hidratación (el módulo más simple, extremo a extremo) ✅ *completada*

**Objetivo:** validar el patrón completo página → API → repositorio → Mongo con el módulo de menor complejidad.

**Alcance**
- `/hidratacion` con contador, botones rápidos, entrada personalizada, historial de 30 días.
- Meta dinámica los sábados de voleibol.
- Widget de gota en el header y tarjeta en el dashboard.
- `GET/POST/DELETE /api/water`.

**Archivos a crear:** `src/pages/hidratacion.astro`, `src/components/water/WaterCounter.astro`, `src/components/water/WaterQuickAdd.astro`, `src/components/water/WaterHistory.astro`, `src/lib/db/repos/water.ts`, `src/pages/api/water.ts`
**Archivos a modificar:** `src/components/nav/TopNav.astro`, `src/pages/index.astro`

**Notas de ejecución**
- El patrón página → API → repositorio → Mongo queda validado y es el molde para las tandas siguientes.
- Un documento por día (`water_logs`), con índice único `{userId, date}`: es lo que impide que dos toques simultáneos creen dos documentos para la misma jornada.
- `totalMl` se recalcula desde `entries` en cada escritura en vez de con `$inc`: mantiene el total coherente aunque una escritura anterior falle a medias.
- `goalMl` se guarda como instantánea del día. Si mañana se sube la meta del perfil, el histórico sigue mostrando contra qué se comparó cada día.
- La meta del sábado sube sola: 2750 + 750 × 4 h de voleibol = 5750 ml (`rutina.md §1`). El historial dibuja la línea de meta de CADA día, así que el sábado se ve más alta.
- El registro por serie (`source: 'during-set'`) ya está soportado por la API y el modelo; la interfaz que lo usa llega con la pantalla de fuerza (Tanda 5).
- Historial dibujado con divs, no con Chart.js: son 30 barras y una línea, y no compensa cargar la librería.
- 17 pruebas nuevas sobre la lógica de metas y rachas (44 en total).

**Requiero de tu lado:** nada.

---

### Tanda 4 — Running y `/progreso-running` ✅ *completada*

**Objetivo:** registrar carreras y ver la progresión de tiempo, distancia y ritmo.

**Alcance**
- Formulario de alta con cálculo de ritmo en vivo y tabla de intervalos.
- `/progreso-running` con las 5 gráficas de §2.3, incluidas las bandas de zona objetivo.
- Componentes de gráfica reutilizables (`LineChart` refactorizado + `BarChart` + `DonutChart`), con Chart.js instalado como dependencia en lugar de cargado desde CDN.
- Panel de récords personales: mejor 5K, mejor 10K, mayor distancia, semana de más volumen.
- Alerta automática de fatiga (regla de `rutina.md §4D`).

**Archivos a crear:** `src/pages/progreso-running.astro`, `src/pages/running/nueva.astro`, `src/pages/running/[id].astro`, `src/components/running/RunForm.astro`, `src/components/running/IntervalTable.astro`, `src/components/running/PaceChart.astro`, `src/components/charts/BarChart.astro`, `src/components/charts/DonutChart.astro`, `src/lib/db/repos/running.ts`, `src/lib/pace.ts`, `src/pages/api/running.ts`
**Archivos a modificar:** `src/components/LineChart.astro`, `src/pages/progress.astro` (se divide), `package.json` (`chart.js`)

**Notas de ejecución**
- Ritmo, objetivo y desviación se calculan **en el servidor** y se persisten. El objetivo se congela al registrar: si mañana cambian las zonas, el histórico sigue mostrando contra qué se comparó cada sesión.
- Cuatro gráficas en vez de cinco: "tiempo total por semana" era redundante con el volumen, así que vive en el tooltip de esa gráfica y en los récords.
- La paleta categórica de los tipos de sesión está **validada con script** (banda de luminosidad, chroma, separación para daltonismo y contraste) contra las dos superficies del tema. El orden de los colores es el que hace que los pares adyacentes se distingan: no se reordena ni se cicla.
- Las bandas de zona son lo que convierte la gráfica de ritmo en un diagnóstico. Fácil y tirada larga comparten zona (7:15-7:45), así que la banda se rotula con ambos nombres.
- La proyección de 5K excluye rodajes fáciles **y tiradas largas**: se corren suave por diseño, y una tirada de 12 km a 7:30 proyectaba un 5K de 35:35 que hundía la línea.
- Chart.js pasa de CDN a dependencia. Se retiran `/progress` y `LineChart.astro`, ya superados por `/progreso-running` e `/hidratacion`; con ellos desaparece la última carga desde CDN y 21 errores de tipos heredados.
- 19 pruebas nuevas sobre ritmos, zonas, fatiga y agregaciones (103 en total).

**Pendiente de tu lado:** confirmar si quieres importación desde reloj/Strava más adelante. De momento el registro es manual.

---

### Tanda 5 — Plan de entrenamiento y módulo de Fuerza

**Objetivo:** la tanda más grande. Digitalizar `rutina.md` y registrar series/reps reales contra las asignadas.

**Alcance**
- `src/data/plan.ts` con las 3 sesiones de fuerza, sus ejercicios, series, rangos de reps, RIR, descansos, tempos y cargas, transcritos fielmente de `rutina.md §3`.
- Semilla de `plan_templates` y `exercises` al registrarse el usuario.
- Cálculo de semana del plan, semana del bloque y detección de **semana de descarga**.
- `/fuerza` con la pantalla de ejecución completa: series asignadas vs. realizadas, temporizador de descanso, selector de peldaño de densificación, autoguardado.
- Botón de agua por serie durante el descanso (integración con la Tanda 3).
- Cálculo y persistencia de métricas derivadas: volumen, reps totales, e1RM, % de cumplimiento.
- `/progreso-fuerza` con las 5 gráficas de §2.2.
- `/ejercicios/[slug]` con el histórico por ejercicio.

**Archivos a crear:** `src/data/plan.ts`, `src/data/exercises.ts`, `src/lib/plan.ts`, `src/lib/strength.ts` (e1RM, volumen, doble progresión, escalera), `src/lib/db/repos/strength.ts`, `src/lib/db/repos/plan.ts`, `src/pages/fuerza/index.astro`, `src/pages/fuerza/[date].astro`, `src/pages/fuerza/historial.astro`, `src/pages/progreso-fuerza.astro`, `src/pages/ejercicios/index.astro`, `src/pages/ejercicios/[slug].astro`, `src/components/strength/SessionRunner.astro`, `src/components/strength/ExerciseCard.astro`, `src/components/strength/SetRow.astro`, `src/components/strength/RestTimer.astro`, `src/components/strength/DensificationPicker.astro`, `src/pages/api/strength.ts`, `src/pages/api/plan.ts`
**Archivos a modificar:** `src/pages/day/index.astro` (se descompone), `src/components/SessionBadge.astro`

**Requiero de tu lado:**
1. **Validar la transcripción del plan** antes de sembrarlo: te presento `src/data/plan.ts` en tabla para que confirmes pesos, series y reps.
2. Confirmar si quieres registrar el peso en **libras** (como está en la rutina) mostrándolo en libras aunque se guarde en kg.
3. Confirmar la **fecha de inicio real del plan** (define en qué semana del ciclo estás).

---

### Tanda 6 — Nutrición

**Objetivo:** registrar la alimentación diaria contra las metas de macros del plan.

**Alcance**
- `/nutricion` por comidas, con anillos de macros y proteína destacada.
- Catálogo `foods` con semilla de los alimentos que aparecen en `rutina.md` (huevo, pechuga, arroz, avena, yogurt griego, atún, aguacate, whey, plátano…).
- Buscador con favoritos y recientes; alta manual con macros por 100 g.
- Duplicar día anterior y plantillas de comida.
- Tipo de día automático (`training` / `rest`) según el plan.
- Gráficas de proteína, kcal y adherencia semanal.

**Archivos a crear:** `src/pages/nutricion/index.astro`, `src/pages/nutricion/[date].astro`, `src/pages/nutricion/alimentos.astro`, `src/components/nutrition/MacroRings.astro`, `src/components/nutrition/MealCard.astro`, `src/components/nutrition/FoodSearch.astro`, `src/components/nutrition/FoodForm.astro`, `src/lib/db/repos/nutrition.ts`, `src/lib/db/repos/foods.ts`, `src/lib/nutrition.ts`, `src/data/foods-seed.ts`, `src/pages/api/nutrition.ts`, `src/pages/api/foods.ts`

**Requiero de tu lado:** confirmar si quieres integración con una base de alimentos externa (Open Food Facts es gratuita y sin API key) o si basta con tu catálogo personal. **Recomiendo empezar con el catálogo personal** — tu dieta es repetitiva y una base externa añade ruido y latencia sin aportar mucho.

---

### Tanda 7 — Calendario de asistencia y dashboard definitivo

**Objetivo:** cerrar el círculo — ver de un vistazo la adherencia real al plan.

**Alcance**
- Proyección `attendance` recalculada por *upsert* al guardar cualquier registro del día.
- `/calendario` mensual interactivo con puntos por tipo de sesión, estado de ejecución, micro-indicadores de agua y proteína, panel de detalle por día, semanas de descarga sombreadas.
- Dashboard `/` definitivo: sesión de hoy con CTA, anillos de agua y macros, racha, adherencia semanal, próxima contrarreloj de 5K.
- Migración de `/notas` a Mongo.
- Importador de datos de `localStorage` (`POST /api/migrate`).

**Archivos a crear:** `src/lib/db/repos/attendance.ts`, `src/lib/attendance.ts`, `src/components/calendar/MonthGrid.astro`, `src/components/calendar/DayCell.astro`, `src/components/calendar/DayDetail.astro`, `src/pages/api/attendance.ts`, `src/pages/api/migrate.ts`, `src/lib/db/repos/notes.ts`, `src/pages/api/notes.ts`
**Archivos a modificar:** `src/pages/calendar.astro` → `src/pages/calendario.astro`, `src/pages/index.astro`, `src/pages/notes.astro` → `src/pages/notas.astro`

**Requiero de tu lado:** nada.

---

### Tanda 8 — Pulido, métricas corporales y despliegue

**Objetivo:** dejarlo listo para usarlo todos los días.

**Alcance**
- `body_metrics`: pesaje matutino, perímetro de cintura, gráfica de tendencia con media móvil de 7 días (`rutina.md §4E`).
- Reglas de autorregulación activas: avisos en la app cuando se cumplen las condiciones de `rutina.md §4D`.
- Exportación de datos a JSON/CSV desde `/ajustes`.
- PWA revisada para SSR (service worker, manifest, funcionamiento sin conexión de sólo lectura).
- Repaso de accesibilidad (focus visible, `aria-label` en toda la navegación de iconos, contraste en ambos temas).
- Índices de Mongo revisados con `explain()` sobre las consultas reales.
- README reescrito y despliegue verificado en producción.

**Archivos a crear:** `src/pages/api/body-metrics.ts`, `src/lib/db/repos/bodyMetrics.ts`, `src/components/body/WeightChart.astro`, `src/lib/autoregulation.ts`, `public/sw.js`
**Archivos a modificar:** `README.md`, `public/manifest.json`, `src/pages/ajustes.astro`

**Requiero de tu lado:** revisión final y confirmación del dominio de producción.

---

## 4. Requerimientos consolidados de tu lado

| # | Cuándo | Qué necesito |
|---|---|---|
| 1 | ~~Antes de Tanda 0~~ | ✅ Resuelto: Tailwind v4 con `@tailwindcss/vite` |
| 2 | **Antes de Tanda 1** | Cluster MongoDB Atlas + usuario de BD + acceso de red `0.0.0.0/0` |
| 3 | ~~Antes de Tanda 1~~ | ✅ Hecho: `.env` local relleno y verificado |
| 4 | **Antes de Tanda 1** | Las mismas variables en Vercel (Production + Preview) |
| 4b | ~~Antes de Tanda 1~~ | ✅ Resuelto: el adaptador fija Node 24 automáticamente |
| 5 | ~~Antes de Tanda 1~~ | ✅ Confirmado: GitHub + Vercel |
| 6 | **Antes de Tanda 5** | Validar la transcripción de `rutina.md` a `src/data/plan.ts` (te la presento en tabla) |
| 7 | **Antes de Tanda 5** | Fecha real de inicio del plan y unidad de peso preferida (lb / kg) |
| 8 | **Antes de Tanda 6** | Catálogo personal de alimentos vs. base externa (recomiendo catálogo personal) |
| 9 | **Antes de Tanda 4** | ¿Importación desde reloj/Strava más adelante, o registro siempre manual? |

**Dependencias nuevas previstas:** `mongodb`, `better-auth`, `@astrojs/vercel`, `chart.js` (pasa de CDN a dependencia). `@tailwindcss/vite` + `tailwindcss@4` ya quedaron instaladas en la Tanda 0.

---

## 5. Riesgos y decisiones abiertas

| Riesgo | Impacto | Mitigación |
|---|---|---|
| ~~El build está roto~~ | — | ✅ Resuelto en la Tanda 0 |
| **Node de Vercel < 22.12** | El build falla en producción aunque pase en local | Verificar la versión de Node en Vercel antes del próximo despliegue |
| **Paso de estático a SSR** | Cambia el modelo de despliegue y añade coste de cold start | Adaptador Vercel; caché de cookie de sesión para no golpear Mongo en cada request; `output: 'server'` con páginas estáticas donde sea posible |
| **Zonas horarias** | Un bug de un día corrompe la adherencia | Regla del proyecto: fechas de calendario siempre `YYYY-MM-DD` local, nunca `toISOString()`. `timezone` en el perfil. Ya hay un comentario en `storage.js` advirtiéndolo; se convierte en norma con pruebas |
| **Fuga de datos entre usuarios** | Crítico | Las 4 capas de §1.5. `userId` nunca proviene del cliente |
| **Cold starts de Mongo en serverless** | Latencia perceptible | Cliente singleton cacheado globalmente, `maxPoolSize` bajo, consultas siempre por índice |
| **Fricción de registro diario** | El usuario abandona la app | Duplicar día anterior, plantillas de comida, botones rápidos de agua, autoguardado. Si registrar la cena cuesta más de 20 segundos, no se registra |
| **`rutina.md` evoluciona** | Los datos históricos quedan descontextualizados | `plan_templates` versionado + snapshot de lo asignado dentro de cada sesión |
| **Duplicación de fechas por reintentos** | Documentos duplicados por día | Índices únicos `{ userId, date }` y `upsert` en todas las escrituras diarias |

**Decisiones que tomé por mi cuenta** (avísame si prefieres otra cosa):
- **Vercel** como destino de despliegue, deducido del `.gitignore` y del último commit.
- Se mantienen **Alpine.js** y **Tailwind**: funcionan, son ligeros y no hay razón para migrar a React/Svelte en un proyecto de un solo usuario.
- **Chart.js pasa de CDN a dependencia npm** — cargarlo desde CDN con SSR y `ClientRouter` es una fuente segura de condiciones de carrera (el código actual ya tiene un `setTimeout` de reintento para compensarlo).
- **Un documento por día** para agua y nutrición (en vez de un documento por entrada): simplifica las consultas del calendario y del dashboard, y el número de entradas por día es pequeño.
- **Peso en kg internamente, libras en pantalla** — la rutina está en libras, pero graficar progresión con saltos de 10 lb necesita una unidad continua.

---

**Tandas 0 y 1 completadas.** La siguiente es la **Tanda 2 (layout con header fijo + perfil de usuario)**, que no necesita nada de tu parte salvo, si quieres, confirmar los 7 destinos de navegación y su orden.
