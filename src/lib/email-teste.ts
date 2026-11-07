/**
 * Domínios reservados (RFC 2606/6761) que nunca existem de verdade: .test, .example, .invalid, .localhost.
 * E-mails assim são de dados de teste e nunca são enviados (evita "não entregue" na caixa do projeto).
 */
const DOMINIOS_RESERVADOS = /\.(test|example|invalid|localhost)$/i;

export function ehEmailDeTeste(email: string | null | undefined) {
  const dominio = email?.trim().split("@")[1];
  return Boolean(dominio && DOMINIOS_RESERVADOS.test(dominio));
}
