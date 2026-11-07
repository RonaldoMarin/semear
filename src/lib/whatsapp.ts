/**
 * Link para abrir uma conversa no WhatsApp (app ou Web), opcionalmente com a mensagem já escrita.
 *
 * Usa api.whatsapp.com/send em vez de wa.me: o redirecionamento do wa.me estraga emojis
 * (eles chegam como "�" no WhatsApp Web).
 */
export function linkWhatsApp(telefone: string, mensagem?: string) {
  const digitos = telefone.replace(/\D/g, "");
  const numero = digitos.startsWith("55") && digitos.length > 11 ? digitos : `55${digitos}`;
  const params = new URLSearchParams({ phone: numero });
  if (mensagem) params.set("text", mensagem);
  return `https://api.whatsapp.com/send?${params.toString().replace(/\+/g, "%20")}`;
}
