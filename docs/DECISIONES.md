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
