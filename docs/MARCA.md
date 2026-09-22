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

**Los huecos de la `B` y de las dos `o` van calados, no tapados.** Se dibujan
con `fill-rule="evenodd"` sobre el mismo contorno. Existía un token
`--logo-hueco` que los pintaba del color del fondo y había que setearlo a mano
en cada sitio de uso; se eliminó el 22/9/2026. Era una trampa: el logo sólo
quedaba bien sobre exactamente `cream-50` o `ink-950`, y sobre un lienzo, un
degradé o una captura los tapones se veían de otro color que el fondo. Calado,
el logo deja de depender de lo que tenga detrás.

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
`cream-100` ese mismo tono da 4,38:1 y no pasa, que es el D2 de la auditoría.
Sobre fondo oscuro no hace falta — ahí el ámbar pasa con **6,66:1**.

Con la tinta **encima** del ámbar, en cambio, da **5,27:1**, y es lo que
habilita el botón de acción. Los cuatro números de este párrafo se remidieron el
22/9/2026 contra los valores WCAG publicados; los anteriores (2,64 · 4,9 · 6,3 y
un 6,66 transpuesto en `DECISIONES.md` §1.1) estaban mal. Ver la tabla de
*Los números de contraste, remedidos* en `DECISIONES.md`.

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
- La bajada va en `ink-500` (`onSurfaceVariant`).
- En texto chico el tracking vuelve a 0: apretar una letra chica la vuelve
  ilegible.
- El título y su bajada van pegados porque son una unidad. El cuerpo largo
  respira en 1,55.
- **Truncar esconde.** Ningún dato existe sólo truncado.

## Espacio y forma

**La proporción, no el número.** El hueco entre dos grupos es por lo menos el
doble del hueco que hay dentro de uno. Un grupo se lee por su aire, no por su
borde.

De ahí sale **qué es card y qué no** en la web: es card lo que se *toma* —se
completa, se copia o se compara con lo de al lado—, y lo que sólo se lee se
agrupa por aire y un filete. La excepción la pone el contraste, no el gusto: en
claro, el texto chico sobre una sección con tinte va en card de `paper` porque
`cream-100` no lo sostiene. Las dos cláusulas y sus números, en
`DECISIONES.md` §3 sexies.

**Radios — cuatro y una fórmula.** Campos 12 · toasts 16 · cards 24 · píldoras
50. Al anidar, `radio exterior = radio interior + padding`. Sin eso las esquinas
no son concéntricas y la card se ve hecha a mano.

**Sombra o borde. Nunca los dos.** Una acción secundaria lleva borde de 1 px de
`ink-900` al 10 %. Los campos y las píldoras no llevan sombra nunca.

El manual agrega que una superficie de contenido lleva `--shadow-card`. **En la
web no**: la card se sostiene con borde, y la sombra queda para lo único que de
verdad flota, que es el toast. Es la *Divergencia 7*, con sus números.

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
- Cards de opción con borde naranja y tilde.
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
   brief y que `DECISIONES.md` §1.1 ya había rechazado por accesibilidad, así
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

7. **El filo de una superficie de contenido es el borde, no `--shadow-card`.**
   Decidido el 22/9/2026 (Fase B paso 3). El manual manda la sombra; la web usa
   borde en los dos temas. No es preferencia, lo deciden dos números: en claro
   la sombra y el borde al 10 % dan **el mismo 1,208:1** contra `cream-50` —las
   dos son `ink-900` al 10 % compuesto—, así que ahí la medición no los separa;
   en oscuro `--shadow-card-dark` da **1,064:1**, **menos que el propio relleno
   de la card** sobre la página (1,157:1), mientras que el borde al 10 % da
   1,357:1. La sombra dibuja en un tema y no en el otro, y una regla así no
   sirve para un sitio que diseña los dos.

   De paso queda dicho que el relleno claro no separa nada por sí solo
   (`paper` sobre `cream-50`: **1,027:1**). En claro la card **es** su borde; en
   oscuro el borde acompaña a un relleno que ya se ve. Otra vez: el oscuro no es
   el claro invertido.

   **`--shadow-card` y `--shadow-card-dark` no se borraron**, porque un token
   sin lectores es la forma más segura de que alguien lo use mal. Se les dio su
   único uso legítimo: el toast de `ReferralCode`, que es la única superficie
   del sitio que de verdad flota por encima de la página. Ese toast, además,
   estaba escrito como **píldora con `shadow-lg`** — rompía a la vez el radio
   propio del toast (16 px) y el "las píldoras no llevan sombra nunca" de más
   arriba.

8. **La fórmula concéntrica vale en anidados apretados.** `radio exterior =
   radio interior + padding` no sobrevive al padding de la web: la card de
   `WaitlistForm` tiene 24 px de radio, 24–40 px de padding y campos de 12, y la
   fórmula pediría entre 36 y 52 px de radio exterior — más que la píldora. Con
   28–40 px de aire entre un borde y el otro las esquinas no se leen como
   concéntricas, se leen como dos formas sueltas. Donde el anidado sí es
   apretado el sitio la cumple exacto: el marco del teléfono de `HowItWorks`,
   40 px de radio con 12 px de padding sobre una pantalla de 28. La regla es
   que vale mientras el hijo toque el padding.

## Deuda conocida

- `public/brand/` conserva `icon.png`, `icon.jpeg`, `lockup.png` y
  `lockup.jpeg`, anteriores a los SVG. Hay que confirmar quién los consume
  (metadata, OG) antes de borrarlos.
- **El archivo maestro del lockup arrastra dos defectos**, y el SVG del repo ya
  está corregido pero el maestro no — así que un re-export los reintroduce.
  Verificado el 22/9/2026 contra
  `Documents/Data Apps/Bookit/Logos/logo_bookit_completo.svg`: el dibujo es
  idéntico al del repo (los doce paths y los cinco círculos coinciden), pero
  (a) los huecos de la `B` y de las `o` están tapados con tres casi-blancos
  distintos —`#FEFDFD`, `#FDFDFD`, `#FEFEFD`—, o sea que el logo sólo funciona
  sobre blanco, y (b) tiene **dos** naranjas, `#FD8003` en casi todo y
  `#FD8102` sólo en el punto de la `i`, y ninguno es el `#FD7D03` canónico.
  Hay que corregir el maestro.
- Quedan `rgba()` del ámbar escritos a mano en los gradientes de `page.tsx`,
  `Audiences`, `Rewards` y el destello de `/invite` —que el inventario anterior
  no contaba—. Son el hex canónico, pero el manual pide que ningún
  color se escriba suelto. (`HeroGlow` ya no existe; los dos gradientes que
  vivían dentro del botón se fueron con `AnimatedButton` el 22/9/2026.)
- Los bordes usan `ink-900/8`, `/10`, `/12` según el componente. El manual fija
  **10 %**. Falta unificar — las cuatro superficies de conversión ya se pasaron
  al 10 % en la Fase B paso 3; el resto es D4, del paso 5.
- **`cream-100` no sostiene texto chico en claro**, y no se arregla aclarándolo:
  para que `ink-500` llegue a 4,5:1 tiene que subir hasta `#F6F8FA`, y ahí
  separa 1,04:1 contra `cream-50`, o sea que deja de verse como banda. Es la
  versión grande de D2. Hoy se tapa poniendo el texto chico sobre una card de
  `paper`; la salida real es del paso 5 y es estructural, no un ajuste de color.
  Medido en `DECISIONES.md` §3 sexies.
