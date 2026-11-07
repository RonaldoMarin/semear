/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma, StatusEvento } from "@prisma/client";
import { duplicarEvento, excluirEvento } from "@/app/admin/actions/eventos";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import p from "@/components/admin/panel.module.css";
import { requireUser } from "@/lib/auth/guards";
import { can } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import { formatDateRange, formatMoney } from "@/lib/eventos/format";
import { statusEventoLabel, tipoEventoLabel } from "@/lib/eventos/labels";
import { STATUS_OCUPA_VAGA } from "@/lib/inscricoes/labels";

export const metadata: Metadata = { title: "Eventos" };

const statusList = Object.keys(statusEventoLabel) as StatusEvento[];

export default async function EventosPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const user = await requireUser("eventos:ver");
  const { q = "", status } = await searchParams;
  const statusFiltro = statusList.includes(status as StatusEvento) ? (status as StatusEvento) : undefined;

  const where: Prisma.EventoWhereInput = {
    ...(q ? { OR: [{ nome: { contains: q, mode: "insensitive" } }, { subtitulo: { contains: q, mode: "insensitive" } }] } : {}),
  };

  const [eventos, contagem] = await Promise.all([
    db.evento.findMany({
      where: { ...where, ...(statusFiltro ? { status: statusFiltro } : {}) },
      orderBy: [{ dataInicio: "desc" }],
      include: { locais: { take: 1, orderBy: { ordem: "asc" } }, _count: { select: { inscricoes: { where: { status: { in: STATUS_OCUPA_VAGA } } } } } },
    }),
    db.evento.groupBy({ by: ["status"], where, _count: true }),
  ]);

  const total = contagem.reduce((acc, item) => acc + item._count, 0);
  const porStatus = Object.fromEntries(contagem.map((item) => [item.status, item._count]));
  const podeEditar = can(user.papel, "eventos:editar");
  const podeExcluir = can(user.papel, "eventos:excluir");
  const podeVerInscricoes = can(user.papel, "inscricoes:ver");

  const chipHref = (s?: StatusEvento) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (s) params.set("status", s);
    const query = params.toString();
    return `/admin/eventos${query ? `?${query}` : ""}`;
  };

  return (
    <>
      <header className={p.pageHeader}>
        <div>
          <p className={p.kicker}>Missão</p>
          <h1>Eventos</h1>
          <p>Viagens missionárias, treinamentos e encontros. Rascunhos aparecem só aqui no painel.</p>
        </div>
        {podeEditar && (
          <Link href="/admin/eventos/novo" className="button button-dark">
            <AdminIcon name="plus" size={18} /> Novo evento
          </Link>
        )}
      </header>

      <section className={p.card}>
        <form className={p.toolbar} action="/admin/eventos">
          <label className={p.search}>
            <AdminIcon name="search" size={18} />
            <span className="visually-hidden">Buscar eventos</span>
            <input type="search" name="q" defaultValue={q} placeholder="Buscar eventos..." />
          </label>
          {statusFiltro && <input type="hidden" name="status" value={statusFiltro} />}
          <nav className={p.chips} aria-label="Filtrar por status">
            <Link href={chipHref()} className={`${p.chip} ${!statusFiltro ? p.chipActive : ""}`}>
              Todos <span>{total}</span>
            </Link>
            {statusList
              .filter((s) => porStatus[s])
              .map((s) => (
                <Link key={s} href={chipHref(s)} className={`${p.chip} ${statusFiltro === s ? p.chipActive : ""}`}>
                  {statusEventoLabel[s]} <span>{porStatus[s]}</span>
                </Link>
              ))}
          </nav>
        </form>

        {eventos.length === 0 ? (
          <div className={p.empty}>
            <span className={p.emptyIcon}>
              <AdminIcon name="calendar" size={30} />
            </span>
            <h3>{q || statusFiltro ? "Nenhum evento encontrado" : "Nenhum evento ainda"}</h3>
            <p>{q || statusFiltro ? "Tente outra busca ou limpe os filtros." : "Cadastre a próxima viagem missionária para começar a receber inscrições."}</p>
            {podeEditar && !q && !statusFiltro && (
              <Link href="/admin/eventos/novo" className="button button-primary">
                <AdminIcon name="plus" size={18} /> Criar primeiro evento
              </Link>
            )}
          </div>
        ) : (
          <div className={p.tableWrap}>
            <table className={p.table}>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Inscritos</th>
                  <th>Taxa</th>
                  <th>
                    <span className="visually-hidden">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {eventos.map((evento) => (
                  <tr key={evento.id}>
                    <td>
                      <div className={p.eventCell}>
                        <span className={p.thumb}>
                          {evento.imagemUrl ? <img src={evento.imagemUrl} alt="" /> : <AdminIcon name="calendar" />}
                        </span>
                        <div>
                          <Link href={`/admin/eventos/${evento.id}`}>
                            {evento.nome} {evento.destaque && <span className={p.star} title="Em destaque">★</span>}
                          </Link>
                          <small>
                            {tipoEventoLabel[evento.tipo]}
                            {evento.locais[0] ? ` · ${evento.locais[0].cidade ?? evento.locais[0].nome}` : ""}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td data-label="Data" className={p.muted}>
                      {formatDateRange(evento.dataInicio, evento.dataFim)}
                    </td>
                    <td data-label="Status">
                      <StatusBadge status={evento.status} />
                    </td>
                    <td data-label="Inscritos" className={p.strong}>
                      {podeVerInscricoes ? (
                        <Link href={`/admin/inscricoes?evento=${evento.id}`} className={p.countLink}>
                          {evento._count.inscricoes} <span>/ {evento.vagas ?? "∞"}</span>
                        </Link>
                      ) : (
                        <>
                          {evento._count.inscricoes} <span className={p.muted}>/ {evento.vagas ?? "∞"}</span>
                        </>
                      )}
                    </td>
                    <td data-label="Taxa" className={p.muted}>
                      {evento.valorInscricaoCentavos ? formatMoney(evento.valorInscricaoCentavos) : "Gratuito"}
                    </td>
                    <td>
                      <div className={p.actions}>
                        {podeVerInscricoes && (
                          <Link href={`/admin/inscricoes?evento=${evento.id}`} className={p.iconButton} aria-label={`Inscrições de ${evento.nome}`} title="Inscrições">
                            <AdminIcon name="users" size={18} />
                          </Link>
                        )}
                        <Link href={`/admin/eventos/${evento.id}`} className={p.iconButton} aria-label={podeEditar ? `Editar ${evento.nome}` : `Ver ${evento.nome}`} title={podeEditar ? "Editar" : "Ver"}>
                          <AdminIcon name={podeEditar ? "edit" : "eye"} size={18} />
                        </Link>
                        {podeEditar && (
                          <ConfirmButton
                            icon="copy"
                            label={`Duplicar ${evento.nome}`}
                            title="Duplicar evento?"
                            message={`Vamos criar uma cópia de “${evento.nome}” como rascunho, com as mesmas perguntas, locais e programação.`}
                            confirmLabel="Duplicar"
                            action={duplicarEvento.bind(null, evento.id)}
                          />
                        )}
                        {podeExcluir && (
                          <ConfirmButton
                            icon="trash"
                            danger
                            label={`Excluir ${evento.nome}`}
                            title="Excluir evento?"
                            message={`“${evento.nome}” será excluído com programação, perguntas e contatos. Essa ação não pode ser desfeita.`}
                            confirmLabel="Excluir"
                            action={excluirEvento.bind(null, evento.id)}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
