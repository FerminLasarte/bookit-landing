"use client";

import { useState } from "react";
import Buscador from "@/components/forms/Buscador";
import Field from "@/components/forms/Field";
import type { DireccionResuelta, Localidad, SugerenciaDeDireccion } from "@/lib/alta";

/** Los textos de los dos campos: los del alta en /planes y los del perfil en /mi-local. */
export type CopyDeUbicacion = {
  localidad: string;
  buscarLocalidad: string;
  direccion: string;
  buscarDireccion: string;
  sinLocalidad: string;
  sinDireccion: (localidad: string) => string;
  errores: { buscar: string };
};

/** Una sesión de autocompletado: Google cobra la elección, no cada tecla. */
const nuevaSesion = () => crypto.randomUUID().replaceAll("-", "");

async function pedir<T>(url: string, init?: RequestInit): Promise<T> {
  const respuesta = await fetch(url, init);
  if (!respuesta.ok) throw new Error(`${url}: ${respuesta.status}`);
  return (await respuesta.json()) as T;
}

/**
 * La localidad y la dirección del local, elegidas de una lista, como en la
 * app: primero la localidad, y la calle se busca dentro de ella. Lo que viaja
 * al servidor es lo elegido, en los campos ocultos `localidad`, `direccion`,
 * `lat` y `lng`. La usan el alta y el perfil.
 */
export default function LocalidadYDireccion({
  id,
  copy,
  errores,
}: {
  id: string;
  copy: CopyDeUbicacion;
  errores: { localidad?: string; direccion?: string };
}) {
  const [localidad, setLocalidad] = useState<Localidad | null>(null);
  const [direccion, setDireccion] = useState<DireccionResuelta | null>(null);
  const [sesion, setSesion] = useState(nuevaSesion);
  // Cambiar de localidad vacía la dirección: el buscador se monta de nuevo.
  const [vuelta, setVuelta] = useState(0);

  const buscarLocalidades = async (texto: string) =>
    (await pedir<{ localidades: Localidad[] }>(`/planes/alta/localidades?${new URLSearchParams({ q: texto })}`))
      .localidades;

  const direcciones = (cuerpo: object) =>
    pedir<{ sugerencias?: SugerenciaDeDireccion[]; direccion?: DireccionResuelta | null }>("/planes/alta/direcciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sesion, ...cuerpo }),
    });

  const buscarDirecciones = async (texto: string) =>
    localidad
      ? ((await direcciones({ accion: "sugerir", texto, localidad })).sugerencias ?? [])
      : [];

  const elegirDireccion = async (sugerencia: SugerenciaDeDireccion | null) => {
    setDireccion(null);
    if (!sugerencia) return;
    try {
      const { direccion: resuelta } = await direcciones({ accion: "detalle", placeId: sugerencia.placeId });
      setDireccion(resuelta ?? null);
    } finally {
      // La sesión se cierra con la elección: la próxima búsqueda abre otra.
      setSesion(nuevaSesion());
    }
  };

  return (
    <>
      <Field id={`${id}-localidad`} label={copy.localidad} error={errores.localidad}>
        {(props) => (
          <Buscador<Localidad>
            control={props}
            placeholder={copy.buscarLocalidad}
            minimo={2}
            vacio={copy.sinLocalidad}
            fallo={copy.errores.buscar}
            buscar={buscarLocalidades}
            opcion={(l) => ({
              clave: l.id,
              principal: l.nombre,
              secundario: [l.departamento, l.provincia].filter(Boolean).join(", "),
            })}
            onElegir={(elegida) => {
              setLocalidad(elegida);
              setDireccion(null);
              setVuelta((v) => v + 1);
            }}
          />
        )}
      </Field>
      <input type="hidden" name="localidad" value={localidad?.id ?? ""} />

      <Field id={`${id}-direccion`} label={copy.direccion} error={errores.direccion}>
        {(props) => (
          <Buscador<SugerenciaDeDireccion>
            key={vuelta}
            control={props}
            placeholder={copy.buscarDireccion}
            disabled={!localidad}
            vacio={copy.sinDireccion(localidad?.nombre ?? "")}
            fallo={copy.errores.buscar}
            buscar={buscarDirecciones}
            opcion={(s) => ({ clave: s.placeId, principal: s.principal, secundario: s.secundario })}
            onElegir={elegirDireccion}
          />
        )}
      </Field>
      <input type="hidden" name="direccion" value={direccion?.direccion ?? ""} />
      <input type="hidden" name="lat" value={direccion?.lat ?? ""} />
      <input type="hidden" name="lng" value={direccion?.lng ?? ""} />
    </>
  );
}
