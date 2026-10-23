# El panel del equipo (/admin) — v3

> **Hecho y en `main` el 23 de octubre de 2026.** Aprobado ese día con la
> recomendada de cada decisión D1–D14. Sale de **Para más adelante** de
> `docs/PLAN-ADMIN.md` (la v2). La base es de BooKit, con el contrato en
> BooKit `docs/admin-panel.md` (secciones 12 a 17); la web, un PR por paso: G
> #72, H #74, I #75, K #76 y L #77. J es sólo de BooKit. Lo que cambió en el
> camino, lo verificado y lo que quedó afuera está al final, en **Estado** y
> **Para más adelante**.

## Qué es

La v2 dejó el panel mirando y con cuatro acciones (resolver una incidencia,
extender la prueba, ocultar un local, el registro). La v3 suma, en dos tandas:

**Tanda 1, casi técnica**
1. **Lo que el registro no conoce** muestra su nombre (ítem 7 de la v2).
2. **La historia del estado de un local** en su ficha (ítem 4).
3. **Las altas a medias linkean a la persona** (ítem 6).
4. **Administradores desde el panel**: sumar y sacar por mail (ítem 1, D11 de
   la v2).
5. **Avisos en el momento**, además del mail de las 04:00 (ítem 3, D9 de la
   v2).

**Tanda 2, con decisiones de negocio** (ítem 2, D6 de la v2)
6. **Días de cortesía** a un local de Mercado Pago que no pagó.
7. **Marcar o desmarcar fundador.**
8. **Cortar o reactivar a mano**: la recomendación es no hacerlo (D13).

**Queda afuera:**
- **Lo que cobran Apple y Google** (ítem 5): es una integración con
  RevenueCat y va en un plan propio.
- **La pausa que pide el propio local** (ítem 8): primero BooKit tiene que
  hacer la pausa (idea 11 de BooKit `docs/ideas.md`).
- La app, `/mi-local`, `/planes` y la landing.

Lo de siempre: el panel entra con la sesión de la persona y nunca con la
service role; cada función `admin_*` empieza por `_exigir_superadmin()`; toda
acción deja su fila en `admin_acciones` en la misma transacción que el cambio.

## Cómo se reparte el trabajo

Lo que toca la base va por **prompt al chat de BooKit**, que deja el contrato
en BooKit `docs/admin-panel.md` (secciones nuevas a partir de la 12). La web se
escribe sobre la base ya cambiada. Los pasos siguen las letras de la v2, que
terminó en F.

| Paso | Qué | Dónde | Depende de |
| --- | --- | --- | --- |
| **G** | Lo que el registro no conoce | sólo web | nada |
| **H** | Historia del estado + altas a medias con link | BooKit, después web | D1, D2 |
| **I** | Administradores | BooKit, después web | D3–D5 |
| **J** | Avisos en el momento | sólo BooKit | D6–D8 |
| **K** | Días de cortesía | BooKit, después web | D9–D11 |
| **L** | Fundador | BooKit, después web | D12–D13 |

G sale primero y sola. H a L se piden a BooKit en **un solo prompt**, con la
tanda 1 primero; la web va sumando un PR por paso.

---

## Tanda 1

### G. Lo que el registro no conoce (sólo web)

Hoy `queHizo()` en la ficha del local (`app/admin/(panel)/comercios/[id]/page.tsx`)
tiene un `case` por acción y ningún `default`: una acción que la web todavía no
conoce deja la celda "Qué" vacía. Pasa cada vez que BooKit suma una acción
antes que la web, y con K y L va a pasar.

Cambio: una rama más, que muestra el nombre tal como viene
(`dar_cortesia`), en gris. La nota se sigue mostrando.

De paso, lo mismo con los motivos de incidencia: `motivosIncidencia` en
`content/admin.ts` no tiene los dos de las suscripciones, que la base ya anota
(`suscripcion_no_verificada` y `suscripcion_doble`, BooKit
`_shared/incidencias_pago.ts`). Hoy saldrían con el nombre técnico. Se suman en
criollo: "Pago de suscripción sin verificar" y "Pago doble (ya paga en la
tienda)".

### H. Historia del estado y altas a medias con link (BooKit primero)

**H1. La historia del estado.** BooKit anota cada cambio de
`estado_suscripcion` en `comercios_cambios_de_estado` desde el 23-oct, con un
trigger, venga de donde venga. Hoy sólo lo lee el mail de las 04:00.

BooKit: `admin_comercio` suma `cambios_de_estado`: `[{ cambiado_el,
estado_anterior, estado_nuevo, por_el_equipo }]`, de lo más nuevo a lo más
viejo. `por_el_equipo` es `true` cuando el cambio lo hizo una acción del panel:
el trigger y la fila de `admin_acciones` caen en la misma transacción, así que
tienen el mismo `now()` y el mismo local. No hace falta tocar el trigger.

Web (según **D1**): un bloque **"Historia de la suscripción"** debajo de
Suscripción y Dueño: fecha, "Al día → En gracia" con los mismos colores de
`EstadoBadge`, y "Desde el panel" cuando corresponde. Si no hay cambios: "Sin
cambios desde el 23 de octubre de 2026, cuando se empezó a guardar." Sin
paginado: un local cambia de estado pocas veces.

**H2. Las altas a medias linkean a la persona.** BooKit: `admin_cobros` suma
`id_usuario` a cada fila de `altas_abandonadas` (el mail de las 04:00 ya lo
usa). Web, según **D2**.

### I. Administradores (BooKit primero)

Hoy la tabla `administradores` se carga a mano con un `insert`. Con la v3 se
suma y se saca desde el panel.

BooKit:
- `admin_equipo()`: los admins (`id_usuario`, mail, nombre, desde cuándo y
  quién lo sumó, si lo sumó el panel) y **el registro entero**, las últimas
  100 filas de `admin_acciones` con el local si lo tiene. Hoy una acción sin
  local (una incidencia sin local, y ahora sumar o sacar un admin) queda
  guardada pero no se ve en ningún lado.
- `admin_sumar_admin(p_email text, p_nota text)`: busca la cuenta por mail
  (sin distinguir mayúsculas) y la suma. Errores: `mail_obligatorio`,
  `cuenta_inexistente` (según **D3**), `ya_es_admin`.
- `admin_sacar_admin(p_id_usuario uuid, p_nota text)`. Errores:
  `no_es_admin`, `a_vos_mismo` (según **D4**).
- Las dos dejan su fila: `sumar_admin` / `sacar_admin`, sin local, con
  `{ "despues" | "antes": { "id_usuario", "email" }, "nota" }`.

Sacar a alguien tiene efecto en su próxima llamada: la base mira la tabla en
cada `admin_*`, así que cae en "Sin acceso", que le cierra la sesión (A2 de la
v2). No hace falta nada más.

Web (según **D5**): una quinta sección en el nav, **"Equipo"**
(`/admin/equipo`):
- **Administradores**: tabla con mail, nombre (link a su ficha de persona) y
  desde cuándo; cada fila tiene **"Sacar"** menos la propia. Arriba,
  **"Sumar a alguien"**: un diálogo con el mail y una nota opcional.
- **Lo que hizo el equipo**: el registro entero, con fecha, quién, qué (la
  misma frase de la ficha, con `queHizo()` sacado a un módulo compartido para
  no escribirlo dos veces) y el local con link si lo tiene.

Los diálogos usan `DialogoDeAccion`, como las acciones de la v2.

### J. Avisos en el momento (sólo BooKit)

Lo que hay hoy: `auditar_suscripciones()` corre a las 03:00 UTC (las 00:00 en
Buenos Aires) y el mail sale a las 04:00 UTC (la 01:00). Para los locales que
corta la auditoría, "en el momento" es una hora antes: no cambia nada.

Lo que sí pasa a cualquier hora y hoy espera hasta la madrugada:
- **las incidencias de pago** (`mp_webhook`, `devolver_turno`,
  `webhook-saas-mp`): plata de un cliente que no se pudo aplicar, una
  devolución que falló, o un local que pagó dos veces (Mercado Pago y la
  tienda) y hay que devolverle;
- **los locales de la tienda que pasan a gracia o cortada** (lo escribe
  `webhook-revenuecat` cuando llega el aviso);
- **las altas a medias**, que nacen cuando alguien toca "Suscribirme" en
  `/planes`.

BooKit, según **D6–D8**: un job cada 10 minutos que junta lo nuevo desde el
envío anterior y manda **un solo mail** si hay algo, con el mismo formato y los
mismos links al panel que el de las 04:00. Va por cron y no un mail por evento
para que diez cosas juntas sean un mail y no diez. Se vigila como los demás
jobs (`jobs_vigilados`). El mail de las 04:00 sigue igual: es el resumen del
día, y las incidencias salen ahí hasta que alguien las resuelve.

---

## Tanda 2: la suscripción

### Cómo se cobra hoy (lo leído en BooKit)

- **Mercado Pago.** El débito cobra el día que pactó con Mercado Pago, que no
  se entera de lo que cambie la base. Cada pago entra por `webhook-saas-mp` →
  `registrar_pago_suscripcion()` → `renovar_suscripcion()`, que deja el local
  al día y le **suma** el ciclo al vencimiento, contado desde hoy o desde el
  vencimiento si es más tarde: los días que tenía no se pierden.
- **`auditar_suscripciones()`**, todas las noches, mira **sólo** el vencimiento
  y el estado de los locales de Mercado Pago: vencido y al día → en gracia
  (los días de gracia de su plan: 2 el semanal, 7 el mensual, 14 el anual);
  terminada la gracia → cortada; vencido y con `cancela_al_vencer` → cortada
  sin gracia. No toca los de la tienda ni el vitalicio.
- **El débito que se cancela** (lo canceló el dueño o Mercado Pago) pasa por
  `soltar_debito_mp()`: el local se queda sin débito, con
  `cancela_al_vencer = true`, y entra hasta el vencimiento.
- **La tienda.** `webhook-revenuecat` y `sincronizar_tienda` (todas las noches,
  a las 03:45 UTC) le piden a RevenueCat el estado y **le reescriben** al
  local el vencimiento, el estado, el plan y el nivel. Lo único que respetan es
  `suspendida`. Nada de lo que el panel le escriba a un local de la tienda
  dura más de una noche.
- **Fundador** (`comercios.es_fundador`): hoy no lo escribe nada; se marca a
  mano en Supabase. Lo leen:
  - la web, para el precio de un débito **nuevo** (30% menos, a la centena,
    `_precio_web()`). Un débito vivo sigue cobrando el monto con que se creó:
    `precios_web` lo dice, y `webhook-saas-mp` compara cada pago con el monto
    que tiene el débito en Mercado Pago, no con la lista;
  - la app, para mostrarle los productos del fundador de la tienda. Una compra
    que ya tiene sigue con su producto hasta que la cambie el dueño;
  - Pulso, para el ingreso estimado (precio de lista con el descuento).
- **`/planes` no deja recomprar el mismo plan** (`es_el_actual`): a quien ya
  paga Pro mensual a precio de lista, marcarlo fundador no le baja nada hasta
  que cambie de plan, o cancele y vuelva a suscribirse (sin perder días: el
  primer cobro sale al vencimiento).

### K. Días de cortesía (BooKit primero)

Para el local de Mercado Pago que no pagó y al que el equipo quiere darle
tiempo: un débito rechazado, una tarjeta vencida, alguien que avisó que paga la
semana que viene.

BooKit: `admin_dar_cortesia(p_id_comercio uuid, p_dias int, p_nota text)`,
según **D9–D11**:
- **A quién:** de Mercado Pago, plan semanal, mensual o anual, en gracia o
  cortado, sin dar de baja ni suspender. Al día, en prueba (para eso está
  extender la prueba), de la tienda o vitalicio: se rechaza, cada uno con su
  código (`no_es_de_mercado_pago`, `en_prueba`, `al_dia`, etc.).
- **Qué hace:** vencimiento = hoy + los días, estado al día. Es lo mismo que
  extender la prueba, contado desde hoy (el vencimiento viejo ya pasó).
- **Si Mercado Pago cobra durante la cortesía**, `renovar_suscripcion()` suma
  el ciclo al final de la cortesía: los días quedan regalados. No hay que
  cambiar nada (D10).
- **Si termina sin pago:** con débito vivo, la auditoría le da la gracia de su
  plan y después lo corta; sin débito (`cancela_al_vencer`), lo corta ese día.
  Si en esos días se suscribe en `/planes`, el primer cobro sale el día que
  termina la cortesía (`oferta_web` ya lo calcula así).
- **Devuelve** `{ estado, vencimiento, tiene_debito_mp, cancela_al_vencer }`,
  para que la web diga cuál de los dos casos es.
- Fila en el registro: `dar_cortesia`, con antes y después (estado y
  vencimiento), los días y la nota.

Web: en el bloque Suscripción, **"Dar días de cortesía"**, sólo cuando se
puede (la misma idea que `sePuedeExtender`). El diálogo es el de extender la
prueba con otro texto: días con atajos (7, 14) y nota. Antes de confirmar dice
qué pasa al terminar, según tenga débito o no. Como los dos diálogos son el
mismo formulario, `ExtenderPrueba` se generaliza en un componente de "días y
nota" que usan los dos, en vez de copiarlo.

### L. Fundador (BooKit primero)

BooKit: `admin_cambiar_fundador(p_id_comercio uuid, p_es_fundador boolean,
p_nota text)`, según **D12–D13**:
- cambia `es_fundador` y nada más: **no toca el débito de Mercado Pago ni la
  compra de la tienda**;
- rechaza `sin_cambios`, `comercio_inexistente`, `dado_de_baja` y
  `nota_obligatoria`;
- devuelve `{ es_fundador, canal, tiene_debito_mp }`;
- fila en el registro: `cambiar_fundador`, con antes, después y la nota.

Web: en Suscripción, una fila **"Precio"** ("Fundador, 30% menos" o "De
lista") con **"Marcar fundador"** o **"Sacar el precio fundador"**. El diálogo
dice qué cambia según quién cobra:
- **sin cobrar todavía** (prueba o pendiente): "Cuando se suscriba en la web,
  paga 30% menos. En la app ve los planes del fundador.";
- **débito de Mercado Pago vivo**: "El débito que ya tiene sigue cobrando lo
  mismo. Para pagar 30% menos tiene que cambiar de plan en /planes, o
  cancelar y volver a suscribirse: no pierde días.";
- **la tienda**: "Apple o Google le siguen cobrando lo mismo. En la app ve los
  planes del fundador y puede cambiarse.";
- al sacarlo, lo mismo al revés: lo que ya cobra a precio fundador sigue
  igual.

El registro dice "Lo marcó fundador" / "Le sacó el precio fundador".

### Cortar o reactivar a mano

No entra (D13):
- **Cortar** a un local que paga no dura: si es de Mercado Pago, el próximo
  pago lo deja al día otra vez (`renovar_suscripcion()`), y mientras tanto se
  le sigue cobrando a un local cortado; si es de la tienda, esa misma noche
  `sincronizar_tienda` lo vuelve a dejar como dice Apple o Google. Para que
  dure habría que dar de baja el débito en Mercado Pago (una llamada que sólo
  puede hacer una edge function, no una función de la base), y a la tienda no
  se le puede cancelar nada desde el servidor.
- **Para que un local no aparezca ya está Ocultar** (F de la v2): no toca la
  plata, el local no lo ve y se deshace con un clic.
- **Reactivar** a un local de Mercado Pago es la cortesía (K). A uno de la
  tienda no se puede, por lo mismo que cortarlo. Uno dado de baja tiene la
  cuenta borrada.

---

## Decisiones

### Tanda 1

**D1. La historia del estado en la ficha.**
- **(Recomendada)** Un bloque propio, "Historia de la suscripción", con "Desde
  el panel" en los cambios que hizo el equipo.
- Mezclada con "Lo que hizo el equipo" en una sola lista.
- Sólo el último cambio, en el bloque Suscripción ("Cortada desde el 12/10").

**D2. Altas a medias en Cobros.**
- **(Recomendada)** El mail pasa a ser el link a la ficha de la persona, como
  el nombre de un local lleva a su ficha. El `mailto:` queda en la ficha de la
  persona. Cambia lo que decía A4 de la v2.
- El mail sigue siendo `mailto:` y se suma un link "Ver ficha" al lado.

**D3. Sumar a alguien que todavía no tiene cuenta.**
- **(Recomendada)** No se puede: el error dice "Esa cuenta no existe: que
  entre una vez a /admin con Google y probá de nuevo". Va a caer en "Sin
  acceso", y con eso ya tiene cuenta.
- Una invitación por mail que queda pendiente y se aplica cuando entra por
  primera vez (tabla nueva en BooKit).

**D4. Quién se puede sacar.**
- **(Recomendada)** Cualquiera menos uno mismo. Así nunca queda el panel sin
  nadie y nadie se saca sin querer.
- Cualquiera, salvo el último que queda.

**D5. Dónde se ve el equipo.**
- **(Recomendada)** Una sección "Equipo" en el nav, con los admins y el
  registro entero.
- Una sección "Equipo" sólo con los admins; el registro sigue sólo en la ficha
  de cada local.

**D6. Qué llega en el momento.**
- **(Recomendada)** Las incidencias de pago nuevas, los locales que pasan a
  gracia, cortada o suspendida a cualquier hora (los de la auditoría de
  medianoche también, pero no ganan nada) y las altas a medias que siguen a
  medias una hora después (antes, la mayoría todavía está autorizando).
- Sólo las incidencias de pago.
- Todo lo del mail de las 04:00, también los jobs rotos.

**D7. Cómo llega.**
- **(Recomendada)** Un mail cada 10 minutos como mucho, con todo lo nuevo
  junto, y nada si no hay nada.
- Un mail por cada cosa, apenas pasa.
- Push a la app: la app no sabe quién es admin, necesita una release y
  guardar a qué teléfonos mandar.

**D8. A quién le llegan los avisos.**
- **(Recomendada)** A la misma casilla que el mail de las 04:00
  (`ALERTAS_EMAIL`): cambiarla es un secreto en Supabase.
- A todos los admins de la tabla: quien se suma con I empieza a recibir los
  mails.

### Tanda 2

**D9. A quién se le dan días de cortesía.**
- **(Recomendada)** Locales de Mercado Pago con plan pago, en gracia o
  cortados.
- También al día, para compensar algo (una caída, un error nuestro): los días
  se suman al vencimiento y el débito cobra igual el día pactado.
- Sólo cortados.

**D10. Si Mercado Pago cobra durante la cortesía.**
- **(Recomendada)** Los días quedan regalados: el ciclo pago se suma al final
  de la cortesía. Es lo que ya hace `renovar_suscripcion()`; no hay que tocar
  nada.
- La cortesía es un puente: el pago cuenta desde el vencimiento viejo y se
  come los días. BooKit tiene que guardar ese vencimiento y cambiar
  `renovar_suscripcion()`, que usan todos los pagos.

**D11. Días, gracia y nota de la cortesía.**
- **(Recomendada)** De 1 a 30 días; al terminar sin pago, la gracia de su plan
  como cualquier vencimiento (el diálogo lo dice); nota obligatoria, porque es
  plata que no se cobra (como D5 de la v2).
- De 1 a 60 días y nota opcional, como extender la prueba.
- Se corta el día que termina, sin gracia: BooKit guarda una marca de
  cortesía y la auditoría la mira.

**D12. Marcar fundador a quien ya paga.**
- **(Recomendada)** Sólo la marca: vale para el próximo débito o la próxima
  compra, y el diálogo dice cómo llegar al precio nuevo (cambiar de plan, o
  cancelar y volver a suscribirse sin perder días).
- Además, BooKit le baja el monto al débito vivo en Mercado Pago. Necesita una
  edge function (sólo ella tiene la clave de Mercado Pago), la primera que el
  panel llamaría directo en vez de una función de la base, y antes hay que
  confirmar que Mercado Pago deja bajar el monto sin que el dueño vuelva a
  autorizar.
- No se puede marcar a quien tiene un débito o una compra vivos.

**D13. Sacar el precio fundador, y quién puede tenerlo.**
- **(Recomendada)** Se puede sacar, con nota obligatoria, y vale para lo
  próximo: lo que ya cobra a precio fundador sigue igual (subirle el monto a
  un débito sin que el dueño lo autorice no corresponde). La base no valida
  quién puede ser fundador: la regla (la fecha de corte de cada ciudad, idea 9
  de BooKit) la aplica el equipo y queda en la nota.
- Marcar sí, sacar no: un error se corrige en Supabase.
- La base valida una fecha de corte por ciudad (antes hay que definirla).

**D14. Cortar o reactivar a mano.**
- **(Recomendada)** No: para que no aparezca está Ocultar, y reactivar es la
  cortesía (ver arriba).
- Sí, como "suspender": BooKit da de baja el débito de Mercado Pago con una
  edge function y deja `suspendida`, que ni el pago ni la tienda levantan. A
  un local de la tienda se le sigue cobrando: habría que decirle al dueño que
  cancele.

## Cómo se prueba

Lo que escribe en producción se prueba sobre datos que crea y después borra el
chat de BooKit, como en la v2. Nogal no se toca: está oculta a propósito.

- **G:** entre que BooKit sube K y sale el PR de K en la web, la ficha del
  local de prueba muestra `dar_cortesia` en gris en vez de una celda vacía.
  Los dos motivos nuevos se ven con una incidencia de prueba de suscripción.
- **H:** con un local de prueba que el chat de BooKit pasa por al día → en
  gracia → cortada, la ficha muestra los tres cambios; extenderle la prueba
  desde el panel suma uno con "Desde el panel". Un alta a medias de prueba en
  Cobros lleva a la ficha de su persona.
- **I:** sumar una cuenta de prueba por mail (en mayúsculas, para ver que la
  encuentra) y verla en Equipo y en el registro; sacarla. Que "Sacar" no
  aparezca en la fila propia; que un mail sin cuenta dé el error de D3. Si
  Fermín tiene otra cuenta de Google: sumarla, entrar con ella, sacarla y ver
  que la próxima página la lleva a "Sin acceso".
- **J:** el chat de BooKit anota una incidencia de prueba y el mail llega en
  menos de 10 minutos; resolverla desde el panel. Un mail solo para dos
  incidencias seguidas.
- **K:** un local de prueba de Mercado Pago cortado, con y sin débito: dar 7
  días, ver al día y el vencimiento nuevo, el texto distinto en cada caso y la
  fila en el registro; al día siguiente, que la auditoría no lo haya tocado.
  El botón no aparece en uno de la tienda ni en uno en prueba, y la base los
  rechaza igual.
- **L:** marcar y desmarcar fundador al local de prueba: el texto de cada
  canal, el registro y que `oferta_web` de su dueño traiga el precio con el
  30% menos (lo mira el chat de BooKit).

## Lo que vi y no entra

- **Pulso estima con el precio de lista**: con fundador marcado sobre un
  débito que cobra precio de lista (D12, la recomendada), el ingreso estimado
  da de menos. Es poca plata y es un estimado; se arregla si un día Pulso usa
  lo cobrado en vez de la lista.
- **`renovar_suscripcion()` levanta `suspendida`**: un pago de Mercado Pago
  deja al día a un local suspendido (la tienda no, `aplicar_suscripcion_tienda`
  lo respeta). Hoy sólo suspende la baja de cuenta, que además suelta el
  débito, así que no pasa. Importa si un día se elige suspender (D14).

## Estado (23-oct)

**En producción.** La base, del chat de BooKit: `20261023233000` (fundadores
del lanzamiento) y `20261023234000` a `20261023235900` (H a L), con la edge
function `alerta_al_momento` y su job cada 10 minutos (J). La web, en `main`
desde #72, #74, #75, #76 y #77.

**Lo que cambió en el camino:**
- **Los fundadores del lanzamiento** no estaban en el plan. Fermín lo decidió
  en el chat de BooKit: los 10 primeros locales, Pro gratis hasta el
  1-jul-2027 y después el precio fundador (`admin_sumar_fundador`, contrato,
  sección 12). El botón "Sumar como fundador" llegó por #73, de otra sesión,
  mientras L hacía el mismo. Al mergear quedó uno solo, el de #73, con su
  texto en `acciones.lanzamiento`; `acciones.fundador` es el precio fundador.
  L suma la marca "Fundador del lanzamiento" en el encabezado de la ficha.
- **El nav del panel en el teléfono ya no entraba**: medido en 375 px, las
  cuatro secciones ocupaban 364 px en 319. Con Equipo, 448. Desde I, la tira se
  desliza de costado, como los días de la agenda de `/mi-local`.
- **Extender la prueba y la cortesía comparten el formulario**
  (`DialogoDeDias`) y la server action (`darDias()`). `queHizo()` pasó a
  `QueHizo`, que usan la ficha y Equipo.
- **De BooKit, distinto o además de lo pedido:** `admin_cambiar_fundador`
  rechaza `fundador_obligatorio` si falta el sí o el no; en la cortesía, el
  primer cobro al terminar sólo vale para el mismo nivel o uno menor (uno
  mayor se cobra en el momento); el mail de las 04:00 escribe en criollo los
  motivos `cancelacion`, `suscripcion_no_verificada` y `suscripcion_doble`.

**Verificado:** `tsc` y el build de Vercel en cada PR. El chat de BooKit
probó la cortesía y el fundador en producción, en transacciones que se
deshicieron (contrato, secciones 16 y 17). La tira del nav se midió en el
navegador: desliza y la página no se ensancha.

**Sin probar:** nada de G a L se vio todavía en `/admin` con una cuenta del
equipo, y no consta que el mail de J haya llegado. Se prueba como dice
**Cómo se prueba**, sobre datos que cree y después borre el chat de BooKit.
Al sumar un local de prueba a los fundadores del lanzamiento, ojo: el lugar se
cuenta por su fila `sumar_fundador` en `admin_acciones`, que queda aunque se
borre el local. El chat de BooKit tiene que borrar esa fila, o el lugar queda
ocupado.

## Para más adelante

1. **Lo que cobran Apple y Google** (ítem 5 de la v2): integración con
   RevenueCat, en un plan propio.
2. **La pausa que pide el propio local** (ítem 8 de la v2): primero BooKit
   tiene que hacerla (idea 11).
3. **Suspender a mano** (D14): si aparece un caso de abuso. Antes, que
   `renovar_suscripcion()` respete `suspendida`.
4. **Los avisos a todos los admins** (la otra opción de D8): cuando haya más
   de una persona en el equipo.
5. **Los días de gracia de cada plan** están copiados en `content/admin.ts`
   (`diasDeGracia`) desde `planes.dias_gracia`. Si BooKit los cambia, hay que
   cambiarlos ahí, o que `admin_comercio` los devuelva.
6. **Pulso estima con el precio de lista**: un local marcado fundador cuyo
   débito todavía cobra precio de lista hace que el ingreso estimado dé de
   menos.
