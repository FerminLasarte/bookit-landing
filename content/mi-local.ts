import type { TonoDeBadge } from "@/components/ui/Badge";
import type { Bloqueo } from "@/lib/mi-local/lugar";
import type { EstadoTurno, FueraDeHorario, Grupo } from "@/lib/mi-local/turnos";
import { planes } from "@/content/planes";
import { numero } from "@/lib/formato";
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
     * Las pestañas de la app, para cada uno (D1 del plan de la fase 5). El
     * dueño: Agenda · Crecimiento · Gestión · Perfil, y Gestión junta
     * Horarios, Servicios y Equipo (`rutas`). El profesional del equipo:
     * Agenda · Horarios · Servicios · Perfil, como las pestañas del staff (D2
     * del plan del equipo). Perfil es el del local para el dueño y el suyo
     * para el profesional (D1 y D7 del plan de la fase 4).
     */
    secciones: [
      { id: "agenda", label: "Agenda", href: "/mi-local", para: "todos", rutas: ["/mi-local"] },
      { id: "crecimiento", label: "Crecimiento", href: "/mi-local/crecimiento", para: "duenio", rutas: ["/mi-local/crecimiento"] },
      {
        id: "gestion",
        label: "Gestión",
        href: "/mi-local/servicios",
        para: "duenio",
        rutas: ["/mi-local/horarios", "/mi-local/servicios", "/mi-local/equipo"],
      },
      { id: "horarios", label: "Horarios", href: "/mi-local/horarios", para: "profesional", rutas: ["/mi-local/horarios"] },
      { id: "servicios", label: "Servicios", href: "/mi-local/servicios", para: "profesional", rutas: ["/mi-local/servicios"] },
      { id: "perfil", label: "Perfil", href: "/mi-local/perfil", para: "todos", rutas: ["/mi-local/perfil"] },
    ],
    /** Las tres partes de Gestión, arriba de cada una, como el selector de la app. La pestaña abre en Servicios, como la app. */
    gestion: {
      titulo: "Gestión",
      partes: [
        { id: "horarios", label: "Horarios", href: "/mi-local/horarios" },
        { id: "servicios", label: "Servicios", href: "/mi-local/servicios" },
        { id: "equipo", label: "Equipo", href: "/mi-local/equipo" },
      ],
    },
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
    /** Un horario que no está entre los libres, como "Otra hora" de la app: de 6 a 23:45, de a 15 minutos. */
    otraHora: "Otra hora",
    hora: "Hora",
    horaBajada: "De 6 a 23:45, de a 15 minutos.",
    sinHorariosConOtra: "No quedan horarios libres este día. Lo podés cargar en otra hora.",
    /**
     * Cuando la base dice que el turno cae fuera de la agenda: los textos del
     * contrato de BooKit. Sin nombre, le habla al profesional que se carga un
     * turno a sí mismo.
     */
    fueraDeHorario: {
      titulo: "¿Lo cargás igual?",
      motivos: {
        no_atiende: (profesional: string | null) => (profesional ? `${profesional} no atiende ese día.` : "Ese día no atendés."),
        fuera_de_hora: (profesional: string | null) =>
          profesional ? `Ese horario queda fuera de la agenda de ${profesional}.` : "Ese horario queda fuera de tu agenda.",
      } satisfies Record<FueraDeHorario, (profesional: string | null) => string>,
      cargarIgual: "Cargar igual",
      cambiarHorario: "Cambiar horario",
    },
    error: "No pudimos traer los horarios. Recargá la página en un rato.",
    nombre: "Nombre del cliente",
    telefono: "Teléfono",
    cargar: "Cargar turno",
    cargando: "Cargando…",
    errores: {
      horario: "Elegí un horario.",
      hora: "Elegí una hora entre las 6 y las 23:45, de a 15 minutos.",
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
      soloLectura: "Su nombre, su foto y su presentación los maneja desde su cuenta.",
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

  /**
   * Los números del local, como la pestaña Crecimiento de la app (fase 5,
   * BooKit `business_stats_screen.dart`). Las ⓘ dicen de dónde sale cada
   * número, con el texto de la app.
   */
  crecimiento: {
    titulo: "Crecimiento",
    bajada: "Cómo le va a tu local, con los turnos que se prestaron.",
    periodo: "Período",
    meses: (n: number) => `${n} meses`,
    ver: "Ver",
    ingresos: "Ingresos",
    turnos: "Turnos",
    comoSeCuenta: "Cómo se cuenta",
    error: "No pudimos cargar las estadísticas.",
    vacio: {
      titulo: "Todavía no hay datos",
      bajada: "Cuando empieces a recibir turnos vas a ver acá cómo evoluciona tu negocio.",
    },
    /** Lo que el plan no trae, de muestra y borroso, con el aviso encima. */
    bloqueado: {
      historial: (nivel: string) => `Todo tu historial, en ${nivel}`,
      bajadaHistorial: "Mes por mes, con tus horarios pico",
      horarios: (nivel: string) => `Tus horarios pico, en ${nivel}`,
      bajadaHorarios: "Qué días se llenan y cuáles quedan libres",
      boton: "Ver planes",
      /** Si `niveles` no dice cuál lo trae. */
      otroPlan: "otro plan",
    },
    facturado: {
      titulo: "Facturado",
      tituloDelMes: "Facturado este mes",
      info: "Lo que facturaron los turnos que se prestaron, al precio final. Los cancelados y los ausentes quedan afuera: sumarlos infla los números con trabajo que nunca se hizo. El último mes está en curso, por eso va marcado: todavía le faltan días.",
      sinTurnos: "Sin turnos prestados todavía",
      resumen: (turnos: string, ticket: string) => `${turnos} · ticket promedio ${ticket}`,
      variacion: (porcentaje: number, mes: string, anterior: string) => `${porcentaje}% · ${mes} contra ${anterior}`,
      sube: "Subió",
      baja: "Bajó",
      grafico: (ver: string) => `${ver} por mes`,
      enCurso: "en curso",
    },
    clientes: {
      titulo: "Tus clientes",
      info: "Un cliente es nuevo el mes de su primera visita al local; después, cada mes que vuelve cuenta como recurrente. Se reconoce por su cuenta o, en un turno de mostrador, por su teléfono: sin ninguno de los dos no se cuenta. Los números suman los meses del período: un cliente que vino en tres meses cuenta tres veces.",
      volvieron: (n: number) => (n === 1 ? "volvió" : "volvieron"),
      nuevos: (n: number) => (n === 1 ? "vino por primera vez" : "vinieron por primera vez"),
      nadie: "Todavía nadie volvió: las recompensas sirven para eso.",
      proporcion: (porcentaje: number) => `${porcentaje}% de tus clientes ya se había atendido antes.`,
    },
    noHechos: {
      titulo: "Turnos que no se hicieron",
      info: "De todos los turnos reservados para el período que ya pasaron, cuántos se cancelaron y a cuántos el cliente no vino. Las reservas de Mercado Pago que nadie pagó no cuentan.",
      deLoReservado: "de lo que se reservó",
      cancelados: "Cancelados",
      ausentes: "No vinieron",
      sena: "Pedir seña baja los que no vienen: quien pagó una parte, viene.",
    },
    horarios: {
      titulo: "Cuándo se llena",
      info: "Los turnos prestados según el día y la hora en que empezaron, en franjas de tres horas. Cuanto más oscura la celda, más turnos.",
      letras: ["L", "M", "M", "J", "V", "S", "D"],
      dias: ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"],
      cuando: (dia: string, desde: number, hasta: number) => `${dia} de ${desde} a ${hasta}`,
      masLleno: "Lo más lleno:",
      masVacio: "Lo más vacío:",
      hueco: "un buen hueco para un cupón",
    },
    profesionales: {
      titulo: "Por profesional",
      info: "Los turnos que atendió cada uno en el período y lo que facturaron. La barra es contra el que más atendió.",
    },
    servicios: {
      titulo: "Servicios",
      info: "Qué parte de tus turnos se lleva cada servicio y lo que facturó. El de abajo es el que menos sale: un buen candidato para un cupón.",
    },
    /** Las dos palancas, debajo de los números, como `_AccionesCrecimiento` (D3). */
    acciones: {
      titulo: "Para crecer",
      recompensas: { titulo: "Recompensas", bajada: "Fidelizá a tus clientes con beneficios" },
      cupones: { titulo: "Cupones", bajada: "Creá descuentos para atraer más clientes" },
    },
    volver: "Volver a Crecimiento",
  },

  /** Cuándo vale un cupón o un premio: la misma pieza en los dos, como `AvailabilitySection` de la app. */
  disponibilidad: {
    dias: "Días",
    franja: "Franja horaria",
    franjaBajada: "Opcional: para llenar las horas flojas.",
    desde: "Desde",
    hasta: "Hasta",
    sinFranja: "Todo el día",
    servicios: "Servicios",
    serviciosBajada: "Sin ninguno marcado, vale en todos.",
    todos: "Todos los servicios",
    todosLosDias: "Todos los días",
    letras: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    dia: ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"],
    /** "Lun, Mié y Vie · de 9:00 a 13:00". */
    resumen: (dias: string[], franja: string | null) => {
      const lista = dias.length === 7 ? "Todos los días" : dias.length === 1 ? dias[0] : `${dias.slice(0, -1).join(", ")} y ${dias.at(-1)}`;
      return franja ? `${lista} · ${franja}` : lista;
    },
    deA: (desde: string, hasta: string) => `de ${desde} a ${hasta}`,
  },

  /** Los cupones del local, como `PromotionsListScreen`. */
  cupones: {
    titulo: "Cupones",
    nuevo: "Nuevo cupón",
    resumen: (total: number, enUso: number, canjes: number) =>
      [total === 1 ? "1 cupón" : `${total} cupones`, `${enUso} en uso`, canjes > 0 && (canjes === 1 ? "1 canje" : `${canjes} canjes`)]
        .filter(Boolean)
        .join(" · "),
    error: "No pudimos traer los cupones. Recargá la página en un rato.",
    vacio: {
      titulo: "Todavía no hay cupones",
      bajada: "Creá un código de descuento para llenar los días flojos y traer clientes nuevos.",
    },
    pausadosPorElPlan: { titulo: "Pausados por tu plan", bajada: (nivel: string) => `Vuelven solos si pasás a ${nivel}.` },
    sinEfecto: {
      titulo: "Sin efecto",
      bajada: (n: number) => (n === 1 ? "1 cupón pausado o vencido" : `${n} cupones pausados o vencidos`),
    },
    bloqueado: (nivel: string) => `Crear cupones está disponible en ${nivel}.`,
    verPlanes: "Ver planes",
    hasta: (dia: string) => `Hasta el ${dia}`,
    vencio: (dia: string) => `Venció el ${dia}`,
    pausado: "Pausado",
    vencido: "Vencido",
    canjes: (usos: number, limite: number | null) =>
      limite === null ? (usos === 1 ? "1 canje" : `${usos} canjes`) : `${usos} de ${limite} canjes`,
    editar: (codigo: string) => `Editar el cupón ${codigo}`,
  },

  /** Crear o editar un cupón, como `CreatePromotionScreen`. */
  cupon: {
    nuevo: "Nuevo cupón",
    editar: "Editar cupón",
    volver: "Volver a los cupones",
    errorDeLectura: "No pudimos traer este cupón. Recargá la página en un rato.",
    identificacion: "Identificación",
    identificacionNota: "El nombre es para vos. El código es el que le pasás al cliente.",
    nombre: "Nombre interno",
    nombreEjemplo: "Ej: Promo primavera",
    codigo: "Código de canje",
    codigoEjemplo: "Ej: PRIMAVERA20",
    descuento: "El descuento",
    tipo: "Tipo",
    tipos: { porcentaje: "Porcentaje", monto: "Monto fijo" },
    valor: { porcentaje: "Cuánto descuenta (%)", monto: "Cuánto descuenta ($)" },
    valorEjemplo: { porcentaje: "Ej: 20", monto: "Ej: 5000" },
    limite: "Límite de canjes",
    limiteEjemplo: "Sin límite",
    vigencia: "Vigencia",
    desde: "Desde",
    hasta: "Hasta",
    disponibilidad: "Cuándo vale",
    crear: "Crear cupón",
    guardar: "Guardar cambios",
    guardando: "Guardando…",
    bloqueado: (nivel: string) =>
      `Tu plan no incluye cupones: este no lo puede usar ningún cliente. Vuelve solo si pasás a ${nivel}.`,
    errores: {
      faltan: (campos: string[]) =>
        campos.length === 1 ? `Falta ${campos[0]}.` : `Faltan ${campos.slice(0, -1).join(", ")} y ${campos.at(-1)}.`,
      campos: { nombre: "el nombre", codigo: "el código", valor: "cuánto descuenta", desde: "desde cuándo vale", hasta: "hasta cuándo vale" },
      valor: "Cuánto descuenta tiene que ser mayor a 0.",
      porcentaje: "El máximo es 100%.",
      limite: "El límite de canjes tiene que ser mayor a 0.",
      fechas: "La vigencia termina antes de empezar.",
      dias: "Elegí al menos un día.",
      franja: "Poné las dos horas de la franja, o ninguna.",
      franjaAlReves: "La franja termina antes de empezar.",
      codigoRepetido: "Ese código ya existe.",
      generico: "No pudimos guardar el cupón. Probá de nuevo en un rato.",
    },
    /** Pausar o activar, del menú de la tarjeta en la app. */
    estado: {
      pausar: "Pausar cupón",
      activar: "Activar cupón",
      pausarBajada: "Deja de valer hasta que lo actives. Los clientes que tienen el código no lo pueden usar.",
      activarBajada: "Vuelve a valer hasta el final de su vigencia.",
      guardando: "Guardando…",
      generico: "No pudimos cambiar el estado. Probá de nuevo en un rato.",
    },
    baja: {
      boton: "Eliminar cupón",
      titulo: "Eliminar cupón",
      texto: (nombre: string) => `"${nombre}" se borra para siempre y los clientes que tengan el código ya no van a poder usarlo.`,
      confirmar: "Eliminar",
      eliminando: "Eliminando…",
      volver: "Volver",
      generico: "No pudimos eliminar el cupón. Probá de nuevo en un rato.",
    },
  },

  /** El programa de puntos y sus premios, como `RewardsManagementScreen`. */
  recompensas: {
    titulo: "Recompensas",
    programa: {
      titulo: "Sistema de puntos",
      prendido: "Prendido",
      apagado: "Apagado",
      bajadaPrendido: "Tus clientes suman en cada visita.",
      bajadaApagado: "Nadie está sumando puntos.",
      prender: "Prender",
      apagar: "Apagar",
      guardando: "Guardando…",
      generico: "No pudimos guardar. Probá de nuevo en un rato.",
    },
    /** "¿Cómo funcionan los puntos?", sin "Premios por estatus (Próximamente)" (D7). Los números son los de la base. */
    reglas: {
      titulo: "¿Cómo funcionan los puntos?",
      items: [
        { titulo: "Suman por tiempo", texto: "Tus clientes ganan 120 puntos por cada hora de servicio: un turno de 30 minutos suma 60." },
        { titulo: "Con el turno completado", texto: "Los puntos se suman cuando marcás el turno como completado, para que nadie sume por un turno que no vino." },
        { titulo: "Vencen a los 6 meses", texto: "Así el cliente vuelve pronto para no perderlos." },
        { titulo: "Vos ponés las reglas", texto: "Cada premio puede valer sólo algunos días o en una franja horaria, ideal para las horas flojas, o pedir visitas previas." },
      ],
    },
    nuevo: "Nuevo premio",
    resumen: (total: number, activos: number) => `${total === 1 ? "1 premio" : `${total} premios`} · ${activos} para canjear`,
    error: "Hubo un error al cargar tus premios.",
    apagado: {
      titulo: "Programa apagado",
      bajada: "Prendé el sistema de puntos y tus clientes van a empezar a sumar en cada visita.",
    },
    vacio: {
      titulo: "Sin premios todavía",
      bajada: "Los puntos se suman pero no hay nada para canjear. Creá el primer premio: un corte gratis, un 50% off.",
    },
    pausado: "Pausado",
    puntos: (n: number) => `${numero(n)} puntos`,
    visitas: (n: number) => (n === 1 ? "con 1 visita previa" : `con ${n} visitas previas`),
    gratis: "Gratis",
    descuento: (valor: string) => `${valor} off`,
    editar: (titulo: string) => `Editar el premio ${titulo}`,
  },

  /** Crear o editar un premio, como `CreateRewardScreen`. */
  premio: {
    nuevo: "Nuevo premio",
    editar: "Editar premio",
    volver: "Volver a las recompensas",
    errorDeLectura: "No pudimos traer este premio. Recargá la página en un rato.",
    apagado: "Con el sistema de puntos apagado no se crean premios.",
    elPremio: "El premio",
    elPremioNota: "La descripción es lo que lee el cliente en el catálogo.",
    titulo: "Título",
    tituloEjemplo: "Ej: Corte gratis",
    descripcion: "Descripción",
    descripcionEjemplo: "Ej: incluye lavado",
    beneficio: "Beneficio",
    tipos: { gratis: "Servicio gratis", porcentaje: "Porcentaje", monto: "Monto fijo" },
    valor: { porcentaje: "Cuánto descuenta (%)", monto: "Cuánto descuenta ($)" },
    valorEjemplo: { porcentaje: "Ej: 50", monto: "Ej: 5000" },
    cuesta: "Qué cuesta",
    cuestaNota: "Los puntos se suman en cada turno completado. Las visitas previas dejan el premio fuera del alcance de un cliente nuevo.",
    puntos: "Costo en puntos",
    puntosEjemplo: "Ej: 100",
    visitas: "Visitas previas",
    visitasEjemplo: "Ninguna",
    disponibilidad: "Cuándo vale",
    crear: "Crear premio",
    guardar: "Guardar cambios",
    guardando: "Guardando…",
    errores: {
      faltan: (campos: string[]) =>
        campos.length === 1 ? `Falta ${campos[0]}.` : `Faltan ${campos.slice(0, -1).join(", ")} y ${campos.at(-1)}.`,
      campos: { titulo: "el título", valor: "cuánto descuenta", puntos: "los puntos" },
      valor: "Cuánto descuenta tiene que ser mayor a 0.",
      porcentaje: "El máximo es 100%.",
      puntos: "Los puntos tienen que ser más que 0.",
      visitas: "Las visitas previas no pueden ser negativas.",
      dias: "Elegí al menos un día.",
      franja: "Poné las dos horas de la franja, o ninguna.",
      franjaAlReves: "La franja termina antes de empezar.",
      generico: "No pudimos guardar el premio. Probá de nuevo en un rato.",
    },
    estado: {
      pausar: "Pausar premio",
      activar: "Activar premio",
      pausarBajada: "Deja de aparecer en el catálogo hasta que lo actives. Los canjes que ya hicieron siguen.",
      activarBajada: "Vuelve a aparecer en el catálogo de tus clientes.",
      guardando: "Guardando…",
      generico: "No pudimos cambiar el estado. Probá de nuevo en un rato.",
    },
    baja: {
      boton: "Eliminar premio",
      titulo: "Eliminar premio",
      texto: (titulo: string) => `"${titulo}" se borra para siempre y tus clientes dejan de verlo en el catálogo.`,
      confirmar: "Eliminar",
      eliminando: "Eliminando…",
      volver: "Volver",
      /** La base no deja borrar un premio que alguien canjeó (D6): se pausa. */
      canjeado: "Este premio ya lo canjearon clientes, así que no se puede borrar. Pausalo y deja de aparecer en el catálogo.",
      pausar: "Pausarlo",
      generico: "No pudimos eliminar el premio. Probá de nuevo en un rato.",
    },
  },

  /** El perfil del local: lo que el cliente ve del local en la app (fase 4), como "Información del negocio". */
  perfil: {
    titulo: "Perfil",
    bajada: "Lo que ven tus clientes de tu local en la app.",
    asiTeVen: "Así te ven",
    error: "No pudimos traer los datos de tu local. Recargá la página en un rato.",
    datos: {
      titulo: "Datos del local",
      nombre: "Nombre",
      categoria: "Categoría",
      otras: "También hacemos",
      otrasBajada: "Hasta 2 más. Tus clientes también te encuentran buscando por estas.",
      direccion: "Dirección",
      sinDireccion: "Sin dirección",
      cambiarDireccion: "Cambiar la dirección",
      dejarDireccion: "Dejar la de ahora",
      instagram: "Instagram",
      usuarioDeInstagram: "@tulocal",
      mail: "Mail de la cuenta",
      mailNota: "Está atado a tu cuenta y no se cambia desde acá.",
      guardar: "Guardar cambios",
      guardando: "Guardando…",
    },
    /** Los buscadores del alta, con su copy; cambia sólo qué hacer si la calle no aparece. */
    ubicacion: {
      localidad: planes.alta.localidad,
      buscarLocalidad: planes.alta.buscarLocalidad,
      direccion: "Dirección nueva",
      buscarDireccion: planes.alta.buscarDireccion,
      sinLocalidad: planes.alta.sinLocalidad,
      sinDireccion: (localidad: string) =>
        `No encontramos esa calle en ${localidad}. Si no aparece, cambiala desde la app: ahí lo marcás en el mapa.`,
      errores: { buscar: planes.alta.errores.buscar },
    },
    errores: {
      generico: "No pudimos guardar los cambios. Probá de nuevo en un rato.",
    },
  },

  /** El perfil del profesional del equipo en ese local, como "Información profesional" de la app (D7 del plan de la fase 4). */
  miPerfil: {
    titulo: "Mi perfil",
    bajada: (local: string) => `Cómo te ven los clientes de ${local}.`,
    nombre: "Nombre visible",
    guardar: "Guardar nombre",
    guardando: "Guardando…",
    errores: {
      nombre: "Escribí tu nombre.",
      generico: "No pudimos guardar tu nombre. Probá de nuevo en un rato.",
    },
  },

  /** Acomodar una foto antes de subirla, como `PhotoFramerScreen` de la app (D4 del plan de la fase 4). */
  encuadre: {
    local: { titulo: "Foto del local", bajada: "La ven tus clientes en la búsqueda y en tu ficha." },
    profesional: { titulo: "Foto de perfil", bajada: "La ven tus clientes al elegir con quién reservar." },
    cambiar: "Cambiar la foto",
    poner: "Poner una foto",
    formas: { perfil: "Perfil", portada: "Portada" },
    ayudas: {
      perfil: "El círculo de las listas, el mapa y la búsqueda.",
      portada: "La banda de arriba de tu ficha.",
    },
    mover: "Arrastrá la foto o usá las flechas para acomodarla.",
    zoom: "Zoom",
    otra: "Elegir otra foto",
    guardar: "Guardar la foto",
    guardando: "Subiendo…",
    volver: "Volver",
    errores: {
      abrir: "No pudimos abrir esa foto. Probá con una JPG o PNG.",
      subir: "No pudimos guardar la foto. Probá de nuevo en un rato.",
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
