# Decisiones tomadas al construir la landing

Complemento de `LANDING_BRIEF.md`. Acá queda registrado **en qué me aparté del brief y por qué**,
y qué supuestos tomé sobre las decisiones pendientes de la §11.

Última actualización: 21 de septiembre de 2026

---

## 1. Desvíos del brief (todos por accesibilidad)

El brief pide dos cosas que se contradicen entre sí: usar ciertos colores exactos y, al mismo tiempo,
cumplir **contraste AA en todo texto** y **100 en Lighthouse Accessibility** (§4.5 y §10). Donde
chocaron, gané la accesibilidad y dejé la marca lo más intacta posible. Los tres casos:

| # | Qué dice el brief | Qué hice | Por qué |
|---|---|---|---|
| 1 | `AnimatedButton` variante `primary`: `bg-amber-500 text-white` (§5) | `bg-amber-500 text-ink-900` | Blanco sobre `#D78A1D` da **2,78:1** y falla AA a 16px. Tinta sobre el mismo ámbar da **6,66:1**. El fondo de marca queda igual; sólo cambia el color del texto. Mismo cambio aplicado al botón del email transaccional. |
| 2 | `--color-amber-700: #A9660F`, "SOLO para texto/links chicos sobre papel (contraste AA)" (§4.1) | **Superado por el manual v1: hoy el token es `#9D6515`** (`marcaTexto`, 4,9:1 sobre `cream-50`). En su momento fue `#96590C` | El valor del brief no cumplía la función que tiene asignada: daba 4,35:1 sobre `cream-50` y **3,96:1** sobre `cream-100`, los dos por debajo de 4,5. `#96590C` da 5,63 / 5,35 / 4,87 sobre paper / cream-50 / cream-100. El brief mismo pide "verificar ≥4.5:1 con un checker antes de cerrar". |
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
y no buscar por todo el repo. Cuando una decisión se confirma, la fila queda acá igual, marcada como
**confirmada** y con la fecha: el flag sigue siendo el único lugar del que se lee el dato.

| § | Pregunta | Supuesto | Dónde se cambia | Qué afecta |
|---|---|---|---|---|
| 11.1 | ¿Se paga el turno en la app? | **Sí — confirmado el 21/9/2026**, ya no es supuesto. Revierte el "se paga en el local" que estuvo vigente hasta esa fecha. Fuente: `PRODUCT.md`, "Capabilities and Constraints" | `flags.inAppPayments` (hoy `true`) | FAQ, Términos §3, Botón de arrepentimiento §2 |
| 11.3 | ¿Hay links de App Store / Play? | **No** todavía | `flags.storeLinksLive` + `site.app.appStore/playStore` | CTA de `/descargar` y de `/invite/*` |
| 11.6 | ¿Se suma analítica? | **No**: sin analítica, y por eso **sin banner de cookies** | `flags.analytics` | Política de Cookies |
| 11.5 | ¿Teléfono real? | El código ya trae `+54 9 249 460-0615` con `isPlaceholder: false`. **A confirmar** que sea el definitivo: el Botón de arrepentimiento lo publica como canal | `site.phone` | Footer, `/soporte`, Botón de arrepentimiento |
| 11.2 | ¿Precio de la suscripción? | No se menciona, como hoy | — | Términos §6, FAQ |
| 11.4 | ¿Razón social, CUIT, domicilio fiscal? | **Falta** | `content/legal.ts` | Hay un bloque `note` visible en Términos §10 y Privacidad §1 avisando que falta |
| 11.7 | ¿Screenshots reales de la app? | No hay: la página se resuelve con tipografía y los motivos de §4.6 | — | Hero (sin mockup, que era la opción preferida del brief) |

## 3 bis. El modo oscuro: decisión tomada, no deuda olvidada

En modo oscuro los tres lienzos `marca-profunda` se distinguen del fondo de la
página por **1,036:1**. El mismo par en claro da **17:1**. O sea que el
dispositivo que sostiene la composición —la alternancia entre papel y cartel—
existe sólo en el tema claro, y en oscuro la página se lee como un scroll
continuo casi negro.

**No es un descuido: es el rango del manual.** Las tres superficies oscuras
canónicas van de `marca-profunda` (#140E03) a `ink-800` (#24211E), 1,2:1 de
punta a punta. Dentro de ese rango no hay redistribución que separe un lienzo
de la página, y bajar el lienzo en oscuro violaría §10, que fija que
`marcaProfunda` no cambia con el tema.

**Lo que se hizo:** un filo de 1px al 12% arriba y abajo de cada lienzo, sólo
en oscuro. Compone a `rgb(48,43,33)` y rinde 1,34:1 — más que cualquier escalón
de relleno disponible, sin tocar un color canónico. Y `ink-850` subió a #201D19,
el valor más alto que puede tomar sin alcanzar a `ink-800`.

**Lo que se decidió NO hacer, el 21 de septiembre de 2026:** introducir una
superficie por encima de `ink-800` para las secciones de la web en modo oscuro.
Sería el mismo argumento por el que existen `cream-100` e `ink-850`, y
resolvería el problema de verdad — pero alejaría el modo oscuro de la web del
de la app Flutter, y la jerarquía del manual dice que ahí gana la app. Se eligió
conservar la consistencia con la app y aceptar que el oscuro marque sus
secciones con bordes en vez de con rellenos.

Si alguna vez se retoma, es una decisión de marca y necesita a una persona, no
un cambio de implementación.

## 4. Lo que queda pendiente de una persona, no de código

- **Revisión legal** de los cinco documentos de `/legal/*`, sobre todo puntos, suscripciones y el rol
  de intermediario. El contenido está completo y es real, pero no es asesoramiento legal.
- **Razón social, CUIT y domicilio fiscal** para Términos y Privacidad.
- **Teléfono de contacto real.** El código ya publica `+54 9 249 460-0615` con `isPlaceholder: false`,
  y el Botón de arrepentimiento lo ofrece como canal alternativo al correo. Hay que confirmar que sea
  el número definitivo y que alguien lo atienda.
- **Revisión legal del Botón de arrepentimiento y de Términos §3, ahora que hay pagos in-app**
  (confirmados el 21/9/2026). Con cobro dentro de la app el derecho de la Ley 24.240 pasa a aplicar
  de verdad, así que los textos describen un mecanismo operativo, no una explicación a futuro.
  Tres puntos que necesitan criterio de una persona con formación legal, no de código:
  1. El plazo, la forma de reintegro y el descuento proporcional por servicio ya prestado
     (Botón de arrepentimiento §4).
  2. Cómo se reparte la responsabilidad del reintegro entre Bookit y el local, dado que Bookit
     cobra pero el servicio lo presta el local (Términos §1 y §3).
  3. Si la suscripción mensual de los locales se cobra online o no. El texto vigente del Botón de
     arrepentimiento §2 dice que todavía no, y eso quedó sin verificar en este cambio.
- **Migrar las env vars de Supabase** a `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE` (server-only). Las
  `NEXT_PUBLIC_*` siguen funcionando como fallback, así que el deploy no se rompe si no se hace.

## 5. Medición

Lighthouse mobile, build de producción en local. **Medido el 21 de septiembre de
2026**, después del rediseño del hero y del cierre, del cambio de nav y de la
tanda de accesibilidad. La tabla anterior era de agosto y había quedado vieja.

| Página | Perf | A11y | Best practices | SEO |
|---|---|---|---|---|
| `/` | 97 | 100 | 100 | 100 |
| `/lista-espera` | 97 | 100 | 100 | 100 |
| `/legal/terminos` | 98 | 100 | 100 | 100 |
| `/soporte` | 98 | 100 | 100 | 100 |
| `/descargar` | 98 | 100 | 100 | 100 |
| `/invite/ABC123` | 95 | 100 | 100 | 66 |

En escritorio, `/` da 100 / 100 / 100 / 100, con LCP de 0,6s y CLS 0.

Tres defectos salieron de esta medición y **ninguna de las tres auditorías de
diseño los había encontrado**:

1. `app/manifest.ts` apuntaba a `/icon` y `/apple-icon` sin extensión, y Next los
   sirve como `.png`: los dos daban 404. No se veía en la página —el `<head>`
   los linkea bien— pero rompía los iconos de la PWA instalada.
2. El bloque de aviso de los legales y la caja del código de referido ponían
   `ink-500` sobre `amber-50`: **4,49:1**, falla AA por una centésima. Otra vez
   un lavado de color debajo del texto.
3. El botón de copiar el código tenía un `aria-label` que no contenía su texto
   visible (WCAG 2.5.3): quien maneja el navegador por voz decía lo que ve y no
   activaba nada. Se eliminó la etiqueta y el nombre sale del contenido.

El SEO 66 de `/invite/*` es `is-crawlable`, o sea el `noindex` **deliberado** de las invitaciones
personales, no un defecto.

Además, verificado a mano en 375 / 768 / 1280 / 1600 px y en dark mode: sin scroll horizontal, un solo
`h1` por página y sin saltos de jerarquía en los headings.

> **La afirmación de "cero textos por debajo del contraste" no se sostuvo.** Dos auditorías
> posteriores (21/9/2026) encontraron fallos que ni Lighthouse ni el detector ven, porque se
> producen al **componer**: opacidad heredada de un ancestro, un lavado de color *debajo* del
> texto, y texto translúcido sobre un degradé. Los tres casos están corregidos, pero la lección
> queda: el contraste se mide sobre el píxel finalmente pintado, no sobre el token.
