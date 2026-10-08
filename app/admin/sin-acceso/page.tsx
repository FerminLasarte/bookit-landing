import type { Metadata } from "next";
import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";

export const metadata: Metadata = { title: "Sin acceso" };

export default function SinAcceso() {
  return (
    <Section
      id="sin-acceso"
      as="h1"
      title="Esta cuenta no es del equipo"
      lede="Entraste con una cuenta que no tiene acceso al panel. Salí y probá con la de Bookit."
      actions={
        <form action="/admin/auth/salir" method="post">
          <Button type="submit">Salir</Button>
        </form>
      }
    />
  );
}
