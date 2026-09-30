# ===== L2 Versus site (Next.js 16) - multi-stage =====
FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# cap do heap do build p/ nao pesar a producao do VPS
ENV NODE_OPTIONS=--max-old-space-size=1536
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/scripts ./scripts
# OBRIGATÓRIO, e a falha é silenciosa se faltar: as páginas do wiki são
# dinâmicas (ƒ no build) e leem content/wiki/*.json em RUNTIME, com fs, a
# partir de process.cwd() — ver lib/wiki/data.ts:25. Sem esta linha o
# container sobe, responde 200 e mostra TODAS as seções do códice vazias
# ("em preparação"), que é exatamente o que /wiki/skills mostra hoje por não
# ter o JSON dela. Nada quebra, nada loga: só o conteúdo some.
COPY --from=builder /app/content ./content
EXPOSE 3000
CMD ["npx","next","start","-H","0.0.0.0","-p","3000"]
