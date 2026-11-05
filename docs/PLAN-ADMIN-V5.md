# El panel del equipo (/admin) — v5

> **Aprobado el 5 de noviembre de 2026** con la recomendada de cada decisión
> D1–D8. Es un rediseño de la
> estructura: el panel pasa a tener una barra lateral, atajos, estadísticas y
> ajustes. La web va en un PR por paso, de Q a X. Lo de la base va por un
> solo prompt al chat de BooKit, que deja el contrato en BooKit
> `docs/admin-panel.md` (secciones nuevas desde la 22).

## Qué es

Hoy el panel es una píldora flotante con cinco secciones (Pulso, Comercios,
Personas, Cobros, Equipo). Va bien para mirar, pero cada vez que se trabaja
hay que ir y volver. La v5 lo vuelve una herramienta de trabajo:

1. **Una barra lateral** con las secciones agrupadas y lo pendiente a la vista.
2. **Atajos de teclado** y un buscador que lleva a cualquier local o persona.
3. **La pausa del local**, que BooKit ya hizo (`docs/pausa-del-local.md`,
   migraciones `20261024010000` a `20261024010200`, aplicadas en producción).
4. **La ficha del local en pestañas**, con las acciones siempre arriba.
5. **Comercios con filtros, orden y exportación.**
6. **Un inicio con lo que hay que atender**, en vez de sólo cifras.
7. **Estadísticas** con período elegible.
8. **Ajustes**: los avisos, cómo se ve la vista y los planes.

**Queda afuera:**
- **Editar la configuración de la plataforma** (precios, días de prueba,
  gracia, lugares de fundador) (D2): en la v5 sólo se lee. Editarla toca
  la plata y la app, y merece su propio plan.
- **Notas internas por local** (D3): piden una tabla nueva. Para más
  adelante.
- **La pantalla de la pausa en `/mi-local`** (D4): va en un plan de
  `/mi-local`. Acá sólo lo del panel.
- **Lo que cobran Apple y Google**: sigue en su plan propio, después.
- La app y la landing.

Lo de siempre: el panel entra con la sesión de la persona y nunca con la
service role; cada `admin_*` empieza por `_exigir_superadmin()`; toda acción
deja su fila en `admin_acciones` en la misma transacción.

## Cómo se reparte el trabajo

Los cuatro primeros pasos son sólo web y arrancan ya. Los cuatro últimos
necesitan lecturas nuevas de la base: se piden a BooKit en **un solo
prompt** (D5) y la web los hace cuando esté el contrato. Las letras siguen a
la v4, que terminó en P.

| Paso | Qué | Dónde | Depende de |
| --- | --- | --- | --- |
| **Q** | La barra lateral | web | D1 |
| **R** | Atajos y buscador | web | Q |
| **S** | La pausa del local | web | Q |
| **T** | La ficha en pestañas y el Registro aparte | web | Q, S |
| **U** | Comercios: filtros, orden y CSV | BooKit, después web | D6 |
| **V** | Inicio: "Para atender" y los contadores | BooKit, después web | D7 |
| **W** | Estadísticas | BooKit, después web | D8 |
| **X** | Ajustes | BooKit, después web | D2 |

---

## Q. La barra lateral

`/mi-local` ya tiene un marco con barra lateral
(`components/mi-local/MarcoDelPanel.tsx`): identidad arriba, secciones al
medio y la cuenta abajo. En el teléfono, una barra arriba con menú. **El
marco se saca a una pieza que usan los dos paneles** (D1), en vez de escribir
otro igual para el equipo. `/mi-local` no cambia nada a la vista.

- **Compu:** barra fija de 16 rem a la izquierda. Arriba, el wordmark con el
  badge "Admin". Al medio, las secciones en tres grupos con su rótulo. Abajo,
  el mail de quien entró, "Salir" y "Ir a la web". El área de trabajo ocupa
  el resto, a todo el ancho (hoy está limitada a `wrap`).
- **Teléfono:** barra arriba con el nombre de la sección actual y el menú,
  que tiene los grupos y la cuenta. Sin pestañas abajo: son siete secciones y
  no entran (en `/mi-local` siguen las pestañas).
- **Los grupos**, al terminar la v5:
  - **General:** Inicio, Estadísticas.
  - **Operación:** Comercios, Personas, Cobros.
  - **Equipo:** Equipo, Registro, Ajustes.

  Cada sección aparece cuando llega su paso. Hasta V, "Inicio" sigue siendo
  Pulso con su nombre de hoy.
- Cada sección lleva su ícono de `lucide-react`, que ya se usa en las
  pestañas de `/mi-local`.
- `AdminNav.tsx` se borra. `seccionesAdmin` en `content/admin.ts` pasa a
  tener los grupos.

## R. Atajos y buscador

- **⌘K (Ctrl+K en Windows)** abre "Ir a…": un diálogo con un campo. Sin
  escribir, muestra las secciones. Al escribir, busca locales y personas
  (cinco de cada uno, con las mismas `admin_comercios` y `admin_personas` que
  ya buscan por nombre y mail) y las secciones que coinciden. Se maneja con
  flechas y Enter. Sólo lleva a lugares: las acciones siguen en la ficha,
  porque piden nota y confirmación.
- **`g` y una letra** saltan a una sección: `i` Inicio, `s` Estadísticas,
  `c` Comercios, `p` Personas, `b` Cobros, `e` Equipo, `r` Registro y `a`
  Ajustes.
- **`/`** lleva el foco a la búsqueda de la página, si la tiene.
- **`?`** abre la lista de atajos.
- Ningún atajo de letra actúa con el foco en un campo de texto. La barra
  lateral muestra "⌘K" al lado de un botón "Buscar", para quien no conoce el
  atajo.

## S. La pausa del local

Con lo que ya devuelven `admin_comercio` y `admin_comercios` (sección 5 del
contrato de la pausa):

- **Lista de Comercios:** un badge "En pausa" o "Pausa programada" al lado
  del estado, con las fechas en el título.
- **Ficha, bloque Visibilidad:** por qué no aparece hoy, con los tres
  motivos de `no_aparece_por` (oculto por el equipo, la suscripción, la
  pausa). Si hay pausa, desde y hasta, o "sin fecha de vuelta".
- **Historia:** los cambios de pausa intercalados por fecha con los de
  estado, con los turnos que canceló cada pausa.
- El panel **no pausa** a un local: la pausa es del dueño. Para sacarlo de
  los listados, el equipo sigue teniendo Ocultar.

## T. La ficha en pestañas y el Registro aparte

**La ficha del local**, hoy una sola página larga, pasa a tener:
- **Arriba, siempre:** nombre, estado, badges (fundador, oculto, en pausa) y
  la barra de acciones. Ahí van todos los botones que hoy están repartidos
  por los bloques: Extender prueba, Cortesía, Fundador, Ocultar o Mostrar y
  Suspender o Reactivar. Cada uno abre el mismo diálogo que hoy.
- **Pestañas**, guardadas en la URL (`?pestana=`) para poder compartir el
  link y volver con el botón de atrás:
  - **Resumen:** dueño y contacto, Visibilidad, Mercado Pago, y los turnos
    del último mes.
  - **Suscripción:** plan, débito, pagos e incidencias.
  - **Turnos:** turnos por mes.
  - **Equipo y servicios.**
  - **Historia:** estado, pausa y acciones del equipo en una sola línea de
    tiempo.

**El Registro** sale de Equipo a su propia sección. Hasta U muestra las
últimas 100 acciones (lo que devuelve `admin_equipo`), con chips para filtrar
por tipo de acción. Equipo queda con las personas y sus avisos.

## U. Comercios: filtros, orden y CSV

- **Filtros** además del estado: localidad, nivel, canal de cobro, fundador,
  oculto y en pausa. **Orden** por columna (alta, vencimiento, turnos de 30
  días, último turno). Van en la URL, como los de hoy.
- **Exportar CSV** de lo filtrado, desde un route handler del panel que
  recorre todas las páginas con la sesión de quien exporta. Lo mismo en
  Personas.
- **El Registro**, con paginación y filtros por acción y por local.

**Lo que se pide a BooKit:** que `admin_comercios` sume los parámetros
`p_localidad`, `p_nivel`, `p_canal`, `p_fundador`, `p_visible`, `p_en_pausa`
y `p_orden`, y que cada fila traiga `es_fundador`. Una función
`admin_registro(p_accion, p_id_comercio, p_limite, p_desde)` con `total` y
`filas`. (D6)

## V. Inicio: "Para atender" y los contadores

Pulso pasa a llamarse **Inicio**. Arriba, **Para atender**: una lista corta
de lo que pide una mano, cada ítem con su link.
- Incidencias de pago abiertas.
- Débitos con problemas.
- Altas a medias.
- Pruebas que vencen en los próximos 7 días.
- Locales que no aparecen, por motivo: ocultos, suspendidos, en pausa.
- Locales pagando sin turnos en 14 días (los que se pueden ir).

Debajo, las cifras de hoy (las cuatro de Locales y las de Uso de hoy). Los
gráficos y el reparto pasan a Estadísticas en W.

**Los contadores:** Cobros muestra en la barra lateral cuántas incidencias y
débitos con problemas hay. Inicio muestra cuántos ítems tiene Para atender.

**Lo que se pide a BooKit:** `admin_para_atender()`, una lectura liviana con
los conteos y las listas cortas de arriba, que el marco pueda llamar en cada
página sin pesar. (D7)

## W. Estadísticas

Una sección nueva, con un selector de período: **7 días, 30 días, 90 días y
12 meses**. Cada cifra se compara con el período anterior del mismo largo.
La comparación va al lado y sin porcentaje, como en Pulso
(`docs/PLAN-ADMIN.md`).

- **Crecimiento:** altas y bajas por mes; de la prueba al pago, por mes de
  alta (cuántos de los que empezaron la prueba ese mes pagan hoy).
- **Plata:** cobrado en suscripciones por mes; el ingreso mensual estimado
  por mes; por nivel y por canal.
- **Uso:** reservas por día o por mes según el período; por la app y de
  mostrador; completadas, canceladas, canceladas tarde y ausentes (las faltas
  que BooKit sumó el 5-nov).
- **Locales:** los diez con más turnos, los que no tienen turnos hace 14
  días, y el reparto por localidad y por categoría.
- **Personas:** cuentas nuevas y clientes activos por período.

Los gráficos siguen la guía de `dataviz`: barras y líneas con los tokens de
la marca, sin degradados.

**Lo que se pide a BooKit:** `admin_estadisticas(p_desde date, p_hasta date)`
con todo lo de arriba ya agregado. Que diga desde cuándo hay datos de cada
serie: los montos de suscripción se guardan desde el 23-oct y los cambios de
estado también. La web marca "sin datos" antes de esa fecha, no un cero.
(D8)

## X. Ajustes

- **Tus avisos:** el interruptor del mail de las 04:00 y del momento. Sale de
  Equipo, que sigue mostrando los de todos.
- **La vista:** densidad de las tablas (cómoda o compacta) y filas por página
  (25, 50 o 100). Se guardan en una cookie del navegador, no en la base. El
  tema sigue al sistema, como el resto del sitio.
- **Los planes**, en solo lectura (D2): nombre, precio, ciclo, días de prueba
  y de gracia, y los lugares de fundador que quedan.

**Lo que se pide a BooKit:** `admin_planes()` con lo de arriba.

---

## Decisiones

**D1. La barra lateral.**
- **(Elegida)** Sacar el marco de `/mi-local` a una pieza que usan los dos
  paneles.
- Escribir un marco nuevo para el equipo.

**D2. La configuración de la plataforma.**
- **(Elegida)** Sólo se lee en Ajustes. Editarla, en un plan propio.
- Editarla desde la v5.

**D3. Notas internas por local.**
- **(Elegida)** Para más adelante.
- En la v5, con una tabla nueva en BooKit.

**D4. La pausa en `/mi-local`.**
- **(Elegida)** En un plan de `/mi-local`. La v5 hace sólo lo del panel.
- En la v5.

**D5. Lo de la base.**
- **(Elegida)** Un solo prompt al chat de BooKit para U, V, W y X.
- Un prompt por paso.

**D6. Dónde se filtra Comercios.**
- **(Elegida)** En la base: `admin_comercios` suma los parámetros. Los
  filtros valen sobre todos los locales y la paginación sigue andando.
- En la web, sobre la página que llegó: no pide nada a BooKit, pero filtra
  sólo 50 filas y la cuenta de páginas miente.

**D7. De dónde salen los contadores.**
- **(Elegida)** Una lectura liviana nueva, `admin_para_atender()`.
- Leer `admin_cobros` en el marco: no pide nada a BooKit, pero trae los
  últimos pagos y las altas enteras en cada navegación.

**D8. Cómo se calculan las estadísticas.**
- **(Elegida)** En la base, ya agregadas por período. La web sólo
  dibuja.
- Que la web junte filas sueltas y sume: es más lento y cada número se
  calcularía de dos maneras distintas.

## Cómo se prueba

Como en la v4: en producción, con la sesión del panel. Lo que escribe va
sobre datos de prueba que crea y después borra el chat de BooKit. Lo visual
lo mira Fermín.

- **Q:** las siete secciones en la compu y en el teléfono; `/mi-local` igual
  que antes (agenda, pestañas y menú).
- **R:** ⌘K encuentra un local por nombre y una persona por mail; `g c` lleva
  a Comercios; ningún atajo salta mientras se escribe en un campo.
- **S:** un local de prueba con pausa programada, otro en curso y otro sin
  fecha de vuelta; la historia con los turnos cancelados.
- **T:** cada pestaña con su link; las acciones de arriba abren los diálogos
  de siempre; el Registro filtra por tipo.
- **U:** cada filtro y el orden contra lo que dice la base; el CSV abre en
  Numbers con los acentos bien.
- **V:** cada ítem de Para atender con un caso de prueba; los contadores
  bajan al resolver una incidencia.
- **W:** cada período contra una consulta a mano del chat de BooKit.
- **X:** apagar y prender los avisos propios; la densidad y las filas se
  mantienen al volver.

## Lo que cambió con el contrato

BooKit aplicó la base de U a X el 5-nov-2026 (BooKit `docs/admin-panel.md`,
secciones 22 a 25). Está todo lo pedido, con estos ajustes:
- **W:** el ingreso mensual estimado y los repartos (nivel, canal, localidad,
  categoría) son una foto de hoy, no una serie por mes. La base guarda cómo
  está cada local ahora, no cómo estaba. La categoría es la principal.
- **W, de la prueba al pago:** `empezaron` son los locales que ya no están en
  `pendiente`, porque no hay una fecha guardada de cuándo empezó la prueba.
- **W, datos:** al 5-nov ningún pago de suscripción tiene monto todavía (se
  guarda desde el 23-oct), y la cancelación tarde se marca desde el 5-nov.
  Antes de eso, `datos_desde` lo dice y la web pone "sin datos".
- **U:** las lecturas dan hasta 200 filas: el CSV las recorre de a 200.
- **V:** "suspendidos" son sólo los que suspendió el equipo; los cortados ya
  están en débitos con problemas. "Sin turnos" deja afuera la vitalicia y los
  fundadores.
- **X:** el precio es de nivel por plan. Lo que cobran Apple y Google no está
  en la base.

## Qué sigue, en orden

Al 5-nov-2026.

1. ~~**Mirar y mergear #93 a #96.**~~ Hecho el 5-nov: `/mi-local` y el ancho
   intermedio se miraron antes. Falta que Fermín pruebe `?` con su teclado.
2. ~~**Mandar al chat de BooKit el prompt de U a X** (D5).~~ Hecho, y BooKit
   lo aplicó el mismo día.
3. ~~**U, V, W y X en la web**, un PR por paso.~~ Hechos el 5-nov en PRs
   apilados: U #98, V #99, W #100 y X. Con los datos de prueba de BooKit se
   vio también la pausa del paso S. Falta mergearlos en orden y que BooKit
   borre los locales de prueba `b5b50000-…` "(borrar)".
4. **La pausa en `/mi-local`** (D4). No depende de nada de esta lista y puede
   ir en paralelo con 2 y 3: la base ya está. Va en un plan de `/mi-local`
   (`docs/PLAN-MI-LOCAL.md`, Para más adelante).
5. **Notas internas por local** (D3), después de la v5.
6. **Las pruebas que esperan un caso real:**
   - de la v4: la baja de un débito real al suspender y el aviso de turnos por
     delante al suspender u ocultar;
   - de la v2: la tabla de turnos de Personas, el link de WhatsApp y el mail
     de las altas a medias;
   - confirmar que BooKit borró los locales de prueba `a4a40000-…`.
7. **Lo que cobran Apple y Google**, con RevenueCat, en un plan propio.
8. **Editar la configuración de la plataforma** (D2), sólo si se vuelve
   frecuente.

## Para más adelante

**Editar la configuración de la plataforma (D2).** Cambiar desde el panel lo
que hoy se cambia con una migración de BooKit:
- los precios de `/planes` (`precios_web`);
- el precio fundador y el tope de 10 lugares;
- los días de prueba y de gracia de cada plan.

Por qué no ahora:
- Un precio nuevo vale sólo para lo próximo. Los débitos de Mercado Pago ya
  autorizados siguen cobrando su monto.
- Lo que cobran Apple y Google se cambia en sus consolas, no en la base.
- Un error ahí le cambia el precio a todo el que entre a `/planes`.

Hoy esto cambia pocas veces y una migración deja todo revisado. Si algún día
cambia seguido, lo más seguro para empezar son los días de prueba, la gracia
y los lugares de fundador. Los precios, al final y con confirmación doble.

**Notas internas por local (D3).** Un lugar en la ficha para que el equipo
anote lo que no es una acción: "habló por WhatsApp el 3-nov, quiere pasar a
anual", "pagó tarde dos veces", "el dueño prefiere que lo llamen". Cada nota
lleva quién la escribió y cuándo, la ve sólo el equipo y el local nunca. Hoy
la única nota posible va pegada a una acción del panel. Pide una tabla y dos
funciones en BooKit (escribir y borrar la propia), más una pestaña en la ficha.
Es chico, y sirve desde que hay dos personas en el equipo hablando con
locales.
