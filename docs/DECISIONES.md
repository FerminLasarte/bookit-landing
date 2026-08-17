# Decisiones tomadas al construir la landing

Complemento de `LANDING_BRIEF.md`. Acá queda registrado **en qué me aparté del brief y por qué**,
y qué supuestos tomé sobre las decisiones pendientes de la §11.

Última actualización: 17 de agosto de 2026

---

## 1. Desvíos del brief (todos por accesibilidad)

El brief pide dos cosas que se contradicen entre sí: usar ciertos colores exactos y, al mismo tiempo,
cumplir **contraste AA en todo texto** y **100 en Lighthouse Accessibility** (§4.5 y §10). Donde
chocaron, gané la accesibilidad y dejé la marca lo más intacta posible. Los tres casos:

| # | Qué dice el brief | Qué hice | Por qué |
|---|---|---|---|
| 1 | `AnimatedButton` variante `primary`: `bg-amber-500 text-white` (§5) | `bg-amber-500 text-ink-900` | Blanco sobre `#D78A1D` da **2,78:1** y falla AA a 16px. Tinta sobre el mismo ámbar da **6,66:1**. El fondo de marca queda igual; sólo cambia el color del texto. Mismo cambio aplicado al botón del email transaccional. |
| 2 | `--color-amber-700: #A9660F`, "SOLO para texto/links chicos sobre papel (contraste AA)" (§4.1) | `--color-amber-700: #96590C` | El valor del brief no cumplía la función que tiene asignada: daba 4,35:1 sobre `cream-50` y **3,96:1** sobre `cream-100`, los dos por debajo de 4,5. `#96590C` da 5,63 / 5,35 / 4,87 sobre paper / cream-50 / cream-100. El brief mismo pide "verificar ≥4.5:1 con un checker antes de cerrar". |
| 3 | Wordmark: "it" en `amber-500` (§4.6.4) | `amber-600` sobre claro, `amber-500` sobre oscuro | A los 20px del nav, `#D78A1D` sobre `cream-50` da **2,64:1** (AA pide 3:1 para texto grande). `#C67D19` da 3,15:1. WCAG exceptúa los logotipos, pero el criterio de aceptación pide un 100 literal en Lighthouse y axe no sabe que es un logo. Sobre fondo oscuro se usa el ámbar de marca, que ahí da 6,66:1. |

Además, la cifra **500** de la sección Puntos usa `amber-600` en vez de `amber-500`: es contenido, no
decoración, y el ámbar de marca sobre papel no llega al 3:1 de texto grande.

Los `#D78A1D` que quedan son: fondos de botón, iconos decorativos (`aria-hidden`), los ticks ámbar de
los `Hairline` y el wordmark sobre oscuro. Ninguno es texto chico sobre papel.

## 2. Desvíos técnicos

- **`/lista-espera.html` redirige con 301, no con 308.** `permanent: true` en Next emite 308; el
  criterio de aceptación pide 301, así que va `statusCode: 301` explícito.
- **La OG de `/invite/*` es una route (`/og/invite`), no un `opengraph-image.tsx`.** Next 16 no
  permite archivos de metadata dentro de un catch-all opcional (`Optional catch-all must be the last
  part of the URL`). La consume `generateMetadata` de la página y recibe el código por query.
  Está fuera de `/api/` porque `robots.txt` bloquea `/api/` y algunos scrapers lo respetan.
- **Las imágenes OG y los iconos se generan con `next/og`, no salen de Supabase Storage.** Los tres
  assets que usaba el sitio viejo (`favicon.png`, `og-image.png`, `banner_compartir.jpg`) devuelven
  **HTTP 400**: el bucket no es público. O sea que las previsualizaciones al compartir están rotas
  hoy en producción. Generarlas localmente saca la dependencia externa y arregla el problema.
  Si el bucket se hace público y se prefieren los assets originales, se cambian en la metadata.
- **El hero no usa `Reveal`.** Está sobre el pliegue: no hay scroll que revelar, y arrancarlo en
  `opacity: 0` retrasaba el LCP hasta la hidratación (2,6s de *render delay* medidos). Con el hero
  estático, Performance pasó de 94 a 95.
- **Se agregaron dos mensajes de error al endpoint**, sin tocar los seis del contrato: email con
  formato inválido y rate limit. Los seis originales conservan el texto exacto.

## 2 bis. Cambios de diseño pedidos después de la primera versión

- **El "micro-label" del §4.2 se reemplazó.** Era 11px, mayúsculas, mono, `tracking: 0.2em`. Ese
  tratamiento se lee acartonado. Ahora el `Eyebrow` va en caja baja, con la tipografía de texto,
  semibold, tracking apretado y el color haciendo la jerarquía — más cerca de cómo lo hace Apple.
  Tiene dos variantes: `section` (acento ámbar) y `label` (gris, para rótulos utilitarios).
  El token `--text-micro` quedó sin uso y se borró.
- **Los `SlotChip` sueltos se eliminaron, y con ellos el componente.** Eran horarios de adorno
  flotando en el hero y usados como bullets: números sin significado que sólo generaban la pregunta
  "¿qué son?". Los horarios ahora existen en un único lugar, el paso 02 de "Cómo funciona", dentro de
  un selector donde se explican solos (turnos libres de un día, uno elegido y otros ya ocupados).
  Las listas de beneficios usan un check ámbar como bullet.
- **El rail de categorías dejó de ser una banda suelta.** Ahora son los rubros dentro de la card del
  paso 01, que es un buscador: tienen una razón de estar ahí, uno aparece como filtro activo y
  levantan en hover.
- **"Cómo funciona" se rediseñó por completo.** Antes eran tres filas de texto. Ahora son tres cards
  con grilla asimétrica (5 / 7 arriba, la tercera corrida a la derecha), y cada una muestra la
  pantalla de la app que le corresponde: buscador con rubros, selector de horarios y saldo de puntos.
  Son tres cards distintas entre sí a propósito — una fila de tres cards iguales con un icono genérico
  es justo lo que prohíbe el §4.7.
- **El destello del hero sigue al puntero** (`components/HeroGlow.tsx`), con inercia: interpola un 12%
  por frame, así que va detrás del cursor y se siente como luz, no como UI. Vuelve a su posición de
  reposo cuando el puntero sale de la sección. Anima sólo con `transform` (va al compositor, no
  dispara layout), la posición de reposo la define el CSS —así el server render ya lo pinta bien— y se
  desactiva por completo con `prefers-reduced-motion` y en pantallas táctiles.
- **`SectionNumber` se borró:** la numeración `01/02/03` ahora vive dentro de las cards de HowItWorks.

## 3. Supuestos sobre las decisiones pendientes (§11)

Están centralizados en `content/site.ts` como `flags`, para que confirmarlos sea cambiar una línea
y no buscar por todo el repo.

| § | Pregunta | Supuesto | Dónde se cambia | Qué afecta |
|---|---|---|---|---|
| 11.1 | ¿Se paga el turno en la app? | **No**: se paga en el local | `flags.inAppPayments` | FAQ, Términos §3, Botón de arrepentimiento §2 |
| 11.3 | ¿Hay links de App Store / Play? | **No** todavía | `flags.storeLinksLive` + `site.app.appStore/playStore` | CTA de `/descargar` y de `/invite/*` |
| 11.6 | ¿Se suma analítica? | **No**: sin analítica, y por eso **sin banner de cookies** | `flags.analytics` | Política de Cookies |
| 11.5 | ¿Teléfono real? | Sigue el de ejemplo, marcado | `site.phone` (`isPlaceholder: true`) | Footer, `/soporte`, Botón de arrepentimiento |
| 11.2 | ¿Precio de la suscripción? | No se menciona, como hoy | — | Términos §6, FAQ |
| 11.4 | ¿Razón social, CUIT, domicilio fiscal? | **Falta** | `content/legal.ts` | Hay un bloque `note` visible en Términos §10 y Privacidad §1 avisando que falta |
| 11.7 | ¿Screenshots reales de la app? | No hay: la página se resuelve con tipografía y los motivos de §4.6 | — | Hero (sin mockup, que era la opción preferida del brief) |

## 4. Lo que queda pendiente de una persona, no de código

- **Revisión legal** de los cinco documentos de `/legal/*`, sobre todo puntos, suscripciones y el rol
  de intermediario. El contenido está completo y es real, pero no es asesoramiento legal.
- **Razón social, CUIT y domicilio fiscal** para Términos y Privacidad.
- **Teléfono de contacto real** (hoy `+54 9 249 400-0000`, marcado con `isPlaceholder`).
- **Confirmar si hay pagos in-app** antes de publicar, por el Botón de arrepentimiento.
- **Migrar las env vars de Supabase** a `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE` (server-only). Las
  `NEXT_PUBLIC_*` siguen funcionando como fallback, así que el deploy no se rompe si no se hace.

## 5. Medición

Lighthouse mobile, build de producción en local:

| Página | Perf | A11y | Best practices | SEO |
|---|---|---|---|---|
| `/` | 95 | 100 | 100 | 100 |
| `/lista-espera` | 97 | 100 | 100 | 100 |
| `/legal/terminos` | 98 | 100 | 100 | 100 |
| `/soporte` | 95 | 100 | 100 | 100 |
| `/descargar` | 98 | 100 | 100 | 100 |
| `/invite/ABC123` | 96 | 100 | 100 | 66 |

El SEO 66 de `/invite/*` es `is-crawlable`, o sea el `noindex` **deliberado** de las invitaciones
personales, no un defecto.

Además, verificado a mano en 375 / 768 / 1280 / 1600 px y en dark mode: sin scroll horizontal, un solo
`h1` por página, sin saltos de jerarquía en los headings y **cero** textos por debajo del contraste
que les corresponde.
