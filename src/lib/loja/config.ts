import "server-only";
import { db } from "@/lib/db";
import { siteConfig } from "@/lib/content";

const CHAVE_WHATSAPP = "loja.whatsapp";

/** Número de WhatsApp que recebe os pedidos da loja (configurável no painel). Padrão: WhatsApp da missão. */
export async function getWhatsappLoja() {
  try {
    const config = await db.configuracao.findUnique({ where: { chave: CHAVE_WHATSAPP } });
    if (config?.valor) return config.valor;
  } catch {
    // banco indisponível: usa o padrão
  }
  return siteConfig.whatsappDisplay;
}

export async function setWhatsappLoja(valor: string) {
  await db.configuracao.upsert({
    where: { chave: CHAVE_WHATSAPP },
    create: { chave: CHAVE_WHATSAPP, valor },
    update: { valor },
  });
}
