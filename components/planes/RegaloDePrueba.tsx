"use client";

import Image from "next/image";
import { useEffect, useRef, type PointerEvent } from "react";
import regalo from "@/assets/emoji3d/regalo.png";

/*
 * Los días gratis: el regalo en 3D con una etiqueta colgando de un hilo que
 * dice cuántos son. Es `regalo_de_prueba.dart` de la app, con su física: el
 * hilo es una cuerda de verdad —puntos unidos con gravedad y rozamiento—
 * atada al moño, y la etiqueta es el peso de la punta. Llega cayendo desde el
 * costado, se hamaca y se asienta; se la puede agarrar y soltar. Quieta, la
 * simulación se apaga. Con "Reducir movimiento" aparece ya colgando.
 *
 * Las medidas salen del lado del regalo, 7,5 rem (el 30 % de un iPhone 17
 * Pro). La simulación corre en px, medidos al montar.
 */

type Punto = { x: number; y: number };
type Caja = { left: number; top: number; right: number; bottom: number };

const LADO_REM = 7.5;

const mas = (a: Punto, b: Punto): Punto => ({ x: a.x + b.x, y: a.y + b.y });
const menos = (a: Punto, b: Punto): Punto => ({ x: a.x - b.x, y: a.y - b.y });
const por = (a: Punto, k: number): Punto => ({ x: a.x * k, y: a.y * k });
const largo = (a: Punto) => Math.hypot(a.x, a.y);

/**
 * Un hilo atado a un punto fijo con un peso en la punta. Verlet con
 * restricciones de distancia: cada partícula recuerda dónde estaba, la
 * gravedad la tira y el hilo no se estira. La punta pesa más que el hilo.
 */
class HiloConPeso {
  private readonly tramo: number;
  private readonly pos: Punto[] = [];
  private readonly antes: Punto[] = [];
  private agarrada: Punto | null = null;
  private pasosQuieto = 0;
  /** El péndulo de lo que cuelga: el ángulo y su velocidad. */
  private tita = 0;
  private velocidadDeTita = 0;
  private velocidadDeLaPunta: Punto = { x: 0, y: 0 };

  /** Cuánto pesa la punta contra un punto del hilo (la inversa de la masa). */
  private static readonly livianoDeLaPunta = 0.12;
  /** Cuánto se frena por segundo: con aire, no en el vacío. */
  private static readonly rozamiento = 1.4;
  private static readonly rozamientoDelPendulo = 3;

  constructor(
    nudo: Punto,
    largoDelHilo: number,
    private readonly gravedad: number,
    private readonly obstaculo: Caja,
    private readonly punta: { ancho: number; alto: number },
    angulo: number,
    tramos = 14,
  ) {
    this.tramo = largoDelHilo / tramos;
    const direccion = { x: Math.cos(angulo), y: Math.sin(angulo) };
    for (let i = 0; i <= tramos; i++) {
      const p = mas(nudo, por(direccion, this.tramo * i));
      this.pos.push(p);
      this.antes.push({ ...p });
    }
  }

  get puntos(): readonly Punto[] {
    return this.pos;
  }

  get extremo(): Punto {
    return this.pos[this.pos.length - 1]!;
  }

  /** El giro de lo que cuelga: pivota en el ojal y sólo se hamaca cuando el ojal se acelera. */
  get inclinacion() {
    return -this.tita;
  }

  get quieto() {
    return this.agarrada === null && this.pasosQuieto > 60 && Math.abs(this.velocidadDeTita) < 0.01;
  }

  agarrar(donde: Punto) {
    this.agarrada = donde;
    this.pasosQuieto = 0;
  }

  /** La suelta con la velocidad del dedo, en px por segundo. */
  soltar(velocidad: Punto) {
    this.agarrada = null;
    this.antes[this.antes.length - 1] = menos(this.extremo, por(velocidad, 1 / 120));
  }

  /** Corre la simulación hasta que se queda quieta, sin dibujarla. */
  asentar() {
    for (let i = 0; i < 120 * 20 && !this.quieto; i++) this.paso(1 / 120);
  }

  /** Ningún punto queda más lejos del nudo que lo que mide el hilo hasta él. */
  private atar() {
    const nudo = this.pos[0]!;
    for (let i = 2; i < this.pos.length; i++) {
      const d = menos(this.pos[i]!, nudo);
      const distancia = largo(d);
      const tope = this.tramo * i;
      if (distancia > tope) this.pos[i] = mas(nudo, por(d, tope / distancia));
    }
  }

  /** Saca afuera lo que quedó dentro del regalo, por el borde más cercano. */
  private chocar() {
    const caja = this.obstaculo;
    const mitad = this.punta.ancho / 2;
    const paraLaPunta: Caja = {
      left: caja.left - mitad,
      top: caja.top - this.punta.alto,
      right: caja.right + mitad,
      bottom: caja.bottom,
    };
    for (let i = 1; i < this.pos.length; i++) {
      const esLaPunta = i === this.pos.length - 1;
      if (esLaPunta && this.agarrada) continue;
      this.pos[i] = HiloConPeso.afuera(this.pos[i]!, esLaPunta ? paraLaPunta : caja);
    }
  }

  private static afuera(p: Punto, r: Caja): Punto {
    if (p.x < r.left || p.x >= r.right || p.y < r.top || p.y >= r.bottom) return p;
    const arriba = p.y - r.top;
    const abajo = r.bottom - p.y;
    const izquierda = p.x - r.left;
    const derecha = r.right - p.x;
    const menor = Math.min(arriba, abajo, izquierda, derecha);
    if (menor === arriba) return { x: p.x, y: r.top };
    if (menor === abajo) return { x: p.x, y: r.bottom };
    if (menor === izquierda) return { x: r.left, y: p.y };
    return { x: r.right, y: p.y };
  }

  paso(dt: number) {
    let maximo = 0;
    const freno = 1 - HiloConPeso.rozamiento * dt;
    for (let i = 1; i < this.pos.length; i++) {
      const actual = this.pos[i]!;
      const velocidad = por(menos(actual, this.antes[i]!), freno);
      this.antes[i] = actual;
      this.pos[i] = mas(mas(actual, velocidad), { x: 0, y: this.gravedad * dt * dt });
      maximo = Math.max(maximo, largo(velocidad));
    }
    const agarrada = this.agarrada;
    const ultimo = this.pos.length - 1;
    for (let vuelta = 0; vuelta < 16; vuelta++) {
      if (agarrada) this.pos[ultimo] = agarrada;
      for (let i = 0; i < ultimo; i++) {
        const a = this.pos[i]!;
        const b = this.pos[i + 1]!;
        const d = menos(b, a);
        const distancia = largo(d);
        if (distancia === 0) continue;
        const error = (distancia - this.tramo) / distancia;
        // El nudo no se mueve; la punta, que pesa, se mueve poco.
        const wa = i === 0 ? 0 : 1;
        const wb = i + 1 === ultimo ? (agarrada ? 0 : HiloConPeso.livianoDeLaPunta) : 1;
        const total = wa + wb;
        if (total === 0) continue;
        this.pos[i] = mas(a, por(d, (error * wa) / total));
        this.pos[i + 1] = menos(b, por(d, (error * wb) / total));
      }
      this.atar();
      this.chocar();
    }
    this.pasosQuieto = maximo < 0.004 ? this.pasosQuieto + 1 : 0;
    this.hamacar(dt);
  }

  /** Un paso del péndulo de lo que cuelga, visto desde el ojal. */
  private hamacar(dt: number) {
    const brazo = this.punta.alto / 2;
    const velocidad = por(menos(this.extremo, this.antes[this.antes.length - 1]!), 1 / dt);
    // Acotada: un tirón o un choque contra la caja daría la vuelta a la etiqueta.
    const tope = this.gravedad * 4;
    let aceleracion = por(menos(velocidad, this.velocidadDeLaPunta), 1 / dt);
    const modulo = largo(aceleracion);
    if (modulo > tope) aceleracion = por(aceleracion, tope / modulo);
    this.velocidadDeLaPunta = velocidad;
    const aceleracionDeTita =
      (-(this.gravedad - aceleracion.y) * Math.sin(this.tita) - aceleracion.x * Math.cos(this.tita)) / brazo -
      HiloConPeso.rozamientoDelPendulo * this.velocidadDeTita;
    this.velocidadDeTita += aceleracionDeTita * dt;
    this.tita += this.velocidadDeTita * dt;
  }
}

/** Una curva por los puntos medios: con rectas entre partículas el hilo se vería quebrado. */
function camino(puntos: readonly Punto[]) {
  const [primero, ...resto] = puntos;
  if (!primero) return "";
  let d = `M${primero.x} ${primero.y}`;
  resto.forEach((p, i) => {
    const siguiente = resto[i + 1];
    d += siguiente ? ` Q${p.x} ${p.y} ${(p.x + siguiente.x) / 2} ${(p.y + siguiente.y) / 2}` : ` L${p.x} ${p.y}`;
  });
  return d;
}

export default function RegaloDePrueba({ dias }: { dias: number }) {
  const caja = useRef<HTMLDivElement>(null);
  const hiloRef = useRef<SVGPathElement>(null);
  const etiquetaRef = useRef<HTMLDivElement>(null);
  const control = useRef<{
    hilo: HiloConPeso;
    despertar: () => void;
    arrastre: { x: number; y: number; t: number; vx: number; vy: number } | null;
  } | null>(null);

  useEffect(() => {
    const raiz = caja.current;
    const trazo = hiloRef.current;
    const etiqueta = etiquetaRef.current;
    if (!raiz || !trazo || !etiqueta) return;

    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const lado = LADO_REM * rem;
    const izquierda = lado * 0.2;
    const ancho = lado * 0.5;
    const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const hilo = new HiloConPeso(
      // La punta del lazo derecho del moño.
      { x: izquierda + lado * 0.72, y: lado * 0.27 },
      lado * 0.65,
      lado * 12,
      // La caja sin el moño, medida sobre el dibujo de `regalo.png`.
      { left: izquierda + lado * 0.05, top: lado * 0.31, right: izquierda + lado * 0.93, bottom: lado * 0.93 },
      { ancho, alto: lado * 0.62 },
      // Arranca levantada hacia el costado, con el hilo estirado: al soltarse cae y se hamaca.
      reducido ? Math.PI / 2 : 0.15,
    );
    trazo.setAttribute("stroke-width", String(lado * 0.018));

    const dibujar = () => {
      trazo.setAttribute("d", camino(hilo.puntos));
      const { x, y } = hilo.extremo;
      etiqueta.style.transform = `translate(${x - ancho / 2}px, ${y}px) rotate(${hilo.inclinacion}rad)`;
    };

    let cuadro = 0;
    let anterior = 0;
    let sobrante = 0;
    const avanzar = (ahora: number) => {
      // Paso fijo: con el del cuadro, un cuadro lento estiraba el hilo.
      const dt = anterior ? Math.min((ahora - anterior) / 1000, 1 / 20) : 0;
      anterior = ahora;
      sobrante += dt;
      while (sobrante >= 1 / 120) {
        hilo.paso(1 / 120);
        sobrante -= 1 / 120;
      }
      dibujar();
      if (hilo.quieto) {
        cuadro = 0;
        anterior = 0;
        sobrante = 0;
        return;
      }
      cuadro = requestAnimationFrame(avanzar);
    };
    const despertar = () => {
      if (!cuadro) cuadro = requestAnimationFrame(avanzar);
    };

    control.current = { hilo, despertar, arrastre: null };
    etiqueta.style.visibility = "visible";

    let soltar = 0;
    if (reducido) {
      hilo.asentar();
      dibujar();
    } else {
      dibujar();
      // La suelta un poco después de aparecer: si cae junto con el fundido, la mitad de la caída no se ve.
      soltar = window.setTimeout(despertar, 350);
    }

    return () => {
      window.clearTimeout(soltar);
      cancelAnimationFrame(cuadro);
      control.current = null;
    };
  }, []);

  const local = (event: PointerEvent): Punto => {
    const r = caja.current!.getBoundingClientRect();
    return { x: event.clientX - r.left, y: event.clientY - r.top };
  };

  const agarrar = (event: PointerEvent<HTMLDivElement>) => {
    const c = control.current;
    if (!c) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const p = local(event);
    c.arrastre = { ...p, t: event.timeStamp, vx: 0, vy: 0 };
    c.hilo.agarrar(p);
    c.despertar();
  };

  const mover = (event: PointerEvent<HTMLDivElement>) => {
    const c = control.current;
    if (!c?.arrastre) return;
    const p = local(event);
    const dt = (event.timeStamp - c.arrastre.t) / 1000;
    if (dt > 0) c.arrastre = { ...p, t: event.timeStamp, vx: (p.x - c.arrastre.x) / dt, vy: (p.y - c.arrastre.y) / dt };
    c.hilo.agarrar(p);
  };

  const largar = () => {
    const c = control.current;
    if (!c?.arrastre) return;
    c.hilo.soltar({ x: c.arrastre.vx, y: c.arrastre.vy });
    c.arrastre = null;
    c.despertar();
  };

  return (
    <div
      ref={caja}
      role="img"
      aria-label={`${dias} días gratis`}
      className="relative mx-auto h-[9.9rem] w-[14.625rem] shrink-0"
    >
      <Image
        src={regalo}
        alt=""
        sizes="7.5rem"
        priority
        className="emoji-3d absolute top-0 left-[1.5rem] size-[7.5rem] select-none"
        draggable={false}
      />
      <svg className="pointer-events-none absolute inset-0 size-full overflow-visible text-accent-fg" aria-hidden="true">
        <path ref={hiloRef} fill="none" stroke="currentColor" strokeLinecap="round" />
      </svg>
      {/* La etiqueta de cartón: un ojal arriba y los días. No cambia con el tema: es un objeto. */}
      <div
        ref={etiquetaRef}
        aria-hidden="true"
        onPointerDown={agarrar}
        onPointerMove={mover}
        onPointerUp={largar}
        onPointerCancel={largar}
        className="invisible absolute top-0 left-0 flex w-[3.75rem] origin-top touch-none flex-col items-center rounded-t-[0.6rem] rounded-b-[0.675rem] border-[1.5px] border-carton-borde bg-carton px-[0.3rem] pt-[0.72rem] pb-[0.45rem] text-amber-700 shadow-[0_6px_10px_rgb(60_35_5/0.16)] select-none"
      >
        <span className="absolute top-[0.16rem] size-[0.45rem] rounded-full border-2 border-carton-borde bg-carton" />
        <span className="text-[1.575rem] leading-none font-extrabold tracking-[-0.0625rem]">{dias}</span>
        <span className="text-center text-[0.5625rem] leading-[1.15] font-bold">
          días
          <br />
          gratis
        </span>
      </div>
    </div>
  );
}
