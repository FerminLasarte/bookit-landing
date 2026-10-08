import "server-only";
import { redirect } from "next/navigation";
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
  };
};

export type FilaComercio = {
  id_comercio: string;
  nombre: string;
  localidad: string | null;
  nivel: string;
  plan: string;
  estado: EstadoSuscripcion;
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
  canal: string;
  es_fundador: boolean;
  vencimiento: string | null;
  cancela_al_vencer: boolean;
  tiene_debito_mp: boolean;
  creado_el: string;
  dado_de_baja_el: string | null;
  habilita_puntos: boolean;
  acepta_efectivo: boolean;
  duenio: { email: string | null; nombre: string | null; telefono: string | null; ultimo_ingreso: string | null };
  mercado_pago: { vinculado_el: string; caida_el: string | null } | null;
  profesionales: { nombre: string; esta_activo: boolean; con_cuenta: boolean }[];
  servicios: { nombre: string; precio: number; duracion_minutos: number; esta_activo: boolean }[];
  turnos_por_mes: { mes: string; reservados: number; completados: number; cancelados: number }[];
  pagos_suscripcion: { mp_payment_id: string; plan: string; creado_el: string }[];
  alta: { plan: string; estado: string; primer_cobro: string | null; creado_el: string } | null;
  incidencias: Incidencia[];
};

export type Incidencia = {
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
  altas_abandonadas: { email: string | null; plan: string; estado: string; creado_el: string }[];
  incidencias_abiertas: Incidencia[];
  ultimos_pagos: {
    mp_payment_id: string;
    plan: string;
    creado_el: string;
    id_comercio: string | null;
    comercio: string | null;
  }[];
};

/*
 * Una cuenta que no está en `administradores` va a /admin/sin-acceso. El
 * chequeo vive acá y no en el layout: Next dibuja la página en paralelo al
 * layout, así que un layout que corta no evita que la página lea.
 */
async function leer<T>(funcion: string, params?: Record<string, unknown>): Promise<T> {
  const supabase = await clienteDeSupabase("panel");
  const { data, error } = await supabase.rpc(funcion, params);
  if (error) {
    if (error.code === "42501") redirect("/admin/sin-acceso");
    throw new Error(`${funcion}: ${error.message}`);
  }
  return data as T;
}

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
