# Mi local en la web — fase 2: actuar sobre los turnos

> Aprobado por Fermín el 21 de octubre de 2026, con la recomendación de cada
> decisión **D1–D7**. Parte de la fase 1 (`docs/PLAN-MI-LOCAL.md`, PR #45,
> rama `mi-local/fase-1`). El paso 0 es la rama `servicios-del-profesional`
> de BooKit.

## Qué es la fase 2

Desde la agenda web, el dueño hace con un turno lo mismo que hace con la hoja
del turno en la app: **completarlo, marcarlo ausente o cancelarlo**, y
**carga un turno a mano** para un profesional del local. Todo pasa por la base
igual que desde el teléfono: la web no decide nada que la base no vuelva a
decidir.

**Confirmar no está** en esta lista: la base no deja hacerlo, ni desde la
app ni desde la web (ver D1).

**Queda afuera:** los profesionales del equipo (siguen sin entrar), reprogramar,
editar o borrar un turno, los huecos libres de la agenda (D3 de la fase 1), la
vista de semana y cualquier cambio en la app.

## Cómo lo hace hoy la app

### Cambiar el estado

- `SharedTurnoBottomSheet` (`lib/shared/widgets/shared_turno_bottom_sheet.dart`)
  arma los botones con la misma regla que la base:
  - turno cerrado (`EstadoTurno.esFinal`: completado, ausente, cancelado,
    expirado): ningún botón, sólo `fraseCerrado` ("Este turno ya se completó").
  - ya empezó: **"Asistió · Completar"** y **"No asistió · Ausente"**. Si
    todavía no empezó: "La asistencia se marca cuando empieza el turno".
  - todavía no terminó: **"Cancelar turno"**, con confirmación: "Se cancela el
    turno de X y el horario queda libre. [Se le devuelven los $N que pagó por
    Mercado Pago.] No se puede deshacer."
- `BusinessCalendarProvider.cambiarEstadoTurno` cambia el turno en pantalla
  antes de escribir, llama al repo y, si falla, vuelve atrás y relee. Después
  avisa a otras pantallas por `eventBus` y recarga los huecos.
- `BusinessCalendarRepository.actualizarEstadoTurno` es un `update` directo:
  `turnos.update({estado}).eq(id_turno)`. Es lo único que `authenticated` puede
  escribir en `turnos` (`grant update (estado)`, 20260912190000).

### Lo que hace la base con ese `update`

Todo es un trigger: **la web no tiene que disparar nada aparte**, siempre que
escriba con la sesión del dueño (ver "Por qué la sesión y no la service role").

| Trigger | Cuándo | Qué hace |
|---|---|---|
| `trg_turnos_quien_cambia_el_estado` (BEFORE) → `_turnos_quien_cambia_el_estado` (20260925150000) | cualquier cambio de estado, sólo para `anon`/`authenticated` | Rechaza con `42501` y un mensaje para personas: el turno ya cerrado ("Este turno ya está cerrado y no admite cambios."), un estado que no sea completado/ausente/cancelado ("No podés cambiar el estado de este turno."), completar o ausente antes del inicio ("El turno todavía no empezó."), cancelar después del fin ("El turno ya terminó: se marca como completado o ausente."), y quien no `gestiona_turno()`. |
| `trigger_turnos_completados_puntos` (BEFORE) → `procesar_puntos_turno_completado` (20260925190000) | pasa a `completado` | Le suma los puntos al cliente (`transacciones_puntos`, `billetera_usuarios`, nivel) salvo que el turno haya usado un beneficio. |
| `trg_turnos_referido_bono` (20250326120000) | `update of estado` | El bono de referido del primer turno completado. |
| `tr_turnos_cancelados_revertir` → `_revertir_beneficios_turno_cancelado` | pasa a `cancelado` o `expirado` | Devuelve el cupón de puntos a la billetera y borra el uso de la promoción (baja el contador). |
| `trg_devolver_al_cancelar` → `fn_devolver_al_cancelar` (20260925140000) | pasa a `cancelado` con `metodo_pago = 'mercadopago'` y `pago_estado = 'pagado'` | Llama por `pg_net` a la función `devolver_turno`. Si cancela el cliente, sólo con la anticipación del local; **si cancela cualquier otro (el dueño), devuelve siempre**. `devolver_turno` reembolsa con el token del local y deja `pago_estado = 'devuelto'`; si no puede, lo anota en `incidencias_pago` y le llega por mail al local. |
| `trg_notificar_cambio_turno` → `notificar_turno` (20260927120000, `destinatarios.ts`) | cambia el estado o la hora | Si cancela el dueño: al cliente, "Turno cancelado ❌ — El local canceló tu turno: …"; al profesional con cuenta, "Se canceló un turno tuyo ❌". Completado y ausente no avisan a nadie. Al dueño no le llega lo que hizo él. |

El turno que nadie marca lo cierra como completado `cerrar_turnos_sin_marcar`
a los 3 días; la agenda lo muestra "Sin marcar" hasta entonces, y se puede
cerrar igual.

### El turno a mano

- `ManualBookingProvider` arma el formulario: profesional (si hay uno solo, ya
  elegido) → servicio → día → horario → nombre y teléfono del cliente.
- **Profesionales:** `ManualBookingRepository.fetchProfesionales`, los activos
  del local. La web ya lo tiene: `leerProfesionales`.
- **Servicios:** `fetchServiciosProfesional` lee `profesionales_servicios` con
  `servicios` activos; si el profesional no tiene ninguno asignado, cae a
  **todos** los del local. El precio que muestra lo calcula en Dart
  (`precioDelProfesional` con `comercios.precios_libres`) y la duración también
  (`duracion_personalizada` o la del servicio). Es la misma regla que
  `_oferta_de_servicios()` en SQL, escrita otra vez.
- **Horarios:** `horarios_libres_del_profesional(p_profesional, p_fecha,
  p_servicio)` (20260925170000), `security definer`, sólo para quien
  `gestiona_profesional`. Es `_inicios_libres`, la misma cuenta que la reserva
  del cliente: franjas de `config_agenda`, turnos que ocupan, excepciones,
  `turnos_bloqueados` y el hueco muerto, en hora de Buenos Aires, sin los
  inicios que ya pasaron. Devuelve sólo `inicio`. Lo que se calcula en Dart
  es lo de alrededor: por qué un día no tiene horarios (no trabaja, orden de
  llegada, lleno, ya pasó) y si una hora a mano cae fuera del horario.
- **Hora a mano:** la app deja poner cualquier hora del día. Si se pisa con
  otro turno la frena; si cae fuera del horario, sólo avisa.
- **Guardar:** `crearTurnoManual` primero inserta la asignación
  profesional–servicio (`_ensureServicioAsignado`, ignora el error) y después
  llama a `crear_turno_manual(p_profesional_id, p_servicio_id, p_inicio, p_fin,
  p_cliente_nombre, p_cliente_telefono)` (última versión en 20260927140000).
  `p_fin` lo calcula el teléfono: inicio más la duración.
- `crear_turno_manual` controla: sesión, profesional activo,
  `gestiona_profesional`, local al día o en gracia, que el servicio sea del
  local, que no se pise con otro turno (y la `exclusion_violation` si entra
  otro en el medio). Guarda el precio de `_oferta_de_servicios()`, `origen =
  'manual'`, `estado = 'pendiente'`, `metodo_pago = 'manual'`. Devuelve
  `{ success, id_turno }` o `{ success: false, message }` con un mensaje para
  personas.
- Después del INSERT, `notificar_turno` le avisa al profesional si tiene
  cuenta y no fue él quien lo cargó: "Te agendaron un turno 📅 — Lo cargó el
  local". Al dueño, nada.

## Lo que se reusa y lo que se suma en la web

**Se reusa:**

- `leerMiLocal()` y `daAcceso()` (`lib/mi-local/agenda.ts`): cada acción
  vuelve a preguntar quién es y si el local entra, como la página.
- `leerTurnosDelDia`: suma `metodo_pago, pago_estado, monto_pagado` al
  `select` para saber cuánto se devuelve al cancelar (`cobradoPorMp` de la
  app: MP y pagado, la misma condición que el trigger de la devolución).
- `leerProfesionales` para el formulario del turno a mano.
- `lib/mi-local/vista.ts` (`esClaveDeDia`, `sumarDias`) para el día del
  formulario.
- `EnVivo` sigue como está: el turno que cambia o se carga llega por Realtime
  a las otras pestañas y a la app.
- `Badge`, `Button`, `Field`, `Superficie` del kit; el copy, en
  `content/mi-local.ts`.

**Se suma:**

- `app/mi-local/acciones.ts` (`"use server"`), como `app/planes/acciones.ts`:
  - `cambiarEstado(idTurno, estado)`: `estado` validado con zod contra
    `completado | ausente | cancelado`, `idTurno` como uuid. `leerMiLocal()` y
    `daAcceso()`; después
    `clienteDeSupabase("local").from("turnos").update({ estado }).eq("id_turno", id).select("id_turno")`.
    **Cero filas es un error**: si la política no deja ver el turno, el update
    no falla, sólo no toca nada (la app hoy no lo detecta). Al final,
    `refresh()` de `next/cache`: la página se vuelve a dibujar en la misma
    respuesta (`node_modules/next/dist/docs/01-app/02-guides/server-actions.md`).
  - `cargarTurno(datos)`: profesional (uuid), servicio (entero), inicio (ISO),
    nombre y teléfono opcionales con tope de largo. La duración **no** viene
    del formulario: se relee en el servidor (D4) y `p_fin = inicio + duración`.
    Llama a `crear_turno_manual` y, si sale bien, `redirect` a la agenda de ese
    día.
  - Las dos devuelven `{ error: string | null }` para `useActionState`. Ver D7
    para qué texto lleva el error.
- `accionesDelTurno(turno, ahora)` en `lib/mi-local/agenda.ts`, al lado de
  `quedoSinMarcar`: qué botones se muestran (D3).
- La pantalla del turno (D2) y el formulario del turno a mano (D6).
- El copy en `content/mi-local.ts`: los botones, la confirmación de cancelar,
  la nota de "La asistencia se marca cuando empieza el turno", las frases de
  turno cerrado y lo del formulario.

**No se copia de la app:**

- El cambio optimista y la vuelta atrás del provider: la página se relee en el
  servidor y llega con la respuesta de la acción. Sólo el botón queda
  deshabilitado mientras espera.
- El `eventBus` y la recarga de huecos: son de la app.
- `_ensureServicioAsignado` y la caída a "todos los servicios del local":
  `crear_turno_manual` ya acepta un servicio del local sin asignar, pero
  `horarios_libres_del_profesional` no le encuentra horarios (sin fila en
  `_oferta_de_servicios()` no tiene duración). Un profesional sin servicios
  asignados dice "No tiene servicios asignados. Se asignan desde la app."
- La explicación de por qué un día no tiene horarios y el aviso de "fuera de
  horario": son cuentas de Dart. Ver D5.

### Por qué la sesión y no la service role

Las acciones escriben con `clienteDeSupabase("local")`, el JWT del dueño, como
todo el resto de la web. No es sólo prolijidad:
`_turnos_quien_cambia_el_estado` **no corre** para otro rol (`current_user not
in ('anon', 'authenticated')` → deja pasar todo), así que con la service role
se podía completar un turno de mañana o reabrir uno cerrado. Y `notificar_turno`
necesita `auth.uid()` para saber que fue el dueño: sin él, el aviso al
profesional ("Se canceló un turno tuyo") no sale.

## Decisiones tuyas

**D1 · Confirmar.** La base no deja que el local confirme: "Desde la app, un
turno abierto sólo se cierra o se cancela. Confirmar un pendiente o expirarlo
es cosa del pago y del limpiador" (`_turnos_quien_cambia_el_estado`). Los
pendientes que existen son dos: la reserva de Mercado Pago sin pagar (vence a
los 15 minutos; confirmarla sería darla por paga) y el turno a mano, que nace
pendiente.
- **(Recomendada) Sin "Confirmar", igual que la app.** Costo: el turno a mano
  se ve "Pendiente" (tono atención) hasta que se cierra, como hoy en la app.
- Que `crear_turno_manual` lo guarde `confirmado`. Es una migración en BooKit
  que cambia también lo que ve la app, y antes hay que revisar qué lee
  `pendiente` en un turno manual (Crecimiento, el cierre a los 3 días, los
  filtros).
- Abrir el trigger para que el dueño confirme un pendiente que no sea de
  Mercado Pago. Migración en BooKit y un botón que la app no tiene.

**D2 · Dónde están las acciones.**
- **(Recomendada) Tocar el turno abre su ficha**, como la hoja de la app: un
  `<dialog>` con el detalle (hora, cliente, servicio, profesional, precio,
  estado) y las acciones abajo. Cancelar pide confirmación ahí mismo. Costo:
  una pieza nueva en el kit (no hay diálogo en `components/ui`), con
  `MARCA.md` y `DISENO.md`.
- Los botones en la fila. Es un clic menos, pero en el teléfono la fila ya va
  apretada y cancelar igual necesita un paso de confirmación.

**D3 · Qué botones se muestran.** La regla (abierto; completar y ausente desde
que empieza; cancelar hasta que termina) vive en el trigger, y la app la tiene
también en la hoja para no ofrecer lo que la base va a rechazar.
- **(Recomendada) `accionesDelTurno` en TypeScript**, tres líneas al lado de
  `quedoSinMarcar`, con un comentario que apunta al trigger. Costo: si la regla
  cambia en la base, la web puede ofrecer un botón de más hasta que se toque;
  la base lo rechaza con su mensaje y no pasa nada.
- Que la base diga qué se puede (una columna calculada o una función
  `acciones_del_turno`). Una sola fuente, pero es una migración para tres
  comparaciones de fechas.

**D4 · Los servicios del profesional, con su precio y su duración.** La
web necesita la duración (para `p_fin`) y conviene mostrar el precio que se va
a guardar. Los dos salen de `_oferta_de_servicios()`, que no está abierta a
`authenticated`.
- **(Recomendada) Una función nueva en BooKit, `servicios_del_profesional(p_profesional)`**,
  `security definer`, con el mismo control que `horarios_libres_del_profesional`
  (`gestiona_profesional`), que devuelva `id_servicio, nombre, precio,
  duracion_minutos` de `_oferta_de_servicios()`. Es lo mismo que después guarda
  `crear_turno_manual`, así que el precio de la pantalla y el del turno no se
  pueden separar. Costo: una migración y un PR en BooKit antes del paso 4 del
  orden de trabajo; la app la puede usar después en lugar de
  `precioDelProfesional`, pero no en esta fase.
- Leer las tablas como la app (`profesionales_servicios` + `servicios`) y
  calcular la duración y el precio en TypeScript. No toca la base, pero es la
  tercera copia de la regla de precios por profesional (SQL, Dart, TS).
- Sin precio en el formulario y la duración leída de las tablas. Menos copia,
  pero la duración sigue escrita dos veces.

**D5 · El horario del turno a mano.**
- **(Recomendada) Sólo los horarios libres** de
  `horarios_libres_del_profesional`, como botones. Si no hay ninguno: "No
  quedan horarios libres este día", sin decir por qué (lo mismo que en la fase 1
  con los huecos). Costo: un turno fuera del horario (el que llegó a última
  hora) se sigue cargando desde la app.
- Sumar "Otra hora" a mano. `crear_turno_manual` ya frena lo que se pisa, así
  que la base cuida lo importante; lo que no habría es el aviso de "fuera de tu
  horario", porque esa cuenta está en Dart.

**D6 · Dónde vive el formulario del turno a mano.**
- **(Recomendada) Una página, `/mi-local/nuevo`**, con lo elegido en la URL
  (`?dia=…&profesional=…&servicio=…`), como el día y los filtros de la agenda.
  Los servicios y los horarios se leen en el servidor al elegir; sólo el
  último paso (nombre, teléfono, "Cargar turno") es una server action.
  Funciona sin JavaScript y no hay lecturas desde el navegador. Costo: cada
  elección es una navegación.
- Un diálogo sobre la agenda que pide servicios y horarios con server actions.
  Se siente más rápido, pero las lecturas pasan al cliente y suma estado en el
  navegador, que la fase 1 evitó.

**D7 · Los mensajes de error.** La base ya contesta con frases para personas
(el trigger y `crear_turno_manual`), y la app las muestra tal cual.
- **(Recomendada) Mostrar el mensaje de la base cuando es uno de esos** (el
  `42501` del trigger, el `message` de `crear_turno_manual` con `success:
  false`) y el genérico de `content/mi-local.ts` para todo lo demás (la red,
  cero filas, lo inesperado). Costo: esas frases viven en BooKit; si se
  cambian allá, cambian acá.
- Copy propio para cada caso en `content/`. Para no comparar textos, la base
  tendría que devolver un código (como el `hint: ya_tiene_comercio` de
  `crear_mi_comercio`): una migración para el trigger y otra para
  `crear_turno_manual`.

## Orden de trabajo

Una rama desde `mi-local/fase-1` (o desde `main`, si el #45 ya se mergeó),
`mi-local/fase-2`, y un PR a `main`. Si D4 sale como la recomendada, antes
va un PR en BooKit.

0. **BooKit** (sólo con D4 recomendada): la migración de
   `servicios_del_profesional` con su `revoke`/`grant`, por el camino de
   siempre de BooKit. Tiene que estar en la base antes del paso 4.
1. **Lecturas:** el `select` de `leerTurnosDelDia` con lo del pago,
   `accionesDelTurno` y el copy nuevo.
2. **Cambiar el estado:** `cambiarEstado` en `app/mi-local/acciones.ts`, la
   ficha del turno (D2) y la confirmación de cancelar.
3. Te paso las pantallas de la ficha antes de seguir.
4. **Turno a mano:** la lectura de servicios (D4) y de horarios, la página
   `/mi-local/nuevo` (D6), `cargarTurno` y el botón "Cargar turno" en la
   agenda.
5. **Prueba** (abajo), `npm run typecheck` y `npm run build`.

## Cómo se prueba

El repo no tiene tests automáticos: se prueba con un local de prueba en el
preview, con la agenda abierta en dos pestañas y la app en el teléfono.

**Cambiar el estado**
- Un turno que ya empezó: Completar → "Completado", sube "Cobrado" y el
  cliente tiene los puntos en la billetera.
- Otro: Ausente → "Ausente", sin push.
- Un turno de mañana en efectivo: no ofrece completar; Cancelar pide
  confirmación, queda "Cancelado", al cliente le llega "El local canceló tu
  turno", el horario vuelve a estar libre en la app y, si usó un cupón, vuelve
  a la billetera.
- La otra pestaña y la app se actualizan solas (Realtime).
- Cancelar en una pestaña y después en la otra, que todavía no se actualizó:
  sale "Este turno ya está cerrado y no admite cambios."
- Mandar la acción a mano con el id de un turno de otro local: cero filas,
  error genérico, nada cambia.
- Mandar Completar sobre un turno de mañana salteando la pantalla: la base lo
  rechaza con "El turno todavía no empezó."
- **Mercado Pago:** cancelar un turno pagado devuelve plata de verdad. En la
  prueba se mira sólo que la confirmación diga el monto; la devolución real,
  si la querés probar, con un pago chico tuyo, como la prueba del débito.

**Turno a mano**
- Cargar uno para hoy: aparece en la agenda como "Pendiente", el horario deja
  de ofrecerse y al profesional con cuenta le llega "Te agendaron un turno".
- Un día sin horarios: el mensaje de vacío.
- Dos pestañas eligiendo el mismo horario: la segunda recibe "El horario se
  solapa con otro turno".
- Un profesional sin servicios asignados: el mensaje de que se asignan desde
  la app.

**Siempre**
- En gracia, todo anda; con el local cortado no se llega (lo tapa la fase 1) y
  `crear_turno_manual` igual lo rechaza.
- En el teléfono, a 375 px: la ficha y el formulario sin scroll de costado.

## Lo que vi y no toca este plan

- `BusinessCalendarRepository.actualizarEstadoTurno` no se entera si el
  update no tocó ninguna fila: la app cree que cerró el turno. Va para la app.
- `crear_turno_manual` no controla que `p_fin` sea inicio más la duración del
  servicio: confía en lo que manda el teléfono. Con D4, la web lo calcula con
  la duración de la base; arreglarlo en la función es otra migración en BooKit.
- La regla de precios por profesional está en SQL (`_oferta_de_servicios`) y
  en Dart (`precioDelProfesional`). Con D4, la app podría usar la función
  nueva y dejar de copiarla.
