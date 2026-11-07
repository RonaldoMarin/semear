"use client";

import { useId } from "react";
import type { StatusEvento, TipoEvento, TipoPergunta } from "@prisma/client";
import { perguntasPadrao } from "@/lib/eventos/defaults";
import { formatMoney, parseMoney } from "@/lib/eventos/format";
import {
  statusEventoDescricao,
  statusEventoLabel,
  tipoEventoLabel,
  tipoPerguntaLabel,
  tiposComOpcoes,
} from "@/lib/eventos/labels";
import type { EventoFormValues, FieldErrors, PerguntaForm } from "@/lib/eventos/schema";
import { AdminIcon } from "../AdminIcon";
import f from "../forms.module.css";
import { SelectField, Switch, TextArea, TextField } from "./fields";
import styles from "./EventWizard.module.css";

export interface StepProps {
  values: EventoFormValues;
  /** Aceita o novo valor ou uma função que recebe o valor mais recente (evita estado desatualizado em listas). */
  set: <K extends keyof EventoFormValues>(
    key: K,
    value: EventoFormValues[K] | ((current: EventoFormValues[K]) => EventoFormValues[K]),
  ) => void;
  errors: FieldErrors;
  canPublish: boolean;
}

/* ---------- utilitários de listas ---------- */

function move<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

function ItemActions({
  index,
  total,
  onMove,
  onRemove,
  label,
}: {
  index: number;
  total: number;
  onMove: (to: number) => void;
  onRemove: () => void;
  label: string;
}) {
  return (
    <div className={styles.itemActions}>
      <button type="button" onClick={() => onMove(index - 1)} disabled={index === 0} aria-label={`Mover ${label} para cima`} title="Mover para cima">
        <AdminIcon name="arrowUp" size={16} />
      </button>
      <button type="button" onClick={() => onMove(index + 1)} disabled={index === total - 1} aria-label={`Mover ${label} para baixo`} title="Mover para baixo">
        <AdminIcon name="arrowDown" size={16} />
      </button>
      <button type="button" className={styles.danger} onClick={onRemove} aria-label={`Remover ${label}`} title="Remover">
        <AdminIcon name="trash" size={16} />
      </button>
    </div>
  );
}

function EmptyList({ icon, text }: { icon: "pin" | "clock" | "question" | "phone"; text: string }) {
  return (
    <div className={styles.emptyList}>
      <AdminIcon name={icon} size={26} />
      <p>{text}</p>
    </div>
  );
}

/* ---------- 1. Dados gerais ---------- */

const tipoOptions = (Object.keys(tipoEventoLabel) as TipoEvento[]).map((value) => ({ value, label: tipoEventoLabel[value] }));
const statusList = Object.keys(statusEventoLabel) as StatusEvento[];

export function StepGeral({ values, set, errors, canPublish }: StepProps) {
  return (
    <div className={f.stack}>
      <TextField label="Nome do evento" required value={values.nome} onChange={(v) => set("nome", v)} error={errors.nome} placeholder="Ex.: Missão Semear no Sertão 2027" maxLength={200} />
      <div className={f.grid2}>
        <TextField label="Subtítulo" optional value={values.subtitulo} onChange={(v) => set("subtitulo", v)} error={errors.subtitulo} placeholder="Ex.: Projeto missionário no sertão potiguar" />
        <TextField label="Edição" optional value={values.edicao} onChange={(v) => set("edicao", v)} error={errors.edicao} placeholder="Ex.: 12ª edição" />
      </div>
      <SelectField label="Tipo de evento" value={values.tipo} onChange={(v) => set("tipo", v)} options={tipoOptions} />

      <fieldset className={styles.fieldset}>
        <legend className={f.label}>Status</legend>
        {!canPublish && <p className={f.hint}>Somente administradores podem alterar o status. Eventos criados por voluntários ficam como rascunho.</p>}
        <div className={styles.statusGrid}>
          {statusList.map((status) => (
            <label key={status} className={`${styles.statusOption} ${values.status === status ? styles.statusSelected : ""}`} data-status={status}>
              <input type="radio" name="status" value={status} checked={values.status === status} onChange={() => set("status", status)} disabled={!canPublish} />
              <span className={styles.statusDot} aria-hidden="true" />
              <span>
                <strong>{statusEventoLabel[status]}</strong>
                <small>{statusEventoDescricao[status]}</small>
              </span>
            </label>
          ))}
        </div>
        {errors.status && <p className={f.error}>{errors.status}</p>}
      </fieldset>

      <Switch checked={values.destaque} onChange={(v) => set("destaque", v)} label="Destacar no site" description="Mostra este evento em evidência na página inicial." />

      <TextArea label="Resumo" optional rows={3} value={values.resumo} onChange={(v) => set("resumo", v)} error={errors.resumo} maxLength={500} hint="Uma ou duas frases para cards e compartilhamentos (até 500 caracteres)." />
      <TextArea label="Sobre o evento" optional rows={8} value={values.sobre} onChange={(v) => set("sobre", v)} error={errors.sobre} hint="Texto completo de apresentação: propósito, público, como vai funcionar." />
    </div>
  );
}

/* ---------- 2. Datas e vagas ---------- */

export function StepDatas({ values, set, errors }: StepProps) {
  return (
    <div className={f.stack}>
      <h3 className={styles.groupTitle}>Período do evento</h3>
      <div className={f.grid2}>
        <TextField label="Início" required type="datetime-local" value={values.dataInicio} onChange={(v) => set("dataInicio", v)} error={errors.dataInicio} />
        <TextField label="Término" required type="datetime-local" value={values.dataFim} onChange={(v) => set("dataFim", v)} error={errors.dataFim} />
      </div>

      <h3 className={styles.groupTitle}>Inscrições</h3>
      <div className={f.grid2}>
        <TextField label="Abertura das inscrições" optional type="datetime-local" value={values.inscricaoInicio} onChange={(v) => set("inscricaoInicio", v)} error={errors.inscricaoInicio} />
        <TextField label="Encerramento das inscrições" optional type="datetime-local" value={values.inscricaoFim} onChange={(v) => set("inscricaoFim", v)} error={errors.inscricaoFim} hint="Deixe em branco para encerrar ao preencher as vagas." />
      </div>
      <div className={f.grid2}>
        <TextField label="Vagas" optional inputMode="numeric" value={values.vagas} onChange={(v) => set("vagas", v.replace(/\D/g, ""))} error={errors.vagas} placeholder="Ex.: 50" hint="Deixe em branco para vagas ilimitadas." />
        <TextField label="Idade mínima" optional inputMode="numeric" value={values.idadeMinima} onChange={(v) => set("idadeMinima", v.replace(/\D/g, ""))} error={errors.idadeMinima} placeholder="Ex.: 16" />
      </div>
      <TextArea label="Requisitos para participar" optional rows={3} value={values.requisitos} onChange={(v) => set("requisitos", v)} error={errors.requisitos} />
    </div>
  );
}

/* ---------- 3. Local e mídia ---------- */

export function StepLocal({ values, set, errors }: StepProps) {
  const locais = values.locais;
  const update = (index: number, patch: Partial<(typeof locais)[number]>) =>
    set("locais", (list) => list.map((l, i) => (i === index ? { ...l, ...patch } : l)));

  return (
    <div className={f.stack}>
      <div className={styles.listHeader}>
        <h3 className={styles.groupTitle}>Locais</h3>
        <p className={f.hint}>Use a etapa para separar, por exemplo, o local do teórico e do prático.</p>
      </div>

      {locais.length === 0 && <EmptyList icon="pin" text="Nenhum local adicionado ainda." />}

      {locais.map((local, index) => (
        <div key={index} className={styles.itemCard}>
          <div className={styles.itemHeader}>
            <span className={styles.itemIndex}>Local {index + 1}</span>
            <ItemActions index={index} total={locais.length} label={`local ${index + 1}`} onMove={(to) => set("locais", (list) => move(list, index, to))} onRemove={() => set("locais", (list) => list.filter((_, i) => i !== index))} />
          </div>
          <div className={f.grid2}>
            <TextField label="Etapa" optional value={local.etapa} onChange={(v) => update(index, { etapa: v })} placeholder="Ex.: Teórico" error={errors[`locais.${index}.etapa`]} />
            <TextField label="Nome do local" required value={local.nome} onChange={(v) => update(index, { nome: v })} placeholder="Ex.: Sítio Malhada da Areia" error={errors[`locais.${index}.nome`]} />
          </div>
          <TextField label="Endereço" optional value={local.endereco} onChange={(v) => update(index, { endereco: v })} placeholder="Rua, número, zona, CEP" error={errors[`locais.${index}.endereco`]} />
          <div className={styles.cityRow}>
            <TextField label="Cidade" optional value={local.cidade} onChange={(v) => update(index, { cidade: v })} error={errors[`locais.${index}.cidade`]} />
            <TextField label="UF" optional value={local.uf} onChange={(v) => update(index, { uf: v.toUpperCase().slice(0, 2) })} maxLength={2} error={errors[`locais.${index}.uf`]} />
          </div>
        </div>
      ))}

      <button type="button" className={styles.addButton} onClick={() => set("locais", (list) => [...list, { etapa: "", nome: "", endereco: "", cidade: "", uf: "RN" }])}>
        <AdminIcon name="plus" size={18} /> Adicionar local
      </button>

      <h3 className={styles.groupTitle}>Mídia</h3>
      <div className={styles.mediaRow}>
        <div className={styles.imagePreview} aria-hidden="true">
          {values.imagemUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={values.imagemUrl} alt="" />
          ) : (
            <AdminIcon name="image" size={30} />
          )}
        </div>
        <div className={f.stack}>
          <TextField label="Imagem de capa (link)" optional type="url" value={values.imagemUrl} onChange={(v) => set("imagemUrl", v)} error={errors.imagemUrl} placeholder="https://..." hint="Cole o link de uma imagem já publicada (ex.: Google Drive público, Imgur)." />
          <TextField label="Vídeo (YouTube)" optional type="url" value={values.videoUrl} onChange={(v) => set("videoUrl", v)} error={errors.videoUrl} placeholder="https://youtube.com/..." />
        </div>
      </div>
    </div>
  );
}

/* ---------- 4. Valores ---------- */

export function StepValores({ values, set, errors }: StepProps) {
  const total = parseMoney(values.valorInscricao);
  const pre = parseMoney(values.valorPreInscricao);
  const restante = total != null && pre != null && !Number.isNaN(total) && !Number.isNaN(pre) ? total - pre : null;

  return (
    <div className={f.stack}>
      <div className={f.grid3}>
        <TextField label="Taxa de inscrição" optional prefix="R$" inputMode="decimal" value={values.valorInscricao} onChange={(v) => set("valorInscricao", v)} error={errors.valorInscricao} placeholder="450,00" hint="Deixe em branco se for gratuito." />
        <TextField label="Pré-inscrição" optional prefix="R$" inputMode="decimal" value={values.valorPreInscricao} onChange={(v) => set("valorPreInscricao", v)} error={errors.valorPreInscricao} placeholder="100,00" />
        <TextField label="Prazo da pré-inscrição" optional inputMode="numeric" value={values.prazoPreInscricaoDias} onChange={(v) => set("prazoPreInscricaoDias", v.replace(/\D/g, ""))} error={errors.prazoPreInscricaoDias} placeholder="5" hint="Em dias úteis após a inscrição." />
      </div>

      {restante != null && restante >= 0 && (
        <div className={styles.moneySummary}>
          <AdminIcon name="money" />
          <span>
            Pré-inscrição de <strong>{formatMoney(pre)}</strong> + restante de <strong>{formatMoney(restante)}</strong> = <strong>{formatMoney(total)}</strong>
          </span>
        </div>
      )}

      <TextArea label="Informações de pagamento" optional rows={6} value={values.informacoesPagamento} onChange={(v) => set("informacoesPagamento", v)} error={errors.informacoesPagamento} placeholder={"Chave PIX: ...\nBanco / agência / conta: ...\nParcelamento: restante em 30/60 dias até ..."} hint="Aparece para o inscrito após a inscrição." />
      <TextArea label="Política de cancelamento" optional rows={3} value={values.politicaCancelamento} onChange={(v) => set("politicaCancelamento", v)} error={errors.politicaCancelamento} />
    </div>
  );
}

/* ---------- 5. Programação ---------- */

export function StepProgramacao({ values, set, errors }: StepProps) {
  const itens = values.programacao;
  const update = (index: number, patch: Partial<(typeof itens)[number]>) =>
    set("programacao", (list) => list.map((p, i) => (i === index ? { ...p, ...patch } : p)));

  return (
    <div className={f.stack}>
      <p className={f.hint}>Monte o cronograma: chegada, aulas do teórico, saída para o campo, cultos, retorno...</p>
      {itens.length === 0 && <EmptyList icon="clock" text="A programação ainda está vazia." />}

      <ol className={styles.timeline}>
        {itens.map((item, index) => (
          <li key={index} className={styles.itemCard}>
            <div className={styles.itemHeader}>
              <span className={styles.itemIndex}>Item {index + 1}</span>
              <ItemActions index={index} total={itens.length} label={`item ${index + 1}`} onMove={(to) => set("programacao", (list) => move(list, index, to))} onRemove={() => set("programacao", (list) => list.filter((_, i) => i !== index))} />
            </div>
            <TextField label="Título" required value={item.titulo} onChange={(v) => update(index, { titulo: v })} error={errors[`programacao.${index}.titulo`]} placeholder="Ex.: Abertura e culto de envio" />
            <div className={f.grid2}>
              <TextField label="Início" required type="datetime-local" value={item.inicio} onChange={(v) => update(index, { inicio: v })} error={errors[`programacao.${index}.inicio`]} />
              <TextField label="Fim" optional type="datetime-local" value={item.fim} onChange={(v) => update(index, { fim: v })} error={errors[`programacao.${index}.fim`]} />
            </div>
            <TextArea label="Descrição" optional rows={2} value={item.descricao} onChange={(v) => update(index, { descricao: v })} error={errors[`programacao.${index}.descricao`]} />
          </li>
        ))}
      </ol>

      <button
        type="button"
        className={styles.addButton}
        onClick={() =>
          set("programacao", (list) => [...list, { titulo: "", inicio: list.at(-1)?.fim || list.at(-1)?.inicio || values.dataInicio, fim: "", descricao: "" }])
        }
      >
        <AdminIcon name="plus" size={18} /> Adicionar item na programação
      </button>
    </div>
  );
}

/* ---------- 6. Perguntas da inscrição ---------- */

const tipoPerguntaOptions = (Object.keys(tipoPerguntaLabel) as TipoPergunta[]).map((value) => ({ value, label: tipoPerguntaLabel[value] }));

function PerguntaPreview({ pergunta, condicao }: { pergunta: PerguntaForm; condicao: string | null }) {
  const opcoes = pergunta.opcoes.filter(Boolean);
  return (
    <div className={styles.preview} aria-hidden="true">
      <span className={styles.previewLabel}>Prévia</span>
      {condicao && <span className={styles.previewCondition}>Aparece se: {condicao}</span>}
      <strong>
        {pergunta.label || "Pergunta sem título"}
        {pergunta.obrigatoria && <span className={f.required}>*</span>}
      </strong>
      {pergunta.ajuda && <small>{pergunta.ajuda}</small>}
      {tiposComOpcoes.includes(pergunta.tipo) ? (
        <ul>
          {(opcoes.length ? opcoes : ["Opção 1", "Opção 2"]).map((opcao, i) => (
            <li key={i}>
              <span className={pergunta.tipo === "ESCOLHA_UNICA" ? styles.fakeRadio : styles.fakeCheck} />
              {opcao}
            </li>
          ))}
        </ul>
      ) : (
        <span className={pergunta.tipo === "PARAGRAFO" ? styles.fakeTextarea : styles.fakeInput}>
          {pergunta.tipo === "DATA" ? "dd/mm/aaaa" : pergunta.tipo === "CPF" ? "000.000.000-00" : pergunta.tipo === "TELEFONE" ? "(00) 00000-0000" : pergunta.tipo === "EMAIL" ? "nome@email.com" : "Resposta"}
        </span>
      )}
    </div>
  );
}

function SectionField({ value, sections, onChange, error }: { value: string; sections: string[]; onChange: (v: string) => void; error?: string }) {
  const listId = useId();
  return (
    <div className={f.field}>
      <label className={f.label} htmlFor={`${listId}-input`}>
        Seção <small>(etapa do formulário)</small>
      </label>
      <input
        id={`${listId}-input`}
        list={listId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${f.input} ${error ? f.invalid : ""}`}
        placeholder="Ex.: Sobre você"
        maxLength={80}
      />
      <datalist id={listId}>
        {sections.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
      {error && <p className={f.error}>{error}</p>}
    </div>
  );
}

const novaChave = () => `p_${Math.random().toString(36).slice(2, 9)}`;

function ConditionField({
  pergunta,
  anteriores,
  onChange,
  errors,
}: {
  pergunta: PerguntaForm;
  anteriores: PerguntaForm[];
  onChange: (patch: Partial<PerguntaForm>) => void;
  errors: { chave?: string; valor?: string };
}) {
  const candidatas = anteriores.filter((p) => tiposComOpcoes.includes(p.tipo) && p.opcoes.some(Boolean));
  const ativa = Boolean(pergunta.condicaoChave);
  const pai = candidatas.find((p) => p.chave === pergunta.condicaoChave);

  if (candidatas.length === 0 && !ativa) return null;

  return (
    <div className={styles.condition}>
      <Switch
        checked={ativa}
        onChange={(v) =>
          onChange(v ? { condicaoChave: candidatas.at(-1)?.chave ?? "", condicaoValor: candidatas.at(-1)?.opcoes.find(Boolean) ?? "" } : { condicaoChave: "", condicaoValor: "" })
        }
        label="Mostrar só para quem responder…"
        description="A pergunta aparece apenas quando outra resposta for escolhida (ex.: camisa extra = Sim)."
      />
      {ativa && (
        <div className={f.grid2}>
          <SelectField
            label="Pergunta"
            value={pergunta.condicaoChave}
            onChange={(chave) => onChange({ condicaoChave: chave, condicaoValor: candidatas.find((c) => c.chave === chave)?.opcoes.find(Boolean) ?? "" })}
            options={[
              ...(pai ? [] : [{ value: pergunta.condicaoChave, label: "— escolha —" }]),
              ...candidatas.map((c) => ({ value: c.chave, label: c.label || "Pergunta sem título" })),
            ]}
            error={errors.chave}
          />
          <SelectField
            label="Resposta que libera"
            value={pergunta.condicaoValor}
            onChange={(valor) => onChange({ condicaoValor: valor })}
            options={[
              ...(pai?.opcoes.includes(pergunta.condicaoValor) ? [] : [{ value: pergunta.condicaoValor, label: "— escolha —" }]),
              ...(pai?.opcoes.filter(Boolean).map((o) => ({ value: o, label: o })) ?? []),
            ]}
            error={errors.valor}
          />
        </div>
      )}
    </div>
  );
}

export function StepInscricao({ values, set, errors }: StepProps) {
  const perguntas = values.perguntas;
  const update = (index: number, patch: Partial<PerguntaForm>) =>
    set("perguntas", (list) => list.map((p, i) => (i === index ? { ...p, ...patch } : p)));

  const secoes = [...new Set(perguntas.map((p) => p.secao.trim()).filter(Boolean))];

  const restaurar = () => {
    if (perguntas.length && !window.confirm("Substituir as perguntas atuais pelas perguntas padrão da missão?")) return;
    set("perguntas", perguntasPadrao.map((p) => ({ ...p, opcoes: [...p.opcoes] })));
  };

  return (
    <div className={f.stack}>
      <div className={styles.inlineNotice}>
        <AdminIcon name="info" />
        <p>
          As perguntas abaixo começam iguais às do formulário atual da missão. Edite, reordene ou remova à vontade. A{" "}
          <strong>seção</strong> agrupa as perguntas em etapas no formulário do site — perguntas seguidas com a mesma seção
          aparecem juntas.
        </p>
        <button type="button" className={styles.linkButton} onClick={restaurar}>
          Restaurar padrão
        </button>
      </div>
      {errors.perguntas && <div className={f.alert}>{errors.perguntas}</div>}

      {perguntas.length === 0 && <EmptyList icon="question" text="Nenhuma pergunta. Adicione ou restaure as perguntas padrão." />}

      {perguntas.map((pergunta, index) => {
        const temOpcoes = tiposComOpcoes.includes(pergunta.tipo);
        return (
          <div key={pergunta.chave} className={`${styles.itemCard} ${styles.questionCard}`}>
            <div className={styles.questionEditor}>
              <div className={styles.itemHeader}>
                <span className={styles.itemIndex}>
                  Pergunta {index + 1}
                  {pergunta.condicaoChave && <span className={styles.conditionalTag}>Condicional</span>}
                </span>
                <ItemActions index={index} total={perguntas.length} label={`pergunta ${index + 1}`} onMove={(to) => set("perguntas", (list) => move(list, index, to))} onRemove={() => set("perguntas", (list) => list.filter((_, i) => i !== index))} />
              </div>
              <TextField label="Pergunta" required value={pergunta.label} onChange={(v) => update(index, { label: v })} error={errors[`perguntas.${index}.label`]} />
              <SectionField value={pergunta.secao} sections={secoes} onChange={(v) => update(index, { secao: v })} error={errors[`perguntas.${index}.secao`]} />
              <div className={f.grid2}>
                <SelectField
                  label="Tipo de resposta"
                  value={pergunta.tipo}
                  onChange={(v) => update(index, { tipo: v, opcoes: tiposComOpcoes.includes(v) && pergunta.opcoes.length === 0 ? ["", ""] : pergunta.opcoes })}
                  options={tipoPerguntaOptions}
                />
                <div className={styles.switchCell}>
                  <Switch checked={pergunta.obrigatoria} onChange={(v) => update(index, { obrigatoria: v })} label="Obrigatória" />
                </div>
              </div>
              <TextField label="Texto de ajuda" optional value={pergunta.ajuda} onChange={(v) => update(index, { ajuda: v })} error={errors[`perguntas.${index}.ajuda`]} placeholder="Ex.: informe também o nome do responsável" />

              <ConditionField
                pergunta={pergunta}
                anteriores={perguntas.slice(0, index)}
                onChange={(patch) => update(index, patch)}
                errors={{ chave: errors[`perguntas.${index}.condicaoChave`], valor: errors[`perguntas.${index}.condicaoValor`] }}
              />

              {temOpcoes && (
                <div className={styles.options}>
                  <span className={f.label}>Opções</span>
                  {pergunta.opcoes.map((opcao, i) => (
                    <div key={i} className={styles.optionRow}>
                      <span className={pergunta.tipo === "ESCOLHA_UNICA" ? styles.fakeRadio : styles.fakeCheck} aria-hidden="true" />
                      <input
                        className={f.input}
                        value={opcao}
                        aria-label={`Opção ${i + 1}`}
                        placeholder={`Opção ${i + 1}`}
                        onChange={(event) => {
                          const text = event.target.value;
                          set("perguntas", (list) => list.map((p, k) => (k === index ? { ...p, opcoes: p.opcoes.map((o, j) => (j === i ? text : o)) } : p)));
                        }}
                      />
                      <button type="button" className={styles.iconButton} onClick={() => set("perguntas", (list) => list.map((p, k) => (k === index ? { ...p, opcoes: p.opcoes.filter((_, j) => j !== i) } : p)))} aria-label={`Remover opção ${i + 1}`}>
                        <AdminIcon name="close" size={16} />
                      </button>
                    </div>
                  ))}
                  <button type="button" className={styles.linkButton} onClick={() => set("perguntas", (list) => list.map((p, k) => (k === index ? { ...p, opcoes: [...p.opcoes, ""] } : p)))}>
                    + Adicionar opção
                  </button>
                  {errors[`perguntas.${index}.opcoes`] && <p className={f.error}>{errors[`perguntas.${index}.opcoes`]}</p>}
                </div>
              )}
            </div>
            <PerguntaPreview pergunta={pergunta} condicao={pergunta.condicaoChave ? `${perguntas.find((p) => p.chave === pergunta.condicaoChave)?.label ?? "?"} = ${pergunta.condicaoValor}` : null} />
          </div>
        );
      })}

      <button type="button" className={styles.addButton} onClick={() => set("perguntas", (list) => [...list, { chave: novaChave(), secao: list.at(-1)?.secao ?? "", condicaoChave: "", condicaoValor: "", label: "", ajuda: "", tipo: "TEXTO_CURTO", opcoes: [], obrigatoria: true }])}>
        <AdminIcon name="plus" size={18} /> Adicionar pergunta
      </button>
    </div>
  );
}

/* ---------- 7. Contatos e check-list ---------- */

export function StepContatos({ values, set, errors }: StepProps) {
  const contatos = values.contatos;
  const update = (index: number, patch: Partial<(typeof contatos)[number]>) =>
    set("contatos", (list) => list.map((c, i) => (i === index ? { ...c, ...patch } : c)));

  return (
    <div className={f.stack}>
      <h3 className={styles.groupTitle}>Secretaria e contatos</h3>
      {contatos.length === 0 && <EmptyList icon="phone" text="Nenhum contato adicionado." />}
      {contatos.map((contato, index) => (
        <div key={index} className={styles.itemCard}>
          <div className={styles.itemHeader}>
            <span className={styles.itemIndex}>Contato {index + 1}</span>
            <ItemActions index={index} total={contatos.length} label={`contato ${index + 1}`} onMove={(to) => set("contatos", (list) => move(list, index, to))} onRemove={() => set("contatos", (list) => list.filter((_, i) => i !== index))} />
          </div>
          <div className={f.grid3}>
            <TextField label="Nome" required value={contato.nome} onChange={(v) => update(index, { nome: v })} error={errors[`contatos.${index}.nome`]} placeholder="Ex.: Jéssica Farias" />
            <TextField label="Função" optional value={contato.funcao} onChange={(v) => update(index, { funcao: v })} error={errors[`contatos.${index}.funcao`]} placeholder="Ex.: Tesouraria" />
            <TextField label="Telefone" required type="tel" value={contato.telefone} onChange={(v) => update(index, { telefone: v })} error={errors[`contatos.${index}.telefone`]} placeholder="(84) 99999-9999" />
          </div>
          <Switch checked={contato.whatsapp} onChange={(v) => update(index, { whatsapp: v })} label="Atende pelo WhatsApp" />
        </div>
      ))}
      <button type="button" className={styles.addButton} onClick={() => set("contatos", (list) => [...list, { nome: "", funcao: "", telefone: "", whatsapp: true }])}>
        <AdminIcon name="plus" size={18} /> Adicionar contato
      </button>

      <h3 className={styles.groupTitle}>Check-list do participante</h3>
      <TextArea label="O que levar" optional rows={10} value={values.checklist} onChange={(v) => set("checklist", v)} error={errors.checklist} hint="Um item por linha." />
    </div>
  );
}
