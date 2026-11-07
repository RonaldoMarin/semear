"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { salvarProduto } from "@/app/admin/actions/loja";
import { AdminIcon } from "../AdminIcon";
import { avisar } from "../Avisos";
import { Switch, TextArea, TextField } from "../eventos/fields";
import f from "../forms.module.css";
import styles from "./loja.module.css";

export interface ProdutoInicial {
  id: string | null;
  codigo: string;
  nome: string;
  descricao: string;
  preco: string;
  ativo: boolean;
  variantes: { id?: string; nome: string; estoque: number }[];
  imagens: { id: string; url: string }[];
}

type Foto = { chave: string; url: string; arquivo?: File; largura?: number; altura?: number };

const TAMANHOS_RAPIDOS = ["PP", "P", "M", "G", "GG", "XG"];
const MAX_FOTOS = 8;
const LADO_MAXIMO = 1200;

/** Reduz a foto no navegador (até 1200 px, JPEG) antes de enviar: deixa leve para o banco e para o site. */
async function reduzirFoto(arquivo: File): Promise<{ arquivo: File; largura: number; altura: number }> {
  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);
  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, largura, altura);
  ctx.drawImage(bitmap, 0, 0, largura, altura);
  bitmap.close();
  const blob = await new Promise<Blob>((ok, erro) => canvas.toBlob((b) => (b ? ok(b) : erro(new Error("falha ao converter"))), "image/jpeg", 0.85));
  return { arquivo: new File([blob], arquivo.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }), largura, altura };
}

export function ProdutoForm({ inicial }: { inicial: ProdutoInicial }) {
  const router = useRouter();
  const [codigo, setCodigo] = useState(inicial.codigo);
  const [nome, setNome] = useState(inicial.nome);
  const [descricao, setDescricao] = useState(inicial.descricao);
  const [preco, setPreco] = useState(inicial.preco);
  const [ativo, setAtivo] = useState(inicial.ativo);
  const temTamanhosInicial = inicial.variantes.some((v) => v.nome);
  const [temTamanhos, setTemTamanhos] = useState(temTamanhosInicial);
  const [variantes, setVariantes] = useState(inicial.variantes.length ? inicial.variantes : [{ nome: "", estoque: 0 }]);
  const [fotos, setFotos] = useState<Foto[]>(inicial.imagens.map((i) => ({ chave: `manter:${i.id}`, url: i.url })));
  const [processando, setProcessando] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const contador = useRef(0);

  // libera as prévias locais das fotos novas ao sair
  const fotosRef = useRef(fotos);
  useEffect(() => {
    fotosRef.current = fotos;
  }, [fotos]);
  useEffect(() => () => fotosRef.current.forEach((foto) => foto.arquivo && URL.revokeObjectURL(foto.url)), []);

  const adicionarFotos = async (lista: FileList | null) => {
    if (!lista?.length) return;
    const espaco = MAX_FOTOS - fotos.length;
    if (espaco <= 0) return avisar({ tipo: "erro", texto: `Máximo de ${MAX_FOTOS} fotos por produto.` });
    setProcessando(true);
    try {
      const novas: Foto[] = [];
      for (const arquivo of [...lista].slice(0, espaco)) {
        if (!arquivo.type.startsWith("image/")) continue;
        const reduzida = await reduzirFoto(arquivo);
        novas.push({ chave: `nova:${contador.current++}`, url: URL.createObjectURL(reduzida.arquivo), ...reduzida });
      }
      setFotos((atual) => [...atual, ...novas]);
    } catch {
      avisar({ tipo: "erro", texto: "Não foi possível ler uma das fotos. Tente outro arquivo." });
    } finally {
      setProcessando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const moverFoto = (i: number, para: number) =>
    setFotos((atual) => {
      if (para < 0 || para >= atual.length) return atual;
      const copia = [...atual];
      const [foto] = copia.splice(i, 1);
      copia.splice(para, 0, foto);
      return copia;
    });

  const estoqueTotal = temTamanhos ? variantes.reduce((s, v) => s + (v.estoque || 0), 0) : variantes[0]?.estoque ?? 0;

  const salvar = () => {
    if (temTamanhos && variantes.length === 0) return avisar({ tipo: "erro", texto: "Adicione pelo menos um tamanho." });
    const formData = new FormData();
    formData.set(
      "dados",
      JSON.stringify({
        codigo,
        nome,
        descricao,
        preco,
        ativo,
        temTamanhos,
        variantes: temTamanhos ? variantes : [{ ...variantes[0], nome: "" }],
        ordemImagens: fotos.map((foto) => foto.chave),
      }),
    );
    for (const foto of fotos) {
      if (!foto.arquivo) continue;
      formData.set(foto.chave, foto.arquivo);
      formData.set(`${foto.chave}:largura`, String(foto.largura ?? 0));
      formData.set(`${foto.chave}:altura`, String(foto.altura ?? 0));
    }
    startTransition(async () => {
      const r = await salvarProduto(inicial.id, formData);
      if (!r.ok) return avisar({ tipo: "erro", texto: r.error });
      avisar({ tipo: "ok", texto: inicial.id ? "Produto atualizado." : "Produto criado!" });
      router.push("/admin/loja");
      router.refresh();
    });
  };

  return (
    <div className={styles.formPage}>
      <header className={styles.formHeader}>
        <Link href="/admin/loja" className={styles.back}>
          <AdminIcon name="arrowLeft" size={18} /> Loja
        </Link>
        <div className={styles.formTitle}>
          <h1>{nome || (inicial.id ? "Produto sem nome" : "Novo produto")}</h1>
          <button type="button" className="button button-dark" onClick={salvar} disabled={pending || processando}>
            <AdminIcon name="check" size={18} /> {pending ? "Salvando..." : inicial.id ? "Salvar alterações" : "Criar produto"}
          </button>
        </div>
      </header>

      <div className={styles.formGrid}>
        <section className={styles.card}>
          <h2>Informações</h2>
          <div className={f.stack}>
            <TextField label="Nome do produto" required value={nome} onChange={setNome} placeholder="Ex.: Camiseta Semear 2027" maxLength={120} />
            <div className={f.grid2}>
              <TextField label="Preço" required prefix="R$" inputMode="decimal" value={preco} onChange={setPreco} placeholder="54,00" />
              <TextField
                label="Código"
                required
                value={codigo}
                onChange={(v) => setCodigo(v.toUpperCase().replace(/[^A-Z0-9-]/g, ""))}
                hint="Aparece no pedido do WhatsApp."
                maxLength={20}
              />
            </div>
            <TextArea label="Descrição" optional rows={5} value={descricao} onChange={setDescricao} maxLength={2000} placeholder="Tecido, cores, detalhes da estampa..." />
            <Switch checked={ativo} onChange={setAtivo} label="Visível na loja" description="Desligue para esconder o produto do site sem apagá-lo." />
          </div>
        </section>

        <section className={styles.card}>
          <h2>Fotos</h2>
          <p className={f.hint}>A primeira foto é a capa. Até {MAX_FOTOS} fotos; elas são reduzidas automaticamente.</p>
          <div className={styles.fotos}>
            {fotos.map((foto, i) => (
              <figure key={foto.chave} className={styles.foto}>
                <img src={foto.url} alt={`Foto ${i + 1}`} />
                {i === 0 && <span className={styles.capa}>Capa</span>}
                <div className={styles.fotoAcoes}>
                  <button type="button" onClick={() => moverFoto(i, i - 1)} disabled={i === 0} aria-label="Mover para a esquerda">
                    <AdminIcon name="arrowLeft" size={15} />
                  </button>
                  <button type="button" onClick={() => moverFoto(i, i + 1)} disabled={i === fotos.length - 1} aria-label="Mover para a direita">
                    <AdminIcon name="arrowRight" size={15} />
                  </button>
                  <button type="button" className={styles.danger} onClick={() => setFotos((atual) => atual.filter((_, j) => j !== i))} aria-label="Remover foto">
                    <AdminIcon name="trash" size={15} />
                  </button>
                </div>
              </figure>
            ))}
            {fotos.length < MAX_FOTOS && (
              <label
                className={styles.addFoto}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  void adicionarFotos(e.dataTransfer.files);
                }}
              >
                <input ref={inputRef} type="file" accept="image/*" multiple onChange={(e) => void adicionarFotos(e.target.files)} />
                <AdminIcon name="image" size={26} />
                <span>{processando ? "Preparando..." : "Adicionar fotos"}</span>
                <small>ou arraste aqui</small>
              </label>
            )}
          </div>
        </section>

        <section className={`${styles.card} ${styles.cardWide}`}>
          <div className={styles.cardHeader}>
            <h2>Estoque {temTamanhos ? "por tamanho" : ""}</h2>
            <span className={styles.estoqueTotal}>{estoqueTotal} em estoque</span>
          </div>
          <Switch
            checked={temTamanhos}
            onChange={(v) => {
              setTemTamanhos(v);
              if (v && !variantes.some((x) => x.nome)) setVariantes([]);
              if (!v) setVariantes((atual) => [{ id: atual[0]?.id, nome: "", estoque: atual.reduce((s, x) => s + (x.estoque || 0), 0) }]);
            }}
            label="Este produto tem tamanhos"
            description="Ex.: camisetas (PP a XG). Cada tamanho tem seu estoque."
          />

          {temTamanhos ? (
            <>
              <div className={styles.rapidos}>
                <span>Adicionar:</span>
                {TAMANHOS_RAPIDOS.filter((t) => !variantes.some((v) => v.nome === t)).map((t) => (
                  <button key={t} type="button" onClick={() => setVariantes((atual) => [...atual, { nome: t, estoque: 0 }])}>
                    + {t}
                  </button>
                ))}
                <button type="button" onClick={() => setVariantes((atual) => [...atual, { nome: "", estoque: 0 }])}>
                  + Outro
                </button>
              </div>
              {variantes.length === 0 && <p className={f.hint}>Adicione pelo menos um tamanho.</p>}
              <div className={styles.variantes}>
                {variantes.map((v, i) => (
                  <div key={v.id ?? `nova-${i}`} className={styles.variante}>
                    <input
                      className={f.input}
                      value={v.nome}
                      placeholder="Tamanho"
                      aria-label={`Tamanho ${i + 1}`}
                      maxLength={30}
                      onChange={(e) => setVariantes((atual) => atual.map((x, j) => (j === i ? { ...x, nome: e.target.value.toUpperCase() } : x)))}
                    />
                    <input
                      className={f.input}
                      type="number"
                      min={0}
                      value={v.estoque}
                      aria-label={`Estoque do tamanho ${v.nome || i + 1}`}
                      onChange={(e) => setVariantes((atual) => atual.map((x, j) => (j === i ? { ...x, estoque: Math.max(0, Number(e.target.value) || 0) } : x)))}
                    />
                    <span className={styles.unid}>un.</span>
                    <button type="button" className={styles.remover} onClick={() => setVariantes((atual) => atual.filter((_, j) => j !== i))} aria-label={`Remover tamanho ${v.nome}`}>
                      <AdminIcon name="close" size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className={styles.estoqueUnico}>
              <TextField
                label="Quantidade em estoque"
                inputMode="numeric"
                value={String(variantes[0]?.estoque ?? 0)}
                onChange={(val) => setVariantes((atual) => [{ id: atual[0]?.id, nome: "", estoque: Math.max(0, Number(val.replace(/\D/g, "")) || 0) }])}
              />
            </div>
          )}
          <p className={f.hint}>O estoque não baixa sozinho: como o pagamento é combinado pelo WhatsApp, ajuste aqui quando o pedido for confirmado.</p>
        </section>
      </div>
    </div>
  );
}
