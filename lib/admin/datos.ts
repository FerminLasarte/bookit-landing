import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
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

/**
 * La pausa que pidió el local y no terminó: en curso o programada. `hasta` es
 * el último día cerrado, inclusive; `null`, sin fecha de vuelta. Días de
 * Buenos Aires, como `2027-01-09` (BooKit `docs/pausa-del-local.md`, sección 5).
 */
export type Pausa = { desde: string; hasta: string | null };

/** Por qué un local no sale hoy en los listados, con la regla de la base: pueden venir varios. */
export type MotivoDeNoAparecer = "oculto" | "estado" | "pausa";

/** Cada vez que el dueño pausó, cambió las fechas o volvió. `desde` null: sacó la pausa. */
export type CambioDePausa = {
  cambiado_el: string;
  desde_antes: string | null;
  hasta_antes: string | null;
  desde: string | null;
  hasta: string | null;
  turnos_cancelados: number;
};

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
  pausa: Pausa | null;
  no_aparece_por: MotivoDeNoAparecer[];
  es_fundador: boolean;
};

export type FiltroComercios = "prueba" | "pagando" | "cortados" | "pendientes" | "bajas";

/** Cómo se ordena la lista de Comercios (BooKit `docs/admin-panel.md`, sección 22). Los empates, por alta. */
export type OrdenComercios = "alta" | "vencimiento" | "turnos" | "ultimo_turno";

/** Lo que se le pide a la lista de Comercios: todo opcional, y sin nada es la lista entera por alta. */
export type PedidoDeComercios = {
  busqueda?: string;
  estado?: FiltroComercios;
  localidad?: string;
  nivel?: string;
  canal?: string;
  fundador?: boolean;
  visible?: boolean;
  enPausa?: boolean;
  orden?: OrdenComercios;
};

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
  /** La gracia del plan actual, de `planes` (BooKit `docs/admin-panel.md`, sección 18). */
  dias_gracia: number;
  vencimiento: string | null;
  cancela_al_vencer: boolean;
  tiene_debito_mp: boolean;
  /** Lo que cobra el débito en cada ciclo, de Mercado Pago. `null` sin débito o si no se sabe (sección 19). */
  monto_debito: number | null;
  /** El ciclo del débito. Un local de la tienda también lo tiene: vale sólo con `tiene_debito_mp`. */
  plan_debito: string | null;
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
  pausa: Pausa | null;
  no_aparece_por: MotivoDeNoAparecer[];
  /** De lo más nuevo a lo más viejo. Los escribe el dueño, nunca el panel. */
  cambios_de_pausa: CambioDePausa[];
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
      accion: "cambiar_fundador";
      detalle: { antes: { es_fundador: boolean }; despues: { es_fundador: boolean }; nota: string };
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
      accion: "suspender";
      detalle: { antes: { estado: EstadoSuscripcion }; debito_dado_de_baja: boolean; nota: string };
    }
  | {
      creado_el: string;
      email: string | null;
      accion: "reactivar";
      detalle: { despues: { estado: EstadoSuscripcion }; nota: string };
    }
  | {
      creado_el: string;
      email: string | null;
      accion: "cambiar_avisos";
      // Sin nota: es una preferencia, no una decisión sobre un local (sección 20).
      detalle: {
        id_usuario: string;
        email: string;
        antes: { recibe_avisos: boolean };
        despues: { recibe_avisos: boolean };
        nota?: undefined;
      };
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
  /** Le llegan los mails del equipo: el de las 04:00 y el del momento (sección 20). */
  recibe_avisos: boolean;
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

/** Una lista corta de "Para atender": hasta 10 filas y el total aparte. */
type ListaCorta<T> = { total: number; filas: T[] };
type LocalCorto = { id_comercio: string; nombre: string };

/**
 * Lo que pide una mano, para el Inicio y los contadores de la barra lateral
 * (BooKit `docs/admin-panel.md`, sección 23). Ningún local dado de baja entra.
 */
export type ParaAtender = {
  incidencias_abiertas: number;
  debitos_con_problemas: number;
  altas_a_medias: number;
  /** En prueba y vencen en los próximos 7 días, el más próximo primero. */
  pruebas_por_vencer: ListaCorta<LocalCorto & { vencimiento: string; tiene_debito_mp: boolean; canal: string }>;
  /** Con la regla de `_no_aparece_por`. `suspendidos`: sólo los que suspendió el equipo; `en_pausa`: la pausa corre hoy. */
  no_aparecen: { ocultos: ListaCorta<LocalCorto>; suspendidos: ListaCorta<LocalCorto>; en_pausa: ListaCorta<LocalCorto> };
  /** Pagando, sin turnos reservados en 14 días: primero los que nunca tuvieron. */
  sin_turnos: ListaCorta<LocalCorto & { ultimo_turno: string | null }>;
};

/** Un número del período y el del anterior, del mismo largo. */
export type ContraAnterior = { periodo: number; anterior: number };

/** Lo que cuentan los totales y cada punto de la serie (BooKit `docs/admin-panel.md`, sección 24). */
export type MedidaDeEstadisticas =
  | "altas"
  | "bajas"
  | "cobrado_suscripciones"
  | "reservas"
  | "por_la_app"
  | "de_mostrador"
  | "completadas"
  | "canceladas"
  | "canceladas_tarde"
  | "ausentes"
  | "cuentas_nuevas"
  | "clientes_activos";

/**
 * Las estadísticas de un período de días de Buenos Aires, con `hasta`
 * inclusive. La serie va por día hasta 92 días y por mes si es más largo.
 * `hoy` son fotos sin período anterior: la base guarda cómo está cada local
 * ahora, no cómo estaba.
 */
export type Estadisticas = {
  periodo: { desde: string; hasta: string; dias: number };
  anterior: { desde: string; hasta: string };
  serie_por: "dia" | "mes";
  totales: Record<MedidaDeEstadisticas, ContraAnterior>;
  serie: ({ desde: string; hasta: string } & Record<MedidaDeEstadisticas, number>)[];
  /** Por mes de alta, los últimos 12 meses con el actual. `empezaron`: los que ya no están en `pendiente`. */
  prueba_al_pago: { mes: string; empezaron: number; pagan: number }[];
  hoy: {
    ingreso_mensual_estimado: number;
    activos_por_nivel: Record<string, number>;
    activos_por_canal: Record<string, number>;
    activos_por_localidad: Record<string, number>;
    activos_por_categoria: Record<string, number>;
  };
  mas_turnos: { id_comercio: string; nombre: string; turnos: number }[];
  /** Desde qué día hay datos de cada medida; `null` o sin clave, desde el principio. */
  datos_desde: Partial<Record<MedidaDeEstadisticas, string | null>>;
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

/** Un lugar al que lleva el buscador del panel. */
export type Encontrado = { href: string; titulo: string; detalle: string };

/** Lo que devuelve /admin/buscar. */
export type Encontrados = { comercios: Encontrado[]; personas: Encontrado[] };

/** Cuántas filas trae cada página de una lista del panel. */
export const POR_PAGINA = 50;

/** Lo más que da cada lectura de una vez (sección 22): el CSV recorre de a tanto. */
export const MAXIMO_POR_LECTURA = 200;

export const leerPulso = () => leer<Pulso>("admin_pulso");

export const leerEstadisticas = (desde: string, hasta: string) =>
  leer<Estadisticas>("admin_estadisticas", { p_desde: desde, p_hasta: hasta });

/** La comparten el marco (los contadores) y el Inicio: una sola lectura por página. */
export const leerParaAtender = cache(() => leer<ParaAtender>("admin_para_atender"));

export const leerComercios = (p: PedidoDeComercios & { limite: number; desde: number }) =>
  leer<{ total: number; filas: FilaComercio[]; localidades: string[] }>("admin_comercios", {
    p_busqueda: p.busqueda ?? null,
    p_estado: p.estado ?? null,
    p_localidad: p.localidad ?? null,
    p_nivel: p.nivel ?? null,
    p_canal: p.canal ?? null,
    p_fundador: p.fundador ?? null,
    p_visible: p.visible ?? null,
    p_en_pausa: p.enPausa ?? null,
    p_orden: p.orden ?? null,
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

/**
 * Quién tiene abierta la sesión del panel, de su token. No dice si es del
 * equipo: eso lo decide la base en cada lectura.
 */
export const leerQuienEntro = cache(async () => {
  const supabase = await clienteDeSupabase("panel");
  const { data } = await supabase.auth.getClaims();
  return { id: data?.claims.sub ?? null, email: data?.claims.email ?? null };
});

/** El registro del equipo, paginado (sección 22). Sin `acciones`, todas; con `idComercio`, sólo las de ese local. */
export const leerRegistro = (p: {
  acciones?: AccionDelEquipo["accion"][];
  idComercio?: string;
  limite: number;
  desde: number;
}) =>
  leer<{ total: number; filas: AccionDelRegistro[] }>("admin_registro", {
    p_acciones: p.acciones ?? null,
    p_id_comercio: p.idComercio ?? null,
    p_limite: p.limite,
    p_desde: p.desde,
  });

/** El equipo y quién lo está mirando, que no se puede sacar a sí mismo (D4 de la v3). */
export async function leerEquipo(): Promise<Equipo & { yo: string | null }> {
  const [equipo, yo] = await Promise.all([leer<Equipo>("admin_equipo"), leerQuienEntro()]);
  return { ...equipo, yo: yo.id };
}
