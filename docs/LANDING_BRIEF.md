# Bookit — Brief definitivo de la Landing Web

> **Propósito de este documento:** es el único input que necesita una conversación nueva para
> construir de cero la landing definitiva de Bookit. Contiene qué es el producto, qué hay hoy en
> el repo (y qué NO se puede romper), el sistema de diseño, el patrón de componentes, el contenido
> completo sección por sección, el footer, los legales y los criterios de aceptación.
>
> **Stack obligatorio: Next.js (App Router) + TypeScript/TSX + Tailwind.** Nada de HTML/CSS/JS suelto.
>
> Última actualización: 2026-08-17 · Repo: `github.com/FacuAntivero/bookit-web` (privado) · Deploy: Vercel

---

## 1. Qué es Bookit

**Bookit es una app de reservas de turnos para el rubro belleza y cuidado personal**: barberías,
peluquerías, manicura, estética, masajes y depilación.

| | |
|---|---|
| **Mercado inicial** | Tandil, Buenos Aires, Argentina (lanzamiento por ciudad, empezando por Tandil) |
| **Estado** | **Pre-lanzamiento.** App nativa iOS + Android en desarrollo; la web capta lista de espera |
| **Bundle / package** | `ar.com.somosbookit.app` (Apple Team ID `MPX5U375K6`) |
| **Dominio** | `somosbookit.com.ar` (canónico, con `www`) |
| **Idioma** | Español rioplatense, voseo (`anotate`, `sumá`, `reservá`, `llevate`). `es-AR` en todo. |
| **Moneda / zona** | ARS · `America/Argentina/Buenos_Aires` |

### Los dos públicos (y son igual de importantes)

1. **Cliente final** — quiere sacar un turno sin cadena de WhatsApp ni llamados. Gancho actual:
   **500 Puntos Bookit** de regalo por anotarse a la lista, canjeables en el primer turno.
2. **Dueño de local** — quiere digitalizar su agenda. Gancho actual: **precio fundador de por vida**,
   cupos limitados para los primeros locales que se suman antes del lanzamiento.

Toda la landing debe tener esta bifurcación como eje estructural: hay un camino claro para cada uno,
sin que la página se sienta partida en dos.

### Mecánicas de producto que la web debe comunicar

- **Puntos Bookit** — sistema de fidelización. Se acumulan y se canjean en turnos.
- **Referidos / invitaciones** — cada usuario tiene un código. Se comparte un link
  `somosbookit.com.ar/invite/<CODIGO>`; quien lo abre ve el código, lo copia y lo usa al registrarse.
  Ambos ganan beneficios. Hay variante para comercios: `/invite/comercio/<CODIGO>`.
- **Deep links** — si la app está instalada, `/invite/*` abre la app directamente (Universal Links /
  App Links ya configurados). La web es el fallback.

---

## 2. Qué existe hoy en el repo (y qué NO se puede romper)

El repo actual es un sitio estático de 2 archivos HTML + 1 función serverless. **Se reescribe todo a
Next.js**, pero hay 5 contratos que deben sobrevivir a la migración:

| # | Contrato | Por qué | Cómo se preserva en Next.js |
|---|---|---|---|
| 1 | `/.well-known/apple-app-site-association` servido como `application/json`, sin extensión | Universal Links de iOS. Si se rompe, deja de abrir la app. | `public/.well-known/apple-app-site-association` + mantener el header de `vercel.json` |
| 2 | `/.well-known/assetlinks.json` como `application/json` | App Links de Android | `public/.well-known/assetlinks.json` + header |
| 3 | Rutas `/invite/<code>` y `/invite/comercio/<code>` responden 200 con la página de invitación | Están declaradas en el AASA y ya circulan links | Ruta dinámica `app/invite/[[...slug]]/page.tsx` (el rewrite de `vercel.json` se puede quitar) |
| 4 | `POST /api/waitlist` con el mismo body y los mismos códigos de error | Es el endpoint que consume el form | `app/api/waitlist/route.ts` (Route Handler, runtime Node) |
| 5 | `/lista-espera.html` sigue resolviendo | Es la URL que se está compartiendo hoy | `redirect` permanente `/lista-espera.html → /lista-espera` en `next.config.ts` |

### Inventario de archivos actuales

```
index.html            → landing de descarga + página de invitación/referidos (con lógica de ?code= y /invite/*)
lista-espera.html     → formulario de lista VIP con copy dinámico según tipo de usuario
api/waitlist.js       → Supabase insert (tabla waitlist_leads) + email de bienvenida vía Resend
.well-known/*         → AASA + assetlinks (deep links)
vercel.json           → cleanUrls, headers JSON de .well-known, rewrite /invite/*
package.json          → deps: @supabase/supabase-js ^2.111.0, resend ^6.18.1
```

### Backend: contrato exacto de `POST /api/waitlist`

**Request body (JSON):**

```ts
type WaitlistPayload = {
  name: string;        // obligatorio
  email: string;       // obligatorio, único en DB
  user_type: 'cliente' | 'local';  // obligatorio
  whatsapp?: string;   // opcional
  category?: string;   // obligatorio SOLO si user_type === 'local'
  consent: boolean;    // obligatorio true (Ley 25.326)
};
```

**Comportamiento:**

1. Rechaza todo lo que no sea `POST` → `405 { error: 'Método no permitido' }`
2. Faltan `name`/`email`/`user_type` → `400 { error: 'Faltan datos obligatorios.' }`
3. `consent` falsy → `400 { error: 'Es necesario aceptar recibir novedades para continuar.' }`
4. `user_type === 'local'` sin `category` → `400 { error: 'Contanos la categoría de tu comercio.' }`
5. Insert en Supabase tabla **`waitlist_leads`** (columnas: `name`, `email`, `user_type`, `whatsapp`,
   `category`, `consent`). `category` se guarda `null` cuando no es local.
6. Violación de unicidad de email (código PG `23505`) → `400 { error: 'Este correo ya está en la lista VIP.' }`
7. Email de bienvenida con Resend desde **`Bookit VIP <hola@somosbookit.com.ar>`**, con dos plantillas
   (cliente / local) y dos asuntos:
   - cliente: `¡Tus 500 puntos Bookit están asegurados! 🎁`
   - local: `¡Tu lugar como local fundador está reservado! 🎁`
8. Éxito → `200 { success: true, message: '¡Registro exitoso!' }`
9. Cualquier otra excepción → `500 { error: 'Hubo un error al procesar tu solicitud. Intentá de nuevo.' }`

**Env vars (ya en Vercel):** `RESEND_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.

**Mejoras a incluir en la migración** (mantienen el contrato, lo endurecen):

- Tipar el body con Zod y devolver los mismos mensajes de error en español.
- Normalizar `email` a lowercase + trim antes del insert.
- Rate limit básico por IP (in-memory o Upstash) para que el endpoint no sea un spam relay.
- Honeypot invisible en el form + validación de tiempo mínimo de llenado.
- Mover las claves de Supabase a `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE` en el server (el
  `NEXT_PUBLIC_` no hace falta si el insert es server-side) — dejar las viejas como fallback.
- Si el email de Resend falla, **no** tirar 500: el lead ya está guardado. Loguear y responder 200
  con un flag `emailSent: false`.

### Deuda / incoherencias detectadas — corregir en la landing nueva

| Problema | Corrección |
|---|---|
| Instagram apunta a `bookit_arg` en `api/waitlist.js` y en los mensajes de éxito | Handle correcto: **`@somosbookit`** → `https://instagram.com/somosbookit` |
| `og:url` de `lista-espera.html` apunta a `bookit.com.ar` | `https://www.somosbookit.com.ar/lista-espera` |
| El CTA "Descargar App" apunta a `/` (placeholder) | Store links reales o, mientras no existan, CTA a lista de espera + copy honesto |
| Soporte figura como `somosbookit@gmail.com` pero los mails salen de `hola@somosbookit.com.ar` | Ambos son válidos y conviven: **soporte público = `somosbookit@gmail.com`**, remitente transaccional = `hola@somosbookit.com.ar` |
| `© 2026` hardcodeado | `new Date().getFullYear()` |
| Falta `robots.txt`, `sitemap.xml`, `manifest`, canonical, JSON-LD | Incluir todo (ver §9) |

---

## 3. Stack y estructura del proyecto

### Requisitos duros

- **Next.js 15+, App Router.** Server Components por defecto; `'use client'` sólo donde hay estado.
- **TypeScript estricto.** Todo `.tsx`. `strict: true`, sin `any`.
- **Tailwind CSS v4** con tokens en `@theme` (CSS-first). Sin archivos CSS sueltos más allá de
  `globals.css` con los tokens y 2-3 utilidades propias.
- **Cero HTML/CSS/JS artesanal.** Nada de `<style>` inline, nada de `document.getElementById`,
  nada de `innerHTML`. Todo estado con hooks; todo contenido desde datos tipados.
- **Contenido en archivos de datos**, no hardcodeado en el JSX: `content/` con objetos tipados
  (`categorias.ts`, `faq.ts`, `features.ts`, `nav.ts`, `legal.ts`). La página consume, no define.
- **Sin librería de UI** (no shadcn, no MUI, no DaisyUI). Componentes propios.
- **Animación:** `motion` (framer-motion) sólo para reveal-on-scroll y transiciones de layout;
  todo lo demás con CSS/Tailwind. Respetar `prefers-reduced-motion` siempre.
- **Iconos:** `lucide-react` permitido **sólo** para utilitarios (mail, instagram, arrow, check,
  copy). Los iconos "de sección" tienen que ser SVG propios o no existir. Nada de emoji como icono.
- **Imágenes:** `next/image` siempre. Assets en Supabase Storage
  (`https://ikfxokmxmbzfcdzjefzf.supabase.co/storage/v1/object/public/assets/...`) → declarar el
  host en `images.remotePatterns`.

### Estructura propuesta

```
app/
  layout.tsx                    # fonts, tokens, metadata base, Nav + Footer
  page.tsx                      # landing principal
  lista-espera/page.tsx         # formulario lista VIP
  invite/[[...slug]]/page.tsx   # invitación + descarga (deep-link fallback)
  descargar/page.tsx            # (opcional) hub de stores
  soporte/page.tsx              # contacto y ayuda
  legal/
    layout.tsx                  # layout de lectura (medida angosta, índice lateral)
    privacidad/page.tsx
    terminos/page.tsx
    cookies/page.tsx
    eliminar-cuenta/page.tsx
    boton-de-arrepentimiento/page.tsx
  api/waitlist/route.ts
  sitemap.ts
  robots.ts
  opengraph-image.tsx           # OG generada con next/og
components/
  AnimatedButton.tsx            # ← componente obligatorio, especificado en §5
  Nav.tsx  Footer.tsx
  Section.tsx  Eyebrow.tsx  SectionNumber.tsx  Hairline.tsx
  SlotChip.tsx                  # motivo visual propio (§4.6)
  CategoryRail.tsx
  AudienceSwitch.tsx            # tabs Cliente / Local
  WaitlistForm.tsx              # 'use client'
  ReferralCode.tsx              # 'use client' (copiar al portapapeles)
  Faq.tsx
  Reveal.tsx                    # wrapper de animación de entrada
content/
  site.ts                       # datos de contacto, HQ, handles, URLs
  categorias.ts  features.ts  faq.ts  nav.ts  steps.ts
lib/
  utils.ts  waitlist-schema.ts
public/
  .well-known/apple-app-site-association
  .well-known/assetlinks.json
```

---

## 4. Sistema de diseño

### 4.0 La idea rectora

**Minimalismo editorial cálido.** La página tiene que sentirse como una revista bien impresa, no como
un dashboard SaaS: tipografía grande y con carácter, mucho aire, un solo acento de color usado con
disciplina, líneas finas en vez de cajas, y un ritmo de lectura que respira. El ámbar de Bookit es el
único color que aparece — todo lo demás es papel cálido y tinta.

Tres reglas que resumen todo:

1. **Una idea por pantalla.** Si una sección compite consigo misma, se parte en dos.
2. **El aire es contenido.** Si dudás entre agregar algo o dejar espacio, dejá espacio.
3. **El ámbar se gana.** Como máximo dos elementos ámbar visibles a la vez por viewport.

### 4.1 Paleta (tokens Tailwind v4)

El ámbar `#D78A1D` y los grises cálidos del modo oscuro **vienen de la app** — son marca, no se
tocan. El modo claro se corrige a un papel cálido (el `#F9FAFB` actual es gris azulado y pelea con
el ámbar).

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Marca — NO TOCAR */
  --color-amber-500: #D78A1D;   /* primary */
  --color-amber-600: #C67D19;   /* hover */
  /* Derivados */
  --color-amber-700: #A9660F;   /* SOLO para texto/links chicos sobre papel (contraste AA) */
  --color-amber-300: #E8B45F;   /* acento sobre fondos oscuros */
  --color-amber-100: #F6E7CE;   /* rellenos suaves, bordes */
  --color-amber-50:  #FDF6EA;   /* wash de sección */

  /* Papel (light) */
  --color-paper:     #FFFFFF;
  --color-cream-50:  #FBF9F5;   /* fondo de página */
  --color-cream-100: #F3EEE5;   /* superficie alterna */

  /* Tinta (dark + texto) — heredados de la app */
  --color-ink-900:   #151311;   /* fondo dark / texto fuerte sobre papel */
  --color-ink-800:   #24211E;   /* superficie dark */
  --color-ink-700:   #3A342E;   /* bordes sobre dark */
  --color-ink-500:   #6B6257;   /* texto muted sobre papel */
  --color-bone-100:  #E8E2D9;   /* texto sobre dark */
  --color-bone-300:  #D9C6B4;   /* texto muted sobre dark */

  --radius-pill: 48px;
  --radius-card: 28px;
  --radius-field: 16px;
}
```

**Reglas de color no negociables:**

- `#D78A1D` sobre blanco da ~2.6:1 → **prohibido para texto chico**. Ámbar sólo en: fondos de botón,
  títulos ≥28px, iconografía decorativa, hairlines. Para links y labels sobre papel usar
  `amber-700`. Verificar ≥4.5:1 con un checker antes de cerrar.
- **Un solo glow ámbar en toda la página** (el radial `rgba(215,138,29,0.15)` del hero). No repetirlo
  en cada sección.
- Dark mode: obligatorio, vía `prefers-color-scheme` + clase `dark` de Tailwind. Es parte de la marca
  (la app ya lo tiene). No es un afterthought.

### 4.2 Tipografía

Pairing definido, cargado con `next/font/google` (subset `latin`, `display: 'swap'`, variables CSS):

| Rol | Familia | Uso |
|---|---|---|
| **Display** | `Bricolage Grotesque` (variable, 600–800, tracking `-0.03em`) | H1, H2, cifras grandes |
| **Texto** | `Manrope` (400/500/600) | párrafos, labels, UI, nav |
| **Acento mono** | `JetBrains Mono` (500) | códigos de referido, horarios, numeración `01/02/03` |

Escala (usar `clamp`, no breakpoints por tamaño):

```
display-xl  clamp(2.75rem, 6.5vw, 5.5rem)   leading-[0.95]  tracking-[-0.035em]
display-lg  clamp(2rem, 3.8vw, 3.25rem)     leading-[1.05]  tracking-[-0.025em]
h3          clamp(1.25rem, 1.6vw, 1.5rem)   leading-[1.2]
body        17px / 1.65   (18px en desktop)  max-w-[64ch]
small       14px / 1.55
micro-label 11px  uppercase  tracking-[0.2em]  font-medium   ← el "eyebrow" de cada sección
```

Nada de texto centrado en bloques largos: los párrafos van alineados a la izquierda, medida máxima
64 caracteres. Sólo el hero y los cierres de sección pueden centrarse.

### 4.3 Layout, grilla y aire

- Container: `max-w-[1180px]`, `px-6 md:px-10`.
- Grilla de 12 columnas (`md:grid-cols-12`) con **asimetría deliberada**: los bloques de texto ocupan
  `col-span-7` u `col-span-5` con offsets — nunca todo `col-span-4` tres veces seguidas.
- Ritmo vertical: secciones `py-24 md:py-36`, y **una** sección de respiro con `py-44` antes del CTA
  final. Entre bloques internos: `space-y-6` / `space-y-10`.
- Separadores: `Hairline` = `border-t border-ink-900/8 dark:border-white/8` con un tick de 2px ámbar
  al inicio. Reemplaza a las cards cuando sólo hace falta separar.
- Cards: `rounded-card`, `bg-paper dark:bg-ink-800`, borde hairline, **sombra casi nula**
  (`shadow-[0_1px_0_rgba(0,0,0,0.03)]`). Máximo 2 niveles de superficie por pantalla.

### 4.4 Movimiento

- Reveal on scroll: `opacity 0→1`, `translateY 16px→0`, `duration 700ms`,
  `cubic-bezier(0.16, 1, 0.3, 1)`, stagger de 60ms. Una vez, no en loop.
- Hover: sólo `scale-[1.02]` y cambios de color, `150ms`.
- El único movimiento "protagonista" de la página es la animación del `AnimatedButton` (§5). Todo lo
  demás es discreto y no compite con él.
- `@media (prefers-reduced-motion: reduce)` → todo a `duration-0` y sin transform.

### 4.5 Accesibilidad (parte del diseño, no un extra)

- Un solo `h1` por página; jerarquía de headings sin saltos.
- Focus visible propio: `focus-visible:ring-2 ring-amber-500 ring-offset-2 ring-offset-cream-50`.
- Form: `<label>` real por campo (nada de placeholder-como-label), errores con `aria-live="polite"`,
  `aria-invalid`, y foco al primer campo con error.
- Targets táctiles ≥44px. Contraste AA en todo texto.
- `lang="es-AR"` en `<html>`.

### 4.6 Motivos visuales propios (la firma de Bookit)

Para que la página no parezca genérica, hay 4 motivos que se repiten y le dan identidad. Usarlos con
consistencia; no inventar un quinto.

1. **Slot chip (`SlotChip`)** — píldora chica con un horario en mono: `[ 10:30 ]`. Es el átomo visual
   del producto (un turno). Aparece flotando en el hero, marcando pasos, y como bullet en las listas.
2. **Radio píldora 48px** — heredado del botón. Todo lo interactivo redondo (48px), todo lo contenedor
   suave (28px), todo lo tipográfico recto. Ese contraste es la textura de la marca.
3. **Numeración mono `01 / 02 / 03`** con un hairline ámbar debajo, en las secciones de proceso.
4. **El wordmark `Book·it`** — "Book" en tinta, "it" en ámbar, `font-display` 800, `tracking-[-0.04em]`.
   Se usa tal cual en nav, footer y OG. Es el logo hasta que haya uno definitivo.

### 4.7 Prohibido explícitamente (lista anti-"IA")

Si algo de acá aparece en el resultado, está mal hecho:

- ❌ Gradientes violeta/azul/rosa, `bg-clip-text` arcoíris, glassmorphism en todas las superficies.
- ❌ Fila de 3 cards idénticas con icono genérico arriba, título de 2 palabras y párrafo de 12 palabras.
- ❌ Bento grid sin motivo. Blobs / mesh gradients de fondo. Grano por default.
- ❌ Emoji como iconografía de secciones o botones (el ✉️ y el 📋 actuales se van a SVG).
- ❌ Todo centrado, todo `max-w-3xl mx-auto text-center`.
- ❌ **Prueba social inventada**: nada de "+10.000 usuarios", logos de marcas, testimonios ficticios,
  ratings, contadores falsos. El producto no lanzó. La honestidad es la ventaja: se puede decir
  "estamos armando la lista de fundadores en Tandil", nunca un número que no existe.
- ❌ Mockup de iPhone flotando a 15° con sombra dura. Si hay mockup, es frontal, recortado por el
  borde de la sección, y muestra una pantalla real.
- ❌ Copy en español neutro o traducido del inglés ("Descubre", "Reserva ahora", "Impulsa tu negocio").
  Es voseo rioplatense, corto y concreto.
- ❌ Countdown timers y urgencia falsa. Los cupos de precio fundador son reales; no inventar relojes.

---

## 5. `AnimatedButton` — componente obligatorio

Este es el botón que se usa en **toda** la página. Es el patrón de interacción central: el texto cae
hacia abajo y desaparece mientras un panel entra desde arriba con el mismo texto en el color inverso,
y el radio pasa de píldora a recto durante el hover.

La versión base venía de otro proyecto (paleta `#131623`). **Acá está adaptada a Bookit**: 3 variantes
sobre los tokens de la marca, soporte de links externos/`mailto:`, y soporte de `type="submit"` para
el formulario (misma animación, sin `Link`).

**Qué se conservó intacto** (es la esencia de la animación, no tocar): `-translate-y-[101%]` del panel,
`translate-y-[160%]` de los textos, `duration-500` del panel, `duration-[800ms]` del texto, las curvas
`cubic-bezier(0.4,0,0,1)` y `cubic-bezier(0.16,1,0.3,1)`, `rounded-[48px] → group-hover:rounded-none`,
`hover:scale-[1.02]`, y el segundo texto con `aria-hidden`.

```tsx
// components/AnimatedButton.tsx
import Link from "next/link";
import type { ReactNode } from "react";

type Size = "sm" | "md" | "lg";
type Variant = "primary" | "ink" | "glass" | "quiet";

const sizeClasses: Record<Size, string> = {
  sm: "h-10 px-6 text-xs",
  md: "h-[50px] px-8 text-sm",
  lg: "h-[60px] px-10 text-base",
};

/**
 * Cada variante define: cómo se ve en reposo, de qué color entra el panel de hover,
 * y de qué color queda el texto entrante (que siempre tiene que contrastar con el panel).
 */
const variantClasses: Record<Variant, { base: string; panel: string; hoverText: string }> = {
  // CTA principal: ámbar de marca → invierte a papel con texto tinta
  primary: {
    base: "border-amber-500 bg-amber-500 text-white",
    panel: "bg-cream-50",
    hoverText: "text-ink-900",
  },
  // CTA secundario sólido sobre papel: tinta → invierte a ámbar
  ink: {
    base: "border-ink-900 bg-ink-900 text-bone-100 dark:border-bone-100 dark:bg-bone-100 dark:text-ink-900",
    panel: "bg-amber-500",
    hoverText: "text-ink-900",
  },
  // Sobre el hero oscuro / imagen: vidrio → invierte a papel
  glass: {
    base: "border-white/20 bg-white/10 text-white backdrop-blur-md",
    panel: "bg-cream-50",
    hoverText: "text-ink-900",
  },
  // Terciario: sólo contorno, para acciones de bajo peso
  quiet: {
    base: "border-ink-900/15 bg-transparent text-ink-900 dark:border-white/20 dark:text-bone-100",
    panel: "bg-ink-900 dark:bg-bone-100",
    hoverText: "text-bone-100 dark:text-ink-900",
  },
};

interface AnimatedButtonProps {
  text: string;
  href?: string;              // omitir cuando es un <button>
  type?: "button" | "submit"; // si no hay href, renderiza <button>
  onClick?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  size?: Size;
  variant?: Variant;
  fullWidth?: boolean;
  external?: boolean;         // fuerza <a> (mailto:, tel:, instagram, stores)
  className?: string;
}

export default function AnimatedButton({
  text,
  href,
  type = "button",
  onClick,
  disabled = false,
  icon,
  size = "md",
  variant = "primary",
  fullWidth = false,
  external,
  className = "",
}: AnimatedButtonProps) {
  const v = variantClasses[variant];

  const isExternal =
    external ?? (!!href && /^(https?:|mailto:|tel:)/.test(href));

  const rootClasses = [
    "group relative inline-flex items-center justify-center overflow-hidden rounded-[48px] border font-bold",
    "transition-transform duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-[1.02]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50 dark:focus-visible:ring-offset-ink-900",
    "disabled:pointer-events-none disabled:opacity-55",
    "motion-reduce:transition-none motion-reduce:hover:scale-100",
    fullWidth ? "w-full" : "w-full md:w-auto",
    sizeClasses[size],
    v.base,
    className,
  ].join(" ");

  const inner = (
    <>
      {/* Panel de hover: entra desde arriba y "endereza" las esquinas */}
      <span className="absolute inset-0 z-0 overflow-hidden rounded-[48px]" aria-hidden="true">
        <span
          className={`absolute inset-0 h-full w-full -translate-y-[101%] rounded-[48px] ${v.panel} transition-all duration-500 ease-[cubic-bezier(0.4,0,0,1)] group-hover:translate-y-0 group-hover:rounded-none motion-reduce:transition-none`}
        />
      </span>

      <span className="relative z-10 flex items-center gap-2.5 overflow-hidden">
        {/* Texto en reposo: cae y desaparece */}
        <span className="flex items-center gap-2.5 transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-[160%] motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
          {icon}
          {text}
        </span>

        {/* Texto entrante: cae desde arriba y ocupa el lugar */}
        <span
          className={`absolute inset-0 flex -translate-y-[160%] items-center justify-center gap-2.5 ${v.hoverText} transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 motion-reduce:hidden`}
          aria-hidden="true"
        >
          {icon}
          {text}
        </span>
      </span>
    </>
  );

  if (href && !disabled) {
    if (isExternal) {
      return (
        <a
          href={href}
          className={rootClasses}
          {...(href.startsWith("http")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} className={rootClasses}>
        {inner}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={rootClasses}>
      {inner}
    </button>
  );
}
```

**Reglas de uso:**

- **Un solo `primary` visible por viewport.** El resto son `ink`, `quiet` o link de texto.
- Hero sobre fondo oscuro/imagen → `glass` para el secundario.
- El submit del formulario usa `<AnimatedButton type="submit" variant="primary" fullWidth />` y su
  `text` cambia con el estado (`Quiero mis 500 puntos` → `Guardando tus puntos…`).
- El `icon` va como SVG (`lucide-react` o propio) de 16-18px, `stroke-[1.75]`. Nunca emoji.
- Ojo: el texto entrante duplica el contenido → siempre `aria-hidden` en el duplicado (ya está).

---

## 6. Mapa del sitio y contenido

Todo el copy de abajo es el punto de partida real (sale del sitio actual y de los emails). Se puede
pulir, pero el tono y las promesas son estas. **Ninguna promesa nueva sin confirmar.**

### 6.1 `/` — Landing principal

**Nav** (sticky, hairline inferior al scrollear, fondo `cream-50/80` + blur):
`Book·it` · Cómo funciona · Para locales · Puntos · Soporte · `AnimatedButton size="sm" variant="ink"` → "Sumate a la lista"
Mobile: menú full-screen, links en `display-lg`, mucho aire.

**1. Hero** — el único bloque con el glow ámbar.
- Eyebrow: `TANDIL · PRÓXIMO LANZAMIENTO`
- H1: **Tu próximo turno, a un clic de distancia.**
- Sub: Barberías, peluquerías, uñas, depilación y estética de Tandil en una sola app. Reservá cuando
  se te ocurra, sin cadenas de WhatsApp ni llamados en horario de trabajo.
- CTAs: `primary` → "Sumate a la lista VIP" (`/lista-espera`) · `quiet` → "Tengo un local" (`#locales`)
- Detalle: 2-3 `SlotChip` (`09:00`, `10:30`, `18:15`) posicionados con `absolute` en el aire del hero.
- Nota al pie del hero (texto chico, `ink-500`): Anotate ahora y llevate 500 Puntos Bookit para tu
  primer turno.

**2. Rail de categorías** — fila horizontal de chips con hairline arriba y abajo, scroll suave en
mobile (sin marquee infinito): Barbería · Peluquería · Manicura · Estética · Masajes · Depilación.

**3. Cómo funciona** (`#como-funciona`) — 3 pasos con numeración mono, en grilla asimétrica.
- `01` **Encontrá tu local.** Todos los locales de tu ciudad en un mismo lugar, con sus servicios,
  precios y horarios reales.
- `02` **Reservá el turno.** Elegís el servicio, ves los huecos disponibles y confirmás. Sin esperar
  respuesta.
- `03` **Sumá puntos.** Cada turno te deja Puntos Bookit para canjear en los que vienen.

**4. Para vos, que sacás turnos** (`#clientes`)
- H2: Sacar turno debería llevar 30 segundos.
- Lista (bullets con `SlotChip` o check ámbar, **no** cards):
  - Reservás a cualquier hora, también cuando el local está cerrado.
  - Recordatorios para no perderte el turno.
  - Cancelás o reprogramás desde la app, sin tener que avisar por mensaje.
  - Tu historial y tus locales favoritos, siempre a mano.
  - Puntos que se acumulan y se canjean.

**5. Para tu local** (`#locales`) — sección con fondo `ink-900` (inversión de tema, texto `bone-100`),
es el corte visual de la página.
- Eyebrow: `PARA COMERCIOS`
- H2: Tu agenda, sin idas y vueltas.
- Bullets: agenda digital que se actualiza sola · menos ausencias con recordatorios automáticos ·
  ficha de cada cliente y su historial · tu link propio para compartir en Instagram · clientes nuevos
  que ya están buscando en Bookit.
- Bloque destacado: **Precio fundador de por vida.** Cupos limitados para los primeros locales que se
  suman antes del lanzamiento en Tandil. Te contactamos por WhatsApp o email con los detalles.
- CTA: `glass` → "Quiero mi lugar como fundador" (`/lista-espera?tipo=local`)

**6. Puntos Bookit** (`#puntos`)
- H2: Los turnos que ya te hacías, ahora te devuelven algo.
- Explicación en 2-3 líneas + la cifra **500** en `display-xl` mono/display como pieza gráfica:
  "500 puntos de regalo por anotarte a la lista, guardados para tu primer turno."

**7. Invitá y ganen los dos** — explica el flujo de referidos y que existe el link `/invite/<código>`.
Copy: Cada persona en Bookit tiene su código. Compartilo, y cuando alguien se registra con él, ganan
los dos.

**8. Lista de espera** (`#lista`) — el `WaitlistForm` embebido (mismo componente que `/lista-espera`),
o un CTA grande si se decide mantener el form sólo en su página. **Recomendado: embebido**, con el
`AudienceSwitch` arriba.

**9. FAQ** — acordeón accesible (`<details>` nativo estilizado o headless propio), 6-7 preguntas:
- ¿Cuándo lanza la app? → Estamos terminando el desarrollo y arrancamos por Tandil. Si estás en la
  lista, te avisamos antes que a nadie.
- ¿Cuánto cuesta para quien saca turnos? → Nada. Bookit es gratis para clientes.
- ¿Y para los locales? → Es una suscripción mensual. Los locales fundadores tienen precio preferencial
  de por vida. Te pasamos los detalles cuando te contactamos.
- ¿Se paga el turno por la app? → **Sí** *(confirmado el 21/9/2026; ver §11.1)*. Reservás y pagás el
  turno desde la app, en el mismo paso. El precio y las condiciones los informa el local antes de
  confirmar.
- ¿En qué ciudades está? → Arrancamos en Tandil y vamos ciudad por ciudad.
- ¿Cómo funcionan los puntos? → Sumás puntos por cada turno y los canjeás en los siguientes.
- ¿Qué hacen con mis datos? → Sólo los usamos para avisarte del lanzamiento y darte soporte. Podés
  pedir la baja cuando quieras. Link a `/legal/privacidad`.

**10. Cierre / CTA final** — bloque de mucho aire (`py-44`), sólo H2 + un `primary`:
- H2: Tandil, tu forma de sacar turnos está a punto de cambiar.
- CTA: "Sumate a la lista VIP"

**11. Footer** (§7).

### 6.2 `/lista-espera` — Lista VIP

Formulario completo, con el **copy dinámico ya existente** (esto ya funciona y hay que conservarlo):

| `user_type` | Título | Descripción | Botón |
|---|---|---|---|
| *(sin elegir)* / `cliente` | Tandil, tu forma de sacar turnos está a punto de cambiar. | Anotate en la lista VIP y llevate **500 Puntos Bookit** de regalo para canjear en tu primer turno cuando lancemos la app. | Quiero mis 500 puntos |
| `local` | Sumá tu local a Bookit antes que nadie. | Anotate en la lista VIP y accedé a **precio fundador de por vida**: cupos limitados para los primeros locales que se sumen antes del lanzamiento. | Quiero mi lugar como fundador |

En Next: el switch cliente/local es un `AudienceSwitch` (dos opciones tipo segmented control con radio
real por debajo, accesible), y el cambio de copy es un crossfade de 150ms — **no** manipular el DOM.
Aceptar `?tipo=local` en la URL para preseleccionar.

**Campos:**

| Campo | Tipo | Obligatorio | Placeholder / opciones |
|---|---|---|---|
| Nombre y apellido | text | sí | `Ej: Martín` |
| Correo electrónico | email | sí | `tu@correo.com` |
| WhatsApp | tel (`inputMode="tel"`) | no | `Ej: 2494...` |
| ¿Cómo vas a usar Bookit? | radio | sí | `Soy cliente (Quiero sacar turnos)` / `Soy dueño de un local (Quiero digitalizarlo)` |
| Categoría de tu comercio | select | sí **si** local | Barbería · Peluquería · Manicura · Estética · Masajes · Otro |
| Contanos cuál | text | sí **si** categoría = Otro | `Ej: Depilación láser` |
| Consentimiento | checkbox | sí | Acepto recibir novedades de Bookit por email y/o WhatsApp, y que mis datos sean tratados conforme a la Ley 25.326 de Protección de Datos Personales. |

**Estados:** idle → `Guardando tus puntos…` (botón disabled) → éxito (reemplaza la card) o error
(mensaje `aria-live`, botón vuelve al texto original).

**Pantallas de éxito** (conservar, corrigiendo el handle de Instagram):
- cliente: **¡Adentro! 🎉** / Ya estás oficialmente en la lista VIP. / Acabamos de enviarte un correo
  confirmando tus 500 puntos (revisá spam por las dudas). Te vamos a avisar antes que a nadie cuando
  la app esté lista. → CTA "Seguinos en Instagram" (`@somosbookit`)
- local: **¡Adentro! 🎉** / Tu local ya está en la lista VIP de fundadores. / Te vamos a contactar por
  WhatsApp o email con los detalles del precio fundador antes de que se agoten los cupos. → mismo CTA.
- El 🎉 se puede mantener acá (es un mensaje de celebración, no iconografía de UI).

### 6.3 `/invite/[[...slug]]` — Invitación y descarga

Ruta que ya está en producción y declarada en el AASA. **Comportamiento a replicar exactamente:**

- El código sale de, en orden: `?code=XXX` → `/invite/XXX` → `/invite/comercio/XXX`.
- Se normaliza con `.trim().toUpperCase()`.
- **Con código:** se muestra la caja de referido (código en mono grande + "Tocá para copiar el código
  e ingresalo al registrarte"), y el copy cambia a:
  - H1: ¡Te invitaron a unirte a Bookit!
  - P: Descargá la app, usá el código de abajo al registrarte y sumá puntos para tus próximos turnos.
- **Sin código:** copy por defecto (`Tu próximo turno, a un clic de distancia.` + descripción de la app).
- Al tocar el código → `navigator.clipboard.writeText` + toast "¡Código copiado con éxito!" (2.5s).
  Rediseñar el toast con el sistema nuevo; mantener el comportamiento y un fallback si `clipboard`
  no está disponible.
- CTA "Descargar App": store links reales cuando existan; hasta entonces, CTA a `/lista-espera` con
  copy honesto ("Todavía no lanzamos: anotate y te avisamos").
- Bloque de soporte (**requisito de Apple**): `¿Necesitás ayuda con tu cuenta o la app?` →
  `somosbookit@gmail.com`.
- Metadata específica para compartir (OG "¡Sumate a Bookit!" con el banner de Supabase). Si el código
  viene en la URL, generar la OG con `next/og` incluyendo el código.
- `/invite/comercio/<code>` puede tener copy propio orientado a comercios (mejora opcional).

### 6.4 `/soporte`

Página simple y honesta: cómo contactar (mail, Instagram, WhatsApp de ejemplo), tiempos de respuesta
esperados, links a los legales, y cómo pedir la baja de datos. Es la página que Apple/Google esperan
encontrar.

---

## 7. Footer

Estructura de 4 columnas en desktop (`col-span-4 / 2 / 3 / 3` — asimétrica), stack en mobile.
Fondo `ink-900` con texto `bone-100`, hairline superior con tick ámbar.

**Columna 1 — Marca y HQ**
```
Book·it
Turnos para barberías, peluquerías y estética.

HQ · Tandil, Buenos Aires, Argentina
```
Debajo: `Hecho en Tandil 🧡` (opcional) y las badges de App Store / Google Play cuando existan.

**Columna 2 — Producto**
Cómo funciona (`/#como-funciona`) · Para locales (`/#locales`) · Puntos Bookit (`/#puntos`) ·
Lista VIP (`/lista-espera`) · Descargar (`/descargar`)

**Columna 3 — Legales** *(todos deben existir como páginas reales, no `#`)*
Términos y Condiciones (`/legal/terminos`) ·
Política de Privacidad (`/legal/privacidad`) ·
Política de Cookies (`/legal/cookies`) ·
Eliminación de cuenta y datos (`/legal/eliminar-cuenta`) ·
Botón de arrepentimiento (`/legal/boton-de-arrepentimiento`) ·
Defensa de las y los Consumidores (link externo a `https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario`)

**Columna 4 — Contacto**
```
somosbookit@gmail.com          → mailto:
Instagram @somosbookit         → https://instagram.com/somosbookit
+54 9 249 400-0000             → tel:+5492494000000   (NÚMERO DE EJEMPLO, reemplazar)
```
> ⚠️ El teléfono es un placeholder solicitado. Dejarlo marcado en el código con un comentario
> `// TODO: reemplazar por el teléfono real` y en `content/site.ts` con la flag `isPlaceholder: true`.

**Barra inferior** (hairline arriba, texto 12px `bone-300`, flex con `justify-between`):
```
© {new Date().getFullYear()} Bookit. Todos los derechos reservados.
Datos personales tratados conforme a la Ley 25.326.
```

Datos centralizados en `content/site.ts` para que nada de esto se repita hardcodeado:

```ts
export const site = {
  name: "Bookit",
  legalName: "Bookit",
  url: "https://www.somosbookit.com.ar",
  city: "Tandil",
  province: "Buenos Aires",
  country: "Argentina",
  hq: "HQ · Tandil, Buenos Aires, Argentina",
  email: "somosbookit@gmail.com",
  transactionalEmail: "hola@somosbookit.com.ar",
  instagram: { handle: "@somosbookit", url: "https://instagram.com/somosbookit" },
  phone: { display: "+54 9 249 400-0000", href: "tel:+5492494000000", isPlaceholder: true },
  app: { bundleId: "ar.com.somosbookit.app", appleTeamId: "MPX5U375K6", appStore: null, playStore: null },
} as const;
```

---

## 8. Legales

Cinco páginas propias bajo `/legal/*`, con `layout.tsx` de lectura (medida `65ch`, índice lateral
sticky en desktop, `Última actualización: <fecha>` arriba). Contenido en MDX o en objetos tipados.

| Página | Debe cubrir |
|---|---|
| **Términos y Condiciones** | Qué es el servicio y qué no (Bookit intermedia turnos; el servicio lo presta el local). Cuentas y edad mínima. Reglas de reserva, cancelación y ausencias. Puntos Bookit: cómo se ganan, que no son dinero, no se transfieren, pueden vencer o modificarse. Programa de referidos y antifraude. Suscripción de locales y precio fundador. Responsabilidad y limitaciones. Ley aplicable: República Argentina; jurisdicción de los tribunales de Tandil, Provincia de Buenos Aires. Contacto. |
| **Política de Privacidad** | Responsable del tratamiento y domicilio (Tandil, Bs. As.). Datos que se recogen (nombre, email, WhatsApp, tipo de usuario, categoría del comercio, datos de uso). Finalidad y base legal: **consentimiento** (Ley 25.326). Encargados de tratamiento: **Supabase** (base de datos), **Resend** (emails), **Vercel** (hosting) — con mención de transferencia internacional. Plazo de conservación. Derechos de acceso, rectificación y supresión: gratuitos, respuesta en 10 días corridos, con la leyenda de la **AAIP** como órgano de control. Cómo ejercerlos: `somosbookit@gmail.com`. Menores. Cambios de política. |
| **Política de Cookies** | Qué se usa realmente. **Si no hay analytics ni tracking, decir exactamente eso** y no poner un banner. Si se agrega analítica (recomendado: Vercel Analytics o Plausible, sin cookies), documentarla y evaluar banner. Nunca instalar un cookie banner decorativo. |
| **Eliminación de cuenta y datos** | **Requisito de Google Play y Apple.** Pasos para borrar la cuenta desde la app y desde la web; qué se borra y qué se conserva por obligación legal; plazo; email de contacto. Debe ser accesible **sin login**. |
| **Botón de arrepentimiento** | Requisito para venta online en Argentina (Res. 424/2020). Aplica cuando haya cobro online de la suscripción de locales: formulario o mail para revocar dentro de los 10 días corridos, sin costo. Mientras no haya cobro online, la página explica el derecho y el canal de contacto. |

Además: `Defensa de las y los Consumidores` (Ley 24.240) como link externo en el footer, y `Botón de
arrepentimiento` visible desde el footer — la normativa pide que estén en la home, no enterrados.

> **Nota:** esto es un checklist de contenido, no asesoramiento legal. Los textos finales los tiene
> que revisar alguien con formación legal antes de publicar, sobre todo la parte de puntos,
> suscripciones y el rol de intermediario.

---

## 9. SEO, metadata y assets

- `metadata` de Next por página. Base en `layout.tsx`: `metadataBase: new URL(site.url)`,
  `title.template: "%s | Bookit"`, `alternates.canonical`, `openGraph.locale: "es_AR"`,
  `twitter.card: "summary_large_image"`, `themeColor: "#D78A1D"`.
- **Metas a conservar tal cual del sitio actual:**
  - Home: `Bookit | Tu próximo turno a un clic` · descripción de la app oficial.
  - Compartir invitación: `¡Sumate a Bookit!` / `Descargá la app, usá mi código de invitación y
    ganemos beneficios juntos.` / imagen `assets/banner_compartir.jpg`.
  - Lista de espera: `Bookit | Tandil, tu forma de sacar turnos está por cambiar` / `Anotate en la
    lista VIP y llevate 500 Puntos Bookit de regalo para tu primer turno. Barberías, uñas, depilación
    y más, todo en una sola app.` / imagen `assets/og-image.png`.
- Favicon actual: `https://ikfxokmxmbzfcdzjefzf.supabase.co/storage/v1/object/public/assets/favicon.png`
  → migrar a `app/icon.png` local + `apple-icon.png`.
- Agregar `app/robots.ts`, `app/sitemap.ts`, `app/manifest.ts`.
- **JSON-LD:** `Organization` (con `address` en Tandil, `email`, `sameAs` Instagram) y
  `SoftwareApplication` (`applicationCategory: LifestyleApplication`, `operatingSystem: iOS, Android`).
  Nada de `AggregateRating` — no hay reviews reales.
- `next/font` con `display: 'swap'`; sin FOIT.
- Objetivo Lighthouse: **≥95 en Performance y 100 en Accessibility**. Sin JS de terceros salvo
  analítica sin cookies.

---

## 10. Criterios de aceptación

La landing está terminada cuando **todo** esto es verdad:

**Técnico**
- [ ] Cero archivos `.html` sueltos, cero `<style>`, cero manipulación directa del DOM.
- [ ] `npx tsc --noEmit` y `next build` limpios, sin `any` ni `@ts-ignore`.
- [ ] `/.well-known/apple-app-site-association` y `/.well-known/assetlinks.json` responden 200 con
      `content-type: application/json` **después** de la migración (verificado en preview de Vercel).
- [ ] `/invite/ABC123` y `/invite/comercio/ABC123` renderizan la caja de referido con el código en
      mayúsculas y el copiado funciona.
- [ ] `/lista-espera.html` redirige 301 a `/lista-espera`.
- [ ] `POST /api/waitlist` mantiene los 6 mensajes de error textuales y el flujo Supabase + Resend.
- [ ] Lighthouse ≥95 Performance / 100 Accessibility en mobile.

**Diseño**
- [ ] Un solo botón `primary` visible por viewport; el `AnimatedButton` es el único patrón de botón.
- [ ] Dark mode completo y revisado sección por sección.
- [ ] Ningún texto ámbar chico sobre papel (todo link chico usa `amber-700`, verificado ≥4.5:1).
- [ ] Un único glow ámbar en toda la página.
- [ ] Ningún ítem de la lista de §4.7 aparece en el resultado.
- [ ] Los 4 motivos visuales de §4.6 están usados con consistencia.
- [ ] Probado a 375px, 768px, 1280px y 1600px sin scroll horizontal.
- [ ] `prefers-reduced-motion` desactiva todo movimiento.

**Contenido**
- [ ] Instagram apunta a `@somosbookit` en todos lados (incluido el email de `api/waitlist`).
- [ ] Footer con `HQ · Tandil, Buenos Aires, Argentina`, mail, Instagram, teléfono de ejemplo marcado
      como TODO, y los 6 links legales resolviendo a páginas reales.
- [ ] Las 5 páginas legales tienen contenido real, no lorem ni "coming soon".
- [ ] Cero métricas, testimonios, logos o ratings inventados.
- [ ] Todo el copy en voseo rioplatense, `lang="es-AR"`.
- [ ] El año del footer es dinámico.

---

## 11. Decisiones pendientes (preguntar antes de asumir)

1. ~~¿Hay pago del turno dentro de la app en el lanzamiento, o se paga en el local?~~ **Resuelta el
   21/9/2026: sí hay pago dentro de la app.** Revierte el supuesto contrario con el que se construyó
   la landing. Aplicada en `flags.inAppPayments`, que alimenta FAQ, Términos §3 y el Botón de
   arrepentimiento — que ahora aplica de verdad y no sólo se explica. Detalle en
   `docs/DECISIONES.md` §3 y §4.
2. ¿Precio de la suscripción para locales? → hoy la web no lo dice; se puede dejar así.
3. ¿Ya existen links de App Store / Google Play, o el CTA "Descargar" sigue siendo lista de espera?
4. ¿Razón social, CUIT y domicilio fiscal para los legales?
5. ¿Teléfono real de contacto? (hoy: placeholder `+54 9 249 400-0000`).
6. ¿Se suma analítica? Si sí, recomendación: Vercel Analytics o Plausible (sin cookies → sin banner).
7. ¿Hay screenshots reales de la app para el hero/mockup? Sin ellos, la página se resuelve con
   tipografía y los motivos de §4.6 — que es la opción preferida por sobre un mockup genérico.

---

## 12. Prompt de arranque para la conversación nueva

> Voy a construir la landing definitiva de Bookit. Leé `docs/LANDING_BRIEF.md` completo antes de
> escribir código: ahí está qué es el producto, el sistema de diseño, el componente `AnimatedButton`
> obligatorio, el contenido sección por sección, el footer, los legales y los criterios de aceptación.
>
> Stack: Next.js App Router + TypeScript/TSX + Tailwind v4. Se reescribe el sitio estático actual
> (`index.html`, `lista-espera.html`, `api/waitlist.js`) sin romper los 5 contratos de la §2:
> los `.well-known`, `/invite/*`, `POST /api/waitlist` y el redirect de `/lista-espera.html`.
>
> Diseño minimalista editorial con la paleta de Bookit, mucho aire, nada de los patrones prohibidos
> de la §4.7. Empezá proponiendo la estructura de archivos y el `globals.css` con los tokens, después
> el `AnimatedButton` y los primitivos, y recién ahí las páginas. Respondeme las decisiones pendientes
> de la §11 si te bloquean.
