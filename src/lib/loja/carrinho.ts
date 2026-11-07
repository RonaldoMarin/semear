/* Carrinho da loja: fica salvo no navegador do cliente (localStorage).
   O servidor confere preço, estoque e disponibilidade na hora de finalizar. */

export interface ItemCarrinho {
  varianteId: string;
  produtoId: string;
  slug: string;
  codigo: string;
  nome: string;
  /** "" quando o produto não tem tamanhos */
  tamanho: string;
  precoCentavos: number;
  imagemId: string | null;
  quantidade: number;
  /** estoque conhecido na última conferência (limita o botão +) */
  estoque: number;
}

const CHAVE = "semear.carrinho";
const VAZIO: ItemCarrinho[] = [];

let itens: ItemCarrinho[] = VAZIO;
let carregado = false;
const ouvintes = new Set<() => void>();

function ler(): ItemCarrinho[] {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE) ?? "[]");
    return Array.isArray(dados) ? dados.filter((i) => i && typeof i.varianteId === "string" && i.quantidade > 0) : VAZIO;
  } catch {
    return VAZIO;
  }
}

function avisarOuvintes() {
  ouvintes.forEach((ouvinte) => ouvinte());
}

export const carrinhoStore = {
  subscribe(ouvinte: () => void) {
    ouvintes.add(ouvinte);
    // outra aba mexeu no carrinho
    const onStorage = (e: StorageEvent) => {
      if (e.key !== CHAVE) return;
      itens = ler();
      avisarOuvintes();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      ouvintes.delete(ouvinte);
      window.removeEventListener("storage", onStorage);
    };
  },
  getSnapshot() {
    if (!carregado) {
      carregado = true;
      itens = ler();
    }
    return itens;
  },
  getServerSnapshot() {
    return VAZIO;
  },
  set(novos: ItemCarrinho[]) {
    itens = novos;
    try {
      localStorage.setItem(CHAVE, JSON.stringify(novos));
    } catch {
      // navegador sem armazenamento: o carrinho vale só nesta aba
    }
    avisarOuvintes();
  },
};

export const totalCarrinho = (lista: ItemCarrinho[]) => lista.reduce((acc, i) => acc + i.precoCentavos * i.quantidade, 0);
export const quantidadeCarrinho = (lista: ItemCarrinho[]) => lista.reduce((acc, i) => acc + i.quantidade, 0);
