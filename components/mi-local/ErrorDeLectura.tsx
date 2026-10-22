import Superficie from "@/components/ui/Superficie";

/** Lo que no se pudo leer se dice, en el lugar de lo que iba: nunca una lista vacía que parezca real (el B1-11 de la app). */
export default function ErrorDeLectura({ children }: { children: string }) {
  return (
    <Superficie tone="surface" className="p-6">
      <p role="alert" className="text-small font-medium text-danger">
        {children}
      </p>
    </Superficie>
  );
}
