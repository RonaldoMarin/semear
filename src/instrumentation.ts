/**
 * Roda uma vez quando o servidor do Next sobe (ver docs em node_modules/next/dist/docs).
 * Aqui ligamos o agendador interno das tarefas automáticas, como o convite do Plano Mantenedor.
 * Para desligar (ex.: se usar o cron da hospedagem), defina AGENDADOR_INTERNO=desligado.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.AGENDADOR_INTERNO === "desligado") return;
  const { iniciarAgendador } = await import("./lib/tarefas/agendador");
  iniciarAgendador();
}
