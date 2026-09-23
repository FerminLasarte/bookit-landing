import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";
import { noEncontrada } from "@/content/paginas";

export default function NotFound() {
  return (
    <Section
      id="no-encontrada"
      as="h1"
      title={noEncontrada.title}
      lede={noEncontrada.lede}
      actions={
        <>
          <Button href={noEncontrada.inicio.href}>{noEncontrada.inicio.label}</Button>
          <Button href={noEncontrada.ayuda.href} variant="secondary">
            {noEncontrada.ayuda.label}
          </Button>
        </>
      }
    />
  );
}
