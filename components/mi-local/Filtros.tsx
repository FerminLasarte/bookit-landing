import { miLocal } from "@/content/mi-local";
import { ESTADOS_TURNO, type Profesional } from "@/lib/mi-local/agenda";
import { enlaceDeVista, type Vista } from "@/lib/mi-local/vista";
import { Grupo, Opcion } from "./Opciones";

/** Los filtros de la agenda: enlaces, así que funcionan sin JavaScript y quedan en la URL. */
export default function Filtros({ vista, profesionales }: { vista: Vista; profesionales: Profesional[] }) {
  const copy = miLocal.agenda;

  return (
    <div className="flex flex-col gap-3">
      {/* Con un solo profesional, filtrar por él es la lista entera. */}
      {profesionales.length > 1 && (
        <Grupo titulo={copy.profesional}>
          <Opcion href={enlaceDeVista({ ...vista, profesional: null })} activa={!vista.profesional}>
            {copy.todos}
          </Opcion>
          {profesionales.map((p) => (
            <Opcion key={p.id} href={enlaceDeVista({ ...vista, profesional: p.id })} activa={vista.profesional === p.id}>
              {p.nombre}
            </Opcion>
          ))}
        </Grupo>
      )}
      <Grupo titulo={copy.estado}>
        <Opcion href={enlaceDeVista({ ...vista, estado: null })} activa={!vista.estado}>
          {copy.todos}
        </Opcion>
        {ESTADOS_TURNO.map((estado) => (
          <Opcion key={estado} href={enlaceDeVista({ ...vista, estado })} activa={vista.estado === estado}>
            {miLocal.estados[estado].label}
          </Opcion>
        ))}
      </Grupo>
    </div>
  );
}
