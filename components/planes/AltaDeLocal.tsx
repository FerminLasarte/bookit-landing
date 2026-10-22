"use client";

import { useActionState, useState } from "react";
import { crearLocal, type EstadoDelAlta } from "@/app/planes/acciones";
import Buscador from "@/components/forms/Buscador";
import Field from "@/components/forms/Field";
import Button from "@/components/ui/Button";
import Superficie from "@/components/ui/Superficie";
import { planes } from "@/content/planes";
import type { Categoria, DireccionResuelta, Localidad, SugerenciaDeDireccion } from "@/lib/alta";
import { formularioSinBorrar } from "@/lib/formularios";

/*
 * El alta del local para una cuenta sin local: los datos que pide la app,
 * salvo el pin y la foto (BooKit, docs/web-en-pesos.md §9). Localidad y
 * dirección se eligen de una lista; lo que viaja al servidor es lo elegido.
 */

/** Una sesión de autocompletado: Google cobra la elección, no cada tecla. */
const nuevaSesion = () => crypto.randomUUID().replaceAll("-", "");

async function pedir<T>(url: string, init?: RequestInit): Promise<T> {
  const respuesta = await fetch(url, init);
  if (!respuesta.ok) throw new Error(`${url}: ${respuesta.status}`);
  return (await respuesta.json()) as T;
}

export default function AltaDeLocal({ categorias }: { categorias: Categoria[] }) {
  const copy = planes.alta;
  const [estado, enviar, enviando] = useActionState<EstadoDelAlta, FormData>(crearLocal, {
    errores: {},
    general: null,
  });
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

  const errores = estado.errores;

  return (
    <Superficie tone="surface" className="mx-auto w-full max-w-[28rem] p-6 md:p-8">
      <form {...formularioSinBorrar(enviar)} className="flex flex-col gap-5">
        <Field id="alta-nombre" label={copy.nombre} error={errores.nombre}>
          {(props) => <input {...props} name="nombre" type="text" autoComplete="organization" maxLength={80} required />}
        </Field>

        <Field id="alta-categoria" label={copy.categoria} error={errores.categoria}>
          {(props) => (
            <select {...props} name="categoria" required defaultValue="">
              <option value="" disabled>
                {copy.elegirCategoria}
              </option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field id="alta-localidad" label={copy.localidad} error={errores.localidad}>
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

        <Field id="alta-direccion" label={copy.direccion} error={errores.direccion}>
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

        <Field id="alta-instagram" label={copy.instagram} optional error={errores.instagram}>
          {(props) => (
            <input {...props} name="instagram" type="text" autoCapitalize="none" placeholder={copy.usuarioDeInstagram} />
          )}
        </Field>

        {estado.general && (
          <p role="alert" className="text-small font-medium text-danger">
            {estado.general}
          </p>
        )}
        <Button type="submit" disabled={enviando} className="w-full">
          {enviando ? copy.creando : copy.boton}
        </Button>
      </form>
    </Superficie>
  );
}
