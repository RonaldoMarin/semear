import Link from "next/link";
import { Logo } from "@/components/site/Logo";

export default function Forbidden() {
  return (
    <main style={{ minHeight: "100svh", display: "grid", placeItems: "center", padding: 24, background: "var(--creme)" }}>
      <div style={{ display: "grid", gap: 16, justifyItems: "center", textAlign: "center", maxWidth: 420 }}>
        <Logo format="simbolo" alt="" style={{ width: 72, height: "auto" }} />
        <h1 style={{ margin: 0, fontSize: "2rem", color: "var(--terra-escura)" }}>Sem permissão</h1>
        <p style={{ margin: 0, color: "var(--tinta-suave)" }}>
          Seu perfil não tem acesso a esta área. Se precisar, peça a um administrador para ajustar sua permissão.
        </p>
        <Link href="/admin" className="button button-dark">
          Voltar ao painel
        </Link>
      </div>
    </main>
  );
}
