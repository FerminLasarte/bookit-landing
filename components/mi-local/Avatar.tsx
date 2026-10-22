import Image from "next/image";
import { cn } from "@/lib/utils";

const tamanos = { chico: 24, grande: 40, ficha: 80 } as const;

const medidas = { chico: "size-6", grande: "size-10", ficha: "size-20" } as const;
const letras = { chico: "text-[0.625rem]", grande: "text-small", ficha: "text-title" } as const;

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
  const clases = cn("shrink-0 rounded-full", medidas[tamano], className);
  if (foto) return <Image src={foto} alt="" width={px} height={px} className={cn(clases, "object-cover")} />;
  return (
    <span
      aria-hidden
      className={cn(
        clases,
        "flex items-center justify-center bg-accent/20 font-bold text-accent-fg",
        letras[tamano],
      )}
    >
      {iniciales(nombre)}
    </span>
  );
}
