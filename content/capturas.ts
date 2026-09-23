import type { StaticImageData } from "next/image";

import inicioClaro from "@/assets/capturas/claro/01_cliente_inicio.webp";
import inicioOscuro from "@/assets/capturas/oscuro/01_cliente_inicio.webp";
import cercaClaro from "@/assets/capturas/claro/02_cliente_cerca_tuyo.webp";
import cercaOscuro from "@/assets/capturas/oscuro/02_cliente_cerca_tuyo.webp";
import fichaClaro from "@/assets/capturas/claro/03_cliente_ficha_local.webp";
import fichaOscuro from "@/assets/capturas/oscuro/03_cliente_ficha_local.webp";
import horarioClaro from "@/assets/capturas/claro/04_cliente_elegir_horario.webp";
import horarioOscuro from "@/assets/capturas/oscuro/04_cliente_elegir_horario.webp";
import revisaClaro from "@/assets/capturas/claro/05_cliente_revisa_turno.webp";
import revisaOscuro from "@/assets/capturas/oscuro/05_cliente_revisa_turno.webp";
import misTurnosClaro from "@/assets/capturas/claro/06_cliente_mis_turnos.webp";
import misTurnosOscuro from "@/assets/capturas/oscuro/06_cliente_mis_turnos.webp";
import hojaTurnoClaro from "@/assets/capturas/claro/07_cliente_hoja_turno.webp";
import hojaTurnoOscuro from "@/assets/capturas/oscuro/07_cliente_hoja_turno.webp";
import mapaClaro from "@/assets/capturas/claro/08_cliente_explorar_mapa.webp";
import mapaOscuro from "@/assets/capturas/oscuro/08_cliente_explorar_mapa.webp";
import bienvenidaClaro from "@/assets/capturas/claro/09_bienvenida.webp";
import bienvenidaOscuro from "@/assets/capturas/oscuro/09_bienvenida.webp";
import agendaClaro from "@/assets/capturas/claro/10_comercio_agenda_dia.webp";
import agendaOscuro from "@/assets/capturas/oscuro/10_comercio_agenda_dia.webp";
import turnoLocalClaro from "@/assets/capturas/claro/11_comercio_hoja_turno.webp";
import turnoLocalOscuro from "@/assets/capturas/oscuro/11_comercio_hoja_turno.webp";
import serviciosClaro from "@/assets/capturas/claro/12_comercio_servicios.webp";
import serviciosOscuro from "@/assets/capturas/oscuro/12_comercio_servicios.webp";
import equipoClaro from "@/assets/capturas/claro/13_comercio_equipo.webp";
import equipoOscuro from "@/assets/capturas/oscuro/13_comercio_equipo.webp";
import mostradorClaro from "@/assets/capturas/claro/14_comercio_turno_mostrador.webp";
import mostradorOscuro from "@/assets/capturas/oscuro/14_comercio_turno_mostrador.webp";
import crecimientoClaro from "@/assets/capturas/claro/15_comercio_crecimiento.webp";
import crecimientoOscuro from "@/assets/capturas/oscuro/15_comercio_crecimiento.webp";

/** Una pantalla de la app, en sus dos temas. Todas miden 1206 × 2622. */
export type Captura = {
  claro: StaticImageData;
  oscuro: StaticImageData;
  alt: string;
};

export const capturas = {
  inicio: {
    claro: inicioClaro,
    oscuro: inicioOscuro,
    alt: "Inicio de Bookit: el saludo con la ciudad, el buscador de servicios y el próximo turno reservado, con el local, el horario y con quién es.",
  },
  cerca: {
    claro: cercaClaro,
    oscuro: cercaOscuro,
    alt: "Locales cerca tuyo: cada uno con su foto, su rubro, la distancia y desde qué precio atiende.",
  },
  ficha: {
    claro: fichaClaro,
    oscuro: fichaOscuro,
    alt: "Ficha de una barbería: la dirección, el precio desde el que atiende y la lista de servicios con su precio y su duración.",
  },
  horario: {
    claro: horarioClaro,
    oscuro: horarioOscuro,
    alt: "Elegir horario: con quién hacés el servicio, los días de la semana y los turnos libres de la mañana y de la tarde.",
  },
  revisa: {
    claro: revisaClaro,
    oscuro: revisaOscuro,
    alt: "Revisá tu turno: el día, el horario, el servicio, cómo se paga y el total, con el botón para confirmar la reserva.",
  },
  misTurnos: {
    claro: misTurnosClaro,
    oscuro: misTurnosOscuro,
    alt: "Mis turnos: los próximos turnos reservados, cada uno con el local, el horario, el servicio y su estado.",
  },
  hojaTurno: {
    claro: hojaTurnoClaro,
    oscuro: hojaTurnoOscuro,
    alt: "Detalle de un turno: agendarlo en el calendario, cómo llegar, reprogramarlo o cancelarlo.",
  },
  mapa: {
    claro: mapaClaro,
    oscuro: mapaOscuro,
    alt: "Mapa de Tandil con los locales marcados y filtros por rubro.",
  },
  bienvenida: {
    claro: bienvenidaClaro,
    oscuro: bienvenidaOscuro,
    alt: "Bienvenida de Bookit: tu próximo turno sin llamar a nadie, con las opciones para entrar con Google, Apple o email.",
  },
  agenda: {
    claro: agendaClaro,
    oscuro: agendaOscuro,
    alt: "Agenda del local para mañana: los turnos confirmados con su horario, cliente y servicio, y los huecos libres listos para publicar.",
  },
  turnoLocal: {
    claro: turnoLocalClaro,
    oscuro: turnoLocalOscuro,
    alt: "Un turno visto desde el local: la clienta, el horario y el servicio, con los botones para marcar si asistió o no.",
  },
  servicios: {
    claro: serviciosClaro,
    oscuro: serviciosOscuro,
    alt: "Servicios del local: cada uno con su descripción, su precio y su duración.",
  },
  equipo: {
    claro: equipoClaro,
    oscuro: equipoOscuro,
    alt: "Equipo del local: cada profesional con sus horarios y sus servicios, y si está activo.",
  },
  mostrador: {
    claro: mostradorClaro,
    oscuro: mostradorOscuro,
    alt: "Nuevo turno cargado desde el mostrador: profesional, servicio, fecha, hora y los datos del cliente.",
  },
  crecimiento: {
    claro: crecimientoClaro,
    oscuro: crecimientoOscuro,
    alt: "Crecimiento del local: los turnos por mes en los últimos doce meses, el mejor mes y el servicio más vendido.",
  },
} as const satisfies Record<string, Captura>;

export type CapturaId = keyof typeof capturas;
