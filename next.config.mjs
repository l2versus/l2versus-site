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
  // Vercel/serverless: o wiki lê content/wiki/*.json em RUNTIME com fs a partir
  // de process.cwd() (lib/wiki/data.ts). O file tracing não enxerga caminho
  // dinâmico, então sem esta linha o deploy sobe, responde 200 e mostra o
  // códice inteiro "em preparação" — o mesmo sintoma traiçoeiro do Coolify
  // sem o COPY de content/ (ver DEPLOY.md §2). No Docker/Coolify ela é inócua.
  outputFileTracingIncludes: { "/*": ["./content/**/*"] },
  // Build de producao no VPS: pula type-check e lint (o Turbopack/SWC ja compila
  // os .ts). O type-check crashava tentando auto-instalar typescript.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
