import "server-only";
import { redirect } from "next/navigation";
import type { EstadoTurno } from "@/lib/mi-local/turnos";
import { clienteDeSupabase } from "@/lib/supabase";

/*
 * Las lecturas del panel. Cada una es una función `admin_*` de la base
 * (BooKit, supabase/migrations/20261008150000_superadmin.sql), que rechaza con
 * 42501 a quien no esté en `administradores`.
 */

export type EstadoSuscripcion = "al_dia" | "en_gracia" | "cortada" | "suspendida" | "pendiente";

export type Pulso = {
  comercios: {
    total: number;
    en_prueba: number;
    pagando: number;
    cortados: number;
    pendientes: number;
    cancelan_al_vencer: number;
    altas_30d: number;
    bajas_30d: number;
    por_nivel: Record<string, number>;
    por_canal: Record<string, number>;
  };
  usuarios: { total: number; nuevos_30d: number; activos_30d: number };
  turnos: {
    hoy: number;
    proximos_7d: number;
    completados_mes: number;
    por_la_app_30d: number;
    de_mostrador_30d: number;
    reservas_por_dia: { dia: string; reservas: number }[];
  };
  plata: {
    cobrado_por_locales_mes: number;
    pagos_suscripcion_mes: number;
    incidencias_abiertas: number;
    /** Sólo los pagos con monto: se guarda desde el 23-oct-2026 (BooKit `docs/admin-panel.md`, sección 9). */
    cobrado_suscripciones_mes: number;
    /** Los que pagan por Mercado Pago y renuevan, a precio de lista, llevado a 30 días. */
    ingreso_mensual_estimado: number;
    locales_tienda: number;
  };
  /** Meses calendario en Buenos Aires. El en curso va hasta ahora. */
  mes_en_curso: Mes;
  mes_anterior: Mes;
};

type Mes = { altas: number; bajas: number; reservas: number; cobrado_suscripciones: number };

export type FilaComercio = {
  id_comercio: string;
  nombre: string;
  localidad: string | null;
  nivel: string;
  plan: string;
  estado: EstadoSuscripcion;
  /** `false`: lo ocultó el equipo (BooKit `docs/admin-panel.md`, sección 11). */
  visible: boolean;
  canal: string;
  vencimiento: string | null;
  cancela_al_vencer: boolean;
  creado_el: string;
  dado_de_baja_el: string | null;
  email_duenio: string | null;
  turnos_30d: number;
  ultimo_turno: string | null;
};

export type FiltroComercios = "prueba" | "pagando" | "cortados" | "pendientes" | "bajas";

export type FichaComercio = {
  id_comercio: string;
  nombre: string;
  direccion: string | null;
  localidad: string | null;
  instagram: string | null;
  logo_url: string | null;
  nivel: string;
  plan: string;
  estado: EstadoSuscripcion;
  /** `false`: lo ocultó el equipo. Con `true` igual aparece sólo si está al día o en gracia. */
  visible: boolean;
  canal: string;
  es_fundador: boolean;
  vencimiento: string | null;
  cancela_al_vencer: boolean;
  tiene_debito_mp: boolean;
  creado_el: string;
  dado_de_baja_el: string | null;
  habilita_puntos: boolean;
  acepta_efectivo: boolean;
  duenio: {
    id_usuario: string | null;
    email: string | null;
    nombre: string | null;
    telefono: string | null;
    ultimo_ingreso: string | null;
  };
  mercado_pago: { vinculado_el: string; caida_el: string | null } | null;
  profesionales: { nombre: string; esta_activo: boolean; con_cuenta: boolean }[];
  servicios: { nombre: string; precio: number; duracion_minutos: number; esta_activo: boolean }[];
  turnos_por_mes: { mes: string; reservados: number; completados: number; cancelados: number }[];
  pagos_suscripcion: { mp_payment_id: string; plan: string; creado_el: string }[];
  alta: { plan: string; estado: string; primer_cobro: string | null; creado_el: string } | null;
  incidencias: Incidencia[];
  /** Lo que hizo el equipo desde el panel, de lo más nuevo a lo más viejo (BooKit `docs/admin-panel.md`, sección 5). */
  acciones: AccionDelEquipo[];
  /** Cada cambio de estado, de lo más nuevo a lo más viejo. Se guardan desde el 23-oct-2026 (sección 13). */
  cambios_de_estado: CambioDeEstado[];
};

/** `por_el_equipo`: lo cambió una acción del panel, en la misma transacción que su fila del registro. */
export type CambioDeEstado = {
  cambiado_el: string;
  estado_anterior: EstadoSuscripcion;
  estado_nuevo: EstadoSuscripcion;
  por_el_equipo: boolean;
};

/** Una fila de `admin_acciones`. `email` es `null` si la cuenta de quien lo hizo ya no existe. */
export type AccionDelEquipo =
  | {
      creado_el: string;
      email: string | null;
      accion: "resolver_incidencia";
      detalle: { antes: { id_pago_mp: string; motivo: string; monto: number | null }; nota: string };
    }
  | {
      creado_el: string;
      email: string | null;
      accion: "extender_prueba";
      detalle: { despues: { vencimiento: string }; dias: number; nota: string | null };
    }
  | {
      creado_el: string;
      email: string | null;
      accion: "cambiar_visibilidad";
      detalle: { antes: { visible: boolean }; despues: { visible: boolean }; nota: string | null };
    }
  | {
      creado_el: string;
      email: string | null;
      accion: "dar_cortesia";
      detalle: { despues: { vencimiento: string }; dias: number; nota: string };
    }
  | {
      creado_el: string;
      email: string | null;
      accion: "sumar_admin";
      detalle: { despues: { id_usuario: string; email: string }; nota: string | null };
    }
  | {
      creado_el: string;
      email: string | null;
      accion: "sacar_admin";
      detalle: { antes: { id_usuario: string; email: string }; nota: string | null };
    }
  | {
      creado_el: string;
      email: string | null;
      accion: "sumar_fundador";
      detalle: { despues: { vencimiento: string }; nota: string | null };
    };

/** Una fila del registro entero: la de la ficha, más el local si la acción es de uno. */
export type AccionDelRegistro = AccionDelEquipo & { id_comercio: string | null; comercio: string | null };

/** Una cuenta del equipo. `sumado_por` es `null` si se cargó a mano o si esa cuenta ya no existe. */
export type Administrador = {
  id_usuario: string;
  email: string;
  nombre: string | null;
  desde: string;
  sumado_por: string | null;
};

/** Quién entra al panel y el registro entero (BooKit `docs/admin-panel.md`, sección 14). */
export type Equipo = { administradores: Administrador[]; acciones: AccionDelRegistro[] };

export type Incidencia = {
  id_pago_mp: string;
  id_comercio?: string | null;
  comercio?: string | null;
  motivo: string;
  monto: number | null;
  reembolso: string;
  detalle: string | null;
  creado_el: string;
  resuelto_el?: string | null;
};

export type Cobros = {
  debitos_con_problemas: {
    id_comercio: string;
    nombre: string;
    estado: EstadoSuscripcion;
    plan: string;
    canal: string;
    vencimiento: string | null;
  }[];
  altas_abandonadas: { id_usuario: string; email: string | null; plan: string; estado: string; creado_el: string }[];
  incidencias_abiertas: Incidencia[];
  ultimos_pagos: {
    mp_payment_id: string;
    plan: string;
    creado_el: string;
    id_comercio: string | null;
    comercio: string | null;
  }[];
};

/** Un local de una persona. El dueño sale una sola vez, como `duenio`, aunque también sea profesional. */
export type LocalDePersona = {
  id_comercio: string;
  nombre: string;
  rol: "duenio" | "profesional";
  dado_de_baja_el: string | null;
};

export type FilaPersona = {
  id_usuario: string;
  email: string | null;
  nombre: string | null;
  alta: string;
  ultimo_ingreso: string | null;
  locales: LocalDePersona[];
};

export type TurnoDePersona = {
  id_turno: string;
  fecha: string;
  id_comercio: string;
  local: string;
  servicio: string | null;
  estado: EstadoTurno;
  metodo_pago: string;
  tipo_pago: string;
  pago_estado: string;
  precio_total: number;
  monto_pagado: number | null;
};

/** La ficha de una persona (BooKit `docs/admin-panel.md`, sección 8). Los puntos son de la cuenta, no de un local. */
export type FichaPersona = Omit<FilaPersona, "locales"> & {
  telefono: string | null;
  proveedor: string;
  proveedores: string[];
  locales: LocalDePersona[];
  turnos: TurnoDePersona[];
  puntos: {
    disponibles: number;
    historicos: number;
    nivel: number;
    por_local: { id_comercio: string; local: string; ganados: number; canjeados: number }[];
  };
};

/*
 * Una cuenta que no está en `administradores` va a /admin/auth/sin-acceso,
 * que le cierra la sesión y la deja en /admin/sin-acceso. El chequeo vive acá
 * y no en el layout: Next dibuja la página en paralelo al layout, así que un
 * layout que corta no evita que la página lea.
 */
async function leer<T>(funcion: string, params?: Record<string, unknown>): Promise<T> {
  const supabase = await clienteDeSupabase("panel");
  const { data, error } = await supabase.rpc(funcion, params);
  if (error) {
    if (error.code === "42501") redirect("/admin/auth/sin-acceso");
    throw new Error(`${funcion}: ${error.message}`);
  }
  return data as T;
}

/** Cuántas filas trae cada página de una lista del panel. */
export const POR_PAGINA = 50;

export const leerPulso = () => leer<Pulso>("admin_pulso");

export const leerComercios = (p: {
  busqueda?: string;
  estado?: FiltroComercios;
  limite: number;
  desde: number;
}) =>
  leer<{ total: number; filas: FilaComercio[] }>("admin_comercios", {
    p_busqueda: p.busqueda ?? null,
    p_estado: p.estado ?? null,
    p_limite: p.limite,
    p_desde: p.desde,
  });

export const leerComercio = (id: string) =>
  leer<FichaComercio | null>("admin_comercio", { p_id_comercio: id });

export const leerCobros = () => leer<Cobros>("admin_cobros");

export const leerPersonas = (p: { busqueda?: string; limite: number; desde: number }) =>
  leer<{ total: number; filas: FilaPersona[] }>("admin_personas", {
    p_busqueda: p.busqueda ?? null,
    p_limite: p.limite,
    p_desde: p.desde,
  });

export const leerPersona = (id: string) => leer<FichaPersona | null>("admin_persona", { p_id_usuario: id });

/** El equipo y quién lo está mirando, que no se puede sacar a sí mismo (D4 de la v3). */
export async function leerEquipo(): Promise<Equipo & { yo: string | null }> {
  const equipo = await leer<Equipo>("admin_equipo");
  const supabase = await clienteDeSupabase("panel");
  const { data } = await supabase.auth.getClaims();
  return { ...equipo, yo: data?.claims.sub ?? null };
}
