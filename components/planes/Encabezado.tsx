/** El título y la bajada del paywall, a la escala de la app. */
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
    <div className="px-[1.125rem] text-center">
      <h1 className="text-[1.5rem] leading-[1.1] font-bold tracking-[-0.025rem] text-fg">{titulo}</h1>
      <p className="mt-[0.45rem] text-[0.87rem] leading-[1.3] text-muted">{bajada}</p>
      {avisos.map((aviso) => (
        <p key={aviso} className="mt-[0.45rem] text-[0.87rem] leading-[1.3] font-semibold text-fg">
          {aviso}
        </p>
      ))}
    </div>
  );
}
