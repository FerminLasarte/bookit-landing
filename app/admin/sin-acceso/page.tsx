import type { Metadata } from "next";
import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";

export const metadata: Metadata = { title: "Sin acceso" };

/** Llega acá con la sesión ya cerrada (`app/admin/auth/sin-acceso`). */
export default function SinAcceso() {
  return (
    <Section
      id="sin-acceso"
      as="h1"
      title="Esta cuenta no es del equipo"
      lede="Entraste con una cuenta que no tiene acceso al panel, así que cerramos la sesión. Probá con la de Bookit."
      actions={<Button href="/admin/entrar">Entrar con otra cuenta</Button>}
    />
  );
}
