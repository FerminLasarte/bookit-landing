import { startTransition, type FormEvent } from "react";

/** Lo que vino en un campo de un formulario, sin espacios en las puntas. Vacío si no vino. */
export const campo = (datos: FormData, nombre: string) => String(datos.get(nombre) ?? "").trim();

/**
 * Las props de un formulario que manda a su action sin el reseteo automático
 * de React 19: si el servidor devuelve un error, lo escrito queda. Van juntas:
 * - `onSubmit`, con JavaScript, corta el envío y lo manda en una transición.
 *   React ve el envío cortado y no vuelve a llamar a `action` ni borra nada.
 *   Los datos incluyen el botón que se tocó, con su `name` y su `value`, como
 *   en un envío común ("Cargar igual" en la carga de un turno).
 * - `action`, antes de que cargue el JavaScript, hace que el HTML salga con
 *   `method="post"` y Next reciba la server action como un envío común. Sin
 *   ella, el navegador lo manda como un GET con los campos en la URL (la
 *   contraseña, en el de entrar) y no se guarda nada.
 */
export const formularioSinBorrar = (accion: (datos: FormData) => void) => ({
  action: accion,
  onSubmit: (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const datos = new FormData(event.currentTarget, (event.nativeEvent as SubmitEvent).submitter);
    startTransition(() => accion(datos));
  },
});
