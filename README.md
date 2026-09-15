# TrackFit

Aplicación de seguimiento de fuerza, running, nutrición e hidratación, construida
sobre el plan de recomposición + 5K de 12 semanas descrito en [`rutina.md`](./rutina.md).

`rutina.md` no es documentación suelta: es la especificación funcional. De ahí
salen el cronograma semanal, las tres sesiones de fuerza con sus series y RIR,
las zonas de ritmo, las metas de macros y las reglas de autorregulación. El
recorrido completo de la migración está en [`planificacion.md`](./planificacion.md).

## Stack

- **Astro 7** con View Transitions, renderizado en servidor
- **Tailwind CSS v4** vía `@tailwindcss/vite` — tema oscuro/claro
- **MongoDB** (Atlas) + **Better Auth** (email y contraseña)
- **Chart.js** para las gráficas
- Desplegado en **Vercel**

## Requisitos

- Node.js **>= 22.12** (lo exige Astro 7)
- Un cluster de MongoDB Atlas y un `.env` (ver [`.env.example`](./.env.example))

## Puesta en marcha

```bash
npm install
cp .env.example .env    # y rellena los valores
npm run db:indexes      # crea los índices (idempotente)
npm run dev             # http://localhost:4321
```

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción para Vercel |
| `npm test` | Pruebas unitarias con Vitest |
| `npm run check` | Typecheck con `astro check` |
| `npm run db:indexes` | Crea los índices de Mongo (idempotente) |
| `npm run db:set-password -- <email>` | Cambia la contraseña de una cuenta |

## Módulos

| Ruta | Qué hace |
|---|---|
| `/` | Inicio: sesión de hoy, avisos de autorregulación, agua, macros y semana |
| `/fuerza` | Ejecución de la sesión: series realizadas vs asignadas, descanso, densificación |
| `/progreso-fuerza`, `/ejercicios/[slug]` | Volumen, cumplimiento y progresión por ejercicio |
| `/progreso-running`, `/running/nueva` | Carreras y ritmo frente a las zonas objetivo |
| `/nutricion`, `/nutricion/alimentos` | Comidas contra las metas de macros |
| `/hidratacion` | Contador de agua con meta dinámica |
| `/calendario` | Asistencia mensual y adherencia |
| `/cuerpo` | Peso con media móvil de 7 días y perímetro de cintura |
| `/notas` | Bitácora |
| `/ajustes` | Perfil, metas y exportación de datos |

## Autenticación y aislamiento de datos

Email y contraseña, sin OAuth. Better Auth gestiona `user`, `account`, `session`
y `verification`; el perfil físico vive aparte en `profiles`.

El aislamiento entre usuarios se apoya en cuatro capas:

1. `src/middleware.ts` resuelve la sesión y la deja en `Astro.locals`.
2. Los repositorios de `src/lib/db/repos/` exigen `userId` como primer
   argumento y lo inyectan ellos en el filtro.
3. Los endpoints usan `requireUser(locals)`. **El `userId` nunca se lee del
   body ni de la query string**, que es lo que evita el IDOR por parámetro.
4. Los índices únicos llevan `userId` como prefijo.

No hay proveedor de correo configurado, así que tampoco hay flujo de "he
olvidado mi contraseña". Para recuperar el acceso:

```bash
npm run db:set-password -- tu@email.com
```

## Convenciones del proyecto

- **Fechas de calendario**: `YYYY-MM-DD` en la zona horaria del usuario, nunca
  `toISOString()`. Convertir a UTC corre el día para cualquiera al este de
  Greenwich, y un día de corrimiento falsea la adherencia entera.
- **Pesos**: se guardan en kg y se muestran en la unidad del perfil. Graficar
  progresión necesita una unidad continua; los saltos de 10 lb no sirven.
- **Derivados**: ritmos, volúmenes y totales se calculan **en el servidor** y
  se persisten. El cliente los muestra, no los decide.
- **Instantáneas**: metas y prescripciones se copian al registro del día. Si
  mañana cambian, el histórico debe seguir mostrando contra qué se comparó.

## PWA

Instalable desde el navegador. El service worker cachea **sólo** recursos
estáticos con huella (`/_astro/*`) y los iconos: las páginas llevan datos de
la sesión iniciada y cachearlas expondría los de una persona a la siguiente en
un dispositivo compartido. No hay modo sin conexión.

## Paleta de colores

Los colores se definen en `src/styles/global.css` como tripletes RGB en el
namespace `--rgb-*` y se exponen a Tailwind desde un bloque `@theme inline`.
El namespace `--color-*` le pertenece al motor de temas de Tailwind v4.

Cambiar de tema es alternar la clase `.light` en `<html>`: como el tema es
`inline`, los tripletes se reevalúan y repintan toda la paleta sin regenerar CSS.

La paleta categórica de las gráficas está validada (banda de luminosidad,
chroma, separación para daltonismo y contraste) contra las dos superficies del
tema. Su **orden** es lo que hace que los pares adyacentes se distingan: no se
reordena ni se cicla para una serie extra.

| Token | Uso |
|---|---|
| `yellow` | Fuerza, acento principal |
| `blue` | Carrera, hidratación |
| `orange` | Avisos y autorregulación |
| `muted` | Textos secundarios |
| `base` / `surface` | Fondo y tarjetas |
