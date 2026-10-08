import type { EstadoSuscripcion, FiltroComercios } from "@/lib/admin/datos";

/** Las secciones del panel, en el orden del nav. */
export const seccionesAdmin = [
  { href: "/admin", label: "Pulso" },
  { href: "/admin/comercios", label: "Comercios" },
  { href: "/admin/cobros", label: "Cobros" },
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

export const niveles: Record<string, string> = {
  esencial: "Esencial",
  pro: "Pro",
  equipo: "Equipo",
};

export const canales: Record<string, string> = {
  mercado_pago: "Mercado Pago",
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
