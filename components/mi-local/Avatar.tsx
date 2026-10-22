import Image from "next/image";
import { cn } from "@/lib/utils";

const tamanos = { chico: 24, grande: 40 } as const;

/** Las iniciales de un nombre: "Barbería Nogal" → "BN", "Nico" → "N". */
const iniciales = (nombre: string) =>
  nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .join("");

/**
 * El círculo de un local o de un profesional: su foto, como en la app, o sus
 * iniciales. Las fotos viven en el bucket `logos`, que ya está abierto a
 * `next/image`.
 */
export default function Avatar({
  nombre,
  foto,
  tamano = "grande",
  className,
}: {
  nombre: string;
  foto: string | null;
  tamano?: keyof typeof tamanos;
  className?: string;
}) {
  const px = tamanos[tamano];
  const clases = cn("shrink-0 rounded-full", tamano === "chico" ? "size-6" : "size-10", className);
  if (foto) return <Image src={foto} alt="" width={px} height={px} className={cn(clases, "object-cover")} />;
  return (
    <span
      aria-hidden
      className={cn(
        clases,
        "flex items-center justify-center bg-accent/20 font-bold text-accent-fg",
        tamano === "chico" ? "text-[0.625rem]" : "text-small",
      )}
    >
      {iniciales(nombre)}
    </span>
  );
}
