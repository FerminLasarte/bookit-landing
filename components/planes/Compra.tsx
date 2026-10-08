"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { cancelar, comprar } from "@/app/planes/acciones";
import Button from "@/components/ui/Button";
import { planes, sufijoDeCiclo, type CodigoDeError } from "@/content/planes";
import { diaYMes, pesos } from "@/lib/formato";
import type { Frecuencia, Nivel, TarjetaDePlan } from "@/lib/planes";
import { cn } from "@/lib/utils";
import CarruselDePlanes from "./CarruselDePlanes";
import Encabezado from "./Encabezado";
import PieDelPaywall, { enlaceDelPie, legalesDelPie } from "./PieDelPaywall";
import RegaloDePrueba from "./RegaloDePrueba";
import SelectorDeFrecuencia from "./SelectorDeFrecuencia";

/*
 * El paywall del dueño con sesión. Todo lo que muestra —precio, prueba,
 * cuándo cobra, cuál es su plan— sale de `mi_plan_web()`; acá sólo se elige.
 *
 * Al pagar se va a Mercado Pago en la misma pestaña, y Mercado Pago vuelve a
 * /planes. Lo que eligió queda en `sessionStorage` para saber, a la vuelta,
 * qué esperar: los parámetros que agrega Mercado Pago no se creen. El débito
 * lo confirma el aviso de Mercado Pago al servidor, así que se vuelve a leer
 * la página cada 3 s hasta 60 s (contrato §5).
 */

type Eleccion = { nivel: Nivel; plan: Frecuencia };
type Pedido = Eleccion & { prueba: boolean; en: number };

const PEDIDO = "bookit:planes:pedido";
/** Lo justo para no mandar un mail a medio escribir: el que valida es el servidor. */
const MAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Un pedido más viejo que esto ya no es una vuelta de Mercado Pago. */
const VIGENCIA_DEL_PEDIDO = 30 * 60_000;

function leerPedido(): Pedido | null {
  try {
    const pedido = JSON.parse(sessionStorage.getItem(PEDIDO) ?? "null") as Pedido | null;
    return pedido && Date.now() - pedido.en < VIGENCIA_DEL_PEDIDO ? pedido : null;
  } catch {
    return null;
  }
}

function olvidarPedido() {
  try {
    sessionStorage.removeItem(PEDIDO);
  } catch {
    // Sin storage no hubo pedido que olvidar.
  }
}

function mensajeDeError(codigo: CodigoDeError, vence: string | null): string {
  if (codigo === "tienda_vigente") return planes.errores.tienda_vigente(diaYMes(vence));
  return planes.errores[codigo];
}

/** Lo que se cobra y cómo se corta, al lado del botón (Términos §7). */
function letraChica(tarjeta: TarjetaDePlan, pruebaDias: number, cambia: boolean): string {
  const copy = planes.letraChica;
  if (tarjeta.esElActual) return copy.renueva(tarjeta.plan);
  const cobro = `${pesos(tarjeta.precio)} ${sufijoDeCiclo[tarjeta.plan]}`;
  return [
    pruebaDias > 0 && !cambia ? copy.prueba(pruebaDias) : "",
    tarjeta.primerCobro ? copy.primerCobro(diaYMes(tarjeta.primerCobro), cobro) : copy.hoy(pesos(tarjeta.precio)),
    cambia ? copy.cambio : copy.renueva(tarjeta.plan),
  ].join("");
}

export default function Compra({
  encabezado,
  tarjetas,
  inicial,
  pruebaDias,
  email,
  suscripcion,
  baja,
}: {
  encabezado: { titulo: string; bajada: string; avisos: string[] };
  tarjetas: Record<Frecuencia, TarjetaDePlan[]>;
  inicial: Eleccion;
  pruebaDias: number;
  /** El mail de la sesión: el de Mercado Pago, salvo que lo cambie. */
  email: string | null;
  suscripcion: { estado: string; plan: string | null; debito: Eleccion | null };
  /** Si puede dar de baja, hasta cuándo sigue su plan. */
  baja: { vence: string } | null;
}) {
  const router = useRouter();
  const [plan, setPlan] = useState<Frecuencia>(inicial.plan);
  const [nivel, setNivel] = useState<Nivel>(inicial.nivel);
  const [error, setError] = useState<string | null>(null);
  const [yendo, setYendo] = useState(false);
  const [pagando, empezarPago] = useTransition();
  const [fase, setFase] = useState<"eligiendo" | "confirmando" | "demora">("eligiendo");
  const [confirmado, setConfirmado] = useState(false);

  const cambia = suscripcion.debito !== null;
  const conPrueba = pruebaDias > 0 && !cambia;
  const elegida = tarjetas[plan].find((t) => t.nivel === nivel) ?? tarjetas[plan][0];

  // ── La vuelta de Mercado Pago ──

  const listo = (pedido: Pedido) =>
    suscripcion.debito?.nivel === pedido.nivel &&
    suscripcion.debito.plan === pedido.plan &&
    (!pedido.prueba || suscripcion.estado === "al_dia");

  // Al montar: si hay un pedido, o ya está, o hay que esperar el aviso.
  useEffect(() => {
    const pedido = leerPedido();
    if (!pedido) return;
    if (listo(pedido)) {
      olvidarPedido();
      setConfirmado(true);
    } else {
      setFase("confirmando");
    }
    // Sólo a la vuelta: después manda cada lectura.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cada lectura nueva de `mi_plan_web()` puede ser la confirmación.
  useEffect(() => {
    if (fase === "eligiendo") return;
    const pedido = leerPedido();
    if (pedido && listo(pedido)) {
      olvidarPedido();
      setFase("eligiendo");
      setConfirmado(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suscripcion, fase]);

  useEffect(() => {
    if (fase !== "confirmando") return;
    const releer = window.setInterval(() => router.refresh(), 3_000);
    const rendirse = window.setTimeout(() => setFase("demora"), 60_000);
    return () => {
      window.clearInterval(releer);
      window.clearTimeout(rendirse);
    };
  }, [fase, router]);

  // ── El mail de Mercado Pago ──

  const esRelay = email?.endsWith("@privaterelay.appleid.com") ?? false;
  const [mailMp, setMailMp] = useState(esRelay ? "" : (email ?? ""));
  const [editandoMail, setEditandoMail] = useState(esRelay || !email);

  // ── Pagar y cancelar ──

  const atenderError = (codigo: CodigoDeError, vence: string | null) => {
    if (codigo === "sin_sesion") {
      window.location.assign("/planes?error=sesion");
      return;
    }
    setError(mensajeDeError(codigo, vence));
    // Lo que cambió del lado del servidor se ve releyendo la página.
    if (["sin_comercio", "suspendida", "tienda_vigente", "sin_debito"].includes(codigo)) router.refresh();
  };

  const pagar = () => {
    if (!elegida || elegida.esElActual) return;
    const mail = mailMp.trim();
    if (editandoMail && !MAIL.test(mail)) return setError(planes.errores.email_invalido);
    setError(null);
    empezarPago(async () => {
      const resultado = await comprar({
        nivel: elegida.nivel,
        plan: elegida.plan,
        email: mail && mail !== email ? mail : undefined,
      });
      if (!resultado.ok) return atenderError(resultado.codigo, resultado.vence);
      try {
        const pedido: Pedido = { nivel: elegida.nivel, plan: elegida.plan, prueba: conPrueba, en: Date.now() };
        sessionStorage.setItem(PEDIDO, JSON.stringify(pedido));
      } catch {
        // Sin storage, a la vuelta no hay "Confirmando…": el plan aparece igual al releer.
      }
      setYendo(true);
      window.location.assign(resultado.initPoint);
    });
  };

  const dialogo = useRef<HTMLDialogElement>(null);
  const [cancelando, empezarBaja] = useTransition();
  const darDeBaja = () =>
    empezarBaja(async () => {
      const resultado = await cancelar();
      dialogo.current?.close();
      if (!resultado.ok) return atenderError(resultado.codigo, null);
      router.refresh();
    });

  // ── Lo que se ve ──

  if (fase !== "eligiendo") {
    const { confirmando } = planes;
    return (
      <div className="flex flex-col items-center gap-6 px-[1.125rem] text-center" aria-live="polite">
        <h1 className="text-[1.5rem] leading-[1.1] font-bold tracking-[-0.025rem] text-fg">{confirmando.titulo}</h1>
        <p className="max-w-[22.9rem] text-[0.87rem] leading-[1.3] text-muted">
          {fase === "confirmando" ? confirmando.bajada : confirmando.demora}
        </p>
        {fase === "confirmando" ? (
          <span
            aria-hidden="true"
            className="size-8 animate-spin rounded-full border-[3px] border-accent/25 border-t-accent motion-reduce:animate-none"
          />
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Button onClick={() => setFase("confirmando")}>{confirmando.reintentar}</Button>
            <button
              type="button"
              className={enlaceDelPie}
              onClick={() => {
                olvidarPedido();
                setFase("eligiendo");
              }}
            >
              {confirmando.otro}
            </button>
          </div>
        )}
      </div>
    );
  }

  const textoDelBoton = !elegida
    ? ""
    : yendo || pagando
      ? planes.boton.yendo
      : elegida.esElActual
        ? planes.boton.tuPlan
        : conPrueba
          ? planes.boton.prueba(pruebaDias)
          : cambia
            ? planes.boton.cambiar(elegida.rotulo)
            : planes.boton.suscribirme(elegida.rotulo);

  return (
    <div className="flex flex-col items-center">
      {conPrueba && <RegaloDePrueba dias={pruebaDias} />}
      <div className={conPrueba ? "mt-[0.7rem]" : undefined}>
        <Encabezado {...encabezado} />
      </div>
      {confirmado && (
        <p role="status" className="mt-4 px-[1.125rem] text-center text-[0.87rem] font-semibold text-accent-fg">
          {planes.estado.confirmado}
        </p>
      )}

      <div className="mt-[1.56rem] w-full px-[1.125rem]">
        <SelectorDeFrecuencia valor={plan} onCambiar={setPlan} />
      </div>
      <div className="mt-[0.56rem] w-full">
        <CarruselDePlanes tarjetas={tarjetas[plan]} elegido={nivel} onElegir={setNivel} />
      </div>

      <div className="mt-[1.125rem] flex w-full max-w-[25.15rem] flex-col gap-[0.56rem] px-[1.125rem]">
        <MailDeMercadoPago
          mail={mailMp}
          onCambiar={setMailMp}
          editando={editandoMail}
          onEditar={setEditandoMail}
          esRelay={esRelay}
        />
        <Button
          onClick={pagar}
          disabled={!elegida || elegida.esElActual || pagando || yendo}
          className={cn(
            "min-h-[3.5rem] w-full text-[1.08rem] font-bold",
            elegida?.esElActual && "border border-fg/10 bg-surface text-fg disabled:opacity-100",
          )}
        >
          {textoDelBoton}
        </Button>
        {error && (
          <p role="alert" className="text-center text-small font-medium text-danger">
            {error}
          </p>
        )}
        {elegida && (
          <p className="text-center text-[0.8rem] leading-[1.3] text-muted italic">
            {letraChica(elegida, pruebaDias, cambia)}
          </p>
        )}
      </div>

      <div className="mt-[0.56rem]">
        <PieDelPaywall>
          {[
            ...legalesDelPie,
            baja && (
              <button key="c" type="button" className={enlaceDelPie} onClick={() => dialogo.current?.showModal()}>
                {planes.cancelar.enlace}
              </button>
            ),
            <form key="s" action="/planes/auth/salir" method="post">
              <button type="submit" className={enlaceDelPie}>
                {planes.pie.salir}
              </button>
            </form>,
          ]}
        </PieDelPaywall>
      </div>

      {baja && (
        <dialog
          ref={dialogo}
          aria-labelledby="baja-pregunta"
          className="m-auto w-[min(24rem,calc(100%-2.5rem))] rounded-card bg-surface p-6 text-fg shadow-float backdrop:bg-ink-950/50"
        >
          <p id="baja-pregunta" className="text-body text-fg">
            {planes.cancelar.pregunta(baja.vence)}
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
            <Button onClick={darDeBaja} disabled={cancelando} variant="secondary" className="flex-1">
              {cancelando ? planes.cancelar.cancelando : planes.cancelar.confirmar}
            </Button>
            <Button
              onClick={() => dialogo.current?.close()}
              className="flex-1 border border-line bg-surface text-fg hover:bg-fg/6"
            >
              {planes.cancelar.volver}
            </Button>
          </div>
        </dialog>
      )}
    </div>
  );
}

/** "Pagás con la cuenta de Mercado Pago de …" con su "Cambiar", como en el paywall viejo de la app. */
function MailDeMercadoPago({
  mail,
  onCambiar,
  editando,
  onEditar,
  esRelay,
}: {
  mail: string;
  onCambiar: (mail: string) => void;
  editando: boolean;
  onEditar: (editando: boolean) => void;
  esRelay: boolean;
}) {
  const copy = planes.mercadoPago;

  if (!editando) {
    return (
      <p className="text-center text-[0.8rem] text-muted">
        {copy.conMail} <strong className="font-semibold break-all text-fg">{mail}</strong> ·{" "}
        <button type="button" onClick={() => onEditar(true)} className="ring-focus rounded-[4px] font-semibold text-accent-fg underline-offset-2 hover:underline">
          {copy.cambiar}
        </button>
      </p>
    );
  }

  return (
    <form
      className="flex flex-col gap-1.5"
      onSubmit={(event) => {
        event.preventDefault();
        if (event.currentTarget.reportValidity()) onEditar(false);
      }}
    >
      <label htmlFor="mail-mp" className="text-[0.8rem] font-semibold text-fg">
        {copy.rotulo}
      </label>
      <div className="flex gap-2">
        <input
          id="mail-mp"
          type="email"
          required
          autoComplete="email"
          value={mail}
          onChange={(event) => onCambiar(event.target.value)}
          className="ring-focus min-h-11 min-w-0 flex-1 rounded-field border border-line bg-surface px-3.5 text-base text-fg"
        />
        <Button type="submit" variant="secondary" size="compact" className="min-h-11">
          {copy.listo}
        </Button>
      </div>
      {esRelay && <p className="text-[0.8rem] text-muted">{copy.relay}</p>}
    </form>
  );
}
