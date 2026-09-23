# Product

<!-- impeccable:product-schema 1 -->

> Verdad de producto de Bookit. Es lo que ningún trabajo futuro puede inventar ni contradecir.
> La **normativa de marca** (color, tipografía, logo, movimiento, voz) NO vive acá: vive en
> [`docs/MARCA.md`](docs/MARCA.md) y tokenizada en el bloque `@theme` de
> [`app/globals.css`](app/globals.css). Ese par es autoridad, no material a re-derivar.
> El contexto largo está en [`docs/LANDING_BRIEF.md`](docs/LANDING_BRIEF.md) y las desviaciones
> tomadas al construir, en [`docs/archivo/DECISIONES.md`](docs/archivo/DECISIONES.md).
>
> Última actualización: 21 de septiembre de 2026.

## Platform

web

## Users

Dos públicos, **igual de importantes**. La landing se bifurca para los dos sin partirse en dos.

1. **Cliente final.** Vive en Tandil y quiere sacar un turno de barbería, peluquería, manicura,
   estética, masajes o depilación sin cadena de WhatsApp ni llamados en horario de trabajo.
   Situación típica: se le ocurre a la noche o un domingo, cuando el local está cerrado.
   Gancho actual: **500 Puntos Bookit** de regalo por anotarse a la lista, canjeables en el
   primer turno.

2. **Dueño de local.** Tiene un comercio chico del rubro belleza y quiere digitalizar su agenda:
   hoy la lleva por WhatsApp y cuaderno. Le duelen las ausencias y las idas y vueltas.
   Gancho actual: **precio fundador de por vida**, con cupos limitados para los locales que se
   suman antes del lanzamiento en Tandil.

## Product Purpose

Bookit es una **app nativa de iOS y Android** para reservar turnos en el rubro belleza y cuidado
personal. El producto está en **pre-lanzamiento** (confirmado el 21 de septiembre de 2026): la app
está en desarrollo y todavía no hay links de App Store ni Google Play.

El trabajo de la web, mientras tanto, es **captar lista de espera calificada** de los dos públicos
y sostener los deep links de invitación que ya circulan. El éxito se mide en leads en la tabla
`waitlist_leads` de Supabase, segmentados por `user_type` (`cliente` / `local`), no en tráfico.

## Positioning

Lo que un producto vecino no podría copiar de verdad:

- **Lanzamiento ciudad por ciudad, empezando por Tandil.** No es un directorio nacional con
  cobertura fina: es el inventario real de una ciudad chica, donde estar en Bookit y estar en la
  calle son casi la misma lista. La densidad local es la propuesta.
- **Los turnos que ya te hacías te devuelven algo.** Los Puntos Bookit convierten un trámite
  repetido en acumulación, sin pedirle al cliente que cambie de hábito.
- **Referidos con código propio.** Cada usuario tiene su código; cuando alguien se registra con él,
  ganan los dos. El crecimiento está diseñado para correr por el boca a boca de una ciudad chica.
- **"Cara, sin ser cara".** La promesa explícita del manual de marca: que la app de un comercio de
  barrio se vea como la de una cadena.

## Operating Context

| | |
|---|---|
| Mercado inicial | Tandil, Buenos Aires, Argentina |
| Idioma | Español rioplatense, **voseo**. `lang="es-AR"` en todo el sitio |
| Moneda / zona | ARS · `America/Argentina/Buenos_Aires` |
| Dominio | `somosbookit.com.ar`, canónico **con `www`** |
| Bundle / package | `ar.com.somosbookit.app` · Apple Team ID `MPX5U375K6` |
| Deploy | Vercel |

**Contacto (fuente única: [`content/site.ts`](content/site.ts)).**

- Soporte público: `somosbookit@gmail.com`
- Remitente transaccional: `hola@somosbookit.com.ar` (Resend, `Bookit VIP <…>`)
- Teléfono: `+54 9 249 460-0615` — **real y confirmado** (ya no es el placeholder que registra
  `docs/archivo/DECISIONES.md` §3).
- Instagram: **`@bookit_arg`** — confirmado el 21 de septiembre de 2026. El brief §2 pedía
  cambiarlo a `@somosbookit`: esa corrección quedó **sin efecto**, el handle vigente es el que
  está en el código.

**Infraestructura de datos.** Supabase (tabla `waitlist_leads`) para los leads y Resend para el
email de bienvenida, con plantilla y asunto distintos según `cliente` o `local`.

**Deep links.** Universal Links (iOS) y App Links (Android) ya están configurados y en producción.
`/invite/<CODIGO>` y `/invite/comercio/<CODIGO>` abren la app si está instalada; la web es el
fallback. Hay links de invitación circulando hoy.

## Capabilities and Constraints

**Mecánicas de producto que la web comunica.**

- **Reserva de turno** — el cliente elige servicio, ve los huecos reales y confirma sin esperar
  respuesta.
- **Puntos Bookit** — fidelización: se acumulan por turno y se canjean en los siguientes.
  Hay niveles (bronce, plata, oro, VIP) tokenizados en `@theme`.
- **Referidos / invitaciones** — código por usuario, link compartible, beneficio para ambas partes.
  Hay variante para comercios.
- **Agenda del local** — se actualiza sola, recordatorios automáticos, ficha e historial por
  cliente, link propio para compartir en Instagram.
- **Pago del turno — mixto, y lo decide el local.** Confirmado el 21 de septiembre de 2026.
  El cliente puede pagar **en efectivo en el local** o **por Mercado Pago a través de Bookit**, y es
  **el comercio el que ofrece o no** la opción online: no es una política de Bookit aplicada a todos
  por igual. O sea que la landing no puede decir ni "se paga en el local" ni "se paga por la app"
  como si fueran la regla — las dos conviven y la que rige depende del local.
- **La suscripción mensual de los locales se cobra por Mercado Pago.** Confirmado el 21 de
  septiembre de 2026. Esto cierra el punto que `docs/archivo/DECISIONES.md` §4 dejaba sin verificar: el
  texto vigente del Botón de arrepentimiento §2 dice que la suscripción todavía no se cobra online,
  y **está desactualizado**.
- **Consecuencia.** Bookit cobra y el servicio lo presta el local, así que el reparto de
  responsabilidad del reintegro (Términos §1 y §3) y el mecanismo del **Botón de arrepentimiento**
  (Ley 24.240) siguen necesitando **revisión de una persona con formación legal** antes de publicar.
  `flags.inAppPayments: true` ya está en `content/site.ts`, pero un booleano no alcanza para
  representar "efectivo o Mercado Pago, a criterio del local": el copy tiene que decirlo.

- **Los Puntos Bookit no tienen un valor fijo en pesos.** Confirmado el 21 de
  septiembre de 2026. Ninguna superficie puede declarar una equivalencia ni una
  tasa de acumulación por turno: no existen. La landing lo dice explícitamente
  en la FAQ en vez de dejar el hueco.
- **"Cupos limitados" no tiene un número detrás.** Confirmado el 21 de
  septiembre de 2026, y por eso se eliminó de toda la web. El precio fundador
  es para los primeros locales que se suman antes del lanzamiento —eso sí es
  cierto por definición del beneficio— pero no hay una cantidad de cupos que
  se pueda anunciar ni agotar. No reintroducir la escasez sin un número real.

**Contratos técnicos que no se pueden romper** (detalle en `docs/LANDING_BRIEF.md` §2):

1. `/.well-known/apple-app-site-association` servido como `application/json`, sin extensión.
2. `/.well-known/assetlinks.json` como `application/json`.
3. `/invite/<code>` y `/invite/comercio/<code>` responden 200 con la página de invitación.
4. `POST /api/waitlist` conserva el body y **los seis mensajes de error textuales** en español.
5. `/lista-espera.html` sigue resolviendo (redirige 301 a `/lista-espera`).

**Restricciones de implementación vigentes.** Next.js App Router + TypeScript estricto (sin `any`)
+ Tailwind v4 con tokens en `@theme`. Sin librería de UI. El contenido vive en `content/` como datos
tipados; la página consume, no define. `lucide-react` sólo para iconos utilitarios; los iconos de
sección son SVG propios. Sin JS de terceros.

**Terminología.** Se dice *turno*, no "cita" ni "ítem". Se dice *local*, no "comercio" a secas ni
"negocio". *Puntos Bookit*, con mayúscula. Nunca "usuario" para dirigirse a la persona.

**Decisiones de producto explícitamente abiertas** (no inventarlas):

| Qué falta | Estado | Dónde se cambia |
|---|---|---|
| Razón social, CUIT y domicilio fiscal | **Sigue faltando** (confirmado 21/9/2026). Hay un bloque visible avisándolo en Términos §10 y Privacidad §1 | `content/legal.ts` |
| Precio de la suscripción para locales | No se menciona y así queda | — |
| Links de App Store / Google Play | No existen todavía | `flags.storeLinksLive` + `site.app` |
| Analítica | No hay, y por eso tampoco hay banner de cookies | `flags.analytics` |
| Revisión legal de los cinco documentos de `/legal/*` | Pendiente de una persona | — |

## Brand Commitments

- **La marca ya está resuelta y es autoridad.** Manual de marca Bookit v1 (septiembre 2026),
  traducido a decisiones web en `docs/MARCA.md` y tokenizado en `@theme`. Jerarquía: si el manual
  y la app Flutter no coinciden, **gana la app**; si el manual y la web no coinciden, **gana el
  manual**, salvo las *divergencias declaradas* de `docs/MARCA.md`.
- **El nombre se escribe `Bookit`**, con una sola mayúscula. El manual v1 pide `BooKit`: es un
  error del manual, pendiente de corregir ahí.
- **Los tres rasgos:** cercana, no informal · cara, sin ser cara · callada hasta que importa.
- **Voz.** Voseo rioplatense, frases cortas, sin jerga. El imperativo lleva tilde: *Reservá*,
  *Elegí*, *Confirmá*. **Sin emojis en la interfaz**, sin "¡Ups!", sin mayúsculas sostenidas, sin
  signos repetidos. No promete lo que no controla. Cada vacío dice qué pasó y sugiere una salida.
  (Excepción registrada: el 🎉 de las pantallas de éxito del formulario es un mensaje de
  celebración, no iconografía de UI.)
- **Logo.** Isotipo = un corchete que se cierra sobre un check. Los SVG están en `public/brand/`
  y en React se usan siempre por `components/Wordmark.tsx`, nunca como `<img>`. La palabra del
  lockup es dibujo, no texto: no se reescribe con otra tipografía.

## Evidence on Hand

**Lo que existe y es real:**

- Los cinco documentos legales de `/legal/*`, con contenido real y propio (`content/legal.ts`).
- El contrato de `POST /api/waitlist`, ya en producción y consumido por el form actual.
- Los SVG de marca: `public/brand/logo_bookit_completo.svg` y `logo_bookit_isotipo.svg`.
- El copy del sitio vigente y de los emails transaccionales, que es el punto de partida real.

**Lo que NO existe y no se debe fabricar:**

- **Cero testimonios, métricas, logos de clientes, cantidad de usuarios, ratings o reseñas.**
  No hay ninguno real. El criterio de aceptación del brief §10 lo prohíbe explícitamente, y el
  JSON-LD no lleva `AggregateRating`.
  La sección de testimonios de la home existe con **citas de prueba** para diseñarla
  (`content/testimonios.ts`), marcada como tal y **sin renderizarse en producción**
  mientras `sonDePrueba` sea `true`. Decidido por Fermín el 22 de septiembre de 2026.
- Tampoco hay locales adheridos anunciables por nombre, ni fecha pública de lanzamiento.

**Screenshots de la app.** No hay ninguna captura en el repo (`public/` sólo tiene marca y
`.well-known`). Se van a **capturar desde el simulador de iOS** cuando el trabajo de superficie las
necesite; hasta entonces no hay imagen de producto disponible. Esto **actualiza** el §11.7 de
`docs/LANDING_BRIEF.md` y el §3 de `docs/archivo/DECISIONES.md`, que daban las capturas por inexistentes.

**Assets rotos, a no reintroducir.** Los tres archivos del sitio viejo en Supabase Storage
(`favicon.png`, `og-image.png`, `banner_compartir.jpg`) devuelven **HTTP 400**: el bucket no es
público. Las imágenes OG e iconos se generan hoy con `next/og`, localmente.

## Product Principles

1. **Honestidad de pre-lanzamiento.** No hay app para bajar todavía, y la página lo dice en vez de
   simularlo. Ningún CTA manda a un link muerto: mientras no haya stores, la descarga es lista de
   espera con copy que lo admite.
2. **Dos caminos, una sola página.** Cliente y local son igual de importantes. Cada uno tiene un
   recorrido y un gancho propios, sin que la página se sienta partida en dos ni obligue a elegir
   antes de entender qué es Bookit.
3. **Sólo se promete lo que existe.** Cero prueba social inventada. Cuando falta un dato —el precio,
   la razón social, la fecha— se dice que falta; no se rellena.
4. **La ciudad es el producto.** Tandil no es un detalle de contexto: es la razón por la que la
   propuesta funciona. Hablar de "tu ciudad" en abstracto debilita lo único que hoy es cierto.
5. **La marca ya está decidida.** El trabajo visual se hace *dentro* de `docs/MARCA.md` y `@theme`,
   no alrededor. Un color, un radio o una duración que no estén ahí se discuten y se documentan;
   no se inventan en el archivo donde hicieron falta.

## Accessibility & Inclusion

Es parte del diseño, no un extra, y ya está ganado: **100 en Lighthouse Accessibility** en las seis
páginas medidas, y es un criterio de aceptación vigente.

- **Contraste medido contra el fondo real, nunca contra blanco por costumbre** (regla §3 del manual):
  4,5:1 en texto · 3:1 en texto grande, iconos y bordes.
- El ámbar de marca `#D78A1D` **no se usa como texto sobre fondo claro** (da 2,64:1). Para eso
  existe `amber-700` / `marcaTexto` `#9D6515`.
- **El color nunca es el único portador de un dato.**
- Claro y oscuro, los dos diseñados. El oscuro no es el claro invertido.
- `prefers-reduced-motion` desactiva todo movimiento; las animaciones quedan en fundidos.
- Un solo `h1` por página, sin saltos de jerarquía en los headings, sin scroll horizontal a
  375 / 768 / 1280 / 1600 px.
- **Truncar esconde:** ningún dato existe sólo truncado.
