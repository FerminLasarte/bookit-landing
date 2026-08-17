"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Reveal on scroll (§4.4): opacity 0→1, translateY 16→0, 700ms,
 * cubic-bezier(0.16, 1, 0.3, 1), stagger de 60ms. Una vez, no en loop.
 * Con `prefers-reduced-motion` no se anima nada.
 */
export default function Reveal({
  children,
  /** Índice dentro de un grupo, para el stagger de 60ms. */
  index = 0,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  index?: number;
  className?: string;
  as?: "div" | "li" | "section" | "header";
}) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as];

  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{
        duration: 0.7,
        delay: index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </MotionTag>
  );
}
