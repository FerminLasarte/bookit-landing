# Mi local en la web — el panel como un sistema propio

> Aprobado por Fermín el 21 de octubre de 2026, con la recomendación de cada
> decisión **D1–D5**. Rama `mi-local/panel`. Sale de su pedido de ese día: que el panel del comercio no se sienta como
> una subpágina de la web, sino como un sistema propio, apartado, que cada
> comercio sienta como **su** espacio. No tiene por qué seguir los patrones de
> la landing: márgenes, todo centrado, etcétera.

## Qué pasa hoy

`/mi-local` se dibuja adentro del marco del sitio, el mismo que la home:

- el splash y el cursor de herramientas;
- el nav de la landing (Cómo funciona, Para locales, Puntos, Planes, Soporte y
  "Descargá la app");
- el footer con los legales;
- el contenido en `wrap`: una columna centrada con márgenes de página.

La agenda es una página más del sitio, y "Salir" y "Cargar un turno" son dos
botones arriba de la lista.

`/admin` ya resolvió esto para el equipo: `MarcoDelSitio` le saca el splash, el
cursor, el nav y el footer, y el panel tiene su propio `AdminNav`. El panel del
comercio va por el mismo camino, pero con una identidad propia.

## Qué cambia

### 1. Sale del marco del sitio

`MarcoDelSitio` hoy pregunta sólo por `/admin`. Pasa a tener una lista de las
rutas que son herramientas (`/admin` y `/mi-local`), en un solo lugar. En
`/mi-local` no hay splash, ni cursor, ni nav de la landing, ni footer.

### 2. Un marco propio: el "sistema"

Un layout para las pantallas de adentro, en un grupo de rutas como el de
`/admin`:

```
app/mi-local/
  (panel)/
    layout.tsx        el marco: barra del local, secciones, cuenta
    page.tsx          la agenda          (se mueve, la URL no cambia)
    nuevo/page.tsx    cargar un turno    (se mueve, la URL no cambia)
  entrar/page.tsx     ver D4
  sin-local/page.tsx  ver D4
```

El layout lee el local (nombre, logo, estado del plan) para dibujar el marco.
La página también lo lee: `leerMiLocal` se envuelve en `cache()` de React para
que sea una sola consulta por pedido. El chequeo de acceso sigue en la lectura
de datos y no en el layout, por la misma razón de la fase 1.

### 3. La estructura de la pantalla (D1)

**En la compu** (recomendada):

```
┌──────────────┬──────────────────────────────────────────────┐
│ [logo] Nogal │  Agenda                    [+ Cargar turno]  │
│              │  jueves, 22 de octubre   ‹ ›  [22/10]  Hoy   │
│ ● Agenda     │  Profesional  Todos · Julián · Nico · Tomás  │
│              │  ─────────────────────────────────────────── │
│              │  09:00–09:45  Valentina Sosa   $15.000  ✓    │
│              │  09:30–10:15  Bruno Alcaraz    $15.000  ✓    │
│              │  …                                           │
│              │                                              │
│ Tu plan      │                                              │
│ Salir        │                                              │
│ con Bookit   │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

- Una barra lateral fija a la izquierda con el local arriba (ver D3), las
  secciones al medio y la cuenta abajo (el plan y salir).
- El área de trabajo ocupa todo el resto, alineada a la izquierda y sin
  columna centrada. La lista de turnos usa el ancho: más columnas, más aire
  entre ellas.
- "Cargar un turno" es la acción principal de la agenda: un botón arriba a la
  derecha del área, no una sección.
- Hoy hay una sola sección, **Agenda**. Las de las fases 3 y 4 (horarios,
  servicios, equipo, estadísticas, promociones) se suman a la barra cuando
  existan; no se muestran "Próximamente".

**En el teléfono:**

```
┌──────────────────────────────┐
│ [logo] Barbería Nogal    ☰   │
├──────────────────────────────┤
│ Agenda          [+ Cargar]   │
│ jueves, 22 de octubre        │
│ ‹ ›  [22/10]  Hoy            │
│ …                            │
└──────────────────────────────┘
```

- Arriba, una barra con el local y un menú (☰) con las secciones, el plan y
  salir.
- Con una sola sección no hace falta la barra de pestañas de abajo que tiene la
  app. Cuando haya tres o más secciones, se pasa a pestañas abajo, como en la
  app (Agenda · Crecimiento · Gestión · Perfil).

### 4. Ancho y márgenes (D2)

Nada de `wrap`. Márgenes chicos y fijos (16 px en el teléfono, 24 a 32 px en la
compu), contenido alineado a la izquierda y a todo el ancho del área. La única
excepción son los formularios (cargar un turno): mantienen un ancho cómodo de
lectura y también van a la izquierda, no centrados.

### 5. Lo que sigue igual

- La fuente, los tokens de color, el modo claro y oscuro.
- El kit (`Button`, `Badge`, `Superficie`, `Dialogo`, `Field`) y las piezas de
  la agenda (la ficha, los filtros, el selector de día).
- Las reglas de copy: todo en `content/`, español con voseo.
- Las URLs: `/mi-local` y `/mi-local/nuevo` no cambian.

## Decisiones tuyas

**D1 · La estructura del sistema.**
- **(Recomendada) Barra lateral en la compu y barra de arriba con menú en el
  teléfono**, como en los bocetos. Es lo que más se siente "sistema": el local
  queda siempre a la vista y las secciones de las fases 3 y 4 tienen dónde ir
  sin rediseñar. Costo: una pieza nueva (la barra) y el menú del teléfono.
- Una barra de arriba propia, de punta a punta, con las secciones en línea. Es
  más simple y se parece al panel de `/admin`, pero con cinco o seis secciones
  se llena y en el teléfono igual necesita menú.

**D2 · El ancho.**
- **(Recomendada) Todo el ancho**, con márgenes chicos y alineado a la
  izquierda. Los formularios, con un ancho máximo de lectura.
- Un ancho máximo para toda el área (por ejemplo 1200 px), alineado a la
  izquierda. En pantallas grandes queda aire a la derecha, pero la agenda
  nunca se estira de más.

**D3 · De quién es el espacio: el local o Bookit.**
- **(Recomendada) El local primero.** Arriba de la barra va el logo del local
  (`comercios.logo_url`, el círculo que ya se ve en la app y en `/reservar`) y
  su nombre. Bookit queda como firma chica abajo ("con Bookit"). Si el local
  no tiene logo, va la inicial de su nombre en un círculo. Costo: una lectura
  más, del logo, porque `mi_plan_web()` no lo trae.
- Bookit primero: el logo de Bookit arriba, como en `/admin`, y el nombre del
  local debajo. Se siente más "producto Bookit" y menos "mi espacio".

**D4 · Entrar y "sin local".**
- **(Recomendada) También fuera del marco del sitio**, con una pantalla propia
  y sobria: el logo de Bookit y la tarjeta de entrar, sin nav ni footer. Así
  entrar ya se siente como entrar a un sistema. Para volver a la web queda un
  enlace chico ("Ir a somosbookit.com.ar").
- Dejarlas dentro del sitio, con el nav y el footer. Son las únicas pantallas
  que ve alguien que todavía no entró, y la landing le da contexto.

**D5 · ¿Valen en el panel las reglas de diseño de la landing?** `DISENO.md`
prohíbe resolver límites con degradados y usar cards negras. Vos dijiste que el
panel no tiene que seguir los patrones de la landing, y eso tiene una
consecuencia concreta para la barra lateral:
- **(Recomendada) Siguen valiendo, y la barra es clara:** el fondo de la página
  con un filete que la separa del área de trabajo. Es el mismo lenguaje de la
  marca (papel, tinta, filete y ámbar), con otra composición.
- La barra oscura (tinta), como muchos sistemas. Rompe la regla 2 de
  `DISENO.md`, y habría que declarar el panel como excepción, igual que
  `/planes`.

## Queda afuera

- **El enlace "Mi local" en el nav de la landing.** Ya está decidido que va,
  con sus tres preguntas abiertas en `docs/PLAN-MI-LOCAL.md`. Es la puerta de la
  web al panel y se puede hacer antes o después de esto.
- Hacer el panel instalable como app (un manifest propio con ámbito
  `/mi-local`). Se puede sumar después; hoy la app de verdad existe.
- Las secciones de las fases 3 y 4, los profesionales del equipo y los huecos
  libres: siguen como estaban.
- `/admin`: no cambia.

## Orden de trabajo

Una rama, `mi-local/panel`, y un PR a `main`:

1. Sacar `/mi-local` del marco del sitio, el grupo `(panel)` y `cache()` en
   `leerMiLocal`. Mover la agenda y la carga sin cambiarlas.
2. El marco: la barra (según D1 y D3) y el menú del teléfono. Con el plan y
   salir en la cuenta; "Cargar un turno" pasa al encabezado del área.
3. Adaptar la agenda y la carga al ancho nuevo (D2): sin `wrap`, la lista a
   todo el ancho, el formulario a la izquierda.
4. Entrar y "sin local" (según D4).
5. `DISENO.md`: el panel en la estructura, y la excepción si D5 sale "barra
   oscura".
6. Te paso las pantallas en la compu y en el teléfono, claro y oscuro, antes
   de seguir.

## Cómo se prueba

- `/mi-local` y `/mi-local/nuevo` sin nada del sitio: ni splash, ni cursor, ni
  nav, ni footer. La home, `/planes` y `/admin`, igual que antes.
- La agenda con un local con logo y uno sin logo (la inicial).
- 375 px y 1280 px, claro y oscuro, sin scroll de costado.
- El teclado: se puede recorrer la barra y abrir el menú del teléfono.
- `npm run typecheck` y `npm run build`.
