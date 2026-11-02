"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { ownedChars } from "@/lib/repos/services";
import { reserveListing, settleSale } from "@/lib/repos/rmt";

export type BuyState = { ok?: boolean; message?: string; error?: string };

/**
 * Compra de um anúncio do RMT Market.
 *
 * MODO TESTE: NINGUÉM É COBRADO. Não há gateway integrado — não existe
 * checkout, não existe cartão, não existe cripto. O que esta action faz é
 * percorrer a máquina de estados do dinheiro sem o dinheiro.
 *
 * E ela percorre A MESMA máquina que o gateway vai percorrer, de propósito:
 *
 *   1. reserveListing  — congela o anúncio para ESTE comprador. Com gateway
 *      real é aqui que a sessão de checkout nasce, e o anúncio fica travado
 *      enquanto o comprador paga (minutos). Sem este passo o vendedor pode
 *      cancelar no meio do pagamento e o settleSale falha com o comprador já
 *      debitado.
 *   2. settleSale      — só aceita anúncio 'reserved' POR ESTE comprador. Com
 *      gateway real quem chama é o webhook de pagamento confirmado, não o
 *      clique do usuário.
 *
 * Testar o atalho (settleSale direto) testaria um caminho que a produção nunca
 * vai usar: o bug moraria justamente na costura entre os dois passos.
 *
 * Se o passo 2 falhar, a reserva NÃO é desfeita aqui — ela vence sozinha
 * (`reserved_until`) e o `sweepReservations()` devolve o anúncio à vitrine.
 * Desfazer na mão abriria uma brecha: um comprador poderia forçar erro no
 * settle para liberar o anúncio que outro estava comprando.
 *
 * SEGURANÇA:
 *  - Nunca confia em preço vindo do cliente: settleSale re-deriva tudo do DB,
 *    com a comissão gravada NO ANÚNCIO (o contrato que o vendedor aceitou).
 *  - Valida que o personagem receptor pertence ao comprador (escopo por uid).
 *  - reserveListing e settleSale recusam o próprio anúncio (seller_uid).
 */
export async function buyAction(
  _prev: BuyState,
  formData: FormData
): Promise<BuyState> {
  const s = await getSession();
  if (!s) return { error: "Sessão expirada. Faça login novamente." };

  const listingId = Number(formData.get("listingId"));
  const buyerCharObjId = Number(formData.get("buyerCharObjId"));

  if (!Number.isInteger(listingId) || listingId <= 0)
    return { error: "Anúncio inválido." };
  if (!Number.isInteger(buyerCharObjId) || buyerCharObjId <= 0)
    return { error: "Escolha um personagem para receber o item." };

  // O personagem receptor precisa pertencer ao comprador.
  const chars = await ownedChars(s.uid);
  const owns = chars.some((c) => Number(c.obj_Id) === buyerCharObjId);
  if (!owns) return { error: "Esse personagem não é seu." };

  // No lugar do id da sessão de checkout do provedor. O prefixo 'teste:' deixa
  // a origem visível em `reserve_token` e na auditoria: dá para separar venda
  // de teste de venda real por consulta, sem adivinhar por data.
  const token = `teste:${randomUUID()}`;

  const reserva = await reserveListing(listingId, s.uid, token);
  if (!reserva.ok)
    return { error: reserva.error ?? "Não foi possível reservar o anúncio." };

  const res = await settleSale(listingId, s.uid, buyerCharObjId);
  if (!res.ok) return { error: res.error ?? "Não foi possível concluir a compra." };

  revalidatePath("/rmt");
  return {
    ok: true,
    message:
      "MODO TESTE — nada foi cobrado: não há gateway de pagamento integrado. " +
      "O anúncio foi reservado e liquidado como se o pagamento tivesse sido " +
      "confirmado. Recolha o item em jogo: Alt+B > RMT MARKET.",
  };
}
