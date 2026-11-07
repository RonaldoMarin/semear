"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const CHAVE = "semear:rolar-para";

const semHash = () => window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);

function rolarAte(id: string, suave: boolean) {
  const alvo = document.getElementById(id);
  if (!alvo) return false;
  const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  alvo.scrollIntoView({ behavior: suave && !reduzirMovimento ? "smooth" : "instant", block: "start" });
  // leva o foco junto, para quem navega pelo teclado ou leitor de tela
  if (!alvo.hasAttribute("tabindex")) alvo.setAttribute("tabindex", "-1");
  alvo.focus({ preventScroll: true });
  return true;
}

/**
 * Links para seções (ex.: "/#frentes") rolam até a seção sem deixar "#frentes" no endereço.
 * - Na mesma página: rola suavemente, a URL não muda.
 * - De outra página: abre a página sem "#" e rola até a seção depois de carregar.
 * - Link com "#" aberto direto (ex.: compartilhado): rola até a seção e limpa o endereço.
 */
export function RolagemSemHash() {
  const pathname = usePathname();
  const router = useRouter();

  // ao chegar numa página: rola para a seção pedida (sessionStorage ou #secao na URL)
  useEffect(() => {
    let pendente: string | null = null;
    try {
      pendente = window.sessionStorage.getItem(CHAVE);
      window.sessionStorage.removeItem(CHAVE);
    } catch {}
    pendente ??= decodeURIComponent(window.location.hash.slice(1)) || null;
    if (!pendente) return;

    const id = pendente;
    semHash();
    // espera a página montar (e imagens/fontes ajustarem a altura) antes de rolar
    let tentativas = 0;
    const timer = window.setInterval(() => {
      tentativas++;
      // o Next regrava a URL (com o "#") ao terminar de carregar a página: limpa de novo
      if (window.location.hash) semHash();
      if ((rolarAte(id, false) && tentativas >= 5) || tentativas > 20) window.clearInterval(timer);
    }, 100);
    return () => window.clearInterval(timer);
  }, [pathname]);

  // cliques em links para seções
  useEffect(() => {
    const aoClicar = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || (link.target && link.target !== "_self")) return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || !url.hash) return;
      const id = decodeURIComponent(url.hash.slice(1));

      if (url.pathname === window.location.pathname) {
        if (!document.getElementById(id)) return;
        event.preventDefault();
        rolarAte(id, true);
        semHash();
        return;
      }

      // outra página: navega sem o "#" e deixa a seção anotada para rolar ao chegar
      event.preventDefault();
      try {
        window.sessionStorage.setItem(CHAVE, id);
      } catch {}
      router.push(url.pathname + url.search, { scroll: false });
    };
    // fase de captura: roda antes do <Link> do Next, que senão navegaria para "/#secao"
    document.addEventListener("click", aoClicar, true);
    return () => document.removeEventListener("click", aoClicar, true);
  }, [router]);

  return null;
}
