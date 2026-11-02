import "server-only";
import { query, queryOne } from "@/lib/db";

/**
 * RMT Market — a visão dos SÓCIOS. SOMENTE LEITURA.
 *
 * Este arquivo é inteiro SELECT, e isso é regra e não acidente: não existe um
 * único UPDATE/INSERT/DELETE aqui, nem haverá. O painel de admin responde
 * perguntas; quem muda estado é o jogo (dono do item) e o fluxo de pagamento
 * (dono do dinheiro). Se um dia alguém precisar de um botão que age, ele vai
 * para outro módulo, com transação e trilha em `rmt_audit` — não para cá.
 *
 * E a regra-mãe do produto vale com força dobrada neste arquivo: **o site
 * nunca escreve em `items`**. Aqui a tabela `items` é LIDA, e só para uma
 * coisa: provar que o item que estamos vendendo existe de verdade e está na
 * custódia. Ler é seguro; escrever perderia a disputa com a cópia que o
 * GameServer tem em memória.
 *
 * Tudo roda no pool normal (`@/lib/db`). Não há usuário de banco separado para
 * leitura — o que protegeria contra um erro de digitação virar escrita. É uma
 * dívida conhecida, e a mitigação por enquanto é esta: nenhuma função deste
 * arquivo recebe algo que vá para uma cláusula de escrita, e o code review
 * olha para o nome do arquivo.
 *
 * ---------------------------------------------------------------------------
 * COMO A CUSTÓDIA É REPRESENTADA (é o que torna `custodia()` legível)
 *
 * Quando o escrow executa, o GameServer NÃO apaga nem recria o item: ele move
 * a MESMA linha de `items` para
 *
 *     owner_id = -1   AND   loc = 'WAREHOUSE'   AND   loc_data = <id do anúncio>
 *
 * O `-1` não é estilo: é o único owner_id que o faxineiro de órfãos do boot
 * isenta (RmtMarket.java, linhas 70-92). O `loc_data` é o que amarra o item ao
 * anúncio — um cofre por anúncio. Logo, a prova de posse do mercado é a
 * EXISTÊNCIA dessa linha, e é exatamente isso que o painel mostra.
 * ---------------------------------------------------------------------------
 */

/** `SUM()`/`COUNT()` do MariaDB chegam como DECIMAL → string no mysql2. */
function n(v: unknown): number {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

/** Os status em que o mercado AFIRMA estar segurando o item do vendedor. */
const STATUS_COM_ITEM_PRESO =
  "('pending_escrow','active','reserved','sold','delivering')";

// ---------------------------------------------------------------------------
// 1. CUSTÓDIA — "onde está o item, e ele é realmente nosso?"
// ---------------------------------------------------------------------------

export type LinhaCustodia = {
  id: number;
  status: string;
  seller_uid: number;
  seller_username: string | null;
  seller_char_name: string;
  item_id: number;
  item_object_id: number;
  enchant: number;
  count: number;
  price_cents: number;
  commission_pct: number;
  created_at: Date | string;
  reserved_until: Date | string | null;
  buyer_uid: number | null;
  /** object_id achado na custódia — `null` significa "não está lá". */
  custody_object_id: number | null;
  custody_count: number | null;
  custody_enchant: number | null;
  /** Derivados (calculados aqui para a página não repetir a regra). */
  em_custodia: boolean;
  /** O item está lá, mas não confere com o que o anúncio promete. */
  divergente: boolean;
  /** ALARME VERMELHO: estamos vendendo algo que não temos. */
  alarme: boolean;
};

/**
 * A pergunta literal do dono: "como vou saber se está realmente em nossa
 * posse?". A resposta é um LEFT JOIN, e o `LEFT` é o ponto inteiro da consulta:
 * um INNER JOIN mostraria apenas os anúncios saudáveis e esconderia justamente
 * o caso que interessa — o anúncio na vitrine SEM item no cofre.
 *
 * O JOIN casa `loc_data = l.id` (o cofre do anúncio) E `object_id =
 * l.item_object_id` (a instância prometida). Só o `loc_data` provaria que
 * ALGUM item está no cofre daquele anúncio; com o `object_id` a prova é de que
 * está lá o item QUE FOI ANUNCIADO. Num mercado de itens únicos (+16, com SA),
 * a diferença entre "um item" e "aquele item" é o preço todo.
 *
 * Ordenação: alarme primeiro. Quem abre esta tela de manhã precisa ver o
 * problema sem rolar a página.
 *
 * `pending_escrow` NÃO é alarme: nesse estado o jogo ainda não executou a
 * retirada, então a ausência da linha é o comportamento normal e esperado.
 * Alarmar nele treinaria o sócio a ignorar o vermelho.
 */
export async function custodia(limit = 300): Promise<LinhaCustodia[]> {
  const rows = await query<Omit<LinhaCustodia, "em_custodia" | "divergente" | "alarme">>(
    `SELECT l.id, l.status, l.seller_uid, l.seller_char_name,
            l.item_id, l.item_object_id, l.enchant, l.\`count\`,
            l.price_cents, l.commission_pct, l.created_at,
            l.reserved_until, l.buyer_uid,
            u.username        AS seller_username,
            i.object_id       AS custody_object_id,
            i.\`count\`         AS custody_count,
            i.enchant_level   AS custody_enchant
       FROM rmt_listings l
       LEFT JOIN web_users u ON u.id = l.seller_uid
       LEFT JOIN items i
              ON i.owner_id = -1
             AND i.loc = 'WAREHOUSE'
             AND i.loc_data = l.id
             AND i.object_id = l.item_object_id
      WHERE l.status IN ${STATUS_COM_ITEM_PRESO}
      ORDER BY (i.object_id IS NULL AND l.status <> 'pending_escrow') DESC,
               l.id DESC
      LIMIT ?`,
    [limit]
  );

  return rows.map((r) => {
    const em_custodia = r.custody_object_id != null;
    const divergente =
      em_custodia &&
      (n(r.custody_count) !== n(r.count) ||
        n(r.custody_enchant) !== n(r.enchant));
    return {
      ...r,
      id: n(r.id),
      seller_uid: n(r.seller_uid),
      item_id: n(r.item_id),
      item_object_id: n(r.item_object_id),
      enchant: n(r.enchant),
      count: n(r.count),
      price_cents: n(r.price_cents),
      commission_pct: n(r.commission_pct),
      buyer_uid: r.buyer_uid == null ? null : n(r.buyer_uid),
      custody_object_id: r.custody_object_id == null ? null : n(r.custody_object_id),
      custody_count: r.custody_count == null ? null : n(r.custody_count),
      custody_enchant: r.custody_enchant == null ? null : n(r.custody_enchant),
      em_custodia,
      divergente,
      alarme: (!em_custodia && r.status !== "pending_escrow") || divergente,
    };
  });
}

// ---------------------------------------------------------------------------
// 2. RECEITA — a margem da casa, do jeito que divide entre sócios
// ---------------------------------------------------------------------------

export type MesReceita = {
  mes: string;
  vendas: number;
  bruto_cents: number;
  casa_cents: number;
  vendedores_cents: number;
};

export type Receita = {
  vendas: number;
  bruto_cents: number;
  casa_cents: number;
  vendedores_cents: number;
  /** Vendas desfeitas (chargeback/estorno) — fora de todos os totais acima. */
  estornos: number;
  estornado_cents: number;
  meses: MesReceita[];
};

/**
 * Sai de `rmt_house_ledger` e de NENHUM outro lugar.
 *
 * Dava para derivar com `SUM(price_cents * 12 / 100)` sobre `rmt_listings`, e
 * seria errado: a comissão de uma venda é a que valia NAQUELE dia. No instante
 * em que a taxa mudar de 12% para 10%, a conta derivada reescreveria o passado
 * — todo histórico de divisão entre sócios passaria a mostrar outro número. O
 * razão grava `commission_pct` e `house_cents` na linha, imutáveis.
 *
 * `reversed_at IS NULL` em todo lugar: venda estornada não é receita. Ela não
 * é só excluída em silêncio, porém — vai contada à parte em `estornos`, porque
 * um volume de estorno subindo é a primeira coisa que aparece quando algo está
 * errado no fluxo de pagamento, e esconder isso do painel seria esconder a
 * métrica mais útil que a tabela tem.
 */
export async function receita(desde?: Date | string): Promise<Receita> {
  // Fragmento ESTÁTICO: o valor continua indo por placeholder. Concatenar a
  // cláusula e não o dado é a diferença entre SQL dinâmico e SQL injetável.
  const filtro = desde ? " AND created_at >= ?" : "";
  const p: unknown[] = desde ? [desde] : [];

  const [tot, est, meses] = await Promise.all([
    queryOne<Record<string, unknown>>(
      `SELECT COUNT(*)                        AS vendas,
              COALESCE(SUM(gross_cents),0)      AS bruto_cents,
              COALESCE(SUM(house_cents),0)      AS casa_cents,
              COALESCE(SUM(seller_net_cents),0) AS vendedores_cents
         FROM rmt_house_ledger
        WHERE reversed_at IS NULL${filtro}`,
      p
    ),
    queryOne<Record<string, unknown>>(
      `SELECT COUNT(*)                   AS estornos,
              COALESCE(SUM(gross_cents),0) AS estornado_cents
         FROM rmt_house_ledger
        WHERE reversed_at IS NOT NULL${filtro}`,
      p
    ),
    query<Record<string, unknown>>(
      `SELECT DATE_FORMAT(created_at,'%Y-%m')  AS mes,
              COUNT(*)                         AS vendas,
              COALESCE(SUM(gross_cents),0)       AS bruto_cents,
              COALESCE(SUM(house_cents),0)       AS casa_cents,
              COALESCE(SUM(seller_net_cents),0)  AS vendedores_cents
         FROM rmt_house_ledger
        WHERE reversed_at IS NULL${filtro}
        GROUP BY mes
        ORDER BY mes DESC
        LIMIT ?`,
      [...p, 24]
    ),
  ]);

  return {
    vendas: n(tot?.vendas),
    bruto_cents: n(tot?.bruto_cents),
    casa_cents: n(tot?.casa_cents),
    vendedores_cents: n(tot?.vendedores_cents),
    estornos: n(est?.estornos),
    estornado_cents: n(est?.estornado_cents),
    meses: meses.map((m) => ({
      mes: String(m.mes),
      vendas: n(m.vendas),
      bruto_cents: n(m.bruto_cents),
      casa_cents: n(m.casa_cents),
      vendedores_cents: n(m.vendedores_cents),
    })),
  };
}

// ---------------------------------------------------------------------------
// 3. CARTEIRAS — quanto a casa deve, e a quem
// ---------------------------------------------------------------------------

export type LinhaCarteira = {
  user_id: number;
  username: string | null;
  email: string | null;
  balance_cents: number;
  pending_cents: number;
  held_cents: number;
  lifetime_cents: number;
  /** Soma das travas abertas em `rmt_wallet_holds`. */
  carencia_cents: number;
  proxima_liberacao: Date | string | null;
  /**
   * `held_cents` (o agregado) discorda da soma das travas (o detalhe). Os dois
   * são escritos na mesma transação, então divergir é bug — e aparece aqui.
   */
  held_divergente: boolean;
};

/**
 * As três colunas de dinheiro de `rmt_wallet` significam coisas DIFERENTES, e
 * confundi-las é o jeito mais rápido de pagar duas vezes:
 *
 *   balance_cents  sacável AGORA
 *   held_cents     vendido, em carência — não pode sacar (chargeback ainda cabe)
 *   pending_cents  saque JÁ pedido, em processamento no provedor
 *
 * `pending_cents` é a pegadinha: pelo nome parece "a receber", e é o oposto —
 * é dinheiro que já saiu do saldo e está a caminho do vendedor. Somar os três
 * como "saldo do usuário" contaria o saque duas vezes.
 *
 * `lifetime_cents` é acumulado histórico e NÃO entra em soma de passivo.
 *
 * A subconsulta de travas é agregada antes do JOIN de propósito: juntar
 * `rmt_wallet_holds` direto multiplicaria a linha da carteira por trava aberta
 * e as somas de balance/held sairiam infladas pelo número de vendas.
 */
export async function carteiras(limit = 200): Promise<LinhaCarteira[]> {
  const rows = await query<Record<string, unknown>>(
    `SELECT w.user_id, w.balance_cents, w.pending_cents, w.held_cents,
            w.lifetime_cents,
            u.username, u.email,
            COALESCE(h.carencia_cents, 0) AS carencia_cents,
            h.proxima_liberacao
       FROM rmt_wallet w
       LEFT JOIN web_users u ON u.id = w.user_id
       LEFT JOIN (
            SELECT user_id,
                   SUM(amount_cents) AS carencia_cents,
                   MIN(available_at) AS proxima_liberacao
              FROM rmt_wallet_holds
             WHERE released_at IS NULL AND reversed_at IS NULL
             GROUP BY user_id
       ) h ON h.user_id = w.user_id
      ORDER BY (w.balance_cents + w.held_cents + w.pending_cents) DESC,
               w.user_id ASC
      LIMIT ?`,
    [limit]
  );

  return rows.map((r) => {
    const held = n(r.held_cents);
    const carencia = n(r.carencia_cents);
    return {
      user_id: n(r.user_id),
      username: r.username == null ? null : String(r.username),
      email: r.email == null ? null : String(r.email),
      balance_cents: n(r.balance_cents),
      pending_cents: n(r.pending_cents),
      held_cents: held,
      lifetime_cents: n(r.lifetime_cents),
      carencia_cents: carencia,
      proxima_liberacao: (r.proxima_liberacao as Date | string | null) ?? null,
      held_divergente: held !== carencia,
    };
  });
}

// ---------------------------------------------------------------------------
// 4. SAQUES
// ---------------------------------------------------------------------------

export type LinhaSaque = {
  id: number;
  user_id: number;
  username: string | null;
  email: string | null;
  amount_cents: number;
  method: string;
  destination: string;
  status: string;
  created_at: Date | string;
  processed_at: Date | string | null;
};

/**
 * Pendente primeiro (`requested`/`processing`), porque é o que exige ação de
 * um sócio — pagar por fora e marcar. Os já pagos ficam abaixo como histórico.
 */
export function saques(limit = 100): Promise<LinhaSaque[]> {
  return query<LinhaSaque>(
    `SELECT p.id, p.user_id, p.amount_cents, p.method, p.destination,
            p.status, p.created_at, p.processed_at,
            u.username, u.email
       FROM rmt_payouts p
       LEFT JOIN web_users u ON u.id = p.user_id
      ORDER BY (p.status IN ('requested','processing')) DESC, p.id DESC
      LIMIT ?`,
    [limit]
  );
}

// ---------------------------------------------------------------------------
// 5. OPS PRESAS — itens que não chegaram ao dono
// ---------------------------------------------------------------------------

export type LinhaOp = {
  id: number;
  listing_id: number;
  op: string;
  item_object_id: number;
  from_char_obj_id: number | null;
  to_char_obj_id: number | null;
  to_user_id: number | null;
  status: string;
  created_at: Date | string;
  horas: number;
  item_id: number | null;
  enchant: number | null;
  price_cents: number | null;
  seller_char_name: string | null;
  listing_status: string | null;
};

/**
 * Esta é a fila de reclamação de suporte antes de ela chegar ao Discord.
 *
 * Duas condições, dois problemas distintos:
 *   status='failed'  o jogo TENTOU e não deu (inventário cheio, peso, etc.)
 *   pending há 24h+  ninguém consumiu — ou o dono nunca mais entrou no jogo,
 *                    ou o consumidor do lado do GameServer está parado
 *
 * O corte de 24h não é arbitrário: `pending` é o estado normal de uma op
 * recém-criada (ela espera o dono logar), então alarmar na hora zero marcaria
 * toda venda saudável. Um dia é o tempo em que "o jogador ainda não voltou"
 * deixa de ser explicação suficiente.
 *
 * O LEFT JOIN com o anúncio é o que dá contexto: uma op presa sozinha é um
 * número de object_id; com o anúncio ao lado, dá para dizer QUAL item, de
 * quem, e de quanto dinheiro se trata.
 */
export function opsPresas(limit = 100): Promise<LinhaOp[]> {
  return query<LinhaOp>(
    `SELECT o.id, o.listing_id, o.op, o.item_object_id,
            o.from_char_obj_id, o.to_char_obj_id, o.to_user_id,
            o.status, o.created_at,
            TIMESTAMPDIFF(HOUR, o.created_at, NOW()) AS horas,
            l.item_id, l.enchant, l.price_cents, l.seller_char_name,
            l.status AS listing_status
       FROM rmt_item_ops o
       LEFT JOIN rmt_listings l ON l.id = o.listing_id
      WHERE o.status = 'failed'
         OR (o.status = 'pending' AND o.created_at < NOW() - INTERVAL 24 HOUR)
      ORDER BY (o.status = 'failed') DESC, o.id DESC
      LIMIT ?`,
    [limit]
  );
}

// ---------------------------------------------------------------------------
// 6. AUDITORIA
// ---------------------------------------------------------------------------

export type LinhaAuditoria = {
  id: number;
  at: Date | string;
  actor: string;
  action: string;
  listing_id: number | null;
  user_id: number | null;
  cents: number | null;
  detail: string | null;
};

/**
 * `rmt_audit` é append-only por convenção (006_rmt_hardening.sql §6): nada no
 * código dá UPDATE ou DELETE nela. Por isso `ORDER BY id DESC` e não por `at`
 * — o id é monotônico e desempata duas linhas gravadas no mesmo segundo, o que
 * acontece sempre dentro de uma transação de venda.
 *
 * `at` vai entre backticks: é palavra-chave do MariaDB (`CREATE EVENT ... AT`)
 * e, sem as crases, uma versão futura do parser pode reclamar.
 */
export function auditoria(limit = 80): Promise<LinhaAuditoria[]> {
  return query<LinhaAuditoria>(
    `SELECT id, \`at\`, actor, action, listing_id, user_id, cents, detail
       FROM rmt_audit
      ORDER BY id DESC
      LIMIT ?`,
    [limit]
  );
}

// ---------------------------------------------------------------------------
// 7. RESUMO — os números de topo
// ---------------------------------------------------------------------------

export type Resumo = {
  ativos: number;
  reservados: number;
  aguardando_entrega: number;
  anuncios_abertos: number;
  itens_custodia: number;
  valor_custodia_cents: number;
  /** Anúncios que afirmam ter item e NÃO têm. Qualquer valor > 0 é incidente. */
  orfaos: number;
  vendas: number;
  receita_casa_cents: number;
  /** O que a casa deve aos vendedores (sacável + carência + saque em curso). */
  passivo_cents: number;
  sacavel_cents: number;
  carencia_cents: number;
  em_saque_cents: number;
  saques_pendentes: number;
  saques_pendentes_cents: number;
  ops_presas: number;
};

/**
 * Sete consultas em paralelo em vez de uma gigante com subselects: cada uma
 * usa índice próprio, e quando uma delas ficar lenta dá para ver qual. O
 * `Promise.all` não serializa nada — o pool tem 10 conexões (lib/db.ts).
 *
 * `passivo_cents` é o número que um sócio precisa ler antes de olhar a
 * receita: é dinheiro de OUTRAS pessoas parado na nossa conta. Receita alta
 * com passivo alto não é lucro, é obrigação a pagar.
 */
export async function resumo(): Promise<Resumo> {
  const [listings, cust, ledger, wallet, payouts, ops] = await Promise.all([
    queryOne<Record<string, unknown>>(
      `SELECT SUM(status = 'active')                   AS ativos,
              SUM(status = 'reserved')                 AS reservados,
              SUM(status IN ('sold','delivering'))     AS aguardando_entrega,
              COUNT(*)                                 AS anuncios_abertos
         FROM rmt_listings
        WHERE status IN ${STATUS_COM_ITEM_PRESO}`
    ),
    // Mesmo LEFT JOIN de `custodia()`, agregado. Se a regra de posse mudar,
    // os dois lugares mudam juntos — é o custo de ter o número de topo e a
    // lista detalhada concordando.
    queryOne<Record<string, unknown>>(
      `SELECT COUNT(i.object_id) AS itens,
              COALESCE(SUM(CASE WHEN i.object_id IS NOT NULL
                                THEN l.price_cents ELSE 0 END), 0) AS valor_cents,
              SUM(i.object_id IS NULL AND l.status <> 'pending_escrow') AS orfaos
         FROM rmt_listings l
         LEFT JOIN items i
                ON i.owner_id = -1
               AND i.loc = 'WAREHOUSE'
               AND i.loc_data = l.id
               AND i.object_id = l.item_object_id
        WHERE l.status IN ${STATUS_COM_ITEM_PRESO}`
    ),
    queryOne<Record<string, unknown>>(
      `SELECT COUNT(*) AS vendas, COALESCE(SUM(house_cents),0) AS casa_cents
         FROM rmt_house_ledger WHERE reversed_at IS NULL`
    ),
    queryOne<Record<string, unknown>>(
      `SELECT COALESCE(SUM(balance_cents),0) AS sacavel,
              COALESCE(SUM(held_cents),0)    AS carencia,
              COALESCE(SUM(pending_cents),0) AS em_saque
         FROM rmt_wallet`
    ),
    queryOne<Record<string, unknown>>(
      `SELECT COUNT(*) AS n, COALESCE(SUM(amount_cents),0) AS cents
         FROM rmt_payouts WHERE status IN ('requested','processing')`
    ),
    queryOne<Record<string, unknown>>(
      `SELECT COUNT(*) AS n FROM rmt_item_ops
        WHERE status = 'failed'
           OR (status = 'pending' AND created_at < NOW() - INTERVAL 24 HOUR)`
    ),
  ]);

  const sacavel = n(wallet?.sacavel);
  const carencia = n(wallet?.carencia);
  const emSaque = n(wallet?.em_saque);

  return {
    ativos: n(listings?.ativos),
    reservados: n(listings?.reservados),
    aguardando_entrega: n(listings?.aguardando_entrega),
    anuncios_abertos: n(listings?.anuncios_abertos),
    itens_custodia: n(cust?.itens),
    valor_custodia_cents: n(cust?.valor_cents),
    orfaos: n(cust?.orfaos),
    vendas: n(ledger?.vendas),
    receita_casa_cents: n(ledger?.casa_cents),
    passivo_cents: sacavel + carencia + emSaque,
    sacavel_cents: sacavel,
    carencia_cents: carencia,
    em_saque_cents: emSaque,
    saques_pendentes: n(payouts?.n),
    saques_pendentes_cents: n(payouts?.cents),
    ops_presas: n(ops?.n),
  };
}
