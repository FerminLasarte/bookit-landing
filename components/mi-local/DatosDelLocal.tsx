"use client";

import { useActionState, useState } from "react";
import { guardarPerfil, type EstadoDelPerfil } from "@/app/mi-local/(panel)/perfil/acciones";
import Field, { labelClasses } from "@/components/forms/Field";
import LocalidadYDireccion from "@/components/forms/LocalidadYDireccion";
import Button from "@/components/ui/Button";
import { miLocal } from "@/content/mi-local";
import type { Categoria } from "@/lib/alta";
import { formularioSinBorrar } from "@/lib/formularios";
import { Casilla } from "./Opciones";
import RespuestaDeAccion from "./RespuestaDeAccion";

/** Las categorías además de la principal: la base deja hasta 3 en total. */
const HASTA_OTRAS = 2;

/**
 * Los datos del local, como "Información del negocio" de la app: el nombre, la
 * categoría y hasta 2 más, la dirección y el Instagram, con un solo botón. La
 * dirección de ahora se ve como texto; para cambiarla se abren los buscadores
 * del alta, y sólo si se eligió una nueva viaja al servidor. Las otras
 * categorías son casillas comunes: sin JavaScript, el tope lo dice la base.
 */
export default function DatosDelLocal({
  nombre,
  categoria,
  otras: otrasDeAhora,
  direccion,
  instagram,
  email,
  categorias,
}: {
  nombre: string;
  categoria: number | null;
  otras: number[];
  /** La de ahora, como la muestra la ficha. */
  direccion: string | null;
  instagram: string | null;
  email: string | null;
  categorias: Categoria[];
}) {
  const copy = miLocal.perfil.datos;
  const [principal, setPrincipal] = useState(categoria);
  const [otras, setOtras] = useState(otrasDeAhora);
  const [cambiandoDireccion, setCambiandoDireccion] = useState(false);

  // La principal no va entre las otras: si estaba marcada, se desmarca.
  function elegirPrincipal(id: number) {
    setPrincipal(id);
    setOtras((antes) => antes.filter((otra) => otra !== id));
  }

  function alternar(id: number, marcada: boolean) {
    setOtras((antes) => (marcada ? [...antes, id] : antes.filter((otra) => otra !== id)));
  }

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
          <select {...props} name="categoria" required value={principal ?? ""} onChange={(e) => elegirPrincipal(Number(e.target.value))}>
            {categoria === null && <option value="" disabled />}
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        )}
      </Field>

      <fieldset>
        <legend className={labelClasses}>{copy.otras}</legend>
        <p className="mt-1 text-small text-muted">{copy.otrasBajada}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {categorias
            .filter((c) => c.id !== principal)
            .map((c) => {
              const marcada = otras.includes(c.id);
              return (
                <Casilla
                  key={c.id}
                  name="otras"
                  value={c.id}
                  checked={marcada}
                  onChange={(e) => alternar(c.id, e.target.checked)}
                  disabled={!marcada && otras.length >= HASTA_OTRAS}
                >
                  {c.nombre}
                </Casilla>
              );
            })}
        </div>
      </fieldset>

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
