import { acciones } from "@/content/admin";
import type { AccionDelEquipo } from "@/lib/admin/datos";
import { fechaConAnio } from "@/lib/formato";

/** Una fila del registro, en una frase. La usan la ficha del local y Equipo. */
export default function QueHizo({ accion: a }: { accion: AccionDelEquipo }) {
  const { registro } = acciones;
  switch (a.accion) {
    case "resolver_incidencia":
      return registro.resolvio(a.detalle.antes.id_pago_mp);
    case "extender_prueba":
      return registro.extendio(a.detalle.dias, fechaConAnio(a.detalle.despues.vencimiento));
    case "cambiar_visibilidad":
      return a.detalle.despues.visible ? registro.mostro : registro.oculto;
    case "sumar_fundador":
      return registro.sumoFundador;
    case "sumar_admin":
      return registro.sumoAdmin(a.detalle.despues.email);
    case "sacar_admin":
      return registro.sacoAdmin(a.detalle.antes.email);
    default:
      // Una acción que la base ya anota y la web todavía no conoce: BooKit la suma primero.
      return <span className="text-muted">{(a as { accion: string }).accion}</span>;
  }
}
