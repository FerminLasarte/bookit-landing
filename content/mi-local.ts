import type { TonoDeBadge } from "@/components/ui/Badge";
import type { Bloqueo } from "@/lib/mi-local/lugar";
import type { EstadoTurno, Grupo } from "@/lib/mi-local/turnos";
import { planes } from "@/content/planes";
import { site } from "@/content/site";

/*
 * El copy de /mi-local: la agenda del local en la web. Los avisos de la
 * suscripción dicen lo mismo que la app (BooKit, `SubscriptionCopy`).
 */

export type Aviso = { titulo: string; bajada: string; boton: string | null };

export const miLocal = {
  meta: { title: "Mi local" },

  entrar: {
    titulo: "Tu agenda, en la compu",
    bajada: "Los turnos de tu local, con la misma cuenta de la app.",
    errores: { ingreso: planes.sinSesion.errores.oauth } as Record<string, string>,
  },

  /** El marco del panel: la barra del local en la compu y el menú en el teléfono. */
  panel: {
    /**
     * En el orden de la app (D1 del plan de la fase 3). Un profesional del
     * equipo ve las tres primeras, como las pestañas del staff en la app (D2
     * del plan del equipo).
     */
    secciones: [
      { label: "Agenda", href: "/mi-local", delDuenio: false },
      { label: "Horarios", href: "/mi-local/horarios", delDuenio: false },
      { label: "Servicios", href: "/mi-local/servicios", delDuenio: false },
      { label: "Equipo", href: "/mi-local/equipo", delDuenio: true },
    ],
    /** Las pestañas de abajo, en el teléfono: las secciones (D1 del plan de la fase 3). */
    pestanas: "Secciones",
    navegacion: "Secciones del panel",
    menu: "Menú",
    cerrarMenu: "Cerrar el menú",
    tuPlan: "Tu plan",
    salir: "Salir",
    /** La firma de abajo, al lado del isotipo: el logo completo no baja de 28 px (manual de marca). */
    firma: "con Bookit",
    irALaWeb: "Ir a la web de Bookit",
    /** Quien tiene más de un lugar elige dónde está, como "Cambiar de lado" en la app (D1 del plan del equipo). */
    cambiarDeLugar: {
      titulo: "Cambiar de local",
      tuLocal: "Tu local",
      trabajasAca: "Trabajás acá",
      sinNombre: "Un local",
    },
  },

  /** Lo que contesta una acción cuando no se puede: el lugar no entra, o es algo del dueño. */
  acceso: {
    sinAcceso: "Tu local no tiene acceso al panel. Regularizá tu plan para volver a usarlo.",
    sinAccesoDelEquipo: "Tu lugar en este local no está disponible. Hablá con quien administra el local.",
    soloDuenio: "Esto lo maneja quien administra el local.",
  },

  /** Entrar y "sin local": fuera del sitio, con su pantalla propia. */
  entrada: {
    irALaWeb: `Ir a ${site.dominio}`,
  },

  sinLocal: {
    titulo: "Esto es para los locales",
    bajada: "Tu cuenta no tiene un local en Bookit. Los turnos se sacan desde la app.",
    alta: "¿Tenés un local? Dalo de alta",
    otraCuenta: "Entrar con otra cuenta",
  },

  agenda: {
    titulo: "Agenda",
    hoy: "Hoy",
    anterior: "Día anterior",
    siguiente: "Día siguiente",
    semanaAnterior: "Semana anterior",
    semanaSiguiente: "Semana siguiente",
    semana: "Días de la semana",
    elegir: "Elegir el día",
    profesional: "Profesional",
    estado: "Estado",
    todos: "Todos",
    turnos: (n: number) => (n === 1 ? "1 turno" : `${n} turnos`),
    cobrado: "Cobrado",
    vacio: "No hay turnos este día.",
    vacioConFiltro: "No hay turnos con este filtro.",
    /** Un rato libre entre los turnos (`AgendaHuecoFila` de la app): tocarlo carga un turno ahí. */
    libre: "Libre",
    hueco: (desde: string, hasta: string) => `de ${desde} a ${hasta}`,
    cargarEnHueco: (desde: string, hasta: string) => `Libre de ${desde} a ${hasta}. Cargar un turno`,
    sinHuecos: "No pudimos traer los horarios libres de este día.",
    /** El día sin turnos ni huecos dice por qué, como `AgendaDiaLibre` de la app. */
    diaVacio: {
      paso: { titulo: "Sin turnos", bajada: "No hubo turnos este día." },
      localNoAtiende: { titulo: "El local no atiende este día", bajada: "Nadie del equipo tiene horario este día." },
      noAtiende: { titulo: "No atiende este día", bajada: "Lo cambiás en Horarios." },
      /** La agenda de un profesional del equipo: la de la app dice "Tú", la web dice "Vos". */
      noAtendes: { titulo: "No atendés este día", bajada: "Lo cambiás en Horarios." },
      ordenDeLlegada: { titulo: "Por orden de llegada", bajada: "Este día se atiende sin turno." },
      hoyNoQuedan: { titulo: "Hoy ya no quedan horarios", bajada: "El horario de hoy ya pasó." },
      sinLibres: { titulo: "Sin horarios libres", bajada: "Este día no tiene turnos ni horarios para reservar." },
    },
    error: "No pudimos traer los turnos de este día. Recargá la página en un rato.",
    sinNombre: "Cliente sin nombre",
    deMostrador: "Cliente de mostrador",
    sinProfesional: "Sin profesional",
    sinMarcar: "Sin marcar",
    cargar: "Cargar un turno",
  },

  /** Cargar un turno a mano, como `ManualBookingSheet` de la app: profesional, servicio, día y horario. */
  nuevo: {
    titulo: "Cargar un turno",
    volver: "Volver a la agenda",
    profesional: "Profesional",
    servicio: "Servicio",
    dia: "Día",
    horario: "Horario",
    /** "Corte de pelo · 45 min · $15.000". */
    detalleDelServicio: (nombre: string, minutos: number, precio: string) => `${nombre} · ${minutos} min · ${precio}`,
    elegirProfesional: "Elegí el profesional.",
    elegirServicio: "Elegí el servicio.",
    sinProfesionales: "Tu local no tiene profesionales activos. Se suman desde la app.",
    sinServicios: (profesional: string) => `${profesional} no tiene servicios asignados. Se asignan desde la app.`,
    sinServiciosPropios: "Todavía no tenés servicios. Te los asigna quien administra el local.",
    sinHorarios: "No quedan horarios libres este día.",
    error: "No pudimos traer los horarios. Recargá la página en un rato.",
    nombre: "Nombre del cliente",
    telefono: "Teléfono",
    cargar: "Cargar turno",
    cargando: "Cargando…",
    errores: {
      horario: "Elegí un horario.",
      generico: "No pudimos cargar el turno. Probá de nuevo en un rato.",
    },
  },

  /**
   * Los horarios de cada profesional, como `ScheduleScreen` de la app: la
   * semana habitual y los días especiales (sus "Excepciones").
   */
  horarios: {
    titulo: "Horarios",
    profesional: "Profesional",
    sinProfesionales: "Tu local no tiene profesionales activos. Se suman en Equipo.",
    error: "No pudimos traer los horarios. Recargá la página en un rato.",
    soloLectura: "Su horario lo maneja desde su cuenta.",
    dias: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
    semana: {
      titulo: "Semana habitual",
      /** "5 días abiertos · 49 h por semana". */
      resumen: (dias: number, horas: string) =>
        dias === 0 ? "Todavía no hay días abiertos" : `${dias === 1 ? "1 día abierto" : `${dias} días abiertos`} · ${horas} por semana`,
      nota: "Tocá un día para cargar el horario. Ahí mismo lo repetís en el resto de la semana.",
      cerrado: "Cerrado",
      editar: (dia: string) => `Editar el horario del ${dia.toLowerCase()}`,
    },
    /** El editor de un día, como `EditorDiaSheet`. */
    dia: {
      abierto: "Abierto",
      cerrado: "Cerrado",
      /** "9 h de atención · 1 descanso". */
      bajada: (atencion: string | null, descansos: number) =>
        atencion === null
          ? "Cerrado todo el día"
          : [`${atencion} de atención`, descansos === 1 ? "1 descanso" : descansos > 1 && `${descansos} descansos`]
              .filter(Boolean)
              .join(" · "),
      horario: "Horario",
      abre: "Abre",
      cierra: "Cierra",
      descanso: (n: number) => `Descanso ${n}`,
      desde: "Desde",
      hasta: "Hasta",
      elegir: "Elegí",
      agregarDescanso: "Agregar descanso",
      quitarDescanso: "Quitar",
      turnos: "Turnos",
      modalidades: {
        con_turno: { titulo: "Con turno", bajada: "El cliente reserva un horario." },
        orden_llegada: { titulo: "Por orden de llegada", bajada: "Se atiende a quien llega, sin reserva." },
      },
      intervalo: "Un turno cada",
      intervaloBajada: "Son los horarios que el cliente ve para reservar.",
      repetir: "Repetir en",
      repetirNota: "Los días marcados quedan con este mismo horario.",
      guardar: (dias: number) => (dias > 1 ? `Guardar en ${dias} días` : "Guardar"),
      guardando: "Guardando…",
      volver: "Volver",
      errores: {
        descanso: "Elegí desde y hasta qué hora es cada descanso.",
        generico: "No pudimos guardar el horario. Probá de nuevo en un rato.",
      },
    },
    /** Los días especiales, como `ExceptionsTab` y `ExcepcionSheet`. */
    especiales: {
      titulo: "Días especiales",
      bajada: "Un día libre o unas horas cerradas que se salen de la semana habitual.",
      proximos: (n: number) => (n === 1 ? "1 próximo" : `${n} próximos`),
      vacio: "No hay días especiales por venir.",
      nuevo: "Nuevo día especial",
      editar: "Editar día especial",
      editarUno: "Editar",
      /** Para los lectores de pantalla: cada fila dice de qué día es. */
      editarDia: (dia: string) => `Editar el ${dia}`,
      eliminarDia: (dia: string) => `Eliminar el ${dia}`,
      diaLibre: "Día libre",
      unasHoras: "Unas horas",
      del: "Del",
      al: "Al",
      alNota: "Vacío, es un solo día. Se guarda un día libre por cada día, hasta 60.",
      dia: "Día",
      horasCerradas: "Horas cerradas",
      desde: "Desde",
      hasta: "Hasta",
      motivo: "Motivo",
      motivoEjemplo: "Ej: vacaciones, médico, feriado",
      aviso: "Los turnos que ya estén reservados esos días no se cancelan solos.",
      /** "Día libre · Vacaciones", "Cerrado de 10:00 a 12:00" (`ExcepcionFila`). */
      detalle: {
        dia_libre: () => "Día libre",
        bloqueo: (desde: string, hasta: string) => `Cerrado de ${desde} a ${hasta}`,
        horario_especial: (desde: string, hasta: string) => `Horario especial de ${desde} a ${hasta}`,
      },
      guardar: "Guardar",
      guardando: "Guardando…",
      volver: "Volver",
      eliminar: "Eliminar",
      eliminarTitulo: "Eliminar día especial",
      eliminarTexto: (dia: string | null) => `${dia ?? "Ese día"} vuelve al horario habitual.`,
      eliminando: "Eliminando…",
      errores: {
        fecha: "Elegí el día.",
        rango: "El último día tiene que ser después del primero.",
        tope: "Elegí hasta 60 días seguidos.",
        horas: "Elegí desde y hasta qué hora.",
        generico: "No pudimos guardar el día especial. Probá de nuevo en un rato.",
        eliminar: "No pudimos eliminar el día especial. Probá de nuevo en un rato.",
      },
    },
  },

  /** Los servicios del local, como Gestión › Servicios de la app (BooKit, `business_services_view.dart`). */
  servicios: {
    titulo: "Servicios",
    nuevo: "Nuevo servicio",
    /** "5 servicios · 2 con seña". */
    resumen: (total: number, conSena: number) =>
      [total === 1 ? "1 servicio" : `${total} servicios`, conSena > 0 && `${conSena} con seña`].filter(Boolean).join(" · "),
    vacio: {
      titulo: "Sin servicios",
      bajada: "Todavía no cargaste ningún servicio. Agregá el primero para que tus clientes puedan reservarlo.",
    },
    error: "No pudimos traer tus servicios. Recargá la página en un rato.",
    editar: (nombre: string) => `Editar ${nombre}`,
    minutos: (n: number) => `${n} min`,
    /** `Servicio.senaLegible` de la app: "Seña 20%" o "Seña $5.000". */
    sena: (valor: string) => `Seña ${valor}`,
  },

  /** Los servicios de un profesional del equipo, como "Mis Servicios" de la app (D3 del plan del equipo). */
  misServicios: {
    titulo: "Mis servicios",
    bajada: "Tu duración y tu precio en cada servicio. Vacío, vale el del servicio.",
    vacio: {
      titulo: "Aún no tenés servicios",
      bajada: "Te los asigna quien administra el local.",
    },
    error: "No pudimos traer tus servicios. Recargá la página en un rato.",
    duracion: "Tu duración, en minutos",
    precio: "Tu precio",
    guardar: "Guardar cambios",
  },

  /** Crear o editar un servicio, como `AddEditServiceScreen`. */
  servicio: {
    nuevo: "Nuevo servicio",
    editar: "Editar servicio",
    volver: "Volver a los servicios",
    errorDeLectura: "No pudimos traer este servicio. Recargá la página en un rato.",
    nombre: "Nombre",
    descripcion: "Descripción",
    precio: "Precio",
    duracion: "Duración, en minutos",
    sena: {
      titulo: "Seña",
      pide: "Pide seña",
      bajada: "El cliente paga un adelanto con Mercado Pago para confirmar el turno.",
      tipo: "Cómo se calcula",
      porcentaje: "Porcentaje",
      fijo: "Monto fijo",
      valor: { porcentaje: "Porcentaje de la seña", fijo: "Monto de la seña" },
      bloqueada: (nivel: string) => `Cobrar seña está disponible en ${nivel}.`,
      verPlanes: "Ver planes",
    },
    crear: "Crear servicio",
    guardar: "Guardar cambios",
    guardando: "Guardando…",
    errores: {
      /** "Falta el nombre." o "Faltan el nombre, el precio y la duración." */
      faltan: (campos: string[]) =>
        campos.length === 1 ? `Falta ${campos[0]}.` : `Faltan ${campos.slice(0, -1).join(", ")} y ${campos.at(-1)}.`,
      campos: { nombre: "el nombre", precio: "el precio", duracion: "la duración" },
      faltaSena: { porcentaje: "Falta el porcentaje de la seña.", fijo: "Falta el monto de la seña." },
      generico: "No pudimos guardar el servicio. Probá de nuevo en un rato.",
    },
    /** La baja, como `EliminarServicioBoton`: el servicio se oculta y sus turnos siguen. */
    baja: {
      boton: "Eliminar servicio",
      titulo: "Eliminar servicio",
      texto: (nombre: string, reservados: number | null) => {
        const baja = `"${nombre}" deja de aparecer en tu ficha y ya no se va a poder reservar.`;
        if (reservados === 0) return baja;
        if (reservados === 1) return `${baja} El turno que tiene reservado sigue en pie.`;
        if (reservados === null) return `${baja} Los turnos que ya tenga reservados siguen en pie.`;
        return `${baja} Los ${reservados} turnos que tiene reservados siguen en pie.`;
      },
      confirmar: "Eliminar",
      eliminando: "Eliminando…",
      volver: "Volver",
      errores: {
        generico: "No pudimos eliminar el servicio. Probá de nuevo en un rato.",
      },
    },
  },

  /** El equipo del local, como Gestión › Equipo de la app (BooKit, `business_team_view.dart`). */
  equipo: {
    titulo: "Equipo",
    agregar: "Agregar profesional",
    miembros: "Miembros del equipo",
    vacio: {
      titulo: "Equipo vacío",
      bajada: "Todavía no hay profesionales. Agregá al primero para que pueda recibir turnos.",
    },
    error: "No pudimos traer tu equipo. Recargá la página en un rato.",
    vos: "Vos",
    sinCuenta: "Sin cuenta",
    pausado: "No recibe turnos",
    abrir: (nombre: string) => `Ver a ${nombre}`,
    /** "Tu plan incluye hasta 2 profesionales activos." */
    tope: (n: number) => `Tu plan incluye hasta ${n === 1 ? "1 profesional activo" : `${n} profesionales activos`}.`,
    elegirQuienesSiguen: "Elegir quiénes siguen",
    verPlanes: "Ver planes",
    invitaciones: {
      titulo: "Invitaciones pendientes",
      esperando: "Esperando que acepte",
      vencida: "Invitación vencida",
      reenviar: "Reenviar invitación",
      reenviando: "Reenviando…",
      revocar: "Revocar invitación",
      confirmarRevocar: (email: string) => `¿Seguro que querés revocar la invitación enviada a ${email}?`,
      revocarSi: "Revocar",
      revocando: "Revocando…",
      volver: "Volver",
      errores: {
        reenviar: "No pudimos reenviar la invitación. Probá de nuevo en un rato.",
        revocar: "No pudimos revocar la invitación. Probá de nuevo en un rato.",
      },
    },
    preciosLibres: {
      titulo: "Precios libres",
      bajada: "Cada profesional puede tener su propio precio para cada servicio.",
      bloqueado: (nivel: string) => `Disponible en ${nivel}.`,
      prender: "Permitir precios libres",
      apagar: "Volver al precio de cada servicio",
      guardando: "Guardando…",
      prendido: "Prendido",
      apagado: "Apagado",
      error: "No pudimos cambiar los precios libres. Probá de nuevo en un rato.",
    },
  },

  /** Sumar a alguien al equipo, como `AddProfessionalBottomSheet`: sin cuenta, con su cuenta o el dueño mismo. */
  sumar: {
    titulo: "Agregar profesional",
    bajada: "Sumá a alguien de tu equipo para que pueda recibir turnos.",
    volver: "Volver al equipo",
    sinCuenta: {
      titulo: "Sin cuenta",
      bajada: "Su agenda la manejás vos.",
      nombre: "Nombre del profesional",
      boton: "Agregar",
    },
    conCuenta: {
      titulo: "Con su cuenta",
      bajada: "Le llega un mail para sumarse y ve su agenda en su celular.",
      email: "Email del profesional",
      boton: "Enviar invitación",
      bloqueado: (nivel: string) => `Invitar con su cuenta está disponible en ${nivel}.`,
    },
    yo: {
      titulo: "¿Atendés en tu local?",
      bajada: "Sumate como profesional para recibir turnos.",
      nombre: "Tu nombre, como lo ven tus clientes",
      boton: "Agregarme",
    },
    enviando: "Enviando…",
    errores: {
      nombre: "El nombre es obligatorio.",
      email: "Ingresá un email válido.",
      invitacionRepetida: "Ya hay una invitación pendiente para ese mail.",
      generico: "No pudimos agregar al profesional. Probá de nuevo en un rato.",
    },
  },

  /** Un profesional del equipo: sus datos, sus servicios y si recibe turnos. */
  profesional: {
    volver: "Volver al equipo",
    error: "No pudimos traer a este profesional. Recargá la página en un rato.",
    datos: {
      titulo: "Datos",
      nombre: "Nombre",
      bio: "Presentación",
      guardar: "Guardar datos",
      soloLectura: "Su nombre y su presentación los maneja desde su cuenta.",
    },
    servicios: {
      titulo: "Servicios",
      bajada: "Los servicios que puede hacer. Sin ninguno, no recibe turnos.",
      ninguno: "No hay servicios creados todavía.",
      cargarServicios: "Crear un servicio",
      duracion: "Duración propia, en minutos",
      precio: "Precio propio",
      delServicio: (valor: string) => `Vacío: ${valor}, el del servicio.`,
      soloLectura: "Su precio y su duración los maneja desde su cuenta.",
      guardar: "Guardar servicios",
    },
    horarios: {
      titulo: "Horarios",
      bajada: "Los días y las horas en que recibe turnos.",
      editar: "Editar sus horarios",
      ver: "Ver sus horarios",
    },
    actividad: {
      titulo: "Recibe turnos",
      activo: "Aparece para reservar.",
      pausado: "Pausado: no aparece para reservar.",
      desactivar: "Desactivar",
      activar: "Activar",
      confirmarTitulo: (nombre: string) => `Desactivar a ${nombre}`,
      /** `avisoDeDesactivar` de la app: el aviso sólo le llega a quien reservó con su cuenta. */
      confirmar: ({ turnos, conCliente, pagadosPorMp }: { turnos: number; conCliente: number; pagadosPorMp: number }) => {
        const cancela = turnos === 1 ? "Se cancela su turno por venir" : `Se cancelan sus ${turnos} turnos por venir`;
        const avisa =
          conCliente === 0
            ? ""
            : conCliente === turnos
              ? turnos === 1
                ? " y al cliente le llega el aviso"
                : " y a cada cliente le llega el aviso"
              : conCliente === 1
                ? " y al cliente que reservó por la app le llega el aviso"
                : ` y a los ${conCliente} clientes que reservaron por la app les llega el aviso`;
        return [
          "Deja de aparecer para reservar y ya no entra a la agenda del local.",
          turnos > 0 && `${cancela}${avisa}.`,
          pagadosPorMp > 0 && "Lo pagado por Mercado Pago se devuelve.",
        ]
          .filter(Boolean)
          .join(" ");
      },
      sinResumen: "Deja de aparecer para reservar y se cancelan sus turnos por venir.",
      volver: "Volver",
    },
    guardando: "Guardando…",
    guardado: "Listo, quedó guardado.",
    errores: {
      generico: "No pudimos guardar los cambios. Probá de nuevo en un rato.",
      soloLectura: "Los datos de un profesional con cuenta los maneja él.",
    },
  },

  /** Elegir quiénes siguen dentro del tope del plan, como `ElegirQuienesSiguenSheet`. */
  quienesSiguen: {
    titulo: "Elegí quiénes siguen",
    bajada: (tope: number) =>
      `Tu plan incluye hasta ${tope} profesionales. Los demás no aparecen para reservar, pero no se les cancela ningún turno.`,
    guardar: "Guardar",
    guardando: "Guardando…",
    volver: "Volver al equipo",
    errores: {
      generico: "No pudimos guardar los cambios. Probá de nuevo en un rato.",
    },
  },

  /** La ficha del turno: lo mismo que la hoja del turno de la app (BooKit, `SharedTurnoBottomSheet`). */
  ficha: {
    abrir: "Ver el turno",
    cerrar: "Cerrar",
    aMano: "Cargado a mano",
    con: (profesional: string) => `Con ${profesional}`,
    completar: "Asistió · Completar",
    ausente: "No asistió · Ausente",
    cancelar: "Cancelar turno",
    guardando: "Guardando…",
    todaviaNo: "La asistencia se marca cuando empieza el turno.",
    /** `EstadoTurno.fraseCerrado`: cada estado con su propia redacción. */
    cerrado: {
      completado: "Este turno ya se completó.",
      ausente: "El cliente no asistió.",
      cancelado: "Este turno fue cancelado.",
      expirado: "La reserva venció sin pagarse.",
    } satisfies Partial<Record<EstadoTurno, string>>,
    cancelacion: {
      texto: (cliente: string | null, devolucion: string | null) =>
        [
          `Se cancela el turno${cliente ? ` de ${cliente}` : ""} y el horario queda libre.`,
          devolucion && `Se le devuelven los ${devolucion} que pagó por Mercado Pago.`,
          "No se puede deshacer.",
        ]
          .filter(Boolean)
          .join(" "),
      confirmar: "Cancelar turno",
      cancelando: "Cancelando…",
      volver: "Volver",
    },
    errores: {
      generico: "No pudimos cambiar el estado del turno. Probá de nuevo en un rato.",
    },
  },

  /** Cómo mira el local su día (D9 del plan del panel). */
  grupos: {
    "sin-marcar": "Sin marcar",
    "por-atender": "Por atender",
    completados: "Completados",
    ausentes: "Ausentes",
    cancelados: "Cancelados",
  } satisfies Record<Grupo, string>,

  /** El tono sale de lo que significa para el local: lo que pide atención, lo que se cayó. */
  estados: {
    pendiente: { label: "Pendiente", tono: "atencion" },
    confirmado: { label: "Confirmado", tono: "bien" },
    completado: { label: "Completado", tono: "bien" },
    ausente: { label: "Ausente", tono: "neutro" },
    cancelado: { label: "Cancelado", tono: "mal" },
    expirado: { label: "Expirado", tono: "neutro" },
  } satisfies Record<EstadoTurno, { label: string; tono: TonoDeBadge }>,

  /** Lo que tapa la agenda: el local no entra. */
  bloqueo: {
    pendiente: {
      titulo: "Tu local todavía no tiene plan",
      bajada: "Elegí uno para abrir tu agenda y empezar a recibir turnos.",
      boton: "Ver planes",
    },
    prueba: {
      titulo: "Se te terminó la prueba",
      bajada: "Tu comercio está oculto y no recibe turnos. Suscribite para volver a la agenda.",
      boton: "Suscribirme",
    },
    cortada: {
      titulo: "Tu licencia venció",
      bajada: "Tu comercio está oculto y no recibe turnos. Renová para volver a la agenda.",
      boton: "Renovar",
    },
    // No se sale pagando: no se le ofrece comprar.
    suspendida: {
      titulo: "Tu cuenta está suspendida",
      bajada: "Es una decisión administrativa y no se resuelve desde acá. Si tenés dudas, escribinos.",
      boton: null,
    },
  } satisfies Record<string, Aviso>,

  /**
   * Lo que tapa la agenda de un profesional del equipo: las frases de la app
   * (`StaffSuspendedScreen`), más la del plan sin cuentas del equipo (D4 del
   * plan del equipo). Sin botón: lo resuelve quien administra el local.
   */
  bloqueoDelEquipo: {
    cerrado: (local: string): Aviso => ({
      titulo: `${local} cerró su cuenta`,
      bajada: "El local se dio de baja en Bookit, así que su panel ya no está disponible. Tu cuenta personal sigue como siempre.",
      boton: null,
    }),
    fueraDelEquipo: (local: string): Aviso => ({
      titulo: "Ya no estás en el equipo",
      bajada: `${local} te desactivó, así que su agenda ya no está disponible para vos. Si es un error, hablá con quien administra el local.`,
      boton: null,
    }),
    enPausa: (local: string): Aviso => ({
      titulo: "Espacio de trabajo en pausa",
      bajada: `${local} no tiene la suscripción al día, así que su panel no está disponible. Hablá con quien administra el local: tu agenda y tu historial siguen donde los dejaste.`,
      boton: null,
    }),
    sinCuentas: (local: string): Aviso => ({
      titulo: "Sin cuentas del equipo",
      bajada: `${local} no tiene las cuentas del equipo en su plan, así que su panel no está disponible para vos. Hablá con quien administra el local.`,
      boton: null,
    }),
    sinLugar: (): Aviso => ({
      titulo: "No encontramos tu lugar",
      bajada: "No encontramos tu lugar en este local. Probá de nuevo en un rato.",
      boton: null,
    }),
  } satisfies Record<Bloqueo, (local: string) => Aviso>,

  /** Lo que va arriba de la agenda: el local entra, pero hay algo pendiente. */
  avisos: {
    enGracia: {
      titulo: "Tenés un pago atrasado",
      bajada: "Regularizalo antes de que tu comercio se oculte y dejes de recibir turnos.",
      boton: "Pagar",
    },
    noSeRenueva: (fecha: string): Aviso => ({
      titulo: "Tu suscripción no se renueva",
      bajada: `Termina el ${fecha}. Reactivala y seguí con tu agenda y tus clientes.`,
      boton: "Reactivar",
    }),
  },
};
