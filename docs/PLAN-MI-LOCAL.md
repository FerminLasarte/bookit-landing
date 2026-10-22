# Mi local en la web — fase 1: entrar y ver la agenda

> Aprobado por Fermín el 21 de octubre de 2026, con la recomendación de cada
> decisión **D1–D6**. Implementado en la rama `mi-local/fase-1`.

## Qué es la fase 1

El dueño de un local entra desde la compu con la misma cuenta de la app y ve
su agenda: los turnos de un día, de todo el local o de un profesional, con su
estado, el cliente, el servicio y lo cobrado en el día. Si un cliente reserva
desde la app mientras la pantalla está abierta, el turno aparece solo.

**Es de sólo lectura.** Confirmar, completar, marcar ausente, cancelar y
cargar un turno a mano son la fase 2: cancelar tiene efectos en la base
(devoluciones, puntos, avisos) que conviene mirar aparte.

**Queda afuera:** horarios y descansos, servicios, equipo, perfil del local,
estadísticas, promociones y recompensas (fases 3 y 4); los huecos libres
(ver D3); la vista de semana; cualquier cambio en la app.

## Por qué no hace falta tocar la base

- La app ya lee los turnos directo de la tabla con la sesión del dueño
  (`BusinessCalendarRepository.getTurnosPorFecha`). La política
  `turnos: cliente, local y profesional` deja ver sólo lo que
  `gestiona_turno()` permite. Un navegador con la misma sesión ve lo mismo
  que el teléfono, ni una fila más.
- `mi_suscripcion()` dice qué local tiene la cuenta (`auth_user_id = auth.uid()`)
  y en qué estado está. Una cuenta sin fila no es dueña de nada.
- El Realtime de `turnos` ya está publicado: la app lo escucha filtrando por
  `id_comercio`.

## La ruta

`/mi-local` (ver D2). No choca con los universal links: el
`apple-app-site-association` reclama `/auth/v1/verify`, `/reset-password/*`,
`/invite/*`, `/equipo` y `/reservar/*`, así que en el iPhone esta ruta abre la
web y no la app.

```
app/mi-local/
  page.tsx            la agenda del día (?dia=2026-10-21&profesional=…)
  entrar/page.tsx     entrar: mail y contraseña, Google o Apple
  sin-local/page.tsx  la cuenta no es dueña de un local
  auth/…              sólo si D1 sale "área propia" (ver abajo)
```

## Quién entra

1. **Sin sesión** → el proxy manda a `/mi-local/entrar`, igual que hace con
   `/admin` (sumar `/mi-local` al `matcher` de `proxy.ts`).
2. **Con sesión y sin local** (`mi_suscripcion()` vuelve vacío) →
   `/mi-local/sin-local`: "Esto es para los locales. Los turnos se sacan desde
   la app", con los badges de `BotonesDeDescarga`, y un enlace a `/planes` para
   dar de alta un local. El chequeo va en la lectura de datos y no en el
   layout, por la misma razón que en `lib/admin/datos.ts`: Next dibuja la
   página en paralelo al layout.
3. **Con local que no da acceso** (`cortada`, `suspendida`, `pendiente`) → ver D4.
4. **Con local al día o en gracia** → la agenda. En gracia, el aviso arriba,
   como `AgendaAvisoSuscripcion` en la app.

En `/mi-local/entrar` sólo se entra, no se crea la cuenta: quien no tiene
cuenta tampoco tiene local, y para eso está `/planes`.

## La agenda

**Datos** (`lib/mi-local/agenda.ts`, `server-only`):

- `leerMiLocal()`: `mi_suscripcion()`; devuelve el local y su estado, o manda a
  `sin-local`.
- `leerTurnosDelDia(idComercio, dia)`: la misma consulta que la app, con el
  mismo `select` (turno, servicio, profesional, `usuario_visible`), el día
  partido en la zona de Buenos Aires.
- `leerProfesionales(idComercio)`: para el filtro.

**Pantalla:**

- Encabezado: el nombre del local, el día, flechas de día anterior y siguiente,
  y "Hoy".
- Filtros: profesional (todos o uno) y estado. Viven en la URL, así que el día
  y el filtro sobreviven a recargar y se pueden guardar.
- El resumen: cantidad de turnos y lo cobrado (sólo `completado`, la regla
  de `EstadoTurno.esIngreso`).
- La lista: hora de inicio y fin, cliente, servicio, profesional, precio,
  estado con su insignia, y "Sin marcar" para el turno que ya pasó y nadie
  cerró (`EstadoTurno.quedoSinCerrar`).
- Vacío: "No hay turnos este día". Sin los huecos (D3) no se puede distinguir
  "no atendés" de "no hay reservas", así que el copy no lo afirma.
- Error de lectura: un aviso, nunca una lista vacía que parezca un día sin
  turnos (el B1-11 de la app).

**Realtime** (D5): un componente cliente chico que se suscribe a `turnos` del
local y, ante cualquier cambio, llama a `router.refresh()`. La página vuelve a
leer en el servidor y no hay estado duplicado en el navegador. Recarga también
al volver a la pestaña (`visibilitychange`), por lo mismo que la app recarga
al volver de segundo plano: Realtime no guarda lo que pasó con el canal caído.

## Lo que se reusa y lo que se mueve

- **Sesión:** `lib/supabase.ts` suma el área nueva (o reusa la de `planes`, D1).
- **Entrar:** `components/planes/Entrar.tsx` y `entrarConMail` están atados a
  `/planes`. Para no escribir un segundo formulario, el formulario de entrar se
  separa del de crear la cuenta y recibe por props adónde postea cada
  proveedor. `/planes` lo sigue usando igual.
- **Estados del turno:** `content/mi-local.ts` con la etiqueta de cada uno y
  su tono del kit (`Badge`), no los colores de semáforo de la app (D6). Junto
  al resto del copy de la pantalla: ningún texto vive en un componente.
- **Fechas:** `lib/formato.ts` ya formatea en `es-AR`; se suma lo del día si
  falta.
- **Kit:** `Section`, `Superficie`, `Badge`, `Button`, `Field`. Nada de
  `components/admin/piezas.tsx`, que es la estética del tablero interno.

## Decisiones tuyas

**D1 · ¿La sesión se comparte con `/planes`?**
- **(Recomendada) Sí, una sola área para el dueño.** Entra una vez y está
  adentro en `/planes` y en `/mi-local`. Se reusan las rutas de `auth/` de
  `/planes` sin copiarlas. Costo: la cookie pasa de `sb-planes` con path
  `/planes` a una nueva con path `/`, y quien hoy tiene sesión en `/planes`
  tiene que volver a entrar una vez.
- Área propia (`sb-mi-local`, path `/mi-local`). No toca `/planes`, pero hay
  que entrar dos veces y copiar las cuatro rutas de `auth/`.

**D2 · El nombre de la ruta.** `/mi-local` (recomendada: es como lo dice el
copy), `/local` o `/agenda`. Un subdominio (`local.somosbookit.com.ar`) es más
trabajo y no suma nada en esta fase.

**D3 · Los huecos libres.** La app los calcula en el teléfono
(`ManualBookingDaySlots` más `unirRangos`), a partir de `config_agenda`,
`excepciones` y los turnos.
- **(Recomendada) Fase 1 sin huecos.** Copiar esa cuenta a TypeScript sería
  la misma regla escrita dos veces, en dos repos.
- Llevar la cuenta a una función SQL en BooKit (`huecos_del_dia`) y que la
  usen la web y, después, la app. Es lo correcto a la larga, pero es una
  migración y un cambio en la app.

**D4 · El local cortado o pendiente.**
- **(Recomendada)** Un aviso con el estado y un botón a `/planes` para
  regularizar, sin la agenda. Es lo que hace la app con su paywall, y la web
  sí puede mandar a pagar.
- Dejarle ver la agenda en sólo lectura igual, con el aviso arriba.

**D5 · Realtime en la fase 1.** **(Recomendada) Sí:** una agenda abierta
todo el día en la compu que no muestra la reserva nueva no sirve. El costo es
un cliente de Supabase en el navegador para el canal. La alternativa es un
botón "Actualizar" y recargar al volver a la pestaña.

**D6 · Los colores de los estados.** La app usa semáforo (azul, verde, rojo,
gris). **(Recomendado)** Los tonos de `Badge` que ya usa el panel
(bien / atención / mal) más uno neutro, para no meter colores fuera de
`MARCA.md`. Si los querés iguales a la app, se suman como tokens.

## Orden de trabajo

Una rama, `mi-local/fase-1`, y un PR a `main`:

1. Sesión y proxy (según D1), y `/mi-local/entrar` con el formulario separado.
2. `lib/mi-local/agenda.ts` y la página de la agenda, sin Realtime.
3. `sin-local` y el aviso de suscripción (según D4).
4. Realtime (según D5).
5. Prueba con un local real: un dueño con turnos de hoy, una cuenta de cliente
   (tiene que caer en `sin-local`) y un profesional que no es dueño (también
   `sin-local` en esta fase). Te paso las pantallas para que las mires.

## Lo que no decidía este plan, y cómo se decidió

- **Los profesionales del equipo.** En la fase 1 no entran: `mi_suscripcion()`
  sólo encuentra al dueño. Decidido el 21-oct-2026: entran **después de la fase
  3**, ver la hoja de ruta.
- **"Mi local" en el nav.** Decidido el 21-oct-2026: va en el nav, como un
  enlace "Mi local" al lado del botón "Descargá la app", visible para todos. Un
  cliente que lo toca cae en "Esto es para los locales". Así el nav no tiene
  que leer la sesión, y la landing se sigue sirviendo ya armada. Todavía no está
  hecho: hasta entonces se llega con el link.

## Hoja de ruta

Decidida por Fermín el 21-oct-2026. El orden es el de abajo. Cada fase se
planea por escrito justo antes de empezarla, no antes: el detalle depende de
lo que haya en la app y en la base en ese momento.

| # | Qué | Estado |
|---|---|---|
| 1 | Entrar y ver la agenda | En `main` (#45) |
| 2 | Completar, ausente, cancelar y cargar un turno a mano (`docs/PLAN-MI-LOCAL-FASE-2.md`) | En `main` (#46). Falta terminar la prueba |
| — | El panel como un sistema propio, y la selección de día, profesional y estado (`docs/PLAN-MI-LOCAL-PANEL.md`) | En `main` (#47) |
| — | El enlace "Mi local" en el nav | Decidido, sin hacer |
| 3 | **Gestión:** horarios y descansos, servicios y equipo. Incluye los **huecos libres** de la agenda, con una función SQL en BooKit (`huecos_del_dia`) que use la web y después la app (D3 de la fase 1) | Sin planear |
| — | **Los profesionales del equipo entran a la web:** cada uno ve sólo su agenda y la marca, como en la app, con la regla de acceso de `staff_bottom_nav_bar.dart` | Después de la fase 3 |
| 4 | **Crecimiento** (estadísticas, promociones y recompensas) y **Perfil** del local | Sin planear |

Aparte, en BooKit y sin frenar a la web: los tres arreglos que dejó anotados
la fase 2 (ver "Para revisar más adelante" en su plan).
