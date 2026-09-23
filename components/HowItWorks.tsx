import Eyebrow from "./Eyebrow";
import Captura from "./Captura";
import Hairline from "./Hairline";
import Reveal from "./ui/Reveal";
import { steps } from "@/content/steps";

import cercaClaro from "@/assets/capturas/claro/02_cliente_cerca_tuyo.webp";
import cercaOscuro from "@/assets/capturas/oscuro/02_cliente_cerca_tuyo.webp";
import horarioClaro from "@/assets/capturas/claro/04_cliente_elegir_horario.webp";
import horarioOscuro from "@/assets/capturas/oscuro/04_cliente_elegir_horario.webp";

/**
 * §6.1.3 — Cómo funciona. Fase C del rediseño, y la sección que más cambia.
 *
 * ── Lo que se fue ────────────────────────────────────────────────────────
 *
 * El carrusel y el teléfono dibujado a mano: ~500 líneas que replicaban tres
 * pantallas de la app en HTML, con locales inventados y un descargo propio
 * ("Pantallas de ejemplo. Los locales que aparecen son ilustrativos") puesto
 * para tapar el problema de credibilidad que ese dibujo creaba. Con capturas
 * reales el descargo no hace falta, y el HTML que se desincronizaba en cada
 * release del producto deja de existir. El avance automático era, además, lo
 * único que obligaba al mecanismo de tabs: sin él los tres pasos son texto.
 * Decidido con el usuario el 22/9/2026; `docs/AUDITORIA-v3.md` (D9) y el
 * contrato lo tienen escrito, y el contrato prohíbe reintroducir el patrón.
 *
 * Con el teléfono se van el último `rgba()` suelto del sitio y los dos radios
 * arbitrarios que quedaban, así que esa deuda de `docs/MARCA.md` cierra acá.
 * La sección también deja de ser un componente de cliente: ya no hay estado,
 * ni `motion`, ni `lucide`, ni `useInView`.
 *
 * ── La composición ───────────────────────────────────────────────────────
 *
 * El único dial que falta recorrer es `DESIGN_VARIANCE`, de 4 a 7, y la
 * auditoría midió por qué: 5 de 6 secciones abren con rótulo + `display-lg` y
 * 4 de 6 resuelven el cuerpo con una partición en dos columnas. Ésta deja de
 * hacerlo. En vez de título a la izquierda y pieza a la derecha, son bandas:
 * encabezado a lo ancho, después los pasos 01 y 02 en dos celdas escalonadas
 * en diagonal, y el 03 como una banda que cruza la página entera.
 *
 * Las dos capturas tienen formatos y tamaños distintos a propósito —una alta y
 * angosta, otra más corta y ancha— y arrancan a alturas distintas. Es lo mismo
 * que hace el `mt-auto` de `Audiences`, al revés: empiezan desparejas y
 * terminan a la misma altura.
 *
 * ── Por qué el paso 03 no tiene captura ──────────────────────────────────
 *
 * No es que falte. De las 15 capturas ninguna muestra la pantalla de Puntos, y
 * eso es correcto para esta sección: los dos primeros pasos son cosas que se
 * hacen DENTRO de la app y tienen pantalla, y el tercero es lo que queda
 * después del turno, que acá se anuncia y se cuenta entero dos secciones más
 * abajo, en `#puntos`. Ponerle una pantalla prestada sería mostrar otra cosa.
 * Que sea el único paso a lo ancho, en tipografía sola, es la forma de que esa
 * diferencia se lea como el final de la cuenta y no como un hueco.
 */
export default function HowItWorks() {
  const [uno, dos, tres] = steps;

  return (
    <>
      {/*
       * El encabezado va sobre la parte fuerte del lavado cálido, que es para
       * lo que el lavado existe. Sólo `ink-900` y pasos de display pisan ahí
       * (10,73:1); el texto chico de los pasos queda por debajo del alcance.
       * La medición está en `docs/DECISIONES.md` §3 undecies.
       */}
      <Reveal>
        <Eyebrow>Cómo funciona</Eyebrow>
        {/*
         * `max-w-[14ch]`: el titular rompe en dos renglones cortos y deja la
         * mitad derecha abierta. Es el mismo recurso que el hero usa al revés
         * —allá el titular toma el lienzo entero—, y acá la asimetría la hace
         * el vacío, no otra columna.
         */}
        <h2
          id="como-funciona-title"
          className="mt-5 max-w-[14ch] text-display-lg font-semibold text-ink-900 dark:text-bone-100"
        >
          Tres pasos, y el turno ya está.
        </h2>
      </Reveal>

      <div className="mt-16 grid gap-y-20 md:mt-24 md:grid-cols-12 md:gap-x-6 md:gap-y-0">
        {/* ── 01 ── */}
        <Reveal className="md:col-span-5">
          <Paso n={uno?.n} title={uno?.title} body={uno?.body} />
          <Captura
            claro={cercaClaro}
            oscuro={cercaOscuro}
            alt="Pantalla de Bookit con los locales de Tandil cerca tuyo: cada uno con su foto, su rubro, la distancia y desde qué precio atiende."
            recorte={{ top: 160, bottom: 2622 }}
            sizes="(min-width: 1024px) 20rem, (min-width: 768px) 36vw, calc(100vw - 3rem)"
            className="mt-10 max-w-[20rem]"
          />
        </Reveal>

        {/* ── 02 ── */}
        {/*
         * Arranca 7rem más abajo y se apoya en el borde derecho del `wrap`: es
         * la diagonal. Con 26rem contra 20rem, las dos capturas terminan casi
         * en la misma línea pese a empezar desparejas.
         */}
        <Reveal index={1} className="md:col-span-5 md:col-start-8 md:mt-28">
          <Paso n={dos?.n} title={dos?.title} body={dos?.body} />
          <Captura
            claro={horarioClaro}
            oscuro={horarioOscuro}
            alt="Pantalla de Bookit para elegir horario: el servicio con su duración y su precio, con quién lo hacés, los días de la semana y los turnos libres de la mañana y de la tarde."
            recorte={{ top: 160, bottom: 1720 }}
            sizes="(min-width: 1200px) 26rem, (min-width: 768px) 36vw, calc(100vw - 3rem)"
            className="mt-10 max-w-[26rem] md:ml-auto"
          />
        </Reveal>
      </div>

      {/* ── 03 ── */}
      <Reveal index={2} className="mt-24 md:mt-32">
        <Hairline />
        <div className="mt-8 md:grid md:grid-cols-12 md:gap-6">
          <div className="md:col-span-6">
            <span
              aria-hidden="true"
              className="num block text-display-sm text-ink-500 dark:text-bone-300"
            >
              {tres?.n}
            </span>
            <h3 className="mt-2 text-display-sm font-bold text-ink-900 dark:text-bone-100">
              {tres?.title}
            </h3>
          </div>
          {/*
           * La bajada del último paso va a tamaño de cuerpo y no `text-small`:
           * es la que entrega la página a `#puntos`, y es el único lugar de la
           * sección donde hay aire para que crezca.
           */}
          <p className="mt-6 max-w-[38ch] text-ink-500 md:col-span-5 md:col-start-8 md:mt-0 dark:text-bone-300">
            {tres?.body}
          </p>
        </div>
      </Reveal>
    </>
  );
}

/**
 * Un paso: ordinal, título y bajada. El ordinal es decorativo —el orden ya lo
 * da el DOM— y va en `aria-hidden` para que no se lea "cero uno" antes de cada
 * título.
 */
function Paso({ n, title, body }: { n?: string; title?: string; body?: string }) {
  return (
    <>
      <span
        aria-hidden="true"
        className="num block text-display-sm text-ink-500 dark:text-bone-300"
      >
        {n}
      </span>
      <h3 className="mt-2 text-h3 font-bold text-ink-900 dark:text-bone-100">{title}</h3>
      <p className="mt-3 max-w-[38ch] text-small text-ink-500 dark:text-bone-300">{body}</p>
    </>
  );
}
