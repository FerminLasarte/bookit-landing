# Mi local — la pausa del local

> **Aprobado por Fermín el 5 de noviembre de 2026**, con la recomendada de cada
> decisión D1–D7. Se implementa en la rama `mi-local/plan-pausa`.

> Borrador del 5 de noviembre de 2026, para que Fermín apruebe las decisiones
> **D1–D7**. Es la fila "La pausa del local" de "Para más adelante" en
> `docs/PLAN-MI-LOCAL.md`, y la D4 de `docs/PLAN-ADMIN-V5.md`. Parte de `main`
> con la v5 del panel ya adentro (#93–#96, mergeados el 5/11).

## Qué es

El dueño pausa su local desde la compu: entre dos días o desde un día sin
fecha de vuelta. Esos días el local no aparece en Bookit ni toma turnos, y los
turnos que ya había se cancelan, con aviso al cliente y devolución de lo
pagado. Después puede cambiarle las fechas a la pausa o volver antes. Hoy esto
se hace sólo desde la app.

**No le pide nada a la base.** Todo está en producción desde el 24 de octubre
(BooKit `docs/pausa-del-local.md`, migraciones `20261024010000`,
`…010100` y `…010200`). La web se adapta al contrato; no decide nada que esté
ahí.

**Queda afuera:**
- el aviso de vacaciones que la app ofrece después de pausar (D6);
- la página pública del local en pausa ("Vuelve el 10 de enero", sección 4 del
  contrato): es de la landing, no de `/mi-local`, y va aparte si se quiere;
- cualquier cambio en la app o en la base.

## Cómo lo hace hoy la app

Rutas relativas a `~/Desarrollo/GitHub/BooKit`, en `origin/develop` (5117177e).

- **La fila**, en la pestaña Perfil del dueño
  (`business_profile_screen.dart`, `_buildPausaTile`), entre "Compartir
  disponibilidad" y "Recibir pagos": "Pausar el local · Vacaciones, reformas,
  un cierre". Con una pausa, "Pausa del local" y la cuenta: "En pausa hasta
  el 9 de enero", "En pausa, sin fecha de vuelta" o "Se pausa el 2 de enero".
- **El cartel**, arriba de la agenda (`shared/pausa/cartel_de_pausa.dart`),
  mientras la pausa dura o está programada. El dueño lo toca y abre la hoja;
  el staff sólo lo lee ("El local está en pausa · Vuelve a aparecer el 10 de
  enero").
- **La hoja** (`business/pausa/presentation/pausa_sheet.dart`): "Con vuelta /
  Sin fecha"; las filas "Desde" y "Hasta" (el último día cerrado) con un
  selector de fecha; la nota "Volvés a aparecer el 10 de enero." o "Volvés
  cuando quieras, desde acá."; y, si hay, la lista "Se cancelan 3 turnos" (día,
  hora, cliente, servicio), que se vuelve a pedir cada vez que cambia una
  fecha. Al guardar, si hay turnos, un diálogo: "¿Cancelar 3 turnos?" ·
  "Revisar" / "Pausar y cancelar". Con una pausa ya armada, el título es "Tu
  pausa", el botón "Guardar cambios" (apagado si no cambió nada) y abajo
  "Volver ahora" (o "Sacar la pausa" si no empezó), **sin confirmación**. Si
  la pausa ya empezó, "Desde" no se toca.
- **La agenda**: un día de la pausa dice "El local está en pausa · Este día
  no se toman turnos." (lee `local.en_pausa` de `huecos_del_dia`), para el
  dueño y para el staff.
- **El turno a mano** en un día de pausa pregunta "¿Lo cargás igual?" con
  "Ese día el local está en pausa." (motivo `en_pausa` de
  `crear_turno_manual`).

## Lo que controla la base

- Sólo el dueño: `turnos_en_la_pausa`, `pausar_mi_local` y `terminar_pausa`
  empiezan por `es_duenio_comercio` (`no_es_duenio`). La web no ofrece la
  pausa a nadie más, pero no es la que cuida.
- Las fechas: `desde` desde hoy y hasta 90 días; `hasta` el mismo día o
  después; una pausa empezada no mueve su `desde`. La web pone los mismos
  límites en los campos para no dejar elegir lo que se va a rechazar, y
  muestra el mensaje de la base si igual llega.
- Cancelar, avisar al cliente y devolver lo pagado: lo hace
  `pausar_mi_local` en la misma transacción, con el trigger y
  `fn_devolver_al_cancelar` de siempre.
- Los días cerrados en la agenda, los listados y la reserva: la base, sola.
- La push "Mañana termina tu pausa": un job de la base.

## Quién ve qué

| | Dueño | Profesional del equipo |
|---|---|---|
| El bloque "Pausa del local" en Perfil y su página | Sí | No (D5) |
| El cartel arriba de la agenda | Sí, con enlace a la pausa | Sí, sólo para leer |
| Un día de la pausa en la agenda | "El local está en pausa" | Igual |
| Cargar un turno a mano un día de la pausa | Pregunta y deja cargarlo | Igual |

## Decisiones tuyas

**D1 · Dónde va la pausa.**
- **(Recomendada) En Perfil**, como en la app: un bloque "Pausa del local" al
  pie del Perfil del dueño, con el estado ("Pausar el local · Vacaciones,
  reformas, un cierre", o "En pausa hasta el 9 de enero", etc.) y un botón que
  lleva a su página, `/mi-local/perfil/pausa`. La sección marcada sigue siendo
  Perfil. Además, el cartel arriba de la agenda, como en la app. No suma una
  sección ni toca el marco del panel (`components/ui/MarcoDePanel.tsx`, que
  comparte con `/admin` desde el #93).
- En Gestión, arriba de Horarios: la pausa cierra días, como los días
  especiales. Pero Horarios es por profesional y la pausa es del local entero,
  y el dueño que la busca donde está en la app no la encuentra.
- Una sección propia: una séptima entrada en la barra para algo que se usa
  dos o tres veces por año, y toca el marco que ahora comparten los dos
  paneles.

**D2 · Cómo se eligen las fechas.**
- **(Recomendada) Los campos de fecha del navegador**, como en Días especiales
  (`<input type="date">`): "Con vuelta / Sin fecha" con el `ElegirUno` de
  Horarios, "Desde" (de hoy a hoy + 90) y, con vuelta, "Hasta" con la ayuda
  "El último día cerrado" (desde "Desde" en adelante). Debajo, la nota de la
  app: "Volvés a aparecer el 10 de enero." o "Volvés cuando quieras, desde
  acá.". "Desde" arranca en hoy, como en la app: si hoy hay turnos, la lista
  de D3 los muestra antes de nada. Con la pausa empezada, "Desde" se ve
  pero no se edita.
- Un calendario propio para marcar el rango de una vez: más lindo, pero es un
  componente nuevo del kit, con su teclado y su accesibilidad, para una
  pantalla que se usa poco.

**D3 · Cómo se avisa cuántos turnos se cancelan.**
- **(Recomendada) La lista en la página y el diálogo al guardar, como la
  app.** Las fechas viven en la URL (`?desde=2027-01-02&hasta=2027-01-09`, o
  `&sin=1`): la página lee `turnos_en_la_pausa` en el servidor y muestra "Se
  cancelan 3 turnos" con día, hora, cliente ("Sin nombre" si no vino),
  servicio y profesional, y la nota "Les avisamos a tus clientes y les
  devolvemos lo que pagaron por Mercado Pago. Si querés salvar alguno,
  reprogramalo antes.". Con JavaScript, cambiar una fecha cambia la URL y la
  lista se actualiza sola; sin JavaScript, un botón "Ver los turnos" manda el
  formulario. Al guardar con turnos, el `Dialogo` del kit: "¿Cancelar 3
  turnos?" · "Revisar" / "Pausar y cancelar" (sin JavaScript, el botón ya dice
  "Pausar y cancelar 3 turnos").
  **Un cuidado más que la app:** la acción vuelve a pedir la lista justo antes
  de pausar y la compara con la que se vio (van los ids en el formulario). Si
  entró un turno nuevo en esas fechas mientras se miraba, no pausa: muestra la
  lista nueva con "Entró un turno en esas fechas. Revisalo antes de pausar.".
  La base cancela lo que hay al confirmar, no lo que se vio.
- Sólo la cantidad, en el diálogo: más simple, pero el dueño no sabe a quién
  le cancela ni puede reprogramar alguno antes.

**D4 · Cambiar las fechas y "Volver ahora".**
- **(Recomendada) La misma página, con la pausa cargada, como la hoja de la
  app.** Título "Tu pausa", botón "Guardar cambios" (apagado si las fechas son
  las mismas, para no llegar a `sin_cambios`) y, debajo, "Volver ahora" si ya
  empezó o "Sacar la pausa" si no, **sin confirmación**, como la app: no
  cancela nada y se vuelve a pausar en un minuto. Estirar la pausa muestra los
  turnos nuevos que caen adentro (D3). Al volver, el aviso de la página dice
  "Tu local volvió a Bookit" o "Sacamos la pausa"; al guardar, "Tu local quedó
  pausado", "Pausa guardada" o "Listo. Cancelamos 3 turnos", con el número que
  devuelve la base.
- Con un diálogo antes de "Volver ahora": protege de un clic sin querer, pero
  la app no lo tiene y el error se arregla pausando de nuevo.

**D5 · Qué ve un profesional del equipo.**
- **(Recomendada) Lo mismo que en la app: el cartel arriba de su agenda, sólo
  para leer** ("El local está en pausa · Vuelve a aparecer el 10 de enero", o
  "Pausa programada · Del 2 al 9 de enero no aparece ni toma turnos"), y los
  días de la pausa con "El local está en pausa". En "Mi perfil" no hay nada, y
  si entra a `/mi-local/perfil/pausa` con el enlace vuelve a Perfil. La pausa
  se lee como la app: `profesionales` → `comercios(pausa_desde,
  pausa_hasta)`.
- Nada: ni cartel ni texto en el día. Ve sus días vacíos sin saber por qué,
  y la app sí se lo dice.

**D6 · El aviso de vacaciones después de pausar.**
- **(Recomendada) No en esta tanda.** La app, al crear una pausa con vuelta,
  ofrece armar el aviso a los clientes con esas fechas (idea 10). La web no
  tiene los avisos del local, y el contrato lo deja como opcional. Va anotado
  para cuando la web los tenga.
- Una línea al pie después de pausar: "Si querés avisarles a tus clientes,
  armá el aviso desde la app.". Barato, pero manda al teléfono desde la
  compu.

**D7 · Cómo se prueba sin pausar un local real.**
- **(Recomendada) Con Barbería Nogal, la cuenta demo, entrando vos** (yo no
  escribo contraseñas), y en dos tiempos:
  1. **Sin efecto visible:** todo con una pausa **programada** a más de un mes,
     en días sin turnos de clientes. No saca a Nogal de los listados de hoy y
     no cancela nada de nadie. Para ver la lista de D3 con algo adentro, cargo
     un turno a mano "Prueba web (borrar)" sin cuenta de cliente en uno de esos
     días: sin cuenta no hay push, y sin pago no hay devolución.
  2. **Con efecto, sólo con tu OK en el momento:** una pausa que empieza hoy,
     para ver el cartel "en curso", la agenda y "Volver ahora". Saca a Nogal de
     los listados unos minutos. Antes de confirmar, la lista tiene que decir
     que hoy no se cancela ningún turno; si dice otra cosa, paro y te aviso.
  Cada cambio deja una fila en `comercios_cambios_de_pausa`, que se ve en la
  Historia de Nogal en `/admin`; quedan ahí salvo que le pidas a BooKit que
  las borre.
- Con una cuenta de dueño de prueba nueva: pide al chat de BooKit un local y
  una cuenta "(borrar)" que vos tendrías que activar para entrar, y no prueba
  nada que Nogal no pruebe.

## Lo que se reusa y lo que se suma en la web

- **Las cuentas de la pausa, una sola vez.** El panel ya las tiene en
  `components/admin/Pausa.tsx` (paso S de la v5, #95): `enCurso` y "la vuelta
  es `hasta` + 1" (con `sumarDias` de `lib/mi-local/vista.ts`). Para no
  tenerlas dos veces, este PR las mueve a `lib/pausa.ts` (el tipo `Pausa`,
  `pausaVigente` —ignora la que ya terminó—, `enCurso` y `vuelta`) y
  `Pausa.tsx` pasa a usarlas desde ahí, sin cambiar lo que muestra. Las fechas
  se escriben con `diaYMesDe` de `lib/formato.ts` ("21 de octubre" a partir de
  `2026-10-21`, sin que la zona lo corra), que ya está en `main`.
- **La lectura** (`lib/mi-local/pausa.ts`, `server-only`): la del dueño con
  `comercios.select('pausa_desde, pausa_hasta')` y la del profesional por
  `profesionales`, como `PausaRepository` de la app. Si falla, no hay cartel:
  la agenda ya muestra cada día de la pausa como cerrado (igual que la app).
- **Las acciones** (`app/mi-local/(panel)/perfil/acciones.ts`): `pausar` y
  `volver`, con `zod` para las fechas, y `revalidatePath("/mi-local",
  "layout")` para que la agenda y el cartel se enteren.
- **Los errores:** `mensajeDeLaBase` (`lib/mi-local/errores.ts`) ya muestra los
  `42501` y `22023` de la base. Suma `sin_cambios` y `sin_pausa`, que son
  `P0001`, por su pista (no todo `P0001`).
- **Los textos**, en un bloque `pausa` de `content/mi-local.ts`, con los de la
  app (sección 3 del contrato y la hoja). La web escribe "Bookit", como el
  resto del sitio, donde la app dice "BooKit".
- **El nombre:** `lib/mi-local/lugar.ts` ya usa `enPausa` para el profesional
  de un local con la suscripción cortada ("Espacio de trabajo en pausa"). Es
  otra cosa: lo nuevo se llama `pausaDelLocal` para no confundirlas.
- **El kit:** `Dialogo`, `Superficie`, `Field`, `ElegirUno`, `Button`,
  `RespuestaDeAccion`. Nada nuevo en `components/ui`.

## Orden de trabajo

Un solo PR desde `main`, un commit por paso.

1. **Las piezas:** `lib/pausa.ts`, `lib/mi-local/pausa.ts`, los textos y los
   errores.
2. **La página y el bloque en Perfil** (D1–D4): `/mi-local/perfil/pausa`, las
   dos acciones y el bloque al pie del Perfil del dueño.
3. **La agenda** (D5): el cartel arriba, para los dos, y el día de la pausa
   con "El local está en pausa · Este día no se toman turnos." (`Libres` suma
   `en_pausa`, que hoy la web no lee).
4. **El turno a mano:** `en_pausa` como tercer motivo de `FUERA_DE_HORARIO`,
   con "Ese día el local está en pausa." Hoy la web no lo conoce y lo muestra
   como un error sin dejar "Cargar igual", aunque la base lo permite.
5. **La prueba** (D7) y, al mergear, la fila de la pausa en
   `docs/PLAN-MI-LOCAL.md` pasa de "Para más adelante" a hecha.

## Cómo se prueba

En el preview, contra la base, con Nogal, dejando todo como estaba.

**Antes de tocar nada** anoto la pausa de Nogal (debería no tener ninguna
vigente) y miro en la agenda los días que voy a usar.

**Sin efecto visible (D7, 1)**
- Perfil: el bloque dice "Pausar el local". Abrir la página, "Con vuelta",
  elegir dos días a más de un mes: la nota dice el día de la vuelta.
- Cargar el turno "Prueba web (borrar)" en uno de esos días: la pregunta del
  turno a mano no salta (todavía no hay pausa). Volver a la pausa: la lista
  dice "Se cancela 1 turno", con su día, hora y servicio.
- Los límites: "Desde" ayer o a 91 días no se puede elegir; armado a mano en
  la URL y guardado, la base lo rechaza y se ve su mensaje.
- Pausar: el diálogo pregunta, "Revisar" no hace nada, "Pausar y cancelar"
  pausa. El aviso dice "Listo. Cancelamos 1 turno"; el turno queda cancelado
  en la agenda; el bloque dice "Se pausa el …"; la agenda muestra el cartel
  "Pausa programada" y esos días, "El local está en pausa".
- En la app abierta en el teléfono: la fila y el cartel dicen lo mismo.
- Cargar un turno a mano un día de la pausa: pregunta "Ese día el local está
  en pausa." y "Cargar igual" lo carga. Lo cancelo.
- Cambiar las fechas: "Guardar cambios" apagado sin cambios; estirar un día,
  guardar, "Pausa guardada". "Sin fecha": la nota cambia.
- Un turno que entra mientras se mira (D3): con la página abierta, cargo otro
  turno de prueba en esos días desde otra pestaña y guardo: no pausa y muestra
  la lista nueva.
- "Sacar la pausa": el bloque vuelve a "Pausar el local" y el cartel se va.
- Sin JavaScript: "Ver los turnos" actualiza la lista y el botón dice "Pausar
  y cancelar N turnos".
- En el teléfono (375 px): la página entra sin scroll de costado.
- La cuenta del equipo de Fermín en Nogal (activándola un rato con tu OK si
  quedó desactivada): con la pausa programada ve el cartel sin enlace, no ve
  el bloque en Mi perfil y `/mi-local/perfil/pausa` la devuelve a Perfil.
- `/admin`: la ficha de Nogal muestra cada cambio en su Historia.

**Con efecto, con tu OK (D7, 2)**
- Pausa desde hoy, con la lista en cero. El cartel dice "Tu local está en
  pausa"; "Desde" no se edita; "Volver ahora" la termina y el aviso dice "Tu
  local volvió a Bookit". Si vuelve el mismo día en que empezó, la base deja
  las dos fechas en null (ya pasó el 24/10, `docs/PLAN-ADMIN-V5.md`, paso S).

**Al final:** Nogal sin pausa, los turnos de prueba cancelados, y te paso la
lista de lo que quedó en la base para que BooKit lo borre si querés.

`npm run typecheck` y `npm run build` antes del PR.

### Resultados (5 de noviembre de 2026)

Implementado en cuatro commits (piezas, página y perfil, agenda, turno a
mano). `typecheck` y `build` pasan. Probado en el preview contra la base, con
la sesión del dueño de Nogal que ya estaba abierta.

**Anduvo (D7, 1):**
- La vista previa sin guardar: del 14 al 16 de diciembre, y desde hoy sin
  fecha (Nogal no tenía turnos por delante: "no se cancela ningún turno").
- Un turno a mano "Prueba web (borrar)" el 15/12 aparece en la lista, con
  día, hora, cliente, servicio y profesional.
- D3: con la página abierta cargué otro turno de prueba el 16/12 en otra
  pestaña; al confirmar, no pausó y mostró "Cambiaron los turnos…" con los
  dos.
- Pausar: "Revisar" cierra sin hacer nada; "Pausar y cancelar" pausó y dijo
  "Listo. Cancelamos 2 turnos.". Título "Tu pausa", "Guardar cambios" apagado
  sin cambios, "Sacar la pausa" (no había empezado).
- El bloque del Perfil ("Se pausa el 14 de diciembre."), el cartel "Pausa
  programada" arriba de la agenda y el 14/12 vacío con "El local está en
  pausa".
- Un turno a mano el 14/12: preguntó "Ese día el local está en pausa." y
  "Cargar igual" lo cargó.
- Cambiar la fecha actualiza la URL y la lista sola. Estirar al 17 mostró ese
  turno y lo canceló ("Listo. Cancelamos 1 turno."). "Sin fecha" guardó
  ("Pausa guardada.").
- Un "Desde" a más de 90 días, con el límite del campo sacado a mano: se ve
  el mensaje de la base.
- Sin JavaScript (mirando el HTML del servidor): el formulario va por POST y
  "Ver los turnos" es el primer botón, por GET.
- A 375 px, sin scroll de costado.
- "Sacar la pausa": "Sacamos la pausa.", el cartel se fue.
- `/admin`: la Historia de Nogal muestra los cuatro cambios.

**Falta:**
- **D7, 2**, la pausa que empieza hoy y "Volver ahora": espera tu OK.
- **El profesional del equipo** (cartel sin enlace, nada en Mi perfil, la
  página lo devuelve a Perfil): hace falta que entres con la cuenta del
  equipo.
- Sin JavaScript, haciendo clic: sólo se miró el HTML.
- Ver el cartel y la fila en la app del teléfono.

**Quedó en la base (Nogal):** tres turnos de prueba cancelados, sin cliente
ni pago ("Prueba web (borrar)" el 15/12 a las 10:00, "Prueba web (borrar) 2"
el 16/12 a las 11:00 y "Prueba web (borrar) pausa" el 14/12 a las 10:00), y
cuatro filas en `comercios_cambios_de_pausa`. Nogal, sin pausa.

## Lo que vi y no toca este plan

- La página pública del local en pausa (sección 4 del contrato): hoy la
  landing no dice nada y ofrece los horarios que da la base, que ya saltean la
  pausa. Decir "Vuelve el 10 de enero" es una mejora de la landing, aparte.
- El 5/11 Nogal figuraba visible en `/admin` aunque se había ocultado el
  23/10 (ya te lo dijo la sesión de la v5). No cambia esta prueba: la pausa
  saca al local de los listados igual.
