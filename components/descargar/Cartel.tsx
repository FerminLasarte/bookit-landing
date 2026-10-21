import BotonesDeDescarga from "@/components/abrir-app/BotonesDeDescarga";
import Screen from "@/components/ui/Screen";
import { AIRE_DE_PAGINA } from "@/components/ui/Section";
import Superficie from "@/components/ui/Superficie";
import { descargar } from "@/content/paginas";
import { flags } from "@/content/site";
import DesdeLaCompu from "./DesdeLaCompu";
import TelefonosInclinados from "./TelefonosInclinados";

/**
 * El encabezado de /descargar: un cartel apaisado con la tarjeta del texto y
 * los badges a la izquierda y la app a la derecha. En móvil, la tarjeta va
 * primero para que los badges queden sobre el pliegue. El alto lo pone la
 * tarjeta, y los teléfonos se cortan contra el borde de abajo. Sin `Reveal`:
 * el título es lo primero que se pinta.
 */
export default function Cartel() {
  const { conTiendas, preLanzamiento } = descargar;
  const { title, lede } = flags.storeLinksLive ? conTiendas : preLanzamiento;

  return (
    <section id="descargar" aria-labelledby="descargar-titulo" className={AIRE_DE_PAGINA}>
      <div className="wrap">
        <Superficie tone="arena" className="flex flex-col p-4 lg:flex-row lg:items-center lg:p-10">
          <Superficie tone="flota" className="z-10 p-7 text-center lg:w-[46%] lg:p-10 lg:text-left">
            <h1 id="descargar-titulo" className="text-display font-bold break-words text-fg">
              {title}
            </h1>
            <p className="mx-auto mt-6 max-w-[46ch] text-pretty text-muted lg:mx-0">{lede}</p>
            <BotonesDeDescarga className="mt-10 lg:justify-start" />
            {flags.storeLinksLive && <DesdeLaCompu className="mt-8 border-t border-line pt-8" />}
          </Superficie>

          <TelefonosInclinados
            className="h-96 pt-8 lg:h-auto lg:flex-1 lg:self-stretch lg:pt-16"
            izquierda={<Screen id="horario" sizes="(min-width: 1024px) 14rem, 10rem" />}
            centro={<Screen id="inicio" eager sizes="(min-width: 1024px) 18rem, 13rem" />}
            derecha={<Screen id="misTurnos" sizes="(min-width: 1024px) 14rem, 10rem" />}
          />
        </Superficie>
      </div>
    </section>
  );
}
