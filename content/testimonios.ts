import { site } from "./site";

/*
 * DATOS DE PRUEBA. Bookit no tiene testimonios reales (`PRODUCT.md`): estas
 * citas y nombres son inventados —los mismos de las capturas— para diseñar la
 * sección. Mientras `sonDePrueba` sea `true`, la sección no se renderiza en
 * producción. Con citas reales: se cambian las de abajo y se pasa a `false`.
 */
export const sonDePrueba = true;

/**
 * De prueba, sólo en `next dev` o en un preview de Vercel: ante cualquier otro
 * entorno, apagada. No alcanza con mirar `VERCEL_ENV`, porque un `vercel env
 * pull` lo deja en `production` en `.env.local`. Se lee en el servidor.
 */
export const mostrarTestimonios =
  !sonDePrueba || process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview";

export type Testimonio = {
  cita: string;
  nombre: string;
  rol: string;
};

export const testimonios = {
  title: "Lo que dicen los primeros.",
  lede: `Locales y clientes de ${site.city} que la usan antes del lanzamiento.`,
  // En orden de la grilla: la alta, la ancha y las dos chicas.
  citas: [
    {
      cita: "Antes pasaba la noche contestando WhatsApp para dar turnos. Ahora la agenda se llena sola y yo me dedico a cortar.",
      nombre: "Julián Peralta",
      rol: "Dueño de barbería",
    },
    {
      cita: "Saqué turno un domingo a la noche, desde el sillón, sin esperar que nadie me conteste.",
      nombre: "Valentina Sosa",
      rol: "Clienta",
    },
    {
      cita: "Con los recordatorios, casi nadie se olvida del turno.",
      nombre: "Nico Ferreyra",
      rol: "Barbero",
    },
    {
      cita: "Tengo todos mis turnos en un solo lugar.",
      nombre: "Camila Duarte",
      rol: "Clienta",
    },
  ] satisfies readonly Testimonio[],
} as const;
