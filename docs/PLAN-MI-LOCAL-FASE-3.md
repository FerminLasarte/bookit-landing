# Mi local en la web — fase 3: Gestión

> Aprobado por Fermín el 21 de octubre de 2026, con la recomendación de cada
> decisión **D1–D9**. Sale de la hoja de ruta de `docs/PLAN-MI-LOCAL.md`,
> decidida ese mismo día: horarios y descansos, servicios y equipo, y los
> **huecos libres** de la agenda con una función SQL en BooKit
> (`huecos_del_dia`), el D3 de la fase 1.

## Qué es la fase 3

El dueño arma su local desde la compu: **los horarios** de cada profesional,
con sus descansos y sus días especiales; **los servicios**, con precio, duración
y seña; y **el equipo**: sumar profesionales, invitarlos, darlos de baja y
decir qué servicios hace cada uno. Todo pasa por la base igual que desde la
app, con la sesión del dueño.

Y la agenda muestra **los huecos libres** del día, calculados por la base con
la misma regla que después va a usar la app.

**Queda afuera:** el perfil del local, las estadísticas, las promociones y las
recompensas (fase 4); las fotos (ver D9); los profesionales del equipo
entrando a la web (después de esta fase, como dice la hoja de ruta); publicar
disponibilidad como historia, que es de la app.

## Cómo lo hace hoy la app

Rutas relativas a `~/Desarrollo/GitHub/BooKit`.

### Dónde está

`BusinessWorkspaceScreen` (`lib/features/business/workspace/presentation/`) es
la pestaña **Gestión** del dueño, al lado de Agenda, Crecimiento y Perfil. Tiene
dos pestañas internas, **Servicios** y **Equipo**, y un "+" que crea un
servicio o suma un profesional. **Los horarios no tienen entrada propia:** se
abren desde el chip "Horarios" de cada profesional en Equipo. El personal no
ve esta pestaña: tiene su propio menú (`staff_bottom_nav_bar.dart`).

### Servicios

- **Lista** (`business_services_view.dart`): nombre, descripción, precio,
  "N min" y la seña; arriba, "N servicios · N con seña". Vacío: "Todavía no
  cargaste ningún servicio…". Sin categorías, fotos ni orden a mano.
- **Formulario** (`add_edit_service_screen.dart`): nombre, descripción
  (opcional), precio, duración y el bloque de seña (sí/no, porcentaje o monto
  fijo, valor). La seña sólo se ofrece si el plan incluye `cobro_mp`; si no,
  "Disponible en Pro".
- **Reglas, sólo en Dart:** nombre, precio y duración obligatorios; precio y
  duración mayores que cero; la seña mayor que cero, hasta 100 si es
  porcentaje y hasta el precio si es monto.
- **Dar de baja:** antes cuenta los turnos por venir del servicio ("Los N
  turnos que tiene reservados siguen en pie") y después `update({esta_activo:
  false})`.
- **Escrituras:** `servicios` insert y update directos
  (`BusinessServicesRepository`).

### Equipo

- **Lista** (`business_team_view.dart`): la tarjeta del dueño ("Admin"), los
  miembros, las invitaciones pendientes y el switch "Precios libres"
  (`comercios.permitir_precios_profesionales`).
- **Cada profesional:** chips "Horarios" y "Servicios", y el switch "Recibe
  turnos". Sólo la tarjeta del dueño se edita (nombre y foto). No hay borrar ni
  roles.
- **Sumar** (`add_professional_bottom_sheet.dart`), tres caminos:
  - "Agregarme": el dueño también atiende.
  - "Con su cuenta": invitación por mail, un insert en `invitaciones_equipo`.
  - "Sin cuenta": sólo el nombre, un insert en `profesionales`. "Su agenda la
    manejás vos desde tu teléfono."
- **Dar de baja y volver a activar:** `resumen_de_desactivar` dice cuántos
  turnos se cancelan, cuántos tienen cliente y cuántos se pagaron por Mercado
  Pago; después, `cambiar_actividad_profesional`. Desactivar cancela los turnos
  que vienen, avisa y devuelve lo pagado.
- **El tope del plan:** si no entra uno más, "Mejorar plan" o "Elegir quiénes
  siguen" (`elegir_profesionales_activos`).
- **Invitaciones:** "Reenviar" (`reenviar_invitacion`, sólo vencidas) y
  "Revocar" (delete).
- **Servicios de cada uno** (`assign_services_bottom_sheet.dart`): el dueño
  elige con chips. Sólo inserta los nuevos y borra los quitados, para no perder
  el precio y la duración propios.
- **Precio y duración propios:** **sólo los carga el profesional desde su
  cuenta** (`staff_services_provider.dart`). El dueño no puede, y un
  profesional sin cuenta no tiene quién se los cargue.

### Horarios y días especiales

- **Son por profesional.** No hay un horario del local: el del local es la suma
  del de su gente.
- **El modelo de la base:** cada fila de `config_agenda` es una franja de un día
  de la semana (`dia_semana` 1–7, `hora_inicio`, `hora_fin`, `modalidad`
  `con_turno` u `orden_llegada`, `intervalo_turnos`). **Un descanso no se
  guarda:** es el hueco entre dos franjas del mismo día.
- **La pantalla** (`ScheduleScreen`) tiene dos pestañas, Habitual y
  Excepciones.
  - El día se edita como lo piensa el local: abierto o cerrado, abre, cierra,
    descansos, modalidad, "Un turno cada" y "Repetir en" otros días.
  - `DiaAgenda` lo convierte a franjas.
- **Guardar** es `guardar_dias_agenda(p_profesional, p_dias, p_franjas,
  p_modalidad, p_intervalo)`, que borra esos días y vuelve a insertar.
- **Reglas, sólo en Dart** (`dia_agenda.dart`):
  - el cierre después de la apertura;
  - los descansos no se pisan y quedan a 30 min de la apertura y del cierre;
  - el intervalo es 15, 20, 30, 45, 60, 90 o 120.
  - La base no controla nada de esto (ver D3).
- **Días especiales** (`excepciones`): uno por fecha, por profesional.
  - La app crea "Día libre" (`dia_libre`, sin horas) o "Unas horas"
    (`bloqueo`). `horario_especial` se muestra pero no se crea.
  - No hay rangos: unas vacaciones son una fila por día.
- **Quién edita:** el dueño edita **sólo su propio horario**. El de cualquier
  otro profesional lo ve en sólo lectura (`business_schedule_screen.dart`,
  `editable: esMia`). Eso incluye al profesional sin cuenta: **nadie puede
  cargarle el horario** (ver "Lo que vi").

### Los huecos libres

- **Las funciones:** `rangosLibres` y `unirRangos`
  (`lib/core/utils/rangos_libres.dart`).
- **La cuenta:**
  - las ventanas son las franjas `con_turno` del día;
  - las ocupan los turnos que ocupan horario (todo menos cancelado y
    expirado), las excepciones con horas y los `turnos_bloqueados` viejos;
  - una excepción sin horas tapa el día;
  - un hueco que ya empezó arranca en el próximo paso de la grilla;
  - un hueco más corto que el servicio más corto del profesional no cuenta.
- **El local:** `AgendaHuecosLoader` pide las filas de cada profesional (cuatro
  consultas por cada uno) y une los huecos de todos. Un momento está libre si
  alguno lo tiene libre.
- **Si el día se atiende:** también dice `conHorario`, `ordenDeLlegada` o
  `noAtiende`. El local atiende si atiende alguno.
- **Dónde se usa:** la agenda del dueño y la del personal ("Libre · Hasta las
  HH:mm", con "Publicar"), y la historia de disponibilidad.
- **El día vacío** (`AgendaDiaLibre`) dice por qué: "El local no atiende este
  día", "Por orden de llegada", "Hoy ya no quedan horarios", "Sin horarios
  libres".
- **En SQL** sólo existen los **inicios** libres (`_inicios_libres`, detrás de
  `horarios_libres_del_profesional`), con las mismas fuentes más el "hueco
  muerto". **Ninguna función devuelve rangos**, y `huecos_del_dia` no existe.

## Lo que controla la base

Migraciones en `BooKit/supabase/migrations`. Las tablas base no se crean en
ninguna migración: sus columnas salen de `docs/schema-tablas.md`.

| Tabla | Quién escribe (política) | Triggers y controles |
|---|---|---|
| `config_agenda` | `gestiona_profesional(id_profesional)`: el dueño de cualquiera de los suyos, o el propio profesional | Ninguno. `hora_fin > hora_inicio` y `dia_semana` 1–7 son `CHECK`. `guardar_dias_agenda` corre como quien llama y no valida franjas que se pisan ni el intervalo. |
| `excepciones` | `gestiona_profesional` | Ninguno. El `CHECK` de `modalidad` que dicen los docs (`turno`, `orden_llegada`, `cerrado`) no coincide con lo que guarda la app (`dia_libre`, `bloqueo`): hay que mirarlo en la base (paso 0). |
| `servicios` | `es_duenio_comercio(id_comercio)` | `trg_servicios_borrar_es_dar_de_baja`: un `delete` del dueño se vuelve `esta_activo = false`. No hay tope de servicios por plan ni `CHECK` de precio, duración o seña. |
| `profesionales_servicios` | `gestiona_profesional` | `trg_profesionales_servicios_del_mismo_local`: "El servicio no es del local del profesional." |
| `profesionales` | Alta: el dueño. Edición: el dueño o el propio, sólo `nombre`, `bio` y `foto_url` (grants por columna). Sin `delete`. | `trg_profesionales_dentro_del_tope`: "Tu plan incluye hasta N profesionales activos." (hint `tope_profesionales`). `trg_profesionales_solo_el_duenio_activa`. `esta_activo` sólo cambia por `cambiar_actividad_profesional` o `elegir_profesionales_activos`. |
| `invitaciones_equipo` | El dueño (insert, update, delete) | `trg_invitaciones_segun_el_plan` (hint `plan_sin_staff`), `tope_de_invitaciones` (20 por día, `54000`) y `enviar_correo_invitacion`, que manda el mail por la función `enviar-invitacion` con el link `somosbookit.com.ar/equipo?token=…`. |
| Storage `logos` | Cada uno sube **sólo su propia ruta** (`_es_mi_ruta_de_logos`): el dueño, la de su local y la de su ficha de profesional | Ver D9. |

Los topes de cada plan están en `niveles` (`esencial`, `pro`, `equipo`):
`tope_profesionales` (2, 5, sin tope), `cuentas_staff`, `cobro_mp` y
`precios_por_profesional`. `comercios.precios_libres` es el valor que vale (el
switch y el nivel), mantenido por un trigger. **No hay tope de servicios.**

Lo mismo que en la fase 2: **todo esto corre sólo con la sesión del dueño.**
Los triggers que convierten el borrado en baja, controlan el tope o quién
activa miran `current_user`: con la service role no corren.

## Lo que se reusa y lo que se suma en la web

**Se reusa:**

- **El marco** (`MarcoDelPanel`) y las secciones de `miLocal.panel.secciones`:
  se suman ahí (ver D1). `SeccionesDelPanel` ya marca la sección de lo que
  cuelga de ella.
- **`leerMiLocal()` y `daAcceso()`:** cada página y cada acción vuelven a
  preguntar, como la agenda.
- **`leerProfesionales`** para elegir de quién son los horarios. Suma
  `auth_user_id` para saber quién tiene cuenta (D2).
- **El patrón de las acciones** de `app/mi-local/acciones.ts`:
  - zod para la forma;
  - `clienteDeSupabase("local")`;
  - cero filas es error;
  - el mensaje de la base cuando es para personas (D7 de la fase 2);
  - `refresh()` o `redirect` al final;
  - `useActionState` en el formulario
    (`node_modules/next/dist/docs/01-app/02-guides/forms.md`).
- **El kit:** `Dialogo` para editar un día y confirmar bajas, `Field`,
  `Button`, `Badge`, `Superficie`, `Plegable`. Las píldoras de profesional de
  la agenda, para elegir de quién son los horarios.
- **`leerMiPlan()`** ya trae el nivel del local. `niveles` se lee con la sesión
  (`lib/planes.ts` ya lo hace) para saber qué incluye el plan.

**Se suma:**

```
app/mi-local/(panel)/
  horarios/page.tsx            ?profesional=…  la semana y los días especiales
  servicios/page.tsx           la lista
  servicios/nuevo/page.tsx     crear
  servicios/[id]/page.tsx      editar y dar de baja
  equipo/page.tsx              el equipo, las invitaciones y "Precios libres"
  equipo/[id]/page.tsx         un profesional: sus servicios, su precio y duración propios
lib/mi-local/gestion.ts        las lecturas (server-only)
app/mi-local/acciones/         las acciones, partidas por sección (turnos, horarios, servicios, equipo)
```

- **Las acciones, una por escritura de la app:**
  - **Horarios:** `guardarDias`, y crear, editar y borrar un día especial.
  - **Servicios:** `guardarServicio` y `darDeBajaServicio`.
  - **Equipo:**
    - `sumarProfesional`, `invitar`, `reenviarInvitacion` y
      `revocarInvitacion`;
    - `cambiarActividad`, con el resumen antes, y `elegirQuienesSiguen`;
    - `asignarServicios`, con la misma diferencia que la app, y
      `precioYDuracionPropios` (D2);
    - `preciosLibres`.
- **Un ayudante común para las acciones.** Hoy `cambiarEstado` y `cargarTurno`
  repiten "leer el local, mirar el acceso y traducir el error de la base". Con
  diez acciones más, eso va a un solo lugar.
- **Los bloqueos del plan:** se muestra lo que el plan no incluye, como en la
  app ("Disponible en Pro" y un enlace a `/planes`). La base igual lo rechaza.
  Los hints `tope_profesionales` y `plan_sin_staff` se traducen a copy de
  `content/mi-local.ts`. Es leer un código, no copiar la regla.
- **El copy:** todo en `content/mi-local.ts`, con las frases de la app donde las
  hay.

**No se copia de la app:**

- **La sugerencia del descanso** (13:00, 60 o 30 min) y el margen de 30 min:
  son comodidades de la pantalla, no reglas de la base. El formulario web
  ofrece las horas cada 30 min y la base decide lo demás (D3).
- **El cambio optimista y la vuelta atrás:** la página se relee en el servidor,
  como en la fase 2.

## La función de los huecos

**La decisión de la hoja de ruta:** una función SQL en BooKit que use la web y
después la app, para que la regla de "qué está libre" viva en un solo lugar. La
propuesta (D4 y D5 tienen las alternativas):

```sql
huecos_del_dia(p_comercio uuid, p_fecha date) returns jsonb
-- {
--   "local":         { "atencion": "con_horario", "huecos": [{ "inicio": …, "fin": … }] },
--   "profesionales": { "<id>": { "atencion": "no_atiende", "huecos": [] }, … }
-- }
```

- **Seguridad:** `security definer`, con `revoke` a `public`/`anon` y `grant` a
  `authenticated` (lo nuevo nace cerrado desde 20260925230000).
- **Qué devuelve:**
  - sólo los profesionales activos del local que quien llama
    `gestiona_profesional`. El dueño ve a todos; el día que el personal entre a
    la web, cada uno se ve a sí mismo con la misma función y sin cambiarla.
  - "local" es la unión de esos.
- **La regla es la de `rangosLibres`:**
  - las ventanas `con_turno` del día, en `zona_horaria_bookit()`;
  - menos lo ocupado (los turnos que ocupan, las excepciones y los
    `turnos_bloqueados`);
  - lo que ya empezó, desde el próximo paso de la grilla;
  - fuera lo más corto que el servicio más corto.
- **La unión** con `range_agg` sobre `tstzmultirange` (Postgres 14 o más;
  `supabase/config.toml` dice 17, y se confirma en el paso 0).
- **`atencion`** es la de `AgendaHuecosLoader`: con un día sin huecos ni turnos,
  la agenda dice por qué (D7). Lo que depende de la fecha ("ya pasó", "hoy ya
  no quedan") lo sigue diciendo la pantalla.
- **Se lee junto con los turnos del día**, en paralelo. Cuando un turno cambia,
  `EnVivo` recarga la página y los huecos se recalculan. Un cambio de horario
  hecho desde la app se ve al volver a la pestaña.

**Costo en BooKit:**

- **Una migración** con `huecos_del_dia`, lo que salga de D3 y D5, y su
  `revoke`/`grant`.
- **Se prueba como `servicios_del_profesional`:** un Postgres de Supabase vacío,
  con las tablas mínimas y las funciones reales de las que depende.
- **El cambio en la app** (D6): `AgendaHuecosLoader` y la historia de
  disponibilidad llaman a la función. Se borran `rangosLibres`, `unirRangos` y
  la parte de `ManualBookingDaySlots` que arma los `libres`; las cuatro
  consultas por profesional pasan a ser una por día. La carga manual no cambia:
  ya usa `horarios_libres_del_profesional`.
- **Mientras la app vieja siga instalada,** la cuenta vive en SQL y en Dart.
  Las dos tienen que dar lo mismo; la prueba lo compara.

## Decisiones tuyas

**D1 · Dónde va Gestión en el panel.**
- **(Recomendada) Tres secciones nuevas en la barra: Horarios, Servicios y
  Equipo.**
  - En la compu sobra lugar.
  - El local de una sola persona, que es el más común, encuentra sus horarios
    sin pasar por Equipo.
  - Horarios abre con el dueño elegido (o el único profesional) y píldoras para
    cambiar de profesional, las mismas de la agenda.
  - Costo: con cuatro secciones, el teléfono pasa a pestañas abajo, como ya dice
    el plan del panel. Es una pieza nueva, y el menú ☰ queda para el plan y
    salir.
- **Una sola sección "Gestión"** con pestañas Servicios y Equipo, y los
  horarios dentro de cada profesional, como la app.
  - Es igual a la app y el teléfono sigue con el menú.
  - Pero los horarios quedan a dos clics, en la herramienta donde más se van a
    tocar.

**D2 · Qué edita el dueño de cada profesional.** La base deja que el dueño
edite todo de cualquiera de los suyos (horarios, días especiales, precio y
duración propios, nombre y bio). La app sólo le deja lo suyo.
- **(Recomendada) Lo suyo y lo de los profesionales sin cuenta. A los que
  tienen cuenta, en sólo lectura.**
  - Respeta que el que tiene cuenta maneja su agenda, como en la app.
  - Arregla el hueco de la app: hoy nadie puede cargar el horario ni el precio
    propio de un profesional sin cuenta.
  - Costo: la web hace algo que la app no hace. Queda anotado para la app.
- **Igual que la app: sólo lo suyo.** El profesional sin cuenta sigue sin
  horario.
- **Todo lo que la base deja.** El dueño puede pisar el horario que un
  profesional con cuenta armó para sí.

**D3 · Las reglas que hoy sólo están en Dart.** Las franjas que no se pisan y el
intervalo de la lista, para el horario. Precio y duración mayores que cero y la
seña dentro del precio, para el servicio. La base acepta cualquier cosa que
cumpla los `CHECK` de las columnas.
- **(Recomendada) Llevarlas a la base en la misma migración de los huecos.**
  - `guardar_dias_agenda` rechaza las franjas que se pisan, el intervalo fuera
    de la lista y la modalidad desconocida, con un mensaje para personas.
  - `servicios` suma `CHECK` de precio, duración y seña. Van con `not valid`,
    después de mirar que las filas de hoy cumplan.
  - La web sólo valida la forma con zod y muestra el mensaje de la base.
  - Costo: una migración más grande, y la app sigue con su copia en Dart hasta
    que se toque.
- **Copiarlas a zod.** No toca la base, pero es la tercera copia, en otro
  idioma, y el que guarda desde otro lado (un script, la consola) sigue sin
  control.

**D4 · La forma de `huecos_del_dia`.**
- **(Recomendada) Una llamada por día para todo el local**, con los huecos de
  cada profesional y los del local ya unidos (arriba).
  - La agenda filtra por profesional en el navegador (D6 del plan del panel):
    con todo en una respuesta, filtrar sigue siendo instantáneo.
  - La unión queda en SQL.
- **Una función por profesional** (`huecos_del_profesional`) que devuelva
  filas `(inicio, fin)`.
  - Es más simple de escribir.
  - Pero la agenda haría una llamada por profesional, y la unión de "Todos" se
    copiaría en TypeScript: la misma regla que `unirRangos`, otra vez.

**D5 · ¿Se toca `_inicios_libres`?** Los huecos y los inicios libres (la reserva
del cliente y la carga manual) leen lo mismo: franjas, turnos, excepciones y
`turnos_bloqueados`.
- **(Recomendada) Sí: lo que ocupa un día pasa a una función privada,
  `_ocupado_del_dia(p_profesional, p_fecha)`, que usan las dos.**
  - Una sola definición de "ocupado" en la base.
  - Costo: se toca la función de la que depende la reserva del cliente. Se
    prueba que `_inicios_libres` devuelva exactamente lo mismo antes y después,
    con un set de casos, en el Postgres de prueba.
- **No: `huecos_del_dia` lee lo suyo y `_inicios_libres` queda como está.** No
  hay riesgo para la reserva, pero la regla de "ocupado" queda escrita dos
  veces en SQL (más la de Dart, hasta D6).

**D6 · Cuándo deja la app de calcular los huecos.**
- **(Recomendada) En esta fase, un PR en BooKit después de la migración.**
  `AgendaHuecosLoader` y la historia de disponibilidad llaman a
  `huecos_del_dia`, y se borra la cuenta en Dart.
  - Costo: una versión nueva en las tiendas, y dos copias mientras haya
    teléfonos con la versión vieja.
- **Más adelante**, con los profesionales en la web o en una tarea aparte de
  BooKit. La web no espera a nadie, pero las dos copias quedan sin fecha de
  fin.

**D7 · Los huecos en la agenda web.**
- **(Recomendada) Como en la app:**
  - filas "Libre · de 15:30 a 17:00" entre los turnos, que se esconden con un
    filtro de estado;
  - el día vacío dice por qué, con las frases de `AgendaDiaLibre`;
  - "Publicar" no va, porque es de la app. **Tocar un hueco lleva a "Cargar un
    turno"** con el día y el profesional ya elegidos.
- **Sólo el resumen** ("3 huecos libres") arriba de la lista, sin filas. Menos
  pantalla, pero no se ve dónde.

**D8 · Los días especiales.**
- **(Recomendada) Como la app (un día libre o unas horas), más "del … al …"
  para el día libre:** unas vacaciones de dos semanas son un formulario y no
  catorce.
  - Es una fila por día, como guarda la app, con un tope de 60 días.
  - El formulario avisa que los turnos de esos días no se cancelan solos.
  - Costo: un campo más. La app sigue viendo lo mismo: catorce filas.
- **Igual que la app, un día por vez.**

**D9 · Las fotos (del profesional y, en la fase 4, el logo).**
- **(Recomendada) Afuera de la fase 3.** Van con Perfil, en la fase 4, donde se
  sube el logo: una sola pieza de subida para las dos.
  - Además, la política de Storage sólo deja subir la foto propia. La del
    profesional sin cuenta necesita una migración.
  - Costo: el equipo se ve con iniciales hasta entonces, salvo las fotos que ya
    se subieron desde la app.
- **Sumar ahora la foto del dueño**, sin la de los demás. Es la mitad de la
  pieza, en dos fases.

## Orden de trabajo

Una rama `mi-local/fase-3` y **dos PRs** a `main`, para que cada uno se pueda
mirar: Servicios y Equipo primero, y Horarios con los huecos después. El
trabajo de BooKit va en un worktree desde `develop`, porque el checkout suele
tener trabajo sin commitear.

0. **Mirar la base, sólo lectura y con tu OK:**
   - la versión de Postgres y el `CHECK` real de `excepciones.modalidad`;
   - el grant de `comercios.permitir_precios_profesionales` para
     `authenticated`;
   - que las filas de `servicios` y `config_agenda` cumplan lo de D3.
   *Hecho el 21-oct-2026:*
   - Postgres 17.6.
   - `excepciones.modalidad` es `bloqueo | dia_libre | horario_especial`.
   - `authenticated` puede cambiar `permitir_precios_profesionales`.
   - Todas las filas cumplen las reglas nuevas.
1. **BooKit, la migración:** `huecos_del_dia`, `_ocupado_del_dia` (D5) y las
   reglas de D3. Se prueba en el Postgres vacío. Va a la base con tu OK, como
   la fase 2.
   *Hecho: FacuAntivero/BooKit#84* (`20261022120000_huecos_del_dia.sql`).
   - Además de `_ocupado_del_dia`, quedaron en una sola función cada una las
     franjas del día, el servicio más corto y la excepción que toma el día.
   - Las reglas de D3 son triggers con mensaje para personas (22023), no
     `CHECK`: un `CHECK` contesta con un texto técnico.
   - Aplicada a la base el 22-oct-2026 con OK de Fermín.
2. **Web, Servicios:**
   - las lecturas, la lista, crear, editar y dar de baja;
   - la seña según el plan;
   - la sección en el marco y las pestañas del teléfono (D1).

   *Hecho el 22-oct-2026, en la rama `mi-local/fase-3`:*
   - Servicios está en la barra.
   - Las pestañas de abajo en el teléfono llegan con la tercera sección, en el
     paso 3, como dice el plan del panel.
   - Las acciones van al lado de su página, con dos ayudantes nuevos:
     `mensajeDeLaBase` (`lib/mi-local/errores.ts`) y `leerLocalQueEntra`.
   - `cambiarEstado` y `cargarTurno` pasan a usar `leerLocalQueEntra` cuando
     se mergee `mi-local/sin-p-fin`, que toca esas mismas líneas.
3. **Web, Equipo:**
   - el equipo y las invitaciones;
   - sumar, invitar, reenviar y revocar;
   - dar de baja con su resumen, y elegir quiénes siguen;
   - los servicios de cada uno y "Precios libres".
   Te paso las pantallas y **primer PR**.
4. **Web, Horarios:**
   - la semana, el editor del día en un `Dialogo` y "Repetir en";
   - los días especiales (D8);
   - lo que edita el dueño según D2.
5. **Web, los huecos en la agenda** (D7). Te paso las pantallas y **segundo
   PR**.
6. **BooKit, la app** (D6): un PR aparte a `develop`.

## Cómo se prueba

No hay tests automáticos en la web. Se prueba en el preview con Barbería Nogal,
la app abierta en el teléfono para ver que las dos dicen lo mismo, y
`npm run typecheck` y `npm run build`.

**Los huecos (BooKit)**

En el Postgres de prueba, casos armados contra lo que da `rangosLibres` hoy:
- un día de corrido;
- con descanso;
- con un turno en el medio y uno pegado al cierre;
- con una excepción de unas horas y con un día libre;
- con `turnos_bloqueados` viejos;
- `orden_llegada`;
- hoy a media tarde (el próximo paso);
- dos profesionales que se pisan (la unión);
- un profesional sin servicios (30 min).

Con D5, el mismo set contra `_inicios_libres` antes y después: tiene que dar
igual.

**Servicios**
- Crear uno con seña en un local Pro y ver que la seña no se ofrece en uno
  Esencial.
- Editarlo y verlo cambiado en la app.
- Darlo de baja con turnos por venir: avisa cuántos y los turnos siguen.
- Con D3, mandar una seña mayor que el precio salteando la pantalla: la base
  la rechaza con su mensaje.

**Equipo**
- Sumar uno sin cuenta hasta el tope del plan: el que sobra recibe el mensaje
  del tope con "Mejorar plan".
- Invitar a un mail tuyo: llega el mail y el link abre la app.
- Reenviar una vencida y revocar.
- Dar de baja a uno con turnos por venir: el resumen dice cuántos se cancelan,
  y los clientes reciben el aviso. **La devolución de Mercado Pago se
  posterga**, como en la fase 2.
- Asignar y quitar servicios sin perder el precio propio.

**Horarios**
- Armar lunes a viernes con descanso y "Repetir en": la app muestra lo mismo.
- Con D3, franjas que se pisan desde la acción a mano: la base las rechaza.
- Un día libre de una semana (D8): siete filas y la agenda dice "No atendés
  este día".
- Según D2: el horario de un profesional con cuenta no ofrece editar.

**La agenda**
- Los huecos coinciden con los de la app, con "Todos" y con cada profesional.
- Cargar un turno desde un hueco: el hueco se achica.
- Con un filtro de estado no hay huecos.

**Siempre**
- 375 px y 1280 px, claro y oscuro, sin scroll de costado.
- El local en gracia anda; el cortado no llega.

## Lo que vi y no toca este plan

- **La app no deja cargar el horario ni el precio propio de un profesional sin
  cuenta.** `BusinessScheduleScreen` sólo edita si el profesional es el dueño,
  y el precio y la duración propios sólo se editan desde la cuenta del
  profesional. La base lo permite. Si D2 sale como la recomendada, la web lo
  resuelve; la app queda para una tarea de BooKit.
- **`docs/schema-tablas.md` no coincide con la app** en `excepciones.modalidad`.
  Se mira en el paso 0 y se corrige el doc en el PR de BooKit.
- **`config_agenda.fecha_desde` y `fecha_hasta`** no las usa nadie, ni la app
  ni las funciones. Quedan como están.
- **`crear_turno_manual` no mira el horario ni los días especiales** (ya
  anotado en la fase 2). Un turno a mano puede caer en un día libre. Con los
  huecos a la vista se nota menos, pero la base no lo frena.
