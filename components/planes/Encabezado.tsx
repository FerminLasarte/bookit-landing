import SectionHeader from "@/components/ui/SectionHeader";

/** El título y la bajada del paywall, a la escala de las otras páginas: las cards siguen a la de la app. */
export default function Encabezado({
  titulo,
  bajada,
  avisos = [],
}: {
  titulo: string;
  bajada: string;
  /** Lo que tiene hoy y lo que viene: "Tu plan termina el…". */
  avisos?: string[];
}) {
  return (
    <div className="px-5 text-center">
      <SectionHeader as="h1" title={titulo} lede={bajada} />
      {avisos.map((aviso) => (
        <p key={aviso} className="mx-auto mt-3 max-w-[46ch] text-pretty font-semibold text-fg">
          {aviso}
        </p>
      ))}
    </div>
  );
}
