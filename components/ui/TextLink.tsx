import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Anchor, { type AnchorProps } from "./Anchor";

type Tone = "accent" | "quiet";

const tones: Record<Tone, string> = {
  accent: "font-semibold text-accent-fg underline decoration-current/30 underline-offset-4 hover:decoration-current",
  quiet: "text-muted hover:text-fg",
};

/** El único link de texto del sitio. Los que abren otra pestaña llevan flecha. */
export default function TextLink({
  tone = "accent",
  className,
  children,
  ...props
}: AnchorProps & { tone?: Tone }) {
  const opensTab = props.href.startsWith("http");

  return (
    <Anchor
      {...props}
      className={cn(
        "ring-focus group inline-flex items-baseline gap-1 rounded-pill transition-colors duration-(--duration-chico)",
        tones[tone],
        className,
      )}
    >
      {children}
      {opensTab && (
        <ArrowUpRight
          className="size-3.5 shrink-0 self-center transition-[translate] duration-(--duration-chico) ease-out-cubic group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      )}
    </Anchor>
  );
}
