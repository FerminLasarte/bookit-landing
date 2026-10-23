/*
 * El link para escribirle al dueño de un local desde su ficha (D4 de
 * docs/PLAN-ADMIN.md). La app guarda el teléfono como dígitos, con un `+`
 * adelante si lo escribieron así (`normalizarTelefono` de BooKit), y no le
 * pide formato: puede venir `2234567890`, `02234567890` o `+54 9 223…`.
 */

/** `wa.me/549…` si el número se deja llevar a un celular argentino o ya es internacional; si no, `tel:`. */
export function enlaceDeTelefono(telefono: string): { href: string; whatsapp: boolean } {
  const conMas = telefono.trim().startsWith("+");
  const digitos = telefono.replace(/\D/g, "");
  const movil = paraWhatsApp(digitos, conMas);
  return movil
    ? { href: `https://wa.me/${movil}`, whatsapp: true }
    : { href: `tel:${conMas ? "+" : ""}${digitos}`, whatsapp: false };
}

/*
 * WhatsApp quiere el celular argentino como `549` + área + número, diez
 * dígitos sin el `0` ni el `15`. Ningún código de área empieza con 5, así que
 * un número que arranca con `54` ya trae el país. Con el `15` metido no se
 * sabe dónde termina el área: ese queda como `tel:`.
 */
function paraWhatsApp(digitos: string, conMas: boolean): string | null {
  if (digitos.startsWith("54")) {
    const nacional = digitos.slice(2).replace(/^9/, "").replace(/^0/, "");
    return nacional.length === 10 ? `549${nacional}` : null;
  }
  if (conMas) return digitos.length >= 8 ? digitos : null;
  const nacional = digitos.replace(/^0/, "");
  return nacional.length === 10 ? `549${nacional}` : null;
}
