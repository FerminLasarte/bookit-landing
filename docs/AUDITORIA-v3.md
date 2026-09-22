# Auditoría — estado de la landing antes del rediseño v3

Fase A del [contrato de rediseño](REDISENO.md). Sin código: acá sólo se mide qué
hay. Medido el 21/9/2026 sobre `main` (f120b87), en `next dev`, a 1440×900 y a
375×812, en los dos temas.

## Veredicto en una línea

El sitio está **bien construido y mal compuesto**. La calidad de ejecución es
alta —accesibilidad pensada, contrastes medidos, comentarios que explican cada
decisión— y la variedad compositiva es baja: seis secciones que abren igual y se
resuelven casi igual. El rediseño es un problema de **varianza**, no de
movimiento ni de densidad.

## Lectura de dials

Los tres dials del contrato son `7 / 3 / 3`. Lo que hay hoy:

| Sección | VARIANCE | MOTION | DENSITY | Composición |
|---|---|---|---|---|
| Hero | 3 | 1 | 3 | Texto en `col-span-8`, las otras 4 columnas vacías |
| `#como-funciona` | 5 | 5 | 4 | Título izq. + teléfono der., tres celdas explícitas |
| `#publico` | 4 | 2 | 5 | Título izq. + card partida 50/50 |
| `#puntos` (Rewards) | 4 | 3 | 4 | Título centrado + dos columnas |
| `#faq` | 5 | 1 | 4 | Título `col-4` + acordeón `col-7` |
| `#cierre` | 3 | 1 | 2 | Título centrado + dos columnas |
| **Promedio** | **4** | **2,2** | **3,8** | |

**Consecuencia directa:** `MOTION` ya está en el objetivo (2,2 contra 3) y
`DENSITY` también (3,8 contra 3, con `#publico` como único pico). El único dial
que falta recorrer es `VARIANCE`: de 4 a 7. Todo el presupuesto del rediseño va
a composición. No hace falta animar más nada — y el contrato ya lo prohíbe.

**La repetición, en números:** 5 de 6 secciones abren con `Eyebrow` +
`text-display-lg`, al mismo tamaño y en la misma posición. 4 de 6 resuelven el
cuerpo con una partición en dos columnas. La página tiene **una** composición,
usada seis veces.

## Defectos confirmados

Ordenados por gravedad. Los números son medidos, no estimados.

### D1 · El nav se vuelve ilegible al salir de cada lienzo · **crítico**

[`Nav.tsx:74`](../components/Nav.tsx:74) decide vestir de oscuro con
`overDark = encimaDeLienzo`, y `encimaDeLienzo` es verdadero si **algún**
`[data-canvas]` toca la banda de 72 px del header. Cuando el lienzo cubre sólo
la franja de arriba de esa banda, el header queda transparente y su contenido
claro cae sobre la página clara.

Reproducido en modo claro, con el fondo del lienzo a 30–44 px del tope:

| Elemento | Composición | Contraste | Pide |
|---|---|---|---|
| Links del nav | `bone-300` sobre `cream-50` | **1,61:1** | 4,5:1 |
| Trazos del lockup | `bone-100` sobre `cream-50` | **1,25:1** | 3:1 |
| CTA del nav (`glass`) | blanco sobre `white/10` en `cream-50` | **1,03:1** | 4,5:1 |

No es un parpadeo de transición: `headerBg` da `rgba(0,0,0,0)` estable y el
`linkColor` es `rgb(217,198,180)`. Ocurre al salir de los **tres** lienzos
—hero, `#puntos` y `#cierre`— porque el predicado es el mismo, y el `fade-y` de
6 rem de `#puntos` ensancha la ventana: el fondo ya es papel antes de que el
rectángulo del lienzo deje la banda. En móvil es donde más se nota: la palabra
"Bookit" desaparece y queda sólo el corchete naranja.

En modo oscuro no se ve, porque la página ya es oscura. Es un defecto de claro.

### D2 · El eyebrow de `#publico` no pasa AA · **alto**

`amber-700` (`#9D6515`) a 15 px sobre `cream-100` (`#F1F3F5`) da **4,38:1**;
texto chico pide 4,5:1. Verificado en el DOM: `color: rgb(157,101,21)`,
`font-size: 15px`. En desktop el eyebrow cae después del `fade-y` de 6 rem, así
que el fondo es tinte pleno. Afecta también a las dos secciones `tone="tint"` de
[`/lista-espera`](../app/lista-espera/page.tsx).

Es exactamente el caso que el manual anticipa: `cream-100` es DERIVADO, y su
contraste se anotó contra la página, no contra el texto de acento que iba a
caerle encima.

### D3 · Sombra y borde juntos · **alto**

El manual dice "sombra o borde, nunca los dos". Hay cuatro superficies con
`border-ink-900/8` **y** `shadow-[0_1px_0_rgba(0,0,0,0.03)]`:
[`WaitlistForm.tsx:191`](../components/WaitlistForm.tsx:191) y
[`:213`](../components/WaitlistForm.tsx:213),
[`invite/page.tsx:92`](../app/invite/[[...slug]]/page.tsx:92),
[`lista-espera/page.tsx:171`](../app/lista-espera/page.tsx:171). Las cuatro son
superficies de conversión.

### D4 · Diez opacidades de borde donde el manual fija una · **medio**

El manual fija 10 %. Repartición real de los 57 bordes del sitio:

| Opacidad | Usos | | Opacidad | Usos |
|---|---|---|---|---|
| `/8` | 26 | | `/10` | 11 |
| `/12` | 13 | | `/25` | 4 |
| `/20` | 2 | | `/15` | 1 |

Sólo 11 de 57 están en el valor canónico. La *deuda conocida* del manual ya lo
anota, sin el tamaño.

### D5 · Nueve radios donde el manual da cuatro · **medio**

`rounded-sm` es el radio **más usado del sitio** (16 veces) y no existe en el
manual: es el 2 px por default de Tailwind, puesto para darle forma al anillo de
foco sobre links de texto. Además hay `rounded-[2.5rem]` (el marco del teléfono,
2 usos) y `rounded-[1.75rem]`. Los legítimos son `pill`, `field`, `card` y
`rounded-full` cuando es un círculo, no una esquina.

Pide una decisión, no un reemplazo: un radio de 12 px alrededor de un link en
línea se ve mal. Probablemente haya que declarar un quinto radio para el foco
sobre texto, o darle otra forma al anillo.

### D6 · Los reveals corren a 700 ms contra un token de 560 · **medio**

`--duration-reveal` vale `560ms` y el manual fija 560 ms para "contenido que
aparece". [`Reveal.tsx`](../components/Reveal.tsx) usa `duration: 0.7`, y su
propio docstring dice 700 ms citando el manual. El token no lo lee nadie.

### D7 · `Rewards` reimplementa `Reveal` cuatro veces · **medio**

[`Rewards.tsx`](../components/Rewards.tsx) repite `initial / whileInView /
viewport / transition` inline en cuatro bloques en vez de usar
[`Reveal`](../components/Reveal.tsx), con los mismos valores y el mismo 0,7.
Es la misma primitiva escrita dos veces: cuando se corrija D6, esta sección no
se va a enterar.

### D8 · La escala de display se inventa en el componente · **medio**

`Rewards` define `text-[clamp(4.5rem,11vw,8.5rem)]` para la cifra y
`text-[clamp(1.75rem,3vw,2.5rem)]` para su h3; `Audiences` y `HowItWorks` usan
`md:text-[1.75rem]`. El `@theme` tiene cuatro pasos (`display-xl`, `display-lg`,
`h3`, `body`) y el dialecto cartel necesita más arriba y más abajo — pero como
tokens, no como `clamp()` suelto por componente. Hoy el sitio tiene una escala
tipográfica de facto que no está escrita en ningún lado.

### D9 · La sección que avanza sola · **a decidir**

[`HowItWorks`](../components/HowItWorks.tsx) rota de paso cada 5,2 s. Está
resuelto con cuidado —pausa con el puntero encima, pausa fuera de vista, se
frena al tomar control, `tablist` real, respeta `prefers-reduced-motion`— pero
sigue siendo contenido que se mueve solo, y el manual dice "nada gira
esperando". No lo llamo defecto porque la ejecución cubre WCAG 2.2.2; lo llamo
decisión pendiente del contrato.

### D10 · El final de la página es un solo bloque oscuro · **medio**

`#cierre` es `marca-profunda` (`#140E03`) y el footer es `ink-950` (`#151311`):
**1,03:1** entre los dos. En los dos temas, las últimas dos pantallas son un
bloque continuo separado sólo por el `Hairline` del footer al 8 %. La
composición más importante de la página —donde se decide— no tiene borde.

### D11 · Dos variantes de botón para la misma acción, lado a lado · **medio**

En [`Audiences`](../components/Audiences.tsx) la mitad clara cierra con
`variant="ink"` y la oscura con `variant="glass"`. Las dos mitades están
diseñadas para pesar lo mismo —el `mt-auto` las apoya en la misma línea— y sus
CTA no pesan lo mismo. En oscuro `ink` se vuelve una píldora hueso llena y
`glass` un vidrio translúcido: la comparación que es el punto de la sección
queda desmentida por los botones.

## Inventario de bloques

**Trabajan.** El hero (la promesa en tres líneas y el CTA). La card partida de
`#publico`: es la única pieza con una idea estructural propia —un objeto, dos
mitades, el borde exterior sin cortar— y es lo mejor compuesto del sitio. El
teléfono de `#como-funciona`, que es lo único que muestra el producto. El
acordeón de `#faq`, nativo y sin JS.

**Relleno o de más.** Las tres líneas de "01 · 02 · 03" dentro de la columna de
Puntos en `Rewards` repiten lo que los tres pasos de `#como-funciona` ya
contaron. Los dos párrafos de `text-xs` al final de la columna de Referidos son
letra chica acumulada. El `#cierre` repite la promesa del hero con otras
palabras y con los dos mismos CTA.

**El hueco grande: no hay una sola imagen.** Cero usos de `next/image`, y
`public/` tiene sólo archivos de marca. Todo el sitio es tipografía, CSS e SVG
en línea. Para el dialecto cartel esto es la palanca más grande que queda sin
usar, y para un producto de servicios locales en Tandil también es un asunto de
confianza: la página habla de barberías y peluquerías y no muestra ninguna.

## Lo que se preserva

- La IA completa: slugs, anclas (`#como-funciona`, `#publico`, `#clientes`,
  `#locales`, `#puntos`, `#referidos`, `#faq`, `#cierre`), labels del nav.
- Toda la copy y su voz. El repo tiene decisiones de redacción documentadas y
  fechadas (por ejemplo, "sin cupos limitados", confirmado el 21/9/2026).
- El trabajo de accesibilidad ya hecho: el `tablist` con foco itinerante, el
  focus trap del menú, el skip link, `scroll-mt` en los destinos de ancla, el
  `overflow-wrap` del mail en el footer, los `aria-labelledby` de sección.
- La decisión de que `marcaProfunda` no cambia con el tema.
- Los `#hex` de `app/og/` y `opengraph-image.tsx`: son imágenes renderizadas por
  `ImageResponse`, que no ve el `@theme`. Es una excepción inherente, no deuda.
  Conviene anotarlo para que nadie los "arregle".

## Línea base

- **Assets:** 0 imágenes, 0 `next/image`. Sin LCP de imagen: el LCP es el `h1`.
- **h1:** uno por página. Los dos de `/descargar` están en ramas excluyentes de
  un flag; no es un defecto.
- **SEO:** `sitemap.ts`, `robots.ts`, `manifest.ts` y OG por ruta ya existen;
  `canonical` declarado en la home. Nada de esto se toca.
- **Consola:** sin errores ni warnings en la home, en los dos temas.
- **Deuda del manual que quedó desactualizada:** su *Deuda conocida* nombra
  `HeroGlow`, que ya no existe, y habla de tres `rgba()` sueltos: quedan en
  [`Audiences.tsx:109`](../components/Audiences.tsx:109),
  [`Rewards.tsx:101`](../components/Rewards.tsx:101) y
  [`:149`](../components/Rewards.tsx:149),
  [`page.tsx:70`](../app/page.tsx:70) y dentro de
  [`AnimatedButton`](../components/AnimatedButton.tsx) (dos gradientes de capa).

## Contraste con la app · lo que dicen las 15 capturas

Medido pixel a pixel sobre `Capturas Web/{claro,oscuro}` (app real, los dos
temas). Importa porque el manual pone a la app arriba de todo: *"Si el manual y
la app no coinciden, gana la app y se corrige el manual."*

### El hallazgo de marca: en claro, la web no tiene una sola superficie cálida

| | App (medido) | Web (token) |
|---|---|---|
| Superficie clara base | `#FBFCFD` / `#FAFBFC` | `cream-50` `#FBFCFD` — **coinciden** |
| Encabezados en claro | Lavado ámbar `#EFE1CD` → `#F0E1CB` sobre esa base | No existe |
| Encabezados en oscuro | Lavado ámbar `#453015` detrás del título | No existe |
| Base oscura | `#24211E` (= `ink-800`) | `ink-950` `#151311`, un escalón más oscuro |

La base clara coincide exactamente. Lo que la web no tiene es el **dispositivo**:
la app apoya un degradé ámbar terroso detrás de cada encabezado, en los dos
temas, y eso es lo que le da el "cara, sin ser cara" del manual. El manual no lo
documenta y la web no lo tiene.

Y los tokens claros de la web, pese a llamarse `cream`, son **fríos**: `cream-50`
`#FBFCFD` tiene R−B = −2 y `cream-100` `#F1F3F5` tiene R−B = −4. Los oscuros sí
son cálidos (`marca-profunda` R−B = +17). O sea: en modo oscuro la web es Bookit
y en modo claro es un sitio gris con acentos ámbar. El lavado de la app es
exactamente lo que falta, y ya está probado en producto.

### La regla del ámbar que el manual no escribió

| Uso | App (medido) | Manual |
|---|---|---|
| Ámbar a tamaño display sobre claro | `#D78A1D` — el titular de `09_bienvenida` | Prohibido sin matices |
| Ámbar a tamaño texto sobre claro | `#9D6515` (= `marcaTexto`) — `01_cliente_inicio` | Igual: coinciden |

En las dos pantallas donde el ámbar aparece sobre claro, la app reserva
`primary` para el **display** y baja a `marcaTexto` en cuanto el tamaño es de
lectura. Con dos capturas no alcanza para declararlo ley del producto, pero el
patrón es claro y el manual lo enuncia como prohibición plana — y por eso la web
no tiene ningún acento cálido grande en ningún lado.

**Pero no hay que importarla tal cual.** `#D78A1D` sobre `#FBFCFD` da **2,71:1**,
y texto grande pide 3:1: la app no llega. Aplicar la jerarquía de autoridad al
pie de la letra acá importaría una falla de contraste a la web. La salida es la
de arriba: el calor entra por **superficie**, no por texto.

### Un color que no está en la lista cerrada

`10_comercio_agenda_dia` usa `#3B82F6` para el estado "Confirmado". El manual
declara la lista de excepciones **cerrada** y no lo incluye; su *Divergencia 5*
dice que los estados de turno no están tokenizados porque la landing no los
muestra. Deja de ser cierto en cuanto la landing muestre una captura de agenda:
ese azul va a aparecer en la página. Hay que tokenizarlo o recortarlo del encuadre.

### Divergencias menores, para el manual y no para la web

Salen de las capturas y contradicen reglas del manual. Como gana la app, van
como correcciones al manual, no a la landing:

- **Mayúsculas sostenidas.** `MAÑANA`, `TARDE`, `10:30 · BARBERÍA NOGAL`. El
  manual dice "sin mayúsculas sostenidas".
- **Píldoras con sombra.** Las píldoras de horario de `04_cliente_elegir_horario`
  llevan sombra suave. El manual: "Los campos y las píldoras no llevan sombra
  nunca."
- **Chip con relleno de marca dentro de una lista.** El "5 km" de
  `01_cliente_inicio` es exactamente el patrón que el manual prohíbe.

## Las dos preguntas abiertas, resueltas

### Imágenes: sí, y ya existen

Las capturas son el material que faltaba. Las tres que más trabajo hacen:

| Captura | Dónde va | Por qué |
|---|---|---|
| `04_cliente_elegir_horario` | Hero o `#como-funciona` | Es **la** promesa del producto hecha imagen: la grilla de horarios. Nada de lo que dice la página lo muestra hoy |
| `15_comercio_crecimiento` | `#publico`, mitad local | La mitad de los locales no tiene un solo visual, y ésta es su mejor prueba: turnos por mes, mejor mes, más vendido |
| `01_cliente_inicio` | `#publico`, mitad cliente | Trae fotografía real de locales, que es lo que hoy no aparece en ninguna parte del sitio |

Reservas: `09_bienvenida` repite el titular de la home con otras palabras ("Tu
próximo turno sin llamar a nadie" contra "Tu próximo turno, a un clic de
distancia") — puede confundir si van cerca. Y cualquier captura de agenda arrastra
el `#3B82F6` sin tokenizar.

### El carrusel: se saca

Confirmado con el usuario el 22/9/2026. No se saca por la animación —su
ejecución cubre WCAG 2.2.2— sino porque las capturas le quitan la razón de ser:

1. El `Device` de [`HowItWorks`](../components/HowItWorks.tsx) es una app
   dibujada a mano en HTML, con locales inventados, y lleva un descargo propio
   ("Pantallas de ejemplo. Los locales que aparecen son ilustrativos"). Con
   capturas reales el descargo desaparece y con él el problema de credibilidad
   que el descargo intentaba tapar.
2. Son ~500 líneas que replican la app en HTML y se desincronizan en cada
   release del producto.
3. El avance automático es lo único que obliga al mecanismo de tabs. Sin él, los
   tres pasos son tres pares de texto e imagen, estáticos.

**Se saca en la Fase C**, al recomponer `#como-funciona`, porque sacar el
teléfono falso y poner las capturas reales es el mismo cambio. Sacarlo antes
dejaría la sección sin su único visual.

## Qué cambia en el plan

1. **La Fase B se acorta.** D6, D7, D11 y la mitad de D4/D5 son trabajo de
   primitivas y ya están localizados. El botón sigue siendo el primer paso,
   ahora con una tarea concreta: resolver D11 y las cuatro variantes.
2. **D1 se adelanta.** Es un defecto de contraste en el nav, en modo claro, en
   la home. No espera al rediseño: entra en la Fase B con las primitivas.
3. **Aparece un paso B0: la escala tipográfica.** D8 dice que el dialecto cartel
   necesita tokens de display que hoy no existen. Sin eso, la Fase C va a seguir
   escribiendo `clamp()` por componente. Va antes del botón.
4. **La Fase B gana un token de superficie cálida.** El lavado ámbar de los
   encabezados de la app, que la web no tiene en ningún lado. Es lo que corrige
   el desbalance de que el modo oscuro se lea como Bookit y el claro no. Va con
   B0, porque es del mismo orden: vocabulario que la Fase C necesita y no existe.
5. **La Fase C arranca con imágenes.** Las capturas dejan de hacer de la
   composición un ejercicio puramente tipográfico, y `#como-funciona` pasa a ser
   la primera sección a recomponer, no la segunda: es la que cambia más.
6. **Queda trabajo para el manual, no para la web.** El azul `#3B82F6` sin
   tokenizar, la regla real del ámbar (display contra texto), las mayúsculas
   sostenidas, las píldoras con sombra y el chip de marca en lista. Son cinco
   correcciones al manual v1, y una de ellas —el ámbar a 2,71:1— es un defecto de
   accesibilidad de la app que conviene arreglar allá antes de que se copie acá.
