# Contrato de rediseño — landing v3

Qué se puede cambiar, qué no, y en qué orden. Existe porque el rediseño se
ejecuta con la skill `design-taste-frontend`, que trae sus propios defaults: sin
este archivo, la skill vuelve a inferirlos en cada sesión y la landing zigzaguea.

> **Autoridad.** Manda [`MARCA.md`](MARCA.md). Este archivo sólo decide en la
> capa que el manual no cubre, y declara qué reglas de la skill quedan pisadas.
> Si algo de acá contradice el manual, gana el manual y se corrige acá.

## Design read

> Rediseño de una landing de producto local (turnos para barberías y estética en
> Tandil), para dos públicos con la misma pieza, con lenguaje de **cartel** sobre
> una marca ya definida — Tailwind v4 + Plus Jakarta + Motion, con las
> primitivas del producto intactas.

Modo de la skill: **Redesign · Overhaul de composición, Preserve de marca.** No
es ninguno de sus dos modos puros y hay que decirlo en voz alta: el lenguaje
visual se rehace, los tokens y la voz no se tocan.

## Los tres dials

| Dial | Valor | Por qué |
|---|---|---|
| `DESIGN_VARIANCE` | **7** | Cartel pide asimetría y descentrado. No 9: la marca es "callada hasta que importa", no una agencia |
| `MOTION_INTENSITY` | **3** | La tabla de Movimiento del manual (180/300/220/560 ms, `easeOutCubic`, nada rebota, nada gira) está más cerca del 2-3 de "trust-first" que del 6 del preset de landing |
| `VISUAL_DENSITY` | **3** | El manual ya fija la proporción: el hueco entre grupos ≥ 2× el hueco interno |

El preset de la skill para esto sería 7/6/3. El 6 de motion queda pisado.

## La partición

Tres capas. Cada cambio pertenece a una sola, y se sabe de antemano cuánto se
puede discutir.

**Capa 1 · Marca — cerrada.** Ámbar `#D78A1D` de interfaz y `#FD7D03` sólo en
los SVG de marca. Plus Jakarta única familia. `marcaProfunda` como lienzo. El
lockup con su resguardo y sus mínimos. Voseo con tilde. Contraste contra el
fondo real. Ningún hex suelto en un componente. La lista de excepciones de color
sigue cerrada.

**Capa 2 · Primitivas — gramática fija, ejecución abierta.** Botón, campo,
card, toast y píldora conservan: los cuatro radios y `radio exterior = radio
interior + padding`, sombra XOR borde, sin sombra en campos ni píldoras, tap a
`scale(0.97)` con superficie y opacidad `0.4` sin ella, nunca un ripple, nunca
un spinner genérico, tinta sobre el ámbar. Todo lo demás de una primitiva —
cuántas variantes existen, qué hace el hover, cómo se compone por dentro — se
puede rehacer, y hay deuda que obliga a hacerlo.

No van a quedar idénticas a las de la app, porque no pueden: la web tiene hover,
`focus-visible`, teclado y 1180 px. Lo que se conserva es la sensación al
apretar, no el árbol de componentes.

**Capa 3 · Lenguaje — abierta, es el rediseño.** Composición de sección, escala
tipográfica de titulares, contraste de densidad entre bloques, si el contenido
va en card o se agrupa con aire y filete, ritmo vertical, coreografía de
entrada, jerarquía y orden de los bloques dentro de una sección.

## Arbitraje con la skill

Reglas de `design-taste-frontend` que quedan pisadas, con el motivo. Todo lo que
no está en esta tabla, se aplica tal cual viene.

| Regla de la skill | Qué manda acá |
|---|---|
| **PREMIUM-CONSUMER PALETTE BAN** — prohíbe por default crema + ocre/latón y pide rotar paleta | El ámbar es canónico y no se rota. Aplica el override propio de la skill: "la marca nombra explícitamente esos colores" |
| Inter desaconsejada; propone Geist / Satoshi / Cabinet | Plus Jakarta Sans, una familia, por `next/font` |
| `lucide-react` desaconsejada; "nunca dibujar SVG a mano" | [`icons.tsx`](../components/icons.tsx) son SVG propios a propósito; lucide queda para utilitarios. Override de la skill: el proyecto ya depende de ella |
| SHAPE CONSISTENCY LOCK — un solo radio por página | Cuatro radios + fórmula. La skill lo permite si la regla está documentada, y lo está |
| `MOTION_INTENSITY` 6 + sticky-stack / horizontal-pan / scroll-scrub | Dial en 3. Nada de scroll hijack ni pin de secciones: viola "nada gira esperando" y la tabla de duraciones |
| EM-DASH BAN | Es una regla anti-tell del inglés. En prosa española la raya es correcta y el repo ya la usa |
| Valores arbitrarios y hex en clases | Todo por `@theme`. Un color que no existe se discute, no se inventa en el archivo donde hizo falta |
| "Max 1 accent color" | Se cumple, con la salvedad de que `marcaTexto` y `amber-300` son el mismo tono a otra luminosidad, no un segundo acento |

Lo que la skill **sí** aporta y el manual no cubre, y por lo que se la usa:
anti-center bias, diversificación de layout, recomposición de hero, densidad de
contenido, estados vacíos / loading / error, pre-flight de contraste en botones
y formularios, y sus AI-tells de composición.

**Una sola skill ejecuta.** `design-taste-frontend` es el ejecutor.
`impeccable` queda como auditor: sus críticas en `.impeccable/critique/` entran
como reporte de defectos, no como dirección de diseño. Si las dos opinan sobre
una composición, decide el contrato.

## Lo que el dialecto cartel habilita

Permisos explícitos, para no tener que pedirlos de nuevo en cada sesión:

- Titulares por encima de `display-xl` donde la sección lo justifique.
- Secciones a sangre, fuera de la utilidad `wrap`.
- Grillas asimétricas: la card partida en mitades iguales de
  [`Audiences`](../components/Audiences.tsx) puede dejar de ser 50/50.
- Que `rounded-card` + borde **deje de ser el contenedor por default** de una
  sección. La card se usa cuando la elevación dice algo; si no, agrupa el aire.
- Que dos secciones contiguas tengan densidades distintas a propósito.
- Más de dos lienzos `marcaProfunda`, si el ritmo lo pide.
- **Imágenes.** Las 15 capturas de la app (`Capturas Web/{claro,oscuro}`, los dos
  temas) son material aprobado. Van optimizadas por `next/image`, con el tema que
  corresponda, y ninguna se recorta de modo que quede dentro un color sin
  tokenizar — hoy, el `#3B82F6` del estado "Confirmado".
- **Un lavado cálido de superficie en claro**, derivado del que la app ya usa
  detrás de sus encabezados. Es la única forma de que el modo claro se lea como
  Bookit; ver la auditoría.

## Lo que sigue prohibido

Además de todo lo de la Capa 1 y de la lista "Lo que no se hace" del manual:

- Un segundo botón o una segunda card "parecidos" a los que ya existen. El
  rediseño **reduce** el catálogo de primitivas; no lo amplía.
- Scroll hijack, pin de sección, parallax, panes horizontales.
- Cualquier animación en loop por encima del texto. Las de ambiente
  (`aurora`) siguen siendo el único loop permitido, y van detrás.
- **Contenido que avanza solo.** Decidido el 22/9/2026: el carrusel de
  `#como-funciona` se saca, junto con el teléfono dibujado a mano, cuando esa
  sección se recomponga con capturas reales en la Fase C. No se reintroduce el
  patrón en ninguna otra sección.
- **Ámbar `primary` como texto sobre fondo claro, tampoco a tamaño display.** La
  app lo hace y da 2,71:1; la jerarquía de autoridad no alcanza para importar una
  falla de contraste. El calor en claro entra por superficie.
- Reescribir copy. La composición cambia; el texto y su voz, no, salvo pedido
  explícito.
- Tocar slugs, ids de ancla, labels de nav, ni nombres de campo de formulario.
- `primary` como texto sobre fondo claro. Para eso está `amber-700`.

## Plan, por capas

Se trabaja por capas, no por secciones: "todos los botones y todas las cards" es
un cambio de primitiva, no siete cambios de sección. Al revés se terminan
teniendo siete botones parecidos.

**Fase A · Auditoría, sin código.** Lectura de dials actuales por sección, qué
bloque está trabajando y cuál es relleno, qué patrones se retiran, línea base de
SEO y de contraste. Entra como insumo lo ya detectado en
`.impeccable/critique/`.

**Fase B0 · El vocabulario que falta.** Antes que cualquier componente, porque
la Fase B y la Fase C lo consumen:

1. Tokens de escala de display, para que el cartel deje de escribirse con
   `clamp()` suelto por componente (D8).
2. El lavado cálido de superficie en claro, derivado del que la app ya usa
   detrás de sus encabezados.

**Fase B · Primitivas.** En este orden:

1. [`AnimatedButton`](../components/AnimatedButton.tsx) — resolver las cuatro
   variantes (`glass` es ilegible sobre claro; `quiet` e `ink` pueden ser una
   sola) y los tres tamaños, y emparejar los dos CTA de `Audiences` (D11).
2. [`Nav`](../components/Nav.tsx) — el defecto crítico D1: el header se vuelve
   ilegible al salir de cada lienzo. Va acá y no en la Fase C porque es
   contraste, no composición, y hoy está roto en producción.
3. Card y superficie — qué es card y qué no, ahora que dejó de ser el default.
   Incluye sacar la sombra donde ya hay borde (D3).
4. Campo y formulario — [`WaitlistForm`](../components/WaitlistForm.tsx):
   label arriba, error abajo, sin placeholder como label.
5. [`Section`](../components/Section.tsx), [`Eyebrow`](../components/Eyebrow.tsx),
   [`Hairline`](../components/Hairline.tsx), [`Reveal`](../components/Reveal.tsx)
   — el vocabulario de composición que la Fase C va a consumir. **Hecho el
   22/9/2026**, en `DECISIONES.md` §3 octies.

Cerraron en el mismo paso D2, D4, D5, D6, D7 y los `rgba()` sueltos. D2 no era
un eyebrow mal calibrado: es que en claro ninguna banda sostiene texto chico, y
la salida fue una regla de colocación sobre el tinte más sacarle el ámbar al
rótulo de bloque, que había fallado en cuatro superficies distintas. Los `#hex`
de `app/og/` quedan como están: `ImageResponse` no ve el `@theme`. Queda un solo
`rgba()` y dos radios arbitrarios, los tres del teléfono dibujado a mano de
`HowItWorks`, que se van con él en la Fase C.

**Fase C · Secciones,** sobre las primitivas ya nuevas: `#como-funciona` →
~~hero~~ → `#publico` → `#cierre` → `Rewards` → `#faq` → `Nav` (composición, ya
arreglado su contraste en B) y [`Footer`](../components/Footer.tsx).
`#como-funciona` primero porque es la que más cambia: se saca el carrusel y el
teléfono dibujado, y entran las capturas. Después `#cierre`, que con el hero son
los dos lienzos y fijan el techo del lenguaje.

> **El hero se adelantó al paso 5**, el 22/9/2026, contra este orden. No por
> gusto: la card con esquinas del paso 4 le cambió las proporciones y lo dejó
> mal ejecutado —titular en tres renglones, un tercio del lienzo vacío—, o sea
> que era un defecto de ejecución y no una recomposición. `DECISIONES.md` §3
> nonies. Ahí también se cerró la *Consecuencia abierta* de la §3 septies: los
> disolvidos **no** vuelven, los lienzos cortan neto. Lo que sigue abierto es si
> `#puntos` y `#cierre` pasan a ser lienzos con esquinas como el hero.

Una rama por capa (`diseno/primitivas`, `diseno/secciones-…`), como las que ya
están en el historial.

## Pre-flight del proyecto

El de la skill, filtrado por el manual. Antes de cerrar cualquier rama:

- [ ] Ningún hex ni `rgba()` suelto fuera de `@theme`.
- [ ] Claro y oscuro, los dos mirados. El oscuro no es el claro invertido.
- [ ] Contraste medido contra el fondo **real**: 4,5:1 texto · 3:1 texto grande,
      íconos y bordes. Cada CTA y cada campo, uno por uno.
- [ ] Ningún texto de botón envuelve a dos líneas en desktop.
- [ ] Una etiqueta por intención en toda la página.
- [ ] Ninguna superficie con sombra y borde a la vez. Ningún campo ni píldora
      con sombra.
- [ ] Radios concéntricos donde hay anidado.
- [ ] `prefers-reduced-motion` deja todo en fundidos.
- [ ] `focus-visible` en todo lo enfocable, sin regresiones de teclado.
- [ ] Ninguna primitiva nueva sin retirar la que reemplaza.
- [ ] Slugs, anclas, labels de nav y nombres de campo, intactos.
- [ ] Ninguna captura de la app deja ver un color que la web no tenga
      tokenizado.
- [ ] Cada captura va en su versión de tema y por `next/image`.
