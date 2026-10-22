import { cambiarDeLugar } from "@/app/mi-local/lugar/acciones";
import { miLocal } from "@/content/mi-local";
import type { OpcionDeLugar } from "@/lib/mi-local/lugar";
import Avatar from "./Avatar";

/**
 * Los otros lugares de la cuenta, para pasar a uno, como "Cambiar de lado" en
 * la app (D1 del plan del equipo). Va en la cuenta, arriba del plan: sólo
 * cuando hay más de un lugar. Es un formulario, así que anda sin JavaScript.
 */
export default function CambiarDeLugar({ lugares, actual }: { lugares: OpcionDeLugar[]; actual: string }) {
  const copy = miLocal.panel.cambiarDeLugar;
  const otros = lugares.filter((l) => l.clave !== actual);
  if (!otros.length) return null;

  return (
    <form action={cambiarDeLugar} className="flex flex-col gap-1">
      <p className="text-micro font-semibold text-muted">{copy.titulo}</p>
      {otros.map((l) => (
        <button
          key={l.clave}
          type="submit"
          name="clave"
          value={l.clave}
          className="ring-focus -mx-2 flex min-h-11 items-center gap-2.5 rounded-pill px-2 text-left hover:bg-fg/6"
        >
          <Avatar nombre={l.nombre} foto={l.logo} tamano="chico" />
          <span className="min-w-0">
            <span className="block truncate text-small font-semibold text-fg">{l.nombre}</span>
            <span className="block text-micro text-muted">{l.rol === "duenio" ? copy.tuLocal : copy.trabajasAca}</span>
          </span>
        </button>
      ))}
    </form>
  );
}
