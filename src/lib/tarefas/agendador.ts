import { enviarConvitesMantenedor } from "./convite-mantenedor";

const UMA_HORA = 60 * 60 * 1000;
const global = globalThis as unknown as { __agendadorSemear?: boolean };

async function rodar() {
  try {
    const { eventos } = await enviarConvitesMantenedor();
    if (eventos.length) console.info("[agendador] convites do Plano Mantenedor:", JSON.stringify(eventos));
  } catch (error) {
    console.error("[agendador] falha ao enviar convites do Plano Mantenedor", error);
  }
}

/** Confere de hora em hora (e 1 minuto depois de subir) se há convites pendentes. */
export function iniciarAgendador() {
  if (global.__agendadorSemear) return; // evita duplicar no recarregamento do modo dev
  global.__agendadorSemear = true;
  setTimeout(rodar, 60 * 1000).unref?.();
  setInterval(rodar, UMA_HORA).unref?.();
  console.info("[agendador] tarefas automáticas ligadas (convite do Plano Mantenedor, de hora em hora)");
}
