import Button from "@/components/ui/Button";
import Superficie from "@/components/ui/Superficie";
import { miLocal } from "@/content/mi-local";
import { diaYMesDe } from "@/lib/formato";
import { enCurso, type Pausa } from "@/lib/pausa";

/**
 * "Pausa del local", al pie del Perfil del dueño, como la fila de la app
 * (docs/PLAN-MI-LOCAL-PAUSA.md, D1): cómo está y el botón a su página.
 * `undefined`: no se pudo leer, y no se afirma que no hay.
 */
export default function BloqueDePausa({ pausa }: { pausa: Pausa | null | undefined }) {
  const copy = miLocal.pausa.bloque;
  const estado =
    pausa === undefined
      ? miLocal.pausa.bajada
      : pausa === null
        ? copy.sinPausa
        : !enCurso(pausa)
          ? copy.programada(diaYMesDe(pausa.desde))
          : pausa.hasta
            ? copy.enCurso(diaYMesDe(pausa.hasta))
            : copy.enCursoSinVuelta;

  return (
    <section aria-labelledby="pausa-del-local">
      <h2 id="pausa-del-local" className="text-title font-bold text-fg">
        {copy.titulo}
      </h2>
      <Superficie
        tone="surface"
        className="mt-4 flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6"
      >
        <p className={pausa ? "font-semibold text-fg" : "text-small text-fg"}>{estado}</p>
        <Button href="/mi-local/perfil/pausa" size="compact" variant={pausa === null ? "primary" : "secondary"} className="shrink-0">
          {pausa === null ? copy.pausar : copy.verPausa}
        </Button>
      </Superficie>
    </section>
  );
}
