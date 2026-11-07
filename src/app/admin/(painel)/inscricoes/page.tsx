import type { Metadata } from "next";
import Link from "next/link";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { AutoSubmitSelect } from "@/components/admin/inscricoes/AutoSubmitSelect";
import { InscricaoActions, type InscricaoResumo } from "@/components/admin/inscricoes/InscricaoActions";
import { StatusSelect } from "@/components/admin/inscricoes/StatusSelect";
import s from "@/components/admin/inscricoes/inscricoes.module.css";
import p from "@/components/admin/panel.module.css";
import { requireUser } from "@/lib/auth/guards";
import { can } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import { formatDate, formatDateTime, toLocalInput } from "@/lib/eventos/format";
import { lerFiltros, periodos, statusInscricaoLista, urlFiltros, whereBase, whereCompleto } from "@/lib/inscricoes/filtros";
import { statusInscricaoLabel } from "@/lib/inscricoes/labels";
import type { RespostaSalva } from "@/lib/inscricoes/validacao";

export const metadata: Metadata = { title: "Inscrições" };

const POR_PAGINA = 30;
const BASE = "/admin/inscricoes";

function formatValor(r: RespostaSalva) {
  if (Array.isArray(r.valor)) return r.valor.join(", ") || "—";
  if (r.tipo === "DATA" && /^\d{4}-\d{2}-\d{2}$/.test(r.valor)) return r.valor.split("-").reverse().join("/");
  return r.valor || "—";
}

export default async function InscricoesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireUser("inscricoes:ver");
  const filtros = lerFiltros(await searchParams);
  const podeGerenciar = can(user.papel, "inscricoes:gerenciar");

  const [eventos, total, contagem, inscricoes, fila] = await Promise.all([
    db.evento.findMany({
      where: { inscricoes: { some: {} } },
      orderBy: { dataInicio: "desc" },
      select: { id: true, nome: true, vagas: true },
    }),
    db.inscricao.count({ where: whereCompleto(filtros) }),
    db.inscricao.groupBy({ by: ["status"], where: whereBase(filtros), _count: true }),
    db.inscricao.findMany({
      where: whereCompleto(filtros),
      orderBy: { criadoEm: "desc" },
      skip: (filtros.pagina - 1) * POR_PAGINA,
      take: POR_PAGINA,
      include: { evento: { select: { nome: true } } },
    }),
    // ordem de chegada na lista de espera, por evento (para mostrar "3º na fila")
    db.inscricao.findMany({
      where: { status: "LISTA_ESPERA", ...(filtros.evento ? { eventoId: filtros.evento } : {}) },
      orderBy: { criadoEm: "asc" },
      select: { id: true, eventoId: true },
    }),
  ]);

  const posicaoNaFila = new Map<string, number>();
  const contadorPorEvento = new Map<string, number>();
  for (const item of fila) {
    const n = (contadorPorEvento.get(item.eventoId) ?? 0) + 1;
    contadorPorEvento.set(item.eventoId, n);
    posicaoNaFila.set(item.id, n);
  }

  const porStatus = Object.fromEntries(contagem.map((c) => [c.status, c._count])) as Partial<Record<(typeof statusInscricaoLista)[number], number>>;
  const ativas = (porStatus.PENDENTE ?? 0) + (porStatus.CONFIRMADA ?? 0);
  const eventoSelecionado = eventos.find((e) => e.id === filtros.evento);
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const temFiltro = Boolean(filtros.q || filtros.evento || filtros.status || filtros.periodo);

  const linhas: InscricaoResumo[] = inscricoes.map((i) => ({
    id: i.id,
    protocolo: i.id.slice(-8).toUpperCase(),
    nome: i.nome ?? i.email ?? "Sem nome",
    email: i.email,
    telefone: i.telefone,
    cpf: i.cpf,
    status: i.status,
    criadoEm: formatDateTime(i.criadoEm),
    eventoNome: i.evento.nome,
    respostas: (i.respostas as unknown as RespostaSalva[]).map((r) => ({ label: r.label, valor: formatValor(r) })),
    entrevistaLocal: toLocalInput(i.entrevistaEm),
    entrevistaTexto: i.entrevistaEm ? formatDate(i.entrevistaEm, { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : null,
    entrevistaLink: i.entrevistaLink,
  }));

  return (
    <>
      <header className={p.pageHeader}>
        <div>
          <p className={p.kicker}>Participantes</p>
          <h1>Inscrições</h1>
          <p>Todas as inscrições feitas pelo site. Marque como confirmada quando o pagamento da pré-inscrição chegar.</p>
        </div>
        <a href={urlFiltros(`${BASE}/exportar`, filtros, { pagina: undefined })} className="button button-dark">
          <AdminIcon name="arrowDown" size={18} /> Exportar planilha
        </a>
      </header>

      <section className={s.stats}>
        <div className={s.stat}>
          <strong>{porStatus.CONFIRMADA ?? 0}</strong>
          <span>confirmadas</span>
        </div>
        <div className={s.stat}>
          <strong>{porStatus.PENDENTE ?? 0}</strong>
          <span>aguardando pagamento</span>
        </div>
        <div className={`${s.stat} ${s.statWait}`}>
          <strong>{porStatus.LISTA_ESPERA ?? 0}</strong>
          <span>na lista de espera</span>
        </div>
        <div className={s.stat}>
          {eventoSelecionado?.vagas != null ? (
            <>
              <strong>{Math.max(0, eventoSelecionado.vagas - ativas)}</strong>
              <span>vagas restantes de {eventoSelecionado.vagas}</span>
            </>
          ) : (
            <>
              <strong>{ativas}</strong>
              <span>ocupando vaga</span>
            </>
          )}
        </div>
      </section>

      <section className={p.card}>
        <form className={s.filters} action={BASE}>
          <div className={s.filterRow}>
            <label className={p.search}>
              <AdminIcon name="search" size={18} />
              <span className="visually-hidden">Buscar</span>
              <input type="search" name="q" defaultValue={filtros.q} placeholder="Buscar por nome, e-mail, CPF ou telefone..." />
            </label>
            <AutoSubmitSelect
              name="evento"
              label="Evento"
              defaultValue={filtros.evento}
              options={[{ value: "", label: "Todos os eventos" }, ...eventos.map((e) => ({ value: e.id, label: e.nome }))]}
            />
            <AutoSubmitSelect
              name="periodo"
              label="Período"
              defaultValue={filtros.periodo}
              options={[{ value: "", label: "Qualquer data" }, ...Object.entries(periodos).map(([value, { label }]) => ({ value, label }))]}
            />
            {filtros.status && <input type="hidden" name="status" value={filtros.status} />}
          </div>
          <div className={s.filterRow}>
            <nav className={p.chips} aria-label="Filtrar por situação">
              <Link href={urlFiltros(BASE, filtros, { status: undefined, pagina: undefined })} className={`${p.chip} ${!filtros.status ? p.chipActive : ""}`}>
                Todas
              </Link>
              {statusInscricaoLista.map((st) => (
                <Link key={st} href={urlFiltros(BASE, filtros, { status: st, pagina: undefined })} className={`${p.chip} ${filtros.status === st ? p.chipActive : ""}`}>
                  {statusInscricaoLabel[st]} <span>{porStatus[st] ?? 0}</span>
                </Link>
              ))}
            </nav>
            {temFiltro && (
              <Link href={BASE} className={s.clear}>
                Limpar filtros
              </Link>
            )}
          </div>
        </form>

        {linhas.length === 0 ? (
          <div className={p.empty}>
            <span className={p.emptyIcon}>
              <AdminIcon name="users" size={30} />
            </span>
            <h3>{temFiltro ? "Nenhuma inscrição encontrada" : "Nenhuma inscrição ainda"}</h3>
            <p>{temFiltro ? "Tente outra busca ou limpe os filtros." : "Quando alguém se inscrever pelo site, aparece aqui."}</p>
          </div>
        ) : (
          <>
            <div className={p.tableWrap}>
              <table className={p.table}>
                <thead>
                  <tr>
                    <th>Inscrito</th>
                    {!filtros.evento && <th>Evento</th>}
                    <th>Contato</th>
                    <th>Situação</th>
                    <th>Data</th>
                    <th>
                      <span className="visually-hidden">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((linha) => (
                    <tr key={linha.id}>
                      <td>
                        <div className={s.person}>
                          <strong>{linha.nome}</strong>
                          <small>{linha.cpf ?? `#${linha.protocolo}`}</small>
                          {linha.entrevistaTexto && (
                            <span className={s.entrevistaTag} title={linha.entrevistaLink ?? undefined}>
                              <AdminIcon name="calendar" size={13} /> Entrevista {linha.entrevistaTexto}
                            </span>
                          )}
                        </div>
                      </td>
                      {!filtros.evento && (
                        <td data-label="Evento">
                          <span className={s.eventTag}>{linha.eventoNome}</span>
                        </td>
                      )}
                      <td data-label="Contato">
                        <div className={s.person}>
                          <strong>{linha.telefone ?? "—"}</strong>
                          <small>{linha.email ?? ""}</small>
                        </div>
                      </td>
                      <td data-label="Situação">
                        <StatusSelect id={linha.id} status={linha.status} nome={linha.nome} email={linha.email} disabled={!podeGerenciar} />
                        {posicaoNaFila.has(linha.id) && <small className={s.queue}>{posicaoNaFila.get(linha.id)}º na fila</small>}
                      </td>
                      <td data-label="Data" className={p.muted}>
                        {linha.criadoEm}
                      </td>
                      <td>
                        <InscricaoActions inscricao={linha} podeGerenciar={podeGerenciar} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className={s.pagination}>
              <span>
                {total} {total === 1 ? "inscrição" : "inscrições"} · página {filtros.pagina} de {paginas}
              </span>
              <div>
                {filtros.pagina > 1 ? <Link href={urlFiltros(BASE, filtros, { pagina: filtros.pagina - 1 })}>Anterior</Link> : <span aria-disabled="true">Anterior</span>}
                {filtros.pagina < paginas ? <Link href={urlFiltros(BASE, filtros, { pagina: filtros.pagina + 1 })}>Próxima</Link> : <span aria-disabled="true">Próxima</span>}
              </div>
            </footer>
          </>
        )}
      </section>
    </>
  );
}
