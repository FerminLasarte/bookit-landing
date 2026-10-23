# El panel del equipo (/admin) — v2

> **Aprobado por Fermín el 23 de octubre de 2026**, con la recomendada de cada
> decisión D1–D11. El paso A está en main (#65). BooKit dejó B a E en la base
> (BooKit#99, contrato en BooKit `docs/admin-panel.md`), y la web los suma un
> PR por paso.
>
> Decidido después, con el contrato a la vista: en Pulso, la comparación con
> el mes anterior va como **los dos números, sin porcentaje** ("5 en octubre ·
> 3 en septiembre"), porque el mes en curso va hasta hoy y a principio de mes
> el porcentaje daría siempre de menos.

## Qué es

Hoy `/admin` sirve para **mirar**: tres pantallas de sólo lectura (Pulso,
Comercios con su ficha, Cobros), cada una sobre una función `admin_*` de la
base (BooKit `20261008150000_superadmin.sql`, retocadas en
`20261020170000_admin_tienda_que_cobra.sql`). No hay un solo botón que cambie
algo, y para entrar hay que escribir `/admin` a mano.

La v2 suma:

1. **Entrar sin escribir la dirección**: un link "Panel" que ve sólo quien ya
   entró al panel en ese navegador.
2. **Contacto desde la ficha**: mail y WhatsApp del dueño, y de las altas a
   medias.
3. **Resolver incidencias** desde Cobros.
4. **Tocar la suscripción de un local**, con lo que es seguro tocar.
5. **Un registro de lo que hace el equipo** desde el panel.
6. **Buscar personas**, no sólo locales.
7. **La plata en pesos y la comparación con el mes anterior.**
8. **Avisos** que no dependan de abrir el panel.
9. **Administradores**: queda afuera (D11).

**Queda afuera:** la app, `/mi-local`, `/planes` y la landing (salvo el link
del punto 1). Ninguna acción usa la service role: el panel sigue entrando con la
sesión de la persona y la base decide con `_exigir_superadmin()`.

## Cómo se reparte el trabajo

Lo que toca la base va por **prompt al chat de BooKit**, como en las fases de
`/mi-local`; la web se escribe sobre la base ya cambiada.

| Paso | Qué | Dónde | Depende de |
| --- | --- | --- | --- |
| **A** | Link "Panel" + salida que no saca de `/mi-local` + contacto | sólo web | nada |
| **B** | Registro + resolver incidencias + extender la prueba | BooKit, después web | nada |
| **C** | Buscar personas | BooKit, después web | nada |
| **D** | Plata y comparación | BooKit, después web | D8 |
| **E** | Avisos | sólo BooKit | nada |

A sale primero y sola. B a E se piden a BooKit en **un solo prompt** y la web
las va sumando en un PR por paso.

---

## A. Sólo web

### A1. El link "Panel"

En el nav del sitio, al lado de "Mi local" (compu) y debajo de "Mi local" en el
menú del celular, aparece **"Panel"** → `/admin`, **sólo si en ese navegador
está la cookie de sesión del panel**.

Cómo:
- La sesión del panel usa la cookie por defecto de Supabase,
  `sb-<proyecto>-auth-token` (a veces partida en `.0`, `.1`), con `path: "/"` y
  sin `httpOnly` (`@supabase/ssr`, `DEFAULT_COOKIE_OPTIONS`). La del local se
  llama `sb-local` (`cookiesDeArea` en `lib/supabase.ts`), así que no se
  confunden.
- `lib/supabase.ts` suma una función chica que dice si un texto de cookies
  trae la del panel, para no repetir la regla del nombre.
- `Nav.tsx` ya es un componente del navegador: la lee después de montar (un
  `useEffect`), así que la landing sigue siendo estática y el primer dibujo es
  el de siempre, sin link. El link aparece un instante después y, en la
  compu, corre "Mi local" un poco a la izquierda. Sólo le pasa a quien tiene
  la sesión del panel.
- `content/nav.ts` suma `navEquipo = { label: "Panel", href: "/admin" }` al
  lado de `navPanel`.

Para el resto de la gente no cambia nada: el link no está en el HTML, sólo en
el código del nav, como una regla.

**Lo que no resuelve:** una cookie no dice si la cuenta es admin, sólo que
alguien entró. Para eso está A2.

### A2. "Sin acceso" cierra la sesión sola

Hoy, si alguien que no es del equipo entra con Google, la base lo manda a
`/admin/sin-acceso` y la sesión **queda abierta**: con A1 vería "Panel" en el
nav.

Cambio: `leer()` en `lib/admin/datos.ts` manda a una ruta nueva,
`/admin/auth/sin-acceso` (`POST` no sirve en un `redirect`: es un `GET`), que
cierra la sesión del panel y sigue a `/admin/sin-acceso`. Una página no puede
escribir cookies; una ruta sí. La página "Esta cuenta no es del equipo" pasa a
decir que ya se cerró la sesión y ofrece "Entrar con otra cuenta" en vez de
"Salir".

### A3. Salir del panel no saca de `/mi-local`

Hallazgo de esta lectura: `salir()` en `lib/supabase.ts` llama a
`supabase.auth.signOut()` sin `scope`, y el valor por defecto es `"global"`:
**revoca todas las sesiones de esa cuenta**. Si Fermín entra a `/admin` y a
`/mi-local` con la misma cuenta de Google, "Salir" en el panel también lo saca
de "Mi local" (y de la app, si usa esa cuenta).

Cambio: `signOut({ scope: "local" })`, que cierra sólo la sesión de esa
cookie. Vale para las dos áreas (`salir()` es la misma) y para A2. Ver **D3**.

### A4. Contacto desde la ficha y desde Cobros

En la ficha del local, bloque **Dueño**:
- **Mail** → link `mailto:`.
- **Teléfono** → link a WhatsApp (`https://wa.me/<número>`), con el número
  pasado a formato internacional argentino (`549` + área + número, sin `0` ni
  `15`). Si el número no se deja normalizar, queda como `tel:`.

En Cobros, **Altas a medias**: el mail también es `mailto:`.

La regla del teléfono va en `lib/admin/contacto.ts`; el `mailto:` es una
línea y queda en cada página. No hay link al mail del cliente en ningún otro lado
del panel.

---

## B. Registro, incidencias y prueba (BooKit primero)

### B1. El registro (BooKit)

Tabla `admin_acciones`: `id`, `id_usuario` (quién), `accion` (texto corto:
`resolver_incidencia`, `extender_prueba`), `id_comercio` (nullable),
`detalle jsonb` (lo que había antes y lo que quedó, más la nota),
`creado_el`. Sin grants, como `administradores`: la escriben y la leen sólo las
funciones `admin_*`.

**Toda función `admin_*` que escribe anota su fila en la misma transacción.**
No hay acción sin registro.

En la web: la ficha del local suma un bloque **"Lo que hizo el equipo"** (fecha,
quién, qué, nota) al pie. `admin_comercio` lo devuelve. Ver **D10**.

### B2. Resolver una incidencia

BooKit: `admin_resolver_incidencia(p_id_pago_mp text, p_nota text)` pone
`resuelto_el = now()` y deja la nota en el registro. Rechaza si ya estaba
resuelta. `admin_cobros` y `admin_comercio` suman `id_pago_mp` a cada
incidencia (hoy no lo devuelven).

Web: en Cobros y en la ficha, cada incidencia abierta tiene **"Resolver"**, que
abre un diálogo con un campo **"Qué se hizo"** (obligatorio, una línea:
"La devolvió el local por transferencia") y **Resolver**. Al cerrar se relee
la página y la fila desaparece de las abiertas. Ver **D5**.

### B3. Extender la prueba de un local

BooKit: `admin_extender_prueba(p_id_comercio uuid, p_dias int, p_nota text)`.
Sólo para un local con `plan_suscripcion = 'prueba'` y sin dar de baja; mueve
`vencimiento_suscripcion` (desde el vencimiento o desde hoy, lo que sea más
tarde) y, si estaba en gracia o cortada por fin de prueba, lo deja al día. De 1
a 60 días.

Web: en la ficha, bloque **Suscripción**, un botón **"Extender la prueba"**
sólo si el local está en prueba. Diálogo: días (7, 14, 30 u otro) y nota
opcional.

**Por qué sólo esto (D6):** los locales que pagan tienen a otro del lado de la
plata. Si el panel mueve el vencimiento de un local de Mercado Pago, el
próximo débito o `auditar_suscripciones()` lo pisan; si es de la tienda, lo
pisa RevenueCat. `es_fundador` cambia el precio (30% menos, "lo escribe el
servidor"), y tocarlo a mano deja un precio que Mercado Pago no cobra. Cortar o
reactivar a mano tiene el mismo problema. La prueba, en cambio, no la cobra
nadie.

---

## C. Buscar personas (BooKit primero)

BooKit:
- `admin_personas(p_busqueda text, p_limite int, p_desde int)`: busca por mail
  o nombre en las cuentas. Devuelve mail, nombre, alta, último ingreso y si es
  dueño de un local o profesional de uno.
- `admin_persona(p_id_usuario uuid)`: la ficha. Cuenta (mail, nombre,
  teléfono, alta, último ingreso, proveedor: Google, Apple o mail), **sus
  locales** (como dueño o profesional, con link), **sus últimos 20 turnos como
  cliente** (fecha, local, servicio, estado, cómo se pagó) y **sus puntos** por
  local.

Web: una cuarta sección en el nav, **"Personas"** (`/admin/personas` y
`/admin/personas/[id]`), con la misma búsqueda, tabla y paginado que
Comercios. Las piezas de la tabla y la búsqueda se sacan a `piezas.tsx` si
hoy viven en la página de Comercios, para no copiarlas. En la ficha de un
local, el dueño pasa a ser un link a su ficha de persona. Ver **D7**.

---

## D. Plata y comparación (BooKit primero)

Hoy "Pagos de suscripción" cuenta pagos: **la base no guarda cuánto se pagó**
(`pagos_suscripcion` tiene `mp_payment_id`, `plan` y la fecha, nada más).

BooKit, según **D8**:
- `pagos_suscripcion` suma `monto` (lo trae el pago que ya lee
  `webhook-saas-mp`), desde ahora en adelante;
- `admin_pulso` suma:
  - **"Cobrado en suscripciones"**: la suma de los montos del mes (los pagos
    viejos, sin monto, no cuentan);
  - **"Ingreso mensual estimado"**: cada local pagando por Mercado Pago, con
    el precio de lista de su plan y nivel llevado a 30 días. Los de la tienda
    van aparte, como cantidad, porque lo que cobran Apple y Google no está en
    la base;
  - **el mes anterior** de altas, bajas, reservas y lo cobrado, para mostrar
    los dos meses lado a lado.

Web: en Pulso, la cifra "Pagos de suscripción" pasa a ser "Cobrado en
suscripciones" (en pesos, con la cantidad de pagos en el detalle), se suma
"Ingreso mensual estimado" y las cifras que tienen mes anterior lo muestran
en el detalle, sin porcentaje. Sin gráficos nuevos.

---

## E. Avisos (sólo BooKit)

Ya existe un mail diario a las 04:00 (`alerta_jobs`) que manda los jobs rotos y
las incidencias sin resolver, **sólo si hay algo**. No hace falta otro canal:
se suma a ese mismo mail, con la misma regla de no mandar nada si no hay
novedades:

- **Locales que pasaron a gracia, cortada o suspendida** en las últimas 24 h
  (nombre, plan, quién cobra);
- **Altas a medias nuevas** de las últimas 24 h (mail y plan);
- cada fila con el link a su ficha en `/admin`.

Ver **D9**.

---

## Decisiones

**D1. Dónde va el link "Panel".**
- **(Recomendada)** En el nav de la compu, después de "Mi local", y en el menú
  del celular, debajo de "Mi local". Con el mismo estilo quieto que "Mi local".
- Sólo en la compu.

**D2. Qué hace "Sin acceso".**
- **(Recomendada)** Cierra la sesión sola (A2) y ofrece entrar con otra cuenta.
- Como hoy: queda abierta y la cierra la persona con "Salir".

**D3. Salir de un área no saca de la otra.**
- **(Recomendada)** `scope: "local"` en `salir()`: salir del panel no te saca
  de `/mi-local` ni de la app, y al revés.
- Como hoy (`global`): salir de una cierra todas las sesiones de la cuenta.

**D4. El WhatsApp del dueño.**
- **(Recomendada)** Link a `wa.me` con el número normalizado; si no se puede,
  `tel:`.
- Sólo `tel:`.

**D5. Resolver una incidencia pide nota.**
- **(Recomendada)** Sí, obligatoria: es lo único que dice después qué pasó con
  esa plata.
- Opcional.

**D6. Qué se puede tocar de la suscripción.**
- **(Recomendada)** Sólo extender la prueba (B3). Lo demás choca con quien
  cobra.
- Además, dar días de cortesía a un local de Mercado Pago cortado (habría que
  definir con BooKit qué hace el débito siguiente).
- Además, marcar o desmarcar fundador (habría que definir con BooKit qué pasa
  con el precio que ya cobra Mercado Pago).

**D7. Qué muestra la ficha de una persona.**
- **(Recomendada)** Cuenta, sus locales, sus últimos 20 turnos y sus puntos.
- Sólo cuenta y locales (soporte a dueños, no a clientes).

**D8. De dónde salen los pesos.**
- **(Recomendada)** Las dos cosas: guardar el monto de cada pago desde ahora
  (el número real, que se va llenando) y el ingreso estimado por precio de
  lista (el número de hoy, que ya sirve).
- Sólo el estimado por precio de lista: no toca el webhook.
- Sólo el monto real: hasta que haya un mes entero de pagos, la cifra es
  parcial.

**D9. Avisos.**
- **(Recomendada)** En el mail de las 04:00 que ya existe.
- Un mail aparte, en el momento en que un local se corta (lo manda
  `auditar_suscripciones()`).
- Push a la app (hoy la app no sabe quién es admin).

**D10. El registro se ve en el panel.**
- **(Recomendada)** Sí, al pie de la ficha de cada local.
- Sólo se guarda; se mira en Supabase si hace falta.

**D11. Administradores desde el panel.**
- **(Recomendada)** No por ahora: hoy el equipo es una persona y la fila se
  carga una vez a mano. Se vuelve a ver cuando entre alguien más.
- Sí: una sección para sumar y sacar admins por mail.

## Cómo se prueba

- **A:** con la sesión del panel, el link aparece en la landing (compu y menú
  del celular); en una ventana privada, no. Salir del panel y ver que
  `/mi-local` sigue abierto. Entrar al panel con una cuenta que no es del
  equipo: cae en "Sin acceso", la sesión se cierra y el link no aparece. Los
  links de mail y WhatsApp abren lo que tienen que abrir (Fermín, en Safari).
- **B:** resolver una incidencia de prueba y ver que sale de Cobros, que queda
  en el registro de la ficha y que no aparece en el mail siguiente. Extender
  la prueba de un local de prueba y ver el vencimiento nuevo; el botón no
  aparece en uno que paga.
- **C:** buscar a Fermín por mail y ver sus locales y turnos.
- **D:** comparar el estimado con la cuenta a mano de los locales que pagan.
- **E:** lo prueba el chat de BooKit con un local de prueba que vence.
