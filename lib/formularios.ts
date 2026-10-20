import { startTransition, type FormEvent } from "react";

/**
 * Manda un formulario a su action sin el reseteo automático de React 19: si
 * el servidor devuelve un error, lo escrito queda.
 */
export const enviarSinBorrar = (accion: (datos: FormData) => void) => (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  const datos = new FormData(event.currentTarget);
  startTransition(() => accion(datos));
};
