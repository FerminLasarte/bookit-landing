import Screen from "@/components/ui/Screen";
import Section from "@/components/ui/Section";
import { comoFunciona } from "@/content/home";
import Cronometro from "./Cronometro";

export default function ComoFunciona() {
  const { pasos } = comoFunciona;

  return (
    <Section id="como-funciona" title={comoFunciona.title} lede={comoFunciona.lede}>
      <Cronometro
        pasos={pasos.map(({ title, body }) => ({ title, body }))}
        pantallas={pasos.map((paso) => (
          <Screen key={paso.captura} id={paso.captura} crop={paso.crop} sizes="(min-width: 768px) 17rem, 55vw" />
        ))}
        segundos={comoFunciona.segundos}
      />
    </Section>
  );
}
