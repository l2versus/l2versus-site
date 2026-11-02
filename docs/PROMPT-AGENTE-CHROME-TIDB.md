# Prompt para o agente do Chrome — criar o banco demo (TiDB Cloud)

Copie tudo do bloco abaixo e cole no agente do Chrome.

---

Crie um banco MySQL serverless gratuito no TiDB Cloud e me devolva as
credenciais de conexão. Passo a passo:

1. Abra https://tidbcloud.com e entre com **Sign in with Google**, usando a
   conta Google já logada neste navegador. Se aparecer questionário de
   onboarding (nome, empresa, uso), preencha com qualquer coisa razoável
   ("L2Versus", "hobby/game server", "developer") e avance.

2. No console, crie um cluster:
   - Tipo/plano: **Starter** (serverless, FREE — não escolha "Dedicated/Premium";
     não cadastre cartão de crédito em hipótese alguma).
   - Cloud/região: **AWS, us-east-1 (N. Virginia)**.
   - Nome do cluster: **l2versus-demo**.
   - Confirme e aguarde o cluster ficar disponível (menos de 1 minuto).

3. Com o cluster aberto, clique em **Connect** (botão no canto superior).
   Na janela de conexão:
   - Se houver seletor "Connect With", escolha **General** (ou "MySQL CLI",
     qualquer um que mostre host/porta/usuário).
   - Clique em **Generate Password** (ou Reset Password) e **copie a senha
     imediatamente** — ela só aparece uma vez.
   - Anote também: **HOST** (algo como gateway01.us-east-1.prod.aws.tidbcloud.com),
     **PORT** (4000) e **USERNAME** (algo como xXxXxXxX.root).

4. Me entregue o resultado EXATAMENTE neste formato, preenchendo os valores,
   para eu salvar num arquivo:

```
DB_HOST=<host copiado>
DB_PORT=4000
DB_USER=<username copiado>
DB_PASSWORD=<senha gerada>
DB_NAME=l2versus_demo
DB_SSL=true
```

Não crie nada além do cluster Starter gratuito. Não adicione forma de
pagamento. Se qualquer tela oferecer upgrade ou trial pago, recuse/feche.

---

## Depois que o agente devolver o bloco

Salvar o bloco (exatamente como veio) no arquivo:

```
C:\Users\admin\Desktop\l2versus-site\.env.demo
```

(É gitignored — nunca vai pro repositório.) Depois me avisar aqui no chat:
eu carrego o schema+seed, cadastro as variáveis no Vercel e faço o redeploy.
