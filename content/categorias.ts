/**
 * Rubros de Bookit. `value` es lo que viaja al backend en el campo `category`
 * del formulario de lista de espera — coincide con los `option` del sitio actual.
 */

export type Categoria = {
  value: string;
  label: string;
};

/** Rail de categorías de la landing (§6.1). */
export const categorias: readonly Categoria[] = [
  { value: "barberia", label: "Barbería" },
  { value: "peluqueria", label: "Peluquería" },
  { value: "manicura", label: "Manicura" },
  { value: "estetica", label: "Estética" },
  { value: "masajes", label: "Masajes" },
  { value: "depilacion", label: "Depilación" },
] as const;

/**
 * Opciones del `select` del formulario. No es igual al rail: acá no va
 * "Depilación" como opción propia y sí va "Otro" (que abre el campo libre).
 * Mantiene exactamente los `value` del formulario actual.
 */
export const categoriasFormulario: readonly Categoria[] = [
  { value: "barberia", label: "Barbería" },
  { value: "peluqueria", label: "Peluquería" },
  { value: "manicura", label: "Manicura" },
  { value: "estetica", label: "Estética" },
  { value: "masajes", label: "Masajes" },
  { value: "otro", label: "Otro" },
] as const;
