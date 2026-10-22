"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, type ReactNode } from "react";
import Anchor from "@/components/ui/Anchor";
import Button from "@/components/ui/Button";
import Superficie from "@/components/ui/Superficie";
import TextLink from "@/components/ui/TextLink";
import { miLocal } from "@/content/mi-local";
import { dia as diaLargo, diaCorto, mesYAnio, pesos } from "@/lib/formato";
import type { HuecosDelDia, Libres } from "@/lib/mi-local/agenda";
import { cobrado, esGrupo, grupoDe, GRUPOS, type Grupo, type Profesional, type Turno } from "@/lib/mi-local/turnos";
import { diasDeLaSemana, enlaceDeCarga, enlaceDeVista, lunesDe } from "@/lib/mi-local/vista";
import { cn } from "@/lib/utils";
import Avatar from "./Avatar";
import Encabezado from "./Encabezado";
import ListaDeTurnos from "./ListaDeTurnos";
import NavegarDias, { enlaceConAviso } from "./NavegarDias";
import { claseDeOpcion } from "./Opciones";

/*
 * La agenda de un día con su barra de selección (segunda vuelta del plan del
 * panel, D6–D9). El profesional y el estado se filtran acá, en el navegador:
 * los turnos del día ya llegaron, así que la lista cambia en el acto y la URL
 * se actualiza con `pushState`, que Next integra con `useSearchParams`. El día
 * sí va al servidor; mientras llega, la lista se atenúa. Los huecos libres
 * también llegan enteros (los del local y los de cada uno) y se eligen acá
 * (D7 del plan de la fase 3).
 */

type Props = {
  dia: string;
  hoy: string;
  /** Cuántos turnos tiene cada día de la semana de `dia`. */
  semana: Record<string, number>;
  turnos: Turno[];
  profesionales: Profesional[];
  /** Los huecos libres del día, o `null` si no se pudieron leer: la agenda va igual. */
  huecos: HuecosDelDia | null;
  /** Un momento fijo para todo el dibujo, como ISO: el servidor y el navegador ven la misma hora. */
  ahora: string;
  /** El aviso de la suscripción, si hay: va entre el encabezado y la barra. */
  aviso?: ReactNode;
};

export default function AgendaDelDia({ dia, hoy, semana, turnos, profesionales, huecos, ahora, aviso }: Props) {
  const copy = miLocal.agenda;
  const router = useRouter();
  const parametros = useSearchParams();
  const [cargando, empezar] = useTransition();
  const momento = new Date(ahora);

  const profesional = parametros.get("profesional");
  const estado = parametros.get("estado");
  const grupo = esGrupo(estado) ? estado : null;

  /** Cambia un filtro sin pedir nada al servidor. */
  const filtrar = (clave: "profesional" | "estado", valor: string | null) => {
    const nuevos = new URLSearchParams(parametros);
    if (valor) nuevos.set(clave, valor);
    else nuevos.delete(clave);
    window.history.pushState(null, "", `?${nuevos}`);
  };

  /** Otro día sí va al servidor: la lista se atenúa hasta que llega. */
  const irAlDia = (href: string) => empezar(() => router.push(href));
  const enlaceDelDia = (otro: string) => enlaceDeVista({ dia: otro, profesional, estado: grupo });

  const delProfesional = turnos.filter((t) => !profesional || t.profesional?.id === profesional);
  const lista = delProfesional.filter((t) => !grupo || grupoDe(t, momento) === grupo);
  const porGrupo = Object.fromEntries(GRUPOS.map((g) => [g, delProfesional.filter((t) => grupoDe(t, momento) === g).length]));
  // Los del profesional elegido o los del local; con un estado elegido, sólo turnos.
  const libres = huecos && (profesional ? huecos.profesionales[profesional] : huecos.local);
  const huecosALaVista = grupo ? [] : (libres?.huecos ?? []);

  return (
    <>
      <Encabezado
        titulo={copy.titulo}
        bajada={diaLargo(dia)}
        accion={
          // Con el profesional elegido acá, aunque haya cambiado sin pasar por el servidor.
          <Button href={enlaceDeCarga({ dia, profesional, servicio: null })} size="compact">
            {copy.cargar}
          </Button>
        }
      />
      {aviso}

      <Superficie tone="surface" className="flex flex-col gap-5 p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-bold text-fg first-letter:uppercase">{mesYAnio(dia)}</p>
          <NavegarDias
            dia={dia}
            hoy={hoy}
            ruta="/mi-local"
            parametros={{ profesional, estado: grupo }}
            semana
            alIr={irAlDia}
          />
        </div>

        <nav aria-label={copy.semana}>
          <ul className="grid grid-cols-7 gap-1.5">
            {diasDeLaSemana(lunesDe(dia)).map((otro) => {
              const cantidad = semana[otro] ?? 0;
              const elegido = otro === dia;
              return (
                <li key={otro}>
                  <Anchor
                    {...enlaceConAviso(enlaceDelDia(otro), irAlDia)}
                    aria-current={elegido ? "date" : undefined}
                    aria-label={`${diaCorto(otro)} ${Number(otro.slice(8))}, ${copy.turnos(cantidad)}`}
                    className={cn(
                      "ring-focus flex flex-col items-center rounded-field py-2 transition-colors duration-(--duration-chico)",
                      elegido ? "bg-fg text-page" : "bg-fg/5 text-fg hover:bg-fg/10",
                    )}
                  >
                    <span className={cn("text-micro", elegido ? "text-page/80" : "text-muted")}>{diaCorto(otro)}</span>
                    <span className="relative text-body font-bold tabular-nums">
                      {Number(otro.slice(8))}
                      {otro === hoy && !elegido && (
                        <span aria-hidden className="absolute -top-0.5 -right-1.5 size-1.5 rounded-full bg-accent" />
                      )}
                    </span>
                    <span className={cn("text-micro tabular-nums", elegido ? "text-page/80" : "text-muted")}>
                      {cantidad > 0 ? (
                        <>
                          <span className="md:hidden">{cantidad}</span>
                          <span className="hidden md:inline">{copy.turnos(cantidad)}</span>
                        </>
                      ) : (
                        " "
                      )}
                    </span>
                  </Anchor>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Con un solo profesional, elegirlo es la lista entera. */}
        {profesionales.length > 1 && (
          <Deslizable titulo={copy.profesional}>
            <Pildora activa={!profesional} onClick={() => filtrar("profesional", null)}>
              {copy.todos} <Cantidad>{turnos.length}</Cantidad>
            </Pildora>
            {profesionales.map((p) => (
              <Pildora key={p.id} activa={profesional === p.id} onClick={() => filtrar("profesional", p.id)} conAvatar>
                <Avatar nombre={p.nombre} foto={p.foto} tamano="chico" />
                {p.nombre} <Cantidad>{turnos.filter((t) => t.profesional?.id === p.id).length}</Cantidad>
              </Pildora>
            ))}
          </Deslizable>
        )}

        <Deslizable titulo={copy.estado}>
          <Pildora activa={!grupo} onClick={() => filtrar("estado", null)}>
            {copy.todos} <Cantidad>{delProfesional.length}</Cantidad>
          </Pildora>
          {/* Sólo los grupos con turnos, y el elegido aunque quede vacío: así se puede soltar. */}
          {GRUPOS.filter((g) => porGrupo[g] || g === grupo).map((g) => (
            <Pildora
              key={g}
              activa={grupo === g}
              onClick={() => filtrar("estado", g)}
              className={g === "sin-marcar" && grupo !== g ? "text-accent-fg" : undefined}
            >
              {miLocal.grupos[g]} <Cantidad>{porGrupo[g]}</Cantidad>
            </Pildora>
          ))}
        </Deslizable>
      </Superficie>

      <div aria-busy={cargando} className={cn("flex flex-col gap-4 transition-opacity", cargando && "opacity-55")}>
        <p className="flex flex-wrap gap-x-6 gap-y-1 text-small text-muted">
          <span>{copy.turnos(lista.length)}</span>
          {!huecos && <span role="status">{copy.sinHuecos}</span>}
          <span>
            {copy.cobrado} <span className="font-semibold text-fg tabular-nums">{pesos(cobrado(delProfesional))}</span>
          </span>
        </p>
        {lista.length > 0 || huecosALaVista.length > 0 ? (
          <ListaDeTurnos
            turnos={lista}
            huecos={huecosALaVista}
            enlaceDeHueco={enlaceDeCarga({ dia, profesional, servicio: null })}
            ahora={momento}
          />
        ) : (
          <DiaVacio {...vacioDe({ grupo, libres, profesional, dia, hoy })} />
        )}
      </div>
    </>
  );
}

/**
 * Por qué el día no tiene nada, como `AgendaDiaLibre` de la app: con un
 * estado elegido no hay coincidencias; sin los huecos, sólo que no hay turnos;
 * si no, si ya pasó, si no se atiende, si es por orden de llegada o si ya no
 * quedan horarios. `href`: dónde se cambia.
 */
function vacioDe({
  grupo,
  libres,
  profesional,
  dia,
  hoy,
}: {
  grupo: Grupo | null;
  libres: Libres | null | undefined;
  profesional: string | null;
  dia: string;
  hoy: string;
}): { titulo?: string; bajada: string; href?: string } {
  const { diaVacio, vacio, vacioConFiltro } = miLocal.agenda;
  if (grupo) return { bajada: vacioConFiltro };
  if (!libres) return { bajada: vacio };
  if (dia < hoy) return diaVacio.paso;
  if (libres.atencion === "no_atiende") {
    return profesional
      ? { ...diaVacio.noAtiende, href: `/mi-local/horarios?profesional=${profesional}` }
      : { ...diaVacio.localNoAtiende, href: "/mi-local/horarios" };
  }
  if (libres.atencion === "orden_de_llegada") return diaVacio.ordenDeLlegada;
  return dia === hoy ? diaVacio.hoyNoQuedan : diaVacio.sinLibres;
}

function DiaVacio({ titulo, bajada, href }: { titulo?: string; bajada: string; href?: string }) {
  return (
    <Superficie tone="surface" className="p-6 text-center">
      {titulo && <p className="font-semibold text-fg">{titulo}</p>}
      <p className="mt-1 text-small text-muted">{href ? <TextLink href={href}>{bajada}</TextLink> : bajada}</p>
    </Superficie>
  );
}

/** Un rótulo y sus píldoras: en el teléfono, una sola línea que se desliza de costado; desde `md`, se parte. */
function Deslizable({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={titulo} className="flex items-center gap-3">
      <span className="shrink-0 text-small font-semibold text-fg">{titulo}</span>
      <div className="-mr-4 flex min-w-0 gap-2 overflow-x-auto pr-4 [scrollbar-width:none] md:mr-0 md:flex-wrap md:overflow-visible md:pr-0">
        {children}
      </div>
    </div>
  );
}

function Pildora({
  activa,
  onClick,
  conAvatar = false,
  className,
  children,
}: {
  activa: boolean;
  onClick: () => void;
  conAvatar?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={activa}
      onClick={onClick}
      className={cn(claseDeOpcion(activa), "shrink-0 gap-1.5 whitespace-nowrap", conAvatar && "pl-1", className)}
    >
      {children}
    </button>
  );
}

function Cantidad({ children }: { children: ReactNode }) {
  return <span className="font-normal tabular-nums opacity-70">{children}</span>;
}
