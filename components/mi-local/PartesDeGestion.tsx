import { miLocal } from "@/content/mi-local";
import { Opcion } from "./Opciones";

/**
 * Horarios · Servicios · Equipo, arriba de cada una, como el selector de
 * Gestión en la app (D1 del plan de la fase 5). Es del dueño: el profesional
 * tiene Horarios y Servicios en su barra.
 */
export default function PartesDeGestion({ actual }: { actual: (typeof miLocal.panel.gestion.partes)[number]["id"] }) {
  const { titulo, partes } = miLocal.panel.gestion;
  return (
    <nav aria-label={titulo} className="flex flex-wrap gap-2">
      {partes.map((p) => (
        <Opcion key={p.id} href={p.href} activa={p.id === actual}>
          {p.label}
        </Opcion>
      ))}
    </nav>
  );
}
