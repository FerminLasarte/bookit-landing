import Badge from "@/components/ui/Badge";
import { miLocal } from "@/content/mi-local";
import type { EstadoTurno } from "@/lib/mi-local/turnos";

/** La insignia del estado, o "Sin marcar" para el turno que terminó y nadie cerró. En la fila y en la ficha. */
export default function EstadoDelTurno({ estado, sinMarcar }: { estado: EstadoTurno; sinMarcar: boolean }) {
  if (sinMarcar) return <Badge tono="atencion">{miLocal.agenda.sinMarcar}</Badge>;
  const { label, tono } = miLocal.estados[estado];
  return <Badge tono={tono}>{label}</Badge>;
}
