import type { EstadoSuscripcion, FiltroComercios } from "@/lib/admin/datos";

/** Las secciones del panel, en el orden del nav. */
export const seccionesAdmin = [
  { href: "/admin", label: "Pulso" },
  { href: "/admin/comercios", label: "Comercios" },
  { href: "/admin/personas", label: "Personas" },
  { href: "/admin/cobros", label: "Cobros" },
  { href: "/admin/equipo", label: "Equipo" },
] as const;

/** Cómo se lee cada estado de la suscripción, y si es una buena noticia. */
export const estados: Record<EstadoSuscripcion, { label: string; tono: "bien" | "atencion" | "mal" }> = {
  al_dia: { label: "Al día", tono: "bien" },
  en_gracia: { label: "En gracia", tono: "atencion" },
  pendiente: { label: "Pendiente", tono: "atencion" },
  cortada: { label: "Cortada", tono: "mal" },
  suspendida: { label: "Suspendida", tono: "mal" },
};

export const planes: Record<string, string> = {
  prueba: "Prueba",
  semanal: "Semanal",
  mensual: "Mensual",
  anual: "Anual",
  vitalicia: "Vitalicia",
};

/** Los días de gracia de cada plan pago (`planes.dias_gracia` en BooKit), para decirlos antes de dar una cortesía. */
export const diasDeGracia: Record<string, number> = {
  semanal: 2,
  mensual: 7,
  anual: 14,
};

export const niveles: Record<string, string> = {
  esencial: "Esencial",
  pro: "Pro",
  equipo: "Equipo",
};

/** Quién cobra (`_canal_de_cobro()`): la tienda va por separado desde que la base la guarda. */
export const canales: Record<string, string> = {
  mercado_pago: "Mercado Pago",
  app_store: "Apple",
  play_store: "Google Play",
  // Un local de la tienda cuya compra el servidor todavía no volvió a aplicar.
  tienda: "Apple / Google",
};

export const filtrosComercios: { valor: FiltroComercios | null; label: string }[] = [
  { valor: null, label: "Todos" },
  { valor: "prueba", label: "En prueba" },
  { valor: "pagando", label: "Pagando" },
  { valor: "cortados", label: "Cortados" },
  { valor: "pendientes", label: "Pendientes" },
  { valor: "bajas", label: "Bajas" },
];

/** Los motivos de `incidencias_pago`, en criollo. */
export const motivosIncidencia: Record<string, string> = {
  sin_turno: "Pago sin turno",
  otro_comercio: "Pago de otro local",
  turno_no_reservable: "Turno no reservable",
  horario_ocupado: "Horario ya ocupado",
  pago_repetido: "Pago repetido",
  monto_insuficiente: "Monto insuficiente",
  devolucion: "Devolución",
  contracargo: "Contracargo",
  cancelacion: "Devolución por cancelación",
  suscripcion_no_verificada: "Pago de suscripción sin verificar",
  suscripcion_doble: "Pago doble (ya paga en la tienda)",
};

export const reembolsos: Record<string, string> = {
  pendiente: "Reembolso pendiente",
  devuelto: "Devuelto",
  fallido: "Reembolso fallido",
  no_corresponde: "No corresponde",
};

export const estadosAlta: Record<string, string> = {
  pendiente: "Sin autorizar",
  autorizada: "Autorizada",
  usada: "Usada",
  cancelada: "Cancelada",
};

/** Lo que el equipo hace desde el panel (paso B de docs/PLAN-ADMIN.md). Los errores los escribe la base. */
export const acciones = {
  volver: "Volver",
  listo: "Listo",
  resolver: {
    boton: "Resolver",
    titulo: "Resolver la incidencia",
    bajada: "Sale de Cobros y del mail de las 04:00. Lo que escribas queda en la ficha del local.",
    nota: "Qué se hizo con esta plata",
    ejemplo: "La devolvió el local por transferencia",
    confirmar: "Resolver",
    enviando: "Resolviendo…",
    generico: "No pudimos resolverla. Probá de nuevo.",
  },
  extender: {
    boton: "Extender la prueba",
    titulo: "Extender la prueba",
    bajada: "Los días se cuentan desde el vencimiento, o desde hoy si ya venció. Si estaba en gracia o cortado, queda al día.",
    conDebito:
      "Ya autorizó el débito de Mercado Pago: el primer cobro sale igual el día pactado, y estos días se suman después.",
    noRenueva: "Pidió no renovar: se apaga el día del vencimiento nuevo, sin gracia.",
    dias: "Días",
    rapidos: [7, 14, 30],
    nota: "Nota",
    ejemplo: "Le damos una semana",
    confirmar: "Extender",
    enviando: "Extendiendo…",
    generico: "No pudimos extenderla. Probá de nuevo.",
  },
  /** Para el local de Mercado Pago que no pagó (BooKit `docs/admin-panel.md`, sección 16). */
  cortesia: {
    boton: "Dar días de cortesía",
    titulo: "Dar días de cortesía",
    bajada: "Los días se cuentan desde hoy y el local queda al día. El débito y el plan no cambian.",
    // Lo decide `cancela_al_vencer`, no el débito: así lo mira la auditoría de medianoche.
    sigueConGracia: (dias: number | undefined) =>
      `Si no paga en estos días, pasa a en gracia${dias ? ` ${dias} días` : ""} y después se corta.`,
    conDebito: "Si Mercado Pago le cobra antes, el ciclo pago se suma al final: estos días quedan regalados.",
    seCortaSinGracia:
      "Pidió no renovar o se le cayó el débito: se corta la noche que termina la cortesía, sin gracia. Si se suscribe en /planes en estos días, el primer cobro sale ese día.",
    dias: "Días",
    rapidos: [7, 14],
    nota: "Por qué",
    ejemplo: "Le rechazaron la tarjeta; paga el lunes",
    confirmar: "Dar los días",
    enviando: "Dando los días…",
    generico: "No pudimos darle los días. Probá de nuevo.",
  },
  /** El interruptor del equipo (BooKit `docs/admin-panel.md`, sección 11). */
  visibilidad: {
    titulo: "Visibilidad",
    visible: "Visible para todos",
    oculto: "Oculto",
    seVe: "Aparece en la app y en la web, y toma turnos.",
    // Visible, pero la suscripción no lo deja a la vista: el control no puede prometer lo contrario.
    noSeVePorEstado: (estado: string) => `Igual no aparece ni toma turnos mientras la suscripción esté ${estado}.`,
    noSeVePorBaja: "Igual no aparece ni toma turnos: está de baja.",
    oculta: "Lo ocultó el equipo: no aparece ni toma turnos, aunque esté al día. El local no ve este cambio.",
    ocultar: {
      titulo: "Ocultar el local",
      bajada: [
        "Sale de Explorar, el mapa, Inicio, la búsqueda, la lista de ciudades y las portadas de la landing, y su enlace de reserva deja de andar.",
        "No toma turnos por ningún lado: ni por la app, ni por la web, ni los que cargue el propio local.",
        "Los turnos que ya tiene siguen en pie. El local no ve este cambio.",
      ],
      ejemplo: "Pagó, pero todavía estamos definiendo su ficha",
      confirmar: "Ocultar",
      enviando: "Ocultando…",
    },
    mostrar: {
      titulo: "Volver a mostrar el local",
      bajada: "Vuelve a aparecer en la app y en la web, y a tomar turnos.",
      ejemplo: "Ya terminamos su ficha",
      confirmar: "Mostrar",
      enviando: "Mostrando…",
    },
    nota: "Nota",
    quedoOculto: "Quedó oculto",
    porDelante: (n: number) => `Sigue teniendo ${n} ${n === 1 ? "turno" : "turnos"} por delante: no se cancelan.`,
    generico: "No pudimos cambiarlo. Probá de nuevo.",
  },
  /** Los 10 primeros locales del lanzamiento (BooKit `docs/admin-panel.md`, sección 12). */
  fundador: {
    boton: "Sumar como fundador",
    titulo: "Sumar como fundador del lanzamiento",
    bajada: [
      "Queda en Pro, gratis, hasta el 1 de julio de 2027. Entra y se ve como cualquier local al día.",
      "Después paga con el precio fundador: 30% menos, en la app o en la web. Si no paga, tiene 7 días de gracia y se corta.",
      "Son 10 lugares en total, y uno usado no se libera aunque el local se vaya.",
    ],
    nota: "Nota",
    ejemplo: "Barbería del centro, la sumó Facu",
    confirmar: "Sumar",
    enviando: "Sumando…",
    quedoSumado: "Quedó sumado",
    quedan: (n: number) =>
      n === 0 ? "Era el último lugar: ya están los 10." : `${n === 1 ? "Queda 1 lugar" : `Quedan ${n} lugares`} de fundador.`,
    generico: "No pudimos sumarlo. Probá de nuevo.",
  },
  registro: {
    titulo: "Lo que hizo el equipo",
    bajada: "Lo que se cambió desde el panel, de lo más nuevo a lo más viejo.",
    sinCuenta: "Una cuenta borrada",
    resolvio: (pago: string) => `Resolvió la incidencia del pago ${pago}`,
    extendio: (dias: number, vence: string) => `Extendió la prueba ${dias} ${dias === 1 ? "día" : "días"}: vence el ${vence}`,
    oculto: "Lo ocultó",
    mostro: "Lo volvió a mostrar",
    cortesia: (dias: number, vence: string) =>
      `Dio ${dias} ${dias === 1 ? "día" : "días"} de cortesía: vence el ${vence}`,
    sumoAdmin: (email: string) => `Sumó a ${email} al equipo`,
    sacoAdmin: (email: string) => `Sacó a ${email} del equipo`,
    sumoFundador: "Lo sumó como fundador: Pro gratis hasta el 1 de julio de 2027",
  },
  /** Quién entra al panel (paso I de docs/PLAN-ADMIN-V3.md). */
  equipo: {
    titulo: "Administradores",
    bajada: "Las cuentas que entran a este panel.",
    vos: "Vos",
    aMano: "A mano",
    sumar: {
      boton: "Sumar a alguien",
      titulo: "Sumar a alguien al equipo",
      bajada:
        "Entra al panel con su cuenta de Google. Si todavía no tiene cuenta, que entre una vez a /admin y probá de nuevo.",
      mail: "Mail de su cuenta",
      ejemplo: "alguien@gmail.com",
      nota: "Nota",
      notaEjemplo: "Se suma para atender a los locales",
      confirmar: "Sumar",
      enviando: "Sumando…",
      generico: "No pudimos sumarlo. Probá de nuevo.",
    },
    sacar: {
      boton: "Sacar",
      titulo: (email: string) => `Sacar a ${email} del equipo`,
      bajada: "Deja de entrar al panel desde su próxima página. Lo que hizo queda en el registro.",
      nota: "Nota",
      notaEjemplo: "Ya no trabaja con nosotros",
      confirmar: "Sacar",
      enviando: "Sacando…",
      generico: "No pudimos sacarlo. Probá de nuevo.",
    },
    registro: {
      titulo: "Lo que hizo el equipo",
      bajada: "Todo el registro, también lo que no es de un local: las últimas 100 acciones, de la más nueva a la más vieja.",
      vacio: "Todavía nadie cambió nada desde el panel.",
    },
  },
};

/** Los cambios de estado de un local (paso H de docs/PLAN-ADMIN-V3.md, D1). */
export const historia = {
  titulo: "Historia de la suscripción",
  bajada: "Cada cambio de estado, de lo más nuevo a lo más viejo.",
  vacia: "Sin cambios desde el 23 de octubre de 2026, cuando se empezó a guardar.",
  desdeElPanel: "Desde el panel",
};

/** Lo que es una persona en un local. */
export const roles: Record<string, string> = {
  duenio: "Dueño",
  profesional: "Profesional",
};

/** Con qué entra una cuenta. */
export const proveedores: Record<string, string> = {
  google: "Google",
  apple: "Apple",
  email: "Mail y contraseña",
};

/** Cómo se pagó un turno: el medio, la parte y cómo quedó. */
export const metodosDePago: Record<string, string> = {
  mercadopago: "Mercado Pago",
  efectivo: "Efectivo",
  cupon_gratis: "Cupón",
  manual: "Cargado por el local",
};

export const tiposDePago: Record<string, string> = {
  total: "total",
  sena: "seña",
  manual: "",
};

export const estadosDePago: Record<string, string> = {
  pendiente: "sin pagar",
  pagado: "pagado",
  devuelto: "devuelto",
  fallido: "falló",
  no_aplica: "",
};
