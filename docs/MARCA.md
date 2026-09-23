# Marca Bookit — normativa para la web

Traducción del **Manual de marca Bookit v1 (septiembre 2026)** a las decisiones
que gobiernan esta landing. Los **valores** viven en el bloque `@theme` de
[`app/globals.css`](../app/globals.css); acá va lo que no es un valor.

> **Jerarquía de autoridad.** El manual sale del código de la app Flutter
> (`docs/design.md`, `lib/core/theme/`, `size_config.dart`). Si el manual y la
> app no coinciden, gana la app y se corrige el manual. Si el manual y esta web
> no coinciden, gana el manual y se corrige la web — salvo lo listado en
> *Divergencias declaradas*, que son decisiones tomadas a propósito.

## Cómo leer los tokens

Cada token de `globals.css` está marcado:

- **CANÓNICO** — está en el manual. No se edita acá. Se corrige el manual
  primero y después este archivo.
- **DERIVADO** — la web lo necesita y el manual no lo cubre, porque el manual
  está escrito para una app de teléfono. Ajustable con criterio, dejando
  anotado el contraste.

Regla de contraste del manual (§3): se mide contra el fondo **real**, no contra
blanco por costumbre. 4,5:1 texto · 3:1 texto grande, íconos y bordes.

## Los tres rasgos

- **Cercana, no informal.** Voseo rioplatense, sin chistes ni emojis. El que
  está del otro lado está trabajando.
- **Cara, sin ser cara.** El ámbar terroso, el aire y la Plus Jakarta son la
  promesa de que la app de un comercio chico puede verse como la de una cadena.
- **Callada hasta que importa.** El color de marca aparece en el CTA, en lo
  elegido y en lo urgente. En una pantalla bien resuelta hay muy poco naranja.

## Logo

El isotipo es un corchete que se cierra sobre un check: lo que se abre, se
agenda y se cumple.

**Archivos.** `public/brand/logo_bookit_completo.svg` (lockup) y
`logo_bookit_isotipo.svg`. Los trazos en tinta salen en `currentColor` y el
naranja de `--logo-naranja`. En React se usa siempre
[`components/Wordmark.tsx`](../components/Wordmark.tsx), nunca un `<img>` al
SVG: un `<img>` no hereda el color y rompe el modo oscuro.

**Los huecos de la `B` y de las dos `o` van calados, no tapados.** Son subpaths
del mismo path compuesto, así que el `fill-rule` por defecto ya los abre.
Existía un token `--logo-hueco` que los pintaba del color del fondo y había que
setearlo a mano en cada sitio de uso; se eliminó el 22/9/2026. Era una trampa:
el logo sólo quedaba bien sobre exactamente `cream-50` o `ink-950`, y sobre un
lienzo, un degradé o una captura los tapones se veían de otro color que el
fondo. Calado, el logo deja de depender de lo que tenga detrás.

**La palabra se redibujó el 22/9/2026.** El maestro pasó a tener los contornos
creados, y con eso el lockup cambió de dibujo: las dos `o` eran círculos
geométricos y el punto de la `i` un círculo sobre un rectángulo redondeado, y
ahora son contornos tipográficos. **El isotipo no cambió**: sus siete paths son
los mismos, verificado uno por uno. El `viewBox` tampoco, así que la proporción
del lockup y el mínimo de 96 × 28 px siguen valiendo.

**El lockup se recompuso el mismo 22/9/2026, más tarde.** Dentro del lockup el
isotipo quedó al 82 % de su tamaño anterior (0,8175, medido en los trazos) y la
palabra se corrió 3,7 unidades a la derecha. El dibujo del isotipo no cambió, y
el isotipo suelto (favicon, ícono, `logo_bookit_isotipo.svg`) tampoco. El
`viewBox` es el mismo, así que el mínimo de 96 × 28 px sigue valiendo.

**Al sincronizar desde el maestro hay que corregir dos cosas**, porque
Illustrator las vuelve a escribir en cada export:

1. **La tinta va en `currentColor`.** El export la deja sin `fill`, o sea negra
   fija, y así el lockup es invisible sobre `marca-profunda`.
2. **El naranja va en `--logo-naranja`.** El export escribe `#FD8003`; el
   canónico es `#FD7D03`.

**Los dos naranjas.** No es una inconsistencia:

| | Hex | Dónde |
|---|---|---|
| Naranja del logo | `#FD7D03` | Sólo logo, ícono de app y splash |
| Ámbar de interfaz | `#D78A1D` | Toda la interfaz |

El saturado no aguanta como relleno de un botón. En la web el `#FD7D03` entra
únicamente por los SVG de marca.

**Cuál va.** Lockup cuando hay ancho y la marca se presenta. Isotipo cuando el
espacio es cuadrado o la marca ya se presentó: favicon, avatar, sello.

**Resguardo y mínimos.** Alrededor del logo queda libre como mínimo la altura de
una anilla del isotipo — es una medida que está dentro del dibujo, así que
escala sola. El isotipo no baja de 24 px; el lockup no baja de 96 px de ancho
(`Wordmark` lo fuerza con `min-h-7`: 28 px de alto son 96 px de ancho).

**Tamaño en el nav: 32 px de alto** (unos 110 px de ancho). Se eligió mirándolo
en la píldora de 64 px: a 28 px, con el isotipo recompuesto más chico, la marca
quedaba por debajo de la etiqueta y el CTA. A 32 px la palabra tiene más o
menos el doble de alto de mayúscula que los links del nav.

**Lo que no se le hace.** No se recolorea fuera de las cuatro versiones. No se
estira, inclina, ni se le agrega sombra, contorno o degradado. No se separa el
check del corchete. No va sobre una foto sin una capa que garantice contraste.
No se encierra en un círculo ni en un cuadrado con borde. **No se reescribe
"Bookit" con otra tipografía: la palabra del lockup es dibujo, no texto.**

**En prosa se escribe `Bookit`,** con una sola mayúscula, cuando el nombre
aparece dentro de una frase y no como marca. El manual v1 dice `BooKit`: es un
error del manual y hay que corregirlo ahí.

## Color

El ámbar `#D78A1D` es el mismo hex en claro y en oscuro: la marca no cambia de
color con el tema, y es lo único con saturación en una pantalla que por lo demás
es papel y tinta.

`primary` sobre superficie clara da **2,71:1** sobre `cream-50` y **2,78:1**
sobre `paper`. No llega al 3:1 de un borde ni al 4,5:1 de un texto chico. Por
eso existe `marcaTexto` (`#9D6515`, **4,75:1** sobre `cream-50`): el mismo tono
con la luminosidad bajada, para cuando el color tiene que *leerse*. Sobre
`cream-100` ese mismo tono da 4,38:1 y no pasa; sobre el lavado cálido da 3,56:1
y no hay ámbar que pase. Era el D2 de la auditoría, y la salida no fue de color:
`marcaTexto` dejó de usarse para rótulos y quedó para links y texto de acento
sobre la página, que es donde su 4,75:1 alcanza. A tamaño grande, donde el
umbral baja a 3:1, sí entra en la banda. Ver *Espacio y forma*.
Sobre fondo oscuro no hace falta — ahí el ámbar pasa con **6,66:1**.

Con la tinta **encima** del ámbar, en cambio, da **5,27:1**, y es lo que
habilita el botón de acción. Los cuatro números de este párrafo se remidieron el
22/9/2026 contra los valores WCAG publicados; los anteriores (2,64 · 4,9 · 6,3 y
un 6,66 transpuesto en `archivo/DECISIONES.md` §1.1) estaban mal. Ver la tabla de
*Los números de contraste, remedidos* en `archivo/DECISIONES.md`.

**Reglas:**

- Nunca un hex suelto en un componente. Si hace falta un color que no existe, se
  discute; no se inventa en el archivo donde hizo falta.
- El color nunca es el único portador de un dato.
- Claro y oscuro siempre, los dos diseñados. El oscuro no es el claro invertido.
- La lista de excepciones (`alerta`, `exito`, `marcaTexto`, `marcaProfunda`, los
  cuatro niveles) **está cerrada**. Agregar una exige documentarla acá en el
  mismo cambio.

## Tipografía

**Plus Jakarta Sans, una sola familia para todo.** Pesos 400 · 500 · 600 · 700 ·
800. Va por `next/font`, que la self-hostea en el build: no hay request a Google
en runtime.

`--font-display` y `--font-sans` apuntan a la misma familia a propósito. El
nombre display se conserva porque lo usan los componentes, no porque haya dos
tipografías.

- De `h3` para arriba, los títulos van en 700 con tracking negativo. Es lo que
  hace que un título se lea como título y no como texto en negrita.
- La bajada va en `ink-500` (`onSurfaceVariant`), salvo sobre una banda con
  tinte en claro, donde no llega: ver *Espacio y forma*.
- **El rótulo de un bloque va en tinta, no en el color de marca.** Es texto
  chico, y el texto chico de acento pasa sólo sobre la página pelada: falló en
  cuatro superficies distintas antes de que se contaran juntas. La jerarquía la
  hace la escala. `archivo/DECISIONES.md` §3 octies.
- En texto chico el tracking vuelve a 0: apretar una letra chica la vuelve
  ilegible.
- El título y su bajada van pegados porque son una unidad. El cuerpo largo
  respira en 1,55.
- **Truncar esconde.** Ningún dato existe sólo truncado.

## Espacio y forma

**La proporción, no el número.** El hueco entre dos grupos es por lo menos el
doble del hueco que hay dentro de uno. Un grupo se lee por su aire, no por su
borde.

De ahí sale **qué es card y qué no** en la web, desde el diseño v4
(`DISENO.md`). Hay dos:

- **El tile**, que muestra: un fondo plano de la paleta con una captura de la
  app adentro, y el título y la bajada *debajo*, sobre la página. No lleva texto
  chico adentro, así que su fondo no tiene que sostener contraste.
- **La superficie**, que se toma: un formulario, un código para copiar. Es
  `surface` con borde.

Lo que sólo se lee se agrupa por aire. **No hay bandas de color entre
secciones**: el límite de una sección es el aire que la separa de la siguiente.

**Radios — cuatro y una fórmula.** Campos 12 · toasts 16 · cards 24 · píldoras
50. Al anidar, `radio exterior = radio interior + padding`. Sin eso las esquinas
no son concéntricas y la card se ve hecha a mano.

**El anillo de foco sobre un link de texto es una píldora.** Toma la forma del
elemento, así que el radio del elemento es el radio del anillo, y durante un
tiempo eso se resolvió con el 2px por default de Tailwind — que llegó a ser el
radio más usado del sitio sin existir en el manual. Es una píldora y no hace
falta un quinto radio.

**Y va en `marcaTexto`, no en el ámbar de interfaz.** Es el mismo razonamiento
que el de *Color*: el anillo tiene que leerse, y `primary` sobre las superficies
claras da 2,71 y 2,78:1, por debajo de los 3:1 que WCAG le pide a un indicador
de foco. `marcaTexto` pasa sobre las cinco superficies que el sitio tiene debajo
de algo enfocable, con 3,28:1 en el peor caso. **El mismo valor en los dos
temas**, y eso no contradice la línea de *Color* que dice que sobre oscuro el
ámbar pasa solo: la contradice el sitio, donde dos de esas cinco superficies
—el lienzo y el footer— son oscuras también en el tema claro, así que un anillo
no puede elegir su color por tema. Los 2 px de hueco que lo despegan del
elemento van del color de la superficie, que se declara y no se adivina.
`archivo/DECISIONES.md` §3 duodevicies.

**Sombra o borde. Nunca los dos.** Una acción secundaria lleva borde de 1 px de
`ink-900` al 10 %. Los campos y las píldoras no llevan sombra nunca. Lo que lleva
sombra está listado en la *Divergencia 7*.

El 10 % vale para un borde que **acompaña** a un relleno. Un borde que tiene que
sostener solo un control necesita 3:1 y no llega ni cerca: ver la *Divergencia
6*, que es por qué el botón secundario de la web es una píldora llena.

## Movimiento

Corto y físico. Nada rebota de más, nada gira esperando. Todo interrumpible y
todo respeta *Reducir movimiento*, donde las animaciones quedan en fundidos.

| Momento | Duración | Curva |
|---|---|---|
| Algo chico cambia | 180 ms | `easeOutCubic` |
| Algo entra o sale | 300 ms | `easeOutCubic` |
| Cambio de tab | 220 ms | Fundido que sube 6 px |
| Contenido que aparece | 560 ms | Sube 16 px, escalonado |

**Tap.** Si el elemento tiene superficie se hunde a `scale(0.97)`; si no la
tiene, se apaga a `0.4`. Nunca un ripple.

**Cargar sin ruedita.** Nunca un spinner genérico: esqueleto de la forma final,
y si tarda menos de 400 ms no se dibuja nada para no hacer un parpadeo gris.

## Voz y tono

Voseo rioplatense, frases cortas, sin jerga. El imperativo lleva tilde:
*Reservá*, *Elegí*, *Confirmá*. Nunca "Reserva", "Elige", "Para ti".

| Regla | Así | Así no |
|---|---|---|
| Voseo | Ingresá tu email | Ingresa tu email |
| Label de campo: sustantivo | Email | ¿Cuál es tu email? |
| Destructivo: dice la acción | Eliminar | Aceptar |
| El error dice qué pasó | Ese horario se ocupó recién. | Error inesperado |
| Sin jerga | No pudimos cobrar la suscripción. | Falló el débito (código 4051) |

**Un vacío por causa.** Nunca "No hay nada para mostrar": cada vacío dice qué
pasó y sugiere una salida.

**Un error por campo.** El mismo criterio vale para un formulario: el mensaje va
pegado al campo que falló y dice qué le pasa a *ese* campo. Un único aviso al
pie —"Revisá los campos marcados"— es el *Error inesperado* de la tabla de
arriba, deja al color como único portador del dato y, para quien usa un lector
de pantalla, no dice nada: `aria-invalid` sin `aria-describedby` anuncia que
algo está mal y no qué. Es WCAG 3.3.1 y son dos reglas de este manual. Lo
garantiza la primitiva [`Field`](../components/Field.tsx), que no deja declarar
un campo sin su mensaje.

**El emoji de la pantalla de éxito es la única excepción**, y es de fondo: el
🎉 de "¡Adentro!" es un mensaje de celebración, no iconografía de interfaz.
Está decidido en el brief (§6.2) y el código lo dice desde siempre —
[`Footer.tsx`](../components/Footer.tsx) llegó a citar "la única excepción que
registra `MARCA.md`"—, sólo que acá nunca se había escrito. Queda escrito: es
ese emoji, en esa pantalla y en el correo que la acompaña, y ninguno más.

**Lo que la marca no dice.** Sin emojis en la interfaz. Sin "¡Ups!" ni
disculpas de más. No llama "usuario" al usuario ni "ítem" a un turno. No promete
lo que no controla. No grita: sin mayúsculas sostenidas ni signos repetidos.

## Piezas fuera de la app

La base es la misma: fondo `marcaProfunda` (`#140E03`) o blanco, el lockup con
su resguardo, una sola frase en 800 con tracking negativo, y el ámbar reservado
para **una única cosa por pieza**. Si una pieza necesita dos acentos, son dos
piezas.

## Lo que no se hace

Cada uno de estos ya rompió la consistencia en algún lado:

- Una segunda card o un segundo botón "parecido" al que ya existe.
- Un hex suelto en un componente.
- `primary` como texto sobre fondo claro.
- Sombra y borde juntos.
- Sombra en un campo o en una píldora.
- Chips con relleno de marca dentro de una lista.
- Cards de opción con borde naranja y tilde. Lo elegido se marca con tinta: el
  borde ámbar sobre un relleno claro da 2,59:1 y no llega a los 3:1 que pide la
  señal visual de un estado.
- El rótulo de un bloque en ámbar. Llegó a haber catorce, uno abriendo cada
  sección: un acento que aparece catorce veces no es un acento.
- Una card puesta para levantar el contraste de lo que tiene adentro. El
  problema es de la superficie de abajo y se arregla ahí.
- Un valor de movimiento escrito en el componente. Los `--duration-*` y las
  curvas son los tokens; se leen como `var()`, no se copian.
- Wizards para juntar datos sueltos.

## Divergencias declaradas

Lo que esta web hace distinto del manual, a propósito:

1. **La escala tipográfica es `clamp()`, no fracción del ancho de pantalla.** El
   manual deriva cada paso del ancho del teléfono con tope en 450. En la web el
   rango de anchos es otro; se conserva el *tracking* del manual, no su fórmula.
2. **Existe `--font-mono`.** El manual manda una sola familia. Acá hay una pila
   mono de sistema, sin descarga, para lo que es literalmente un código que
   alguien copia: el código de referido.
3. **Hay tokens de acento que el manual no tiene** (`amber-300`, `amber-100`,
   `amber-50`, `cream-100`, `ink-850`). La app no los necesita; una landing con
   secciones sí. Van marcados DERIVADO. `ink-850` (`#1C1A17`) es el par oscuro
   de `cream-100`: el manual da tres oscuros y `Audiences` ya usa dos en las
   mitades de su card, así que sin una cuarta banda el modo oscuro se leía como
   un túnel continuo y los lienzos `marcaProfunda` dejaban de leerse como
   lienzos.
4. **El nombre se escribe `Bookit`, no `BooKit`.** El manual v1 §2 pide la K
   mayúscula en prosa. Es un error: la marca es `Bookit`. Pendiente corregirlo
   en el manual; hasta entonces manda esta línea.
5. **Los estados de turno no están tokenizados.** Son seis y son de producto; la
   landing no muestra turnos.
6. **El botón es una pieza web, no una derivación del de la app.** Decidido el
   22/9/2026, y es la única divergencia que se aparta de la *jerarquía de
   autoridad* de arriba en vez de completarla. El motivo es que el botón de la
   app no se puede importar: medido sobre las capturas, pone rótulo **blanco**
   sobre el ámbar, y eso da **2,78:1**. Es la misma composición que pedía el
   brief y que `archivo/DECISIONES.md` §1.1 ya había rechazado por accesibilidad, así
   que aplicar la jerarquía al pie de la letra importaría una falla conocida.
   De la app se conservan la paleta, el relleno plano —sin biselado, sin
   degradé, sin sombra, como está medido— y la sensación al apretar; la tinta y
   los estados se resolvieron acá. Es el mismo razonamiento que ya se aplicó al
   ámbar a tamaño display, donde la app da 2,71:1 y la web tampoco lo importó.

   Y **la acción secundaria es una píldora llena, no un contorno**, contra lo
   que dice *Espacio y forma* más arriba. Medido: si el borde fuera la única
   señal del control, necesitaría 3:1 para cumplir WCAG 1.4.11, o sea `ink-900`
   al **50 %** sobre claro y blanco al **34 %** sobre oscuro. Sería la línea más
   oscura de todo el sitio, cinco veces el 10 % que fija el manual. Llena, en
   cambio, separa 18,0:1 contra `cream-50` y 14,9:1 contra `marca-profunda`. El
   10 % del manual sigue valiendo para bordes que acompañan a un relleno; no
   para un borde que tiene que sostener solo un control.

   De paso, **el botón de la app conviene arreglarlo allá**: es la segunda falla
   de contraste medida en el producto, junto con el ámbar a tamaño display.
   Cambiar el rótulo a tinta lo lleva a 5,27:1 sin tocar el color de marca.

7. **Lleva sombra lo que flota o muestra, no lo que se toma.** Decidido el
   22/9/2026 con la referencia de `DISENO.md`. Hay dos sombras:
   `shadow-tile` (tiles y el marco de las capturas) y `shadow-float` (el nav y
   el toast, que flotan sobre la página). Las superficies que se toman
   —formulario, código— siguen con borde, por los números que dio la v3: en
   oscuro la sombra de una card sola da 1,064:1 contra la página y el borde
   1,357:1 (`archivo/DECISIONES.md`).

   El filete blanco de `shadow-tile` no es un borde: es un brillo interno que no
   separa nada de la página. El tile se separa por su relleno y su sombra, y no
   lleva texto adentro, así que ninguna de las dos tiene que pasar un contraste.

8. **La fórmula concéntrica vale en anidados apretados.** `radio exterior =
   radio interior + padding` no sobrevive al padding de la web: la card de
   `WaitlistForm` tiene 24 px de radio, 24–40 px de padding y campos de 12, y la
   fórmula pediría entre 36 y 52 px de radio exterior — más que la píldora. Con
   28–40 px de aire entre un borde y el otro las esquinas no se leen como
   concéntricas, se leen como dos formas sueltas. La regla es que vale mientras
   el hijo toque el padding.

   Su caso testigo es el marco de `Screen`: 24 px afuera, 8 de marco y 16
   adentro, con la fórmula exacta y dentro de los cuatro radios.

## Deuda conocida

- `public/brand/` conserva `icon.png`, `icon.jpeg`, `lockup.png` y
  `lockup.jpeg`, anteriores a los SVG. Hay que confirmar quién los consume
  (metadata, OG) antes de borrarlos.
- **El maestro sigue escribiendo el naranja equivocado.** Los contornos ya están
  creados —eso quedó resuelto el 22/9/2026— pero el export usa `#FD8003` y deja
  la tinta sin `fill`. Las dos correcciones están listadas arriba, en *Logo*, y
  hay que reaplicarlas cada vez que se sincronice. El camino que NO funcionó, y
  conviene no repetirlo: exportar la palabra como `<text>` en
  `Plus Jakarta Display`. Esa familia está instalada en la máquina de diseño
  pero no es la que sirve el sitio (`Plus Jakarta Sans`, por `next/font`), no
  existe en Google Fonts, y el `tspan` que separa "Book" de "it" está calculado
  para sus métricas exactas. Renderizado en un navegador daba una tipografía
  distinta en cada intento.
- ~~El `rgba()` suelto y los dos radios arbitrarios.~~ **Cerrados el 22/9/2026**,
  en la Fase C: eran los tres del teléfono dibujado a mano de `HowItWorks` y se
  fueron con él cuando entraron las capturas reales de la app. El sitio queda en
  cuatro radios más `rounded-full` —la lista de este manual— y sin un color
  fuera del `@theme` afuera de `app/og/`, que es la excepción inherente ya
  declarada. Los otros `rgba()` habían salido antes a las utilidades `destello`
  y `calor`, con el mismo criterio que `lavado`. (`HeroGlow` ya no existe; los
  dos gradientes que vivían dentro del botón se fueron con `AnimatedButton`.)
- ~~**El anillo de foco no llega a 3:1.**~~ **Cerrado el 22/9/2026**, en
  `archivo/DECISIONES.md` §3 duodevicies. Pintaba 2 px de hueco y 2 px de `amber-500`,
  y el ámbar contra la card de `paper` daba **2,78:1** contra los 3:1 de WCAG
  1.4.11. Se midió contra los cinco fondos que el sitio de verdad tiene debajo
  de algo enfocable, y el anillo pasa a `amber-700` —el único que pasa los
  cinco, 3,28:1 en el peor caso— que además es el uso que este manual ya le
  declaraba a `marcaTexto`. De paso salieron dos defectos que nadie había
  contado: el hueco iba clavado por tema y dibujaba un halo de 18:1 alrededor de
  cualquier link sobre una superficie oscura en el tema claro, y en modo de
  colores forzados no quedaba **ningún** indicador, porque ahí el navegador no
  pinta `box-shadow` y la utilidad apagaba el `outline`.
