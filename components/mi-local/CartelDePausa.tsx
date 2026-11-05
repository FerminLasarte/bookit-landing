import Button from "@/components/ui/Button";
import Superficie from "@/components/ui/Superficie";
import { miLocal } from "@/content/mi-local";
import { diaYMesDe } from "@/lib/formato";
import { enCurso, vuelta, type Pausa } from "@/lib/pausa";

/**
 * La pausa del local arriba de la agenda, mientras dura o está programada,
 * como `CartelDePausa` de la app (docs/PLAN-MI-LOCAL-PAUSA.md, D1 y D5). El
 * dueño va desde acá a su pausa; el profesional del equipo sólo lo lee.
 */
export default function CartelDePausa({ pausa, delDuenio }: { pausa: Pausa | null; delDuenio: boolean }) {
  if (!pausa) return null;
  const copy = miLocal.pausa.cartel;
  const diaDeVuelta = vuelta(pausa);
  const [titulo, bajada] = enCurso(pausa)
    ? [copy.enCurso(delDuenio), diaDeVuelta ? copy.vuelve(diaYMesDe(diaDeVuelta)) : copy.sinVuelta(delDuenio)]
    : [
        copy.programada,
        pausa.hasta
          ? copy.entre(diaYMesDe(pausa.desde), diaYMesDe(pausa.hasta))
          : copy.desdeSinVuelta(diaYMesDe(pausa.desde)),
      ];

  return (
    <Superficie
      tone="niebla"
      className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6"
    >
      <div>
        <p className="font-bold text-fg">{titulo}</p>
        <p className="mt-1 text-small text-fg">{bajada}</p>
      </div>
      {delDuenio && (
        <Button href="/mi-local/perfil/pausa" size="compact" variant="secondary" className="shrink-0">
          {copy.verPausa}
        </Button>
      )}
    </Superficie>
  );
}
