import type { Metadata } from "next";
import type { Papel } from "@prisma/client";
import { alternarAtivo, removerConvite } from "@/app/admin/actions/usuarios";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import p from "@/components/admin/panel.module.css";
import { InviteDialog } from "@/components/admin/usuarios/InviteDialog";
import { RoleSelect } from "@/components/admin/usuarios/RoleSelect";
import s from "@/components/admin/usuarios/usuarios.module.css";
import { isAdminEmail } from "@/lib/auth/admin-emails";
import { requireUser } from "@/lib/auth/guards";
import { papelDescricao, papelLabel } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/eventos/format";

export const metadata: Metadata = { title: "Usuários" };

const papeis: Papel[] = ["ADM", "VOLUNTARIO", "ACESSO"];

function iniciais(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
}

export default async function UsuariosPage() {
  const user = await requireUser("usuarios:gerenciar");
  const usuarios = await db.usuario.findMany({ orderBy: [{ ativo: "desc" }, { papel: "desc" }, { nome: "asc" }] });

  const ativos = usuarios.filter((u) => u.ativo && u.senhaHash);
  const aguardando = usuarios.filter((u) => u.ativo && !u.senhaHash).length;
  const porPapel = (papel: Papel) => ativos.filter((u) => u.papel === papel).length;

  return (
    <>
      <header className={p.pageHeader}>
        <div>
          <p className={p.kicker}>Equipe</p>
          <h1>Usuários</h1>
          <p>Quem pode entrar no painel e o que cada pessoa pode fazer.</p>
        </div>
        <InviteDialog />
      </header>

      <section className={s.summary} aria-label="Resumo da equipe">
        {papeis.map((papel) => (
          <div key={papel} className={s.summaryItem} data-papel={papel}>
            <strong>{porPapel(papel)}</strong>
            <span>{papelLabel[papel]}</span>
          </div>
        ))}
        <div className={s.summaryItem} data-papel="PENDENTE">
          <strong>{aguardando}</strong>
          <span>Aguardando cadastro</span>
        </div>
      </section>

      <section className={p.card}>
        <div className={s.listHeader} aria-hidden="true">
          <span>Pessoa</span>
          <span>Permissão</span>
          <span>Situação</span>
          <span>Último acesso</span>
          <span />
        </div>
        <ul className={s.list}>
          {usuarios.map((u) => {
            const principal = isAdminEmail(u.email);
            const voce = u.id === user.id;
            const editavel = !principal && !voce;
            return (
              <li key={u.id} className={`${s.row} ${!u.ativo ? s.rowOff : ""}`}>
                <div className={s.person}>
                  <span className={s.avatar} data-papel={u.papel} aria-hidden="true">
                    {iniciais(u.nome)}
                  </span>
                  <div>
                    <strong>
                      {u.nome}
                      {voce && <span className={s.you}>Você</span>}
                    </strong>
                    <small>{u.email}</small>
                  </div>
                </div>

                <div className={s.cell} data-label="Permissão">
                  {editavel ? (
                    <RoleSelect id={u.id} papel={u.papel} nome={u.nome} />
                  ) : (
                    <span className={s.role} data-papel={u.papel}>
                      {papelLabel[u.papel]}
                    </span>
                  )}
                </div>

                <div className={s.cell} data-label="Situação">
                  {!u.ativo ? (
                    <span className={`${s.tag} ${s.tagOff}`}>Desativado</span>
                  ) : u.senhaHash ? (
                    <span className={`${s.tag} ${s.tagOk}`}>Ativo</span>
                  ) : (
                    <span className={`${s.tag} ${s.tagPending}`}>Aguardando cadastro</span>
                  )}
                  {principal && (
                    <span className={`${s.tag} ${s.tagMain}`} title="Definido na variável ADMIN_EMAILS do servidor">
                      Admin principal
                    </span>
                  )}
                </div>

                <div className={`${s.cell} ${s.muted}`} data-label="Último acesso">
                  {u.ultimoAcessoEm ? formatDateTime(u.ultimoAcessoEm) : "Nunca entrou"}
                </div>

                <div className={s.actions}>
                  {editavel &&
                    (u.senhaHash ? (
                      <ConfirmButton
                        icon={u.ativo ? "logout" : "check"}
                        danger={u.ativo}
                        label={u.ativo ? `Desativar ${u.nome}` : `Reativar ${u.nome}`}
                        title={u.ativo ? "Desativar acesso?" : "Reativar acesso?"}
                        message={u.ativo ? `${u.nome} será desconectado e não conseguirá mais entrar no painel.` : `${u.nome} voltará a acessar o painel.`}
                        confirmLabel={u.ativo ? "Desativar" : "Reativar"}
                        action={alternarAtivo.bind(null, u.id)}
                      />
                    ) : (
                      <ConfirmButton
                        icon="trash"
                        danger
                        label={`Remover convite de ${u.nome}`}
                        title="Remover convite?"
                        message={`${u.email} não poderá mais criar conta.`}
                        confirmLabel="Remover"
                        action={removerConvite.bind(null, u.id)}
                      />
                    ))}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={s.legend} aria-label="O que cada permissão pode fazer">
        {papeis.map((papel) => (
          <div key={papel} className={s.legendItem}>
            <span className={s.role} data-papel={papel}>
              {papelLabel[papel]}
            </span>
            <p>{papelDescricao[papel]}</p>
          </div>
        ))}
        <p className={s.legendNote}>
          <strong>Admin principal</strong> é quem está na variável <code>ADMIN_EMAILS</code> do servidor: sempre administrador e não pode ser
          alterado por aqui.
        </p>
      </section>
    </>
  );
}
