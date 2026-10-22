import Image from "next/image";
import type { ReactNode } from "react";
import Superficie from "@/components/ui/Superficie";
import Avatar from "./Avatar";

/**
 * El local como lo ve el cliente en su ficha de la app: la portada arriba, el
 * círculo encima y, abajo, el nombre, la categoría y la dirección. Sin
 * portada, la ficha muestra el logo (`banner_url` vacío, como la app); sin
 * ninguna de las dos, una banda lisa. `accion`: cambiar la foto.
 */
export default function AsiTeVen({
  titulo,
  nombre,
  logo,
  portada,
  detalle,
  accion,
}: {
  titulo: string;
  nombre: string;
  logo: string | null;
  portada: string | null;
  /** "Barbería · Av. Santamarina 480, Tandil". */
  detalle: string | null;
  accion?: ReactNode;
}) {
  const banda = portada ?? logo;
  return (
    <section aria-label={titulo}>
      <Superficie tone="surface" className="overflow-hidden">
        <div className="relative aspect-[2/1] bg-fg/6">
          {banda && (
            <Image src={banda} alt="" fill loading="eager" sizes="(min-width: 768px) 48rem, 100vw" className="object-cover" />
          )}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4 px-5 pb-5">
          <div className="min-w-0">
            {/* Encima de la portada: ella está posicionada y, sin `relative`, taparía el círculo. */}
            <div className="relative -mt-10">
              <Avatar nombre={nombre} foto={logo} tamano="ficha" className="ring-4 ring-surface" />
            </div>
            <p className="mt-3 text-title font-bold text-fg">{nombre}</p>
            {detalle && <p className="mt-1 text-small text-muted">{detalle}</p>}
          </div>
          {accion}
        </div>
      </Superficie>
    </section>
  );
}
