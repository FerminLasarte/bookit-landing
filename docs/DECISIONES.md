# Decisiones tomadas al construir la landing

Complemento de `LANDING_BRIEF.md`. Acá queda registrado **en qué me aparté del brief y por qué**,
y qué supuestos tomé sobre las decisiones pendientes de la §11.

Última actualización: 22 de septiembre de 2026

---

## 1. Desvíos del brief (todos por accesibilidad)

El brief pide dos cosas que se contradicen entre sí: usar ciertos colores exactos y, al mismo tiempo,
cumplir **contraste AA en todo texto** y **100 en Lighthouse Accessibility** (§4.5 y §10). Donde
chocaron, gané la accesibilidad y dejé la marca lo más intacta posible. Los tres casos:

| # | Qué dice el brief | Qué hice | Por qué |
|---|---|---|---|
| 1 | `AnimatedButton` variante `primary`: `bg-amber-500 text-white` (§5) | `bg-amber-500 text-ink-900` | Blanco sobre `#D78A1D` da **2,78:1** y falla AA a 16px. Tinta sobre el mismo ámbar da **5,27:1**. El fondo de marca queda igual; sólo cambia el color del texto. Mismo cambio aplicado al botón del email transaccional. |
| 2 | `--color-amber-700: #A9660F`, "SOLO para texto/links chicos sobre papel (contraste AA)" (§4.1) | **Superado por el manual v1: hoy el token es `#9D6515`** (`marcaTexto`, 4,9:1 sobre `cream-50`). En su momento fue `#96590C` | El valor del brief no cumplía la función que tiene asignada: daba 4,35:1 sobre `cream-50` y **3,96:1** sobre `cream-100`, los dos por debajo de 4,5. `#96590C` da 5,63 / 5,35 / 4,87 sobre paper / cream-50 / cream-100. El brief mismo pide "verificar ≥4.5:1 con un checker antes de cerrar". |
| 3 | Wordmark: "it" en `amber-500` (§4.6.4) | `amber-600` sobre claro, `amber-500` sobre oscuro | A los 20px del nav, `#D78A1D` sobre `cream-50` da **2,64:1** (AA pide 3:1 para texto grande). `#C67D19` da 3,15:1. WCAG exceptúa los logotipos, pero el criterio de aceptación pide un 100 literal en Lighthouse y axe no sabe que es un logo. Sobre fondo oscuro se usa el ámbar de marca, que ahí da 6,66:1. |

Además, la cifra **500** de la sección Puntos usa `amber-600` en vez de `amber-500`: es contenido, no
decoración, y el ámbar de marca sobre papel no llega al 3:1 de texto grande.

Los `#D78A1D` que quedan son: fondos de botón, iconos decorativos (`aria-hidden`), los ticks ámbar de
los `Hairline` y el wordmark sobre oscuro. Ninguno es texto chico sobre papel.

### Los números de contraste, remedidos el 22 de septiembre de 2026

Al rehacer el botón (Fase B paso 1) se revalidó la calculadora de contraste
contra los valores WCAG publicados —21,00 · 4,54 · 7,00 · 8,59, los cuatro
exactos— y aparecieron cuatro números mal en el repo. Las decisiones que
sostienen no cambian; los márgenes sí, y uno de ellos decide un estado.

| Dónde | Decía | Real |
|---|---|---|
| Este archivo, §1.1: `ink-900` sobre `amber-500` | 6,66:1 | **5,27:1** |
| `MARCA.md` y `globals.css`: `amber-700` sobre `cream-50` | 4,9:1 | 4,75:1 |
| `MARCA.md` y `globals.css`: `amber-500` sobre `ink-950` | 6,3:1 | 6,66:1 |
| `MARCA.md` y `globals.css`: `amber-500` sobre superficie clara | 2,64:1 | 2,71:1 sobre `cream-50`, 2,78:1 sobre `paper` |

El primero es un error de verdad y parece una transposición: **6,66 es el número
de `amber-500` sobre `ink-950`**, que está en otro archivo. Los otros tres son
redondeo. Los cuatro ya están corregidos en los tres archivos.

Importa porque el margen real de la tinta sobre el ámbar es mucho más chico de
lo que el repo creía, y eso decide el hover del botón: `ink-900` sobre
`amber-600` —el token que se llamaba "Hover del CTA"— da **4,44:1** y falla AA.
Oscurecer el ámbar no tiene margen (al 90% del camino a `amber-600` todavía
pasa, con 4,52:1), así que el hover **aclara**: ver `--color-amber-400`.

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
  **Las dos variantes y el color se fueron el 22/9/2026**: el rótulo va en tinta y es uno solo.
  Lo que hace la jerarquía es la escala, no el color. Ver §3 octies — resulta que el color
  haciendo la jerarquía era un texto chico de acento, y el texto chico de acento no sobrevive
  a ninguna superficie del modo claro. El tracking apretado también se fue, que además era lo
  que el manual pide para texto chico.
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

## 3 ter. El lavado cálido: un degradé con regla, no una superficie

Hermana de la anterior. La §3 bis documenta el dispositivo de composición que
le falta al modo **oscuro**; esto documenta el que le faltaba al **claro**, y
que la auditoría v3 nombró como su hallazgo central: en claro la web no tenía
ni una superficie cálida, así que el oscuro se leía como Bookit y el claro como
un sitio gris con acentos ámbar.

**El dispositivo de la app no es una superficie, es un degradé.** Medido pixel a
pixel sobre `Capturas Web/{claro,oscuro}`: nace en la esquina superior
izquierda, con pico `#F1D9B7` en claro y `#604117` en oscuro, llega a la
superficie base a 393 pt sobre el borde izquierdo y conserva un tercio de su
fuerza al llegar al otro extremo del borde superior. Los `#EFE1CD` → `#F0E1CB`
que anotó la auditoría son un punto intermedio de esa rampa, no su pico.

**Y como superficie plana no entra a ninguna intensidad.** No existe un valor
cálido que sostenga `ink-500` a 4,5:1 y además se vea: el cruce cae en R−B =
+8, que ya no se distingue del papel. Esto no era una hipótesis, ya estaba
descubierto en el repo sin figurar en ningún documento — `amber-50` da
**4,50:1** con `ink-500`, justo sobre la línea de AA, y `bg-amber-50` en claro
se sacó **tres veces**, con el motivo documentado cada vez en `LegalDoc`,
`ReferralCode` y `HowItWorks`. El comentario del token lo llamaba "wash de
sección" y no lo era.

**Lo que se hizo, el 22 de septiembre de 2026:** entra como lo que la app
realmente hace —detrás de los encabezados—. Dos tokens de pico
(`--color-lavado-calido`, `--color-lavado-profundo`) y una utilidad `lavado`
que los pinta, con la geometría derivada de las capturas y la regla de
colocación escrita adentro:

- Sobre la parte fuerte van `ink-900` y los pasos de display, que ahí dan
  **10,73:1**.
- **No** van la bajada en `ink-500` (3,53:1) ni un eyebrow `amber-700` a tamaño
  de lectura (3,56:1 contra los 4,5:1 que pide).
- El texto chico va sobre una card de `paper`, donde `ink-500` vuelve a 4,71:1,
  o más abajo, donde el lavado ya se apagó.
- La perilla por sección es `--lavado-y`, o sea el **alcance**, nunca la
  opacidad: un solo cálido con varios alcances es lo que evita terminar con
  seis lavados parecidos.

Van los dos temas. El oscuro casi no restringe —`bone-300` da 5,60:1— y el
claro sí: otra vez, el oscuro no es el claro invertido. El par oscuro se
incluyó igual para que el día que una sección lo necesite el valor esté en el
`@theme` y no se escriba a mano en un componente.

**Lo que se decidió NO hacer:** exponerlo como un color de fondo. Si alguien
"arregla" esto pintándolo con `bg-lavado-calido`, `ink-500` vuelve a fallar AA
por cuarta vez. El token es el pico de un degradé, no una superficie.

**Consecuencia abierta para la Fase B:** sobre el lavado, el eyebrow
`amber-700` da 3,56:1 — peor que los 4,38:1 que ya tenía sobre `cream-100`
(D2 de la auditoría). D2 hay que resolverlo antes de que alguna sección ponga
un eyebrow sobre lavado.

## 3 quater. El piso de `display-2xl` lo fija el titular, no la cifra

La Fase B0 también sacó del componente los `clamp()` de display que `Rewards` y
`Audiences` escribían a mano (D8). `display-sm` salió idéntico al valor que ya
estaba escrito, pero `display-2xl` tuvo que elegir entre dos usos que piden
pisos distintos, y conviene que quede anotado por qué perdió uno.

La cifra de Puntos usaba `clamp(4.5rem, 11vw, 8.5rem)`: un piso de 72px
calibrado para tres dígitos ("500"). Ese mismo piso aplicado a un **titular**
—que es para lo que el contrato habilita el paso por encima de `display-xl`—
hace que una frase corta a 72px en un viewport de 375px envuelva a cuatro
líneas. El token quedó con piso de 3,75rem.

**Consecuencia:** la cifra pasa de 72px a 60px en móvil —sigue siendo casi el
doble que el título de su sección— y en desktop queda idéntica.

**Lo que se decidió NO hacer:** agregar un tercer token sólo para cifras. B0
existe para que la escala esté escrita en un lugar, no para sumar nombres, y
`Rewards` se recompone completa en la Fase C.

## 3 quinquies. El header tiene tres estados porque dos no alcanzan

> **Superada el 22/9/2026 por la §3 septies.** Los tres estados se sacaron: el
> cambio de vestido era demasiado visible y el estado `borde` dibujaba una banda
> crema opaca sobre el hero negro. Lo que sigue se conserva porque su medición
> del degradé sigue siendo válida y explica por qué la salida nueva tuvo que
> hacer que los lienzos corten neto.


D1 de la auditoría, resuelto el 22 de septiembre de 2026. Queda anotado porque
la solución obvia —arreglar el predicado y dejar dos estados— no funciona, y
alguien va a querer volver a intentarla.

**El predicado estaba mal, pero no era lo único.** Preguntaba si ALGÚN
`[data-canvas]` tocaba la banda de 72px del header, y con eso vestía de oscuro
sobre un header transparente. "Tocar" no es "estar detrás". Además, los tres
lienzos no terminan donde termina su rectángulo: el hero se disuelve con un
degradé de salida propio de 160px, `#puntos` lleva una máscara `fade-y` de 96px
arriba y abajo **sólo en claro**, y `#cierre` sí corta neto. Medir el rectángulo
daba "hay lienzo" cuando el negro ya se había ido.

**Y hay una zona muerta que ningún umbral arregla.** Entre el 28 % y el 84 % del
degradé de salida del hero —unos 90px de scroll— *ningún* vestido pasa AA:

| Punto del degradé | Vestido oscuro (`bone-300`) | Vestido claro (`ink-500`) |
|---|---|---|
| 0 % | 11,60:1 | 3,02:1 |
| 30 % | **4,04:1** | **3,52:1** |
| 60 % | 1,41:1 | **4,07:1** |
| 85 % | 1,37:1 | 4,56:1 |

La causa es que el header claro era `cream-50/80`: con 80 % de opacidad sobre
`marca-profunda` compone `#CDCCCB` y deja `ink-500` en 3,02:1. Para que el fondo
deje de importar harían falta **98 %** de opacidad.

**Lo que se hizo:** tres estados en vez de dos.

- `lienzo` — el lienzo cubre la barra entera y con negro pleno. Header
  transparente, vestido oscuro, 11,60:1.
- `borde` — hay lienzo pero no cubre todo, o está en su degradé. Header con
  superficie **opaca**: el contraste deja de depender del fondo, 4,71:1
  garantizado. **Es el estado que faltaba**, y es lo que cierra la zona muerta.
- `pagina` — no hay lienzo cerca. Header translúcido como siempre.

El vestido oscuro del tema oscuro nunca estuvo roto (`ink-950/80` da 6,09:1
hasta sobre `cream-50`), así que sólo cambió lo que hacía falta. D1 era un
defecto de modo claro, como decía la auditoría.

**Lo que se decidió NO hacer:** volver el header translúcido en los bordes. La
translucidez es deliberada y está bien en `pagina`, donde detrás sólo hay
superficies claras. Sobre un lienzo, o a medio camino de uno, es exactamente el
defecto.

**Dónde termina el negro se mide en vivo,** leyendo la máscara y el alto del
degradé de salida, en vez de anotar números a mano. Con eso sale gratis que
`#puntos` no tenga fade en oscuro —su ventana de `borde` dura 160px en claro y
60px en oscuro— y que el degradé del hero cambie de alto según el viewport.

Verificado barriendo la home entera en un Chrome real, 280 posiciones cada 20px
en los dos temas: **ninguna por debajo de 4,5:1**. Peor caso por estado, en
claro 11,60 / 4,71 / 4,71 y en oscuro 11,60 / 11,20 / 11,20.

## 3 sexies. Qué es card y qué no

Fase B paso 3, el 22 de septiembre de 2026. El contrato de rediseño sacó a
`rounded-card` + borde de su puesto de contenedor por default y dejó abierta la
pregunta de qué lo reemplaza. Esto la contesta, y de paso cierra D3.

### La regla, en dos cláusulas

**Primera, de contenido: es card lo que se toma.** Algo que se completa, que se
copia, o que se compara con lo que tiene al lado. Lo que sólo se lee se agrupa
por aire y un filete, que es lo que el manual pide por default —*"un grupo se
lee por su aire, no por su borde"*— y para lo que ya existe
[`Hairline`](../components/Hairline.tsx), cuyo docstring dice desde siempre
"reemplaza a las cards cuando sólo hace falta separar".

**Segunda, de contraste, y pisa a la primera: en claro, el texto chico sobre una
sección con tinte va en card de `paper`.** No por composición: porque
`cream-100` no lo sostiene. Los números están más abajo. En oscuro la cláusula
no aplica.

Con eso, las cards del sitio son **cuatro**, cada una por un motivo distinto:

| Card | Cláusula | Por qué |
|---|---|---|
| [`WaitlistForm`](../components/WaitlistForm.tsx) (vacío y éxito) | 1ª | Se completa. Y es la misma card en dos estados: si cambiara de forma al enviar, el envío se leería como una navegación |
| [`Audiences`](../components/Audiences.tsx) | 1ª | Se compara. Un objeto, dos mitades, el borde exterior sin cortar |
| [`ReferralCode`](../components/ReferralCode.tsx) | 1ª | Se copia. El borde punteado es lo que la separa de las otras tres, y es deliberado: lee como algo que se arranca |
| Beneficios de [`/lista-espera`](../app/lista-espera/page.tsx) | **2ª** | Por contenido no sería card. Se queda porque la sección tiene tinte |

Y se fue una: la de `/invite`.

**`rounded-card` no es sinónimo de card.** El radio nombra un tamaño, no un rol:
una pieza grande lleva 24 px sea card o panel. El panel de Referidos de
[`Rewards`](../components/Rewards.tsx) usa `rounded-card` y no es una card —
sobre un lienzo no hay cards, porque no hay sombra posible y un `paper` ahí
sería violento—. Contar `rounded-card` en el repo da cinco usos y cuatro cards.

### D3: la sombra que se sacó no se veía

Las cuatro superficies que llevaban sombra y borde a la vez —`WaitlistForm`
(dos), `/invite` y los beneficios de `/lista-espera`— no llevaban
`--shadow-card` sino un `0 1px 0 rgba(0,0,0,0.03)` escrito a mano. Medido, ese
negro al 3 % compone **1,068:1** sobre `cream-50` y **1,005:1** sobre `ink-950`.
Para comparar: §3 bis trata 1,036:1 como indistinguible. O sea que la infracción
al manual era real y su costo visual, cero: sacarla no cambia un píxel que se
note. Las cuatro quedan con borde, y al 10 %, que es el valor del manual.

### Por qué el filo de la card es el borde y no la sombra

El manual dice que una superficie de contenido lleva `--shadow-card`. La web
hace lo contrario, y queda como *Divergencia 7* en [`MARCA.md`](MARCA.md). Se
decide con dos números:

| | Sombra canónica | Borde al 10 % | Relleno solo |
|---|---|---|---|
| Claro, card sobre `cream-50` | **1,208:1** | **1,208:1** | 1,027:1 |
| Oscuro, card sobre `ink-950` | 1,064:1 | 1,357:1 | 1,157:1 |

En claro los dos filos dan **el mismo número** —las dos son `ink-900` al 10 %
compuesto—, así que ahí la medición no los separa y la elección es de carácter.
En oscuro sí decide: `--shadow-card-dark` rinde **menos que el propio relleno de
la card**, o sea que no dibuja nada, mientras que el borde es el filo más fuerte
disponible. Un filo que existe en un tema y no en el otro no puede ser la regla
de un sitio cuyo pre-flight pide los dos temas diseñados.

De paso: el relleno claro no separa nada (1,027:1). En claro la card **es** su
borde; en oscuro el borde acompaña a un relleno que ya se ve. No es el claro
invertido.

**Los dos tokens de sombra no se borran: se les dio su único uso legítimo.**
Estaban en `@theme` sin que los leyera nadie, que es la forma más segura de que
alguien los use mal. Ahora los usa la única superficie del sitio que de verdad
flota por encima de la página: el toast de `ReferralCode`. Que además estaba
escrito como **píldora con `shadow-lg`**, rompiendo dos reglas del manual a la
vez —el toast tiene radio propio (16 px) y las píldoras no llevan sombra nunca—.
Ninguna de las tres auditorías lo había marcado.

### `cream-100` no sostiene texto chico, y no se arregla aclarándolo

Es el hallazgo que obligó a la segunda cláusula. Al sacarle la card a los
beneficios de `/lista-espera`, el texto quedaba sobre el tinte:

| Sobre `paper` (la card) | Sobre `cream-100` (el tinte) | Pide |
|---|---|---|
| `ink-500` cuerpo **4,83:1** | **4,35:1** | 4,5 |
| `amber-600` cifra e ícono **3,31:1** | **2,97:1** | 3,0 |
| `ink-900` título 14,68:1 | 13,20:1 | 4,5 |

Los dos primeros fallan. Y **aclarar `cream-100` no es salida**: para sostener
`ink-500` a 4,5:1 tiene que llegar a `#F6F8FA`, y ahí separa **1,04:1** contra
`cream-50`, o sea que deja de verse como banda. Es exactamente la trampa de la
§3 ter con el lavado cálido —no existe un valor que sea legible y además se
vea—, sólo que en el eje de la luminosidad en vez del de la temperatura.

**Consecuencia para D2.** La auditoría llamó D2 al eyebrow `amber-700` a 4,38:1
sobre `cream-100` y lo dejó para el paso 5. Esto lo agranda: no son un eyebrow y
un token mal calibrado, es que **en claro una sección con tinte no puede llevar
texto chico directamente**. El paso 5 tiene que resolverlo como estructura, no
como un ajuste de color, y los beneficios de `/lista-espera` son el primer caso
que se destraba cuando lo haga.

### La fórmula concéntrica vale en anidados apretados

`radio exterior = radio interior + padding` no sobrevive al padding de la web, y
conviene anotarlo antes de que alguien "arregle" los radios con ella. La card de
`WaitlistForm` tiene 24 px de radio, 24–40 px de padding y campos de 12: la
fórmula pediría 36–52 px de radio exterior, y 52 px es más que la píldora. Con
28–40 px de aire entre un borde y el otro, las dos esquinas no se leen como
concéntricas: se leen como dos formas independientes.

Donde el anidado **sí** es apretado, el sitio ya la cumple exacto: el marco del
teléfono de `HowItWorks` es 40 px de radio con 12 px de padding sobre una
pantalla de 28 — 28 + 12 = 40. La regla es esa: vale mientras el hijo toque el
padding.

Fue además el segundo argumento para sacar la card de `/invite`, que envolvía el
contenido entero de la página —no se levantaba por encima de nada— y anidaba la
card punteada de `ReferralCode`, pidiendo 24 + 28 = 52 px y teniendo 24.

### Sacar esa card destapó un lavado debajo del texto, otra vez

`/invite` tiene un destello ámbar detrás del lockup. Mientras el contenido vivía
dentro de una card de `paper`, la card lo tapaba. Sin ella, la cola del destello
llegaba al eyebrow con un **6,92 %** de ámbar encima, y ahí `amber-700` da
**4,457:1**: falla AA por poco, que es la misma forma en que ya fallaron los
otros tres lavados de este repo (`LegalDoc`, `ReferralCode`, `HowItWorks`).

Medido en vivo sobre el DOM, no estimado: se lee la geometría real del círculo y
se evalúa el alfa en el punto de cada texto más cercano al centro. El destello
se subió de `-top-48` a `-top-72`, con lo que el eyebrow queda en **1,65 %**
(≈ 4,64:1) a 375 px y en **0 %** en escritorio, y el lockup conserva el 14,3 %
que es para lo que el destello existe. `-top-64`, que fue el primer intento,
dejaba el caso móvil en 4,29 % — pasaba con 0,07 de margen, y este repo ya se
quemó dos veces con márgenes así.

**La lección, por tercera vez:** el contraste se mide sobre el píxel finalmente
pintado. Acá la card no era decoración, era la capa que separaba el texto del
lavado — y quitarla es un cambio de contraste aunque no se toque un color.

## 3 septies. El header no tiene superficie; los links sí

Reemplaza a la §3 quinquies, que describía tres estados del header. Esa solución
se sacó el 22/9/2026 a pedido: el cambio de color era demasiado visible y, peor,
el estado `borde` dibujaba una **banda crema opaca sobre el hero negro** en el
cuadro más visible del sitio. Queda anotado por qué la solución obvia —dejar la
barra transparente y elegir un color de texto— tampoco funciona.

### Una barra transparente no puede tener un solo color de texto

Dos mediciones, las dos en contra:

**Una, el degradé.** Mientras los lienzos se disolvían, por detrás del header
pasaba toda la rampa de `marca-profunda` a `cream-50`. A mitad de camino el
fondo es `#787570`, un gris medio, y ahí no hay color que sirva: eligiendo
siempre el **mejor** de los dos vestidos, el peor punto del degradé da
**1,71:1** con `bone-300`/`ink-500` y **3,38:1** con el par más fuerte
(`bone-100`/`ink-900`). Esto se arregla haciendo que los lienzos corten neto.

**Dos, y ésta no se arregla con un interruptor: el fondo puede estar PARTIDO.**
La mitad oscura de la card de `#publico` (`ink-950`) cruza la banda del header
durante unos **680 px de scroll**, y deja claro a la izquierda y oscuro a la
derecha al mismo tiempo. Medido: con el vestido claro, "Puntos" y "Soporte"
quedan en **1,31:1**; dándolo vuelta, los dos links de la izquierda quedan en
**1,61:1** sobre la mitad clara. El problema no es *cuándo* cambia el vestido,
es que hay dos fondos a la vez bajo una misma barra.

### La salida: que el contraste no dependa del fondo

De una referencia que trajo el usuario (el sitio de Oxford). Dos movimientos:

**Los links viajan con su propia superficie.** Van dentro de una píldora con
relleno y borde de 1 px al 10 % — el borde *acompaña* a un relleno, así que le
corresponde el 10 % del manual y no el 3:1 de la *Divergencia 6*; y sin sombra,
porque es una píldora. Con eso el número es constante en toda la página:

| | Claro | Oscuro |
|---|---|---|
| Link sobre la píldora | **14,68:1** | **9,68:1** |

**El hero deja de meterse debajo del header.** Pasa a ser un lienzo con
esquinas, apoyado dentro del `wrap`. En reposo el nav está sobre la página, no
sobre el negro, que es de donde salía la banda crema.

### Lo único que todavía cambia de vestido es el lockup

Va suelto a la izquierda, y ahí el cambio **sí** es seguro, porque en esa
posición nunca hay fondo partido: la mitad oscura de `Audiences` arranca en el
medio del `wrap`, y todo lo demás que pasa por detrás —el hero, `#puntos`,
`#cierre` y el footer— ocupa el ancho entero.

- con lienzo: `bone-100` sobre `marca-profunda` — **14,91:1**
- sin lienzo: `ink-900` sobre `cream-50` — **14,29:1**

**El lienzo del hero arranca en el borde de contenido del `wrap`, que es
exactamente donde arranca el lockup.** No es casualidad y hay que conservarlo:
es lo que garantiza que, cuando el hero pasa por detrás del header, el lockup
tenga negro pleno debajo y no medio borde. Verificado a 1280 y a 1440.

### Lo que se borró

Los tres estados, la lectura en vivo de máscaras y de alturas de degradé, la
tolerancia `EPS`, el loop por cuadro con `getBoundingClientRect`, el estado
`scrolled` y el filete al scrollear. Queda un `IntersectionObserver` cuya raíz
es una franja de 72 px pegada arriba, que sólo alimenta el vestido del lockup.
`Nav.tsx` pasó de 384 a 298 líneas.

**El footer se marcó `data-canvas`.** Es `ink-950` en los dos temas, o sea una
superficie oscura más, y el header viejo lo tapaba con su banda translúcida sin
que nadie lo notara. Sin eso, al final de **cualquier** página el lockup se
vestía de claro sobre oscuro: 1,31:1.

### Verificación

Ocho posiciones de la home —tope, hero, salida del hero, `#como-funciona`,
la mitad oscura de `#publico`, `#puntos`, `#cierre` y el pie—, en los dos temas:
el vestido del lockup coincidió con el fondo real en las ocho, y el link se
mantuvo en 14,68:1 en todas. Y el CTA del hero entra sobre el pliegue a 375×812,
1280×700 y 1440×900, sin scroll horizontal.

> **Las ocho posiciones se verificaron en escritorio, y ahí faltaba una.** En
> anchos donde las dos mitades de `#publico` se **apilan**, la oscura ocupa el
> ancho entero y pasa por debajo del lockup, que se quedaba en `ink-900` sobre
> `ink-950`: **1,26:1**, o sea el D1 otra vez. Partida no pasa, porque esta
> mitad arranca en el medio del `wrap` — que es justamente el supuesto sobre el
> que se apoya todo lo de arriba, y que sólo vale mientras haya dos columnas.
> Medido y cerrado en la Fase C, en la §3 duodecies.

### Lo que se decidió NO hacer

- **Que el header se vaya al scrollear.** Resolvía todo sin JavaScript, pero en
  una página de ~8.000 px con cuatro anclas deja el menú y el CTA fuera de
  alcance.
- **Una barra oscura fija.** Era la otra forma de tener un solo vestido. Sobre
  la página clara es un elemento pesado y tapa la mitad del gesto de marca.
- **Tocar la card de `#publico`** para que su mitad oscura no cruce la barra.
  Es la pieza que la auditoría llama la mejor compuesta del sitio; no se toca
  para arreglar otra cosa.

### Consecuencia abierta

Los lienzos hoy cortan neto: se sacó el degradé de salida del hero y el `fade-y`
de `#puntos`, que eran el dispositivo §4.3 de "el color entra y sale sin borde".
Con la píldora, el degradé ya sólo expone al lockup, que necesita 3:1 y en el
peor punto tiene 3,38:1 — o sea que **se pueden reponer**. Se dejaron cortando
porque el hero ahora tiene un borde real de card y la página quedó coherente,
pero es una decisión de composición de la Fase C, no una restricción.

Y queda la pregunta que abre la referencia: si el hero es una card con esquinas,
`#puntos` y `#cierre` —que siguen a sangre— deberían decidir si acompañan. Es
Fase C.

## 3 octies. Una banda clara no sostiene texto chico

Fase B paso 5, el 22 de septiembre de 2026. Es D2, y la §3 sexies ya había
avisado que era más grande de lo que decía la auditoría: no un eyebrow mal
calibrado sobre `cream-100`, sino que **en claro ninguna banda sostiene texto
chico**. Acá está la salida, que tuvo que ser estructural.

### El número, y por qué no hay forma de moverlo

| Sobre | `ink-500` | `amber-700` | `ink-900` |
|---|---|---|---|
| `cream-50` (la página) | 4,71:1 | 4,75:1 | 14,29:1 |
| `cream-100` (la banda) | **4,35:1** | **4,38:1** | 13,20:1 |
| lavado cálido (pico) | **3,53:1** | **3,56:1** | 10,73:1 |

Las dos tintas con las que la web escribe texto chico pasan **sólo sobre la
página pelada**, y con dos décimas de margen. Cualquier superficie las tumba.

Y no se arregla por el lado del color, por los dos ejes:

- **Aclarando la banda:** para sostener `ink-500` tiene que llegar a `#F6F8FA`,
  y ahí separa 1,04:1 contra `cream-50` — deja de verse como banda. Está medido
  en la §3 sexies.
- **Oscureciendo la tinta:** `ink-900` pasa en todas, pero es la tinta del
  título; una bajada del mismo color que su título no es una bajada.

### La salida: la superficie declara qué tinta la puede pisar

La banda deja de ser una superficie que aguanta cualquier cosa y pasa a tener
una **regla de colocación**, igual que la utilidad `lavado` ya la tenía escrita
adentro desde la Fase B0. En claro, una sección con tinte se compone en **tinta
plena**: `ink-900` y acentos sólo a tamaño grande, donde el umbral baja a 3:1 y
`amber-700` da 4,38:1. No van bajadas en `ink-500` ni letra chica.

No es una restricción, es una densidad: **la banda es donde la página habla a
tinta plena, y el papel es donde tiene bajadas y letra chica.** El contrato lo
habilita explícitamente — *"que dos secciones contiguas tengan densidades
distintas a propósito"*. En oscuro la regla no aplica: `bone-300` sobre
`ink-850` da 10,14:1.

La regla vive junto al token en `globals.css` y repetida en `Section.tsx`,
porque quien elige un `tone` es quien tiene que leerla.

### Lo que se destrabó, primero: el eyebrow perdió el ámbar

Resultó ser la mitad más grande de D2. El componente tenía dos variantes,
`amber-700` y `ink-500`, y **las dos son texto chico**, o sea que las dos
vivían en la fila de arriba. Puestos juntos, el mismo rótulo ya había fallado
cuatro veces en cuatro superficies distintas:

| Dónde | Contraste | Quién lo encontró |
|---|---|---|
| `#publico`, sobre `cream-100` | 4,38:1 | la auditoría (D2) |
| `/lista-espera`, dos secciones con tinte | 4,38:1 | la auditoría (D2) |
| `/invite`, bajo el destello | 4,457:1 | §3 sexies — hubo que correr el destello |
| sobre el lavado cálido | 3,56:1 | §3 ter — dejó a D2 como bloqueante |

El último es el que decide, porque **no tiene arreglo por color**: el ámbar que
pasara sobre el lavado ya no se leería como el ámbar. O sea que el rótulo de
acento bloqueaba el único dispositivo cálido que la Fase B0 construyó para el
modo claro, que es lo mismo que decir que bloqueaba la Fase C.

En tinta el número deja de depender de la superficie — 14,29 / 13,20 / 14,68 /
10,73:1 sobre `cream-50`, `cream-100`, `paper` y el lavado—. Es exactamente el
movimiento que la §3 septies acaba de hacer con los links del nav: cuando un
elemento tiene que sobrevivir a varios fondos, se deja de elegir el color por
fondo y se lo saca de la ecuación.

**Y además era un problema de marca, no sólo de contraste.** El manual dice que
el color aparece "en el CTA, en lo elegido y en lo urgente. En una pantalla bien
resuelta hay muy poco naranja". Había **catorce** rótulos ámbar en el sitio, uno
abriendo cada sección. Un acento que aparece catorce veces no es un acento: es
el color del texto de rótulo. El ámbar queda para el CTA.

Con la tinta, las dos variantes se vuelven la misma cosa y se retiran — una
etiqueta por intención—. Lo que separa al rótulo del título que tiene debajo es
la escala (13px en 700 contra 52px), no el color. El tracking vuelve a 0, que es
lo que el manual pide para texto chico y el componente no cumplía.

### Lo que se destrabó, segundo: los beneficios dejan de ser una card

Las cuatro cards de la §3 sexies eran tres por lo que son —se completa, se
compara, se copia— y una por el fondo que tenía detrás. Los beneficios de
`/lista-espera` estaban en card sólo para levantar el cuerpo de 4,35:1 a 4,83:1
y la cifra de 2,97:1 a 3,31:1. **Era la única card del sitio que existía por su
fondo.**

Con la regla, el problema se resuelve donde estaba: el cuerpo pasa a `ink-900`
(13,20:1) y la cifra a `amber-700`, que a `display-sm` es texto grande y da
4,38:1 contra los 3:1 que pide. Quedan tres ítems de aire y filete, que es lo
que el manual pide por default. Las cards del sitio bajan de cuatro a tres.

Se fue también el ícono de cada ítem: decía lo mismo que la cifra que tiene
debajo, y en `amber-600` era el otro número que fallaba. Un ítem que ya no es
una card no necesita dos marcas gráficas.

Y la sección de letra chica de esa misma página sale del tinte por la misma
regla. Es literalmente la letra chica del sitio; ponerla en `ink-900` sería
gritarla, así que va sobre la página, donde `ink-500` vuelve a 4,71:1.

### D4, D5, D6 y D7, que cierran en el mismo paso

**D4 cierra sin excepciones.** Los 57 bordes repartidos en seis opacidades
quedan todos en el 10% del manual. El único elegido por medición era el filo de
los lienzos en oscuro, que la §3 bis puso al 12%: al 10% da **1,24:1**, y sigue
cumpliendo el criterio con el que se eligió —ser más que el mejor relleno
disponible, que es `ink-800` sobre `ink-950` con 1,157:1—. Quedan afuera dos
bordes ámbar, que son marcas de acento y no el filo neutro de una superficie, y
los `hover:` al 25%, que son estados.

**D5 no necesitaba el quinto radio que proponía la auditoría.** `rounded-sm` era
el radio más usado del sitio —quince veces— y no existe en el manual: son los
2px por default de Tailwind, puestos sólo para darle forma al anillo de foco
sobre links de texto. El anillo alrededor de una palabra es una **píldora**, que
ya es uno de los cuatro y es la forma que los links del nav ya usan. El sitio
pasa de nueve radios a cinco sin inventar ninguno. Los dos arbitrarios que
quedan son los del teléfono dibujado a mano de `HowItWorks` —cumplen la fórmula
concéntrica exacta— y se van con el teléfono en la Fase C.

**D6 y D7 cierran juntos, y en CSS.** `--duration-reveal` valía 560ms, `Reveal`
escribía `duration: 0.7` a mano y su propio docstring citaba 700ms. La
tentación era copiar 0,56 al componente; eso no cierra nada, porque **un valor
de movimiento que vive en JavaScript no puede ser el token del sitio**. El
reveal pasa a una utilidad de CSS que lee `--duration-reveal` y `--ease-reveal`,
y el componente sólo decide *cuándo*. Es el mismo criterio que el botón ya
aplicaba con `var(--duration-chico)`.

Recién con eso D7 tiene sentido: `Rewards` puede usar `Reveal` en vez de
reimplementarlo cuatro veces, y si no lo hiciera se habría quedado sola
corriendo a 700ms. De paso se fue el `motion.span` de la cifra de Puntos, que
era el reveal otra vez con otra duración dentro de un bloque que ya se estaba
revelando.

La utilidad entera cuelga de `prefers-reduced-motion: no-preference`: con
*Reducir movimiento* no hace nada, **ni siquiera el estado inicial**, que es la
misma garantía que daba el `useReducedMotion` del componente anterior. Y el
observer revela también lo que ya quedó por encima del viewport, que es lo que
pasa cuando la página carga con el scroll restaurado o en un ancla — eso el
componente anterior no lo hacía.

**Los `rgba()` sueltos** salen a dos utilidades, `destello` y `calor`, siguiendo
el precedente de `lavado`. Verificado que el CSS computado es idéntico:
`rgba(215,138,29,0.13)` exacto. No se re-calibraron los alfas a propósito — el
del destello ya entró una vez en una medición de contraste (§3 sexies, el
eyebrow de `/invite`), y esto es un cambio de tokenización, no de diseño. El de
la línea de referidos se resuelve con `currentColor`. Queda uno, la sombra del
teléfono, que se va con el teléfono.

### Lo que se decidió NO hacer

- **Sacarle el relleno a la banda en claro** y marcar la sección sólo con
  filetes, que es lo que el modo oscuro ya hace por la §3 bis. Resolvía el
  contraste de un plumazo, pero borra un dispositivo de composición en el tema
  donde funciona, justo cuando el dial que hay que recorrer es `VARIANCE` de 4 a
  7. Sería arreglar un tema rompiendo el otro, que es lo contrario de lo que
  este repo viene decidiendo.
- **Derivar una segunda tinta secundaria** más oscura que `ink-500` para que
  sobreviva a la banda. Es la versión en token de "una segunda card parecida a
  la que ya existe", y el contrato dice que el rediseño reduce el catálogo.
- **Migrar los dos h3 de `Audiences` a `display-sm`.** El token nació con el
  piso puesto en ese 1,75rem, pero `Audiences` lo usaba como tamaño fijo, no
  como piso: a `display-sm` (40px) el título de la card queda a 1,30 del
  `display-lg` de su sección y le compite, y al `h3` canónico (24px) entra en un
  renglón y se lee como una oración. Mirado en pantalla, las dos alternativas
  son peores que el valor a mano. El 1,75rem es un escalón real entre dos pasos
  y la B0 ya decidió no sumar un sexto nombre; `Audiences` se recompone entera
  en la Fase C y el escalón se elige ahí.

## 3 nonies. El hero, y los disolvidos que no vuelven

Fase B paso 5, el mismo día. El hero se adelantó a la Fase C —va antes de
`#como-funciona`, contra el orden del contrato— porque la card con esquinas de
la §3 septies le cambió las proporciones y lo dejó mal ejecutado: el titular
rompía en tres renglones y casi un tercio del lienzo quedaba negro y vacío a la
derecha.

**Las dos cosas eran la misma, y las decide una medición.** El contenido vivía
en 9 de 12 columnas —757px de los 1020 que el lienzo tiene por dentro—, un ancho
heredado de cuando el hero iba a sangre y el texto tenía que apartarse del borde
de la pantalla. Apoyado dentro del `wrap` y con padding propio, esa columna dejó
de tener sentido: **el lienzo ya es el margen.** La frase entera mide 1531px de
glifos a 88px, así que a 757 pide 2,02 renglones y sale en tres, y a 1020 pide
1,50 y sale en dos. No hubo que tocar la escala, el copy ni el `clamp`.

Con el titular a lo ancho, la mitad derecha se llena sola con una banda de abajo
a dos columnas — bajada a la izquierda, la aclaración y los dos CTA a la
derecha—, y esa banda además acorta la pila vertical, que es lo que sostiene al
CTA sobre el pliegue con las proporciones nuevas. El filete pasa a ir de lado a
lado: medía 32rem y era el filete de una columna, no el del cartel.

**Lo que la §3 septies pedía respetar, verificado.** El lienzo sigue arrancando
en el borde de contenido del `wrap` (170px a 1440), que es donde arranca el
lockup; barrido el tramo donde la card entra a la banda de 72px del header
—scroll 70, 76, 80, 90 y 100— el lockup da 14,91:1 en los cinco. Y el CTA entra
sobre el pliegue en los tres tamaños del contrato, con los dos botones adentro:
755 a 375×812, 586 a 1280×700 y 687 a 1440×900, sin scroll horizontal.

**No sube a `display-2xl`,** que es para lo que el contrato habilita el paso por
encima de `display-xl`. Con el ancho nuevo entraría a 136px en tres renglones a
1440, pero a 1280×700 —el viewport que ya obligó a los `@media (max-height)`—
son 353px sólo de titular contra 508px de alto útil, y el CTA se cae abajo del
pliegue. El piso de la escala lo fija el pliegue, igual que el piso de
`display-2xl` lo fijó el titular y no la cifra (§3 quater).

### Los disolvidos no vuelven

La §3 septies dejó abierto si reponer el degradé de salida del hero y el `fade-y`
de `#puntos`, que eran el dispositivo de "el color entra y sale sin borde" y se
sacaron para arreglar el nav. Con la píldora del nav ya no hacen falta para el
contraste — el único expuesto es el lockup, que necesita 3:1 y en el peor punto
del degradé tiene 3,38:1—. Es una decisión de composición, y es **no**:

1. **El hero ya no es una banda, es un objeto.** Un degradé de salida en una
   forma con esquinas redondeadas disuelve el borde de abajo y deja los costados
   y las esquinas duros. El dispositivo era de secciones a sangre; la pieza
   cambió de categoría.
2. **Partiría la gramática de la página en dos.** El hero cortaría y `#puntos`
   se disolvería. La §3 septies ya deja planteada la pregunta correcta, que es
   al revés: si el hero es una card con esquinas, `#puntos` y `#cierre` tienen
   que decidir si acompañan. Sea cual sea la respuesta, cortan neto.
3. **El margen no da para gastarlo en decoración.** 3,38:1 contra 3:1 son 0,38
   de aire sobre el elemento que ES la marca, y este repo ya se quemó tres veces
   con márgenes así — 4,457, 4,49 y 4,29—. Cada vez la lección escrita fue la
   misma.
4. **No mueve el dial que hay que mover.** El único que falta recorrer es
   `VARIANCE`, de 4 a 7. Un fundido en el borde de una banda es la misma
   composición con los cantos más blandos.

Con esto la *Consecuencia abierta* de la §3 septies queda cerrada: los lienzos
cortan neto y es una decisión, no una restricción heredada. Lo que sigue abierto
para la Fase C es la otra mitad de esa pregunta — si `#puntos` y `#cierre` pasan
a ser lienzos con esquinas como el hero.

## 3 decies. El error tiene que estar en el campo

Fase B paso 4, el 22 de septiembre de 2026. Es el paso que el contrato pedía
—"campo y formulario: label arriba, error abajo, sin placeholder como label"— y
que se había saltado: el paso 3 tocó `WaitlistForm` sólo por D3 y el 5 sólo por
los bordes. Dos de las tres cosas ya estaban bien. La tercera no estaba.

### Lo que faltaba: el error

El formulario marcaba el campo inválido con un borde rojo y un `aria-invalid`, y
ponía un único mensaje al pie: **"Revisá los campos marcados para continuar."**
Eso rompe tres cosas a la vez, y ninguna de las tres auditorías lo marcó:

- **WCAG 3.3.1.** Un error tiene que estar descrito *en texto*. Un borde no es
  texto. Y `aria-invalid` sin `aria-describedby` le dice a un lector de pantalla
  que algo está mal sin decirle qué: el campo anunciaba "inválido" y nada más.
- **"El color nunca es el único portador de un dato."** El borde rojo lo era.
- **"El error dice qué pasó."** "Revisá los campos marcados" es exactamente el
  *Error inesperado* de la columna derecha de la tabla de Voz.

**La salida es que el error deje de ser algo que el formulario agrega y pase a
ser parte del campo.** De ahí sale la primitiva [`Field`](../components/Field.tsx):
rótulo arriba, control, mensaje abajo, y el control se declara con una función
que recibe `id`, `className`, `aria-invalid` y `aria-describedby` ya atados
entre sí. Si no se los esparce, el campo no tiene ni id ni estilo — o sea que la
única forma de escribir un campo es la que queda bien cableada. Un mensaje que
se puede olvidar se olvida; éste no se puede.

Los textos van en `lib/waitlist-errors.ts`, separados del schema porque el
schema importa `zod` y el formulario es un componente de cliente: leerlos desde
ahí metía la librería entera en el bundle del navegador para usar ocho strings.
Son enunciados y no órdenes —"Falta tu correo", no "Escribí tu correo"—: el
imperativo dice qué hacer, y el que está del otro lado ya sabe que tiene que
escribir.

Tres cosas más que salieron de mirar el flujo completo:

- **El formato del correo se chequea también en el cliente.** Era el único error
  del formulario que costaba un viaje al servidor para volver como un mensaje al
  pie. El texto que se muestra es el mismo que devuelve el endpoint.
- **El error del servidor que habla de un campo va al campo.** El más frecuente
  en producción —"Este correo ya está en la lista VIP"— es un problema del
  correo y se mostraba al pie como si fuera de la página entera.
- **El error se limpia al tocar el campo.** Dejarlo rojo mientras se lo corrige,
  hasta el próximo envío, es de las cosas que el manual llama gritar.

Y el aviso que queda al pie —sólo red y servidor— pasa a ir **arriba** del
botón. Debajo, aparecía después del control que acababas de apretar, fuera del
orden de lectura del gesto, y reservaba alto con `min-h-5` para un hueco que en
la enorme mayoría de los envíos está vacío.

### Tres números que había que medir igual

**El `bg-amber-50` del control de público, por cuarta vez.** La opción elegida se
marcaba con relleno `amber-50` y borde `amber-500`, con la aclaración encima en
`ink-500`: **4,500:1**, AA al ras. Ese par exacto ya se había sacado del repo
**tres veces** —`LegalDoc`, `ReferralCode` y `HowItWorks` documentan cada una, y
la §5 cuenta dos más a 4,49:1—. Era la cuarta y seguía ahí. Peor: el borde
`amber-500` daba **2,59:1** sobre ese relleno y **2,78:1** sobre la card, contra
los 3:1 que WCAG 1.4.11 pide para la señal visual de un estado, o sea que lo que
marcaba la elección no llegaba a verse. Y es, literalmente, el patrón que el
manual nombra en *Lo que no se hace*: "cards de opción con borde naranja".

Lo elegido pasa a marcarse con **tinta plena**: 14,68:1 en claro y 12,44:1 en
oscuro, contra el 1,205:1 del filete al 10% de la que no está elegida, más un
salto de peso para que el estado no dependa sólo del color. Es el mismo recurso
con el que el nav marca la sección activa.

**El placeholder a `ink-500/60`: 2,33:1.** Acá el placeholder no es decoración
sino un ejemplo que se lee —"Ej: 2494…" dice el formato del teléfono—, así que
es texto y pide 4,5:1. Va en la tinta secundaria entera: 4,83:1, y sigue
distinguiéndose de lo tipeado, que va en `ink-900` con 14,68:1. Es el mismo par
de tintas que separa un cuerpo de su bajada.

**Los asteriscos.** Los llevaban los cinco campos obligatorios, en ámbar, y el
único opcional decía además "(opcional)": la marca estaba puesta dos veces y del
lado que no hacía falta. Marcar el opcional alcanza para WCAG 3.3.2, y saca
cinco acentos ámbar de un formulario donde el ámbar tiene que ser el botón —la
misma cuenta que la §3 octies hizo con los catorce rótulos—. El atributo
`required` sigue en cada control, así que un lector de pantalla lo anuncia.

### Una excepción que existía y no estaba escrita

Mirando la pantalla de éxito apareció el 🎉 de "¡Adentro!", que el manual
prohíbe en una línea sin matices ("Sin emojis en la interfaz"). No es un defecto:
el brief lo decide explícitamente (§6.2, *"es un mensaje de celebración, no
iconografía de UI"*) y `Footer.tsx` llegó a citar "la única excepción que
registra `MARCA.md`" — sólo que en `MARCA.md` no estaba. El emoji se queda y la
excepción queda escrita donde el comentario decía que estaba.

### Lo que se decidió NO hacer

- **Tocar el anillo de foco.** Medido de paso: `ring-focus` pinta 2px de
  `cream-50` y 4px de `amber-500`, y el ámbar contra la card de `paper` da
  **2,78:1** — por debajo de los 3:1 con los que se suele leer WCAG 1.4.11 para
  un indicador de foco. Es real y es de toda la web, no del formulario: cambiarlo
  toca cada elemento enfocable del sitio y es una decisión de primitiva, con su
  propia medición contra los cinco fondos. Queda anotado como lo que es, una
  deuda medida, y no se arregla de costado en el paso del formulario.
- **Un resumen de errores al pie.** Con el mensaje en cada campo, el foco yendo
  al primero que falló y un `aria-live` encima, el resumen se anunciaría por
  duplicado.

## 3 undecies. Las capturas, y la sección que más cambia

Fase C, primer paso, el 22 de septiembre de 2026. `#como-funciona` es la
sección que el contrato pone primera porque es la que más cambia: se va el
carrusel con el teléfono dibujado a mano y entran las capturas reales de la
app. Son también las primeras imágenes del sitio, así que acá se deciden de una
vez cómo entran todas las que vengan después.

### Lo que se borró

`HowItWorks` pasa de 612 a 136 líneas, y deja de ser un componente de cliente.
Se fueron el `useState`, el `useInView`, el `AnimatePresence`, el `tablist` con
foco itinerante, el reloj de progreso, el `lucide`, las tres pantallas dibujadas
en HTML con locales inventados y el descargo que las acompañaba — *"Pantallas de
ejemplo. Los locales que aparecen son ilustrativos."*

Ese descargo es el mejor argumento de todos: existía para tapar un problema de
credibilidad que el propio dibujo creaba. Con capturas reales no hay nada que
descargar.

Y cierra la última deuda de `MARCA.md`: con el marco del teléfono se van el
único `rgba()` suelto que quedaba y los dos radios arbitrarios
(`rounded-[2.5rem]` y `rounded-[1.75rem]`). El sitio queda en cuatro radios más
`rounded-full`, que es exactamente la lista del manual, y sin un solo color
fuera del `@theme` afuera de `app/og/`, que es la excepción inherente que ya
estaba declarada.

**Efecto colateral en el manual:** la *Divergencia 8* usaba ese marco como su
único ejemplo de anidado apretado (28 + 12 = 40). El ejemplo ya no existe, pero
la regla sí; queda anotado ahí que su caso testigo se fue con la Fase C.

### La composición: bandas, no dos columnas

El único dial que falta recorrer es `DESIGN_VARIANCE`, de 4 a 7, y la auditoría
midió de dónde sale el 4: 5 de 6 secciones abren con rótulo + `display-lg`, y
4 de 6 resuelven el cuerpo con una partición en dos columnas. La página tiene
una composición, usada seis veces.

Ésta deja de usarla. En vez de título a la izquierda y pieza a la derecha:

1. **Encabezado a lo ancho**, con el titular en `max-w-[14ch]` para que rompa en
   dos renglones cortos y deje la mitad derecha abierta. La asimetría la hace el
   vacío, no otra columna — es el recurso del hero puesto al revés.
2. **Los pasos 01 y 02, escalonados en diagonal.** El 01 arranca en el borde
   izquierdo del `wrap`; el 02 arranca 7 rem más abajo y se apoya en el borde
   derecho. Las dos capturas tienen formatos y anchos distintos a propósito —una
   alta y angosta a 20 rem, otra más corta y ancha a 26 rem— y con eso terminan
   a **3 px** una de otra pese a empezar desparejas. Es el `mt-auto` de
   `Audiences` al revés.
3. **El paso 03 como una banda que cruza la página**, con filete arriba, el
   ordinal y el título a la izquierda y la bajada a tamaño de cuerpo a la
   derecha.

### Por qué el paso 03 no tiene captura

De las 15 capturas ninguna muestra la pantalla de Puntos. No es un faltante que
haya que tapar: los dos primeros pasos son cosas que se hacen **dentro** de la
app y tienen pantalla, y el tercero es lo que queda después del turno, que esta
sección anuncia y `#puntos` cuenta entero dos secciones más abajo. Prestarle
otra pantalla sería mostrar otra cosa.

Que sea el único paso a lo ancho y en tipografía sola es lo que hace que esa
diferencia se lea como el final de la cuenta y no como un hueco. Es el mismo
criterio con el que se decidió **no** usar `09_bienvenida` en ningún lado
cercano al hero: repite el titular de la home con otras palabras y, puestos
cerca, confunden.

### El encuadre: qué se recorta y por qué

**La barra de estado se va de todas.** Su batería es `#34C759`, un verde que la
web no tiene tokenizado —`exito` es `#16A34A`— y está en las 30 capturas, entre
las filas y=75 e y=120. Medido acá, no heredado. El recorte arranca en y=160:
saca la barra con 60 px de margen y no toca el contenido de la app, que en la
más alta empieza en y=221. De paso se va el "9:41", que es cromo de sistema.

**El fondo muerto se va donde lo hay.** `04_cliente_elegir_horario` tiene el
40 % de abajo en superficie vacía: encuadrada de 160 a 1720 queda en
1206 × 1560, y dos capturas de formatos distintos componen mejor que dos
rectángulos iguales.

**La regla de color vale para la interfaz, no para la fotografía.** El
pre-flight del contrato dice "ninguna captura deja ver un color que la web no
tenga tokenizado", y leído al pie de la letra ninguna captura pasaría: las fotos
de locales de `01` y `02` traen 66.000 píxeles de marrones y verdes de un local
real. Son material aprobado por la auditoría justamente por eso — *"trae
fotografía real de locales, que es lo que hoy no aparece en ninguna parte"*. Lo
que no puede aparecer es un color de **UI** que el `@theme` no tenga.

Con esa lectura, y recortadas, las dos capturas de esta sección quedan limpias.
Verificado píxel a píxel sobre las cuatro (dos capturas × dos temas):

| Captura | Colores de UI fuera del ámbar y de `ink-900` |
|---|---|
| `04_cliente_elegir_horario`, oscuro | **0** |
| `04_cliente_elegir_horario`, claro | 526 px, todos antialiasing de `ink-900` |
| `02_cliente_cerca_tuyo`, los dos | ninguno; lo que hay son las fotos |

Y se confirmó el dato que la auditoría dejó anotado: el `#3B82F6` de
"Confirmado" de `10_comercio_agenda_dia` son exactamente **12.580 px entre las
filas y=855 e y=2209** de 2622, en los dos temas. No hay encuadre que lo deje
afuera sin quedarse con el encabezado solo, así que esa captura **no se usa**
hasta que el azul se tokenice — que es una decisión de la lista cerrada de
excepciones y no de esta sección.

De paso, `15_comercio_crecimiento` —la que la auditoría quiere para `#publico`—
quedó verificada también: sus dos colores fuertes son `#16A34A` (`exito`) y
`#BA1A1A` / `#FFB4AB` (`error` y su par oscuro). Los tres están en la lista.

### Las capturas salen de `public/` y entran por `import`

El contrato dejaba la decisión para esta fase. Es `import` estático, con un
`git mv` de `public/capturas/` a `assets/capturas/`. Tres motivos, el último
medido:

1. **Los 1206 × 2622 dejan de escribirse a mano en cada sitio de uso.** Un
   número mal tipeado ahí es un salto de layout, no un error de compilación.
2. **El hash de contenido** en el nombre del archivo, o sea caché inmutable.
3. **Sólo viaja lo que se usa.** En `public/` los 13 MB de las 30 capturas se
   despliegan y se sirven estén o no referenciadas. Fuera de `public/`, el build
   emite únicamente las importadas: hoy **1,9 MB, cuatro archivos**.

Lo que cuesta: hay que mover los archivos. Los originales sin pérdida siguen
siendo la fuente y el comando de resincronización del contrato no cambia; sólo
cambia la carpeta de destino.

### El tema: un `<picture>`, no dos `<Image>`

El sitio elige tema con `prefers-color-scheme` y sin estado en JS, así que cada
captura existe dos veces y hay que bajar una. `next/image` no renderiza
`<picture>`, y su receta documentada para esto —dos `<Image>`, una con
`display: none`— **baja las dos**.

La doc lo da por resuelto: *"el `loading="lazy"` por default garantiza que sólo
se cargue la imagen correcta"*. Medido en esta página, no alcanza. Con el scroll
en cero, en claro, salen **cuatro** pedidos: 47 + 45 + 36 + 36 = **164 KB**, de
los cuales 81 KB son del tema que no se ve. El motivo es que el diferido de
Chrome arranca recién a más de ~1200 px del pliegue y esta sección empieza a
880 px, así que las cuatro imágenes entran igual. A 390 px de ancho, donde la
sección cae más abajo, el diferido sí actúa — o sea que el ahorro dependía del
viewport, que es otra forma de decir que no existía.

La salida es `getImageProps`, que devuelve el `srcSet` que `next/image` armaría
y deja meterlo en un `<picture>` de verdad:

```tsx
<source media="(prefers-color-scheme: dark)" srcSet={enOscuro.srcSet} sizes={sizes} />
<img {...enClaro} />
```

Ahí la elección la hace el algoritmo de selección del navegador, que baja
exactamente una. No es una heurística de carga, es la regla del formato.
Verificado con el scroll en cero en los dos temas: **2 pedidos, 83 KB en claro y
81 KB en oscuro**. La mitad. Y verificado también que al cambiar el tema en
caliente el `<picture>` re-selecciona y baja la otra.

El `<img>` conserva el tema claro como fallback, que es el mismo default que el
`color-scheme` de `globals.css`.

**Lo que cuesta:** `getImageProps` no admite `placeholder="blur"` —el
placeholder no se quitaría nunca—. No es pérdida. La caja tiene su
`aspect-ratio` y su borde reservados, así que no hay salto de layout, y lo que
se ve mientras carga es un panel vacío: literalmente lo que pide el manual, *"si
tarda menos de 400 ms no se dibuja nada para no hacer un parpadeo gris"*.

**Y ninguna captura puede llevar `preload` ni `loading="eager"`**, que bajaría
las dos otra vez. No hace falta: ninguna captura del sitio está sobre el
pliegue, y el LCP sigue siendo el `h1` del hero.

### La captura es un panel, no un teléfono

Sale una primitiva, [`Captura`](../components/Captura.tsx), que reemplaza al
`Device` que se borró. Borde al 10 %, `rounded-card` y adentro los píxeles.

No vuelve a dibujar un marco, por dos razones: sería reponer lo que se acaba de
sacar, y un marco obliga a mostrar la pantalla entera, que es justo lo que el
encuadre evita. `rounded-card` nombra un tamaño y no un rol (§3 sexies): esto es
un panel.

**El borde hace falta, y es medible.** La superficie clara de la app es
`#FBFCFD`, que es exactamente `cream-50` — la auditoría ya lo había anotado como
coincidencia exacta. Sin borde, en claro, la captura no tiene canto contra la
página. Es el mismo 1,208:1 de la *Divergencia 7*: en claro la pieza **es** su
borde.

### El lavado cálido, usado por primera vez

La Fase B0 construyó el lavado y no lo consumía nadie. Va acá, que es la sección
que muestra las pantallas de la app: el calor que la app tiene detrás de sus
encabezados aparece de los dos lados del marco.

**Un degradé anclado en una esquina necesita un canto del que nacer.** Puesto
tal cual, el lavado arrancaba en medio de la página pelada y dibujaba una línea
horizontal dura a lo ancho: arriba cortaba y abajo se apagaba, y esa asimetría
se lee como una banda mal terminada, no como una decisión. En la app el problema
no existe porque arriba del lavado está el borde de la pantalla.

La salida es de composición: **el hero entrega su padding de abajo y
`#como-funciona` lo recibe**, así que el borde de abajo del lienzo es el borde
de arriba de la sección y el corte desaparece debajo de un canto que ya estaba.
De ahí sale un tercer ritmo en [`Section`](../components/Section.tsx), `apoyo`
(`pt-32 pb-24 md:pt-48 md:pb-36`), que es el de la sección que arranca pegada a
la pieza de arriba y se queda con el aire de las dos. El hueco entre el lienzo y
el rótulo queda en 192 px contra los 96 px del hueco interno, o sea que sigue
cumpliendo el doble que pide el manual.

**Y hubo que arreglar la perilla, que no giraba.** La utilidad declaraba
`--lavado-y: 24rem` en el mismo elemento que pinta el degradé, así que el valor
local ganaba siempre y `[--lavado-y:…]` puesto en la sección no llegaba nunca.
Pasa a `var(--lavado-y, 24rem)`: con el fallback, el alcance se puede fijar
desde la sección, que es quien lo elige, y el default no cambia.

**El alcance, medido.** En el borde de **arriba** de cada elemento, que es su
peor punto, a 375 · 768 · 1024 · 1440 px:

| Elemento | Tinta | Tamaño | Lavado | Contraste | Pide |
|---|---|---|---|---|---|
| Rótulo | `ink-900` | 13 px | 49–60 % | 12,06–12,45:1 | 4,5 |
| Titular | `ink-900` | 32–52 px | 39–47 % | 12,55–12,78:1 | 3 |
| Ordinal `01` | `ink-500` | 28–40 px | 0–6 % | 4,63–4,71:1 | 3 |
| Bajadas | `ink-500` | 14 px | **0 % en las cuatro** | 4,71:1 | 4,5 |

O sea: sobre el lavado hay tinta plena y un ordinal a tamaño de display, y el
texto chico cae entero fuera del degradé. La regla de colocación se cumple como
**estructura**, no como ajuste de color — que es la misma forma en que se
resolvieron D2 y la banda con tinte.

**El alcance es responsive y eso no es cosmética:** el degradé no escala con el
texto, y en móvil la sección se aprieta. Con el mismo valor, a 375 px la bajada
recibe un 26,5 % de lavado y `ink-500` cae a **4,37:1**. Queda en
`[--lavado-y:20rem] md:[--lavado-y:24rem]`.

Valores descartados, para no volver a probarlos: **32rem** deja la bajada en
4,64:1 a 1024 px y **34rem** en 4,67:1 a 1440 px. Los dos pasan, con 0,14 y 0,17
de margen, y este repo ya se quemó tres veces con márgenes así — 4,457, 4,49 y
4,29. La cuarta vez la lección es la misma y la salida también: se corre el
degradé, no la tinta.

En oscuro el lavado no restringe nada: el peor número es `bone-300` sobre el
pico compuesto, **8,34:1**. Comparado contra `01_cliente_inicio` en oscuro, la
fuerza es la misma que la de la app.

### Lo que se decidió NO hacer

- **Reponer un marco de teléfono alrededor de la captura.** Es lo primero que se
  quiere hacer al ver una captura suelta, y es volver a dibujar lo que se acaba
  de borrar: el marco vuelve a traer un radio propio, una sombra y la obligación
  de mostrar la pantalla entera.
- **Recortar `10_comercio_agenda_dia` para esquivar el azul.** El `#3B82F6`
  ocupa de la fila 855 a la 2209 de 2622: lo que queda afuera del azul es el
  encabezado solo. O se tokeniza el color —y eso es abrir la lista cerrada de
  excepciones del manual, que se discute aparte— o la captura no entra.
- **Poner una captura prestada en el paso 03.** Ver arriba.
- **`preload` o `fetchPriority` en las capturas.** Ninguna está sobre el
  pliegue, y con `<picture>` el `preload` además volvería a bajar las dos.
- **Mantener las capturas en `public/` para no mover archivos.** Se despliegan
  13 MB para usar 1,9.

## 3 duodecies. `#publico`: un díptico, y el D1 que quedaba vivo

Fase C, el 22 de septiembre de 2026, después de `#como-funciona` y del hero.
Es la primera sección del rediseño donde el trabajo es **sumar**, no recomponer:
la auditoría llama a esta pieza lo mejor compuesto del sitio —*"la única con una
idea estructural propia: un objeto, dos mitades, el borde exterior sin
cortar"*— y la §3 septies pide explícitamente no tocarla para arreglarle
problemas a otra cosa. Lo que le faltaba es lo único que la auditoría le
reprocha: ni un visual, y en la mitad de los locales ninguno en absoluto.

### Dos cosas que no se movieron, y por qué

**Las mitades siguen siendo 50/50**, aunque el contrato habilite romperlo
nombrando esta card. Lo decide una medición: el `wrap` da 1100 px de contenido,
cada mitad 550 y, descontado su padding, **454 px**. Ahí la captura muestra la
app a escala **0,376** y su texto de cuerpo queda en ~15 px. Con una partición
7/5 la mitad angosta cae a ~330 px y a ~11 px. La asimetría le costaría
legibilidad justamente a las dos capturas que son el punto de este paso — y una
comparación se lee cuando los dos objetos miden lo mismo.

**La mitad oscura sigue a la derecha.** La §3 septies se apoya en que el lockup,
que vive en el borde izquierdo del `wrap`, nunca tenga fondo partido debajo,
y eso vale porque esta mitad arranca en el **medio** del `wrap` (medido: x=720 a
1440). Darla vuelta rompería el nav.

### Las dos capturas, y un recorte que sirve para las dos

| Mitad | Captura | Qué muestra el encuadre |
|---|---|---|
| Cliente | `01_cliente_inicio` | El saludo con la ciudad, el buscador y el próximo turno con la **foto real del local** — lo que la auditoría pide y el sitio no tenía en ninguna parte |
| Local | `15_comercio_crecimiento` | "Crecimiento": turnos por mes en un gráfico de doce meses, con el total y el promedio, y los rótulos de "Mejor mes" y "Más vendido" |

Las dos van recortadas de **y=160 a y=1438**, y la coincidencia no se buscó: se
eligió cada corte por dónde terminaba su contenido —en `01`, debajo de la card
del próximo turno y antes de la fila de íconos, que arranca en y=1442; en `15`,
con los dos rótulos de abajo ya visibles y por encima de sus cifras— y las dos
filas cayeron en el mismo lugar. Que compartan proporción (1206 × 1278, **0,944**)
es lo que convierte al objeto en un **díptico**: las dos pantallas arrancan y
terminan en la misma línea, verificado a 1024, 1180 y 1440 px.

Arrancan en y=160 como todas: ahí se va la barra de estado, cuya batería es
`#34C759` y está en las 30 capturas entre las filas 75 y 120.

**Verificación de color, píxel a píxel sobre las cuatro** (dos capturas × dos
temas), dentro del recorte y no sobre el archivo entero:

| Captura | Píxeles cromáticos fuera de la familia cálida |
|---|---|
| `15_comercio_crecimiento`, los dos temas | **0** |
| `01_cliente_inicio`, los dos temas | Ninguno fuera de la foto: todos los tonos ajenos caen dentro de y 741–1124, x 67–1139, que es el rectángulo de la fotografía del local |

El verde `exito` y el rojo `error` de los indicadores de `15` —los tres
tokenizados— quedan **fuera** del encuadre, debajo de la fila 1438, así que la
captura no depende de ellos. Y la regla vale para la interfaz, no para la
fotografía: los marrones del local de `01` son contenido, que es exactamente
por lo que la auditoría eligió esa captura.

### El escalón del h3: `display-sm`, y recién ahora

Las dos mitades escribían `md:text-[1.75rem]` a mano — el **piso** de
`display-sm` congelado—. La §3 octies midió las dos alternativas y las descartó
a las dos, y dejó la elección para cuando la card se recompusiera, que es acá.
Lo que cambió es el contexto, no el número:

- **`display-sm` (40 px) ya no compite.** La objeción era que a 1,30 del
  `display-lg` de la sección el título de la card le disputa la jerarquía. Con
  la captura debajo, el título dejó de ser lo más pesado de su mitad: es el
  rótulo de una pantalla.
- **`h3` (24 px) sería peor que antes.** Entraba en un renglón y se leía como
  una oración; con una imagen debajo se leería como su epígrafe.

Medido: a 1024, 1180 y 1440 px los dos títulos rompen en **dos renglones** sin
que haga falta forzarlos, que es lo que mantiene las dos capturas a la misma
altura. El `max-w-[22ch]` que llevan no trabaja ahí —computa 623 px contra una
columna de 452— y sí cuando las mitades se apilan, donde evita que el título
corra hasta 624 px mientras la captura topea en 416.

De paso pasan a **700**, que es lo que el manual pide de `h3` para arriba y esta
card no cumplía: estaban en 600.

**Y se fueron los dos íconos.** `IconSlot` e `IconStore` abrían cada mitad y no
los usaba nadie más; se borran de [`icons.tsx`](../components/icons.tsx). Donde
había un símbolo de la cosa va la cosa — el mismo movimiento que borró el
teléfono dibujado a mano, y el mismo criterio con el que la §3 octies le sacó el
ícono a cada beneficio de `/lista-espera`.

### `Captura` aprende `onDark`: la superficie manda sobre el tema

El `<picture>` de la §3 undecies elige por `prefers-color-scheme`, o sea por el
tema de quien mira. Es correcto mientras la captura se apoye sobre una
superficie que **también** cambia con el tema. Acá no: la mitad oscura es
`ink-950` en los dos temas, y en modo claro el `<picture>` le metía la captura
**clara** — un rectángulo blanco dentro del medio negro de la card, más luminoso
que la mitad clara de al lado, que es justo lo contrario de lo que el corte de
color de esta pieza tiene que decir.

La salida es la que el sitio ya usa en `Button`, `Eyebrow` y `Hairline`: la
superficie se declara. Con `onDark` no hay `<picture>` ni elección, va la oscura
siempre, y el tipo **prohíbe** pasar la clara para que no quede un import
muerto. Medido en el build: se emiten 7 archivos y la `15` clara (104.548 B) no
es uno de ellos.

Con el scroll en cero, un pedido por captura en los dos temas: **3 pedidos,
181 KB en claro y 179 KB en oscuro**. Ninguna lleva `preload` ni
`loading="eager"`; las cuatro salen en `lazy`, sin `fetchpriority`.

### La partición baja a `lg`, y destapa un defecto viejo

Se partía en `md` (768 px), y ahí cada mitad deja **246 px** de contenido. En
246 px no entra el CTA de la mitad local: la píldora mide **321 px** y se salía
26 px de la card, recortada por el `overflow-hidden`. Es un defecto **anterior**
a este paso —el botón y el padding no cambiaron y `main` tiene las mismas
clases— que la franja de 768 a 913 px arrastraba desde siempre y que ninguna de
las tres auditorías midió. Las capturas sólo lo pusieron a la vista, porque a
246 px la app se muestra a escala 0,20 y su texto queda en ~8 px.

No hay ajuste de padding que lo salve: la mitad entera mide 344 px a 768, así
que entrar pediría dejar el padding en 11 px. Partida en `lg` arranca en 374 px
—el botón entra con 102 px de sobra dentro de la card, medido a 1024— la captura
sube a escala 0,31 y los dos h3 rompen en dos renglones. Entre 768 y 1023 las
mitades se apilan, que es lo que ya hacían en móvil: el objeto sigue siendo uno
solo porque el borde exterior nunca se parte. Apilada, la captura topea en
26 rem, porque a sangre mediría 624 × 660 px y convertiría la tablet en dos
pantallas de scroll por mitad.

### El D1 que quedaba vivo

**Apiladas, esta mitad oscura ocupa el ancho entero y pasa por debajo del
lockup.** El nav busca `[data-canvas]` para saber si tiene una superficie oscura
detrás, y esta mitad no lo estaba, así que el lockup se quedaba en `ink-900`
sobre `ink-950`: **1,26:1**. Es el D1 de la auditoría —*"en móvil es donde más
se nota: la palabra Bookit desaparece y queda sólo el corchete naranja"*— vivo
en el último lugar donde le quedaba sitio, y **anterior a este paso**: en móvil
las mitades ya se apilaban. La §3 septies no lo vio porque verificó las ocho
posiciones de la home en escritorio, donde esta mitad arranca en el medio del
`wrap` y el problema no existe.

La mitad se marca `data-canvas` con un marcador propio que lleva `lg:hidden`, y
el `lg:hidden` **es la regla, no un ajuste**: partida, esta mitad no es un
lienzo para el nav —el lockup queda sobre la mitad clara— y marcarla ahí
produciría la falla inversa, `bone-100` sobre `cream-50`. Un elemento en
`display:none` no interseca nunca, así que el marcador existe exactamente en el
rango de anchos donde la regla vale.

Verificado en cinco puntos, con la pieza correspondiente detrás de la banda de
72 px del header:

| Ancho | Layout | Detrás del lockup | Lockup | |
|---|---|---|---|---|
| 390 px | apilada | mitad oscura | `bone-100` | **14,40:1** |
| 900 px | apilada | mitad oscura | `bone-100` | **14,40:1** |
| 900 px | apilada | mitad clara | `ink-900` | 14,68:1 |
| 1440 px | partida | mitad clara | `ink-900` | 14,68:1 |
| 1440 px | partida | mitad clara | link del nav `ink-900` sobre la píldora | 14,68:1 |

La píldora del nav no dependía de esto y sigue sin depender: su link da 14,68:1
en las cinco.

> Una nota de método: el `IntersectionObserver` del nav **no entrega** mientras
> la pestaña está oculta, así que medir el vestido del lockup con la vista
> cerrada da siempre el valor de reposo y parece un defecto donde no lo hay.
> Las cinco lecturas de arriba se tomaron forzando un pintado antes de leer.

### La regla de tinta de la banda, y qué alcanza

La sección va en `tone="tint"`, así que en claro se compone en tinta plena. Lo
que cae **directamente** sobre `cream-100` es el encabezado, y va entero en
`ink-900` (13,20:1): ni bajadas en `ink-500`, ni letra chica, ni acento a tamaño
de lectura.

Adentro de la card el piso es `paper`, y ahí la regla no aplica: los ítems van
en `ink-900` (14,68:1) y su tilde en `amber-600` (3,31:1, y pide 3:1 por ser un
ícono). No es una excepción a la §3 octies sino su consecuencia — esta card
existe por la **primera** cláusula de la §3 sexies, porque se compara, no por el
fondo que tiene detrás. La única que existía por su fondo era la de beneficios
de `/lista-espera`, y se fue en el mismo paso que escribió la regla.

### Lo que se decidió NO hacer

- **Romper el 50/50**, que es lo único que el contrato nombra por su nombre para
  esta card. Cuesta legibilidad en las dos capturas y desmiente la comparación.
  Está medido arriba.
- **Recomponer el encabezado de la sección.** Sigue siendo rótulo +
  `display-lg`, que es la apertura que la auditoría cuenta cinco veces. Acá la
  varianza la mueve el cuerpo: la página pasa a tener una sección que es un
  díptico de dos pantallas reales, y no hay otra que se le parezca. Rehacer
  además la apertura sería recomponer la pieza que el encuadre de este paso
  manda no rehacer.
- **Sangrar las capturas contra el borde de la card.** Es la composición más
  fuerte de todas las que se probaron en papel, y pide una variante de `Captura`
  sin marco para un solo uso. El contrato dice que el rediseño reduce el
  catálogo de primitivas; `onDark` entra porque es la convención que el sitio ya
  tiene en otras tres, un marco opcional no.
- **Tocar `ring-focus`.** Sigue en 2,78:1 sobre la card de `paper`. Es deuda de
  toda la web, necesita su propia medición contra los cinco fondos y está
  anotada en la *Deuda conocida* de `MARCA.md`. No se arregla de costado.
- **Sacarles el ámbar a los diez tildes de las dos listas.** Se miró, porque las
  capturas traen su propio ámbar y el comentario de la mitad oscura promete
  "una sola cosa por pieza". A tamaño real los tildes se leen como marcas de
  lista y no como acento, y bajarlos a tinta es un cambio de la pieza que este
  paso no tiene que rehacer. Queda anotado, no ejecutado.

## 3 terdecies. El lienzo es un objeto, y con eso cierra el D10

Fase C, el 22 de septiembre de 2026, después de `#publico`. Contesta la última
pregunta que la §3 nonies dejó abierta —*"si el hero es una card con esquinas,
`#puntos` y `#cierre` tienen que decidir si acompañan"*— y resulta que esa
pregunta y el D10 de la auditoría eran la misma.

### La regla, en dos palabras

El hero se volvió una card con esquinas en la §3 septies por un motivo de
contraste, no de composición: apoyado dentro del `wrap`, el nav deja de cruzar
un degradé donde ningún color de texto llega a 4,5:1. Quedaba la mitad
compositiva: los otros dos lienzos seguían a sangre. Acompañan, y con eso la
página queda con una gramática que se puede enunciar:

- **El color que se disuelve es un campo.** Va a sangre y entra y sale con
  `fade-y`. En la home eso es el tinte de sección, y sólo eso.
- **El color que corta es un objeto.** Vive dentro del `wrap`, tiene esquinas y
  se apoya sobre la página. En la home eso son los tres `marca-profunda`.

Es la lectura que la §3 nonies ya había empezado sin nombrarla, cuando decidió
que los disolvidos no volvían porque *"el hero ya no es una banda, es un
objeto"* y *"un degradé de salida en una forma con esquinas redondeadas disuelve
el borde de abajo y deja los costados duros"*. Lo que faltaba era aplicarla a
los otros dos.

La pinta [`Section`](../components/Section.tsx) con `tone="canvas"`, que era la
tercera copia del mismo lienzo escrita a mano. El padding de adentro es el del
hero, así que los tres miden lo mismo por dentro; el `rhythm` pasa a ser el
hueco de página que queda **alrededor** de la card.

### El D10 no era de color, era de geometría

La auditoría lo midió así: `#cierre` es `marca-profunda` y el footer es
`ink-950`, **1,03:1** entre los dos, y en los dos temas las últimas dos
pantallas eran un bloque continuo separado sólo por el filete del footer. *"La
composición más importante de la página —donde se decide— no tiene borde."*

Buscarle un arreglo de color no tiene salida, y está medido desde la §3 bis: el
rango entero de superficies oscuras del manual mide 1,2:1 de punta a punta, y el
footer en modo oscuro **es** el fondo de la página. No hay par de rellenos que
separe esas dos piezas.

La geometría sí, y funciona en los dos temas porque una esquina y un margen no
dependen de la luz:

| | Claro | Oscuro |
|---|---|---|
| Lienzo contra la página | **18,69:1** | 1,036:1 — por eso lleva filo |
| Filo del lienzo al 10 % contra la página | — | **1,236:1**, más que el mejor relleno disponible (`ink-800` sobre `ink-950`, 1,157:1) |
| Lo que separa el cierre del footer | 176 px de página entre los dos, más los márgenes laterales de la card | los mismos 176 px y los mismos márgenes |

En claro el cierre pasa a ser un objeto negro apoyado sobre papel y el footer
una banda aparte: el bloque continuo desaparece. En oscuro los tres valores
siguen siendo oscuros —no hay forma de que no lo sean— pero el cierre ya no es
una banda pegada al footer sino una card con esquinas, borde y margen a los
costados, y el footer es el piso sobre el que se apoya. **Lo que los separa dejó
de ser un filete y pasó a ser una forma.**

### `#cierre`: el contenido toma el lienzo

Con el lienzo hecho objeto vuelve a aplicar, literal, la medición del hero de la
§3 nonies. El contenido vivía en un `max-w-4xl` centrado dentro de un lienzo a
sangre de 1440 px: **270 px de negro muerto a cada lado**. Ese ancho era la
distancia al borde de la *pantalla*, y ya no hay borde de pantalla — el lienzo
es el margen. El contenido toma la card entera (1020 px por dentro), el titular
se va a la izquierda y pasa de tres renglones centrados a dos.

**El huérfano sube.** "Todavía no lanzamos. Te avisamos antes que a nadie." era
la última línea de la página, centrada y sola debajo de las dos columnas. Pasa a
ser la bajada del titular, a tamaño de cuerpo, y el cierre termina en los dos
CTA — que es donde tiene que terminar la última decisión de la página.

**Y se va el `text-xs` con la tinta al 80 %.** Las dos líneas de "qué pasa
después del clic" iban en `text-bone-300/80` a 12 px: un sexto valor de tinta
puesto a mano para algo que el sitio ya resuelve con un token. Pasan a
`text-small text-bone-300`, que es exactamente lo que el hero usa para su
aclaración, y el número sube de **7,68:1** a **11,60:1**. No era una falla de
contraste; era un valor inventado en el archivo donde hizo falta.

**El parecido con el hero es deliberado.** Son los dos lienzos que enmarcan la
home, los dos con titular a lo ancho, filete de lado a lado y una banda de a dos
abajo. Lo que los separa es la simetría, y significa algo: el hero es una voz
hablándole a dos personas y su banda es 5 | 6; el cierre son dos ofertas que
tienen que pesar lo mismo, y la suya es 6 | 6. La auditoría castiga una
composición usada seis veces, no que la apertura y el cierre rimen.

### `#puntos` cambia de lienzo y nada más

[`Rewards`](../components/Rewards.tsx) pasa a `Section` con `tone="canvas"`: se
va su capa de fondo propia, su `overflow-hidden` y su `data-canvas-capa`. La
aurora queda recortada por las esquinas de la card, que es lo que la vuelve un
resplandor dentro de una pieza en vez de una mancha sobre la página.

**Su contenido no se tocó.** En el orden del contrato `Rewards` viene después de
`#cierre` y tiene su propia lista —la auditoría le marca las tres líneas de
"01 · 02 · 03" que repiten `#como-funciona` y los dos párrafos de `text-xs` del
final—. Esto es un cambio de superficie de página, no la recomposición de esa
sección.

**`data-canvas` se mudó a la card.** El nav lo lee para saber si tiene una
superficie oscura detrás del header, y la sección es más alta que la card:
dejarlo en la sección vestiría el lockup de oscuro mientras por detrás todavía
hay página. Es lo que el hero ya hacía. Verificado en las dos piezas, entrando,
adentro y saliendo: `ink-900` antes, `bone-100` adentro, `ink-900` al salir.

Y se borró **`data-canvas-capa`**, que no lo leía nadie desde que la §3 septies
sacó la lectura en vivo de máscaras y alturas de degradé.

### El botón: un rótulo que no entra envuelve, no se desborda

Lo destapó el lienzo del cierre, y estaba desde antes. "Quiero mi lugar como
fundador" pide **321 px** —241 de glifos más los 80 del padding— y el
`whitespace-nowrap` del botón hacía que, donde no entraba, el texto colgara
fuera de su propia píldora. Medido a 390 px: la mitad local de `Audiences` deja
278 px y la píldora medía 276 con el rótulo saliéndose. No es arreglable
apretando el padding — a 375 px esa mitad deja 263.

El botón pasa a `min-h` con padding vertical propio, y el rótulo puede envolver
**sólo por debajo de `sm`**. Los dos detalles importan:

- `min-h-15` en vez de `h-15` deja el alto idéntico mientras el rótulo entra en
  un renglón (24 px de texto + 24 de padding = 48, por debajo del mínimo de 60),
  así que en escritorio no cambia un píxel. Lo que cambia es que un rótulo que
  no entra hace crecer la píldora en vez de salirse.
- El corte en `sm` (640 px) no es arbitrario. Sin `nowrap`, un botón dentro de
  un `flex-row` puede encogerse por debajo de su contenido: medido, los dos CTA
  del hero caían a **tres renglones a 768 px**. Por debajo de `sm` todas las
  filas de botones del sitio ya se apilan, así que cada botón tiene el ancho
  entero de su columna y envolver es lo correcto.

El pre-flight del contrato prohíbe que un rótulo envuelva **en escritorio**; en
un teléfono, envolver es lo correcto y desbordar es el defecto.

De paso, la banda del cierre se parte en `lg` y no en `md`, por el mismo número
que la de `#publico`: a 768 px cada columna deja 248 px y a 1024 deja 376.

### Verificación

Seis anchos —390 · 640 · 768 · 1024 · 1180 · 1440—, los dos temas. Ningún botón
se desborda ni envuelve en escritorio, ninguna página con scroll horizontal, y
el único renglón partido es el CTA largo en un teléfono. El nav, en las dos
piezas nuevas: `ink-900` antes de la card, `bone-100` adentro, `ink-900` al
salir. `npm run build` y `tsc --noEmit`, limpios.

### Lo que se decidió NO hacer

- **Subir el titular del cierre a `display-xl`.** Entra, y son tres renglones
  contra los dos del hero al mismo paso: el cierre terminaría gritando más que
  la apertura. El contrato habilita pasar de `display-xl` "donde la sección lo
  justifique", y acá lo que hace de cartel es el lienzo, no un escalón más de
  tipografía.
- **Forzarle el corte de renglón al titular.** `text-wrap: balance` está puesto
  en todos los `h1/h2/h3` del sitio y parte "Cuando Bookit abra en / Tandil…",
  que no es el corte más lindo — el de la coma lo sería—. Conseguirlo pide
  apagar el balanceo para este titular y elegirle un `max-w` a medida: una
  excepción local a una regla tipográfica de todo el sitio, a cambio de un
  renglón. Se probaron cinco anchos y el balanceo elige siempre el mismo corte,
  porque es el que parte la frase más cerca de la mitad.
- **Recomponer `Rewards`.** Tiene su paso y su lista propia.
- **Buscarle un color al D10.** No existe: el rango oscuro del manual mide
  1,2:1 de punta a punta y el footer en oscuro es el fondo de la página. Está
  medido desde la §3 bis, y cambiarlo sería una decisión de marca.

## 3 quaterdecies. `#puntos`: un registro de dos entradas

Fase C, el 22 de septiembre de 2026. `Rewards` ya había cambiado de lienzo en el
paso de `#cierre` —pasó a ser un objeto con esquinas—; acá se recompone el
contenido, que era lo que faltaba.

### Era la última sección centrada, y la última con dos columnas

La auditoría contó de dónde sale el `DESIGN_VARIANCE` 4: 5 de 6 secciones abrían
con rótulo + `display-lg` en la misma posición y 4 de 6 resolvían el cuerpo con
una partición en dos columnas. Después de `#cierre`, `Rewards` era la única que
todavía hacía las dos cosas, y encima centrada.

El cuerpo deja de ser una partición y pasa a ser **un registro de dos entradas**
separadas por filetes: Puntos primero, Referidos después. No es la misma fila
dos veces —la primera pone la cifra contra su explicación (4 | 7) y la segunda el
argumento contra el diagrama (5 | 6)— y es la forma que el manual pide por
default cuando el contenido sólo se lee: *"un grupo se lee por su aire, no por su
borde"*.

Con eso la home queda así, y ninguna composición se repite:

| Sección | Cómo se resuelve |
|---|---|
| Hero | Titular a lo ancho del lienzo, filete, banda 5 \| 6 |
| `#como-funciona` | Encabezado corto con el vacío a la derecha, dos celdas escalonadas en diagonal, banda a lo ancho |
| `#publico` | Encabezado y un objeto partido en dos mitades iguales — el díptico |
| `#puntos` | Encabezado y **dos entradas apiladas** con filetes |
| `#faq` | Título en cuatro columnas, acordeón en siete *(pendiente de recomponer)* |
| `#cierre` | Titular a lo ancho del lienzo, filete, banda 6 \| 6 |

### Los dos recuadros que tenía por dentro

**Se va la lista "01 · 02 · 03".** Es el *relleno o de más* que la auditoría
marcó, y la comparación es literal:

| `#como-funciona` | La lista de `Rewards` |
|---|---|
| 01 Encontrá tu local. | 01 Reservás tu turno como siempre |
| 02 Reservá el turno. | 02 Los puntos se suman solos |
| 03 Sumá puntos — *"Cada turno te deja Puntos Bookit para canjear en los que vienen."* | 03 Los canjeás en el próximo |

Y además repetía el párrafo que tenía justo encima, que ya dice *"Se acumulan
solos y los canjeás en los que vienen"*. O sea que contaba lo mismo dos veces
dentro de la misma columna, y una tercera vez respecto de una sección anterior.
No es reescribir copy: es sacar una tercera copia.

**Y se va el panel de Referidos.** Sobre un lienzo no hay cards (§3 sexies), y
éste no era ni siquiera de los que se toman: el link es un **ejemplo** de cómo se
ve un código, no un código que alguien copie — el que se copia vive en
[`ReferralCode`](../components/ReferralCode.tsx), y ése sí es una card por la
primera cláusula. Quedaba un rectángulo redondeado con borde adentro de otro
rectángulo redondeado con borde, que es lo que el lienzo hecho objeto volvió
visible. Queda con aire y un filete.

### La cifra pasa a ser el título de su entrada

No es sólo composición. El "500" era un `<p>` suelto y el título de Puntos era
otro `<p>` que empezaba en minúscula, así que la sección tenía **un solo `h3`**
—el de Referidos— y la mitad de Puntos no figuraba en el esquema del documento.
Ahora los dos pedazos son un `h3`: la cifra va en un `<span class="block">` que
la deja a `display-2xl` en su propio renglón, y el texto del encabezado es la
frase entera, "500 puntos de regalo por anotarte.", que es lo que un lector de
pantalla necesita escuchar. El esquema pasa a ser `h2` + `h3` + `h3`.

El espacio entre el `<span>` y el resto va explícito: el `block` lo esconde en
pantalla, y sin él el texto del encabezado era "500puntos".

### Las aclaraciones salen de `text-xs`

Las dos del final de Referidos eran el otro *relleno o de más* de la auditoría,
"letra chica acumulada". El problema no era lo que dicen —la segunda es la
exclusión de los locales, que es información y no adorno— sino a qué tamaño:
**12 px es un escalón que el `@theme` no declara** (`--text-small` es 14 px), o
sea el default de Tailwind puesto a mano. Pasan a `text-small`, que sobre el
lienzo da **11,60:1**. Es el mismo movimiento que hizo `#cierre`.

De los cuatro `text-xs` que tenía `Rewards` queda uno: el rótulo de cada nodo del
diagrama de referidos, que es un epígrafe dentro de un dibujo y no cuerpo de
texto.

### Una sola regla de partición para toda la home

Las dos filas se parten en `lg`, no en `md`. Medido a 768 px: la celda de la
cifra deja **170 px** y "puntos de regalo por anotarte." sale en tres renglones;
la del argumento deja **220 px** y el párrafo baja a cuatro palabras por línea.

Con esto las tres secciones que tienen dos columnas se parten en el mismo lugar
—`#publico` por los 321 px que mide su CTA más largo, la banda de `#cierre` por
lo mismo, y ésta por la tipografía— así que la home queda con **una sola regla:
dos columnas de 1024 para arriba**. Por debajo, todo se apila.

### Verificación

Cinco anchos —390 · 768 · 1024 · 1180 · 1440— y los dos temas. Sin scroll
horizontal en ninguno, el ancla `#referidos` intacta, el `aria-labelledby` de la
sección apuntando al mismo `h2`, y el esquema de encabezados en `h2 + h3 + h3`.
`npm run build` y `tsc --noEmit`, limpios.

El lienzo es el mismo en los dos temas por decisión de marca, así que la sección
se ve igual en claro y en oscuro; lo que cambia es la página que la rodea.

### Lo que se decidió NO hacer

- **Mover la aurora.** Nace centrada (`left-1/2`) y el encabezado ahora está a la
  izquierda, así que el resplandor y el título dejaron de estar atados. Es una
  animación de ambiente, muy difusa y por detrás de todo; correrla es tocar lo
  único que se mueve solo en la sección para ganar muy poco. Queda anotado en
  `PENDIENTES.md`.
- **Subir los rótulos del diagrama a `text-small`.** Son epígrafes dentro de un
  dibujo, y el nodo mide 96 px: "Quien invitás" a 14 px lo llena entero.
- **Tocar el `display-sm` de los dos `h3`.** Es el valor que la sección ya tenía
  y queda a 1,30 del `display-lg` del encabezado, que es el escalón adyacente de
  la escala del sitio. En la entrada de Puntos ni siquiera es lo más pesado —la
  cifra mide 136 px—, y en la de Referidos el filete y el rótulo ya lo
  subordinan.

## 3 quindecies. `#faq`: la última que partía en `md`

Fase C, el 22 de septiembre de 2026. Es la última sección de la home, y la que
menos cambia: su composición se conserva entera.

### Lo que NO se tocó, y por qué

**El acordeón sigue siendo `<details>` nativo.** La auditoría lo cuenta entre
los bloques que trabajan: accesible por teclado, sin JS, y el estado abierto lo
lleva el navegador. Nada de lo que hace falta acá justifica escribirlo a mano.

**La composición tampoco.** Es título anclado en cuatro columnas contra un
cuerpo largo en siete, y después de `#puntos` es la **única sección de la home
donde el encabezado va al costado y no arriba**. La tabla de la §3 quaterdecies
ya la tenía marcada como pendiente de recomponer, y la pasada la deja: el dial
`DESIGN_VARIANCE` está en su objetivo y ninguna composición se repite, así que
recomponerla sería sacar una variante, no sumarla.

Lo que sí queda a la vista es que la columna del título termina con unos 340 px
vacíos debajo, y eso también se conserva: es el mismo recurso que
`#como-funciona` usa al revés —*"la asimetría la hace el vacío, no otra
columna"*—, y es la forma natural de un cuerpo alto contra un encabezado corto.

### Parte en `lg`, y el margen era cero

Era la última de la home que partía en `md`. La §3 quaterdecies había dejado
escrito que la página queda con **una sola regla de partición, dos columnas de
1024 para arriba**, y esta sección la desmentía. No es sólo consistencia:

| Ancho | Columna del título | El titular |
|---|---|---|
| 768 px | **208 px** | "preguntarnos." mide **209** |
| 1024 px | 293 px | dos renglones |
| 1180 px | 345 px | dos renglones |

A 768 px el renglón más largo del titular es un solo píxel más ancho que su
columna, a los 32 px del piso de `display-lg`. No mete scroll horizontal porque
se come el canalón de la columna 5 —la partición deja una vacía entre las dos—,
o sea que el defecto no tiene síntoma: es exactamente el *"lo recorta en
silencio"* que el pre-flight del contrato nombra. Y un margen de 1 px no es un
margen; este repo ya decidió tres veces que con 0,07 y 0,14 de margen no alcanza.

Por debajo de `lg` el título ocupa el ancho entero y sale en un solo renglón
—411 px de glifos en los 688 del `wrap`—, que es mejor que las dos líneas
apretadas que tenía.

### El `+` pierde el ámbar

Son ocho, apilados en una columna. Es la misma cuenta que la §3 octies le hizo a
los rótulos de sección —eran catorce y *"un acento que aparece catorce veces no
es un acento"*— y el manual lo dice en una línea: *"en una pantalla bien resuelta
hay muy poco naranja"*.

La sección tiene un acento legítimo y es otro: el link *Ver Política de
Privacidad* de la última respuesta, `amber-700` sobre la página pelada, 4,75:1.
Es precisamente el uso que `MARCA.md` le dejó a `marcaTexto` cuando le sacó los
rótulos — *"links y texto de acento sobre la página, que es donde su 4,75:1
alcanza"*. Con el `+` en tinta, la sección queda con un solo ámbar, que es lo
que el manual pide por pieza.

Y no se pierde información. El color nunca fue el portador del estado: lo que
dice abierto o cerrado es la rotación del `+` a `×`, que es forma. Es la regla
*"el color nunca es el único portador de un dato"*, cumplida desde antes.

| | Contraste | Pide |
|---|---|---|
| `ink-500` sobre `cream-50` | 4,71:1 | 3:1 (es un ícono) |
| `bone-300` sobre `ink-950` | 11,20:1 | 3:1 |

Es el mismo par con el que `HowItWorks` pinta sus ordinales: la pregunta manda
en `ink-900` y la marca de estado la acompaña.

### El anillo de foco era la única esquina viva del sitio

El `summary` no tiene relleno ni borde propios —los filetes son del `<li>`—, así
que su radio no se ve nunca **salvo** cuando `ring-focus` dibuja sus dos anillos
de `box-shadow`, que toman la forma del elemento. Y dibujaba un rectángulo de
628 × 76 px con las esquinas a **0**.

El D5 cerró en cuatro radios más `rounded-full`, y el 0 no es ninguno de los
cuatro. Va `rounded-card`, por la regla de la §3 sexies: **el radio nombra un
tamaño, no un rol**, y una fila de 76 px de alto es una pieza grande. La píldora
que `MARCA.md` fija para el foco es para *"un link de texto"*, o sea una palabra
en línea, que no es esto.

### Verificación

768 · 1024 · 1180 · 1440, los dos temas. Sin scroll horizontal, el ancla `#faq`
y el `aria-labelledby` intactos, el acordeón abre y cierra con Enter y con
Espacio, y un link dentro de un `<details>` cerrado no recibe foco al tabular
(verificado con Tab real, no con la lista de enfocables).

### Lo que se decidió NO hacer

- **Pasar el `+` al lado izquierdo de la pregunta**, pegado a su rótulo. Se ve
  lejos a 628 px de columna, pero no es un huérfano: el área de clic es la fila
  entera, así que el `+` es una marca de estado al final del renglón, como la
  flecha de una lista de ajustes. Ningún número lo decide, y el criterio de este
  tramo es medir sólo cuando un número decide.
- **Hacer pegajosa la columna del título** para usar los 340 px vacíos. El
  contrato prohíbe el pin de sección, y una columna pegajosa es la versión
  suave de lo mismo: no vale la pena discutirlo por un hueco que la composición
  usa a propósito.
- **Meterle algo a esa columna.** Lo único que entraría es texto nuevo, y el
  contrato prohíbe escribir copy.

## 3 sedecies. El header y el pie, que son la misma pieza vista de los dos lados

Fase C, el 22 de septiembre de 2026. Las dos últimas piezas, en una sola rama
porque las dos son lo mismo: el marco de la página. Y en las dos el trabajo de
fondo ya estaba hecho — el D1 del nav cerró en la Fase B y la §3 septies, y el
D10 del footer en la §3 terdecies—, así que acá sólo queda composición.

### La barra de escritorio aparece en `lg`

La barra tiene tres piezas y dos de ellas son de ancho fijo: el lockup (96 px,
que es el mínimo del manual) y el CTA. A 768 px el `wrap` da 688, los dos huecos
de `gap-8` se llevan 64, y a la píldora de links le quedan **366 px** cuando
mide **424**. El navegador no tiene otra: la encoge, y "Cómo funciona" y "Para
locales" se parten **en dos renglones dentro de la píldora**.

Un rótulo de nav envuelto a mitad de frase es el mismo defecto que el pre-flight
le prohíbe a un botón, y las salidas que no sirven son dos:

- **Apretar el padding.** Faltan 58 px y la píldora ya está en `p-1.5` con links
  de `px-3.5`. No hay de dónde.
- **Un tercer estado de la barra.** La §3 septies sacó los tres que tenía y
  escribió por qué. No se reponen para esto.

A 1024 la barra entra con 180 px de sobra y la píldora nunca se encoge. Por
debajo ya existe el menú a pantalla completa, que es exactamente lo que
corresponde a un ancho donde la navegación no entra. Y de paso el header deja de
ser la excepción a la regla única de partición de la home.

### El menú a pantalla completa estaba mal en cualquier teléfono

Lo destapó el cambio de breakpoint —a 1023 px salta a la vista— pero el defecto
estaba desde siempre y es de una línea. El diálogo es un `flex flex-col`, y la
utilidad `wrap` lleva `margin-inline: auto`: sobre una página normal eso centra
una caja que **ya ocupa el ancho**, pero un ítem de flex con `margin-inline:auto`
deja de estirarse, pasa a `fit-content` y se centra.

Medido a 390 px, con el viewport en 390:

| Fila | Ancho |
|---|---|
| Lockup + cerrar | **180 px** |
| Links + CTA | **280 px** |

O sea que en cualquier teléfono el lockup y la × estaban amontonados en el medio
en vez de en los bordes, los links flotaban centrados de hecho, y el botón que
pide `fullWidth` no era de ancho completo. Con `w-full` el ítem vuelve a ocupar
la línea y el `max-width` de 1180 px del `wrap` vuelve a ser el que manda.

**Es el mismo tipo de error que este repo ya cometió con `--lavado-y`** (§3
undecies): una utilidad escrita para un contexto se comporta distinto en otro, y
sólo se nota cuando alguien la usa en el segundo.

### El CTA del header era lo más chico de la barra

| | Antes | Ahora |
|---|---|---|
| Rótulo del CTA | 12 px | **14 px** |
| Rótulo de los links | 14 px | 14 px |
| Píldora del CTA | 40 px | **48 px** |
| Píldora de los links | 50 px | 50 px |

La acción más importante del header estaba escrita en el cuerpo más chico del
header, y su píldora era 10 px más baja que la que tiene al lado. No fue una
decisión: el tamaño `compact` del botón nació con `text-xs`, que es 12 px, o sea
**el escalón que el `@theme` no declara** (`--text-small` es 14) puesto a mano.
Es el mismo movimiento que ya hicieron `#cierre` (§3 terdecies) y `#puntos`
(§3 quaterdecies) con sus `text-xs`.

Quedan 48 contra 50, que es 1 px arriba y 1 px abajo: a esa escala no se
distingue, y `min-h-12` es un valor de la escala en vez de un `[3.125rem]`
inventado para clavar la diferencia. El tamaño `compact` no tiene otro sitio de
uso en todo el sitio — existe para convivir con estos links, así que medirlo
contra esta píldora es literalmente su trabajo.

### El rótulo de columna del footer era la segunda etiqueta del sitio

"Producto", "Legales" y "Contacto" eran un componente propio, `ColumnTitle`, con
los mismos 13 px que `Eyebrow` y tres diferencias, las tres en contra:

- **`font-semibold`** contra el `font-bold` del rótulo del sitio.
- **`tracking-[-0.01em]`**, cuando el manual (§4) pide 0 en texto chico —
  *"apretar una letra chica la vuelve ilegible"*—. Es exactamente la corrección
  que la §3 octies ya le había hecho a `Eyebrow`.
- **`bone-300`**, la misma tinta que los links que tiene debajo, así que la
  jerarquía de la columna la sostenía sólo el peso.

El pre-flight pide **una etiqueta por intención**, y desde la §3 octies esa
etiqueta es `Eyebrow`: una sola, en tinta, sin variantes. Pasa a usarla, con
`onDark` — el footer es `ink-950` fijo en los dos temas, donde `bone-100` da
14,40:1—, y ahí el rótulo manda sobre su columna en vez de confundirse con ella.

Sigue siendo un `<p>`: fue un `<h2>` de 13 px y metía tres secciones falsas en el
esquema del documento. Lo único que `ColumnTitle` hacía y `Eyebrow` no era
aceptar un `id`, que la lista de contacto necesita para su `aria-labelledby`
—no es navegación, así que no tiene `<nav>` de donde sacar el nombre—. `Eyebrow`
lo aprende, y con eso se retira la primitiva que reemplaza, que es el otro ítem
del pre-flight.

### El filete del footer entra al `wrap`

Era el único `Hairline` del sitio fuera de su caja de contenido. Los tres
lienzos lo ponen adentro, `#como-funciona` y `#puntos` también; acá iba a
sangre, con lo cual su tick ámbar —los 40 px que marcan dónde empieza el
contenido— colgaba en **x = 0**, contra el borde crudo del viewport, mientras
todo lo demás de la página arranca a 40.

Y ya no tiene que separar nada. Ésa era su función cuando el cierre era una
banda a sangre pegada al footer, que es el D10, y la §3 terdecies lo resolvió
con geometría: 176 px de página y las esquinas de la card. Lo que queda es lo
que el filete es en todas las otras piezas — **la línea con la que un bloque
abre**.

Se miró el costo en oscuro, que es donde el footer y la página son el mismo
`ink-950` y la línea es lo único que los separa: con el filete metido, a 1440
cubre 1100 px de los 1440, igual que cualquier otro filete de la página al mismo
ancho. Mirado, el ojo lo lee como un bloque que abre, no como una línea flotando.

### Y los dos últimos valores a mano del pie

- **`bone-300/80`** en la línea de HQ: un sexto valor de tinta puesto a mano,
  justo al lado de "Hecho en Tandil.", que es el mismo tipo de dato a la misma
  escala y va en `bone-300` pleno. Dos grises distintos sin nada que los
  distinga. **7,49:1 → 11,20:1.** Es el mismo arreglo de la §3 terdecies.
- **El `text-xs` del copyright**, que era el último de la home.

### Lo que se decidió NO hacer

- **Centrar la píldora del nav.** Con `justify-between` su centro cae 33 px a la
  izquierda del centro del `wrap`, porque el lockup (96) pesa menos que el CTA
  (181). Centrarla exacto la correría a la derecha ópticamente, y el desbalance
  actual compensa justamente esa diferencia de peso. No hay número que lo decida
  y mirado está bien.
- **Igualar la píldora del CTA a los 50 px de la de links.** Pide un
  `min-h-[3.125rem]`, o sea un valor arbitrario, contra 2 px que no se ven.
- **Recomponer la grilla 4 / 2 / 3 / 3 del footer.** Es asimétrica, no repite
  ninguna composición de la página, y desde la §3 terdecies el trabajo del
  footer es ser el piso: plano y callado.

## 3 septendecies. El pre-flight, corrido de punta a punta

Fase C, el 22 de septiembre de 2026, con las tres piezas anteriores adentro.
Hasta acá el contrato se había verificado **por sección**, y eso deja afuera
justo los ítems que sólo se ven mirando el sitio entero. Ésta es la pasada
completa, y encontró dos cosas.

### Lo que encontró: el hero se recortaba en silencio

En la banda de abajo del hero, los dos CTA piden **434 px** —232 + 12 de hueco
+ 190— y la celda que los contiene no siempre los tiene:

| Ancho | Celda | Sobra / falta |
|---|---|---|
| 768 px | 288 px | **−146** |
| 900 px | 354 px | **−80** |
| 1024 px | 416 px | **−18** |
| 1060 px | 434 px | 0 — entran exactos |
| 1180 px | 494 px | +60 |

Y como el botón lleva `whitespace-nowrap` por encima de `sm`, el segundo no
puede encogerse: se salía de su celda y el `overflow-hidden` del lienzo le
cortaba **106 px** a 768. O sea que "Tengo un local" aparecía **partido al
medio**, en el cuadro más visible del sitio, en todo el rango de 768 a 1059 px.

Es literalmente el último ítem del pre-flight —*"ningún texto ni botón se sale
de su contenedor en el rango de anchos donde hay dos columnas"*— y no lo había
visto nadie porque cada sección se había verificado sola, y la del hero se
verificó cuando todavía partía en `md` como todas.

**La causa es una afirmación que era falsa.** La §3 quaterdecies escribió que la
home queda con *"una sola regla de partición: dos columnas de 1024 para
arriba"*, y contó las tres secciones que tienen dos columnas en el cuerpo. Se
olvidó de dos: la banda del hero y `#faq`. Las dos partían en `md`, y las dos
son las que el pre-flight encontró rotas. Con esta pasada y la §3 quindecies, la
frase pasa a ser cierta.

El arreglo son dos movimientos y el segundo importa:

1. **La banda parte en `lg`.** Entre 768 y 1023 se apila y los dos CTA entran
   cómodos en los 608 px del lienzo.
2. **La fila de botones lleva `flex-wrap`.** Cubre los 36 px que la partición
   sola no: entre 1024 y 1059 la celda sigue quedando corta, y ahí el segundo
   botón baja a su propio renglón en vez de recortarse. Es el mismo principio
   que la §3 terdecies le aplicó al **rótulo** de un botón, ahora aplicado a la
   **fila**: lo que no entra envuelve, no se desborda.

### Lo que encontró: un color huérfano en el manifiesto

`app/manifest.ts` declaraba `background_color: "#FBF9F5"`, un crema **cálido**
que no es ningún token del sitio — `cream-50` es `#FBFCFD`, con R−B = −2—. Es el
fondo del splash de la PWA instalada, o sea lo que se ve el cuadro anterior al
primer pintado de la página, y estaba en un color de una paleta anterior. Pasa a
`cream-50`. El `theme_color` del mismo archivo ya era el canónico.

**Y de paso queda escrita la lista completa de excepciones inherentes**, porque
el contrato nombraba una sola. Son las piezas que no ven el `@theme` porque no
son CSS:

| Pieza | Por qué |
|---|---|
| `app/og/` y `opengraph-image.tsx` | `ImageResponse` renderiza fuera del navegador |
| `app/manifest.ts` | Un manifiesto de PWA es JSON |
| `viewport.themeColor` en `app/layout.tsx` | Metadato del navegador, no una regla |
| `lib/emails.ts` | HTML de correo: los clientes no cargan hojas de estilo |

En las cuatro primeras cada hex es un token del manual escrito literal. En
`lib/emails.ts` hay uno que no —un `#333` de cuerpo de texto— y queda anotado en
`PENDIENTES.md`: un correo se verifica en clientes de correo, no acá, y arreglarlo
de costado en el paso de otra cosa es justo lo que este repo no hace.

### Lo que la pasada verificó y estaba bien

Medido sobre el DOM ya pintado, en la home y en `/soporte`, `/lista-espera`,
`/legal/privacidad`, `/descargar` e `/invite/…`; en claro y en oscuro; a 320,
390, 640, 768, 1024, 1060, 1180 y 1440.

| Ítem del contrato | Resultado |
|---|---|
| Contraste contra el fondo real | **416 nodos de texto** con su fondo compuesto capa por capa. **Ninguno falla.** |
| Nada se sale de su contenedor | Limpio en los ocho anchos, después del hero. Sin scroll horizontal en ninguno |
| Ninguna superficie con sombra **y** borde | Cero |
| Ningún campo ni píldora con sombra | Cero |
| Radios | Sólo `12 · 16 · 24 · 50` y `rounded-full`. Ningún arbitrario |
| Radios concéntricos donde hay anidado | Cinco pares en la home, seis en `/lista-espera`. Todos exactos o bajo la *Divergencia 8* |
| Una etiqueta por intención | Queda **un** `text-[0.8125rem]` en todo el repo: el de `Eyebrow` |
| `focus-visible` en todo lo enfocable | 36 elementos, ninguno sin anillo |
| Sin regresiones de teclado | Ningún `tabindex` positivo; el orden de foco es el del DOM |
| Slugs, anclas y labels de nav | Las ocho anclas presentes, los cuatro labels intactos |
| Esquema de encabezados | Un solo `h1`; `h1 → h2 → h3` sin saltos ni secciones falsas |
| Las capturas | Ninguna `<Image>` fuera de `Captura`; ningún `priority`, `eager` ni `preload`; `public/` sin capturas |

**Tres falsos positivos, verificados uno por uno**, que conviene dejar escritos
para que el próximo barrido no los vuelva a levantar: los dos radios `sr-only`
de `AudienceSwitch` (el anillo lo dibuja un hermano con `peer-focus-visible`),
el honeypot de `WaitlistForm` (`tabindex="-1"` en una caja de 0 × 0) y el input
espejo de `ReferralCode`, que existe para `execCommand('copy')`. Y un cuarto: el
link dentro de un `<details>` cerrado aparece en la lista estática de enfocables
porque el navegador le conserva la caja, pero **no recibe foco** — comprobado
tabulando de verdad desde el último `summary`, que salta directo a `#cierre`.

### Lo que la pasada NO puede afirmar, y hay que decirlo

**El barrido de contraste no ve los degradés.** Compone el fondo real subiendo
por los ancestros, y los cuatro degradés del sitio —`lavado`, `fade-y`,
`destello` y `calor`— viven a propósito en capas **hermanas**, detrás del
contenido. O sea que el barrido mide el texto contra la superficie plana de
abajo y el degradé no entra en la cuenta. No es un agujero nuevo: cada uno de
los cuatro está medido aparte, sobre el píxel finalmente pintado, en la §3 ter,
la §3 sexies y la §3 undecies, y de esas mediciones salieron las reglas de
colocación que hoy viven junto a los tokens. Lo que hay que saber es que **el
barrido no las reemplaza**.

### `prefers-reduced-motion`: cumple de más, no de menos

El contrato pide que *"deje todo en fundidos"*. Lo que el sitio hace es más
fuerte: el bloque global de `globals.css` lleva toda animación y toda transición
a 0,01 ms, o sea **corte seco**, y la utilidad `reveal` cuelga entera de
`no-preference`, así que con *Reducir movimiento* no hace nada — ni siquiera su
estado inicial—. Verificado leyendo el CSS, que acá es determinista: no hay un
solo elemento cuyo estado visible dependa de que una animación corra.

O sea que nada queda invisible y nada se mueve, que es lo que la regla protege.
Pero **la letra no se cumple**: un fundido es una transición de opacidad, y el
bloque global también la mata, así que los hovers de color cortan en vez de
fundirse. Cambiarlo es tocar la regla global de todo el sitio, no una sección, y
tiene un caso concreto asociado que lo hace una decisión y no un ajuste: queda
en `PENDIENTES.md`.

### Lo que se decidió NO hacer

- **Cambiar el bloque global de `prefers-reduced-motion`.** Es lo de arriba: una
  decisión de todo el sitio, con un caso testigo que hay que resolver junto con
  ella. No se arregla de costado en la pasada de verificación.
- **Tocar `lib/emails.ts`.** Su `#333` es real, pero un correo se verifica en
  clientes de correo.
- **Cambiar la banda 5 | 6 del hero** para que los dos CTA entraran a 1024. La
  §3 terdecies eligió esa asimetría a propósito —*"el hero es una voz hablándole
  a dos personas"*— y el `flex-wrap` resuelve los 36 px sin tocarla.

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
