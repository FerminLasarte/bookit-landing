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
  lede: "Bookit todavía no lanzó, así que somos un equipo chico contestando de a un mensaje por vez. Escribinos y te respondemos.",
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
      hint: "Novedades del lanzamiento y mensajes directos.",
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

export const descargar = {
  conTiendas: {
    title: "Bajate Bookit.",
    lede: "Disponible para iPhone y Android.",
    iphone: "Descargar para iPhone",
    android: "Descargar para Android",
  },
  preLanzamiento: {
    title: "Todavía no se puede descargar.",
    lede: `Estamos terminando la app y arrancamos por ${site.city}. Cuando esté en App Store y Google Play, los links van a estar acá. Mientras tanto, anotate a la lista y te avisamos antes que a nadie.`,
    cta: { label: "Sumate a la lista VIP", href: "/lista-espera" },
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
    conTiendas: "Descargar la app",
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

export const noEncontrada = {
  title: "Esta página no existe.",
  lede: "Puede que el link esté mal escrito o que la hayamos movido. Volvé al inicio y seguí desde ahí.",
  inicio: { label: "Ir al inicio", href: "/" },
  ayuda: { label: "Necesito ayuda", href: "/soporte" },
} as const;
