"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { saveEvento } from "@/app/admin/actions/eventos";
import { formatDateRange, formatDateTime, formatMoney, fromLocalInput, parseMoney } from "@/lib/eventos/format";
import { statusEventoLabel, tipoEventoLabel } from "@/lib/eventos/labels";
import { errorsForStep, eventoSchema, flattenErrors, passos, type EventoFormValues, type FieldErrors } from "@/lib/eventos/schema";
import { AdminIcon } from "../AdminIcon";
import { StatusBadge } from "../StatusBadge";
import f from "../forms.module.css";
import { StepContatos, StepDatas, StepGeral, StepInscricao, StepLocal, StepProgramacao, StepValores, type StepProps } from "./steps";
import styles from "./EventWizard.module.css";

interface Props {
  eventoId: string | null;
  initialValues: EventoFormValues;
  canPublish: boolean;
  readOnly: boolean;
  meta?: { criadoPor?: string | null; atualizadoPor?: string | null; atualizadoEm?: string };
  /** atalho para a lista de inscritos (só para quem pode ver) */
  inscricoes?: { total: number; href: string; publicHref: string };
  flash?: string;
}

const stepComponents: Record<string, (props: StepProps) => React.ReactNode> = {
  geral: StepGeral,
  datas: StepDatas,
  local: StepLocal,
  valores: StepValores,
  programacao: StepProgramacao,
  inscricao: StepInscricao,
  contatos: StepContatos,
};

export function EventWizard({ eventoId, initialValues, canPublish, readOnly, meta, flash, inscricoes }: Props) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [visited, setVisited] = useState<Set<number>>(() => new Set(eventoId ? passos.map((_, i) => i) : [0]));
  const [step, setStep] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "erro"; text: string } | null>(flash ? { type: "ok", text: flash } : null);
  const [pending, startTransition] = useTransition();
  const panelRef = useRef<HTMLDivElement>(null);

  const passo = passos[step];
  const isLast = step === passos.length - 1;

  // avisa antes de sair com alterações não salvas
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const set: StepProps["set"] = (key, value) => {
    setValues((current) => ({
      ...current,
      [key]: typeof value === "function" ? (value as (v: typeof current[typeof key]) => typeof current[typeof key])(current[key]) : value,
    }));
    setDirty(true);
    // limpa erros do campo editado
    setErrors((current) => {
      const next = { ...current };
      for (const k of Object.keys(next)) if (k === key || k.startsWith(`${String(key)}.`)) delete next[k];
      return next;
    });
  };

  const validateAll = () => {
    const parsed = eventoSchema.safeParse(values);
    return parsed.success ? {} : flattenErrors(parsed.error);
  };

  const goTo = (index: number) => {
    setVisited((current) => new Set(current).add(index));
    setStep(index);
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const next = () => {
    const all = validateAll();
    const stepErrors = errorsForStep(all, passo);
    if (stepErrors.length) {
      setErrors((current) => ({ ...current, ...Object.fromEntries(stepErrors.map((k) => [k, all[k]])) }));
      setToast({ type: "erro", text: "Preencha os campos obrigatórios deste passo." });
      return;
    }
    goTo(Math.min(step + 1, passos.length - 1));
  };

  const save = () => {
    const all = validateAll();
    if (Object.keys(all).length) {
      setErrors(all);
      setVisited(new Set(passos.map((_, i) => i)));
      const first = passos.findIndex((p) => errorsForStep(all, p).length);
      if (first >= 0) goTo(first);
      setToast({ type: "erro", text: "Há campos pendentes. Revise os passos marcados." });
      return;
    }
    startTransition(async () => {
      const result = await saveEvento(eventoId, values);
      if (!result.ok) {
        if (result.fieldErrors) setErrors(result.fieldErrors);
        setToast({ type: "erro", text: result.error });
        return;
      }
      setDirty(false);
      setToast({ type: "ok", text: result.message });
      if (!eventoId) router.replace(`/admin/eventos/${result.id}?criado=1`);
      else router.refresh();
    });
  };

  const stepStatus = useMemo(
    () =>
      passos.map((p, i) => {
        const hasError = errorsForStep(errors, p).length > 0;
        return { hasError, done: !hasError && visited.has(i) && i !== step };
      }),
    [errors, visited, step],
  );

  const StepComponent = stepComponents[passo.id];
  const totalErrors = Object.keys(errors).length;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/admin/eventos" className={styles.back}>
          <AdminIcon name="arrowLeft" size={18} /> Eventos
        </Link>
        <div className={styles.titleRow}>
          <div>
            <h1>{values.nome || (eventoId ? "Evento sem nome" : "Novo evento")}</h1>
            <div className={styles.metaRow}>
              <StatusBadge status={values.status} />
              <span>{tipoEventoLabel[values.tipo]}</span>
              {meta?.atualizadoEm && <span>Atualizado {meta.atualizadoEm}{meta.atualizadoPor ? ` por ${meta.atualizadoPor}` : ""}</span>}
              {dirty && <span className={styles.unsaved}>Alterações não salvas</span>}
            </div>
          </div>
          <div className={styles.headerActions}>
            {inscricoes && (
              <Link href={inscricoes.href} className="button button-outline">
                <AdminIcon name="users" size={18} /> Inscrições ({inscricoes.total})
              </Link>
            )}
            {!readOnly && (
              <button type="button" className="button button-dark" onClick={save} disabled={pending}>
                <AdminIcon name="check" size={18} />
                {pending ? "Salvando..." : eventoId ? "Salvar alterações" : "Criar evento"}
              </button>
            )}
          </div>
        </div>
        {readOnly && (
          <div className={styles.inlineNotice}>
            <AdminIcon name="eye" />
            <p>Você tem acesso somente de visualização. Peça a um administrador para editar este evento.</p>
          </div>
        )}
      </header>

      <div className={styles.layout}>
        <nav className={styles.stepper} aria-label="Passos do evento">
          <label className={styles.stepSelect}>
            <span className="visually-hidden">Ir para o passo</span>
            <select className={f.select} value={step} onChange={(event) => goTo(Number(event.target.value))}>
              {passos.map((p, i) => (
                <option key={p.id} value={i}>
                  {i + 1}. {p.titulo}
                  {stepStatus[i].hasError ? " — pendente" : ""}
                </option>
              ))}
            </select>
          </label>
          <ol>
            {passos.map((p, i) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  className={[styles.stepButton, i === step && styles.stepActive, stepStatus[i].hasError && styles.stepError, stepStatus[i].done && styles.stepDone]
                    .filter(Boolean)
                    .join(" ")}
                  aria-current={i === step ? "step" : undefined}
                >
                  <span className={styles.stepNumber}>
                    {stepStatus[i].hasError ? <AdminIcon name="alert" size={15} /> : stepStatus[i].done ? <AdminIcon name="check" size={15} /> : i + 1}
                  </span>
                  <span className={styles.stepText}>
                    <strong>{p.titulo}</strong>
                    <small>{stepStatus[i].hasError ? "Campos obrigatórios pendentes" : p.descricao}</small>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className={styles.panel} ref={panelRef}>
          <div className={styles.panelHeader}>
            <span className={styles.stepCount}>
              Passo {step + 1} de {passos.length}
            </span>
            <h2>{passo.titulo}</h2>
            <p>{passo.descricao}</p>
            <div className={styles.progress} aria-hidden="true">
              <span style={{ width: `${((step + 1) / passos.length) * 100}%` }} />
            </div>
          </div>

          <fieldset className={styles.panelBody} disabled={readOnly}>
            {StepComponent ? (
              <StepComponent values={values} set={set} errors={errors} canPublish={canPublish} />
            ) : (
              <Review values={values} errors={errors} onGoTo={goTo} totalErrors={totalErrors} />
            )}
          </fieldset>

          <footer className={styles.panelFooter}>
            <button type="button" className="button button-outline" onClick={() => goTo(step - 1)} disabled={step === 0}>
              <AdminIcon name="arrowLeft" size={18} /> Voltar
            </button>
            <div className={styles.footerRight}>
              {!readOnly && !isLast && (
                <button type="button" className={styles.ghostButton} onClick={save} disabled={pending}>
                  {pending ? "Salvando..." : "Salvar"}
                </button>
              )}
              {isLast ? (
                !readOnly && (
                  <button type="button" className="button button-primary" onClick={save} disabled={pending}>
                    <AdminIcon name="check" size={18} />
                    {pending ? "Salvando..." : eventoId ? "Salvar alterações" : "Criar evento"}
                  </button>
                )
              ) : (
                <button type="button" className="button button-dark" onClick={next}>
                  Próximo <AdminIcon name="arrowRight" size={18} />
                </button>
              )}
            </div>
          </footer>
        </div>
      </div>

      {toast && (
        <div className={`${styles.toast} ${toast.type === "erro" ? styles.toastError : ""}`} role="status">
          <AdminIcon name={toast.type === "erro" ? "alert" : "check"} />
          {toast.text}
        </div>
      )}
    </div>
  );
}

/* ---------- 8. Revisão ---------- */

function Review({
  values,
  errors,
  onGoTo,
  totalErrors,
}: {
  values: EventoFormValues;
  errors: FieldErrors;
  onGoTo: (index: number) => void;
  totalErrors: number;
}) {
  const valid = (v: string) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v);
  const periodo = valid(values.dataInicio) && valid(values.dataFim) ? formatDateRange(fromLocalInput(values.dataInicio), fromLocalInput(values.dataFim)) : "—";
  const inscricoes =
    valid(values.inscricaoInicio) || valid(values.inscricaoFim)
      ? `${valid(values.inscricaoInicio) ? formatDateTime(fromLocalInput(values.inscricaoInicio)) : "agora"} até ${valid(values.inscricaoFim) ? formatDateTime(fromLocalInput(values.inscricaoFim)) : "preencher as vagas"}`
      : "Sem período definido";

  const linhas: { passo: number; label: string; valor: React.ReactNode }[] = [
    { passo: 0, label: "Nome", valor: values.nome || "—" },
    { passo: 0, label: "Status", valor: statusEventoLabel[values.status] },
    { passo: 1, label: "Período", valor: periodo },
    { passo: 1, label: "Inscrições", valor: inscricoes },
    { passo: 1, label: "Vagas", valor: values.vagas || "Ilimitadas" },
    { passo: 2, label: "Locais", valor: values.locais.length ? values.locais.map((l) => [l.etapa, l.nome].filter(Boolean).join(": ")).join(" · ") : "—" },
    { passo: 3, label: "Taxa", valor: values.valorInscricao ? formatMoney(parseMoney(values.valorInscricao)) : "Gratuito" },
    { passo: 3, label: "Pré-inscrição", valor: values.valorPreInscricao ? formatMoney(parseMoney(values.valorPreInscricao)) : "—" },
    { passo: 4, label: "Programação", valor: `${values.programacao.length} ${values.programacao.length === 1 ? "item" : "itens"}` },
    { passo: 5, label: "Perguntas", valor: `${values.perguntas.length} (${values.perguntas.filter((p) => p.obrigatoria).length} obrigatórias)` },
    { passo: 6, label: "Contatos", valor: values.contatos.map((c) => c.nome).join(", ") || "—" },
    { passo: 6, label: "Check-list", valor: `${values.checklist.split("\n").filter((l) => l.trim()).length} itens` },
  ];

  return (
    <div className={f.stack}>
      {totalErrors > 0 ? (
        <div className={f.alert}>
          <AdminIcon name="alert" /> Existem {totalErrors} campo(s) pendentes. Clique nos passos marcados em vermelho para corrigir.
        </div>
      ) : (
        <div className={`${f.alert} ${f.alertSuccess}`}>
          <AdminIcon name="check" /> Tudo pronto. Confira o resumo e salve.
        </div>
      )}
      <dl className={styles.reviewList}>
        {linhas.map((linha) => (
          <div key={linha.label} className={styles.reviewRow}>
            <dt>{linha.label}</dt>
            <dd>{linha.valor}</dd>
            <button type="button" className={styles.linkButton} onClick={() => onGoTo(linha.passo)}>
              Editar
            </button>
          </div>
        ))}
      </dl>
      {Object.keys(errors).length > 0 && <span className="visually-hidden">Há erros no formulário</span>}
    </div>
  );
}
