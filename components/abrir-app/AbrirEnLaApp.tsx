import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";
import TextLink from "@/components/ui/TextLink";
import { invite } from "@/content/paginas";

type Props = {
  title: string;
  desc: string;
  cta: string;
  /** El enlace al esquema de la app, o `null` si el enlace llegó incompleto. */
  abrirApp: string | null;
};

/**
 * La página de un universal link de los mails de la app, para quien la ve en
 * vez de la app: en la compu, sin Bookit o en un navegador que no salta a la
 * app (el de Gmail). El botón le pasa lo mismo a la app por su esquema.
 */
export default function AbrirEnLaApp({ title, desc, cta, abrirApp }: Props) {
  return (
    <Section
      id="abrir-app"
      as="h1"
      title={title}
      lede={desc}
      actions={abrirApp ? <Button href={abrirApp}>{cta}</Button> : undefined}
    >
      <p className="mx-auto max-w-[28rem] text-center text-small text-muted">
        {invite.ayuda.pregunta}{" "}
        <TextLink href={invite.ayuda.link.href}>{invite.ayuda.link.label}</TextLink>
      </p>
    </Section>
  );
}
