import Button from "@/components/Button";
import Eyebrow from "@/components/Eyebrow";
import Hairline from "@/components/Hairline";

export default function NotFound() {
  return (
    <div className="py-24 md:py-36">
      <div className="wrap">
        <div className="max-w-[46ch]">
          <Eyebrow>Error 404</Eyebrow>
          <h1 className="mt-6 text-display-lg font-semibold text-ink-900 dark:text-bone-100">
            Esta página no existe.
          </h1>
          <p className="mt-6 text-ink-500 dark:text-bone-300">
            Puede que el link esté mal escrito o que la hayamos movido. Volvé al inicio y seguí
            desde ahí.
          </p>
          <Hairline className="mt-10" />
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button text="Ir al inicio" href="/" />
            <Button text="Necesito ayuda" href="/soporte" variant="secondary" />
          </div>
        </div>
      </div>
    </div>
  );
}
