/**
 * Gera o "Pix copia e cola" (BR Code estático, padrão EMV do Banco Central).
 * O mesmo texto vira o QR Code que os apps dos bancos leem.
 */

interface PixEstatico {
  chave: string;
  /** nome de quem recebe (até 25 caracteres, sem acentos) */
  nome: string;
  /** cidade de quem recebe (até 15 caracteres, sem acentos) */
  cidade: string;
  /** em reais; sem valor, a pessoa digita quanto quer doar */
  valor?: number;
  /** identificador que aparece no extrato (letras e números, até 25) */
  txid?: string;
  /** mensagem curta que alguns bancos mostram */
  descricao?: string;
}

const semAcento = (texto: string) => texto.normalize("NFD").replace(/[̀-ͯ]/g, "");

function campo(id: string, valor: string) {
  return `${id}${String(valor.length).padStart(2, "0")}${valor}`;
}

/** CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF), exigido no final do BR Code. */
function crc16(texto: string) {
  let crc = 0xffff;
  for (const byte of new TextEncoder().encode(texto)) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function pixCopiaECola({ chave, nome, cidade, valor, txid = "***", descricao }: PixEstatico) {
  const contaPix = campo("00", "br.gov.bcb.pix") + campo("01", chave.trim()) + (descricao ? campo("02", semAcento(descricao).slice(0, 40)) : "");
  const corpo =
    campo("00", "01") +
    campo("26", contaPix) +
    campo("52", "0000") +
    campo("53", "986") +
    (valor ? campo("54", valor.toFixed(2)) : "") +
    campo("58", "BR") +
    campo("59", semAcento(nome).toUpperCase().slice(0, 25)) +
    campo("60", semAcento(cidade).toUpperCase().slice(0, 15)) +
    campo("62", campo("05", txid.replace(/[^A-Za-z0-9*]/g, "").slice(0, 25) || "***")) +
    "6304";
  return corpo + crc16(corpo);
}
