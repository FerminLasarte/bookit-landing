# Mi local en la web — fase 5: Crecimiento

> **Aprobado por Fermín el 22 de octubre de 2026**, con la recomendada de cada
> decisión D1–D7. D6 se volvió a decidir ese día, después del paso 0: la base
> no deja borrar un premio canjeado.

> Borrador del 22 de octubre de 2026, para que Fermín apruebe las decisiones
> **D1–D7**. Es la fila 5 de la hoja de ruta (`docs/PLAN-MI-LOCAL.md`), la
> última: estadísticas, cupones y recompensas.

## Qué es la fase 5

El dueño ve desde la compu **cómo le va al local** (lo facturado, los clientes
que vuelven, lo que no se hizo, cuándo se llena, cada profesional y cada
servicio) y maneja **las dos palancas para crecer**: los cupones de descuento y
el programa de puntos con sus premios. Es la pestaña **Crecimiento** de la app,
completa.

**Queda afuera:**
- ver los clientes uno por uno (la app no tiene una pantalla así);
- los canjes de cada cliente: el código `BOOK-…` que muestra el cliente se usa
  al reservar, no en Crecimiento;
- los premios por nivel de la billetera ("Próximamente" en la app): la columna
  `nivel_requerido` existe, pero nadie la edita;
- cualquier cambio en la app.

## Cómo lo hace hoy la app

Rutas relativas a `~/Desarrollo/GitHub/BooKit`, en `origin/develop` (efa447d).

### Dónde está

**Crecimiento** es la segunda pestaña del dueño (`pestanasDelComercio`, en
`business_bottom_nav_bar.dart`): Agenda · **Crecimiento** · Gestión · Perfil. Es
una sola pantalla, `BusinessStatsScreen` (`lib/features/business/stats/`): las
tarjetas de números y, al pie, dos filas (`_AccionesCrecimiento`) que abren
**Recompensas** y **Cupones**, cada una en su pantalla. Recarga cada vez que se
entra a la pestaña y al volver a la app.

**El profesional del equipo no tiene Crecimiento:** su barra es Turnos ·
Horarios · Servicios · Perfil (`pestanasDelStaff`).

### Los números (`business_stats_screen.dart`)

Todo sale de **una sola llamada**, `estadisticas_comercio(p_id_comercio,
p_meses)` (`business_stats_repository.dart`), que devuelve un JSON ya sumado:
`meses` (turnos, ingresos, cancelados, ausentes, clientes nuevos y
recurrentes, por mes y sin huecos), `servicios`, `profesionales` y `horarios`
(día ISO y hora). Las cuentas que hace la app encima están en
`business_stats.dart`:

- **"Facturado"**: el total del período en grande, "N turnos · ticket promedio
  $X" y, si hay dos meses cerrados, la variación del último cerrado contra el
  anterior ("12% · Sep contra Ago"; el mes en curso no se compara). Abajo, el
  gráfico de barras por mes, con un selector **Ingresos / Turnos**. Arriba a la
  derecha, el período: **3, 6 o 12 meses** (de entrada, 12).
- **"Tus clientes"** (si hubo alguno): cuántos volvieron y cuántos vinieron por
  primera vez, una barra con la proporción y "N% de tus clientes ya se había
  atendido antes" (o "Todavía nadie volvió: las recompensas sirven para eso.").
- **"Turnos que no se hicieron"** (si hubo): el % de lo reservado, cancelados y
  "No vinieron", y "Pedir seña baja los que no vienen…" si hubo ausentes.
- **"Cuándo se llena"**: un mapa de días (L a D) por franjas de tres horas desde
  la primera hora con turnos, más oscuro cuanto más lleno, con "Lo más lleno:" y
  "Lo más vacío: … · un buen hueco para un cupón".
- **"Por profesional"** (si hay más de uno) y **"Servicios"**: una barra por
  fila contra el primero, con turnos e ingresos (o el % de los turnos).
- Cada tarjeta tiene su ⓘ, que explica de dónde sale el número
  (`showStatsInfo`).
- Sin turnos: "Todavía no hay datos". Con error: "No pudimos cargar las
  estadísticas.".

Un turno prestado es uno **completado**, la misma regla que ya usa el panel para
"Cobrado" (`EstadoTurno.esIngreso`).

### Cupones (`lib/features/business/promotions/`)

- **La lista** (`promotions_list_screen.dart`): arriba "N cupones · N en uso ·
  N canjes"; los que sirven (activos y sin vencer: valen todo su último día),
  después **"Pausados por tu plan"** (ver abajo) y **"Sin efecto"** (pausados o
  vencidos). Cada uno es una tarjeta con forma de cupón: el código grande, el
  nombre interno chico, "Hasta el dd/mm" o "Venció el dd/mm", "Pausado", y el
  descuento en el talón. Vacía: "Todavía no hay cupones".
- **El formulario** (`create_promotion_screen.dart` y sus `widgets/`), para
  crear y editar:
  - Identificación: **nombre interno** y **código de canje** (se guarda en
    mayúsculas). "El nombre es para vos. El código es el que le pasás al
    cliente."
  - El descuento: **tipo** (porcentaje o monto fijo), **cuánto** (mayor a 0; el
    porcentaje hasta 100) y **límite de canjes** (vacío es sin límite).
  - Vigencia y alcance: **desde y hasta** (desde hoy, o la fecha de inicio si ya
    empezó, hasta un año), y **servicios** (ninguno elegido es todos).
  - Disponibilidad: **días** (al menos uno) y una **franja horaria** optativa
    (las dos horas o ninguna).
- **Las acciones**, en el menú de cada tarjeta: Editar, Pausar o Activar, y
  Eliminar ("se borra para siempre y los clientes que tengan el código ya no
  van a poder usarlo").
- **Escribe directo en la tabla** (`promotions_repository.dart`): `insert`,
  `update` y `delete` en `promociones`. Las reglas van en `reglas_json`:
  `tipo_descuento`, `valor_descuento`, `limite_usos_total`, `dias_validos`
  (ISO, 1 es lunes), `servicios_aplica` (ids como texto), `hora_inicio` y
  `hora_fin` ("HH:mm"). Al crear manda `id_tipo_promocion: 1`,
  `esta_activo: true` y `usos_contador: 0`; al editar no toca el contador.
- Errores: `23505` es "Ese código ya existe" (el código es único **dentro del
  local**); el del plan se muestra tal cual.

### Recompensas (`lib/features/business/rewards/`)

- **Arriba, una tarjeta de dos filas** (`rewards_management_screen.dart`):
  - **"Sistema de puntos"**, con un interruptor: "Tus clientes suman en cada
    visita" o "Nadie está sumando puntos". Es un `update` de
    `comercios.habilita_puntos`, sin confirmación.
  - **"¿Cómo funcionan los puntos?"**, que abre una hoja con las reglas (120
    puntos por hora de servicio, sólo con el turno completado, vencen a los 6
    meses, se pueden limitar días, horas y visitas, y el nivel "Próximamente").
- **Abajo, los premios**: "N premios · N para canjear" y una tarjeta por premio
  con su interruptor de activo. Con el programa apagado: "Programa apagado" y
  no se puede crear. Sin premios: "Sin premios todavía".
- **El formulario** (`create_reward_screen.dart` y sus `widgets/`):
  - El premio: **título**, **descripción** optativa (hasta 120 caracteres: "es
    lo que lee el cliente en el catálogo"), **beneficio** (servicio gratis,
    porcentaje o monto fijo; los dos últimos piden cuánto) y **servicios**.
  - Qué cuesta: **puntos** (mayor a 0) y **visitas previas** optativas.
  - Disponibilidad: días y franja, la misma pieza que el cupón.
  - Editar no reactiva un premio pausado.
- **Escribe directo en la tabla** (`rewards_repository.dart`):
  `recompensas_comercios`, con `id_servicios` como `integer[]` (vacío va
  `null`), `dias_validos` como JSON y las horas como `time`.
- Eliminar: "se borra para siempre y tus clientes dejan de verlo en el
  catálogo. Los canjes que ya hicieron no se tocan." (ver D6).

### Qué depende del plan del local

`niveles` tiene una columna por función (`20261003120000_niveles_de_plan.sql`),
y la app la lee en `PlanDelLocal` (`plan_del_local.dart`):

| | Esencial | Pro y Equipo | Quién lo frena |
|---|---|---|---|
| **Estadísticas** (`estadisticas_historial`) | Sólo el mes en curso | Todo el historial | **Sólo la app** (ver D4) |
| **Cupones** (`promociones`) | No se crean; los que hay quedan pausados | Sí | La base |
| **Puntos y premios** | Sí | Sí | — (están en los tres niveles) |

- **En Esencial, los números** piden un solo mes (`p_meses = 1`): "Facturado
  este mes", el gráfico y el mapa de horarios van **borrosos, con datos de
  muestra**, y un chip "Pro" que abre "mejorar el plan" ("Todo tu historial, en
  Pro · Mes por mes, con tus horarios pico").
- **En Esencial, los cupones:** "+" abre "mejorar el plan"; los vigentes van en
  "Pausados por tu plan · Vuelven solos si pasás a Pro", y en su menú "Ver
  planes" reemplaza a Editar y Activar. Eliminar sigue.

## Lo que controla la base

Migraciones en `BooKit/supabase/migrations`.

| Qué | Quién | Controles |
|---|---|---|
| `estadisticas_comercio` (`20261008140000`) | `security definer`, sólo `authenticated` | Deja pasar si **`auth.uid()` es el `p_id_comercio`**: da por hecho que el id del local es el de la cuenta del dueño (ver "Lo que vi"). `p_meses` entre 1 y 24. **No mira el nivel**: "las estadísticas se limitan sólo en la app" (`20261003140000`). |
| `promociones` | El dueño, todo (`es_duenio_comercio`, `20260908120000`); leer, cualquiera con sesión | Grants de tabla entera. Código único por local sin distinguir mayúsculas (`uk_promociones_codigo_local`). El trigger `trg_promociones_segun_el_plan` frena **sólo el `insert`** en un nivel sin promociones (`hint: plan_sin_promociones`). **`reglas_json` no tiene ningún `CHECK`**: la base guarda lo que le manden (D5). |
| Cupones al reservar | `_cotizar_turno` y `reclamar_promocion` | Aplican las reglas (días ISO, franja, servicios, tope de canjes con `usos_contador`) e **ignoran las del local sin promociones en su nivel**: así quedan "pausadas" sin tocarlas. |
| `recompensas_comercios` | El dueño, todo; leer, cualquiera con sesión | `costo_puntos > 0` y `nivel_requerido` de 1 a 4. Nada más: ni el valor según el tipo, ni la franja, ni los días (D5). |
| `comercios.habilita_puntos` | El dueño (grants por columna) | Sin esto el turno completado no suma puntos (`20260925190000`) y el local no sale en "Dónde canjear" (`20261021120000`). |
| Borrar | — | Las FK vienen de antes de las migraciones. En la base (paso 0): **borrar un premio borra en cascada los canjes de los clientes** (`canjes_usuarios`, también los disponibles, que se pagaron con puntos); borrar un cupón borra en cascada los guardados en las billeteras (`beneficios_usuarios`) y su historial de usos, y a los turnos que lo usaron les deja `id_promocion` en `null`. La base nunca frena un borrado (ver D6). |

Como en las otras fases: **todo corre con la sesión de quien entra**, nunca con
la service role.

## Quién ve qué

| | El dueño | El profesional con cuenta |
|---|---|---|
| Los números | Sí; en Esencial, el mes en curso (D4) | No: como la app, y `estadisticas_comercio` lo rechaza |
| Cupones | Sí; en Esencial, la lista y "Disponible en Pro" | No: la política es del dueño |
| Puntos y premios | Sí | No |

Para el profesional no aparece Crecimiento en la barra, y la URL lo manda a la
agenda (`leerLocalDelDuenio`), como el Perfil del local. Su barra sigue igual:
Agenda · Horarios · Servicios · Perfil, que es la de la app.

## Lo que se reusa y lo que se suma en la web

**Se reusa:**

- **El acceso:** `leerLocalDelDuenio` (`lib/mi-local/lugar.ts`) en las páginas,
  y `localParaActuar` (`lib/mi-local/acciones.ts`) en las acciones; `errorDe`,
  `mensajeDeLaBase` y `pideOtroPlan` (`lib/mi-local/errores.ts`), con
  `plan_sin_promociones` sumada a `PISTAS_DEL_PLAN`.
- **El plan:** `leerPlanDelLocal` (`lib/mi-local/gestion.ts`) ya lee `niveles` y
  arma "Disponible en Pro"; suma `promociones` y `estadisticasHistorial`. El
  nivel ya llega en `lugar.suscripcion.nivel` (`mi_plan_web()`).
- **Los servicios** para elegir dónde vale: `leerServicios`.
- **Los días de la semana:** `DIAS_DE_LA_SEMANA` (`lib/mi-local/horario.ts`),
  con el mismo orden ISO que usa la base.
- **El kit:** `Superficie`, `Badge`, `Button`, `Field`, `Dialogo`,
  `RespuestaDeAccion`, `useAccionQueCierra`, y el formato de pesos de
  `lib/formato.ts`.

**Se suma:**

- **La navegación** (D1): la sección **Crecimiento** y el grupo **Gestión**.
- **Los números**, en `/mi-local/crecimiento`:
  - `lib/mi-local/crecimiento.ts` (`server-only`): `leerEstadisticas(idComercio,
    meses)` llama a `estadisticas_comercio`, y las cuentas de
    `business_stats.dart` (ticket promedio, variación del último mes cerrado,
    tasas, franjas de tres horas, lo más lleno y lo más vacío) pasan a funciones
    chicas, con los mismos nombres. Son cuentas de pantalla sobre lo que ya sumó
    la base, como hace la app.
  - El período en la URL (`?meses=3|6|12`), como el día de la agenda.
  - Las tarjetas, componentes del servidor. **El gráfico de barras y el mapa de
    horarios se dibujan a mano**, con `div` y los tokens del kit, sin librería:
    son barras y celdas, y una librería sería la dependencia más pesada del
    sitio para eso. El selector Ingresos / Turnos es el único pedazo con
    estado.
  - La ⓘ de cada tarjeta, con el texto de la app, en un `Plegable`.
- **Cupones**, en `/mi-local/crecimiento/cupones` (lista), `…/cupones/nuevo` y
  `…/cupones/[id]`: la lista con sus tres grupos, el formulario y las acciones
  (`guardarCupon`, `pausarCupon`, `eliminarCupon`).
- **Recompensas**, en `/mi-local/crecimiento/recompensas`, `…/nuevo` y `…/[id]`:
  el interruptor del programa, las reglas, la lista y el formulario
  (`cambiarPrograma`, `guardarPremio`, `pausarPremio`, `eliminarPremio`).
- **La disponibilidad** (días y franja): una sola pieza para el cupón y el
  premio, como `AvailabilitySection` en la app.
- **El copy**, en `content/mi-local.ts` (`crecimiento`, `cupones`,
  `recompensas`), con las frases de la app en voseo.

Los formularios andan **sin JavaScript** (como los de #53): son campos comunes,
casillas para los días y los servicios, y dos `<input type="date">` para la
vigencia.

## Decisiones tuyas

**D1 · Cómo entra una sexta sección.** El dueño ya tiene cinco pestañas en el
teléfono (a 375 px, 75 px cada una); con Crecimiento serían seis, y la palabra
no entra en 62 px.
- **(Recomendada) "Gestión" agrupa Horarios, Servicios y Equipo**, en la compu y
  en el teléfono. El dueño queda con **Agenda · Crecimiento · Gestión ·
  Perfil**, que son las cuatro pestañas de la app.
  - Gestión lleva a Servicios (lo primero de la app), y arriba de las tres
    pantallas va un selector Horarios · Servicios · Equipo. Las URLs no cambian
    (`/mi-local/horarios`, etc.), así que nada guardado se rompe.
  - El profesional no cambia: sigue con sus cuatro, sin grupo, como en la app.
  - Costo: las secciones del contenido pasan a tener grupo, `useSeccionActual`
    marca Gestión en las tres, y en la compu Horarios queda a un clic más.
- **Agrupar sólo en el teléfono.** La compu sigue con la lista entera (seis
  renglones entran), y el teléfono tiene Gestión. Más cómodo en la compu, pero
  son dos formas del mismo panel.
- **Una quinta pestaña "Más"** en el teléfono, con lo que no entra. Sin tocar la
  compu, pero lo que queda en "Más" se pierde, y la app no lo hace así.

**D2 · Cómo se reparte el trabajo.**
- **(Recomendada) Dos PRs.** Primero **los números** (y la navegación de D1):
  sólo leen, no necesitan nada de BooKit y se pueden usar enseguida. Después
  **cupones y recompensas**, que escriben y esperan la migración de D5.
  - Costo: dos rondas de prueba y de revisión.
- **Un solo PR**, como las otras fases. Una sola prueba, pero los números
  esperan a la migración y el PR es el más grande del panel.

**D3 · Dónde van cupones y recompensas.**
- **(Recomendada) Como la app: dos filas al pie de los números**, "Recompensas"
  y "Cupones", cada una con su página dentro de Crecimiento (la sección queda
  marcada). En la compu, además, las dos filas van en la columna de la derecha,
  a la altura de "Facturado", para que no queden debajo de seis tarjetas.
  - Costo: en el teléfono quedan al final, como en la app.
- **Un selector arriba, Números · Cupones · Recompensas**, la misma pieza que
  Gestión (D1). Se encuentran sin bajar, pero es una forma que la app no tiene.

**D4 · Los números en Esencial.** La base no los limita: la app pide un solo
mes.
- **(Recomendada) Como la app, leyendo `niveles.estadisticas_historial`:** en
  Esencial, el mes en curso, el gráfico y el mapa borrosos con datos de muestra
  y "Todo tu historial, en Pro", que lleva a `/planes`.
  - Qué está en cada nivel lo sigue diciendo la tabla; la web no escribe "en
    Esencial", lee la columna, como `PlanDelLocal`.
  - Costo: que se cumpla depende de que los dos clientes lo respeten.
- **Que la base lo limite:** `estadisticas_comercio` devuelve sólo el mes en
  curso si el nivel no trae el historial. Es la regla en un solo lugar, pero da
  vuelta lo que decidió la reforma de planes ("los datos son del local y ya los
  puede leer") y la web igual necesita la columna para dibujar lo borroso.
- **Todo para todos en la web.** Es simple, pero la web daría gratis lo que el
  plan vende.

**D5 · Qué cuida la base en cupones y premios.** Hoy `reglas_json` no tiene
`CHECK` y `recompensas_comercios` casi tampoco: lo que se valida (porcentaje
hasta 100, valor mayor a 0, al menos un día, franja completa, fechas en orden)
está sólo en el Dart de la app.
- **(Recomendada) `CHECK`s en BooKit, y la web valida lo mismo con zod** para
  decir el error en cada campo.
  - La base deja de aceptar un cupón roto, venga de la app, de la web o de una
    app vieja.
  - Las dos validaciones de pantalla (Dart y zod) siguen siendo dos, pero ya no
    son lo único que cuida.
  - Costo: una migración, y mirar antes que ningún cupón ni premio de hoy la
    rompa (paso 0). Si alguno la rompe, el `CHECK` va `not valid` y te
    pregunto.
- **Funciones `guardar_cupon` y `guardar_premio`** que validen y escriban. Es lo
  más prolijo, pero la app sigue escribiendo la tabla directo hasta que se
  cambie, y son dos funciones más que mantener.
- **Sin migración: sólo zod**, como la app con Dart. La base sigue aceptando
  cualquier cosa.

**D6 · Borrar un cupón o un premio que ya se usó.** **Decidida otra vez por
Fermín el 22/10, después del paso 0**, que mostró que la base borra en cascada
(ver "Lo que dio el paso 0"):
- **La base no deja borrar un premio que alguien canjeó:** la FK de
  `canjes_usuarios.id_recompensa` pasa de cascada a `no action` (punto 4 del
  prompt). La web, ante el `23503`, dice "Este premio ya lo canjearon clientes.
  Pausalo y deja de aparecer en el catálogo." y ofrece pausarlo ahí mismo.
- Los cupones quedan como están: borrar uno se lleva el código de las
  billeteras, que es lo que ya avisa la app.
- En la app, borrar un premio canjeado da "No pudimos eliminar el premio" hasta
  que BooKit cambie ese mensaje.

**D7 · Las reglas de los puntos.** "¿Cómo funcionan los puntos?" tiene los
números escritos en el copy de la app (120 por hora, 6 meses), y la regla vive
en SQL.
- **(Recomendada) La misma hoja, con el copy en `content/`**, en un `Plegable`
  debajo del interruptor, sin "Premios por estatus (Próximamente)".
  - Costo: si cambian los números en la base, hay que cambiarlos en la app y en
    la web.
- **Sin la hoja**, sólo el interruptor y una línea ("Tus clientes suman en cada
  visita"). Nada que se desactualice, pero el dueño que entra por primera vez
  no sabe cuánto suma un turno.

**Supuestos que tomo** (avisame si alguno no va): el período es 3, 6 o 12 meses
como la app; el interruptor de puntos va sin confirmación, como la app; el
código del cupón se guarda en mayúsculas; los números se leen cada vez que se
entra, sin Realtime.

## El cambio en BooKit

Con D5 y D6 aprobadas, hace falta **una migración**. No cambia la app. El prompt va a
una conversación del repo de BooKit, nueva o la de siempre: se entiende solo.
Si elegís la alternativa de D4 que la limita en la base, te lo rearmo con eso.

El punto 3 no lo pide ninguna decisión: es el mismo arreglo que tuvo
`crear_turno_manual` en `20260921150000`, para una función que la web va a
llamar desde ahora. Si no lo querés, se saca.

```text
En BooKit, desde develop: una migración nueva para el panel web del local
(bookit-landing, /mi-local, fase 5: Crecimiento). La web va a crear, editar,
pausar y borrar cupones (promociones) y premios (recompensas_comercios) con la
sesión del dueño, escribiendo la tabla directo como la app. No cambia el
código de la app; con el punto 4, borrar un premio canjeado empieza a fallar
también en la app.

Ya miré la base el 22/10: ninguna fila de hoy rompe los CHECKs de abajo (hay
un cupón y 7 premios). El cupón que hay no trae hora_inicio ni hora_fin y trae
limite_usos_total: null: los CHECKs tienen que aceptarlo. Si al aplicar alguna
fila nueva los rompe, el CHECK va "not valid" y me avisás.

Un solo archivo, con timestamp posterior a 20261022200000_perfil_del_local.sql:

1. CHECKs en public.promociones, con nombres que digan qué cuidan:
   - fecha_inicio y fecha_fin no nulas, y fecha_inicio <= fecha_fin;
   - reglas_json es un objeto con:
     - tipo_descuento 'porcentaje' o 'monto';
     - valor_descuento numérico > 0, y <= 100 si es porcentaje;
     - limite_usos_total ausente, null, o entero > 0;
     - dias_validos un arreglo no vacío de enteros del 1 al 7 (ISO, como
       _cotizar_turno);
     - servicios_aplica ausente o arreglo (vacío es todos);
     - hora_inicio y hora_fin: las dos o ninguna, "HH:MM", y inicio < fin.
   Si el CHECK de reglas_json queda largo, una función immutable
   public._reglas_de_promocion_validas(jsonb) returns boolean y el CHECK la
   llama.
   - codigo no vacío después de btrim, y nombre no vacío.

2. CHECKs en public.recompensas_comercios (tipo_beneficio en 'gratis',
   'porcentaje', 'monto' ya está: recompensas_comercios_tipo_beneficio_check):
   - valor_beneficio = 0 si es gratis; > 0 si no, y <= 100 si es porcentaje;
   - turnos_minimos_requeridos >= 0;
   - dias_validos un arreglo jsonb no vacío de enteros del 1 al 7;
   - hora_inicio y hora_fin: las dos o ninguna, e inicio < fin;
   - titulo no vacío después de btrim, y descripcion de hasta 120 caracteres
     (es el maxLength del formulario de la app).

3. public.estadisticas_comercio(uuid, integer), de
   20261008140000_estadisticas_del_comercio.sql: hoy deja pasar si
   auth.uid() = p_id_comercio, o sea, da por hecho que el id del local es el
   de la cuenta del dueño. Que pregunte public.es_duenio_comercio(p_id_comercio),
   como las políticas, igual que se arregló crear_turno_manual en
   20260921150000. El resto del cuerpo, igual; mismo errcode y mensaje.

4. canjes_usuarios_id_recompensa_fkey pasa de ON DELETE CASCADE a ON DELETE
   NO ACTION (drop y add con el mismo nombre). Hoy borrar un premio borra los
   canjes de los clientes, también los disponibles, que pagaron con puntos y
   no se les devuelven. Con el cambio, un premio que alguien canjeó no se
   borra (23503) y el dueño lo pausa. Al 22/10 no hay ningún canje en la base.
   Borrar un local sigue andando: canjes_usuarios_id_comercio_fkey es
   cascada y se lleva los canjes en la misma sentencia. Si docs/ o el texto
   de la app dicen que los canjes "no se tocan" al borrar, ahora es cierto;
   el mensaje de error de la app al borrar uno canjeado lo dejo a tu criterio
   en otro PR.

Probalo en un Postgres suelto (como huecos_del_dia en #84), con casos para:
- cada CHECK (uno que pasa y uno que no);
- estadisticas_comercio (el dueño sí, otra cuenta no);
- la FK: un premio sin canjes se borra; uno con un canje no (23503); un
  local con premios canjeados se borra igual, con sus canjes.

PR a develop. No la apliques en la base hasta que yo diga. Si
docs/schema-tablas.md describe estas tablas o la función, actualizalo.
```

## Orden de trabajo

Con D2 recomendada: dos ramas, `mi-local/numeros` y `mi-local/cupones`, y un PR
de cada una a `main`, más el de BooKit.

0. **Lecturas en la base, con tu OK** (`supabase db query --linked`, desde el
   checkout de BooKit):
   - que `estadisticas_comercio` en la base sea la de la migración, y que
     llamada como la cuenta de Nogal conteste;
   - las filas de `niveles` (`estadisticas_historial`, `promociones`) y el nivel
     de Nogal;
   - los cupones y premios de Nogal, y `habilita_puntos`, para dejarlos como
     estaban;
   - las formas de `reglas_json` que hay (las claves y sus tipos), para el
     prompt de BooKit;
   - qué hace al borrar la FK de `canjes_usuarios.id_recompensa` y la de
     `beneficios_usuarios.id_promocion` (D6), y que el trigger
     `trg_promociones_segun_el_plan` esté.
1. **BooKit:** le pasás el prompt de arriba. La migración se aplica con tu OK.
   Mientras tanto la web sigue con 2 y 3, que no la necesitan.
2. **La navegación** (D1), en un commit aparte: Gestión y la sección
   Crecimiento.
3. **Los números:** `lib/mi-local/crecimiento.ts`, la página y las tarjetas, el
   período, Esencial (D4) y el pie con las dos filas (D3). **Primer PR.**
4. **Cupones:** la lista, el formulario, pausar y eliminar (D6), y "Disponible
   en Pro".
5. **Recompensas:** el programa, las reglas (D7), la lista, el formulario,
   pausar y eliminar.
6. **Con la migración aplicada**, la prueba de 4 y 5 (abajo). Te paso las
   pantallas y **segundo PR**.

**Lo que dio el paso 0 (22 de octubre de 2026)**, con el OK de Fermín, sólo
lecturas:

- **`estadisticas_comercio` en la base es la de la migración** (el cuerpo es
  igual). Llamada como la cuenta de Nogal, en una transacción que se deshizo,
  contesta: 12 meses, 550 turnos prestados, $9.150.000, 5 servicios, 4
  profesionales y 30 celdas de horario. Hay datos para ver todas las tarjetas.
- **En los 8 locales el id del local es el de la cuenta del dueño** ("mp
  prueba" no tiene dueño). La regla de "Lo que vi" se cumple hoy en todos.
- **Los 8 locales son Pro.** Ninguno es Esencial: para probar D4 y los cupones
  en Esencial hace falta el `update` con tu OK (ver "Cómo se prueba").
- **`niveles`:** Esencial sin `promociones` ni `estadisticas_historial`; Pro y
  Equipo con las dos.
- **Cupones: hay uno solo en toda la base**, de Barbería Peña ("Promo
  primavera", PRIMAVERA20, 20% de lunes a miércoles, venció el 15/10). Nogal no
  tiene. Nadie guardó un código en la billetera ni usó un cupón en un turno.
- **Premios: 7.** Nogal tiene 4, todos activos y con un servicio cada uno
  (corte gratis 450 puntos, 20% en corte + barba 200, perfilado gratis 120,
  $5.000 en color 300). `habilita_puntos` de Nogal es `true`.
- **Ningún cupón ni premio de hoy rompe los `CHECK`s del prompt.** Las formas
  de `reglas_json`: el cupón de Peña no trae `hora_inicio` ni `hora_fin` (el
  `CHECK` tiene que aceptar que falten) y trae `limite_usos_total: null`.
- **`recompensas_comercios` ya tiene el `CHECK` de `tipo_beneficio`**, que
  `docs/schema-tablas.md` no menciona. El prompt ya no lo pide.
- **El trigger `trg_promociones_segun_el_plan` está.**
- **Al borrar, la base nunca frena** (D6):
  - `canjes_usuarios.id_recompensa` es `ON DELETE CASCADE`: borrar un premio
    borra los canjes, **también los disponibles**, que el cliente pagó con
    puntos, sin devolvérselos. El texto de la app ("Los canjes que ya hicieron
    no se tocan") no es cierto. El dueño no ve los canjes (la política es
    "cada uno los suyos"), así que la web no puede mirar antes de borrar.
  - `beneficios_usuarios.id_promocion` e `historial_usos_promociones` también
    son cascada; `turnos.id_promocion` queda en `null`.
  - Hoy no hay ningún canje en la base: nadie perdió nada todavía.

**D6, de nuevo** (la de antes no aplicaba). **Fermín eligió la recomendada el
22/10:**
- **(Recomendada, elegida) Que la base no deje borrar un premio que alguien canjeó**: la
  FK de `canjes_usuarios` pasa a `no action` (punto 4 del prompt). La web, ante
  el `23503`, dice "Este premio ya lo canjearon clientes. Pausalo y deja de
  aparecer en el catálogo." Los cupones quedan como están: borrar uno se lleva
  el código de las billeteras, que es lo que ya avisa la app.
  - Costo: la misma migración, y en la app borrar un premio canjeado da "No
    pudimos eliminar el premio" hasta que BooKit cambie el mensaje.
- **En la web sólo se pausa**, premios y cupones. Sin migración, pero la app
  sigue borrando canjes.
- **Como la app:** se borra todo. No lo recomiendo.

**Hecho (22 de octubre de 2026):**

1. **BooKit:** FacuAntivero/BooKit#93 (`20261022210000_crecimiento_del_local.sql`),
   mergeado en `develop` y pasado a `main` en FacuAntivero/BooKit#94. Hace los
   cuatro puntos del prompt, probado con 98 casos en un Postgres suelto. Los
   `CHECK`s rechazan con `23514` y el nombre de la restricción; también
   rechazan `reglas_json`, `codigo` y `nombre` en `null`, y aceptan
   `hora_inicio` y `hora_fin` en `null` como ausentes, igual que
   `_cotizar_turno`. Falta confirmar que esté aplicada en la base.
2. **La navegación**, en la rama `mi-local/numeros` (worktree
   `../bookit-landing-numeros`): el dueño ve Agenda · Crecimiento · Gestión ·
   Perfil. Gestión abre en Servicios y lleva arriba Horarios · Servicios ·
   Equipo (`PartesDeGestion`). Las secciones del contenido pasaron a tener
   `id`, `para` (todos, el dueño o el profesional) y `rutas`.
3. **Los números**, en `/mi-local/crecimiento`: `lib/mi-local/crecimiento.ts`,
   las tarjetas (`TarjetasDeCrecimiento`) y `leerPlanDelLocal` con
   `estadisticasHistorial`. Dos cambios contra el plan:
   - el selector Ingresos / Turnos es un enlace (`?ver=turnos`), como el
     período: anda sin JavaScript y queda en la URL;
   - las filas de Cupones y Recompensas al pie (D3) van en el segundo PR: en
     este llevarían a páginas que todavía no existen.

**Lo que dio la prueba de los números (22 de octubre de 2026)**, en el
preview contra la base, como el dueño de Barbería Nogal:

- **12 meses:** $9.150.000 y 550 turnos, ticket promedio $16.636, "↓ 10% ·
  Sept contra Ago". Son los totales que dio `estadisticas_comercio` en el paso
  0. Clientes: 66 volvieron y 1 vino por primera vez (99%). No se hizo el 1%
  (3 cancelados, 1 ausente). Lo más lleno, martes de 12 a 15; lo más vacío,
  viernes de 9 a 12. Cuatro profesionales y cinco servicios.
- **6 meses y Turnos** (`?meses=6&ver=turnos`): $5.625.000, con el número de
  turnos sobre cada barra.
- **Esencial**, forzando el nivel en el preview sin tocar la base: "Facturado
  este mes" ($15.000, 1 turno), el gráfico y el mapa borrosos con "Todo tu
  historial, en Pro" y "Tus horarios pico, en Pro", y "Ver planes" a
  `/planes`. Clientes, lo que no se hizo y servicios, con el mes en curso.
- **La ⓘ** se abre y se cierra (`<details>`), sin errores en la consola.
- **La navegación:** Crecimiento y Gestión quedan marcadas en la barra; Gestión
  también en `/mi-local/horarios`, `/mi-local/equipo` y
  `/mi-local/servicios/nuevo`, y las píldoras marcan la parte en la que se
  está.
- **El profesional** (la cuenta del equipo de Fermín, antes de entrar como el
  dueño): `/mi-local/crecimiento` lo manda a la agenda, y su barra sigue
  siendo Agenda · Horarios · Servicios · Perfil.
- 375 px y 1280 px, claro y oscuro, sin scroll de costado.
- `npm run typecheck` y `npm run build`.

**Lo que no se comparó:** los números contra la app abierta en el teléfono,
uno por uno. Salen de la misma función y las cuentas de encima son las de
`business_stats.dart`, pero no los puse lado a lado.

## Cómo se prueba

En el preview, contra la base, con Barbería Nogal, dejando todo como estaba.

**Antes de tocar nada** anoto los cupones y premios de Nogal y su
`habilita_puntos`. Lo que se crea en la prueba lleva "(prueba web)" en el nombre
y se borra al final; si la base no deja borrarlo (D6), queda pausado y te lo
digo.

**Los números**
- Los de la web contra los de la app abierta en el teléfono, con el mismo
  período: el total, el ticket promedio, la variación, las dos cifras de
  clientes, lo que no se hizo, lo más lleno y lo más vacío, y cada barra de
  profesionales y servicios. Tienen que dar igual.
- 3, 6 y 12 meses, y recargar con el período en la URL.
- Ingresos / Turnos en el gráfico, con y sin JavaScript (sin JavaScript, se ven
  los ingresos).
- Marcar un turno como completado en la agenda y volver: el número cambió.
- **Esencial:** Nogal es Pro y el nivel lo escribe sólo el servidor. Para verlo,
  te pido el OK para pasarlo a `esencial` un rato con un `update` y volverlo a
  `pro`; si no, se prueba sólo con el nivel forzado en el preview y se dice.

**Cupones**
- Crear uno (porcentaje, con límite, dos servicios, de lunes a viernes de 9 a
  13): en la app aparece igual, con el mismo descuento en el talón.
- Con una cuenta de cliente en la app, reservar en Nogal con el código, en un
  horario que vale y en uno que no: la cotización aplica el descuento sólo en el
  primero.
- Editarlo (monto fijo, sin franja), pausarlo, activarlo, y que el código
  repetido diga "Ese código ya existe".
- Los errores de cada campo: porcentaje 120, valor 0, sin días, una sola hora,
  fechas al revés. Y uno armado a mano contra la base (sin la validación de la
  web): el `CHECK` lo rechaza.
- Borrarlo. Y uno guardado en la billetera del cliente: D6.
- En Esencial (si se puede armar): la lista con "Pausados por tu plan" y
  "Disponible en Pro", y crear no se ofrece.

**Recompensas**
- Apagar y prender el programa: la app muestra lo mismo, y con el programa
  apagado no se ofrece crear premios.
- Crear un premio (servicio gratis, 300 puntos, 2 visitas, sólo sábados), uno
  de porcentaje y uno de monto; en la app, el catálogo del cliente los muestra
  con su descripción.
- Editar, pausar (deja de aparecer en el catálogo) y borrar.
- Con la cuenta de cliente, canjear el premio de prueba y después intentar
  borrarlo desde la web: con D6 recomendada, la base no deja y la web ofrece
  pausarlo. El canje sigue en la billetera del cliente.

**El profesional**
- Con la cuenta del equipo de Fermín en Nogal: no ve Crecimiento, y
  `/mi-local/crecimiento` y `/mi-local/crecimiento/cupones` lo mandan a la
  agenda. Su barra no cambió.

**Siempre**
- 375 px y 1280 px, claro y oscuro, sin scroll de costado; las cuatro pestañas
  del dueño en el teléfono.
- Los formularios sin JavaScript.
- `npm run typecheck` y `npm run build`.

Si algún caso no se puede armar, se dice.

## Lo que vi y no toca este plan

- **`estadisticas_comercio` da por hecho que el id del local es el de la
  cuenta** (`auth.uid() is distinct from p_id_comercio`), la misma regla no
  escrita que se le sacó a `crear_turno_manual` en `20260921150000`. La web
  también la usa: `leerMiLugar` busca el logo del local propio con el id de la
  cuenta. Hoy se cumple para todos los locales. El punto 3 del prompt la saca
  de la función; la de la web queda como está.
- **`canjear_recompensa_seguro` no mira `habilita_puntos`:** con el programa
  apagado, un cliente con puntos puede seguir canjeando los premios activos. La
  app no avisa nada al apagarlo. Es de BooKit: decidir si apagar el programa
  también apaga los canjes.
- **El dueño puede escribir `promociones.usos_contador`**: el grant es de la
  tabla entera y la app manda `usos_contador: 0` al crear. Con eso se puede
  "devolver" el tope de canjes de un cupón. La web no lo escribe; sacarlo del
  grant es una tarea de BooKit.
- **Activar un cupón en Esencial no lo frena la base** (el trigger es sólo del
  `insert`). No hace daño, porque la cotización lo ignora, pero la app y la web
  esconden el botón para no prometer un cupón que nadie puede usar.
- **"Tus clientes" suma los meses:** un cliente que vino en tres meses cuenta
  tres veces. Lo dice el comentario del modelo de la app, pero no la ⓘ de la
  tarjeta. La web va a decir lo mismo que la app.
- **`servicios_aplica` guarda los ids como texto y `id_servicios` como enteros**:
  el cupón y el premio guardan lo mismo de dos formas. La web escribe cada uno
  como lo espera su tabla.
- **La hoja de las reglas de los puntos dice "nuestra red exclusiva" y "Suma de
  Puntos"** (mayúsculas de título, que el resto de la app no usa). La web lo
  pasa a la voz del resto del panel.
- **La hoja de ruta** (`docs/PLAN-MI-LOCAL.md`) se actualiza al aprobar este
  plan.
