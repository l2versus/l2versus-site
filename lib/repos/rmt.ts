import "server-only";
import { pool, query, queryOne, execute } from "@/lib/db";
import type { PoolConnection, ResultSetHeader } from "mysql2/promise";

/**
 * RMT Market — núcleo do DINHEIRO. REGRAS DE SEGURANÇA:
 *
 *  - O site NUNCA escreve na tabela `items` do servidor rodando. Nem UPDATE,
 *    nem INSERT, nunca. A cópia que vale de um item é a que está em memória no
 *    GameServer; escrever no banco por baixo dela perde a escrita no próximo
 *    save ou, pior, DUPLICA o item. O site grava INTENÇÕES em `rmt_item_ops` e
 *    o GameServer executa, sempre com o dono ONLINE, pela API de inventário.
 *  - Comissão e valores são SEMPRE derivados no servidor (nunca do cliente).
 *  - Toda transição de estado de anúncio é um UPDATE CONDICIONAL com
 *    `affectedRows === 1`. Ler-decidir-escrever em dois comandos perde a corrida
 *    com um segundo comprador; um comando só não perde.
 *  - Pagamento em USD do comprador e saque do vendedor são seams de provedor.
 *
 * MÁQUINA DE ESTADOS (a ordem importa, e cada passo tem um dono):
 *
 *   pending_escrow -> active      JOGO: o item saiu do inventário, está em custódia
 *   active         -> reserved    SITE: comprador entrou no checkout (reserveListing)
 *   reserved       -> active      SITE: reserva venceu sozinha (sweepReservations)
 *   reserved       -> sold        SITE: pagamento confirmado (settleSale)
 *   sold           -> delivering  JOGO: op 'deliver' em execução
 *   delivering     -> delivered   JOGO: comprador recolheu o item
 *   active         -> cancelled   vendedor desistiu, item volta
 *   sold/entregue  -> refunded    SITE: estorno (refundSale)
 */

export const COMMISSION_PCT = 12;

/**
 * Carência antes do liquido virar sacável.
 *
 * ATENÇÃO: esta constante só decide a carência de vendas NOVAS. A data efetiva
 * é gravada em `rmt_wallet_holds.available_at` NO MOMENTO DA VENDA. É de
 * propósito: se amanhã a política virar 14 dias, mudar este número não pode
 * reescrever o passado de ninguém — quem vendeu sob 7 dias continua com 7.
 * Por isso `releaseHolds()` nunca olha para cá; olha só para `available_at`.
 */
export const HOLD_DAYS = 7;

/** Reserva padrão do checkout. Curta de propósito: é o tempo que o item fica
 *  travado para um comprador que pode simplesmente fechar a aba. */
export const RESERVE_MINUTES = 15;

/** SQL da trilha de auditoria. Append-only por convenção: nada aqui dá UPDATE
 *  ou DELETE em `rmt_audit`. `cents` é assinado — débito entra negativo. */
const AUDIT_SQL =
  "INSERT INTO rmt_audit (actor, action, listing_id, user_id, cents, detail) VALUES (?, ?, ?, ?, ?, ?)";

/**
 * MariaDB devolve ER_DUP_ENTRY (1062) ao bater em UNIQUE. Em várias partes
 * deste arquivo a duplicidade NÃO é erro, é a prova de que outro caminho já fez
 * o trabalho (webhook reenviado, settle reexecutado). Por isso o errno é
 * inspecionado em vez de o erro ser engolido com INSERT IGNORE — o IGNORE
 * também silenciaria truncamento de coluna e tipo errado, que são bugs reais.
 *
 * Medido contra o MariaDB 11.8 deste projeto: errno 1062, code ER_DUP_ENTRY,
 * sqlState 23000. O errno é o critério porque é o único estável entre versões.
 */
function isDupEntry(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    (e as { errno?: number }).errno === 1062
  );
}

/**
 * INSERT que trata a colisão de UNIQUE como "alguém já fez isso". Devolve
 * `true` se a linha nasceu agora, `false` se já existia.
 *
 * POR QUE NÃO `ON DUPLICATE KEY UPDATE col = col` + affectedRows === 0, que é
 * o truque clássico: AQUI ELE NÃO FUNCIONA. O mysql2 conecta com a flag
 * FOUND_ROWS ligada, então `affectedRows` conta linhas CASADAS, não alteradas —
 * medido neste banco, o ODKU repetido devolve 1 igualzinho ao insert original
 * (e um UPDATE que não muda nada também devolve 1). Pendurar o crédito da
 * carteira naquele 0 creditaria o vendedor DUAS VEZES num webhook reenviado.
 *
 * POR QUE SE PODE CAPTURAR O ERRO DENTRO DA TRANSAÇÃO: ER_DUP_ENTRY aborta só
 * o statement, não a transação — medido: um INSERT depois do dup funciona e o
 * COMMIT preserva tudo. Se algum dia isto rodar sobre um banco que aborta a tx
 * inteira no dup, este helper é o único lugar a mudar.
 *
 * ATENÇÃO para quem mexer em `affectedRows` neste arquivo: ele é "casadas".
 * Todos os portões condicionais daqui funcionam porque o WHERE já exclui o
 * estado de destino (`WHERE status='reserved'` ao virar 'sold',
 * `WHERE released_at IS NULL` ao marcar liberada) — casar e vencer é a mesma
 * coisa. Não é verdade para um UPDATE sem essa exclusão.
 */
async function inserirUnico(
  conn: PoolConnection,
  sql: string,
  params: Array<string | number | null>
): Promise<boolean> {
  try {
    await conn.execute(sql, params);
    return true;
  } catch (e) {
    if (isDupEntry(e)) return false;
    throw e;
  }
}

export type SellerItem = {
  object_id: number;
  item_id: number;
  enchant: number;
  count: number;
  char_obj_id: number;
  char_name: string;
  online: number;
};

export type Listing = {
  id: number;
  seller_uid: number;
  seller_char_name: string;
  item_object_id: number;
  item_id: number;
  enchant: number;
  count: number;
  price_cents: number;
  commission_pct: number;
  status: string;
  created_at: Date | string;
};

export type Wallet = {
  balance_cents: number;
  /** Saque em processamento. NÃO confundir com `held_cents`: aqui o dinheiro
   *  está saindo para o vendedor; lá ele ainda nem é dele de verdade. */
  pending_cents: number;
  /** Venda em carência (pode ser estornada). Não é sacável. */
  held_cents: number;
  lifetime_cents: number;
};

/** Itens negociáveis das contas do usuário (inventário/warehouse). */
export function listSellerItems(uid: number): Promise<SellerItem[]> {
  return query<SellerItem>(
    `SELECT i.object_id, i.item_id, i.enchant_level AS enchant, i.count,
            c.charId AS char_obj_id, c.char_name, c.online
       FROM items i
       JOIN characters c ON c.charId = i.owner_id
       JOIN accounts a ON a.login = c.account_name
      WHERE a.site_user_id = ?
        AND i.loc IN ('INVENTORY','WAREHOUSE')
        AND (c.deletetime = 0 OR c.deletetime IS NULL)
      ORDER BY i.item_id`,
    [uid]
  );
}

/** Vitrine: anúncios ativos. Reservado NÃO aparece — está no checkout de alguém. */
export function browseListings(limit = 100): Promise<Listing[]> {
  return query<Listing>(
    `SELECT id, seller_uid, seller_char_name, item_object_id, item_id, enchant,
            count, price_cents, commission_pct, status, created_at
       FROM rmt_listings WHERE status = 'active' ORDER BY id DESC LIMIT ?`,
    [limit]
  );
}

/** Meus anúncios (todos os status). */
export function myListings(uid: number): Promise<Listing[]> {
  return query<Listing>(
    `SELECT id, seller_uid, seller_char_name, item_object_id, item_id, enchant,
            count, price_cents, commission_pct, status, created_at
       FROM rmt_listings WHERE seller_uid = ? ORDER BY id DESC`,
    [uid]
  );
}

/**
 * ANUNCIAR PELO SITE ESTÁ MORTO. Não remova a função: a assinatura some do
 * repo e o próximo que precisar entender o porquê não acha mais nada.
 *
 * O QUE ESTAVA ERRADO: esta função gravava o anúncio já como 'active' e
 * enfileirava uma op 'escrow' que O JOGO NUNCA CONSOME (o RmtMarket.java só
 * reclama ops 'deliver' e 'restore'). Resultado: o anúncio aparecia na vitrine
 * e o item continuava no inventário do vendedor — ele podia usar, encantar,
 * trocar ou dropar, e alguém pagaria dinheiro real por um item que não estava
 * em custódia nenhuma. A venda não falhava em voz alta: ela entregava nada.
 *
 * E não há conserto possível daqui: tirar o item do inventário é escrever na
 * tabela `items` por baixo do GameServer, que é exatamente a regra que não se
 * quebra. Quem pode tirar o item com segurança é quem o tem em memória — o
 * próprio servidor. Então anunciar é EXCLUSIVO do jogo: Alt+B > RMT MARKET.
 */
export async function createListing(
  _uid: number,
  _objectId: number,
  _priceCents: number
): Promise<{ ok: boolean; error?: string; id?: number }> {
  return {
    ok: false,
    error:
      "Anuncie pelo jogo: Alt+B > RMT MARKET > ANUNCIAR — é assim que o item sai do seu inventário e entra em custódia.",
  };
}

/**
 * ACTIVE -> RESERVED. Congela o anúncio enquanto o comprador paga.
 *
 * POR QUE EXISTE: com gateway real o pagamento acontece ANTES do settleSale —
 * o comprador vai ao provedor e paga, e isso leva minutos. Sem este estado o
 * anúncio fica 'active' nesse intervalo e o vendedor PODE cancelar; o
 * settleSale então falha com o comprador já debitado.
 *
 * É UM ÚNICO COMANDO, e isso não é economia de linha — é o que torna a reserva
 * correta. O WHERE resolve três coisas de uma vez:
 *
 *   1. `status='active'`         -> só UM comprador ganha. O segundo recebe
 *                                   affectedRows 0 e vê "indisponível"; não há
 *                                   janela entre ler e escrever para disputar.
 *   2. `OR (reserved AND reserved_until < NOW())`
 *                                -> reserva abandonada é reaproveitada na hora,
 *                                   sem depender do sweep ter rodado antes.
 *   3. `seller_uid <> ?`         -> ninguém reserva (nem compra) o próprio anúncio.
 *
 * `notified_at = NULL` reabre o aviso em jogo: o GameServer varre
 * `status='reserved' AND notified_at IS NULL`, então o vendedor é avisado uma
 * vez por reserva — e uma reserva reaproveitada é uma reserva nova.
 */
export async function reserveListing(
  listingId: number,
  buyerUid: number,
  token: string,
  minutos: number = RESERVE_MINUTES
): Promise<{ ok: boolean; error?: string; reservedUntil?: Date }> {
  if (!Number.isInteger(listingId) || listingId <= 0)
    return { ok: false, error: "Anúncio inválido." };
  // Janela limitada no servidor: um `minutos` vindo de fora travaria o item do
  // vendedor por tempo arbitrário. `reserve_token` é VARCHAR(64) no schema —
  // truncar silenciosamente aqui quebraria o casamento com o webhook depois.
  if (!Number.isInteger(minutos) || minutos < 1 || minutos > 120)
    return { ok: false, error: "Janela de reserva inválida." };
  if (!token || token.length > 64)
    return { ok: false, error: "Token de reserva inválido." };

  try {
    const res = await execute(
      `UPDATE rmt_listings
          SET status='reserved', reserved_by=?, reserve_token=?, notified_at=NULL,
              reserved_until = NOW() + INTERVAL ? MINUTE
        WHERE id=? AND seller_uid <> ?
          AND (status='active' OR (status='reserved' AND reserved_until < NOW()))`,
      [buyerUid, token, minutos, listingId, buyerUid]
    );
    if (res.affectedRows !== 1)
      return {
        ok: false,
        error:
          "Anúncio indisponível — pode ter sido vendido, cancelado ou já estar no checkout de outro comprador.",
      };

    await execute(AUDIT_SQL, [
      `site:${buyerUid}`,
      "reserved",
      listingId,
      buyerUid,
      null,
      `reserva de ${minutos} min, token ${token}`,
    ]);

    const row = await queryOne<{ reserved_until: Date }>(
      "SELECT reserved_until FROM rmt_listings WHERE id = ?",
      [listingId]
    );
    return { ok: true, reservedUntil: row?.reserved_until };
  } catch (e) {
    console.error("[rmt.reserveListing]", e);
    return { ok: false, error: "Erro no servidor." };
  }
}

/**
 * RESERVED -> ACTIVE para reserva vencida. Roda em tarefa periódica.
 *
 * O `reserveListing` já reaproveita reserva vencida sozinho, então isto não é
 * requisito de correção — é requisito de VITRINE: sem o sweep o item sumiria
 * da vitrine até alguém tentar reservá-lo, o que ninguém faz com um item que
 * não está listado. O vendedor ficaria refém de um comprador que fechou a aba.
 *
 * Trabalho limitado por lote: isto é um cron, não um batch de madrugada. Com o
 * índice idx_reserva a varredura é barata, mas um lote aberto poderia travar
 * muitas linhas de uma vez na tabela que mais cresce do sistema.
 */
export async function sweepReservations(
  lote = 200
): Promise<{ released: number }> {
  try {
    const vencidas = await query<{ id: number }>(
      `SELECT id FROM rmt_listings
         WHERE status='reserved' AND reserved_until < NOW()
         ORDER BY reserved_until ASC LIMIT ?`,
      [lote]
    );
    if (vencidas.length === 0) return { released: 0 };

    const ids = vencidas.map((v) => Number(v.id));
    const marcas = ids.map(() => "?").join(",");
    // O WHERE repete a condição de vencimento de propósito: entre o SELECT e
    // este UPDATE um settleSale pode ter liquidado uma dessas reservas, e
    // devolver para 'active' um anúncio já vendido re-listaria item vendido.
    const res = await execute(
      `UPDATE rmt_listings
          SET status='active', reserved_by=NULL, reserved_until=NULL,
              reserve_token=NULL, notified_at=NULL
        WHERE id IN (${marcas}) AND status='reserved' AND reserved_until < NOW()`,
      ids
    );

    if (res.affectedRows > 0)
      await execute(AUDIT_SQL, [
        "system",
        "reserve_expired",
        null,
        null,
        null,
        `${res.affectedRows} reserva(s) vencida(s) devolvida(s) à vitrine`,
      ]);

    return { released: res.affectedRows };
  } catch (e) {
    console.error("[rmt.sweepReservations]", e);
    return { released: 0 };
  }
}

/** Cancela um anúncio próprio e enfileira a devolução do item. */
export async function cancelListing(
  uid: number,
  listingId: number
): Promise<{ ok: boolean; error?: string }> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute(
      "SELECT id, seller_char_obj_id, item_object_id, status FROM rmt_listings WHERE id = ? AND seller_uid = ? FOR UPDATE",
      [listingId, uid]
    );
    const l = (rows as { seller_char_obj_id: number; item_object_id: number; status: string }[])[0];
    if (!l) { await conn.rollback(); return { ok: false, error: "Anúncio não encontrado." }; }
    // LISTA BRANCA, e não lista negra: é ESTE filtro que protege o comprador
    // que está no provedor pagando agora. 'reserved' não está aqui, então um
    // anúncio congelado não cancela — e não precisou mudar uma linha deste
    // código para isso, porque a regra sempre foi "só o que eu listei", nunca
    // "tudo menos o que eu listei". O caminho do jogo (RmtMarket.java) usa a
    // mesma lista branca; os dois ficaram protegidos de graça.
    if (l.status !== "active" && l.status !== "pending_escrow") {
      await conn.rollback();
      return { ok: false, error: "Só dá para cancelar anúncios ativos." };
    }
    await conn.execute("UPDATE rmt_listings SET status = 'cancelled' WHERE id = ?", [listingId]);
    await conn.execute(
      "INSERT INTO rmt_item_ops (listing_id, op, item_object_id, to_char_obj_id, to_user_id) VALUES (?, 'restore', ?, ?, ?)",
      [listingId, l.item_object_id, l.seller_char_obj_id, uid]
    );
    await conn.execute(AUDIT_SQL, [
      `site:${uid}`,
      "cancelled",
      listingId,
      uid,
      null,
      "cancelado pelo vendedor no site",
    ]);
    await conn.commit();
    return { ok: true };
  } catch (e) {
    await conn.rollback();
    console.error("[rmt.cancelListing]", e);
    return { ok: false, error: "Erro no servidor." };
  } finally {
    conn.release();
  }
}

/**
 * RESERVED -> SOLD. Liquida uma venda PAGA. Tudo em uma transação.
 *
 * EXIGE RESERVA (`status='reserved' AND reserved_by=?`). Não é formalidade: se
 * aceitasse 'active', o pagamento e a venda seriam dois eventos sem vínculo e
 * um webhook atrasado liquidaria um anúncio que o vendedor já tinha cancelado.
 * A reserva é o recibo de que ESTE comprador tinha ESTE item congelado.
 *
 * Vai para 'sold', não 'delivering': 'delivering' é estado do JOGO, e quem o
 * declara é quem está executando a op de entrega. O site não sabe quando o
 * GameServer pegou a fila; afirmar que está entregando quando ninguém começou
 * a entregar é mentir no histórico do comprador.
 */
export async function settleSale(
  listingId: number,
  buyerUid: number,
  buyerCharObjId: number,
  pagamento?: { provider?: string; providerRef?: string }
): Promise<{
  ok: boolean;
  error?: string;
  sellerNetCents?: number;
  houseCents?: number;
  alreadySettled?: boolean;
}> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute(
      "SELECT * FROM rmt_listings WHERE id = ? FOR UPDATE",
      [listingId]
    );
    const l = (rows as {
      seller_uid: number; item_object_id: number; price_cents: number;
      commission_pct: number; status: string; reserved_by: number | null;
      buyer_uid: number | null;
    }[])[0];
    if (!l) { await conn.rollback(); return { ok: false, error: "Anúncio inexistente." }; }

    // Webhook reenviado depois da venda já concluída: não é erro, é sucesso
    // repetido. O gateway precisa ver 2xx ou vai reenviar para sempre.
    //
    // A lista é fechada nos estados que significam "esta venda aconteceu".
    // 'refunded' fica FORA de propósito: responder "liquidado" a um webhook de
    // pagamento sobre uma venda já estornada esconderia justamente o caso que
    // alguém precisa olhar — pagamento chegando depois do estorno.
    if (
      l.buyer_uid === buyerUid &&
      ["sold", "delivering", "delivered"].includes(l.status)
    ) {
      await conn.rollback();
      return { ok: true, alreadySettled: true };
    }

    if (l.status !== "reserved" || l.reserved_by !== buyerUid) {
      await conn.rollback();
      return {
        ok: false,
        error: "Reserva ausente ou expirada — refaça o checkout.",
      };
    }
    // Redundante com o `seller_uid <> ?` da reserva, e fica: é a última linha
    // antes de mover dinheiro, e lavar dinheiro consigo mesmo pagando 12% de
    // taxa é o jeito clássico de testar se o mercado valida identidade.
    if (l.seller_uid === buyerUid) {
      await conn.rollback();
      return { ok: false, error: "Não pode comprar o próprio item." };
    }

    // Derivado do DB, nunca do cliente. A taxa usada é a gravada NO ANÚNCIO,
    // não a constante de hoje: o vendedor anunciou sob um contrato.
    const houseCents = Math.round((l.price_cents * l.commission_pct) / 100);
    const sellerNet = l.price_cents - houseCents;

    // O GATE REAL da liquidação — os ifs acima são só mensagem de erro boa.
    // Condicional em `status='reserved'`: duas chamadas concorrentes (webhook
    // duplicado em paralelo, retry do provedor) e só a primeira casa, porque a
    // segunda já encontra 'sold' e o WHERE a exclui.
    const [upd] = await conn.execute(
      `UPDATE rmt_listings
          SET status='sold', buyer_uid=?, buyer_char_obj_id=?, sold_at=CURRENT_TIMESTAMP
        WHERE id=? AND status='reserved' AND reserved_by=?`,
      [buyerUid, buyerCharObjId, listingId, buyerUid]
    );
    if ((upd as ResultSetHeader).affectedRows !== 1) {
      await conn.rollback();
      return { ok: false, error: "Anúncio mudou de estado — refaça o checkout." };
    }

    // RAZÃO DA CASA: linha imutável, com a taxa DAQUELE momento. Derivar a
    // comissão com SUM() sobre rmt_listings não serve para dividir resultado
    // entre sócios — um estorno ou uma taxa diferente no passado muda a conta
    // de ontem sozinha.
    //
    // UNIQUE(listing_id) é a idempotência, e é a COLISÃO dele que serve de
    // sinal de "já lançado" (ver `inserirUnico`: affectedRows não serve aqui).
    // A carteira se pendura nesse sinal: se a comissão já foi lançada, o
    // liquido já foi creditado, e creditar de novo é inventar dinheiro.
    const lancouAgora = await inserirUnico(
      conn,
      `INSERT INTO rmt_house_ledger
         (listing_id, seller_uid, buyer_uid, gross_cents, commission_pct,
          house_cents, seller_net_cents, provider, provider_ref)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        listingId, l.seller_uid, buyerUid, l.price_cents, l.commission_pct,
        houseCents, sellerNet,
        pagamento?.provider ?? null, pagamento?.providerRef ?? null,
      ]
    );
    const jaLancado = !lancouAgora;

    if (lancouAgora) {
      // CARÊNCIA: o liquido entra em `held_cents`, NÃO em `balance_cents`.
      // Chargeback chega dias depois do pagamento; creditar sacável na hora é
      // transferir o risco do comprador para a casa. `lifetime_cents` conta
      // agora porque é histórico de venda, não saldo.
      await conn.execute(
        `INSERT INTO rmt_wallet (user_id, held_cents, lifetime_cents)
           VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE held_cents = held_cents + VALUES(held_cents),
                                 lifetime_cents = lifetime_cents + VALUES(lifetime_cents)`,
        [l.seller_uid, sellerNet, sellerNet]
      );
      // A trava por venda, com a data de liberação NA LINHA (ver HOLD_DAYS).
      // UNIQUE(listing_id) aqui também: se a trava já existisse, a razão da
      // casa teria colidido antes e este bloco não rodaria — mas o INSERT
      // tolerante mantém as duas tabelas independentes, e nenhuma venda
      // liquidada fica sem trava por causa de um lançamento meio-feito.
      await inserirUnico(
        conn,
        `INSERT INTO rmt_wallet_holds (user_id, listing_id, amount_cents, available_at)
         VALUES (?, ?, ?, NOW() + INTERVAL ? DAY)`,
        [l.seller_uid, listingId, sellerNet, HOLD_DAYS]
      );
    }

    // ENTREGA: a op passa a carregar o DONO (`to_user_id`), não só o
    // personagem. Se o comprador apagar o personagem antes de recolher, uma op
    // presa a um charId morto deixa o item na custódia PARA SEMPRE (owner_id
    // -1 é isento do faxineiro de boot e nenhuma tela o mostra).
    // `to_char_obj_id` fica como PREFERÊNCIA — e é por ele que o
    // RmtMarket.java reclama a fila hoje, então nada do que já existe quebra.
    await conn.execute(
      "INSERT INTO rmt_item_ops (listing_id, op, item_object_id, to_char_obj_id, to_user_id) VALUES (?, 'deliver', ?, ?, ?)",
      [listingId, l.item_object_id, buyerCharObjId, buyerUid]
    );

    await conn.execute(AUDIT_SQL, [
      `site:${buyerUid}`,
      "paid",
      listingId,
      l.seller_uid,
      sellerNet,
      `bruto ${l.price_cents}, casa ${houseCents} (${l.commission_pct}%), em carência ${HOLD_DAYS}d` +
        (pagamento?.provider ? `, via ${pagamento.provider}` : ", sem cobrança (teste)"),
    ]);

    await conn.commit();
    return { ok: true, sellerNetCents: sellerNet, houseCents, alreadySettled: jaLancado };
  } catch (e) {
    await conn.rollback();
    console.error("[rmt.settleSale]", e);
    return { ok: false, error: "Erro no servidor." };
  } finally {
    conn.release();
  }
}

/**
 * Libera travas vencidas: held_cents -> balance_cents. Roda em tarefa periódica.
 *
 * Idempotente pelo UPDATE condicional em `released_at IS NULL`: é ele, e não o
 * SELECT, que decide quem libera. Duas execuções simultâneas do cron (deploy no
 * meio, dois workers) e só uma consegue marcar a trava; a outra vê
 * affectedRows 0 e desiste daquela linha sem creditar nada.
 *
 * Uma transação POR TRAVA, de propósito: uma carteira inconsistente no meio do
 * lote não pode impedir as outras de liberar.
 */
export async function releaseHolds(
  lote = 200
): Promise<{ released: number; centsReleased: number; failed: number }> {
  let released = 0;
  let centsReleased = 0;
  let failed = 0;

  const pendentes = await query<{
    id: number; user_id: number; listing_id: number; amount_cents: number;
  }>(
    `SELECT id, user_id, listing_id, amount_cents
       FROM rmt_wallet_holds
      WHERE released_at IS NULL AND reversed_at IS NULL AND available_at <= NOW()
      ORDER BY available_at ASC LIMIT ?`,
    [lote]
  );

  for (const h of pendentes) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [claim] = await conn.execute(
        `UPDATE rmt_wallet_holds SET released_at = NOW()
          WHERE id = ? AND released_at IS NULL AND reversed_at IS NULL AND available_at <= NOW()`,
        [h.id]
      );
      if ((claim as ResultSetHeader).affectedRows !== 1) {
        // Outro worker pegou, ou um estorno reverteu entre o SELECT e agora.
        await conn.rollback();
        continue;
      }
      const amount = Number(h.amount_cents);
      const [mov] = await conn.execute(
        `UPDATE rmt_wallet
            SET held_cents = held_cents - ?, balance_cents = balance_cents + ?
          WHERE user_id = ? AND held_cents >= ?`,
        [amount, amount, h.user_id, amount]
      );
      if ((mov as ResultSetHeader).affectedRows !== 1) {
        // `held_cents` menor que a trava significa que a carteira e as travas
        // divergiram. Desfaz a marcação e grita no log: creditar sacável sem
        // conseguir baixar a carência criaria dinheiro.
        await conn.rollback();
        failed++;
        console.error(
          `[rmt.releaseHolds] hold ${h.id} (user ${h.user_id}, ${amount}c) nao bateu com held_cents — carteira divergente, trava mantida`
        );
        continue;
      }
      await conn.execute(AUDIT_SQL, [
        "system",
        "released",
        h.listing_id,
        h.user_id,
        amount,
        `carência vencida: held -> balance (trava ${h.id})`,
      ]);
      await conn.commit();
      released++;
      centsReleased += amount;
    } catch (e) {
      await conn.rollback();
      failed++;
      console.error("[rmt.releaseHolds]", e);
    } finally {
      conn.release();
    }
  }

  return { released, centsReleased, failed };
}

/**
 * Estorno de uma venda já paga. Desfaz o que PODE ser desfeito — e só isso.
 *
 * O caso difícil é o dinheiro já liberado. Se a carência venceu, o vendedor já
 * pode ter sacado; tirar de `balance_cents` ali seria deixar a carteira
 * negativa (ou, com coluna UNSIGNED, estourar) e cobrar de um saldo que talvez
 * nem exista mais. Então o estorno tira SÓ de `held_cents`; se a trava já foi
 * liberada, a diferença é registrada como DÍVIDA na auditoria e devolvida como
 * aviso, para um humano decidir. Inventar o débito é pior que admitir a perda.
 *
 * NÃO enfileira op de item: estornar dinheiro não devolve o item automaticamente
 * (o comprador pode já ter recolhido e gasto/encantado). Recuperação de item é
 * decisão de suporte, pelo jogo.
 */
export async function refundSale(
  listingId: number,
  motivo: string,
  actor: string
): Promise<{
  ok: boolean;
  error?: string;
  warning?: string;
  debtCents?: number;
  reversedCents?: number;
}> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute(
      "SELECT id, seller_uid, buyer_uid, price_cents, status FROM rmt_listings WHERE id = ? FOR UPDATE",
      [listingId]
    );
    const l = (rows as {
      seller_uid: number; buyer_uid: number | null; price_cents: number; status: string;
    }[])[0];
    if (!l) { await conn.rollback(); return { ok: false, error: "Anúncio inexistente." }; }
    if (l.status === "refunded") {
      // Já estornado: idempotente, o webhook de chargeback também reenvia.
      await conn.rollback();
      return { ok: true, warning: "Estorno já havia sido registrado." };
    }
    // Só se estorna o que foi pago. 'active'/'cancelled' nunca teve dinheiro —
    // estornar ali marcaria um anúncio como refunded sem nenhuma cobrança atrás.
    if (!["sold", "delivering", "delivered"].includes(l.status)) {
      await conn.rollback();
      return { ok: false, error: `Anúncio em '${l.status}' não tem pagamento para estornar.` };
    }

    await conn.execute("UPDATE rmt_listings SET status = 'refunded' WHERE id = ?", [listingId]);

    // A razão da casa não é apagada, é MARCADA: a venda aconteceu e foi
    // desfeita, e relatório de sócio precisa ver as duas coisas.
    await conn.execute(
      "UPDATE rmt_house_ledger SET reversed_at = NOW() WHERE listing_id = ? AND reversed_at IS NULL",
      [listingId]
    );

    const [hrows] = await conn.execute(
      "SELECT id, user_id, amount_cents, released_at, reversed_at FROM rmt_wallet_holds WHERE listing_id = ? FOR UPDATE",
      [listingId]
    );
    const h = (hrows as {
      id: number; user_id: number; amount_cents: number;
      released_at: Date | null; reversed_at: Date | null;
    }[])[0];

    let debtCents = 0;
    let reversedCents = 0;
    let warning: string | undefined;

    if (h && !h.reversed_at) {
      const amount = Number(h.amount_cents);
      await conn.execute(
        "UPDATE rmt_wallet_holds SET reversed_at = NOW() WHERE id = ? AND reversed_at IS NULL",
        [h.id]
      );
      if (h.released_at) {
        // Carência já vencida: o dinheiro é sacável (ou já saiu). Não se toca
        // em balance_cents. Fica a dívida registrada — não existe tabela de
        // dívida ainda, então a trilha de auditoria É o registro.
        debtCents = amount;
        warning = `Liquido de ${amount} cents já havia sido liberado ao vendedor ${h.user_id}; registrado como dívida, não debitado.`;
      } else {
        const [mov] = await conn.execute(
          "UPDATE rmt_wallet SET held_cents = held_cents - ? WHERE user_id = ? AND held_cents >= ?",
          [amount, h.user_id, amount]
        );
        if ((mov as ResultSetHeader).affectedRows === 1) {
          reversedCents = amount;
        } else {
          debtCents = amount;
          warning = `Carteira do vendedor ${h.user_id} não tinha ${amount} cents em carência; registrado como dívida.`;
        }
      }
    }

    await conn.execute(AUDIT_SQL, [
      actor,
      "refunded",
      listingId,
      l.seller_uid,
      reversedCents > 0 ? -reversedCents : null,
      `bruto ${l.price_cents} estornado ao comprador ${l.buyer_uid ?? "?"}: ${motivo}`.slice(0, 255),
    ]);
    if (debtCents > 0)
      await conn.execute(AUDIT_SQL, [
        actor,
        "refund_debt",
        listingId,
        h?.user_id ?? l.seller_uid,
        -debtCents,
        `dívida: liquido já liberado/ausente, não debitado — ${motivo}`.slice(0, 255),
      ]);

    await conn.commit();
    return { ok: true, warning, debtCents, reversedCents };
  } catch (e) {
    await conn.rollback();
    console.error("[rmt.refundSale]", e);
    return { ok: false, error: "Erro no servidor." };
  } finally {
    conn.release();
  }
}

/**
 * PORTÃO DE IDEMPOTÊNCIA DO WEBHOOK. Grave o evento ANTES de agir sobre ele.
 *
 * Todo gateway reenvia webhook — timeout nosso, deploy no meio, retry
 * automático do provedor. Sem chave de idempotência o mesmo pagamento credita
 * o vendedor duas vezes e lança a comissão duas vezes.
 *
 * `alreadyProcessed: true` NÃO é erro: é o que todo provedor espera ver (2xx,
 * "recebi, já tratei"). Devolver erro faz o gateway reenviar em backoff
 * crescente até desistir e marcar o endpoint como quebrado.
 *
 * `payload` guarda o corpo cru para auditoria — é a única prova do que o
 * provedor realmente mandou quando um valor divergir.
 */
export async function recordPaymentEvent(
  provider: string,
  eventId: string,
  kind: string,
  listingId: number | null,
  amountCents: number | null,
  payload: string | null
): Promise<{ ok: boolean; id?: number; alreadyProcessed?: boolean; error?: string }> {
  try {
    const res = await execute(
      `INSERT INTO rmt_payment_events (provider, event_id, kind, listing_id, amount_cents, payload)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [provider, eventId, kind, listingId, amountCents, payload]
    );
    return { ok: true, id: res.insertId };
  } catch (e) {
    if (isDupEntry(e)) return { ok: true, alreadyProcessed: true };
    console.error("[rmt.recordPaymentEvent]", e);
    return { ok: false, error: "Erro no servidor." };
  }
}

/**
 * Fecha um evento de pagamento: `processed_at` quando deu certo, `error` quando
 * não. Separado do INSERT de propósito — o evento é gravado antes de agir, e só
 * depois se sabe o desfecho. Evento gravado e nunca fechado é exatamente o que
 * um relatório de pendência precisa achar.
 */
export async function markPaymentEvent(
  provider: string,
  eventId: string,
  erro?: string
): Promise<void> {
  try {
    await execute(
      "UPDATE rmt_payment_events SET processed_at = NOW(), error = ? WHERE provider = ? AND event_id = ?",
      [erro ? erro.slice(0, 255) : null, provider, eventId]
    );
  } catch (e) {
    console.error("[rmt.markPaymentEvent]", e);
  }
}

/** Carteira USD do vendedor. */
export async function getWallet(uid: number): Promise<Wallet> {
  const row = await queryOne<Wallet>(
    "SELECT balance_cents, pending_cents, held_cents, lifetime_cents FROM rmt_wallet WHERE user_id = ?",
    [uid]
  );
  return {
    balance_cents: Number(row?.balance_cents ?? 0),
    pending_cents: Number(row?.pending_cents ?? 0),
    held_cents: Number(row?.held_cents ?? 0),
    lifetime_cents: Number(row?.lifetime_cents ?? 0),
  };
}

/**
 * Pede um saque: move do saldo p/ pendente e registra (liquidação = seam).
 *
 * Só olha `balance_cents`, e é esse o ponto da carência: venda em `held_cents`
 * é invisível aqui. Chargeback que chega depois do saque é prejuízo da casa.
 */
export async function requestPayout(
  uid: number,
  amountCents: number,
  method: string,
  destination: string
): Promise<{ ok: boolean; error?: string }> {
  if (amountCents < 500) return { ok: false, error: "Saque mínimo de US$ 5,00." };
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [res] = await conn.execute(
      "UPDATE rmt_wallet SET balance_cents = balance_cents - ?, pending_cents = pending_cents + ? WHERE user_id = ? AND balance_cents >= ?",
      [amountCents, amountCents, uid, amountCents]
    );
    if ((res as ResultSetHeader).affectedRows === 0) {
      await conn.rollback();
      return { ok: false, error: "Saldo insuficiente." };
    }
    await conn.execute(
      "INSERT INTO rmt_payouts (user_id, amount_cents, method, destination) VALUES (?, ?, ?, ?)",
      [uid, amountCents, method, destination]
    );
    await conn.execute(AUDIT_SQL, [
      `site:${uid}`,
      "payout",
      null,
      uid,
      -amountCents,
      `saque solicitado via ${method}`,
    ]);
    await conn.commit();
    return { ok: true };
  } catch (e) {
    await conn.rollback();
    console.error("[rmt.requestPayout]", e);
    return { ok: false, error: "Erro no servidor." };
  } finally {
    conn.release();
  }
}

export function listPayouts(uid: number) {
  return query(
    "SELECT id, amount_cents, method, destination, status, created_at FROM rmt_payouts WHERE user_id = ? ORDER BY id DESC",
    [uid]
  );
}
