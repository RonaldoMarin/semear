// Banco PostgreSQL de testes, só para desenvolvimento local.
// Uso: `npm run db` num terminal e deixe aberto; em outro terminal, `npm run dev`.
// Os dados ficam em .pgdata/ (ignorado pelo git). Ctrl+C desliga o banco.
import fs from "node:fs";
import EmbeddedPostgres from "embedded-postgres";

const pg = new EmbeddedPostgres({
  databaseDir: "./.pgdata",
  user: "semear",
  password: "semear",
  port: 54329,
  persistent: true,
});

const novo = !fs.existsSync("./.pgdata/PG_VERSION");
if (novo) await pg.initialise();
// sobra de um desligamento brusco impediria a inicialização
fs.rmSync("./.pgdata/postmaster.pid", { force: true });

await pg.start();
if (novo) await pg.createDatabase("semear");

console.log("\n✔ Banco de testes rodando em localhost:54329 (Ctrl+C para desligar)");
if (novo) console.log("  Banco novo: rode `npx prisma migrate deploy` para criar as tabelas.\n");

const desligar = async () => {
  await pg.stop();
  process.exit(0);
};
process.on("SIGINT", desligar);
process.on("SIGTERM", desligar);
setInterval(() => {}, 1 << 30);
