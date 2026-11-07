import "server-only";
import { headers } from "next/headers";

/**
 * Endereço do site usado nos links dos e-mails.
 * Em produção vem SEMPRE do .env (SITE_URL ou NEXT_PUBLIC_SITE_URL): confiar no cabeçalho Host
 * permitiria que alguém forjasse o domínio e recebesse links de redefinição de senha.
 * Em desenvolvimento usa o endereço da requisição (localhost, preview).
 */
export async function origemDoSite() {
  const fixo = (process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");
  if (process.env.NODE_ENV === "production") {
    if (!fixo || /localhost|127\.0\.0\.1/.test(fixo)) console.warn("[site-url] Defina SITE_URL com o domínio real do site no .env de produção.");
    return fixo || "http://localhost:3000";
  }
  const h = await headers();
  const host = h.get("host");
  if (!host) return fixo || "http://localhost:3000";
  return `${host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https"}://${host}`;
}
