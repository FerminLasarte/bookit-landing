# Contrato de rediseño — landing v3

Qué se puede cambiar, qué no, y en qué orden. Existe porque el rediseño se
ejecuta con la skill `design-taste-frontend`, que trae sus propios defaults: sin
este archivo, la skill vuelve a inferirlos en cada sesión y la landing zigzaguea.

> **Autoridad.** Manda [`MARCA.md`](MARCA.md). Este archivo sólo decide en la
> capa que el manual no cubre, y declara qué reglas de la skill quedan pisadas.
> Si algo de acá contradice el manual, gana el manual y se corrige acá.
>
> Lo que se ve mientras se trabaja y se deja afuera a propósito se anota en
> [`PENDIENTES.md`](PENDIENTES.md), que no decide nada: es el registro para que
> no dependa de que alguien se acuerde.

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
- **Imágenes.** Las 15 capturas de la app, en los dos temas, son material
  aprobado. Están en el repo, en `assets/capturas/{claro,oscuro}/`, con el mismo
  nombre de archivo que el original. **Fuera de `public/` desde la Fase C**: van
  por `import` estático, que da alto y ancho automáticos y hash de contenido, y
  que además emite en el build sólo las que se usan — en `public/` se
  despliegan los 13 MB completos estén referenciadas o no. Ver `DECISIONES.md`
  §3 undecies.

  Van por [`Captura`](../components/Captura.tsx), nunca por `<Image>` suelta: la
  primitiva es la que sabe el encuadre y la que resuelve el tema con un
  `<picture>` de verdad. Dos `<Image>` con `dark:hidden` **bajan las dos**,
  medido. Y ninguna se recorta de modo que quede dentro un color de interfaz sin
  tokenizar — la fotografía de un local no cuenta, es contenido.

  **Sobre una superficie fija en oscuro va `onDark`**, y entonces no hay
  `<picture>`: va la captura oscura en los dos temas. El `<picture>` elige por
  el tema de quien mira, que es correcto mientras la superficie de abajo también
  cambie con el tema; donde no cambia —la mitad oscura de `Audiences` es
  `ink-950` siempre— en claro metía la captura clara y dejaba un rectángulo
  blanco dentro del negro. Es la misma convención que `Button`, `Eyebrow` y
  `Hairline`: la superficie se declara, no se adivina. Ver `DECISIONES.md`
  §3 duodecies.

  Ese color existe y está localizado: el `#3B82F6` del estado "Confirmado"
  aparece **sólo en `10_comercio_agenda_dia`**, en los dos temas, 12.580 px
  entre las filas y=855 e y=2209 de 2622. O se tokeniza documentándolo —la lista
  de excepciones del manual está cerrada— o el encuadre lo deja afuera.

  **Están en WebP sin pérdida, y eso es una decisión, no un default.** Pesan 15 MB
  contra los 29 MB de los PNG; con `near_lossless` bajaban a 10 MB, pero ahí el
  desvío llega a 2 unidades por canal y eso mueve una razón de contraste medida
  hasta **0,22** — este repo decidió cosas con márgenes de 0,01, y un asset que
  no se puede medir es una trampa. Sin pérdida son idénticas píxel a píxel a los
  PNG (verificado, las 30, desvío 0), así que son la fuente: de ellas salió el
  lavado cálido y de ellas sale lo que haga falta remedir. Los bytes que baja el
  visitante no dependen de esto, porque `next/image` re-codifica.

  Los originales siguen en `~/Documents/Data Apps/Bookit/Capturas Web/`, fuera
  del repo. Para resincronizar:

  ```
  cwebp -lossless -z 9 -metadata none <origen>.png -o assets/capturas/<tema>/<nombre>.webp
  ```

  Las 30 miden 1206 × 2622 (iPhone @3x). **Decidido en la Fase C:** el `import`
  estático, con el `git mv` que lo habilita. `placeholder="blur"` quedó afuera
  —`getImageProps` no lo admite, y el `<picture>` del tema lo necesita— y no es
  pérdida: la caja reserva su `aspect-ratio` y su borde, así que lo que se ve
  mientras carga es un panel vacío, que es lo que pide el manual.
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
   label arriba, error abajo, sin placeholder como label. **Hecho el
   22/9/2026**, después del paso 5, en `DECISIONES.md` §3 decies. De las tres
   cosas, dos ya estaban; la que faltaba era el error, que no existía por campo
   — un borde rojo y un aviso genérico al pie—. Sale una primitiva,
   [`Field`](../components/Field.tsx), que no deja declarar un campo sin su
   mensaje.
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

**Fase C · Secciones,** sobre las primitivas ya nuevas: ~~`#como-funciona`~~ →
~~hero~~ → ~~`#publico`~~ → ~~`#cierre`~~ → ~~`Rewards`~~ → ~~`#faq`~~ →
~~`Nav`~~ (composición, ya arreglado su contraste en B) y ~~`Footer`~~.
**Cerrada el 22/9/2026**, con la pasada completa del pre-flight de más abajo.
`#como-funciona` primero porque es la que más cambia: se saca el carrusel y el
teléfono dibujado, y entran las capturas. Después `#cierre`, que con el hero son
los dos lienzos y fijan el techo del lenguaje.

> **`#como-funciona` hecho el 22/9/2026**, en `DECISIONES.md` §3 undecies.
> Salieron de ahí tres cosas que las secciones siguientes heredan: la primitiva
> [`Captura`](../components/Captura.tsx) con su encuadre y su `<picture>`; el
> ritmo `apoyo` de `Section`, para la sección que recibe el padding de la pieza
> de arriba; y el lavado cálido usado por primera vez, con su alcance medido y
> con la perilla `--lavado-y` arreglada para que se pueda girar desde la
> sección. Cerró además la última deuda de `MARCA.md` —el `rgba()` suelto y los
> dos radios arbitrarios— porque los tres eran del teléfono que se borró.

> **`#publico` hecho el 22/9/2026**, en `DECISIONES.md` §3 duodecies. Es el
> primer paso de la Fase C donde el trabajo es sumar y no recomponer: entran
> las dos capturas que la auditoría le asigna, con el mismo encuadre (160–1438,
> proporción 0,944), y el objeto pasa a ser un díptico de dos pantallas reales
> a la misma altura. El escalón que la B0 había dejado abierto se cierra en
> `display-sm`, y las mitades siguen 50/50 por medición. Salieron además tres
> cosas que las secciones siguientes heredan: `Captura` aprende `onDark` —sobre
> una superficie fija en oscuro va la captura oscura en los dos temas, y la
> clara ni se importa—; la partición de la card baja a `lg`, porque en `md` la
> mitad daba 246 px y el CTA del local mide 321 y se salía; y se cerró el
> último resto del D1, que seguía vivo con las mitades apiladas.

> **`Rewards` (`#puntos`) hecho el 22/9/2026**, en `DECISIONES.md`
> §3 quaterdecies. Era la última sección centrada y la última que resolvía el
> cuerpo con una partición en dos columnas: pasa a ser un registro de dos
> entradas apiladas con filetes, con particiones distintas cada una (4 | 7 y
> 5 | 6). Se fueron los dos recuadros que tenía por dentro —la lista
> "01 · 02 · 03", que contaba lo mismo que los tres pasos de `#como-funciona` y
> que el párrafo de arriba, y el panel de Referidos, que sobre un lienzo no
> puede ser card— y las dos aclaraciones salieron de `text-xs`. La cifra pasa a
> ser el `h3` de su entrada, así que la sección deja de tener una mitad fuera
> del esquema del documento. Y con sus filas partiendo en `lg`, la home queda
> con **una sola regla de partición: dos columnas de 1024 para arriba**.

> **`#faq` hecho el 22/9/2026**, en `DECISIONES.md` §3 quindecies. Es la
> sección que menos cambia de toda la fase: se conservan el acordeón `<details>`
> nativo y la composición —título anclado al costado contra un cuerpo largo, la
> única así de la home ahora que ninguna se repite—. Lo que cambia es que parte
> en `lg` y no en `md`, y está medido: a 768 px la columna del título deja 208 px
> y la palabra más larga del titular mide 209, o sea margen cero, y lo que se
> come es el canalón de la columna vacía sin que nada lo avise. Salen además los
> ocho `+` ámbar —la cuenta de la §3 octies otra vez, en una sección cuyo único
> acento legítimo es el link de la última respuesta— y el anillo de foco del
> `summary`, que era la única esquina a 0 del sitio.

> **`Nav` y `Footer` hechos el 22/9/2026**, en `DECISIONES.md` §3 sedecies. Van
> juntos porque son la misma pieza vista de los dos lados, y en los dos el
> trabajo de fondo ya estaba hecho: el D1 cerró en la Fase B y el D10 en la
> §3 terdecies. La barra de escritorio pasa a aparecer en `lg`, porque entre 768
> y 1023 px la píldora de links tiene 366 px y mide 424, y el navegador la
> encoge hasta partir dos rótulos en dos renglones. Ahí se destapó un defecto
> anterior a todo esto: el menú a pantalla completa estaba mal en **cualquier**
> teléfono, porque `margin-inline: auto` sobre un ítem de flex lo vuelve
> `fit-content` — a 390 px sus dos filas medían 180 y 280. El CTA del header
> deja de ser lo más chico de la barra, el rótulo de columna del footer deja de
> ser la segunda etiqueta del sitio y pasa a `Eyebrow`, y el filete del footer
> entra al `wrap`, que era el único del sitio fuera de su caja de contenido.

> **El pre-flight completo, el 22/9/2026**, en `DECISIONES.md` §3 septendecies.
> Hasta ahí el contrato se había verificado por sección, que deja afuera justo
> los ítems que sólo se ven mirando el sitio entero. Encontró dos cosas: los dos
> CTA del hero, que piden 434 px y tenían 288 a 768 —el segundo se salía y el
> `overflow-hidden` del lienzo le cortaba 106 px, en todo el rango de 768 a
> 1059—, y un crema huérfano en el manifiesto de la PWA. Y dejó escrito que la
> §3 quaterdecies afirmaba algo falso: la home **no** tenía una sola regla de
> partición, porque la banda del hero y `#faq` seguían en `md`. Con las dos
> movidas, ahora sí.

> **`#cierre` hecho el 22/9/2026**, en `DECISIONES.md` §3 terdecies. Cierra la
> última pregunta abierta de la §3 nonies: **los lienzos de marca pasan a ser
> objetos con esquinas dentro del `wrap`**, los tres. De ahí sale una gramática
> de dos palabras para toda la página — el color que se disuelve es un campo y
> va a sangre (el tinte); el color que corta es un objeto y vive en el `wrap`
> (los `marca-profunda`)— y de ahí sale también el cierre del **D10**, que no
> era un problema de color sino de geometría: el rango oscuro del manual mide
> 1,2:1 de punta a punta y el footer en oscuro es el fondo de la página, así que
> ningún relleno los separa; una esquina y un margen sí, y en los dos temas.
> `Section` aprende a pintarlo y `Rewards` cambia de lienzo sin que se le toque
> el contenido, que tiene su propio paso. Salió además un arreglo de primitiva:
> el botón deja que un rótulo largo envuelva en un teléfono en vez de salirse de
> su píldora —321 px contra los 278 que deja una mitad de card a 390 px—, y la
> banda del cierre se parte en `lg` por el mismo número que la de `#publico`.

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

El de la skill, filtrado por el manual. Antes de cerrar cualquier rama.

> **Corrido de punta a punta el 22/9/2026**, sobre la página terminada y sobre
> las otras cinco rutas, en claro y en oscuro, a 320 · 390 · 640 · 768 · 1024 ·
> 1060 · 1180 · 1440. Las marcas de abajo son el resultado de esa pasada, con
> sus dos hallazgos y su salvedad anotados en `DECISIONES.md` §3 septendecies.
> Cada rama nueva vuelve a correrlo.

- [x] Ningún hex ni `rgba()` suelto fuera de `@theme`. Las excepciones son
      **inherentes** y son cinco, porque ninguna de esas piezas es CSS:
      `app/og/` y `opengraph-image.tsx` (los renderiza `ImageResponse`),
      `app/manifest.ts` (es JSON), el `themeColor` de `app/layout.tsx` (es un
      metadato) y `lib/emails.ts` (los clientes de correo no cargan hojas de
      estilo). En las cuatro primeras cada hex es un token del manual escrito
      literal; el `#333` de `lib/emails.ts` queda en `PENDIENTES.md`.
- [x] Claro y oscuro, los dos mirados. El oscuro no es el claro invertido.
- [x] Contraste medido contra el fondo **real**: 4,5:1 texto · 3:1 texto grande,
      íconos y bordes. Cada CTA y cada campo, uno por uno.
- [x] Ningún texto de botón envuelve a dos líneas en desktop — y ninguno se
      **desborda** de su píldora en un teléfono, que es el defecto opuesto y el
      que de verdad aparece: el CTA más largo del sitio pide 321 px y una mitad
      de card a 390 px deja 278. Envolver ahí es lo correcto.
- [x] Una etiqueta por intención en toda la página.
- [x] Ninguna superficie con sombra y borde a la vez. Ningún campo ni píldora
      con sombra.
- [x] Radios concéntricos donde hay anidado.
- [~] `prefers-reduced-motion`: el sitio cumple de más, no de menos — corta
      seco en vez de fundir, y nada queda invisible. La letra de la regla no se
      cumple y es una decisión de todo el sitio: `PENDIENTES.md`.
- [x] `focus-visible` en todo lo enfocable, sin regresiones de teclado.
- [x] Ninguna primitiva nueva sin retirar la que reemplaza.
- [x] Slugs, anclas, labels de nav y nombres de campo, intactos.
- [x] Ninguna captura de la app deja ver un color de **interfaz** que la web no
      tenga tokenizado. La fotografía de un local es contenido, no paleta; lo
      que se mira es el color de UI. La barra de estado se recorta siempre: su
      batería es `#34C759` y está en las 30.
- [x] Cada captura va por `Captura` y baja una sola: con `<picture>` si la
      superficie de abajo cambia con el tema, con `onDark` si está fija en
      oscuro. Ninguna lleva `preload` ni `loading="eager"`: eso bajaría las dos.
- [x] Ningún texto ni botón se sale de su contenedor en el rango de anchos donde
      hay dos columnas. El CTA más largo del sitio mide 321 px, y una partición
      que deje la columna por debajo de eso lo recorta en silencio.
