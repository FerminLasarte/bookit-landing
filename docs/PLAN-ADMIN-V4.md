# El panel del equipo (/admin) — v4

> **Hecho y en producción el 24 de octubre de 2026.** Aprobado el 23 con la
> recomendada de cada decisión D1–D11. Sale de los puntos 3 a 6 de **Para más
> adelante** de `docs/PLAN-ADMIN-V3.md`. La base es de BooKit, con el contrato
> en BooKit `docs/admin-panel.md` (secciones 18 a 21); la web, un PR por paso:
> M #83, N #84, O #85 y P #86. Lo probado y lo que falta está al final, en
> **Estado**.

## Qué es

Cuatro arreglos que dejó la v3, de menor a mayor:

1. **Los días de gracia los dice la base** (punto 5 de la v3), en vez de estar
   copiados en la web.
2. **Pulso estima con lo que cobra cada débito** (punto 6), no con el precio
   de lista.
3. **Cada admin elige si recibe los avisos** (punto 4), en vez de una sola
   casilla.
4. **Suspender y reactivar un local a mano** (punto 3), para un caso de abuso.

**Queda afuera:**
- **Lo que cobran Apple y Google** (punto 1 de la v3): va en un plan propio,
  con sus decisiones (moneda, bruto o neto, desde cuándo).
- **La pausa que pide el propio local** (punto 2 de la v3): primero la decide
  y la hace el chat de BooKit (idea 11, con release de la app).
- La app, `/planes` y la landing. `/mi-local` ya tiene el cartel de
  "Tu cuenta está suspendida" (`content/mi-local.ts`): no cambia.

Lo de siempre: el panel entra con la sesión de la persona y nunca con la
service role; cada `admin_*` empieza por `_exigir_superadmin()`; toda acción
deja su fila en `admin_acciones` en la misma transacción.

## Cómo se reparte el trabajo

Todo toca la base: va por **prompt al chat de BooKit**, que deja el contrato
en BooKit `docs/admin-panel.md` (secciones nuevas desde la 18). La web se
escribe sobre la base ya cambiada. Los pasos siguen las letras de la v3, que
terminó en L.

| Paso | Qué | Dónde | Depende de |
| --- | --- | --- | --- |
| **M** | Días de gracia desde la base | BooKit, después web | nada |
| **N** | El monto de cada débito | BooKit, después web | D1, D2 |
| **O** | Avisos por admin | BooKit, después web | D3–D5 |
| **P** | Suspender y reactivar | BooKit, después web | D6–D11 |

Los cuatro se piden a BooKit en **un solo prompt**; la web suma un PR por
paso, en orden.

---

## M. Los días de gracia desde la base

Hoy el diálogo de cortesía dice "pasa a en gracia 7 días" con un número
copiado en la web (`diasDeGracia` en `content/admin.ts`) desde
`planes.dias_gracia` de BooKit. Si BooKit cambia la gracia de un plan, el
diálogo miente hasta que alguien lo note.

BooKit: `admin_comercio` suma `dias_gracia`, la gracia del plan actual del
local tal como está en `planes` (hoy: 7 la prueba, 2 el semanal, 7 el
mensual, 14 el anual, 0 la vitalicia).

Web: `DarCortesia` lee `c.dias_gracia` y sale `diasDeGracia`. Sin decisiones.

## N. El monto de cada débito

Hoy "Ingreso mensual estimado" de Pulso toma, para cada local que paga por
Mercado Pago, **el precio de lista** de su nivel y plan, con el 30% menos si
es fundador. No es lo que cobra:
- un débito sigue cobrando el monto con que se creó, aunque la lista suba o
  se lo marque fundador después (lo dijo la v3, D12);
- un débito de un cambio de plan cobra otro nivel o plan que el que tiene el
  local hoy (`plan_debito`, `nivel_debito`);
- los débitos de la app vieja cobran el precio de `planes` de cuando se
  crearon.

Mercado Pago sí lo sabe: cada débito tiene su `transaction_amount`, y
`webhook-saas-mp` ya lo consulta para validar cada pago.

BooKit, según **D1**:
- `comercios.monto_debito`: lo que cobra el débito vivo en cada ciclo, en
  pesos. Lo escribe `debito_mp_autorizado()` con el monto que trae el aviso
  de autorizado, y se borra cuando se suelta el débito (`soltar_debito_mp()`,
  `soltarDebitosPorLaTienda`).
- Una pasada única que consulta a Mercado Pago los débitos vivos de hoy y
  llena el monto.
- `admin_pulso`: el estimado usa `monto_debito` llevado a 30 días con el
  ciclo de `plan_debito`. Sin monto (no debería quedar ninguno después de la
  pasada), el precio de lista como hoy.
- `admin_comercio` suma `monto_debito`.

Web (según **D2**):
- Pulso: el detalle de la cifra deja de decir "a precio de lista".
- La ficha del local: la fila "Débito de Mercado Pago" pasa de "Activo" a
  "Activo · $19.100 por mes" (o "por semana", "por año").

## O. Avisos por admin

Hoy los dos mails del equipo (el de las 04:00 y el "Bookit, recién") van a
`ALERTAS_EMAIL`, un secreto de Supabase. Con más de una persona en el equipo,
o alguien que no los quiere, no alcanza.

BooKit, según **D3–D5**:
- `administradores.recibe_avisos boolean`, `true` por defecto al sumar a
  alguien.
- `admin_cambiar_avisos(p_id_usuario uuid, p_recibe boolean)`: con su fila en
  el registro (`cambiar_avisos`). Rechaza dejar al equipo sin nadie que
  reciba (`ultimo_que_recibe`).
- `alerta_jobs` y `alerta_al_momento` mandan a los mails de los admins con
  `recibe_avisos`, y dejan de leer `ALERTAS_EMAIL`.
- `admin_equipo` suma `recibe_avisos` a cada admin.

Web: en Equipo, una columna **"Avisos"** con una píldora "Recibe" / "No
recibe"; la otra opción cambia, sin diálogo ni nota (es una preferencia, no
una decisión sobre un local). El registro dice "Activó los avisos de …" /
"Apagó los avisos de …".

## P. Suspender y reactivar

### Qué es suspender hoy (lo leído en BooKit)

`suspendida` es el estado administrativo: **el local no entra** a gestionar
(ni la app ni `/mi-local`, que muestra "Tu cuenta está suspendida… no se
resuelve desde acá"), **no aparece ni toma turnos**, y nadie lo levanta solo:
la auditoría no lo toca, `sincronizar_tienda` lo respeta y `/planes` no le
vende. Hoy sólo lo pone la baja de cuenta, que además da de baja el débito.

Ocultar (F de la v2) es otra cosa: el local no aparece, pero sigue entrando y
no se entera. Suspender es para cuando el local no tiene que poder usar
Bookit: abuso, fraude, un pedido legal.

### Lo que hay que resolver

- **El débito sigue cobrando.** Mercado Pago no se entera: cobraría a un local
  suspendido. Darlo de baja es una llamada a Mercado Pago, que sólo puede
  hacer una edge function (D7).
- **Un pago levanta la suspensión.** `renovar_suscripcion()` deja al día a
  cualquiera que paga, también a un suspendido. Hoy no pasa porque la baja de
  cuenta suelta el débito antes, pero un pago que ya estaba en camino lo
  haría. Hay que arreglarlo antes de suspender desde el panel.
- **La tienda no se cancela** desde el servidor: Apple o Google le siguen
  cobrando (D8).

### BooKit

- `renovar_suscripcion()` no toca el estado de un local suspendido; el pago
  queda registrado y va como incidencia (`suscripcion_suspendida`) para
  devolverlo.
- `admin_suspender(p_id_comercio uuid, p_nota text)`: nota obligatoria. Pasa
  a `suspendida` y, si tiene débito de Mercado Pago, lo da de baja según D7.
  Devuelve `{ turnos_por_delante, tenia_debito_mp, de_la_tienda }`. Rechaza
  de baja, ya suspendido, inexistente.
- `admin_reactivar(p_id_comercio uuid, p_nota text)`: nota obligatoria.
  Vuelve según D9. Rechaza si no está suspendido o si la suspensión es de una
  baja de cuenta.
- Las dos con su fila (`suspender`, `reactivar`), y el cambio de estado sale en
  la historia con "Desde el panel".

### Web

- En la ficha, debajo de Visibilidad, un bloque **"Acceso"**: "Entra a
  gestionar" o "Suspendido por el equipo", con **"Suspender"** o
  **"Reactivar"**.
- El diálogo de suspender dice qué pasa: no entra, no aparece, el débito se da
  de baja; según D8, lo de la tienda; según D10, los turnos que tiene por
  delante. Pide "Por qué".
- El diálogo de reactivar dice cómo queda (D9).
- El registro: "Lo suspendió" / "Lo reactivó".

---

## Decisiones

**D1. De dónde sale lo que cobra cada débito.**
- **(Recomendada)** Guardarlo al autorizarse el débito (`monto_debito`) y
  llenar una vez los vivos consultando a Mercado Pago. Es el número de verdad
  desde el primer día.
- Usar el monto del último pago (`pagos_suscripcion.monto`): no toca el
  webhook, pero sólo hay montos desde el 23-oct, y un local en prueba con
  débito armado no tiene ninguno.
- Dejarlo como está y aclarar en Pulso que es a precio de lista.

**D2. Mostrar el monto en la ficha.**
- **(Recomendada)** Sí: "Activo · $19.100 por mes". Es lo que hace falta para
  ver si un fundador marcado ya paga el precio nuevo.
- No: sólo cambia Pulso.

**D3. A quién le llegan los avisos.**
- **(Recomendada)** A los admins que eligen recibirlos; `ALERTAS_EMAIL` se
  deja de usar. Una sola fuente: la tabla.
- A `ALERTAS_EMAIL` y además a los admins que elijan (por si la casilla es
  compartida, tipo hola@).

**D4. Quién cambia si alguien recibe avisos.**
- **(Recomendada)** Cualquier admin, el de cualquiera, con su fila en el
  registro. Con dos o tres personas, se arregla hablando.
- Cada uno sólo el suyo.

**D5. Uno o dos interruptores.**
- **(Recomendada)** Uno para los dos mails (el de las 04:00 y el del
  momento): son lo mismo, uno resume al otro.
- Dos, uno por mail.

**D6. Suspender existe en el panel.**
- **(Recomendada)** Sí, con nota obligatoria y el aviso de qué pasa, para
  abuso o fraude. Ocultar sigue siendo lo de todos los días.
- No por ahora: se hace a mano en Supabase el día que haga falta (y antes se
  arregla igual `renovar_suscripcion()`).

**D7. Cómo se da de baja el débito de Mercado Pago.**
- **(Recomendada)** Lo hace la base: `admin_suspender` deja el pedido y una
  edge function lo da de baja en el momento (como `notificar_turno`, con
  `pg_net`), y lo reintenta si Mercado Pago falla. La web sigue llamando sólo
  a funciones de la base.
- La web llama a una edge function con la sesión de la persona, que verifica
  que sea admin y da de baja el débito. Es la primera vez que el panel
  llamaría a algo que no es la base.
- No se da de baja: el débito sigue y lo que cobre se devuelve a mano.

**D8. Suspender a un local de la tienda.**
- **(Recomendada)** Se puede: el diálogo avisa que Apple o Google le siguen
  cobrando hasta que el dueño cancele en su teléfono, y que el reembolso lo
  pide él a la tienda.
- No se puede: la base lo rechaza (`de_la_tienda`). Para esos queda Ocultar.

**D9. Cómo vuelve al reactivar.**
- **(Recomendada)** Según su vencimiento: al día si le quedan días pagos,
  cortado si no. Como el débito se dio de baja, al vencer se corta sin gracia
  y tiene que volver a suscribirse en `/planes`.
- Siempre al día, con días de cortesía que elige el equipo en el mismo
  diálogo.

**D10. Los turnos que ya tiene.**
- **(Recomendada)** No se cancelan: el diálogo dice cuántos tiene por delante,
  como al ocultar. Los clientes los ven igual y el equipo decide si avisarle
  al local.
- Se cancelan todos, con aviso a cada cliente (necesita un envío nuevo en
  BooKit).

**D11. Avisarle al local.**
- **(Recomendada)** No hay aviso automático: lo ve al entrar ("Tu cuenta está
  suspendida") y el equipo le escribe por el mail o el WhatsApp de la ficha.
- Un mail automático al suspender y al reactivar.

## Cómo se prueba

Como en la v3: en producción, con la sesión del panel, sobre datos que crea y
después borra el chat de BooKit.

- **M:** la cortesía de un local mensual dice 7 días y la de uno semanal, 2.
- **N:** después de la pasada única, la ficha del local de prueba con débito
  dice su monto; Pulso cambia el estimado y su detalle ya no dice "a precio
  de lista". Comparar a mano con los débitos vivos.
- **O:** apagar los avisos de un admin de prueba y ver la fila en el registro;
  que no deje apagar al último que recibe. Con una incidencia de prueba, el
  mail llega sólo a quien recibe (lo mira Fermín en su casilla).
- **P:** suspender el local de prueba con débito: el aviso del diálogo, el
  estado, la historia, el registro y que el débito quedó dado de baja (lo mira
  el chat de BooKit en Mercado Pago). `/mi-local` con la cuenta del dueño de
  prueba muestra el cartel. Reactivarlo y ver cómo vuelve. Un pago simulado a
  un suspendido no lo levanta y queda como incidencia.

## Estado (24-oct)

**En producción.** La base, del chat de BooKit: `20261024000000` a
`20261024000300` (M a P) y `20261024010150` (sacar del equipo cuida los
avisos), con `webhook-saas-mp`, `alerta_jobs` y `alerta_al_momento`
redesplegadas y la edge function nueva `cancelar_debitos_suspendidos`. La web,
en `main` desde #83 a #86.

**Lo que cambió en el camino (BooKit):**
- **N:** el monto del débito lo borra un trigger cuando cambia el débito (cubre
  también la baja de cuenta). La pasada única no llenó ninguno: en producción
  no había ningún débito real vivo.
- **O:** `ALERTAS_EMAIL` se borró; los mails van en uno solo a todos los que
  reciben. Sacar del equipo a la única persona que recibe también se rechaza
  (`ultimo_que_recibe`).
- **P:** la baja del débito es asíncrona (segundos; si Mercado Pago falla,
  reintenta cada 10 minutos y a la media hora sale en el mail de las 04:00).
  Reactivar un local que nunca empezó la prueba lo deja `pendiente`. El equipo
  del local suspendido ve "Espacio de trabajo en pausa", no "suspendido": el
  diálogo lo dice.

**Probado en producción el 24-oct**, con la sesión del panel, sobre locales
de prueba del chat de BooKit (`a4a40000-…`, "(borrar)"):
- **M:** la cortesía dice 7 días en el mensual y 2 en el semanal.
- **N:** la ficha del mensual dice "Activo · $19.100 por mes"; Pulso dice "Lo
  que cobran los débitos de Mercado Pago, llevado a 30 días".
- **O:** apagar los avisos del único que recibe da el error y no cambia nada;
  apagar y prender los del admin de prueba anda, con sus dos filas en el
  registro.
- **P:** suspender y reactivar el semanal (sin débito) y el de la tienda: el
  aviso de cada caso, "Acceso", "está suspendido" en Visibilidad, la historia
  con "Desde el panel" y el registro. El semanal volvió cortado (había vencido)
  y el de la tienda, al día, como dijo el diálogo.

**Sin probar:**
- **Que la baja del débito ande de verdad.** El local de prueba con débito
  tenía uno falso: suspenderlo habría dejado el reintento fallando cada 10
  minutos. Hace falta un débito pendiente real en Mercado Pago, como el que usó
  BooKit para probar la base.
- **El aviso de turnos por delante al suspender**, por lo mismo: el único local
  con turnos era el del débito falso.
- **Un pago que llega a un local suspendido** (la incidencia
  `suscripcion_suspendida`): lo probó BooKit en la base; en la web sólo es el
  texto del motivo.

Los locales y la cuenta de prueba quedan para que los borre el chat de BooKit,
con sus filas del registro.
