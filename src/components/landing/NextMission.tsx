import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { formatDateRange, formatMoney } from "@/lib/eventos/format";
import { getProximoEventoPublico } from "@/lib/inscricoes/publico";
import styles from "./NextMission.module.css";

/** Faixa com o próximo evento cadastrado no painel. Se não houver (ou o banco falhar), não aparece. */
export async function NextMission() {
  const proximo = await getProximoEventoPublico();
  if (!proximo) return null;

  const { evento, situacao } = proximo;
  const aberta = situacao.aberta;
  const listaEspera = situacao.aberta && situacao.listaEspera;
  const lugares = evento.locais.map((l) => l.cidade ?? l.nome).join(" → ");

  return (
    <section className={styles.section} aria-labelledby="proxima-missao">
      <div className="container">
        <div className={styles.card}>
          <div className={styles.badge}>
            <span className={styles.pulse} data-open={aberta} aria-hidden="true" />
            {listaEspera ? "Vagas esgotadas · lista de espera" : aberta ? "Inscrições abertas" : evento.status === "EM_BREVE" ? "Em breve" : "Inscrições encerradas"}
          </div>
          <div className={styles.copy}>
            <h2 id="proxima-missao">{evento.nome}</h2>
            <ul className={styles.meta}>
              <li>
                <Icon name="presence" size={18} /> {formatDateRange(evento.dataInicio, evento.dataFim)}
                {lugares && ` · ${lugares}`}
              </li>
              {evento.valorInscricaoCentavos != null && (
                <li>
                  <Icon name="give" size={18} /> {formatMoney(evento.valorInscricaoCentavos)}
                </li>
              )}
              {aberta && !listaEspera && situacao.vagasRestantes != null && (
                <li>
                  <Icon name="hands" size={18} /> {situacao.vagasRestantes} vagas restantes
                </li>
              )}
            </ul>
          </div>
          <Link href={`/inscricoes/${evento.slug}`} className={`button ${aberta ? "button-primary" : "button-outline-light"}`}>
            {listaEspera ? "Entrar na lista de espera" : aberta ? "Fazer inscrição" : "Ver detalhes"} <Icon name="arrow" />
          </Link>
        </div>
      </div>
    </section>
  );
}
