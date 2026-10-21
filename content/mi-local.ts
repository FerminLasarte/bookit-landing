import type { TonoDeBadge } from "@/components/ui/Badge";
import type { EstadoTurno } from "@/lib/mi-local/agenda";
import { planes } from "@/content/planes";

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

  sinLocal: {
    titulo: "Esto es para los locales",
    bajada: "Tu cuenta no tiene un local en Bookit. Los turnos se sacan desde la app.",
    alta: "¿Tenés un local? Dalo de alta",
    otraCuenta: "Entrar con otra cuenta",
  },

  agenda: {
    hoy: "Hoy",
    anterior: "Día anterior",
    siguiente: "Día siguiente",
    elegir: "Elegir el día",
    profesional: "Profesional",
    estado: "Estado",
    todos: "Todos",
    turnos: (n: number) => (n === 1 ? "1 turno" : `${n} turnos`),
    cobrado: "Cobrado",
    vacio: "No hay turnos este día.",
    vacioConFiltro: "No hay turnos con este filtro.",
    error: "No pudimos traer los turnos de este día. Recargá la página en un rato.",
    sinNombre: "Cliente sin nombre",
    deMostrador: "Cliente de mostrador",
    sinProfesional: "Sin profesional",
    sinMarcar: "Sin marcar",
    salir: "Salir",
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
      sinAcceso: "Tu local no tiene acceso a la agenda. Regularizá tu plan para volver a usarla.",
    },
  },

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
