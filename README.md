# TrackFit

Aplicación web de seguimiento de entrenamiento físico — plan de 16 semanas. Funciona completamente offline con localStorage; no requiere servidor ni API externa.

## Stack

- **Astro 4** con View Transitions
- **Tailwind CSS v3** — tema oscuro, mobile-first
- **Alpine.js** — reactividad ligera
- **Chart.js** — gráficas de progreso
- **Google Fonts** — Bebas Neue + DM Sans
- Persistencia: `localStorage` exclusivamente

## Instalación

```bash
npm install
npm run dev        # dev server en http://localhost:4321
npm run build      # build de producción en /dist
npm run preview    # previsualización del build
```

## Estructura del proyecto

```
src/
├── layouts/
│   └── Layout.astro          # Layout base: nav mobile/desktop + onboarding modal
├── pages/
│   ├── index.astro           # Dashboard principal
│   ├── calendar.astro        # Calendario semana/mes
│   ├── day/
│   │   └── index.astro       # Registro del día (?date=YYYY-MM-DD)
│   ├── progress.astro        # Gráficas de progreso
│   └── notes.astro           # Notas libres
├── components/
│   ├── SessionBadge.astro    # Píldora de tipo de sesión
│   ├── DayPill.astro         # Píldora de día en mini calendario
│   ├── MetricCard.astro      # Tarjeta de métrica
│   ├── LineChart.astro       # Wrapper de Chart.js
│   ├── Toast.astro           # Notificación slide-up
│   └── WeekBar.astro         # Barra de progreso de semana
├── scripts/
│   └── storage.js            # Todas las funciones de localStorage
└── styles/
    └── global.css            # Tailwind + utilidades globales
public/
├── manifest.json             # PWA manifest
├── icon-192.png              # Ícono PWA
└── icon-512.png              # Ícono PWA
```

## Páginas y rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Dashboard: héroe del día, métricas, mini-calendario, notas recientes |
| `/calendar` | Calendario semana/mes con toggle |
| `/day/?date=YYYY-MM-DD` | Registro del día: estado, agua, nota, carrera, plan |
| `/progress` | Gráficas de ritmo, distancia, agua + estadísticas |
| `/notes` | Editor de notas con búsqueda, tags y autoguardado |

## localStorage — claves

| Clave | Contenido |
|-------|-----------|
| `trackfit_sessions` | Objeto indexado por fecha `YYYY-MM-DD` |
| `trackfit_notes` | Array de notas libres |
| `trackfit_config` | `{ name, startDate }` del usuario |

## Primer uso

Al abrir la app sin configuración guardada, aparece el modal de onboarding para ingresar nombre y fecha de inicio del plan. El modal no se puede cerrar sin llenar los campos.

## PWA

La app es instalable en iPhone/Android desde el browser. Incluye `manifest.json` con íconos y meta tags para "Add to Home Screen" en modo standalone.

## Paleta de colores

| Token | Color | Uso |
|-------|-------|-----|
| `yellow` | `#e8ff47` | Fuerza |
| `blue` | `#47c2ff` | Cardio / Voleibol |
| `orange` | `#ff6b35` | Mixto |
| `muted` | `#8890a8` | Descanso / textos secundarios |
| `base` | `#0d0f14` | Fondo principal |
| `surface` | `#161920` | Cards y paneles |
