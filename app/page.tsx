import type { Metadata } from "next";
import Cierre from "@/components/home/Cierre";
import ComoFunciona from "@/components/home/ComoFunciona";
import Hero from "@/components/home/Hero";
import ParaLocales from "@/components/home/ParaLocales";
import Preguntas from "@/components/home/Preguntas";
import Puntos from "@/components/home/Puntos";
import Testimonios from "@/components/home/Testimonios";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Hero />

      <ComoFunciona />

      <ParaLocales />

      <Puntos />

      <Testimonios />

      <Preguntas />

      <Cierre />
    </>
  );
}
