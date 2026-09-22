import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * El rótulo de un bloque: la línea chica que dice qué es lo que viene abajo.
 *
 * VA EN TINTA, NO EN ÁMBAR, y es la mitad visible del D2 de la auditoría.
 * Tenía dos variantes —`section` en `amber-700`, `label` en `ink-500`— y las
 * dos son texto chico, así que las dos vivían al borde del contraste: en claro
 * pasaban sólo sobre `cream-50` pelado, con 4,75:1 y 4,71:1. La auditoría lo
 * anotó como un eyebrow mal calibrado sobre `cream-100` (4,38:1). Es más
 * grande que eso: el mismo rótulo da 4,46:1 bajo el destello de `/invite` —ya
 * hubo que correr ese destello por eso— y 3,56:1 sobre el lavado cálido, donde
 * NINGÚN ámbar entra, porque el que entrara dejaría de leerse como el ámbar.
 * O sea que el rótulo de acento bloqueaba el único dispositivo cálido que la
 * Fase B0 construyó para el modo claro.
 *
 * En tinta el número deja de depender de la superficie:
 *
 *   `ink-900`  14,29:1 sobre `cream-50`   13,20:1 sobre `cream-100`
 *              14,68:1 sobre `paper`      10,73:1 sobre el lavado
 *
 * Y de paso hace lo que el manual pide y la página no hacía: "el color de marca
 * aparece en el CTA, en lo elegido y en lo urgente. En una pantalla bien
 * resuelta hay muy poco naranja". Había catorce rótulos ámbar en el sitio, uno
 * abriendo cada sección; un acento que aparece catorce veces no es un acento.
 * El ámbar queda para el CTA, que es donde de verdad decide.
 *
 * Con la tinta, las dos variantes se vuelven la misma cosa y se retiran: una
 * etiqueta por intención. Lo que lo separa del título que tiene debajo no es el
 * color sino la escala —13px en 700 contra 32-52px— y el tracking, que acá
 * vuelve a 0 porque apretar una letra chica la vuelve ilegible (§4 del manual).
 *
 * `onDark` declara la superficie, igual que en `Button`: sobre lienzo
 * `marca-profunda` el rótulo es `bone-100` (14,91:1) en los dos temas.
 */
export default function Eyebrow({
  children,
  className = "",
  onDark = false,
}: {
  children: ReactNode;
  className?: string;
  onDark?: boolean;
}) {
  return (
    <p
      className={cn(
        "text-[0.8125rem] font-bold tracking-normal",
        onDark ? "text-bone-100" : "text-ink-900 dark:text-bone-100",
        className,
      )}
    >
      {children}
    </p>
  );
}
