import Button from "./Button";
import Captura from "./Captura";
import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";
import { IconCheck } from "./icons";
import { featuresCliente, featuresLocal } from "@/content/features";
import { cn } from "@/lib/utils";

import inicioClaro from "@/assets/capturas/claro/01_cliente_inicio.webp";
import inicioOscuro from "@/assets/capturas/oscuro/01_cliente_inicio.webp";
// Sólo la oscura: esta mitad es `ink-950` en los dos temas, así que la captura
// va por `onDark` y la clara no se importa ni se emite. Ver `Captura`.
import crecimientoOscuro from "@/assets/capturas/oscuro/15_comercio_crecimiento.webp";

/**
 * §6.1 — los dos públicos, en una sola pieza. Fase C del rediseño.
 *
 * Antes eran dos secciones de pantalla completa, una detrás de la otra, y la
 * comparación (que es el punto) quedaba a un scroll de distancia. Acá son las
 * dos mitades de un mismo objeto: mismo borde, mismo radio, sin `gap` entre
 * ellas. El corte de color es el que dice "son dos lados de lo mismo".
 *
 * En mobile se apilan, y el objeto sigue leyéndose como uno solo porque el
 * borde exterior nunca se parte.
 *
 * ── Lo que la Fase C le suma, y lo que NO le toca ────────────────────────
 *
 * La auditoría llama a esta pieza lo mejor compuesto del sitio — "la única con
 * una idea estructural propia: un objeto, dos mitades, el borde exterior sin
 * cortar"—, así que acá se le agrega lo que le falta y no se la rehace. Lo que
 * le faltaba era lo único que la auditoría le reprocha: ningún visual, y en la
 * mitad de los locales ninguno en absoluto.
 *
 * DOS COSAS QUE NO SE TOCAN, y las dos por un motivo escrito afuera:
 *
 * 1. **Las mitades siguen siendo 50/50**, aunque el contrato habilite romperlo
 *    justamente acá. Lo decide una medición: a 1180 px cada mitad deja 454 px
 *    de contenido, y ahí la captura muestra la app a escala 0,376 — su texto de
 *    cuerpo queda en ~15 px, legible. Con una partición 7/5 la mitad angosta
 *    cae a ~330 px y a 11 px de texto. La asimetría le costaría legibilidad a
 *    las dos capturas que son el punto de este paso, y además una comparación
 *    se lee cuando los dos objetos miden lo mismo.
 * 2. **La mitad oscura sigue a la derecha.** Cruza la banda de 72 px del header
 *    durante ~680 px de scroll, y eso ya está resuelto por la píldora del nav
 *    (§3 septies). Lo que sostiene esa solución es que el lockup, que vive en
 *    el borde izquierdo del `wrap`, nunca tenga fondo partido debajo: la mitad
 *    oscura arranca en el MEDIO del `wrap`. Darla vuelta rompería el nav.
 *
 * ── Lo único que sí se movió: la partición baja a `lg` ───────────────────
 *
 * Se partía en `md` (768 px), y ahí cada mitad deja 246 px de contenido. En
 * esos 246 px no entra el CTA de la mitad local: la píldora mide **321 px** y
 * se salía 26 px de la card, recortada por el `overflow-hidden`. Es un defecto
 * previo a este paso —el botón y el padding no cambiaron— que la franja de
 * 768 a 913 px tenía desde siempre y que ninguna de las tres auditorías midió;
 * las capturas sólo lo pusieron a la vista, porque a 246 px la app se muestra a
 * escala 0,20 y su texto queda en ~8 px.
 *
 * Partida en `lg` la mitad arranca en 374 px: entra el botón con 53 px de
 * sobra, la captura sube a escala 0,31 y los dos h3 rompen en dos renglones,
 * que es lo que mantiene las dos pantallas a la misma altura. Entre 768 y
 * 1023 las mitades se apilan, que es lo que ya hacían en móvil — el objeto
 * sigue siendo uno solo porque el borde exterior nunca se parte.
 */

function Bullet({ onDark = false }: { onDark?: boolean }) {
  return (
    <IconCheck
      className={cn(
        "mt-0.5 h-4.5 w-4.5 shrink-0",
        onDark ? "text-amber-300" : "text-amber-600 dark:text-amber-300",
      )}
    />
  );
}

function Features({ items, onDark = false }: { items: readonly string[]; onDark?: boolean }) {
  return (
    <ul className="mt-8 space-y-4">
      {items.map((feature) => (
        <li key={feature} className="flex items-start gap-3.5">
          <Bullet onDark={onDark} />
          <span className={cn("text-small", onDark ? "text-bone-100" : "text-ink-900 dark:text-bone-100")}>
            {feature}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * El mismo encuadre para las dos capturas, y no es casualidad buscada: se
 * eligió cada una por dónde terminaba su contenido —el recorte de `01` cierra
 * justo debajo de la card del próximo turno, antes de la fila de íconos que
 * arranca en y=1442; el de `15` cierra con los rótulos de "Mejor mes" y "Más
 * vendido" ya visibles y por encima de sus cifras— y las dos filas cayeron en
 * 1438. Que compartan proporción es lo que hace que el objeto se lea como un
 * díptico: las dos pantallas arrancan y terminan en la misma línea.
 *
 * Arranca en y=160 como todas: saca la barra de estado, cuya batería es
 * `#34C759` y está en las 30 capturas entre las filas 75 y 120.
 */
const RECORTE = { top: 160, bottom: 1438 };

/**
 * Cada captura ocupa el ancho de contenido de su mitad. Partida, la mitad es
 * `(100vw - 80px) / 2` menos los 96 px de su padding, y topea en 454 px cuando
 * el `wrap` llega a su máximo. Apiladas, el `wrap` menos el padding de la
 * mitad, y ahí manda el tope de `CAPTURA` — 26 rem— que es lo que evita pedir
 * una imagen de 880 px de ancho para mostrarla en una columna que no la
 * necesita.
 */
const SIZES =
  "(min-width: 1180px) 454px, (min-width: 1024px) calc((100vw - 80px) / 2 - 96px), (min-width: 768px) 26rem, min(26rem, calc(100vw - 112px))";

/**
 * Apilada, la captura no crece más allá de 26 rem: a 768 px la mitad ocupa el
 * `wrap` entero y una captura a sangre mediría 624 × 660 px, que convierte a
 * la tablet en dos pantallas de scroll por mitad. Partida ya no hace falta
 * —la columna mide menos que el tope— y el `lg:max-w-none` la libera.
 */
const CAPTURA = "mt-8 max-w-[26rem] lg:max-w-none";

export default function Audiences() {
  return (
    <div>
      <Reveal className="md:max-w-[40rem]">
        <Eyebrow>Los dos lados del mostrador</Eyebrow>
        <h2
          id="publico-title"
          className="mt-5 text-display-lg font-semibold text-ink-900 dark:text-bone-100"
        >
          El mismo turno, mirado desde los dos lados.
        </h2>
      </Reveal>

      <Reveal index={1} className="mt-14">
        {/* Un solo contenedor, dos mitades: el borde exterior no se corta nunca */}
        <div className="overflow-hidden rounded-card border border-ink-900/10 dark:border-white/10">
          <div className="grid lg:grid-cols-2">
            {/* ── Mitad clara: quien saca turnos ── */}
            <article
              id="clientes"
              aria-labelledby="clientes-title"
              className="flex flex-col border-b border-ink-900/10 bg-paper p-8 [--ring-hueco:var(--color-paper)] dark:[--ring-hueco:var(--color-ink-800)] lg:border-r lg:border-b-0 lg:p-12 dark:border-white/10 dark:bg-ink-800"
            >
              <Eyebrow>Para quien saca turnos</Eyebrow>
              {/*
               * `display-sm`, y el `max-w` en `ch` es parte de la decisión.
               *
               * El escalón lo dejó abierto la Fase B0 (§3 octies): las dos
               * mitades escribían `md:text-[1.75rem]` a mano, que es el PISO de
               * `display-sm` congelado, y la salida quedó para cuando la card
               * se recompusiera — que es acá. Entonces la objeción a subir al
               * token era que a 40 px el título de la card queda a 1,30 del
               * `display-lg` de la sección y le compite. Con la captura debajo
               * deja de competir: el título ya no es lo más pesado de su mitad,
               * es el rótulo de una pantalla. Y el `h3` canónico (24 px), la
               * otra alternativa, entraba en un renglón y se leía como una
               * oración; con una imagen debajo se leería como su epígrafe.
               *
               * Partida, los dos títulos rompen solos en DOS renglones —medido a
               * 1024, 1180 y 1440—, y eso es lo que mantiene las dos capturas a
               * la misma altura, que es donde se sostiene el díptico. Ahí el
               * `max-w-[22ch]` no trabaja: computa 623 px contra una columna de
               * 452. Trabaja APILADA, donde la mitad ocupa el `wrap` entero y
               * sin él el título correría hasta 624 px mientras la captura topea
               * en 416.
               *
               * En 700, que es lo que el manual pide de `h3` para arriba y esta
               * card no cumplía (estaba en 600).
               */}
              <h3
                id="clientes-title"
                className="mt-3 max-w-[22ch] text-display-sm font-bold text-ink-900 dark:text-bone-100"
              >
                Sacar turno debería llevar 30 segundos.
              </h3>

              {/*
               * La captura reemplaza al `IconSlot` que abría esta mitad. Es el
               * mismo movimiento que la sección anterior hizo con el teléfono
               * dibujado: donde había un símbolo de la cosa, va la cosa. Y un
               * bloque que muestra la pantalla real no necesita además un glifo
               * que la represente — el mismo criterio con el que la §3 octies
               * le sacó el ícono a cada beneficio de `/lista-espera`.
               */}
              <Captura
                claro={inicioClaro}
                oscuro={inicioOscuro}
                alt="Pantalla de inicio de Bookit: el saludo con la ciudad, el buscador de servicios y el próximo turno ya reservado, con la foto del local, el horario, el servicio y con quién es."
                recorte={RECORTE}
                sizes={SIZES}
                className={CAPTURA}
              />

              <Features items={featuresCliente} />

              {/* `mt-auto`: las dos mitades apoyan el botón en la misma línea */}
              <div className="mt-auto pt-10">
                <Button
                  text="Sumate a la lista VIP"
                  // El lado local ya llevaba su `?tipo=`; este lo tiraba y
                  // obligaba a volver a declarar lo recién declarado.
                  href="/lista-espera?tipo=cliente"
                  variant="secondary"
                />
              </div>
            </article>

            {/* ── Mitad oscura: comercios ── */}
            <article
              id="locales"
              aria-labelledby="locales-title"
              // `scroll-mt` generoso: se llega acá desde el nav y desde el CTA
              // "Tengo un local" del hero, y con el margen chico se aterrizaba
              // a mitad de card, con el h2 de la sección ya pasado.
              className="relative flex scroll-mt-32 flex-col overflow-hidden bg-ink-950 p-8 [--ring-hueco:var(--color-ink-950)] md:scroll-mt-40 lg:p-12"
            >
              {/*
               * Dos capas de calor. Sobre papel el corte ya lo hace el color de
               * fondo; en dark, tinta sobre tinta casi no se distingue, y es el
               * lavado ámbar el que separa una mitad de la otra.
               */}
              <div aria-hidden="true" className="calor pointer-events-none absolute inset-0" />
              {/*
               * EL LOCKUP DEL NAV, cuando las mitades están APILADAS.
               *
               * El nav busca `[data-canvas]` para saber si tiene una superficie
               * oscura detrás y vestir el lockup, que vive en el borde izquierdo
               * del `wrap` y es lo único del header que todavía cambia de color
               * (§3 septies). Apilada, esta mitad ocupa el ancho entero y pasa
               * por debajo de él; sin marcarla, el lockup queda en `ink-900`
               * sobre `ink-950` — **1,29:1**, medido a 375 px. Es el D1 de la
               * auditoría vivo en el único lugar que le quedaba: la §3 septies
               * verificó las ocho posiciones de la home en escritorio, donde
               * esta mitad arranca en el medio del `wrap` y el problema no
               * existe. Marcada, el lockup da 14,91:1.
               *
               * El `lg:hidden` es la regla, no un ajuste: partida, esta mitad
               * NO es un lienzo para el nav —el lockup queda sobre la mitad
               * clara— y marcarla ahí produciría exactamente la falla inversa,
               * `bone-100` sobre `cream-50`. Un elemento en `display:none` no
               * interseca nunca, así que el marcador existe justo en el rango
               * de anchos donde la regla vale.
               */}
              <div data-canvas aria-hidden="true" className="pointer-events-none absolute inset-0 lg:hidden" />
              {/* Sin aurora acá: el ámbar va reservado a una sola cosa por pieza
              (docs/MARCA.md). En esta mitad esa cosa es el precio fundador. */}

              <div className="relative flex flex-1 flex-col">
                {/* "Para tu local", no "Para comercios": el sitio entero dice
                    *local* —el nav, el CTA del hero, el cierre— y este era el
                    único lugar donde cambiaba, justo en la sección escrita
                    para ese público. `PRODUCT.md` lo fija como terminología. */}
                <Eyebrow onDark>Para tu local</Eyebrow>
                <h3
                  id="locales-title"
                  className="mt-3 max-w-[22ch] text-display-sm font-bold text-bone-100"
                >
                  Tu agenda, sin idas y vueltas.
                </h3>

                {/*
                 * La captura que esta mitad no tenía. La auditoría la eligió:
                 * "la mitad de los locales no tiene un solo visual, y ésta es
                 * su mejor prueba". Verificada píxel a píxel en los dos temas
                 * dentro del recorte: ni un color cromático fuera de la familia
                 * cálida — el verde y el rojo de los indicadores quedan abajo,
                 * fuera del encuadre.
                 */}
                <Captura
                  onDark
                  oscuro={crecimientoOscuro}
                  alt="Pantalla de Crecimiento de Bookit para un local: los turnos por mes en un gráfico de doce meses, con el total acumulado y el promedio mensual, y abajo el mejor mes y el servicio más vendido."
                  recorte={RECORTE}
                  sizes={SIZES}
                  className={CAPTURA}
                />

                <Features items={featuresLocal} onDark />

                <p className="mt-8 border-l-2 border-amber-500 pl-4 text-small text-bone-300">
                  <strong className="font-semibold text-amber-300">
                    Precio fundador de por vida.
                  </strong>{" "}
                  {/* Sin "cupos limitados": confirmado el 21/9/2026 que no hay un
                      número detrás. Era la única afirmación no verificable que
                      quedaba en una página que borra lo que no puede sostener.
                      "Los primeros" sí es cierto por definición del beneficio. */}
                  Es para los primeros locales que se suman antes del lanzamiento en Tandil.
                </p>

                <div className="mt-auto pt-10">
                  <Button
                    text="Quiero mi lugar como fundador"
                    href="/lista-espera?tipo=local"
                    variant="secondary"
                    onDark
                  />
                </div>
              </div>
            </article>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
