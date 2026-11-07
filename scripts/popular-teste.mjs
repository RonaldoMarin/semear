// Popula o banco de TESTES com inscrições fictícias, para testar a lista de espera.
//
//   npm run db:popular              → lota as vagas do evento e põe 5 pessoas na lista de espera
//   npm run db:popular -- --espera=8  → idem, com 8 na lista de espera
//   npm run db:popular -- --limpar    → apaga todas as inscrições fictícias (e-mail @exemplo.test)
//
// Usa o primeiro evento com inscrições abertas. Nunca rode apontando para o banco real.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")));
const DOMINIO = "exemplo.test";

if (!/localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL ?? "")) {
  console.error("✖ DATABASE_URL não aponta para localhost. Este script só roda no banco de testes.");
  process.exit(1);
}

if ("limpar" in args) {
  const { count } = await db.inscricao.deleteMany({ where: { email: { endsWith: `@${DOMINIO}` }, nome: { contains: "(teste)" } } });
  console.log(`✔ ${count} inscrições fictícias apagadas.`);
  await db.$disconnect();
  process.exit(0);
}

const nomes = ["Ana", "Bruno", "Carla", "Davi", "Elisa", "Felipe", "Gabriela", "Heitor", "Isabela", "João", "Larissa", "Mateus", "Natália", "Otávio", "Paula", "Rafael", "Sara", "Tiago", "Vitória", "Yago"];
const sobrenomes = ["Silva", "Souza", "Oliveira", "Santos", "Lima", "Costa", "Pereira", "Almeida", "Ferreira", "Rocha", "Medeiros", "Dantas"];
const igrejas = ["Igreja Batista Central, RN", "Assembleia de Deus, PB", "Igreja Presbiteriana, RN", "Igreja Batista Redenção, RN", "Comunidade Evangélica, PE"];
const pick = (lista, i) => lista[i % lista.length];

function cpfValido(seed) {
  const base = String(100000000 + ((seed * 7919) % 899999999)).padStart(9, "0").split("").map(Number);
  const dv = (nums) => {
    const soma = nums.reduce((acc, n, i) => acc + n * (nums.length + 1 - i), 0);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  const d1 = dv(base);
  const d2 = dv([...base, d1]);
  const c = [...base, d1, d2].join("");
  return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9)}`;
}

const telefone = (i) => `(84) 9${String(80000000 + i * 137).slice(0, 4)}-${String(1000 + i).slice(-4)}`;

/** Monta as respostas seguindo as perguntas reais do evento (pula as condicionais escondidas). */
function respostasPara(perguntas, pessoa) {
  const porChave = Object.fromEntries(perguntas.map((p) => [p.chave ?? p.id, p]));
  const valores = {};
  const respostas = [];
  for (const p of perguntas) {
    if (p.condicaoChave) {
      const pai = porChave[p.condicaoChave];
      if (!pai || valores[pai.chave ?? pai.id] !== p.condicaoValor) continue;
    }
    let valor;
    switch (p.tipo) {
      case "EMAIL": valor = pessoa.email; break;
      case "CPF": valor = pessoa.cpf; break;
      case "DATA": valor = pessoa.nascimento; break;
      case "TELEFONE": valor = /pastor|respons/i.test(p.label) ? telefone(pessoa.i + 500) : pessoa.telefone; break;
      case "ESCOLHA_UNICA": valor = p.opcoes[pessoa.i % p.opcoes.length]; break;
      case "MULTIPLA_ESCOLHA": valor = [p.opcoes[0]]; break;
      case "PARAGRAFO": valor = p.obrigatoria ? "Participei de ações evangelísticas na minha igreja." : ""; break;
      default:
        valor = /nome completo/i.test(p.label) ? pessoa.nome
          : /igreja/i.test(p.label) ? pick(igrejas, pessoa.i)
          : /pastor/i.test(p.label) ? `Pr. ${pick(sobrenomes, pessoa.i + 3)}`
          : /respons/i.test(p.label) ? `${pick(nomes, pessoa.i + 7)} ${pessoa.sobrenome}`
          : "Louvor";
    }
    valores[p.chave ?? p.id] = valor;
    if (valor === "" || (Array.isArray(valor) && !valor.length)) continue;
    respostas.push({ label: p.label, tipo: p.tipo, valor });
  }
  return respostas;
}

const evento = await db.evento.findFirst({
  where: { status: "INSCRICOES_ABERTAS" },
  orderBy: { dataInicio: "asc" },
  include: { perguntas: { orderBy: { ordem: "asc" } } },
});
if (!evento) {
  console.error("✖ Nenhum evento com status \"Inscrições abertas\".");
  process.exit(1);
}
if (evento.vagas == null) {
  console.error(`✖ "${evento.nome}" não tem limite de vagas. Defina as vagas no painel para testar a lista de espera.`);
  process.exit(1);
}

const ocupadas = await db.inscricao.count({ where: { eventoId: evento.id, status: { in: ["PENDENTE", "CONFIRMADA"] } } });
const faltam = Math.max(0, evento.vagas - ocupadas);
const naEspera = Number(args.espera ?? 5);
const existentes = await db.inscricao.count({ where: { email: { endsWith: `@${DOMINIO}` } } });

let criadas = 0;
for (let n = 0; n < faltam + naEspera; n++) {
  const i = existentes + n + 1;
  const sobrenome = pick(sobrenomes, i * 5);
  const pessoa = {
    i,
    sobrenome,
    nome: `${pick(nomes, i)} ${sobrenome} (teste)`,
    email: `pessoa${i}@${DOMINIO}`,
    cpf: cpfValido(i + 1000),
    telefone: telefone(i),
    nascimento: `${1990 + (i % 15)}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
  };
  const ocupaVaga = n < faltam;
  await db.inscricao.create({
    data: {
      eventoId: evento.id,
      status: ocupaVaga ? (n % 3 === 0 ? "CONFIRMADA" : "PENDENTE") : "LISTA_ESPERA",
      nome: pessoa.nome,
      email: pessoa.email,
      cpf: pessoa.cpf,
      telefone: pessoa.telefone,
      respostas: respostasPara(evento.perguntas, pessoa),
      // espaçadas no tempo para a ordem da fila ficar clara
      criadoEm: new Date(Date.now() - (faltam + naEspera - n) * 60_000),
    },
  });
  criadas++;
}

const fila = await db.inscricao.count({ where: { eventoId: evento.id, status: "LISTA_ESPERA" } });
console.log(`✔ ${criadas} inscrições fictícias criadas em "${evento.nome}".`);
console.log(`  Vagas: ${evento.vagas} · ocupadas agora: ${ocupadas + faltam} · na lista de espera: ${fila}`);
console.log(`  Para apagar depois: npm run db:popular -- --limpar`);
await db.$disconnect();
