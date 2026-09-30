# Deploy do site L2 Versus (Coolify)

Alvo: **Coolify**, não Vercel. A razão é única e decisiva: o site lê o
MariaDB da rev (`l2jversush5`) em tempo de requisição para ranking, contagem
de online e login. Vercel roda na nuvem e não alcança um MariaDB que vive na
rede do servidor — só alcançaria se o banco fosse exposto na internet, o que
não vale o risco. O Coolify roda numa VPS que pode falar com o banco pela
rede interna.

O repositório já tem `Dockerfile` e `.dockerignore`; o Coolify constrói a
partir do clone do GitHub.

---

## 1. Variáveis de ambiente

Copie as chaves de `.env.example` para o painel do Coolify. **Nenhuma delas
tem valor padrão seguro** — as três armadilhas:

| Variável | Armadilha |
|---|---|
| `DB_HOST` | **Não use `127.0.0.1`.** Dentro do container, `127.0.0.1` é o *próprio container*, não a VPS. Use o nome do serviço na rede Docker, o IP interno da VPS, ou um túnel. |
| `JWT_SECRET` | **Obrigatória.** Sem ela o site levanta um erro explícito ao assinar a primeira sessão (`lib/session.ts`). Isso é de propósito: antes ela caía num segredo que está no código, e qualquer pessoa poderia forjar o cookie de qualquer conta. Gere com `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`. |
| `NEXT_PUBLIC_SITE_URL` | Vai para o bundle do browser e monta o link de indicação. Se ficar errada, os convites apontam para o lugar errado. |

`NEXT_PUBLIC_SERVER_NAME` existia no `.env.local` antigo e **não é usada por
nenhum código** — não precisa cadastrar.

## 2. O que o container precisa em disco

As páginas do wiki são dinâmicas (`ƒ` no build) e leem `content/wiki/*.json`
em **runtime**, com `fs`, a partir de `process.cwd()`
(`lib/wiki/data.ts:25`, `lib/wiki/classes-dados.ts:81`,
`lib/wiki/classes.server.ts:14`).

Consequência: **`content/` tem que existir dentro da imagem**. O `Dockerfile`
já copia (`COPY --from=builder /app/content ./content`) e a pasta está
versionada. Se alguém remover qualquer uma das duas coisas, o sintoma é
traiçoeiro: o site sobe, responde **HTTP 200** e mostra *todas* as seções do
códice como "em preparação". Nada quebra e nada é logado — só o conteúdo
some. É exatamente o que `/wiki/skills` mostra hoje, por ainda não ter o
JSON dela.

`content/wiki` é a única leitura de disco em runtime; o resto vira bundle
no `.next`.

## 3. Build

```
docker build -t l2versus-site .
```

O `Dockerfile` é multi-stage (`node:22-alpine`): o estágio `builder` roda
`npm ci` + `next build`, e o `runner` recebe só o necessário. O heap do build
está limitado a 1536 MB para não engasgar a VPS.

O `.dockerignore` existe por um motivo de segurança, não de tamanho: sem ele
o `COPY . .` levava `.env.local` — senha do MariaDB e `JWT_SECRET` — para
dentro de uma camada da imagem. **Segredo que entra em camada não se apaga:
se subiu, vazou.** Não remova as linhas de `.env*` de lá.

## 4. Verificação pós-deploy

Não confie em HTTP 200: as três falhas conhecidas deste projeto devolvem 200.

1. `/wiki/armas-sa` mostra **146 entradas** e fichas com valores. Se disser
   "em preparação", `content/` não chegou na imagem (item 2).
2. `/wiki/augments?p=3` pagina e a numeração romana continua de onde parou.
3. Trocar o idioma muda a moldura do wiki (Antes/Agora → Before/Now → Было/
   Стало → Przedtem/Teraz). O *conteúdo* das entradas segue em português —
   é esperado, ver "Pendências".
4. `/rankings` e o contador de online: se vierem vazios, é `DB_HOST`
   apontando para o lugar errado, não bug de página — o código degrada de
   propósito quando o banco não responde (`safeQuery`).
5. Fazer login. Se estourar erro de `JWT_SECRET`, a variável não foi
   cadastrada — e é bom que tenha estourado.

## Pendências conhecidas

- **Conteúdo do wiki em português.** A moldura está em 4 idiomas; as 733
  entradas não. São 3.278 strings distintas / 33.445 palavras (medido), o que
  ×3 idiomas dá ~100 mil palavras — trabalho de tradução, não de código. O
  fallback para PT garante que tradução parcial nunca quebre a página.
- **Moldura ainda em PT** em `/wiki`, `/wiki/classes`, `/wiki/mudancas` e
  `/wiki/linha-de-base` (as 8 páginas de seção já estão traduzidas).
- **`/wiki/skills` vazia** — a família nunca foi extraída; a fonte tem 25.299
  linhas (`docs/wiki-fonte/SKILLS-ALTERADAS.txt` no repo do servidor).
- **Convite do Discord morto** (`C6XMvYQz2Q` devolve HTTP 404), então os
  números da comunidade nunca aparecem. Trocar o código em `lib/discord.ts`.
- **Tabela `characters` vazia** na base atual, por isso ranking em branco e
  "0 ONLINE". O banco em si responde em 1–22ms.
