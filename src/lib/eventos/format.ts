/**
 * Conversões entre o que o formulário usa (strings) e o que o banco guarda.
 * Datas: o painel trabalha sempre no horário de Recife/Natal (UTC-3, sem horário de verão).
 */
export const TIMEZONE = "America/Recife";
const OFFSET = "-03:00";

/** "2027-01-09T08:00" (datetime-local) → Date */
export function fromLocalInput(value: string): Date {
  return new Date(`${value}:00${OFFSET}`);
}

/** Date → "2027-01-09T08:00" para inputs datetime-local */
export function toLocalInput(date: Date | null | undefined): string {
  if (!date) return "";
  const shifted = new Date(date.getTime() - 3 * 60 * 60 * 1000);
  return shifted.toISOString().slice(0, 16);
}

export function formatDate(date: Date, opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" }) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: TIMEZONE, ...opts }).format(date);
}

export function formatDateRange(inicio: Date, fim: Date) {
  const sameDay = formatDate(inicio) === formatDate(fim);
  if (sameDay) return formatDate(inicio, { day: "2-digit", month: "short", year: "numeric" });
  const sameYear = formatDate(inicio, { year: "numeric" }) === formatDate(fim, { year: "numeric" });
  return `${formatDate(inicio, sameYear ? { day: "2-digit", month: "short" } : undefined)} – ${formatDate(fim)}`;
}

export function formatDateTime(date: Date) {
  return formatDate(date, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** "450,00" | "1.250,5" → 45000 (centavos) | null */
export function parseMoney(value: string): number | null {
  const clean = value.replace(/[R$\s.]/g, "").replace(",", ".");
  if (!clean) return null;
  const number = Number(clean);
  return Number.isFinite(number) ? Math.round(number * 100) : NaN;
}

/** 45000 → "450,00" */
export function centsToInput(cents: number | null | undefined): string {
  if (cents == null) return "";
  return (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatMoney(cents: number | null | undefined) {
  if (cents == null) return "—";
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
