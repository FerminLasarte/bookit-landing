/**
 * Lo que contesta una acción del panel a su formulario. `verPlanes`: lo que se
 * rechazó se destraba con otro plan. `listo`: se guardó y la pantalla sigue.
 */
export type Respuesta = { error: string | null; verPlanes?: boolean; listo?: boolean };
