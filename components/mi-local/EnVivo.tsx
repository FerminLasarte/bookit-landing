"use client";

import { createBrowserClient, type CookieOptionsWithName } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Mantiene la agenda al día sin recargar: escucha los turnos del local por
 * Realtime y, ante cualquier cambio, vuelve a pedir la página. La lista se lee
 * siempre en el servidor; acá no se guarda ningún turno.
 *
 * Realtime no guarda lo que pasó con el canal caído (BooKit,
 * `canal_de_agenda.dart`): cuando el canal vuelve, o la pestaña vuelve a
 * verse, se recarga igual. No dibuja nada.
 */
export default function EnVivo({
  idComercio,
  url,
  anon,
  cookies,
}: {
  idComercio: string;
  url: string;
  anon: string;
  cookies: CookieOptionsWithName | undefined;
}) {
  const router = useRouter();
  // Cada `router.refresh()` trae un objeto nuevo: el canal depende de lo que dice, no de cuál es.
  const cookie = cookies && JSON.stringify(cookies);

  useEffect(() => {
    // La sesión del dueño sale de su cookie: Realtime filtra con la misma política de `turnos`.
    const supabase = createBrowserClient(url, anon, { cookieOptions: cookie ? JSON.parse(cookie) : undefined });
    let yaSuscripto = false;

    const canal = supabase
      .channel(`agenda-${idComercio}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "turnos", filter: `id_comercio=eq.${idComercio}` },
        () => router.refresh(),
      )
      .subscribe((estado) => {
        if (estado !== "SUBSCRIBED") return;
        if (yaSuscripto) router.refresh();
        yaSuscripto = true;
      });

    const alVolver = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    document.addEventListener("visibilitychange", alVolver);

    return () => {
      document.removeEventListener("visibilitychange", alVolver);
      void supabase.removeChannel(canal);
    };
  }, [idComercio, url, anon, cookie, router]);

  return null;
}
