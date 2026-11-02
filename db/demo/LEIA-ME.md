# Banco de demonstração (vitrine Vercel)

Por que existe: o site lê o MariaDB da rev **em runtime** (login, painel,
rankings, online). A vitrine hospedada no Vercel não alcança o banco da
máquina do servidor, então ela aponta para um MySQL gerenciado na nuvem com
o **mesmo schema e dados fictícios**. Produção de verdade continua sendo
Coolify + banco real (ver `DEPLOY.md`).

## Conta de demonstração (combinada com o time)

| login | senha |
|---|---|
| `teste` | `teste@2026` |

Só existe no seed. **Nunca** rodar `seed.sql` no banco de produção.

## Arquivos

- `schema-rev.sql` — estrutura das 9 tabelas da rev que o site consulta,
  extraída do MariaDB real por `scripts/gerar-dump-demo.mjs` (charset
  normalizado p/ utf8mb4 por portabilidade TiDB/MySQL 8). Regenerar, não editar.
- `seed.sql` — dados fictícios, gerados por `scripts/gerar-seed-demo.mjs`
  (determinístico: mesma semente → mesmo SQL).

## Como (re)carregar

```
# local (cria/recria l2versus_demo no MariaDB desta máquina):
node scripts/carregar-demo.mjs

# nuvem: criar .env.demo (gitignored) com DB_HOST/PORT/USER/PASSWORD/NAME
# do provedor + DB_SSL=true, e rodar o mesmo comando.
node scripts/carregar-demo.mjs
```

O loader recusa os nomes de banco de produção (`l2jversush5`, `l2versus`)
porque todo arquivo começa com DROP/DELETE.

## Variáveis do deploy da vitrine

| Variável | Valor |
|---|---|
| `DB_HOST/PORT/USER/PASSWORD/NAME` | do provedor da nuvem |
| `DB_SSL` | `true` (nuvem exige TLS; `lib/db.ts`) |
| `JWT_SECRET` | gerar um novo, exclusivo da vitrine |
| `SITE_GATE_USER` / `SITE_GATE_PASS` | tranca o site todo (Basic Auth, `proxy.ts`). Sem elas o site fica aberto |
| `NEXT_PUBLIC_SITE_URL` | a URL do deploy |
