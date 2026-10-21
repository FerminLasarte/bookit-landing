import type { ReactNode } from "react";

/** Sale de la sesión del dueño y vuelve a entrar a /mi-local. */
export default function Salir({ children }: { children: ReactNode }) {
  return (
    <form action="/planes/auth/salir" method="post">
      <input type="hidden" name="destino" value="/mi-local" />
      <button type="submit" className="ring-focus text-small text-muted hover:text-fg">
        {children}
      </button>
    </form>
  );
}
