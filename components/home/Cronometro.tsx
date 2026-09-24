"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type Ref } from "react";
import {
  m,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import Badge from "@/components/ui/Badge";
import { transicion } from "@/lib/movimiento";
import { cn } from "@/lib/utils";

type Estado = "espera" | "activo" | "hecho";

/** El `md` de Tailwind: desde ahí la línea es horizontal. */
const ESCRITORIO = "(min-width: 48rem)";

/** Una marca del reloj, con los segundos debajo desde `md`. */
function Hito({ encendido, segundos, className }: { encendido: boolean; segundos: number; className: string }) {
  return (
    <span
      className={cn(
        "absolute size-3 -translate-1/2 rounded-full border-2 transition-colors duration-(--duration-entrada)",
        encendido ? "border-accent bg-accent" : "border-line bg-page",
        className,
      )}
    >
      <span className="num absolute top-5 left-1/2 hidden -translate-x-1/2 text-micro whitespace-nowrap text-muted md:block">
        {segundos} s
      </span>
    </span>
  );
}

type PasoProps = {
  title: string;
  body: string;
  pantalla: ReactNode;
  i: number;
  total: number;
  segundos: number;
  progreso: MotionValue<number>;
  /** Sólo el primero: la línea que mide el reloj en escritorio. */
  refLinea?: Ref<HTMLDivElement>;
};

function Paso({ title, body, pantalla, i, total, segundos, progreso, refLinea }: PasoProps) {
  const desde = i / total;
  const hasta = (i + 1) / total;
  const ultimo = i === total - 1;

  const tramo = useTransform(progreso, [desde, hasta], [0, 1]);
  const tiempo = useTransform(progreso, (p) => `${Math.round(p * segundos)} s`);

  const estadoDe = (p: number): Estado => (p < desde ? "espera" : p < hasta ? "activo" : "hecho");
  const [estado, setEstado] = useState<Estado>("espera");
  useMotionValueEvent(progreso, "change", (p) => setEstado(estadoDe(p)));
  useEffect(() => setEstado(estadoDe(progreso.get())), [progreso]);

  const encendido = estado !== "espera";
  const conReloj = estado === "activo" || (ultimo && estado === "hecho");

  return (
    <li
      style={{ "--escalon": i } as CSSProperties}
      className="relative grid grid-cols-[1.5rem_1fr] gap-x-5 pb-16 last:pb-0 md:block md:px-5 md:pb-0"
    >
      <m.div
        initial={false}
        animate={encendido ? "encendido" : "espera"}
        variants={{
          espera: { opacity: 0.45, scale: 0.94, rotate: -2 },
          encendido: { opacity: 1, scale: 1, rotate: 0 },
        }}
        transition={transicion.resorte}
        // Desde `md` el ancho también depende del alto: en una pantalla baja los teléfonos, la
        // línea y el nav tienen que entrar juntos mientras corre el reloj.
        className="col-start-2 mx-auto w-[70%] max-w-60 md:w-full md:max-w-[min(15rem,26svh)] md:translate-y-[calc(var(--escalon)*-2rem)]"
      >
        {pantalla}
      </m.div>

      {/* El tramo del reloj: vertical a la izquierda en móvil, horizontal bajo los teléfonos desde `md`. */}
      <m.div
        ref={refLinea}
        aria-hidden="true"
        style={{ "--f": tramo } as unknown as CSSProperties}
        className="absolute top-0 bottom-0 left-[0.6875rem] w-0.5 bg-line md:relative md:inset-auto md:-mx-5 md:mt-12 md:h-0.5 md:w-auto"
      >
        <span className="absolute inset-0 origin-top scale-y-(--f) bg-accent md:origin-left md:scale-x-(--f) md:scale-y-100" />
        <Hito encendido={encendido} segundos={desde * segundos} className="top-0 left-1/2 md:top-1/2 md:left-0" />
        {ultimo && (
          <Hito
            encendido={estado === "hecho"}
            segundos={segundos}
            className="top-full left-1/2 md:top-1/2 md:left-full"
          />
        )}
        <span
          className={cn(
            "absolute top-[calc(var(--f)*100%)] left-1/2 z-10 -translate-1/2 transition-opacity duration-(--duration-chico)",
            "md:top-1/2 md:left-[calc(var(--f)*100%)] md:-translate-y-[calc(100%+0.75rem)]",
            conReloj ? "opacity-100" : "opacity-0",
          )}
        >
          <Badge className="num">
            <m.span>{tiempo}</m.span>
          </Badge>
        </span>
      </m.div>

      <div className="col-start-2 mt-6 text-center md:mt-14">
        <h3 className="text-title font-bold text-fg">{title}</h3>
        <p className="mx-auto mt-2 max-w-[32ch] text-pretty text-small text-muted">{body}</p>
      </div>
    </li>
  );
}

/**
 * Los pasos para sacar turno sobre un reloj que corre con el scroll: la línea
 * se llena, el contador sube y cada teléfono se enciende cuando le llega su
 * tramo. En escritorio los teléfonos suben en escalera.
 */
export default function Cronometro({
  pasos,
  pantallas,
  segundos,
}: {
  pasos: readonly { title: string; body: string }[];
  /** Una pantalla por paso, en el mismo orden. */
  pantallas: readonly ReactNode[];
  segundos: number;
}) {
  const refLista = useRef<HTMLOListElement>(null);
  const refLinea = useRef<HTMLDivElement>(null);
  const escritorio = useRef(false);

  // Móvil: la punta de la línea vertical va al 80 % de la pantalla, así cada teléfono se
  // enciende apenas asoma y no cuando ya está pasando.
  const lista = useScroll({ target: refLista, offset: ["start 80%", "end 80%"] }).scrollYProgress;
  // Escritorio: el reloj corre desde que la línea asoma abajo hasta que sube al 75 %. Más
  // arriba, en una laptop de 14", el último teléfono se enciende ya tapado por el nav.
  const linea = useScroll({ target: refLinea, offset: ["start end", "start 75%"] }).scrollYProgress;
  const progreso = useSpring(
    useTransform([lista, linea], ([enLista, enLinea]: number[]) => (escritorio.current ? enLinea! : enLista!)),
    transicion.suave,
  );

  useEffect(() => {
    const medio = window.matchMedia(ESCRITORIO);
    const medir = () => (escritorio.current = medio.matches);
    medir();
    medio.addEventListener("change", medir);
    return () => medio.removeEventListener("change", medir);
  }, []);

  return (
    <ol ref={refLista} className="mx-auto grid max-w-[66rem] md:grid-cols-3 md:pt-16">
      {pasos.map((paso, i) => (
        <Paso
          key={paso.title}
          {...paso}
          pantalla={pantallas[i]}
          i={i}
          total={pasos.length}
          segundos={segundos}
          progreso={progreso}
          refLinea={i === 0 ? refLinea : undefined}
        />
      ))}
    </ol>
  );
}
