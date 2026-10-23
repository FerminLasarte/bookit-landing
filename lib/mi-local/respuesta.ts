import { useActionState } from "react";

/**
 * Lo que contesta una acción del panel a su formulario. `verPlanes`: lo que se
 * rechazó se destraba con otro plan. `listo`: se guardó y la pantalla sigue.
 */
export type Respuesta = { error: string | null; verPlanes?: boolean; listo?: boolean };

/**
 * Una acción que va en un diálogo y lo cierra si sale bien: la página vuelve
 * releída, así que no hay nada más que mostrar. Si falla, el diálogo queda con
 * el error. `cierra`: para la que a veces tiene algo que decir después; lo que
 * suma a `Respuesta` es opcional, porque arranca sin nada.
 */
export function useAccionQueCierra<R extends Respuesta = Respuesta>(
  accion: (antes: R, datos: FormData) => Promise<R>,
  cerrar: () => void,
  cierra: (respuesta: R) => boolean = () => true,
) {
  return useActionState<R, FormData>(
    async (antes, datos) => {
      const respuesta = await accion(antes as R, datos);
      if (!respuesta.error && cierra(respuesta)) cerrar();
      return respuesta;
    },
    { error: null } as Awaited<R>,
  );
}
