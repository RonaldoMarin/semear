import "server-only";

/**
 * E-mails autorizados a criar conta de administrador, definidos em ADMIN_EMAILS
 * (separados por vírgula). Qualquer outro e-mail só consegue criar conta se um
 * ADM tiver cadastrado esse e-mail antes em "Usuários".
 */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string): boolean {
  return getAdminEmails().includes(email.trim().toLowerCase());
}
