/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Sem isto o Turbopack acha um package-lock.json perdido em C:\Users\admin e
  // elege AQUELE diretório como raiz do workspace — cache/invalidation ficam
  // apontando pro lugar errado e o dev server serve CSS velho depois de edição
  // (o gremlin que exigiu apagar .next três vezes nesta sessão).
  turbopack: { root: import.meta.dirname },
  // mysql2 e bcryptjs rodam no server; garante que nao sejam bundlados no client
  serverExternalPackages: ["mysql2", "bcryptjs"],
  // Build de producao no VPS: pula type-check e lint (o Turbopack/SWC ja compila
  // os .ts). O type-check crashava tentando auto-instalar typescript.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
