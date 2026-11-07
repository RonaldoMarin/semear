import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { ehEmailDeTeste } from "./email-teste";

/**
 * Envio de e-mails pelo Gmail do projeto (SMTP).
 * O Gmail exige uma "senha de app" (não a senha normal da conta):
 * Conta Google → Segurança → Verificação em duas etapas → Senhas de app.
 *
 * Sem SMTP_PASS configurado, o e-mail não é enviado: o conteúdo vai para o log do servidor
 * (útil para testar localmente).
 */

interface Mensagem {
  para: string;
  assunto: string;
  html: string;
  texto: string;
  /** para onde vão as respostas (padrão: o próprio e-mail do projeto) */
  responderPara?: string;
}

let transporter: Transporter | null = null;

function getTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  transporter ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: Number(process.env.SMTP_PORT ?? 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

export async function enviarEmail({ para, assunto, html, texto, responderPara }: Mensagem) {
  const t = getTransporter();
  const remetente = process.env.EMAIL_FROM ?? `Semear no Sertão <${process.env.SMTP_USER}>`;

  if (ehEmailDeTeste(para)) {
    console.info(`[email] endereço de teste — e-mail NÃO enviado.\nPara: ${para}\nAssunto: ${assunto}`);
    return { enviado: false as const };
  }

  if (!t) {
    console.warn(`[email] SMTP não configurado — e-mail NÃO enviado.\nPara: ${para}\nAssunto: ${assunto}\n${texto}`);
    return { enviado: false as const };
  }

  await t.sendMail({ from: remetente, to: para, replyTo: responderPara ?? process.env.SMTP_USER, subject: assunto, html, text: texto });
  return { enviado: true as const };
}

/** Envia sem derrubar quem chamou: falhas vão para o log. Retorna se o e-mail saiu. */
export async function enviarEmailSeguro(mensagem: Mensagem, contexto: string) {
  try {
    return (await enviarEmail(mensagem)).enviado;
  } catch (error) {
    console.error(`[email] falha ao enviar (${contexto})`, error);
    return false;
  }
}
