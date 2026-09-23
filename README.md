# Bookit — Landing

Landing y lista de espera de [Bookit](https://somosbookit.com.ar), la app de turnos para
barberías, peluquerías, uñas, estética y más en Tandil, Buenos Aires.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- [Supabase](https://supabase.com) — persistencia de la lista de espera
- [Resend](https://resend.com) — mail transaccional de bienvenida
- Zod — validación del formulario de lista de espera
- `motion` — animaciones

> Este repo usa una versión de Next.js con cambios de breaking respecto a versiones anteriores.
> Antes de tocar código, revisar la guía correspondiente en `node_modules/next/dist/docs/`.

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completar con los valores reales
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Variables de entorno

Ver [`.env.example`](.env.example) para el detalle. Resumen:

| Variable | Uso |
|---|---|
| `SUPABASE_URL` | URL del proyecto de Supabase |
| `SUPABASE_SERVICE_ROLE` | Service role key, server-only, para insertar en `waitlist_leads` |
| `SUPABASE_ANON_KEY` | Fallback si no hay service role configurado |
| `RESEND_API_KEY` | Envío del mail de bienvenida a la lista de espera |

En producción (Vercel) estas variables se configuran en el dashboard del proyecto, no desde un
archivo — `.env.local` es solo para desarrollo local y nunca se commitea.

## Scripts

```bash
npm run dev        # servidor de desarrollo
npm run build       # build de producción
npm run start       # sirve el build de producción
npm run typecheck   # chequeo de tipos sin emitir
```

## Estructura

```
app/
  page.tsx                 Home
  lista-espera/             Lista de espera (VIP)
  descargar/                 CTA de descarga (App Store / Play, cuando estén disponibles)
  soporte/                    Soporte
  invite/[[...slug]]/       Invitaciones personales (noindex deliberado)
  legal/                      Términos, privacidad, cookies, eliminación de cuenta,
                               botón de arrepentimiento
  api/waitlist/               Endpoint de alta a la lista de espera (POST)
  og/invite/                  OG dinámica para invitaciones
  opengraph-image.tsx         OG de la home, generada con next/og
content/                     Datos y copy: site.ts (fuente única de contacto/URLs), legal.ts, faq.ts...
lib/                          Validación, rate limiting, templates de email
docs/                         LANDING_BRIEF.md (brief original), MARCA.md, DISENO.md (contrato del diseño v4) y archivo/ (historia de la v3)
```

`docs/archivo/DECISIONES.md` documenta qué quedó pendiente de definición humana (razón social/CUIT,
teléfono real, pagos in-app, revisión legal) y por qué el sitio se apartó del brief en ciertos
puntos.

## Licencia

Código propietario — ver [`LICENSE`](LICENSE).
