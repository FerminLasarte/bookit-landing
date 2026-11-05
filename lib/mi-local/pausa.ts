import "server-only";
import { pausaVigente, type Pausa } from "@/lib/pausa";
import { clienteDeSupabase } from "@/lib/supabase";
import type { Lugar } from "./lugar";

/*
 * La pausa del local en /mi-local (docs/PLAN-MI-LOCAL-PAUSA.md), con la
 * sesión de quien entra, como `PausaRepository` de la app. Escribirla pasa por
 * las funciones de la base (BooKit `docs/pausa-del-local.md`, sección 3): ellas
 * controlan que sea el dueño y cancelan los turnos de esos días.
 */

type Columnas = { pausa_desde: string | null; pausa_hasta: string | null };

const COLUMNAS = "pausa_desde, pausa_hasta";

/**
 * La pausa que no terminó del lugar donde se entra, o `null`. El dueño la lee
 * de su local; el profesional del equipo, por su fila, como la app (`delProfesional`).
 */
export async function leerPausa(lugar: Lugar): Promise<Pausa | null> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } =
    lugar.rol === "duenio"
      ? await supabase.from("comercios").select(COLUMNAS).eq("id_comercio", lugar.id).maybeSingle()
      : await supabase
          .from("profesionales")
          .select(`comercios(${COLUMNAS})`)
          .eq("id_profesional", lugar.idProfesional)
          .maybeSingle();
  if (error) throw new Error(`pausa: ${error.message}`);

  const fila = (lugar.rol === "duenio" ? data : (data as { comercios: Columnas | null } | null)?.comercios) as Columnas | null;
  return fila ? pausaVigente(fila.pausa_desde, fila.pausa_hasta) : null;
}

/** Un turno que se cancelaría con esas fechas. `cliente`: el de la cuenta o el cargado a mano; puede faltar. */
export type TurnoEnLaPausa = {
  id_turno: string;
  fecha_hora_inicio: string;
  cliente: string | null;
  servicio: string | null;
  profesional: string | null;
};

/** Los turnos que cancelaría pausar esos días (`turnos_en_la_pausa`), para mostrarlos antes. `hasta` null: sin fecha de vuelta. */
export async function leerTurnosEnLaPausa(idComercio: string, desde: string, hasta: string | null): Promise<TurnoEnLaPausa[]> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase.rpc("turnos_en_la_pausa", { p_comercio: idComercio, p_desde: desde, p_hasta: hasta });
  if (error) throw new Error(`turnos_en_la_pausa: ${error.message}`);
  return data as TurnoEnLaPausa[];
}
