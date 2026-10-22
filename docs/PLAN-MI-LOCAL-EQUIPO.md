# Mi local en la web: los profesionales del equipo

> **Aprobado por Fermín el 22 de octubre de 2026**, con la recomendada de cada
> decisión D1–D8.

> Borrador del 22 de octubre de 2026, para que Fermín apruebe las decisiones
> **D1–D8**. Es la fila "Los profesionales del equipo entran a la web" de la
> hoja de ruta (`docs/PLAN-MI-LOCAL.md`), que va después de la fase 3.

## Qué es

Hoy `/mi-local` es sólo del dueño. Un profesional que trabaja en un local con su
propia cuenta (el "staff" de la app) entra y cae en "Esto es para los locales".

Con este plan entra a su lugar en el local. Ve **su** agenda, la marca, se carga
turnos, arma **su** horario y ajusta **sus** servicios, como en la app. No ve lo
del local: ni el equipo, ni los servicios de todos, ni el plan.

Y quien tiene más de un lugar (dueño de un local y profesional en otro, o
profesional en dos) elige dónde está, como el "Cambiar de lado" de la app.

**Queda afuera:**
- aceptar la invitación desde la web (ver D8);
- el perfil del profesional (su nombre y su foto), que va con las fotos en la
  fase 4 (ver D2);
- publicar la disponibilidad como historia, que es de la app.

## Cómo lo hace hoy la app

Rutas relativas a `~/Desarrollo/GitHub/BooKit`.

### Dónde está parado

- **Cada local es una fila de `profesionales`** con el `auth_user_id` de la
  persona. El índice único `(auth_user_id, id_comercio)` permite una por local.
- **Los "lados"** (`lib/features/auth/domain/lado.dart`): cliente, comercio (el
  local propio) y uno de staff por cada local ajeno, que lleva el
  `id_profesional` de esa fila.
  - `AuthProvider` los arma con una consulta: `profesionales` con
    `auth_user_id = yo`, más el nombre y el logo del local. La fila cuyo local es
    de la persona es "el local propio" y no un lado de staff.
  - **La elección vive en el teléfono** (`lado_prefs.dart`, "una preferencia de
    este aparato, no un dato de la persona").
  - Sin elección vigente, el orden es: el local propio, después el primer local
    ajeno por nombre, después cliente (`resolverLado`).
  - Con más de un lado y ninguno elegido, pregunta "¿Por dónde entrás?". Después
    se cambia desde "Cambiar de lado" en el perfil.

### Quién entra

`staff_bottom_nav_bar.dart` llama a `acceso_de_mi_local(p_profesional)` al
abrir y cada vez que la app vuelve a primer plano:

- **El local se dio de baja:** "{local} cerró su cuenta".
- **Lo desactivaron:** "Ya no estás en el equipo".
- **La suscripción no está al día ni en gracia:** "Espacio de trabajo en pausa".
- Si la llamada falla, entra igual.

La función también devuelve `staff_incluido` (si el plan del local incluye las
cuentas del equipo), pero **la app no lo lee**. En un plan sin cuentas del
equipo la persona entra y ve todo vacío, sin un cartel que explique por qué.

### Qué hace

El shell tiene cuatro pestañas: Turnos, Horarios, Servicios y Perfil.

- **Turnos:**
  - sólo los suyos, con Realtime filtrado por su `id_profesional`;
  - los huecos libres (`huecos_del_dia`);
  - completar, ausente y cancelar, con las mismas reglas que el dueño;
  - cargar un turno a mano, con el profesional fijo;
  - "Publicar" un hueco como historia;
  - **sus ingresos del día** ("$X en ingresos");
  - no ve el teléfono del cliente.
- **Horarios:** edita su semana y sus excepciones con la misma pantalla del
  dueño (`ScheduleScreen`).
- **Servicios** (`staff_services_provider.dart`):
  - ve sólo los que le asignó el dueño;
  - edita su duración y, si el local tiene "Precios libres", su precio;
  - no se asigna ni se quita servicios: "El administrador del local debe
    asignarte los servicios que realizas".
- **Perfil:** su nombre y su foto en ese local, sus números del día, "Cambiar de
  lado", "Compartir disponibilidad", los avisos y "Eliminar cuenta". No hay
  "salir del local".

**No ve:** Crecimiento, Gestión, el equipo, los servicios del local, la
suscripción ni los turnos de otros.

### La invitación

El dueño invita por mail. El link `somosbookit.com.ar/equipo?token=…` abre la
app, y la cuenta se acepta ahí con `aceptar_invitacion_equipo`, que deja
`usuario.rol` en `profesional`. Para la app, quién es staff no lo dice el rol:
lo dicen las filas de `profesionales`.

## Lo que controla la base

Migraciones en `BooKit/supabase/migrations`. Todo pasa por
**`es_el_profesional(id)`**, que exige:
- que la fila sea de quien llama;
- que esté activa;
- que el plan del local incluya las cuentas del equipo
  (`_cuenta_habilitada_en_el_local`).

**No mira la suscripción ni si el local se dio de baja.**

| Qué | Qué puede el profesional | Cómo lo decide la base |
|---|---|---|
| `turnos`, leer | Sólo los suyos | `gestiona_turno` en la política de SELECT. Realtime respeta la misma política. |
| `turnos`, cambiar el estado | Completar, ausente y cancelar los suyos | `_turnos_quien_cambia_el_estado`. Si cancela uno pagado, se devuelve siempre y al cliente le llega el aviso. **Al dueño no le llega nada.** |
| `crear_turno_manual` | Sólo para sí mismo | `gestiona_profesional`. También mira la suscripción (`al_dia` o `en_gracia`). |
| `huecos_del_dia` | Sus huecos ("local" es la unión de los suyos) | Filtra el equipo con `gestiona_profesional`. No mira la suscripción. |
| `horarios_libres_del_profesional`, `servicios_del_profesional` | Los suyos | `gestiona_profesional`. Con el local cortado dan vacío (`_oferta_de_servicios`). |
| `config_agenda`, `guardar_dias_agenda`, `excepciones` | Su horario y sus días especiales | `gestiona_profesional`, más las reglas de la fase 3. |
| `profesionales_servicios` | **Todo lo de su fila:** asignarse o quitarse servicios, y su precio y su duración | `gestiona_profesional`. La base no distingue al dueño del profesional. |
| `profesionales` | Su `nombre`, `bio` y `foto_url` | Grants por columna. Esta política no pasa por `es_el_profesional`: puede editarlos aunque esté inactivo. |
| `comercios` | El nombre, el logo y `precios_libres`; **no** la suscripción ni el nivel | Grants por columna. Para el estado está `acceso_de_mi_local`. |

**La suscripción cortada o suspendida no la frena la RLS:** con el local
cortado, el profesional sigue leyendo sus turnos, cambiándoles el estado y
editando su horario. Lo frena la app con su cartel, y la base sólo en la carga
manual y en los horarios para reservar. La web tiene que frenarlo igual que la
app (D5).

`mi_suscripcion()` y `mi_plan_web()` buscan el local **del que la persona es
dueña**. Para un profesional que no es dueño de nada no encuentran nada. Si es
dueño de otro local, devuelven ese.

## Lo que se reusa y lo que se suma en la web

**Se reusa casi todo el panel**, porque las lecturas y las acciones ya pasan por
la base con la sesión de quien entra:

- **Los turnos y la semana** (`leerTurnosDelDia`, `leerSemana`) filtran por
  local. La RLS ya le devuelve al profesional sólo los suyos.
- **Las acciones de los turnos** (`cambiarEstado`, `cargarTurno`): la base deja
  al profesional sobre lo suyo.
- **`huecos_del_dia`** ya devuelve sólo lo suyo.
- **`EnVivo`** se suscribe por local, y Realtime le manda sólo sus cambios.
- **Horarios:** `profesionalQueEdita` y `loEditaElDuenio` ya dan "editable"
  para la propia fila, porque `esDuenio` compara contra la cuenta de quien
  entra.
- **El precio y la duración propios:** `guardarServiciosDelProfesional`, con lo
  de D3.

**Se suma:**

- **"El lugar"**, en lugar de "el local" (`leerMiLocal`):
  - en qué local está, si como dueño o como profesional (con su
    `id_profesional`), su nombre y su logo, y si entra;
  - una función `leerMiLugar()` con `cache`, que reemplaza a `leerMiLocal()` en
    el marco, en las páginas y en las acciones;
  - `leerLocalQueEntra()` pasa a `leerLugarQueEntra()`;
  - el dueño sigue leyendo su suscripción de `mi_plan_web()`;
  - el profesional lee `acceso_de_mi_local()` (D6).
- **Elegir dónde está** (D1): una cookie con el lugar elegido y "Cambiar de
  local" en el menú cuando hay más de uno.
- **Los bloqueos del profesional**, con las frases de la app, más una nueva para
  el plan sin cuentas del equipo (D4).
- **Las secciones según el lugar** (D2): el dueño, las cuatro de hoy; el
  profesional, Agenda, Horarios y Servicios, sin "Tu plan".
  - Las páginas del dueño (servicios del local, equipo) mandan al profesional a
    la agenda, y sus acciones contestan que no puede.
  - La base igual lo rechazaría, pero con cero filas o un permiso genérico.
- **La agenda del profesional:**
  - sin píldoras de profesional;
  - "Cargar un turno" con él ya elegido;
  - el día vacío dice "No atendés este día", como la app.
- **Horarios del profesional:** sin píldoras; sólo su semana y sus días
  especiales, editables.
- **"Mis servicios"** (D3): los suyos, con su duración y, con "Precios libres",
  su precio.
- **El copy**, en `content/mi-local.ts`, con las frases de la app en voseo. La
  agenda de la app dice "Tú"; la web dice "Vos".

**Archivos:**

```
lib/mi-local/lugar.ts                  el lugar: leerMiLugar, leerLugarQueEntra, la cookie y los bloqueos (server-only)
app/mi-local/lugar/acciones.ts         cambiar de lugar
app/mi-local/(panel)/servicios/…       el dueño, como hoy; el profesional, "Mis servicios"
components/mi-local/CambiarDeLugar.tsx el selector, en el menú
```

`/mi-local/sin-local` queda para quien no tiene ningún lugar: un cliente, o un
profesional cuya fila no se encontró ("No encontramos tu lugar en este local",
como la app).

## Decisiones tuyas

**D1 · Cómo se elige el local cuando hay más de uno.**
- **(Recomendada) Una cookie con el lugar elegido, y "Cambiar de local" en el
  menú del panel.**
  - Es lo que hace la app: una preferencia del aparato.
  - Sin cookie (o con una que ya no vale), entra en el orden de la app: el local
    propio, después el primero por nombre.
  - Costo: un enlace no dice de qué local es. Abierto en otra compu, entra en el
    lugar de siempre de esa compu.
- **El lugar en la URL** (`/mi-local/l/<id>/…`).
  - Un enlace siempre abre el mismo local.
  - Pero cambian todas las rutas y todos los enlaces del panel, y eso es mucho
    para algo que usa poca gente.
- **Preguntar siempre al entrar** a quien tiene más de uno. Es más simple, pero
  es un paso más cada vez.

**D2 · Qué secciones ve el profesional.**
- **(Recomendada) Agenda, Horarios y Servicios, como la app, sin Perfil.**
  - El nombre y la foto van con la subida de fotos de la fase 4 (D9 de la fase
    3).
  - Costo: el profesional que quiera cambiar su nombre lo sigue haciendo desde
    la app.
- **Sumar ahora un Perfil sólo con el nombre.** Es poco, pero es una pantalla
  que en la fase 4 se rehace.

**D3 · Los servicios del profesional.**
- **(Recomendada) Como la app: ve los que le asignó el dueño y edita su duración
  y, con "Precios libres", su precio.**
  - Asignarse o quitarse un servicio sigue siendo del dueño.
  - Costo: la base deja más, y la web, como la app, no lo ofrece.
- **Todo lo que la base deja:** también asignarse y quitarse servicios. Le saca
  trabajo al dueño, pero el dueño pierde el control de qué ofrece cada uno.

**D4 · El plan del local no incluye las cuentas del equipo.**
- **(Recomendada) La web lee `staff_incluido` y lo dice**, con una frase nueva
  del estilo de las de la app: "{local} no tiene las cuentas del equipo en su
  plan, así que su panel no está disponible para vos. Hablá con quien
  administra el local."
  - Queda anotado para la app, que hoy muestra todo vacío.
- **Como la app hoy: entra y ve todo vacío.** Ahorra un cartel, pero deja al
  profesional sin saber por qué.

**D5 · El local con la suscripción cortada o suspendida.** La base no lo frena.
- **(Recomendada) La web lo frena como la app**, en cada página y en cada
  acción (`leerLugarQueEntra`), con "Espacio de trabajo en pausa".
- **Llevarlo a la base:** que `es_el_profesional` mire la suscripción.
  - Cerraría también la consola y los scripts.
  - Pero toca la puerta de todas las políticas del profesional, en la app
    también, y le cortaría el acceso a su historial, que la app dice que "sigue
    donde lo dejaste".
  - Es una tarea de BooKit aparte.

**D6 · Cómo lee la web dónde trabaja alguien.**
- **(Recomendada) Como la app, sin migración:** `profesionales` con
  `auth_user_id = yo` (más el nombre y el logo del local), y
  `acceso_de_mi_local` para el lugar elegido.
  - Costo: una consulta más por página, en paralelo con el resto.
- **Una función nueva en BooKit, `mis_lugares()`**, que devuelva todos los
  lugares con su acceso de una vez.
  - Es una sola llamada, y la app la podría usar.
  - Pero es una migración más, y la cuenta de la app ya existe y anda.

**D7 · Los ingresos del profesional.**
- **(Recomendada) Mostrarlos, como la app:** el "Cobrado" de la agenda, con lo
  suyo completado.
- **Esconderlos.** Sería una diferencia con la app sin un pedido de nadie.

**D8 · La invitación.**
- **(Recomendada) Sigue en la app.** El link abre la app, como hoy, y la cuenta
  se acepta ahí. La web empieza a servirle a quien ya está en un equipo.
- **Aceptarla también en la web**, con `aceptar_invitacion_equipo` y la sesión.
  - Sirve a quien no instaló la app.
  - Pero es una pantalla más (entrar con el mail correcto, vencida, el tope del
    plan) y no es lo que pide esta fila de la hoja de ruta.

## Orden de trabajo

Una rama `mi-local/equipo` y **un PR** a `main`. Sin migraciones, si D6 sale
como la recomendada.

0. **Una cuenta del equipo para probar.**
   - Barbería Nogal está en Pro, incluye las cuentas del equipo y tiene lugar
     para dos profesionales más.
   - La invitación manda un mail de verdad: la mandás vos a un mail tuyo,
     desde la web o la app, y la aceptás en el teléfono.
   - Con esa misma cuenta, si es dueña de otro local de prueba, se prueba
     también el cambio de lugar.
1. **El lugar:** `leerMiLugar`, la cookie, `leerLugarQueEntra`, los bloqueos y
   "Cambiar de local". Todo lo que hoy llama a `leerMiLocal` pasa a usarlo.
2. **El panel del profesional:**
   - las secciones según el lugar;
   - la agenda, los horarios y "Mis servicios";
   - las páginas y las acciones del dueño, cerradas para él.

   Te paso las pantallas y **PR**.

## Cómo se prueba

En el preview, contra la base, con Barbería Nogal y la cuenta del paso 0,
dejando todo como estaba.

**El profesional**
- Entra y ve sólo sus turnos. Con la app abierta en el teléfono, las dos dicen
  lo mismo.
- Completa, marca ausente y cancela un turno suyo. Uno de otro no lo ve.
- Se carga un turno a mano y el hueco se achica.
- Arma su horario y un día libre: la agenda del dueño lo muestra.
- Cambia su duración y, con "Precios libres", su precio. No puede asignarse
  servicios.
- Escribe a mano la URL de Equipo o de Servicios del local: vuelve a la agenda.

**Los bloqueos**, uno por uno, y volviendo cada uno atrás:
- desactivarlo desde el panel del dueño;
- el plan sin cuentas del equipo, que sólo se puede probar en un local de
  prueba en Esencial;
- el local cortado, que no se prueba con Nogal.

Si algún caso no se puede armar, se dice.

**El cambio de lugar**
- Una cuenta con dos lugares entra en el de siempre y cambia al otro.
- Una cookie que apunta a un lugar que ya no es suyo entra en el primero que
  vale.

**El dueño**
- Todo sigue igual: un repaso de la agenda, Horarios, Servicios y Equipo.

**Siempre**
- 375 px y 1280 px, claro y oscuro.
- `npm run typecheck` y `npm run build`.

## Lo que vi y no toca este plan

- **La app no lee `staff_incluido`** (`staff_profile_repository.dart`). En un
  plan sin cuentas del equipo, el profesional entra y ve todo vacío. Es una
  tarea de BooKit (ver D4).
- **`MotivoInvitacion.desde` no conoce `plan_sin_staff` ni `sin_lugar`**
  (`invitacion_pendiente.dart`). La persona ve "No pudimos responder la
  invitación." sin la causa.
- **Cuando el profesional cancela un turno, al dueño no le llega nada**
  (`notificar_turno/destinatarios.ts`). Puede estar bien. Lo anoto porque en
  la web el dueño se va a enterar recién al mirar la agenda.
- **El profesional puede editar su nombre aunque esté inactivo:** la política
  de `profesionales` no pasa por `es_el_profesional`.
- **`docs/schema-tablas.md` de BooKit, línea 1477,** dice que el profesional
  puede cambiar `esta_activo`, y ya no puede desde 20260925160000.
- **La agenda del staff en la app dice "Tú"** (`staff_appointments_screen.dart`),
  no "Vos".
