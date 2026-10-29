"use client";

import { useActionState } from "react";
import { crearLocal, type EstadoDelAlta } from "@/app/planes/acciones";
import Field from "@/components/forms/Field";
import LocalidadYDireccion from "@/components/forms/LocalidadYDireccion";
import Button from "@/components/ui/Button";
import Superficie from "@/components/ui/Superficie";
import { planes } from "@/content/planes";
import type { Categoria } from "@/lib/alta";
import { formularioSinBorrar } from "@/lib/formularios";

/*
 * El alta del local para una cuenta sin local: los datos que pide la app,
 * salvo el pin y la foto (BooKit, docs/web-en-pesos.md §9). Localidad y
 * dirección se eligen de una lista; lo que viaja al servidor es lo elegido.
 */

export default function AltaDeLocal({ categorias }: { categorias: Categoria[] }) {
  const copy = planes.alta;
  const [estado, enviar, enviando] = useActionState<EstadoDelAlta, FormData>(crearLocal, {
    errores: {},
    general: null,
  });
  const errores = estado.errores;

  return (
    <Superficie tone="surface" className="mx-auto w-full max-w-[28rem] p-6 md:p-8">
      <form {...formularioSinBorrar(enviar)} className="flex flex-col gap-5">
        <Field id="alta-nombre" label={copy.nombre} error={errores.nombre}>
          {(props) => <input {...props} name="nombre" type="text" autoComplete="organization" maxLength={80} required />}
        </Field>

        <div>
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
          <p className="mt-2 text-small text-muted">{copy.categoriaNota}</p>
        </div>

        <LocalidadYDireccion id="alta" copy={copy} errores={errores} />

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
