# Mi local — "Otra hora" y el turno fuera de horario

> Aprobado por Fermín el 22 de octubre de 2026, con la recomendación de cada
> decisión **D1–D3**. Implementado en la rama `mi-local/otra-hora`.

## Por qué

En la tanda del 22/10, BooKit cambió `crear_turno_manual` (BooKit#87, contrato
en BooKit `docs/turno-manual-fuera-de-horario.md`):

- el turno a mano nace **confirmado**, y los manuales que estaban en
  `pendiente` pasaron a `confirmado`;
- si el horario cae fuera de la agenda del profesional, la función contesta
  `code: 'fuera_de_horario'` con `motivo` (`no_atiende` o `fuera_de_hora`) y no
  crea nada. Con `p_forzar: true` lo carga igual. Un turno que se pisa con otro
  no se puede forzar.

La web hoy elige el horario sólo entre los libres que da la base
(`horarios_libres_del_profesional`), así que el aviso nunca le llega. Fermín
decidió que la web sume **"Otra hora"**, como la app, para cargar el turno
extra a propósito.

## Qué cambia

**El formulario** (`components/mi-local/FormularioDeTurno.tsx`)
- Debajo de los horarios libres, una opción más: **Otra hora**. Al elegirla
  aparece un campo para la hora del día elegido, de 06:00 a 23:45, de a 15
  minutos, como el rango de la app (`otra_hora_sheet.dart`). Ver D1.
- Si el día no tiene horarios libres, el formulario se muestra igual, sólo con
  "Otra hora". Hoy en ese caso se ve el aviso "No quedan horarios libres este
  día." y no se puede cargar nada; el aviso queda como bajada.

**La confirmación**
- Si la base contesta `fuera_de_horario`, el formulario muestra
  **"¿Lo cargás igual?"** con el motivo y dos botones: **Cargar igual** (vuelve
  a mandar lo mismo con `forzar`) y **Cambiar horario** (cierra el aviso y deja
  elegir otra hora). Ver D2.
- Los textos son los del contrato. Con el nombre del profesional para el
  dueño, y en vos para el profesional que se carga un turno a sí mismo:
  - `no_atiende`: "{Nombre} no atiende ese día." / "Ese día no atendés."
  - `fuera_de_hora`: "Ese horario queda fuera de la agenda de {Nombre}." /
    "Ese horario queda fuera de tu agenda."

**La acción** (`cargarTurno` en `app/mi-local/acciones.ts`)
- Recibe `forzar` y lo manda como `p_forzar`.
- El estado de la carga suma `fueraDeHorario: 'no_atiende' | 'fuera_de_hora' | null`
  además de `error`. Un `code` que la web no conoce se lee como hoy: el
  `message`, como error.
- "Otra hora" llega como `HH:MM` del día elegido y la acción arma el inicio en
  la hora de Buenos Aires, igual que el resto de la agenda. Valida que sea un
  cuarto de hora entre 06:00 y 23:45.

**El copy** va en `content/mi-local.ts` (`nuevo.otraHora` y
`nuevo.fueraDeHorario`).

**Los documentos**
- `docs/PLAN-MI-LOCAL-FASE-2.md` dice que el turno a mano nace pendiente y que
  confirmar no se puede: se anota lo de BooKit#87.
- La hoja de ruta de `docs/PLAN-MI-LOCAL.md` suma la tanda de BooKit (#87). La
  fila del equipo ya está corregida sin commitear y entra en este PR.

## Decisiones

**D1 · El campo de "Otra hora".**
- **(Recomendada) Un campo de hora nativo** (`<input type="time">`, de a 15
  minutos, de 06:00 a 23:45). Es chico, anda con teclado y en el teléfono abre
  el selector del sistema. No pinta qué horas quedan fuera del horario.
- Una grilla de horas por mañana, tarde y noche, y al tocar una sus cuatro
  cuartos, como la hoja de la app. Más fiel a la app y más código.

**D2 · Dónde se pregunta.**
- **(Recomendada) En el mismo formulario, arriba del botón.** No se pierde lo
  escrito y anda sin JavaScript, como el resto de los formularios del panel
  (`formularioSinBorrar`).
- Un `<dialog>`, como la ficha del turno. Más parecido a la app, pero suma un
  componente y no anda sin JavaScript.

**D3 · Pistas de "fuera de horario" en el campo.**
- **(Recomendada) No.** La base decide y avisa. La app las pinta con una copia
  de la regla del horario en Dart (`AvailabilityService`), que BooKit ya anotó
  como deuda: la web no la copia.
- Sí, marcando las horas fuera de los huecos libres de `huecos_del_dia`. Pero
  los huecos no distinguen "ocupado" de "fuera de horario", así que la pista
  sería confusa.

## Orden y prueba

Una rama, `mi-local/otra-hora`, y un PR:

1. Copy, acción y formulario.
2. Los documentos.
3. Prueba en el preview con la cuenta de Nogal:
   - un horario libre se carga y sale "Confirmado";
   - una hora fuera de horario pregunta; "Cargar igual" lo crea y "Cambiar
     horario" no;
   - un día que el profesional no atiende pregunta con `no_atiende`;
   - una hora que se pisa con otro turno da el error y no ofrece forzar;
   - lo mismo desde la cuenta de profesional, con los textos en vos.

   Los turnos de prueba se cancelan al terminar y se suman a la lista de
   borrado del chat de BooKit.

**Cómo se probó** (22/10, dev local contra producción, con la cuenta de
Nogal, Julián Peralta, Corte de niños):
- Viernes 23 a las 21:00 con "Otra hora": "¿Lo cargás igual?" con "Ese horario
  queda fuera de la agenda de Julián Peralta.". "Cambiar horario" cierra la
  pregunta sin cargar nada y sin borrar la hora ni el nombre. "Cargar igual" lo
  carga y vuelve a la agenda: 21:00–21:30, **Confirmado**.
- Domingo 25, sin horarios libres: el formulario sale con "Otra hora" ya
  elegida y la bajada. A las 10:00: "Julián Peralta no atiende ese día.". No se
  forzó.
- Viernes 23 a las 21:00 otra vez, encima del anterior: "El horario se solapa
  con otro turno", sin "Cargar igual".
- Sin errores en la consola ni en el servidor. `npm run typecheck` y
  `npm run build` pasan.

**No se probó:** los textos en vos desde una cuenta de profesional (la cuenta
de prueba de Fermín está desactivada en Nogal), y un horario libre después del
cambio (el turno forzado ya mostró que el manual nace confirmado).

**Quedó en la base:** el turno cancelado "Prueba web (borrar)" de Nogal del
23/10 a las 21:00. Se suma a la lista de borrado del chat de BooKit.

**Desde la cuenta de profesional (22/10, después del Perfil, #58):** con la
cuenta del equipo de Fermín activada un rato en Nogal y, con su OK, Corte de
pelo asignado por SQL (sin horario):
- "Otra hora" el jueves 22 a las 15:00: "¿Lo cargás igual?" con "Ese día no
  atendés.". "Cargar igual" lo carga aunque ya haya empezado: la base lo
  deja, y nace confirmado ("Sin marcar" en la agenda).
- Otro igual a las 16:00. Desde la ficha, el de las 15:00 quedó
  **Completado** (el cobrado del día pasó a $15.000) y el de las 16:00
  **Ausente**.
- "Ese horario queda fuera de tu agenda." no se vio: hace falta horario ese
  día. Sale de la misma regla que "Ese día no atendés." (el profesional sin
  nombre), que sí se vio.
- Al terminar, por SQL y con su OK, se le sacó el servicio y la ficha volvió a
  quedar desactivada: su sesión ve "Ya no estás en el equipo".

**Quedaron en la base** los dos turnos "Prueba web (borrar)" del 22/10 de
Fermin Lasarte en Nogal (15:00 completado y 16:00 ausente). Se suman a la
lista de borrado del chat de BooKit.

Queda para después, sin cambios: la prueba con el id de un turno de otro local
y el borrado de los datos de prueba (los dos esperan al chat de BooKit).
