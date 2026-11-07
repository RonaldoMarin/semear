import type { NextConfig } from "next";

/* Cabeçalhos de segurança aplicados a todas as páginas. */
const securityHeaders = [
  // impede que o site seja aberto dentro de um iframe de outro domínio (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // links de redefinição de senha não vazam para outros sites pelo Referer
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // painel e páginas de senha: nunca em cache compartilhado
      { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  experimental: {
    // habilita forbidden() / unauthorized() usados nas permissões do painel
    authInterrupts: true,
    // fotos da loja vão junto ao salvar o produto (já reduzidas no navegador)
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;
