import Image from "next/image";
import qr from "@/assets/tiendas/qr-app-store.png";
import Superficie from "@/components/ui/Superficie";
import { descargar } from "@/content/paginas";

/** El código para pasar al teléfono. En el teléfono no hace falta: ahí están los badges. */
export default function DesdeLaCompu({ className }: { className?: string }) {
  const { title, body, alt } = descargar.qr;

  return (
    <Superficie tone="surface" className={className}>
      <div className="flex items-center gap-8 p-6 md:p-8">
        <Image src={qr} alt={alt} sizes="9rem" className="size-36 shrink-0 rounded-field" />
        <div>
          <p className="text-title font-bold text-fg">{title}</p>
          <p className="mt-2 max-w-[32ch] text-small text-muted">{body}</p>
        </div>
      </div>
    </Superficie>
  );
}
