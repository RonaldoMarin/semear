import "server-only";

/* Peças de e-mail em HTML "à moda antiga" (tabelas + estilos inline), que é o que
   Gmail, Outlook e celulares renderizam de forma consistente. Cores da marca. */

const C = {
  fundo: "#f3e8d4",
  papel: "#fffdf8",
  terra: "#34281f",
  terraNoite: "#241b15",
  folha: "#7fb23f",
  folhaEscura: "#4d7a1f",
  folhaClara: "#e6f0d4",
  areia: "#f6efe2",
  texto: "#2b2119",
  suave: "#6b5d51",
  linha: "#eadfcd",
  sol: "#e9a83b",
};

const FONTE = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export const esc = (texto: string) =>
  texto.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Converte quebras de linha de um texto livre em <br>. */
export const multilinha = (texto: string) => esc(texto).replace(/\r?\n/g, "<br>");

export function titulo(texto: string, kicker?: string) {
  return `${kicker ? `<p style="margin:0 0 8px;font:800 12px/1.2 ${FONTE};letter-spacing:2px;text-transform:uppercase;color:${C.folhaEscura}">${esc(kicker)}</p>` : ""}
  <h1 style="margin:0 0 16px;font:800 26px/1.2 ${FONTE};color:${C.terra}">${esc(texto)}</h1>`;
}

export function paragrafo(html: string) {
  return `<p style="margin:0 0 14px;font:400 15px/1.65 ${FONTE};color:${C.suave}">${html}</p>`;
}

export function botao(texto: string, url: string, cor: "folha" | "terra" = "folha") {
  const bg = cor === "folha" ? C.folha : C.terra;
  const fg = cor === "folha" ? C.terraNoite : "#fbf6ec";
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 8px"><tr><td style="border-radius:999px;background:${bg}">
    <a href="${esc(url)}" style="display:inline-block;padding:14px 28px;font:800 15px/1 ${FONTE};color:${fg};text-decoration:none;border-radius:999px">${esc(texto)}</a>
  </td></tr></table>`;
}

/** Caixa de destaque (protocolo, avisos). */
export function destaque({ rotulo, valor, tom = "terra" }: { rotulo: string; valor: string; tom?: "terra" | "folha" }) {
  const bg = tom === "terra" ? C.terra : C.folhaClara;
  const fgRotulo = tom === "terra" ? C.folha : C.folhaEscura;
  const fgValor = tom === "terra" ? "#fbf6ec" : C.terra;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 22px;border-radius:16px;background:${bg}"><tr><td style="padding:16px 20px">
    <p style="margin:0 0 4px;font:800 11px/1.2 ${FONTE};letter-spacing:2px;text-transform:uppercase;color:${fgRotulo}">${esc(rotulo)}</p>
    <p style="margin:0;font:800 24px/1.2 ${FONTE};letter-spacing:2px;color:${fgValor}">${esc(valor)}</p>
  </td></tr></table>`;
}

/** Tabela de informações (Quando, Onde, Valor...). */
export function infos(linhas: { rotulo: string; valor: string }[]) {
  const itens = linhas
    .filter((l) => l.valor)
    .map(
      (l, i) => `<tr>
        <td style="padding:12px 16px;${i ? `border-top:1px solid ${C.linha};` : ""}font:700 13px/1.4 ${FONTE};color:${C.suave};width:38%;vertical-align:top">${esc(l.rotulo)}</td>
        <td style="padding:12px 16px;${i ? `border-top:1px solid ${C.linha};` : ""}font:700 14px/1.5 ${FONTE};color:${C.terra};vertical-align:top">${multilinha(l.valor)}</td>
      </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 22px;border:1px solid ${C.linha};border-radius:16px;border-collapse:separate;background:${C.areia}">${itens}</table>`;
}

/** Passo a passo numerado. */
export function passos(itens: { titulo: string; texto: string }[]) {
  const linhas = itens
    .map(
      (p, i) => `<tr>
        <td style="width:40px;padding:0 12px 18px 0;vertical-align:top">
          <div style="width:32px;height:32px;border-radius:50%;background:${C.folhaClara};color:${C.folhaEscura};font:800 15px/32px ${FONTE};text-align:center">${i + 1}</div>
        </td>
        <td style="padding:2px 0 18px;vertical-align:top">
          <p style="margin:0 0 3px;font:800 15px/1.4 ${FONTE};color:${C.terra}">${esc(p.titulo)}</p>
          <p style="margin:0;font:400 14px/1.55 ${FONTE};color:${C.suave}">${p.texto}</p>
        </td>
      </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 8px">${linhas}</table>`;
}

export function subtitulo(texto: string) {
  return `<h2 style="margin:26px 0 12px;font:800 17px/1.3 ${FONTE};color:${C.terra}">${esc(texto)}</h2>`;
}

/** Lista com marcador de folha. */
export function lista(itens: string[]) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px">${itens
    .map(
      (item) => `<tr><td style="width:22px;padding:4px 0;vertical-align:top;color:${C.folha};font:800 14px/1.5 ${FONTE}">●</td>
      <td style="padding:4px 0;font:400 14px/1.5 ${FONTE};color:${C.suave}">${esc(item)}</td></tr>`,
    )
    .join("")}</table>`;
}

export function contatos(itens: { nome: string; funcao?: string | null; telefone: string; whatsapp: boolean }[]) {
  if (!itens.length) return "";
  return `${subtitulo("Fale com a secretaria")}${itens
    .map((c) => {
      const digitos = c.telefone.replace(/\D/g, "");
      const link = c.whatsapp ? `https://wa.me/${digitos.startsWith("55") ? digitos : `55${digitos}`}` : `tel:${digitos}`;
      return `<p style="margin:0 0 8px;font:400 14px/1.5 ${FONTE};color:${C.suave}"><strong style="color:${C.terra}">${esc(c.nome)}</strong>${c.funcao ? ` · ${esc(c.funcao)}` : ""} — <a href="${link}" style="color:${C.folhaEscura};font-weight:700;text-decoration:none">${esc(c.telefone)}${c.whatsapp ? " (WhatsApp)" : ""}</a></p>`;
    })
    .join("")}`;
}

/** Moldura do e-mail: cabeçalho da marca, conteúdo e rodapé com o versículo. */
export function moldura({ preheader, conteudo }: { preheader: string; conteudo: string }) {
  return `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>Semear no Sertão</title></head>
<body style="margin:0;padding:0;background:${C.fundo};-webkit-text-size-adjust:100%">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.fundo}">
    <tr><td align="center" style="padding:28px 14px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px">
        <tr><td style="background:${C.terra};border-radius:22px 22px 0 0;padding:26px 30px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="vertical-align:middle">
              <p style="margin:0;font:900 22px/1 ${FONTE};letter-spacing:1px;color:${C.folha}">SEMEAR</p>
              <p style="margin:2px 0 0;font:800 13px/1 ${FONTE};letter-spacing:3px;color:#f6efdf">NO SERTÃO</p>
            </td>
            <td align="right" style="vertical-align:middle">
              <div style="display:inline-block;width:38px;height:46px;border-radius:100% 0 100% 0;background:${C.folha};opacity:.85"></div>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="background:${C.papel};padding:34px 30px 20px">${conteudo}</td></tr>
        <tr><td style="background:${C.terraNoite};border-radius:0 0 22px 22px;padding:22px 30px">
          <p style="margin:0 0 6px;font:italic 400 14px/1.5 Georgia,serif;color:#e9dfcf">“Eu vos escolhi para irem e darem fruto, fruto que permaneça.”</p>
          <p style="margin:0 0 14px;font:800 11px/1.2 ${FONTE};letter-spacing:2px;text-transform:uppercase;color:${C.folha}">João 15:16</p>
          <p style="margin:0;font:400 12px/1.5 ${FONTE};color:#a99a8b">Missão Semear no Sertão · Este é um e-mail automático; para falar com a gente, responda esta mensagem ou chame no WhatsApp.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
