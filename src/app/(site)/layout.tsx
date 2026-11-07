import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { RolagemSemHash } from "@/components/site/RolagemSemHash";
import { CarrinhoProvider } from "@/components/loja/Carrinho";

/**
 * Layout das páginas públicas (home, futuras /inscricoes, /loja e /minha-conta).
 * A área administrativa deve ficar fora deste grupo, em src/app/admin, com layout próprio.
 */
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <CarrinhoProvider>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <SiteHeader />
      <main id="conteudo">{children}</main>
      <SiteFooter />
      <RolagemSemHash />
    </CarrinhoProvider>
  );
}
