import type { Pantalla } from "./home";
import { site } from "./site";

/** Copy de las rutas secundarias: soporte, descargar, invitación y 404. */

export type Canal = {
  id: "email" | "instagram" | "telefono";
  label: string;
  value: string;
  href: string;
  hint: string;
};

export const soporte = {
  title: "Estamos del otro lado.",
  lede: "Somos un equipo chico contestando de a un mensaje por vez. Escribinos y te respondemos.",
  canales: [
    {
      id: "email",
      label: "Email",
      value: site.email,
      href: `mailto:${site.email}`,
      hint: "El canal principal. Respondemos en días hábiles.",
    },
    {
      id: "instagram",
      label: "Instagram",
      value: site.instagram.handle,
      href: site.instagram.url,
      hint: "Novedades y mensajes directos.",
    },
    {
      id: "telefono",
      label: "Teléfono",
      value: site.phone.display,
      href: site.phone.href,
      hint: "Llamadas y WhatsApp, en horario comercial.",
    },
  ] satisfies readonly Canal[],
  tiempos: {
    title: "Qué esperar",
    items: [
      "Consultas generales: hasta 3 días hábiles.",
      `Pedidos sobre tus datos personales (acceso, rectificación o supresión): hasta 10 días corridos, como pide la ${site.legal.dataProtectionLaw}.`,
    ],
  },
  datos: {
    title: "Quiero que borren mis datos",
    body: `Escribinos a ${site.email} desde la misma dirección con la que te anotaste y lo hacemos sin costo. Los pasos completos están en `,
    link: { label: "Eliminación de cuenta y datos", href: "/legal/eliminar-cuenta" },
  },
} as const;

/**
 * `/descargar`. Lo de Android depende de `site.app.playStore`: con link, el
 * badge aparece solo y el aviso de "pronto" se va.
 */
export const descargar = {
  descripcion: site.app.playStore
    ? `Bajate Bookit en el App Store o en Google Play y sacá tus turnos en ${site.city}.`
    : `Bajate Bookit en el App Store y sacá tus turnos en ${site.city}. La versión para Android sale pronto.`,
  conTiendas: {
    title: "Bajate Bookit.",
    lede: `Buscá locales de ${site.city}, reservá en treinta segundos y tené tus turnos a mano. Gratis para quien saca turnos.`,
    androidPronto: "La versión para Android sale pronto.",
    // El texto alternativo de cada badge es el que dice el badge.
    iphone: "Descárgalo en el App Store",
    android: "Descargar en Google Play",
  },
  preLanzamiento: {
    title: "Todavía no se puede descargar.",
    lede: `Estamos terminando la app y arrancamos por ${site.city}. Cuando esté en App Store y Google Play, los links van a estar acá. Mientras tanto, anotate a la lista y te avisamos antes que a nadie.`,
    cta: { label: "Sumate a la lista VIP", href: "/lista-espera" },
  },
  enLaApp: {
    title: "Tus turnos, en un solo lugar.",
    lede: "Lo que reservaste queda en la app, listo para cuando lo necesites.",
    items: [
      {
        title: "Tus turnos a mano",
        body: "Los próximos, con el local, la hora y el servicio.",
        captura: "misTurnos",
      },
      {
        title: "Cambios sin llamar",
        body: "Agendalo, mirá cómo llegar, reprogramalo o cancelalo.",
        captura: "hojaTurno",
        // La hoja con las acciones, sin la lista de atrás.
        crop: { top: 1000, bottom: 2622 },
      },
      {
        title: `${site.city} en un mapa`,
        body: "Los locales cerca tuyo, por rubro.",
        captura: "mapa",
      },
    ] satisfies readonly Pantalla[],
  },
  // El código lleva a https://apple.co/4dR0YKO, la ficha del App Store. Cuando
  // salga Android hay que cambiarlo por uno que sirva a los dos.
  qr: {
    title: "¿Estás en la compu?",
    body: "Apuntá la cámara del iPhone al código y abrís Bookit en el App Store.",
    alt: "Código QR que abre Bookit en el App Store.",
  },
  local: {
    pregunta: "¿Tenés un local? Bookit también es tu agenda.",
    link: { label: "Mirá los planes", href: "/planes" },
  },
} as const;

type Mensaje = { title: string; desc: string };

/**
 * Los referidos son sólo entre personas que sacan turnos, así que hay un único
 * mensaje con código. Mientras no haya tiendas, el copy no puede decir "Descargá".
 */
export const invite = {
  conCodigo: {
    conTiendas: {
      title: "¡Te invitaron a unirte a Bookit!",
      desc: "Descargá la app, usá el código de abajo al registrarte y sumá puntos para tus próximos turnos.",
    },
    preLanzamiento: {
      title: "Te invitaron a Bookit.",
      desc: "Guardá tu código: cuando la app salga, lo usás al registrarte y suman puntos los dos. Mientras tanto, anotate y te avisamos.",
    },
  } satisfies Record<string, Mensaje>,
  sinCodigo: {
    conTiendas: {
      title: "Tu próximo turno, a un clic de distancia.",
      desc: "Descargá la app oficial de Bookit para gestionar tus reservas en barberías, peluquerías y centros de estética de forma rápida y sencilla.",
    },
    preLanzamiento: {
      title: "Tu próximo turno, a un clic de distancia.",
      desc: "Bookit todavía no lanzó. Anotate y te avisamos el día que la app esté en App Store y Google Play.",
    },
  } satisfies Record<string, Mensaje>,
  cta: {
    preLanzamiento: { label: "Anotate y te avisamos", href: "/lista-espera" },
  },
  codigo: {
    rotulo: "¡Te regalaron una invitación!",
    ayuda: "Tocá para copiar el código e ingresalo al registrarte",
    copiado: "¡Código copiado con éxito!",
    manual: "Copiá el código a mano: Ctrl + C",
  },
  // Requisito de Apple para una página que abre la app.
  ayuda: {
    pregunta: "¿Necesitás ayuda con tu cuenta o la app?",
    link: { label: "Contactar a soporte", href: `mailto:${site.email}` },
  },
} as const;

/**
 * `/auth/v1/verify`: el botón de los mails de cuenta de la app. Con Bookit
 * instalado la abre la app; esta página la ve quien lo abrió en la compu o en
 * un navegador que no salta a la app (el de Gmail). No verifica nada: el token
 * se gasta recién en la app.
 */
export const verificar = {
  conToken: {
    title: "Abrí este enlace en tu teléfono.",
    desc: "Tocalo desde el teléfono donde tenés Bookit y la app se abre sola. Si ya estás en ese teléfono, usá el botón.",
  },
  sinToken: {
    title: "Este enlace está incompleto.",
    desc: "Pedí uno nuevo desde la app de Bookit y abrilo desde el mail.",
  },
  cta: "Abrir Bookit",
  /** El enlace de una cuenta creada en la web (`desde=web`): se confirma acá y sigue en /planes. */
  web: {
    title: "Confirmá tu cuenta.",
    desc: "Tocá el botón y seguí con el alta de tu local.",
    cta: "Confirmar y seguir",
  },
} as const;

/**
 * `/equipo`: el botón del mail de invitación a un equipo. Como `/auth/v1/verify`,
 * la ve quien no saltó a la app. Sin tiendas no hay link de descarga: quien no
 * tiene Bookit la instala y vuelve al mail.
 */
export const equipo = {
  conToken: {
    title: "Abrí esta invitación en tu teléfono.",
    desc: "Tocá el botón del mail desde el teléfono donde tenés Bookit y la app se abre sola. Si ya estás en ese teléfono, usá el botón de abajo. Si todavía no tenés Bookit, instalala y volvé a tocar el botón del mail.",
  },
  sinToken: {
    title: "Este enlace está incompleto.",
    desc: "Abrí otra vez el botón del mail de la invitación o pedile al local que te invite de nuevo.",
  },
  cta: "Ver la invitación",
} as const;

/**
 * El enlace que un local pega en su historia de Instagram. Quien llega acá no
 * tiene la app o la abrió en la compu: con la app, el enlace la abre sola.
 */
export const reservar = {
  conLocal: {
    title: (local: string, profesional: string | null) =>
      profesional ? `Reservá con ${profesional} en ${local}.` : `Reservá en ${local}.`,
    desc: "Abrí este enlace desde tu teléfono y Bookit te lleva directo al local para elegir tu horario.",
  },
  sinLocal: {
    title: "Este local ya no está en Bookit.",
    desc: "Puede que el enlace esté incompleto o que el local se haya dado de baja. En Bookit vas a encontrar otros locales cerca tuyo.",
  },
  cta: "Abrir en Bookit",
  sinApp: "¿Todavía no tenés Bookit?",
} as const;

export const noEncontrada = {
  title: "Esta página no existe.",
  lede: "Puede que el link esté mal escrito o que la hayamos movido. Volvé al inicio y seguí desde ahí.",
  inicio: { label: "Ir al inicio", href: "/" },
  ayuda: { label: "Necesito ayuda", href: "/soporte" },
} as const;
