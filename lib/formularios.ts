import { startTransition, type FormEvent } from "react";

/** Lo que vino en un campo de un formulario, sin espacios en las puntas. Vacío si no vino. */
export const campo = (datos: FormData, nombre: string) => String(datos.get(nombre) ?? "").trim();

/**
 * Manda un formulario a su action sin el reseteo automático de React 19: si
 * el servidor devuelve un error, lo escrito queda.
 */
export const enviarSinBorrar = (accion: (datos: FormData) => void) => (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  const datos = new FormData(event.currentTarget);
  startTransition(() => accion(datos));
};
