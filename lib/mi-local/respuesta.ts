import { useActionState } from "react";

/**
 * Lo que contesta una acción del panel a su formulario. `verPlanes`: lo que se
 * rechazó se destraba con otro plan. `listo`: se guardó y la pantalla sigue.
 */
export type Respuesta = { error: string | null; verPlanes?: boolean; listo?: boolean };

/**
 * Una acción que va en un diálogo y lo cierra si sale bien: la página vuelve
 * releída, así que no hay nada más que mostrar. Si falla, el diálogo queda con
 * el error.
 */
export function useAccionQueCierra(accion: (antes: Respuesta, datos: FormData) => Promise<Respuesta>, cerrar: () => void) {
  return useActionState<Respuesta, FormData>(
    async (antes, datos) => {
      const respuesta = await accion(antes, datos);
      if (!respuesta.error) cerrar();
      return respuesta;
    },
    { error: null },
  );
}
