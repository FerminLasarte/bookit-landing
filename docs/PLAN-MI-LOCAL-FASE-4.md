# Mi local en la web — fase 4: el Perfil del local

> **Aprobado por Fermín el 22 de octubre de 2026**, con la recomendada de cada
> decisión D1–D8.

> Borrador del 22 de octubre de 2026, para que Fermín apruebe las decisiones
> **D1–D8**. Es la fila 4 de la hoja de ruta (`docs/PLAN-MI-LOCAL.md`): Fermín
> eligió hacer el **Perfil** antes que **Crecimiento** (estadísticas,
> promociones y recompensas), que queda para la fase siguiente.

## Qué es la fase 4

El dueño arregla desde la compu **lo que el cliente ve de su local en la app**:
el nombre, la categoría, la localidad y la dirección, el Instagram y **la foto**,
con sus dos recortes (el círculo y la portada de la ficha).

Y llega lo que quedó pendiente de las fases anteriores: **las fotos del
equipo**.
- El dueño pone la suya y la de los profesionales sin cuenta (D9 de la fase 3).
- El profesional con cuenta pone su nombre y su foto en ese local (D2 del plan
  del equipo).

**Queda afuera:**
- el resto del Perfil de la app: cobrar con Mercado Pago, la devolución si el
  cliente cancela, los avisos, compartir la disponibilidad y eliminar la cuenta
  (ver D2);
- el pin en el mapa (ver D8);
- Crecimiento, que es la fase que sigue.

## Cómo lo hace hoy la app

Rutas relativas a `~/Desarrollo/GitHub/BooKit`, en `origin/develop` (894147b).

### Dónde está

**Perfil** es la cuarta pestaña del dueño (`business_profile_screen.dart`). Es
un menú:
- arriba, el aviso de la suscripción, el logo, el nombre y el mail;
- "Citas Hoy" y "Staff";
- "Cambiar de lado", "Mi Suscripción", "Compartir disponibilidad";
- **"Editar datos del negocio"** ("Nombre, dirección, Instagram, etc."), que
  abre `BusinessInfoScreen`;
- "Recibir pagos": vincular Mercado Pago y, ya vinculado, "Si el cliente
  cancela" (48, 24, 12 o 2 h antes, o "No se devuelve");
- los avisos, el modo oscuro y "Cerrar sesión".

**Lo que ve el cliente del local es lo de "Editar datos del negocio".** El resto
del menú es cuenta, plan y cobros.

### "Información del negocio" (`business_info_screen.dart`)

Un formulario con un solo "Guardar cambios", que se prende sólo si algo cambió:

- **La foto**, arriba y a sangre, como la portada de la ficha
  (`BusinessPhotoPicker`): "Foto del negocio · La ven tus clientes en la
  búsqueda y en tu ficha". Ver abajo.
- **Nombre.**
- **Email (cuenta principal)**, bloqueado: "El correo electrónico está
  vinculado a tu cuenta y no se puede modificar desde aquí."
- **Instagram**, normalizado (`instagram_handle.dart`, la misma regla que ya
  copia la web en `normalizarInstagram`).
- **Localidad** (`LocalidadField`). Cambiarla vacía la dirección.
- **Dirección** (`SmartAddressField`): se busca dentro de la localidad y se
  confirma el punto en un mapa ("Seleccioná una ubicación en el mapa"). Se
  guarda **sólo la calle y la altura** (`calleParaGuardar`, `direccion_calle.dart`).
- Abajo, "Eliminar cuenta": "Cierra tu local y borra tus datos".

**La categoría no se edita en ningún lado de la app.** Se elige en el alta
(`business_setup_screen.dart`) y nunca más.

Al guardar, `BusinessProfileRepository.updateBusinessInfo` hace **un `update`
directo a `comercios`** con lo que cambió: `nombre`, `direccion`,
`localidad_id`, `instagram` (vacío va como `null`), `ubicacion`
(`POINT(lng lat)`), `logo_url` y `banner_url`. Después avisa al resto de la
app (`localActualizado`) para que el nombre y el logo cambien en todos lados.

### La foto del local

- **De dónde sale:** `image_picker` (cámara o galería, calidad 70), con la hoja
  `showPhotoSourcePicker`.
- **El encuadre** (`lib/shared/photo_framer/`): una sola foto, **dos
  encuadres** acomodados a mano sobre la misma imagen, con las dos miniaturas
  siempre a la vista. "Una sola imagen no puede ganar las dos" (el comentario
  de `PhotoFramerScreen`).
  - **Perfil**: cuadrado, se ve en círculo (tarjetas, mapa, búsqueda). JPEG de
    720 × 720.
  - **Portada**: 2:1, la banda de la ficha. JPEG de 1440 × 720.
  - El encuadre inicial es el más grande centrado (`Encuadre.centrado`), que
    es lo que se veía antes: quien no toca nada ve lo mismo.
  - JPEG calidad 85.
- **La subida** (`photo_upload.dart`, `subirFotoDeComercio`): bucket `logos`,
  `comercios/<id_comercio>_<sello>_perfil.jpg` y `…_portada.jpg`, en serie.
  Van a `logo_url` y `banner_url`.
- **Las anteriores se borran** (`borrarFotosReemplazadas`), sólo si son del
  bucket: una foto de Google, de Apple o de stock no se toca. Si falla, no
  pasa nada.
- `banner_url` vacío hace que la ficha caiga al logo, que es como se veía antes
  de que la portada tuviera recorte propio.

### La foto de cada profesional

- **El profesional con cuenta**, desde su perfil ("Información profesional",
  `staff_personal_info_screen.dart`): "Nombre visible" y "Foto de perfil
  profesional · La ven tus clientes al elegir con quién reservar".
  - La foto se sube **sin encuadre**, con la extensión original y
    `upsert: true`, a `logos/profesionales/<id_profesional>_<sello>.<ext>`
    (`staff_profile_repository.dart`). Va a `profesionales.foto_url`.
  - Edita **la fila de ese local** (por `id_profesional`): quien trabaja en dos
    locales tiene una ficha en cada uno.
- **El dueño** edita su propia tarjeta en Equipo (nombre y foto).
- **El profesional sin cuenta** no tiene foto: nadie se la puede subir.

### Lo que ve el cliente

La ficha (`shop_profile_screen.dart` y sus widgets) muestra: la portada, el
círculo, el nombre, la dirección con la localidad, el equipo (nombre y foto de
cada uno, **sin la presentación**), "Pagos y reservas" (efectivo, Mercado Pago),
los puntos y "Redes" (Instagram). La búsqueda por categoría usa la categoría.

## Lo que controla la base

Migraciones en `BooKit/supabase/migrations`.

| Qué | Quién escribe | Controles |
|---|---|---|
| `comercios` | Sólo el dueño: la política "comercios: el dueño edita" (`auth_user_id = auth.uid()`). | **Grants por columna** (`20260909170000`): todas menos las de la suscripción. La lectura también es por columna desde M2-11 (`20260922130000`): nada de `select *`. `instagram` tiene un `CHECK` (`^[A-Za-z0-9._]{1,30}$`). No vi `CHECK` de nombre ni de dirección (ver el paso 0). |
| La categoría | **En dos lugares:** `comercios.id_categoria` y `comercios_categorias`. Las escribe juntas `_alta_del_comercio`, y nadie más. | `comercios_categorias` deja todo al dueño ("las maneja el dueño"). `buscar_comercios_cercanos_por_categoria` busca **en las dos** (`c.id_categoria = … or exists (… comercios_categorias …)`): cambiar una sola deja el local apareciendo en la categoría vieja. |
| `profesionales` | El dueño o el propio, sólo `nombre`, `bio` y `foto_url` (grants por columna). | La política no pasa por `es_el_profesional`: el profesional desactivado igual puede editarlos. |
| Storage `logos` | **Cada uno sube sólo su ruta** (`_es_mi_ruta_de_logos`, `20260928140000`): `comercios/<id>_` del local propio y `profesionales/<id>_` de **las filas propias**. | Leer, reescribir y borrar: sólo lo que subió cada uno (`owner_id`). El dueño **no** puede subir la foto de otro profesional, ni de uno sin cuenta. Las fotos se sirven por la URL pública. |
| Los límites del bucket | — | No están en las migraciones (`config.toml` es el local). Se miran en el paso 0. |

Como en las otras fases: **todo corre con la sesión de quien entra**, nunca con
la service role.

## Quién edita qué

| | El dueño | El profesional con cuenta |
|---|---|---|
| Nombre, categoría, localidad, dirección, Instagram del local | Sí | No lo ve (como la app) |
| La foto del local | Sí | No |
| Su propia foto y su nombre en el local | Sí, en Equipo | Sí, en "Mi perfil" (D7) |
| La foto y el nombre de un profesional sin cuenta | Sí, en Equipo (D6, con la migración) | No |
| La foto y el nombre de un profesional con cuenta | Sólo los ve (D2 de la fase 3) | Sólo los suyos |

El profesional bloqueado (cortado, fuera del equipo, sin cuentas del equipo) no
entra a "Mi perfil", como no entra a nada del panel (`leerLugarQueEntra`), aunque
la base lo dejaría.

## Lo que se reusa y lo que se suma en la web

**Se reusa:**

- **El alta del local** (`/planes`):
  - `leerCategorias`, `buscarLocalidades`, `sugerirDirecciones`,
    `resolverDireccion`, `normalizarInstagram` y `esInstagramValido`
    (`lib/alta.ts`), y los dos route handlers de `app/planes/alta/`.
  - **Para no copiar el formulario**, la pareja localidad + dirección de
    `AltaDeLocal` pasa a una pieza propia (`components/forms/LocalidadYDireccion.tsx`)
    que usan el alta y el perfil. Y el esquema zod de `crearLocal` (nombre,
    categoría, localidad, dirección, punto e Instagram) pasa a `lib/alta.ts`,
    para que el alta y el perfil validen lo mismo con el mismo código.
  - La dirección ya llega sin la ciudad: la limpia la Edge Function
    `autocompletar_direccion`, la misma que usa el alta web.
- **El panel:** `leerLocalDelDuenio` y `leerLugarQueEntra` (`lib/mi-local/lugar.ts`)
  para quién entra; `localParaActuar` y `lugarParaActuar`
  (`lib/mi-local/acciones.ts`) en las acciones; `errorDe`,
  `useAccionQueCierra`, `RespuestaDeAccion`, `Dialogo`, `Field`, `Avatar` y
  `Superficie`.
- **Equipo:** `loEditaElDuenio` y `profesionalQueEdita` ya dicen qué
  profesional edita el dueño; la foto va al lado de `DatosDelProfesional`, en la
  ficha de cada uno (`/mi-local/equipo/[id]`).
- **`next/image`** ya acepta el bucket `logos` (`next.config.ts`).

**Se suma:**

- **La sección "Perfil"** (D1), en `/mi-local/perfil`:
  - El dueño: arriba, **"Así te ven"**: la portada, el círculo, el nombre, la
    categoría y la dirección, como la ficha; con "Cambiar la foto". Abajo, el
    formulario: nombre, categoría, localidad y dirección, Instagram.
  - La dirección se ve como texto, con "Cambiar la dirección", que abre los dos
    buscadores. Como en la app, cambiar la localidad pide una dirección nueva.
  - El mail de la cuenta, de sólo lectura, como la app.
  - El profesional: "Mi perfil", con su nombre y su foto en ese local (D7).
- **El encuadre** (`components/mi-local/Encuadre.tsx`, cliente): la misma
  pantalla para el local (círculo y portada) y para un profesional (sólo el
  círculo). Ver D4 y D5.
- **La subida** (`lib/mi-local/fotos.ts`, `server-only`): una sola función que
  sube los recortes con los nombres de la app, guarda las URLs y borra las
  reemplazadas, con la regla de `borrarFotosReemplazadas` (sólo las del bucket).
  La usan las tres acciones: la foto del local, la de un profesional desde
  Equipo y la de "Mi perfil".
- **Las acciones:**
  - `app/mi-local/(panel)/perfil/acciones.ts`: `guardarPerfil`,
    `guardarFotoDelLocal` y `guardarMiPerfil`;
  - `app/mi-local/(panel)/equipo/acciones.ts`: `guardarFotoDelProfesional`.
- **La categoría** con la función nueva de BooKit (D3).
- `serverActions.bodySizeLimit` en `next.config.ts` (D5).
- **El copy**, en `content/mi-local.ts` (`perfil`, `miPerfil`, `encuadre`), con
  las frases de la app en voseo.

**La foto se guarda aparte del formulario:** al tocar "Listo" en el encuadre,
como un cambio propio. En la app va con el mismo "Guardar cambios", pero en la
web así el formulario de datos sigue andando sin JavaScript (como los
arreglados en #53) y la foto, que necesita el navegador para recortar, no lo
frena. Sin JavaScript no aparece "Cambiar la foto", y la dirección no se puede
cambiar (los buscadores son del navegador, igual que en el alta).

## Decisiones tuyas

**D1 · Dónde va el Perfil en el panel.**
- **(Recomendada) Una sección más, "Perfil", al final de la barra**, para el
  dueño (el del local) y para el profesional (el suyo).
  - Es la cuarta pestaña de la app, para los dos.
  - Costo: el dueño pasa a cinco pestañas en el teléfono (a 375 px entran, a
    75 px cada una). Con Crecimiento, en la fase que sigue, no entra una sexta:
    ahí habrá que agrupar (por ejemplo Horarios, Servicios y Equipo en
    "Gestión", como la app).
- **Un enlace desde el local de arriba del marco** (el logo y el nombre) y
  desde el menú, al lado de "Tu plan", sin pestaña nueva.
  - El teléfono queda con cuatro.
  - Pero queda escondido, en algo que la app tiene a la vista.

**D2 · Qué entra del Perfil de la app.**
- **(Recomendada) Sólo "Editar datos del negocio": lo que ve el cliente.** Los
  datos, la foto y la categoría (D3).
  - Lo demás queda en la app: vincular Mercado Pago, "Si el cliente cancela",
    los avisos, compartir la disponibilidad y eliminar la cuenta.
  - Costo: el dueño que quiere cobrar por Mercado Pago lo sigue conectando
    desde el teléfono.
- **Sumar "Si el cliente cancela".** Es un `update` de `cancelacion_horas` y
  cinco opciones. Pero sólo sirve con Mercado Pago vinculado, que sigue en la
  app.
- **Sumar también vincular Mercado Pago.** Desde la compu es más cómodo, pero
  `mp_oauth_callback` vuelve a `somosbookit.com.ar` y no al panel: es un cambio
  en BooKit, y es otra pantalla (vinculada, caída, el plan que no la incluye).

**D3 · La categoría.** La app no la deja cambiar, y vive en dos lugares.
- **(Recomendada) Se edita, con una función de BooKit,
  `cambiar_categoria_de_mi_local(p_id_categoria)`,** que cambia las dos en una
  transacción, en la misma migración que la de las fotos (D6).
  - Un local que eligió mal en el alta hoy no tiene cómo arreglarlo.
  - La regla queda en SQL, y la app la puede usar cuando la sume.
  - Costo: una función más en la migración, y la web hace algo que la app no.
- **Como la app: se muestra y no se edita.** Sin nada en la base, pero el local
  que eligió mal sigue igual.
- **Las dos escrituras desde la web**, sin función. No va: no es atómico, y la
  regla de "la categoría está en dos lados" quedaría escrita en TypeScript.

**D4 · El encuadre de la foto del local.**
- **(Recomendada) Como la app: una foto, dos encuadres** (círculo y portada),
  acomodados a mano arrastrando y con un control de zoom, con las dos vistas a
  la vista. Se suben dos JPEG: 720 × 720 y 1440 × 720, calidad 85.
  - Lo que sube la web es igual a lo que sube la app.
  - Costo: es la pieza más grande de la fase. La hago a mano con un `canvas`,
    sin librería (son dos rectángulos, un arrastre y un zoom).
- **Un solo recorte, el círculo, y la portada vacía** (`banner_url = null`). La
  ficha cae al logo, como antes de la portada. Es la mitad de pantalla, pero el
  cuadrado metido en la banda pierde arriba y abajo.
- **Los dos recortes centrados, sin acomodar.** Sin pantalla de encuadre, pero
  un logo o una cara corridos del centro quedan cortados.

**D5 · Cómo sube la web.**
- **(Recomendada) El navegador recorta y una server action sube** con la sesión
  de la persona (`clienteDeSupabase("local")`), con los nombres de archivo de la
  app, guarda las URLs y borra las anteriores.
  - Todo lo que escribe queda en el servidor, en `lib/mi-local/fotos.ts`, como
    las demás acciones del panel.
  - La foto original (puede ser de 10 MB) no viaja: viajan los recortes, unos
    cientos de KB.
  - Costo: subir `serverActions.bodySizeLimit` de 1 MB a 2 MB en
    `next.config.ts` (la doc de Next 16 lo pide para multipart).
- **El navegador sube directo al bucket** con un cliente de Supabase, como el
  de `EnVivo`.
  - No pasa por Vercel.
  - Pero los nombres de archivo, la escritura de las URLs y el borrado quedarían
    en el navegador, y la escritura en dos lugares.

**D6 · Las fotos del equipo: de quién sube el dueño.** Hoy la base sólo le deja
la suya.
- **(Recomendada) La suya y la de los profesionales sin cuenta de su local**,
  lo mismo que ya edita de nombre (D2 de la fase 3).
  - La migración de BooKit suma a `_es_mi_ruta_de_logos` la ruta
    `profesionales/<id>_` de los profesionales **sin cuenta** del local del que
    es dueño.
  - Los que tienen cuenta ponen la suya (D7).
  - Costo: una migración (la misma de D3).
- **También la de los que tienen cuenta.** Es la regla de la tabla
  (`gestiona_profesional`), pero el dueño podría pisar la foto que eligió
  alguien que maneja su perfil.
- **Sin migración: sólo la suya.** El profesional sin cuenta sigue con
  iniciales.

**D7 · El perfil del profesional del equipo.**
- **(Recomendada) "Mi perfil", con su nombre y su foto en ese local**, como
  "Información profesional" de la app. Era lo que dejó pendiente el plan del
  equipo (D2).
  - Su foto pasa por el mismo encuadre, sólo el círculo: la app la sube sin
    recortar, la web la sube cuadrada.
  - La presentación no va: la app no se la deja editar al profesional y la
    ficha del cliente no la muestra.
- **Sigue en la app.** Una sección menos, pero el profesional que usa la web
  tiene que ir al teléfono para su foto.

**D8 · La dirección, sin el pin del mapa.** La app confirma el punto en un mapa;
el alta de la web no, y usa el punto que da Google.
- **(Recomendada) Como el alta de la web: el punto de Google, sin mapa.**
  - Es lo mismo que ya tienen los locales que se dieron de alta por la web.
  - Costo: un punto que Google ubica mal no se corrige desde la compu; se
    corrige desde la app.
- **Sumar el mapa para mover el pin.** Es lo correcto a la larga, pero suma la
  API de mapas de Google en el navegador (otra clave y otro costo) y una pieza
  que el alta también debería usar.

## El cambio en BooKit

Si D3 y D6 salen como las recomendadas, hace falta **una migración**. No cambia
la app. Prompt para pasarle al chat que tiene el repo de BooKit:

> En BooKit (`develop`), una migración nueva para el panel web del local
> (`bookit-landing`, fase 4: el Perfil). Dos cosas, en el mismo archivo:
>
> 1. **`cambiar_categoria_de_mi_local(p_id_categoria integer) returns void`.**
>    La categoría de un local vive en dos lugares, `comercios.id_categoria` y
>    `comercios_categorias`, y `buscar_comercios_cercanos_por_categoria` mira
>    las dos. Hoy sólo las escribe `_alta_del_comercio`. La función:
>    - busca el local del que la sesión es dueña (`comercios.auth_user_id =
>      auth.uid()`); sin local, error `42501`;
>    - rechaza una categoría que no existe en `categorias`, con un mensaje para
>      personas ("Esa categoría no existe.") y un `hint`;
>    - en una transacción: `update comercios set id_categoria`, y deja en
>      `comercios_categorias` sólo esa fila para ese local (como el alta);
>    - `security invoker` si alcanza con los permisos del dueño (tiene `update`
>      sobre `id_categoria` y la política "las maneja el dueño"); si no,
>      `definer` con `search_path` fijo. `revoke` de `public` y `anon`,
>      `grant` a `authenticated`.
> 2. **`_es_mi_ruta_de_logos(p_nombre)`** (de `20260928140000`) suma un caso:
>    `profesionales/<id_profesional>_` de un profesional **sin cuenta**
>    (`auth_user_id is null`) de un local del que la sesión es dueña. El resto
>    queda igual: el dueño sigue sin poder subir la foto de un profesional con
>    cuenta, y nadie sube a la ruta de otro local.
>
> Probalo en un Postgres suelto, como `huecos_del_dia` (#84):
> - la función con el dueño, con alguien sin local, con una categoría que no
>   existe; y que la búsqueda por categoría encuentre el local en la nueva y no
>   en la vieja;
> - la ruta de logos para: el local propio, la ficha propia, un sin cuenta del
>   local propio (sí), uno con cuenta del local propio (no), uno de otro local
>   (no), y el profesional con cuenta en su propia ficha (sí, como hoy).
>
> PR a `develop`. **No la apliques en la base** hasta que Fermín diga.
> Actualizá `docs/schema-tablas.md` si nombra las políticas de Storage o la
> categoría.

## Orden de trabajo

Una rama `mi-local/perfil` y **un PR** a `main`, más el de BooKit.

0. **Lecturas en la base, con tu OK** (`supabase db query --linked`, desde el
   checkout de BooKit, como en la fase 3):
   - los límites del bucket `logos` (`storage.buckets`: `public`,
     `file_size_limit`, `allowed_mime_types`);
   - que `_es_mi_ruta_de_logos` en la base sea la de la migración;
   - los grants por columna de `comercios` para `authenticated` (que
     `nombre`, `direccion`, `localidad_id`, `ubicacion`, `instagram`,
     `logo_url` y `banner_url` se puedan escribir);
   - los `CHECK` de `comercios`;
   - si hay locales con más de una fila en `comercios_categorias`, o con una
     distinta de `id_categoria`. Si hay, te pregunto antes de que la función
     las pise.
1. **BooKit:** le pasás el prompt de arriba. La migración se aplica con tu OK.
   Mientras tanto la web sigue con 2 y 3, que no la necesitan.
2. **Los datos del local:** la sección (D1), la página, "Así te ven", el
   formulario y `guardarPerfil`. Antes, en un commit aparte, la pieza de
   localidad y dirección y el esquema zod salen del alta, y `/planes` los usa
   igual.
3. **La foto del local:** el encuadre, `lib/mi-local/fotos.ts` y
   `guardarFotoDelLocal`.
4. **Con la migración aplicada:** la categoría, la foto en la ficha de cada
   profesional en Equipo y "Mi perfil" del profesional.
5. **La prueba** (abajo). Te paso las pantallas y **PR**.

## Cómo se prueba

En el preview, contra la base, con Barbería Nogal, dejando todo como estaba.

**Antes de tocar nada** anoto los datos de Nogal (nombre, categoría, localidad,
dirección, punto, Instagram, las dos URLs de la foto) y bajo las dos fotos, para
volver a subirlas al final con la misma pantalla. **El borrado de la foto
reemplazada es de verdad**: sin esa copia, la foto de Nogal se pierde.

**El dueño**
- Cambia el nombre y el Instagram (con `@`, con el link del perfil, vacío): la
  app abierta en el teléfono muestra lo mismo, y el marco del panel cambia el
  nombre.
- Cambia la dirección dentro de la localidad, y la localidad (que pide una
  dirección nueva). Si el punto de vuelta no queda igual al original, te lo paso
  para que lo acomodes desde la app, que tiene el mapa.
- Cambia la categoría: en la app, la búsqueda por la nueva lo encuentra y por la
  vieja no.
- Sube una foto, acomoda el círculo y la portada, y la ficha del cliente en la
  app las muestra. En el bucket no quedan las anteriores.
- Una foto vertical, una apaisada, un PNG y una que el navegador no abre (un
  HEIC en Chrome): el mensaje.
- En Equipo, la foto propia y la de "Prueba web (borrar)", el sin cuenta que
  quedó pausado en Nogal. La de un profesional con cuenta no se ofrece.

**El profesional**
- Con la cuenta del equipo de Fermín, activada un rato en Nogal: "Mi perfil",
  cambia su nombre y su foto; el dueño los ve en Equipo, y la app también.
- No ve el Perfil del local, y su URL lo manda a la agenda.
- En Barbería Peña (cortada), "Mi perfil" no se abre.

**Siempre**
- 375 px y 1280 px, claro y oscuro, sin scroll de costado.
- El formulario de datos sin JavaScript.
- `npm run typecheck` y `npm run build`.

Si algún caso no se puede armar, se dice.

## Lo que vi y no toca este plan

- **`comercios.acepta_efectivo` no lo edita nadie.** La ficha dice "Efectivo ·
  Podés pagar en el local" para todos (vale `true` por defecto). Si algún local
  no acepta efectivo, no tiene cómo decirlo. Es de la app, o de una fase de
  cobros.
- **La categoría en dos lugares** (`comercios.id_categoria` y
  `comercios_categorias`). La función de D3 las mantiene juntas, pero son dos
  fuentes para lo mismo. Unificarlas es una tarea de BooKit aparte.
- **La foto del profesional en la app se sube sin recortar,** con la extensión
  que venga y `upsert: true`. En una ficha redonda, una foto apaisada se ve
  como la recorte el `BoxFit`.
- **Un profesional sin cuenta que después acepta una invitación** se queda con
  la misma fila (`aceptar_invitacion_equipo` la vincula por el mail). La foto
  que le subió el dueño es del dueño en el bucket (`owner_id`): cuando él la
  cambie, la vieja no se va a poder borrar y queda suelta.
- **`mp_oauth_callback` vuelve a la home** (`somosbookit.com.ar`) después de
  vincular Mercado Pago. Si algún día la vinculación va a la web (D2), hay que
  cambiar eso.
- **La hoja de ruta** (`docs/PLAN-MI-LOCAL.md`) se actualiza al aprobar este
  plan: la fila 4 se parte en Perfil (esta fase) y Crecimiento. No la toco
  ahora porque la está editando la otra conversación ("Otra hora").
