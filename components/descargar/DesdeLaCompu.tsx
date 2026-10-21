import Image from "next/image";
import qr from "@/assets/tiendas/qr-app-store.png";
import { descargar } from "@/content/paginas";
import { cn } from "@/lib/utils";

/** El código para pasar al teléfono. Sólo en escritorio: en el teléfono están los badges. */
export default function DesdeLaCompu({ className }: { className?: string }) {
  const { title, body, alt } = descargar.qr;

  return (
    <div className={cn("hidden items-center gap-5 lg:flex", className)}>
      <Image src={qr} alt={alt} sizes="6rem" className="size-24 shrink-0 rounded-field" />
      <p className="max-w-[24ch] text-small text-muted">
        <span className="font-semibold text-fg">{title}</span> {body}
      </p>
    </div>
  );
}
