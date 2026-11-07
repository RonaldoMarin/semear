import type { Metadata } from "next";
import Link from "next/link";
import { AdminIcon, type AdminIconName } from "@/components/admin/AdminIcon";
import { StatusBadge } from "@/components/admin/StatusBadge";
import p from "@/components/admin/panel.module.css";
import { requireUser } from "@/lib/auth/guards";
import { can, papelLabel } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import { formatDate, formatDateRange } from "@/lib/eventos/format";
import { tipoEventoLabel } from "@/lib/eventos/labels";
import styles from "./dashboard.module.css";

export const metadata: Metadata = { title: "Painel" };

function saudacao() {
  const hora = Number(new Intl.DateTimeFormat("pt-BR", { hour: "numeric", hourCycle: "h23", timeZone: "America/Recife" }).format(new Date()));
  return hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
}

export default async function PainelPage({ searchParams }: { searchParams: Promise<{ senha?: string }> }) {
  const user = await requireUser();
  const { senha } = await searchParams;
  const agora = new Date();

  const [total, abertos, rascunhos, proximos, usuariosAtivos] = await Promise.all([
    db.evento.count(),
    db.evento.count({ where: { status: "INSCRICOES_ABERTAS" } }),
    db.evento.count({ where: { status: "RASCUNHO" } }),
    db.evento.findMany({
      where: { dataFim: { gte: agora }, status: { not: "CANCELADO" } },
      orderBy: { dataInicio: "asc" },
      take: 5,
      include: { locais: { take: 1, orderBy: { ordem: "asc" } } },
    }),
    db.usuario.count({ where: { ativo: true, senhaHash: { not: null } } }),
  ]);

  const proximo = proximos[0];
  const dias = proximo ? Math.max(0, Math.ceil((proximo.dataInicio.getTime() - agora.getTime()) / 86_400_000)) : null;
  const podeEditar = can(user.papel, "eventos:editar");

  const stats: { label: string; value: number | string; icon: AdminIconName; tone: string; href?: string }[] = [
    { label: "Eventos cadastrados", value: total, icon: "calendar", tone: "terra", href: "/admin/eventos" },
    { label: "Com inscrições abertas", value: abertos, icon: "sparkle", tone: "folha", href: "/admin/eventos?status=INSCRICOES_ABERTAS" },
    { label: "Rascunhos", value: rascunhos, icon: "edit", tone: "sol", href: "/admin/eventos?status=RASCUNHO" },
    { label: "Pessoas na equipe", value: usuariosAtivos, icon: "users", tone: "barro", href: can(user.papel, "usuarios:gerenciar") ? "/admin/usuarios" : undefined },
  ];

  return (
    <>
      <header className={p.pageHeader}>
        <div>
          <p className={p.kicker}>{papelLabel[user.papel]}</p>
          <h1>
            {saudacao()}, {user.nome.split(" ")[0]}!
          </h1>
          <p>Acompanhe os próximos passos da missão.</p>
        </div>
        {podeEditar && (
          <Link href="/admin/eventos/novo" className="button button-dark">
            <AdminIcon name="plus" size={18} /> Novo evento
          </Link>
        )}
      </header>

      {senha === "redefinida" && (
        <p className={styles.notice} role="status">
          <AdminIcon name="check" size={18} /> Senha alterada com sucesso. Sessões abertas em outros aparelhos foram encerradas.
        </p>
      )}

      <section className={styles.hero}>
        {proximo ? (
          <>
            <div className={styles.heroCopy}>
              <span className={styles.heroKicker}>Próximo evento</span>
              <h2>{proximo.nome}</h2>
              <ul className={styles.heroMeta}>
                <li>
                  <AdminIcon name="calendar" size={18} /> {formatDateRange(proximo.dataInicio, proximo.dataFim)}
                </li>
                {proximo.locais[0] && (
                  <li>
                    <AdminIcon name="pin" size={18} /> {[proximo.locais[0].nome, proximo.locais[0].cidade].filter(Boolean).join(", ")}
                  </li>
                )}
                {proximo.vagas && (
                  <li>
                    <AdminIcon name="users" size={18} /> {proximo.vagas} vagas
                  </li>
                )}
              </ul>
              <Link href={`/admin/eventos/${proximo.id}`} className="button button-primary">
                {podeEditar ? "Abrir evento" : "Ver evento"} <AdminIcon name="arrowRight" size={18} />
              </Link>
            </div>
            <div className={styles.countdown}>
              <strong>{dias}</strong>
              <span>{dias === 1 ? "dia para começar" : "dias para começar"}</span>
            </div>
          </>
        ) : (
          <div className={styles.heroCopy}>
            <span className={styles.heroKicker}>Próximo evento</span>
            <h2>Nenhum evento agendado</h2>
            <p>Cadastre a próxima viagem missionária para ela aparecer aqui.</p>
            {podeEditar && (
              <Link href="/admin/eventos/novo" className="button button-primary">
                <AdminIcon name="plus" size={18} /> Criar evento
              </Link>
            )}
          </div>
        )}
        <span className={styles.heroSeed} aria-hidden="true" />
      </section>

      <section className={styles.stats}>
        {stats.map((stat) => {
          const content = (
            <>
              <span className={styles.statIcon} data-tone={stat.tone}>
                <AdminIcon name={stat.icon} />
              </span>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </>
          );
          return stat.href ? (
            <Link key={stat.label} href={stat.href} className={styles.stat}>
              {content}
            </Link>
          ) : (
            <div key={stat.label} className={styles.stat}>
              {content}
            </div>
          );
        })}
      </section>

      <section className={p.card}>
        <div className={p.cardHeader}>
          <h2>Agenda</h2>
          <Link href="/admin/eventos" className="text-link">
            Ver todos
          </Link>
        </div>
        {proximos.length === 0 ? (
          <div className={p.empty}>
            <p>Sem eventos futuros por enquanto.</p>
          </div>
        ) : (
          <ul className={styles.agenda}>
            {proximos.map((evento) => (
              <li key={evento.id}>
                <Link href={`/admin/eventos/${evento.id}`}>
                  <span className={styles.date}>
                    <strong>{formatDate(evento.dataInicio, { day: "2-digit" })}</strong>
                    <span>{formatDate(evento.dataInicio, { month: "short" }).replace(".", "")}</span>
                  </span>
                  <span className={styles.agendaInfo}>
                    <strong>{evento.nome}</strong>
                    <small>
                      {tipoEventoLabel[evento.tipo]} · {formatDateRange(evento.dataInicio, evento.dataFim)}
                    </small>
                  </span>
                  <StatusBadge status={evento.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
