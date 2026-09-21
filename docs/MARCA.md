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
`logo_bookit_isotipo.svg`. Los trazos en tinta salen en `currentColor`; el
naranja sale de `--logo-naranja` y los huecos de la palabra de `--logo-hueco`.
En React se usa siempre [`components/Wordmark.tsx`](../components/Wordmark.tsx),
nunca un `<img>` al SVG: un `<img>` no hereda el color y rompe el modo oscuro.

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

`primary` sobre superficie clara da **2,64:1**. No llega al 3:1 de un borde ni
al 4,5:1 de un texto chico. Por eso existe `marcaTexto` (`#9D6515`, 4,9:1): el
mismo tono con la luminosidad bajada, para cuando el color tiene que *leerse*.
Sobre fondo oscuro no hace falta — ahí el ámbar ya pasa con 6,3:1.

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

**Radios — cuatro y una fórmula.** Campos 12 · toasts 16 · cards 24 · píldoras
50. Al anidar, `radio exterior = radio interior + padding`. Sin eso las esquinas
no son concéntricas y la card se ve hecha a mano.

**Sombra o borde. Nunca los dos.** Una superficie de contenido lleva
`--shadow-card`. Una acción secundaria lleva borde de 1 px de `ink-900` al 10 %.
Los campos y las píldoras no llevan sombra nunca.

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

## Deuda conocida

- `public/brand/` conserva `icon.png`, `icon.jpeg`, `lockup.png` y
  `lockup.jpeg`, anteriores a los SVG. Hay que confirmar quién los consume
  (metadata, OG) antes de borrarlos.
- Quedan `rgba()` del ámbar escritos a mano en los gradientes de `HeroGlow`,
  `page.tsx` y `Rewards`. Son el hex canónico, pero el manual pide que ningún
  color se escriba suelto.
- Los bordes usan `ink-900/8`, `/10`, `/12` según el componente. El manual fija
  **10 %**. Falta unificar.
