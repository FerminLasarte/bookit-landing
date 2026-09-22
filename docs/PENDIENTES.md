# Registro de pendientes — lo que se vio y no se tocó

Lista de trabajo, no de decisiones. Acá se anota lo que aparece **mientras se
hace otra cosa** y se deja deliberadamente afuera, para que no dependa de que
alguien se acuerde. Nada de lo que está acá está decidido: cuando se tome una
decisión, se escribe en [`DECISIONES.md`](DECISIONES.md) y la línea se tacha
acá.

> **Autoridad: ninguna.** Manda [`MARCA.md`](MARCA.md) y después
> [`REDISENO.md`](REDISENO.md). Este archivo no decide nada; sólo registra.

Abierto el 22 de septiembre de 2026, durante la Fase C.

## Vistos durante la Fase C, medidos, no ejecutados

### 1 · Los diez tildes ámbar de `Audiences`

Las dos listas de [`Audiences`](../components/Audiences.tsx) marcan cada ítem
con un `IconCheck` en `amber-600` sobre claro (**3,31:1**, y pide 3:1 por ser un
ícono) y `amber-300` sobre oscuro. Son once marcas ámbar en una pieza cuyo
propio comentario dice que el ámbar va reservado a una sola cosa.

Se miró en el paso de `#publico`, porque las capturas de la app traen su propio
ámbar —el gráfico entero de `15`, el "en Tandil" de `01`— y compiten con el del
sitio. A tamaño real los tildes se leen como marcas de lista y no como acento,
así que no es urgente; pero es el mismo razonamiento con el que la §3 octies le
sacó el ámbar a catorce rótulos. Mismo caso en
[`/lista-espera`](../app/lista-espera/page.tsx).

**Por qué no se hizo:** el encuadre de ese paso era sumar y no rehacer la pieza
que la auditoría llama la mejor compuesta del sitio.

### 2 · `IconShears` no lo usa nadie

Export muerto en [`icons.tsx`](../components/icons.tsx), anterior a la Fase C.
Es el mismo criterio con el que se borraron `IconSlot` e `IconStore` cuando las
capturas los reemplazaron: un export sin lectores es la forma más segura de que
alguien lo use mal.

**Por qué no se hizo:** no lo dejó huérfano ningún paso de esta fase.

### 3 · La jerarquía de los dos CTA no es la misma en las tres piezas

| Pieza | Cliente | Local |
|---|---|---|
| Hero | ámbar (`primary`) | hueso (`secondary onDark`) |
| `#publico` | tinta (`secondary`) | hueso (`secondary onDark`) |
| `#cierre` | ámbar (`primary`) | hueso (`secondary onDark`) |

`#publico` es la excepción y es deliberada: es el D11 de la auditoría, donde la
comparación es el punto de la sección y dos variantes distintas la desmentían.
Lo que queda flojo es que [`page.tsx`](../app/page.tsx) afirma en `#cierre` que
"los dos CTA pesan lo mismo" y el color dice otra cosa. O se corrige la frase o
se corrige el botón, y toca dos piezas a la vez.

### 4 · `text-xs` acumulado, contado por primera vez

Diez usos fuera del tamaño `compact` del botón: `Rewards` (4),
`WaitlistForm` (2), `LegalDoc`, `Footer`, `AudienceSwitch`, `ReferralCode`. La
auditoría nombra dos de ellos como relleno —los del final de Referidos— y el
resto nunca se contó junto. `#cierre` sacó los suyos en la §3 terdecies y los
pasó a `text-small`.

Es una pregunta de densidad de todo el sitio, no de una sección: 12 px es un
escalón que el `@theme` no declara (`--text-small` es 14 px), así que hoy es el
default de Tailwind usado a mano en diez lugares.

### 5 · El hero es el único lienzo que no pasa por `Section`

Desde la §3 terdecies, `tone="canvas"` sabe pintar el lienzo de marca. El hero
lo escribe a mano, y tiene motivo: su `min-h` de pantalla y sus
`@media (max-height)`. Falta decidir si `Section` aprende un ritmo de pantalla
completa o si queda declarado que el hero es la excepción — hoy es lo segundo
sin que nadie lo haya escrito.

### 6 · `breath` dice "la única sección de respiro" y la usan dos

El comentario de [`Section`](../components/Section.tsx) quedó viejo: el ritmo lo
usan `#puntos` y `#cierre`. Es una línea de comentario, no un valor.

### 7 · El corte de renglón del titular de `#cierre`

`text-wrap: balance` está en todos los `h1/h2/h3` del sitio y parte "Cuando
Bookit abra en / Tandil, ya vas a estar adentro." El corte de la coma sería
mejor. Medido: el balanceo elige el mismo corte a cinco anchos distintos, porque
es el que parte la frase más cerca de la mitad, así que conseguir el otro pide
apagar el balanceo para ese titular y elegirle un `max-w` a medida. Es una
excepción local a una regla tipográfica de todo el sitio a cambio de un renglón.

## Deuda ya registrada en otro lado

No se repite acá, se apunta dónde vive:

- **El anillo de foco no llega a 3:1.** `ring-focus` pinta 4 px de `amber-500` y
  contra la card de `paper` da **2,78:1**. Es de toda la web y necesita su propia
  medición contra los cinco fondos. `MARCA.md`, *Deuda conocida*.
- **El maestro del logo escribe el naranja equivocado** (`#FD8003` en vez de
  `#FD7D03`) y deja la tinta sin `fill`. `MARCA.md`, *Deuda conocida*.
- **`public/brand/` conserva los PNG y JPEG anteriores a los SVG.** Hay que
  confirmar quién los consume antes de borrarlos. `MARCA.md`.
- **El `#3B82F6` de "Confirmado" sin tokenizar**, que deja a
  `10_comercio_agenda_dia` fuera de uso. `REDISENO.md` y `DECISIONES.md`
  §3 undecies.

## Correcciones al manual v1, no a la web

Salen de la auditoría (*"Queda trabajo para el manual, no para la web"*) y
necesitan a una persona con autoridad sobre el manual:

1. El azul `#3B82F6` de los estados de turno, que la lista cerrada de
   excepciones no incluye.
2. La regla real del ámbar: la app reserva `primary` para el display y baja a
   `marcaTexto` en cuanto el tamaño es de lectura. El manual lo enuncia como
   prohibición plana.
3. Mayúsculas sostenidas (`MAÑANA`, `TARDE`), que el manual prohíbe y la app usa.
4. Píldoras con sombra, que el manual prohíbe y la app usa.
5. Chip con relleno de marca dentro de una lista (el "5 km" de
   `01_cliente_inicio`), que el manual prohíbe y la app usa.
6. El nombre en prosa: `Bookit`, no `BooKit`. Ya está como *Divergencia 4*.

Y una que no es del manual sino del producto: **el botón de la app pone rótulo
blanco sobre el ámbar y da 2,78:1.** Es la segunda falla de contraste medida en
el producto, junto con el ámbar a tamaño display (2,71:1). Cambiar el rótulo a
tinta lo lleva a 5,27:1 sin tocar el color de marca. `MARCA.md`,
*Divergencia 6*.

## De una persona, no de código

Ya listado en `DECISIONES.md` §4, se repite acá para que la lista esté completa:

- **Revisión legal** de los cinco documentos de `/legal/*`, sobre todo puntos,
  suscripciones y el rol de intermediario.
- **Razón social, CUIT y domicilio fiscal** para Términos y Privacidad.
