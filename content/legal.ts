import { flags, payments, site } from "./site";

/**
 * Contenido legal en objetos tipados. Es un checklist de contenido cumplido,
 * NO asesoramiento legal: los textos finales los tiene que revisar alguien con
 * formación legal antes de publicar — sobre todo puntos, suscripciones y el rol
 * de intermediario (§8 del brief).
 */

export type LegalBlock =
  | { type: "p"; text: string; link?: { label: string; href: string } }
  | { type: "ul"; items: readonly string[] }
  | { type: "ol"; items: readonly string[] }
  | { type: "note"; text: string };

export type LegalSection = {
  id: string;
  heading: string;
  blocks: readonly LegalBlock[];
};

export type LegalDoc = {
  slug: string;
  title: string;
  /** Bajada corta, también usada como `description` de metadata. */
  intro: string;
  sections: readonly LegalSection[];
};

const contacto = `Escribinos a ${site.email} y te respondemos.`;

/* ─────────────────────────── Términos ─────────────────────────── */

export const terminos: LegalDoc = {
  slug: "terminos",
  title: "Términos y Condiciones",
  intro:
    "Las reglas de uso de Bookit: qué hacemos, qué no, cómo funcionan las reservas, los Puntos Bookit y las suscripciones de locales.",
  sections: [
    {
      id: "servicio",
      heading: "1. Qué es Bookit y qué no",
      blocks: [
        {
          type: "p",
          text: `Bookit es una plataforma que conecta personas que quieren reservar un turno con locales del rubro belleza y cuidado personal (barberías, peluquerías, manicura, estética, masajes y depilación) en ${site.city}, ${site.province}, ${site.country}.`,
        },
        {
          type: "p",
          text: "Bookit intermedia la reserva del turno. El servicio en sí —el corte, el color, la sesión— lo presta el local, bajo su propia responsabilidad. Bookit no fija los precios, no define la duración de los servicios, no supervisa la calidad del trabajo ni responde por el resultado.",
        },
        {
          type: "p",
          text: "Cada local es responsable de la información que publica: sus servicios, precios, horarios y condiciones de cancelación.",
        },
      ],
    },
    {
      id: "cuentas",
      heading: "2. Cuentas y edad mínima",
      blocks: [
        {
          type: "p",
          text: "Para usar Bookit necesitás crear una cuenta con datos reales y mantenerlos actualizados. Sos responsable de la actividad que ocurra en tu cuenta y de mantener tus credenciales a resguardo.",
        },
        {
          type: "p",
          text: "Tenés que tener al menos 18 años para abrir una cuenta. Si sos menor de 18, podés usar Bookit únicamente con el consentimiento de tu madre, padre o representante legal, que asume la responsabilidad por el uso.",
        },
        {
          type: "p",
          text: "Podemos suspender o cerrar una cuenta que use la plataforma para fines fraudulentos, que cargue datos falsos o que perjudique a otros usuarios o locales.",
        },
      ],
    },
    {
      id: "reservas",
      heading: "3. Reservas, cancelaciones y ausencias",
      blocks: [
        {
          type: "p",
          text: "Cuando reservás un turno por Bookit, estás tomando un horario real en la agenda de un local. Confirmada la reserva, el compromiso es entre vos y ese local.",
        },
        {
          type: "ul",
          items: [
            "Podés cancelar o reprogramar desde la app, con la antelación que cada local haya definido.",
            "Cancelar fuera de plazo o no presentarte puede tener consecuencias definidas por el local, y puede afectar tu posibilidad de reservar ahí en el futuro.",
            "Si el local cancela un turno, te avisamos por la app y, cuando corresponda, por email.",
            "El uso reiterado de reservas sin presentarse puede derivar en la suspensión de la cuenta.",
          ],
        },
        ...(payments.mercadoPagoEnApp
          ? ([
              {
                type: "p",
                text: "Cada local define cómo se cobra su turno: puede cobrarlo en el local, como siempre, o habilitar el pago por Mercado Pago dentro de Bookit. Cuál de las dos vías acepta lo ves antes de confirmar la reserva.",
              },
              {
                type: "p",
                text: "Cuando el turno se paga por Mercado Pago dentro de Bookit, Bookit gestiona ese cobro por el precio y las condiciones que el local informa antes de que confirmes. El servicio lo presta el local, que sigue siendo el responsable de prestarlo.",
              },
              {
                type: "p",
                text: `Si cancelás un turno ya pagado, la devolución se rige por la política de cancelación que el local informó al reservar y por la ${site.legal.consumerLaw}. Además, si contrataste a distancia, tenés el derecho de revocación de los 10 días corridos.`,
                link: {
                  label: "Ver Botón de arrepentimiento",
                  href: "/legal/boton-de-arrepentimiento",
                },
              },
            ] as const)
          : ([
              {
                type: "p",
                text: "Reservar por Bookit no implica pagar por Bookit: el servicio lo abonás directamente en el local, según sus medios de pago.",
              },
            ] as const)),
      ],
    },
    {
      id: "puntos",
      heading: "4. Puntos Bookit",
      blocks: [
        {
          type: "p",
          text: "Los Puntos Bookit son un beneficio de fidelización que otorgamos de forma gratuita. Se acumulan por reservar y concretar turnos a través de la plataforma, y se canjean en turnos posteriores según las condiciones vigentes en cada momento.",
        },
        {
          type: "ul",
          items: [
            "Los puntos no son dinero, no tienen valor monetario y no se cambian por efectivo.",
            "No se transfieren, ceden ni venden a otras personas.",
            "Pueden tener fecha de vencimiento, topes de acumulación o de canje.",
            "Podemos modificar, suspender o discontinuar el programa. Si lo hacemos, avisamos con antelación razonable y respetamos los canjes ya realizados.",
            "Los puntos obtenidos por medios irregulares (cuentas duplicadas, reservas simuladas, abuso del programa de referidos) se anulan.",
          ],
        },
        {
          type: "p",
          text: `Los ${site.puntosDeRegalo} Puntos Bookit ofrecidos por anotarse a la lista de espera se acreditan al crear la cuenta con el mismo correo con el que te anotaste, y quedan disponibles para tu primer turno.`,
        },
      ],
    },
    {
      id: "referidos",
      heading: "5. Referidos e invitaciones",
      blocks: [
        {
          type: "p",
          text: `El programa de referidos es exclusivo de las cuentas personales, es decir, de quienes sacan turnos. Cada una tiene un código de invitación propio, que se comparte como link (${site.dominio}/invite/TUCODIGO). Cuando alguien se registra como usuario usando tu código, las dos partes reciben el beneficio vigente al momento del registro.`,
        },
        {
          type: "ul",
          items: [
            "Las cuentas de local no participan del programa: no tienen código de invitación ni generan beneficios por referir. Su beneficio de incorporación es el precio fundador descripto en la sección siguiente.",
            "Un beneficio por persona registrada: no se acumula con otras promociones salvo que se indique.",
            "Está prohibido crear cuentas falsas o duplicadas, usar datos de terceros sin autorización, o difundir tu código como spam.",
            "Detectado un uso irregular, anulamos los beneficios asociados y podemos suspender las cuentas involucradas.",
          ],
        },
      ],
    },
    {
      id: "locales",
      heading: "6. Locales: suscripción y precio fundador",
      blocks: [
        {
          type: "p",
          text: "Los locales acceden a Bookit mediante una suscripción mensual. El precio, los medios de pago y el alcance del plan se informan antes de contratar.",
        },
        {
          type: "p",
          text: "El precio fundador es un precio preferencial, de carácter limitado, para los locales que se sumen antes del lanzamiento en la ciudad. Se mantiene mientras la suscripción esté activa y al día; si se da de baja, el local pierde esa condición y vuelve al precio vigente.",
        },
        {
          type: "p",
          text: "El local es responsable de mantener su agenda, sus precios y su información actualizados, y de cumplir con los turnos que acepta. También de la normativa que aplique a su actividad (habilitaciones, facturación, higiene y seguridad).",
        },
      ],
    },
    {
      id: "responsabilidad",
      heading: "7. Responsabilidad y limitaciones",
      blocks: [
        {
          type: "p",
          text: "Ponemos lo razonable para que la plataforma esté disponible y funcione bien, pero no garantizamos que esté libre de interrupciones o errores. Podemos hacer tareas de mantenimiento que afecten temporalmente el servicio.",
        },
        {
          type: "p",
          text: "Bookit no responde por la calidad, seguridad o legalidad de los servicios prestados por los locales, ni por daños derivados de la relación entre un usuario y un local. Tampoco por la exactitud de la información que cada local publica.",
        },
        {
          type: "p",
          text: "Nada de lo anterior limita los derechos que te correspondan como consumidor según la normativa argentina.",
        },
      ],
    },
    {
      id: "cambios",
      heading: "8. Cambios en estos Términos",
      blocks: [
        {
          type: "p",
          text: "Podemos actualizar estos Términos. Si el cambio es sustancial, lo avisamos por la app o por email con antelación razonable. Seguir usando Bookit después de la entrada en vigencia implica aceptarlos.",
        },
      ],
    },
    {
      id: "ley",
      heading: "9. Ley aplicable y jurisdicción",
      blocks: [
        {
          type: "p",
          text: `Estos Términos se rigen por las leyes de la República Argentina. Ante cualquier controversia, las partes se someten a los ${site.legal.jurisdiction}, sin perjuicio del derecho del consumidor a demandar ante el tribunal de su domicilio conforme la ${site.legal.consumerLaw}.`,
        },
      ],
    },
    {
      id: "contacto",
      heading: "10. Contacto",
      blocks: [
        {
          type: "p",
          text: `${site.legalName} · ${site.city}, ${site.province}, ${site.country}. ${contacto}`,
          link: { label: `Escribir a ${site.email}`, href: `mailto:${site.email}` },
        },
        {
          type: "note",
          text: "Pendiente de completar antes de publicar: razón social, CUIT y domicilio fiscal.",
        },
      ],
    },
  ],
};

/* ────────────────────────── Privacidad ────────────────────────── */

export const privacidad: LegalDoc = {
  slug: "privacidad",
  title: "Política de Privacidad",
  intro:
    "Qué datos personales recogemos, para qué los usamos, con quién los compartimos y cómo ejercés tus derechos.",
  sections: [
    {
      id: "responsable",
      heading: "1. Responsable del tratamiento",
      blocks: [
        {
          type: "p",
          text: `El responsable del tratamiento de tus datos personales es ${site.legalName}, con domicilio en ${site.city}, ${site.province}, ${site.country}.`,
        },
        {
          type: "p",
          text: `Para cualquier cuestión sobre tus datos, escribinos a ${site.email}.`,
          link: { label: `Escribir a ${site.email}`, href: `mailto:${site.email}` },
        },
        {
          type: "note",
          text: "Pendiente de completar antes de publicar: razón social, CUIT y domicilio fiscal exacto.",
        },
      ],
    },
    {
      id: "datos",
      heading: "2. Qué datos recogemos",
      blocks: [
        {
          type: "p",
          text: "Si te anotás a la lista de espera desde esta web, recogemos únicamente:",
        },
        {
          type: "ul",
          items: [
            "Nombre y apellido.",
            "Correo electrónico.",
            "Número de WhatsApp, si decidís dejarlo (es opcional).",
            "Tipo de usuario: si vas a sacar turnos o si tenés un local.",
            "Categoría del comercio, cuando se trata de un local.",
            "La constancia de que aceptaste recibir novedades, con su fecha.",
          ],
        },
        {
          type: "p",
          text: "Cuando la app esté disponible, y si creás una cuenta, vamos a tratar además los datos necesarios para gestionar tus turnos (historial de reservas, locales favoritos, Puntos Bookit) y datos técnicos de uso. Esta política se actualizará en ese momento.",
        },
        {
          type: "p",
          text: "No pedimos ni almacenamos datos sensibles, y esta web no solicita datos de tarjetas ni credenciales bancarias.",
        },
      ],
    },
    {
      id: "finalidad",
      heading: "3. Para qué los usamos y con qué base legal",
      blocks: [
        {
          type: "p",
          text: `Tratamos tus datos con la finalidad de avisarte del lanzamiento de Bookit en tu ciudad, acreditarte los beneficios de la lista de espera, contactarte si sos un local interesado en el precio fundador, y darte soporte si nos escribís.`,
        },
        {
          type: "p",
          text: `La base legal es tu consentimiento libre, expreso e informado, prestado al marcar la casilla del formulario, conforme la ${site.legal.dataProtectionLaw}. Podés revocarlo en cualquier momento, sin efecto retroactivo.`,
        },
        {
          type: "p",
          text: "No vendemos tus datos, no los cedemos a terceros con fines publicitarios y no tomamos decisiones automatizadas que te afecten.",
        },
      ],
    },
    {
      id: "encargados",
      heading: "4. Quiénes acceden a los datos",
      blocks: [
        {
          type: "p",
          text: "Para operar usamos proveedores que actúan como encargados del tratamiento, con acceso limitado a lo estrictamente necesario:",
        },
        {
          type: "ul",
          items: [
            "Supabase — base de datos donde se guardan los registros de la lista de espera.",
            "Resend — envío de los correos transaccionales (la confirmación que recibís al anotarte).",
            "Vercel — hosting de este sitio y de su función de servidor.",
          ],
        },
        {
          type: "p",
          text: "Estos proveedores pueden almacenar o procesar información en servidores ubicados fuera de la Argentina, lo que implica una transferencia internacional de datos. Al aceptar esta política prestás tu consentimiento para esa transferencia, que se realiza sobre la base de los compromisos contractuales de confidencialidad y seguridad asumidos por cada proveedor.",
        },
      ],
    },
    {
      id: "conservacion",
      heading: "5. Cuánto tiempo los conservamos",
      blocks: [
        {
          type: "p",
          text: "Conservamos los datos de la lista de espera mientras la lista siga vigente y hasta 24 meses después del lanzamiento en tu ciudad, o hasta que pidas la baja —lo que ocurra primero—. Vencido ese plazo, los eliminamos o los anonimizamos.",
        },
        {
          type: "p",
          text: "Podemos conservar por más tiempo la información mínima necesaria para acreditar el cumplimiento de obligaciones legales o para atender un reclamo.",
        },
      ],
    },
    {
      id: "derechos",
      heading: "6. Tus derechos",
      blocks: [
        {
          type: "p",
          text: "Tenés derecho a acceder a tus datos personales, a rectificarlos si son inexactos, a actualizarlos y a pedir su supresión. El ejercicio es gratuito.",
        },
        {
          type: "p",
          text: `Para ejercerlos, escribinos a ${site.email} desde la dirección con la que te registraste. Respondemos el pedido de acceso dentro de los 10 días corridos, y los de rectificación, actualización o supresión dentro de los 5 días hábiles de recibido el reclamo, conforme la ${site.legal.dataProtectionLaw}.`,
          link: { label: `Escribir a ${site.email}`, href: `mailto:${site.email}` },
        },
        {
          type: "p",
          text: "La Agencia de Acceso a la Información Pública (AAIP), en su carácter de órgano de control de la Ley 25.326, tiene la atribución de atender las denuncias y reclamos que se interpongan con relación al incumplimiento de las normas sobre protección de datos personales.",
          link: { label: "Ir al sitio de la AAIP", href: site.legal.aaipUrl },
        },
      ],
    },
    {
      id: "menores",
      heading: "7. Menores de edad",
      blocks: [
        {
          type: "p",
          text: "Bookit está destinado a personas mayores de 18 años. No recogemos datos de menores de forma intencional. Si detectamos que un registro corresponde a un menor sin consentimiento de su representante legal, lo eliminamos. Si sos madre, padre o tutor y creés que esto pasó, escribinos y lo resolvemos.",
        },
      ],
    },
    {
      id: "seguridad",
      heading: "8. Seguridad",
      blocks: [
        {
          type: "p",
          text: "Aplicamos medidas técnicas y organizativas razonables para proteger tus datos: transmisión cifrada (HTTPS), acceso restringido a las bases de datos y credenciales gestionadas como secretos del servidor. Ningún sistema es infalible; si ocurriera un incidente que afecte tus datos, actuamos para contenerlo y te informamos si corresponde.",
        },
      ],
    },
    {
      id: "cambios-privacidad",
      heading: "9. Cambios en esta política",
      blocks: [
        {
          type: "p",
          text: "Si actualizamos esta política, cambiamos la fecha de arriba y, cuando el cambio sea sustancial, te avisamos por email antes de que entre en vigencia.",
        },
      ],
    },
  ],
};

/* ──────────────────────────── Cookies ──────────────────────────── */

export const cookies: LegalDoc = {
  slug: "cookies",
  title: "Política de Cookies",
  intro: "Qué guardamos en tu navegador cuando visitás este sitio. Spoiler: casi nada.",
  sections: [
    {
      id: "que-usamos",
      heading: "1. Qué usamos hoy",
      blocks: [
        {
          type: "p",
          text: flags.analytics
            ? "Este sitio usa una herramienta de analítica sin cookies, que mide visitas de forma agregada y anónima, sin perfilarte ni seguirte entre sitios."
            : "Este sitio no usa cookies de analítica, de publicidad ni de seguimiento. No instalamos cookies propias ni de terceros para perfilarte, y no compartimos tu navegación con redes publicitarias.",
        },
        {
          type: "p",
          text: "Por eso no vas a encontrar un banner de cookies: no hay consentimiento que pedirte para algo que no hacemos. Un banner decorativo, que pide permiso sin usarlo para nada, sería peor que no tenerlo.",
        },
      ],
    },
    {
      id: "tecnico",
      heading: "2. Lo que sí puede pasar por tu navegador",
      blocks: [
        {
          type: "ul",
          items: [
            "Nuestro proveedor de hosting (Vercel) registra datos técnicos de las solicitudes —como la dirección IP y el tipo de navegador— en sus logs de servidor, por seguridad y para detectar abuso. Son logs, no cookies, y se conservan por plazos acotados.",
            "Cuando enviás el formulario de la lista de espera, registramos temporalmente tu dirección IP en memoria para limitar envíos masivos. No queda almacenada junto a tu registro.",
            "Tu navegador puede guardar en su propia caché los archivos del sitio (tipografías, estilos) para que cargue más rápido. Eso lo administrás desde tu navegador.",
          ],
        },
      ],
    },
    {
      id: "app-cookies",
      heading: "3. La app",
      blocks: [
        {
          type: "p",
          text: "La app móvil necesita almacenar información en tu dispositivo para mantener tu sesión abierta y funcionar sin conexión momentánea. Eso no son cookies de seguimiento y se describe en la política de privacidad.",
          link: { label: "Ver Política de Privacidad", href: "/legal/privacidad" },
        },
      ],
    },
    {
      id: "cambios-cookies",
      heading: "4. Si esto cambia",
      blocks: [
        {
          type: "p",
          text: "Si en el futuro sumamos analítica o cualquier tecnología que requiera tu consentimiento, actualizamos esta página antes de activarla y, si corresponde, te lo pedimos de forma clara.",
        },
      ],
    },
  ],
};

/* ─────────────────── Eliminación de cuenta ─────────────────── */

export const eliminarCuenta: LegalDoc = {
  slug: "eliminar-cuenta",
  title: "Eliminación de cuenta y datos",
  intro:
    "Cómo pedir la baja de tu cuenta de Bookit y el borrado de tus datos personales, sin costo y sin tener que iniciar sesión.",
  sections: [
    {
      id: "desde-la-app",
      heading: "1. Desde la app",
      blocks: [
        {
          type: "p",
          text: "Cuando la app esté disponible, vas a poder eliminar tu cuenta sin intermediarios:",
        },
        {
          type: "ol",
          items: [
            "Abrí Bookit e iniciá sesión.",
            "Entrá a Perfil y después a Configuración de la cuenta.",
            "Tocá Eliminar mi cuenta.",
            "Confirmá la eliminación. Te pedimos confirmarlo una vez más porque la acción no se puede deshacer.",
          ],
        },
      ],
    },
    {
      id: "desde-la-web",
      heading: "2. Desde la web, sin iniciar sesión",
      blocks: [
        {
          type: "p",
          text: `No necesitás tener la app ni una sesión abierta. Escribinos a ${site.email} desde la dirección de correo con la que te registraste, con el asunto "Eliminar mi cuenta". Si te anotaste sólo a la lista de espera y todavía no tenés cuenta, este es el camino.`,
          link: { label: `Pedir la baja por email`, href: `mailto:${site.email}?subject=Eliminar%20mi%20cuenta` },
        },
        {
          type: "p",
          text: "Podemos pedirte un dato adicional para verificar que la cuenta es tuya, y no vamos a pedirte nunca tu contraseña para esto.",
        },
      ],
    },
    {
      id: "que-se-borra",
      heading: "3. Qué se borra y qué se conserva",
      blocks: [
        { type: "p", text: "Se elimina:" },
        {
          type: "ul",
          items: [
            "Tu nombre, correo electrónico y teléfono.",
            "Tu registro en la lista de espera, si estabas anotado.",
            "Tu perfil, tus locales favoritos y tus preferencias.",
            "Tu saldo de Puntos Bookit, que se pierde y no se puede restituir ni convertir en dinero.",
          ],
        },
        { type: "p", text: "Se conserva, de forma acotada:" },
        {
          type: "ul",
          items: [
            "El registro de turnos ya realizados en un local, disociado de tus datos identificatorios, porque forma parte de la operación de ese comercio.",
            "La información mínima que debamos guardar por una obligación legal, contable o fiscal, o para atender un reclamo en curso. Se guarda bloqueada, sin usarse para contactarte.",
          ],
        },
      ],
    },
    {
      id: "plazos",
      heading: "4. Plazos",
      blocks: [
        {
          type: "p",
          text: "Confirmamos la recepción del pedido dentro de los 5 días hábiles y completamos el borrado dentro de los 30 días corridos. Las copias de respaldo se sobrescriben en el ciclo normal de retención, que no supera los 90 días.",
        },
        {
          type: "p",
          text: "El pedido es gratuito. Si necesitás algo distinto —por ejemplo, sólo dejar de recibir emails sin borrar la cuenta— decinos y lo hacemos.",
        },
      ],
    },
    {
      id: "contacto-baja",
      heading: "5. Contacto",
      blocks: [
        {
          type: "p",
          text: `${site.email} · ${site.city}, ${site.province}, ${site.country}.`,
          link: { label: "Ver Política de Privacidad", href: "/legal/privacidad" },
        },
      ],
    },
  ],
};

/* ───────────────── Botón de arrepentimiento ───────────────── */

export const botonArrepentimiento: LegalDoc = {
  slug: "boton-de-arrepentimiento",
  title: "Botón de arrepentimiento",
  intro:
    "Si contratás online, tenés 10 días corridos para revocar la contratación sin costo y sin dar explicaciones. Acá te contamos cómo.",
  sections: [
    {
      id: "de-que-se-trata",
      heading: "1. De qué se trata",
      blocks: [
        {
          type: "p",
          text: `La Resolución 424/2020 de la Secretaría de Comercio Interior y el artículo 34 de la ${site.legal.consumerLaw} te dan derecho a revocar una contratación hecha a distancia dentro de los 10 días corridos desde que la aceptaste o desde que recibiste el servicio, el plazo que sea posterior. Es sin costo y sin necesidad de justificar el motivo.`,
        },
      ],
    },
    {
      id: "estado-actual",
      heading: "2. Situación actual de Bookit",
      blocks: [
        ...(payments.mercadoPagoEnApp
          ? ([
              {
                type: "p",
                text: "Hay turnos que se pagan dentro de Bookit, por Mercado Pago, cuando el local habilita esa vía. Ese pago es una contratación a distancia, así que el derecho aplica de lleno y no es una explicación para el futuro: si pagaste un turno por la plataforma, podés revocar esa contratación dentro de los 10 días corridos, sin costo y sin justificar el motivo.",
              },
              {
                type: "p",
                text: "Si el local cobra en el local y no por la plataforma, no hubo contratación a distancia con Bookit por ese turno: la cancelación se rige por la política del local y por tus derechos como consumidor frente a él.",
              },
              {
                type: "p",
                text: "El canal para ejercerlo está en la sección siguiente, lo atendemos nosotros y no depende del local. Revocar la contratación no es lo mismo que cancelar un turno desde la app: podés usar cualquiera de las dos vías, y por esta tenemos que responderte igual.",
              },
              {
                type: "p",
                text: "La suscripción mensual de los locales también se cobra por Mercado Pago. Es igualmente una contratación a distancia, así que el mismo derecho y el mismo canal aplican a esa contratación.",
              },
            ] as const)
          : ([
              {
                type: "p",
                text: "Bookit está en pre-lanzamiento y todavía no cobra suscripciones ni turnos online: anotarse a la lista de espera es gratuito y no genera ninguna obligación de pago para vos. Por eso, hoy no hay contratación que revocar.",
              },
              {
                type: "p",
                text: "Cuando habilitemos el cobro online de la suscripción de locales, este derecho aplica a esa contratación y el canal para ejercerlo es el que está más abajo. Dejamos la página publicada desde ahora para que el canal exista y sea fácil de encontrar.",
              },
            ] as const)),
      ],
    },
    {
      id: "como-ejercerlo",
      heading: "3. Cómo ejercerlo",
      blocks: [
        {
          type: "p",
          text: `Mandanos un correo a ${site.email} con el asunto "Botón de arrepentimiento" y estos datos:`,
          link: {
            label: "Ejercer el derecho por email",
            href: `mailto:${site.email}?subject=Bot%C3%B3n%20de%20arrepentimiento`,
          },
        },
        {
          type: "ul",
          items: [
            "Nombre y apellido, o razón social del local.",
            "Correo electrónico con el que contrataste.",
            "Qué contrataste y en qué fecha.",
            "La manifestación de que querés revocar la contratación.",
          ],
        },
        {
          type: "p",
          text: `También podés hacerlo por teléfono al ${site.phone.display}.`,
        },
        ...(site.phone.isPlaceholder
          ? ([
              {
                type: "note",
                text: "El teléfono publicado es un número de ejemplo hasta que se cargue el definitivo. El canal operativo es el correo electrónico.",
              },
            ] as const)
          : ([] as const)),
      ],
    },
    {
      id: "efectos",
      heading: "4. Qué pasa después",
      blocks: [
        {
          type: "ul",
          items: [
            "Confirmamos la recepción del pedido y damos de baja la contratación de inmediato.",
            "Si hubo un pago, se reintegra por el mismo medio en que lo hiciste, sin cargos ni penalidades, dentro de los plazos del medio de pago.",
            "Si ya usaste el servicio durante el período, puede descontarse la parte proporcional efectivamente utilizada, conforme la normativa.",
          ],
        },
        {
          type: "p",
          text: "Si tenés un reclamo que no pudimos resolver, podés presentarlo ante la autoridad de defensa del consumidor.",
          link: {
            label: "Formulario de Defensa de las y los Consumidores",
            href: site.legal.consumerDefenseUrl,
          },
        },
      ],
    },
  ],
};
