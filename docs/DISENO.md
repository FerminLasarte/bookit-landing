# Diseño v4 — contrato

Rediseño integral de la web, desde los tokens hasta el footer. Manda
[`MARCA.md`](MARCA.md); este documento dice cómo se compone el sitio con esa
marca. Lo que pasó antes está en [`archivo/`](archivo/) y es historia, no
normativa.

## La referencia

**[idle.space](https://idle.space).** Se toma su gramática, no su paleta:

- **Una idea por pantalla.** Cada sección abre con un título grande centrado y
  una bajada de dos renglones, y después muestra *una* cosa.
- **El producto hace de ilustración.** Las capturas reales de la app flotan
  dentro de *tiles*: cards de 24 px con un fondo plano y sombra suave.
- **El límite es aire.** Entre secciones no hay bandas, tintes, filetes ni
  degradados. Hay espacio.
- **El nav es un objeto.** Una píldora flotante con el logo, los links al
  centro y la acción a la derecha.

Lo que **no** se toma: los colores saturados de fondo, el negro como CTA y el
tono de broma. El único acento sigue siendo el ámbar. El color fuerte lo ponen
las capturas.

## Reglas

1. **Ningún degradado resuelve un límite.** Ni para separar secciones ni para
   fundir una imagen con la página.
2. **Nada de cards negras.** El peso lo da la escala tipográfica, no un bloque
   oscuro.
3. **Una cosa a la vez.** Una sección, una idea, una composición. Si una
   sección necesita dos ideas, son dos secciones.
4. **Cada sección es única.** Ninguna composición se repite en la home. Lo que
   se repite es el kit.
5. **Nada se escribe dos veces.** Si una combinación de clases o un bloque
   aparece en un segundo lugar, pasa al kit antes de usarse ahí.

## Tokens

Viven en [`app/globals.css`](../app/globals.css) en dos capas:

- **Paleta.** Los valores de marca de `MARCA.md` (`amber-500`, `ink-900`,
  `cream-50`…). No se usan directo en los componentes.
- **Semánticos.** Dicen para qué es el color y cambian solos con el tema. Un
  componente nunca escribe `dark:` para un color.

| Token | Uso | Claro | Oscuro |
|---|---|---|---|
| `page` | fondo del sitio | `cream-50` | `ink-950` |
| `surface` | nav, campos, lo que se toma | `paper` | `ink-800` |
| `fg` | texto principal | `ink-900` | `bone-100` |
| `muted` | bajadas, texto secundario | `ink-500` | `bone-300` |
| `line` | filetes y bordes | `ink-900` 10 % | blanco 10 % |
| `accent` | relleno del CTA, lo elegido | `amber-500` | `amber-500` |
| `accent-fg` | texto y foco en ámbar | `amber-700` | `amber-300` |
| `danger` | el error de un campo | `error` | `error-dark` |
| `tile-*` | fondo de un tile | ver `globals.css` | ver `globals.css` |

**Tipografía:** `display` para `h1` y `h2` (el mismo tamaño en todas las
secciones, como en la referencia), `title` para `h3`, y después `body`, `small`
y `micro`. `numeral` es para el número protagonista de una pieza.

**Forma:** los cuatro radios de `MARCA.md`. `shadow-tile` para los tiles y
`shadow-float` para lo que flota (nav, toast).

## El kit

Todo lo compartido vive en `components/ui/`. Una sección no define estilos que
otra podría necesitar.

| Pieza | Qué es |
|---|---|
| `Button` | Píldora. `primary` (ámbar, tinta encima) y `secondary` (tinta llena). |
| `TextLink` | El único link de texto del sitio. Resuelve interno, externo y la flecha. |
| `Badge` | Etiqueta chica en píldora: "Pronto", "Ejemplo". |
| `Section` | Aire vertical, `wrap` y el encabezado. Toda sección de contenido pasa por acá. Con `as="h1"` es el encabezado de una página. |
| `SectionHeader` | Título `display` + bajada `muted` + botones, centrado. |
| `Superficie` | La card: 24 px y un fondo plano. Los tonos de tile llevan sombra; `surface`, lo que se toma, lleva borde. |
| `Tile` | Card de 24 px con fondo plano, sombra y un medio adentro; título y bajada abajo. |
| `Screen` | Una captura de la app dentro de un marco, con su versión clara y oscura. |
| `Reveal` | Aparición al entrar en pantalla (sube 16 px, 560 ms). |
| `Plegable` | Un bloque que se abre creciendo y se cierra encogiendo. Cerrado queda `inert`. |
| `Resaltado` | El fondo que se desliza entre los ítems de una lista (`layoutId`). |
| `Herramienta` | Tijera, peine, secador, esmalte, navaja o brocha: el cursor y el splash. |

Las capturas se importan una sola vez, en
[`content/capturas.ts`](../content/capturas.ts), con su texto alternativo.

## Movimiento

La base es [`motion`](https://motion.dev), montado una vez en
`layout/Movimiento`: `MotionConfig reducedMotion="user"` apaga las
transformaciones cuando el sistema pide Reducir movimiento, y `LazyMotion`
carga el motor después de hidratar (se usa `m.*`, nunca `motion.*`).

- **Lo que CSS resuelve, lo resuelve CSS:** reveals, `Plegable`, hovers y el
  splash. Lo que depende del scroll, del puntero o de
  una presencia (algo que entra y sale) va con `motion`.
- **Los valores no se escriben en el componente.** CSS lee los tokens de
  `globals.css`; `motion` lee `lib/movimiento.ts`, que los espeja y suma los
  resortes.
- **Con Reducir movimiento** el rubro del hero no gira, el splash no aparece,
  el imán y la inclinación se apagan, y lo demás llega sin desplazarse.
- **El puntero** (cursor propio, imán, inclinación del hero, vista previa de las
  pestañas) sólo existe con mouse: `PUNTERO_FINO`.

| Pieza | Dónde |
|---|---|
| Splash del tijeretazo, una vez por visita | `layout/Splash` + utilidad `splash` |
| Cursor: una herramienta por sección | `layout/Cursor` + `content/cursor.ts` |
| Botones magnéticos | `lib/useMagnetismo`, con resortes de `motion` |
| El nav se compacta al scrollear | `layout/Nav` |

## Estructura

```
components/
  ui/        el kit
  layout/    Nav, Footer
  home/      una pieza por sección de la home
  forms/     Field, AudienceSwitch, WaitlistForm
  legal/     LegalDoc: los cinco documentos de /legal
  invite/    ReferralCode: el código para copiar
content/     copy y datos: ningún texto de producto vive en un componente
```

## La home

| # | Sección | Idea | Composición |
|---|---|---|---|
| 1 | Hero | Tu próximo turno, del rubro que sea | Título con el rubro que rota; la app en un marco con dos capturas giradas detrás |
| 2 | Cómo funciona | Reservar lleva treinta segundos | Tres teléfonos en escalera sobre un reloj que corre con el scroll |
| 3 | Para locales | La agenda del local, resuelta | Selector de pantallas que cambia un tile grande |
| 4 | Puntos y referidos | Cada turno devuelve algo | El número 500 a escala de fondo y el link de invitación |
| 5 | Testimonios | Lo que dicen los primeros | Bento de citas. Datos de prueba, apagados en producción |
| 6 | Preguntas | Lo que suelen preguntar | Acordeón centrado |
| 7 | Cierre | Anotate antes de que abra | Las dos puertas, cliente y local, sobre la cascada de capturas |

## Las rutas secundarias

Todas abren con `Section as="h1"`: el mismo encabezado centrado que el hero,
sin `Reveal`. Lo que se toma va en `Superficie tone="surface"`.

| Ruta | Composición |
|---|---|
| `/lista-espera` | Formulario en una superficie; cómo sigue en tres pasos; la letra chica |
| `/soporte` | Los tres canales como superficies enlazadas; tiempos y borrado de datos |
| `/descargar` | Encabezado con el CTA y un tile con la pantalla de bienvenida |
| `/invite` | El código para copiar y el CTA; el copy no dice "Descargá" sin tiendas |
| `/legal/*` | Una columna de lectura, con el índice fijo al costado desde `lg` |
| 404 | Encabezado con los dos botones |

## Flujo de trabajo

Rama de integración `diseno/v4`, un commit por sección. `main` no cambia hasta
cerrar la fase 9. Cada sección se revisa en pantalla antes de pasar a la
siguiente.

| Fase | Alcance |
|---|---|
| 0 | Contrato, tokens, kit, registro de capturas |
| 1 | Nav y hero |
| 2–7 | Una sección por fase, en el orden de la tabla de arriba (cierre + footer en la 7) |
| 8 | Rutas secundarias: lista de espera, soporte, descargar, invitación, legales, 404 |
| 9 | Pre-flight completo y borrado de todo lo que la v3 dejó sin uso |
