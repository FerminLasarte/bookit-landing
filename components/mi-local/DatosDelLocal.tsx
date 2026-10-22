"use client";

import { useActionState, useState } from "react";
import { guardarPerfil, type EstadoDelPerfil } from "@/app/mi-local/(panel)/perfil/acciones";
import Field from "@/components/forms/Field";
import LocalidadYDireccion from "@/components/forms/LocalidadYDireccion";
import Button from "@/components/ui/Button";
import { miLocal } from "@/content/mi-local";
import type { Categoria } from "@/lib/alta";
import { formularioSinBorrar } from "@/lib/formularios";
import RespuestaDeAccion from "./RespuestaDeAccion";

/**
 * Los datos del local, como "Información del negocio" de la app: el nombre, la
 * categoría, la dirección y el Instagram, con un solo botón. La dirección de
 * ahora se ve como texto; para cambiarla se abren los buscadores del alta, y
 * sólo si se eligió una nueva viaja al servidor.
 */
export default function DatosDelLocal({
  nombre,
  categoria,
  direccion,
  instagram,
  email,
  categorias,
}: {
  nombre: string;
  categoria: number | null;
  /** La de ahora, como la muestra la ficha. */
  direccion: string | null;
  instagram: string | null;
  email: string | null;
  categorias: Categoria[];
}) {
  const copy = miLocal.perfil.datos;
  const [cambiandoDireccion, setCambiandoDireccion] = useState(false);
  const [estado, enviar, enviando] = useActionState<EstadoDelPerfil, FormData>(async (antes, datos) => {
    const respuesta = await guardarPerfil(antes, datos);
    // Guardada, la dirección nueva pasa a ser la de ahora.
    if (respuesta.listo) setCambiandoDireccion(false);
    return respuesta;
  }, { error: null });
  const errores = estado.errores ?? {};

  return (
    <form {...formularioSinBorrar(enviar)} className="flex flex-col gap-5">
      <Field id="perfil-nombre" label={copy.nombre} error={errores.nombre}>
        {(props) => (
          // Con `key`, después de guardar muestra lo que quedó, no lo que se escribió.
          <input {...props} key={nombre} name="nombre" type="text" defaultValue={nombre} autoComplete="organization" maxLength={80} required />
        )}
      </Field>

      <Field id="perfil-categoria" label={copy.categoria} error={errores.categoria}>
        {(props) => (
          <select {...props} name="categoria" required defaultValue={categoria ?? ""}>
            {categoria === null && <option value="" disabled />}
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        )}
      </Field>

      {cambiandoDireccion ? (
        <div className="flex flex-col gap-5">
          <LocalidadYDireccion id="perfil" copy={miLocal.perfil.ubicacion} errores={errores} />
          <button
            type="button"
            onClick={() => setCambiandoDireccion(false)}
            className="ring-focus self-start rounded-[4px] px-1 text-small font-semibold text-muted underline-offset-2 hover:text-fg hover:underline"
          >
            {copy.dejarDireccion}
          </button>
        </div>
      ) : (
        <div>
          <p className="text-small font-semibold text-fg">{copy.direccion}</p>
          <p className="mt-2 text-body text-fg">{direccion ?? copy.sinDireccion}</p>
          <button
            type="button"
            onClick={() => setCambiandoDireccion(true)}
            className="ring-focus mt-1 rounded-[4px] px-1 -ml-1 text-small font-semibold text-accent-fg underline-offset-2 hover:underline"
          >
            {copy.cambiarDireccion}
          </button>
        </div>
      )}

      <Field id="perfil-instagram" label={copy.instagram} optional error={errores.instagram}>
        {(props) => (
          <input
            {...props}
            key={instagram}
            name="instagram"
            type="text"
            defaultValue={instagram ?? ""}
            autoCapitalize="none"
            autoCorrect="off"
            placeholder={copy.usuarioDeInstagram}
          />
        )}
      </Field>

      {email && (
        <div>
          <Field id="perfil-mail" label={copy.mail}>
            {(props) => <input {...props} type="email" value={email} readOnly disabled />}
          </Field>
          <p className="mt-2 text-small text-muted">{copy.mailNota}</p>
        </div>
      )}

      <RespuestaDeAccion estado={estado} />
      <Button type="submit" disabled={enviando} className="self-start">
        {enviando ? copy.guardando : copy.guardar}
      </Button>
    </form>
  );
}
