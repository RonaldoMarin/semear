/* eslint-disable @next/next/no-img-element */

interface LogoProps {
  /** "claro" para fundos escuros (a parte marrom vira creme). */
  variant?: "padrao" | "claro";
  /** "horizontal" = símbolo + nome; "simbolo" = apenas a semente com as mãos. */
  format?: "horizontal" | "simbolo";
  className?: string;
  /** Use "" quando o logo for apenas decorativo. */
  alt?: string;
  style?: React.CSSProperties;
}

const files = {
  horizontal: { padrao: "semear-horizontal.svg", claro: "semear-horizontal-claro.svg" },
  simbolo: { padrao: "semear-simbolo.svg", claro: "semear-simbolo-claro.svg" },
} as const;

export function Logo({ variant = "padrao", format = "horizontal", className, alt = "Semear no Sertão", style }: LogoProps) {
  return (
    <img
      className={className}
      style={style}
      src={`/images/marca/${files[format][variant]}`}
      alt={alt}
      width={format === "horizontal" ? 1230 : 755}
      height={format === "horizontal" ? 552 : 873}
    />
  );
}
