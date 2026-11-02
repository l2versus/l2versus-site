"use server";

import { getSession } from "@/lib/session";

export type SellState = { error?: string; ok?: boolean; message?: string };

/**
 * ANUNCIAR PELO SITE ESTÁ DESLIGADO — e não é um "ainda não implementado".
 *
 * O caminho antigo gravava o anúncio como 'active' e enfileirava uma op
 * 'escrow' que o jogo NUNCA consome (o RmtMarket.java só reclama ops 'deliver'
 * e 'restore'). O anúncio ia para a vitrine e o item continuava no inventário
 * do vendedor: ele podia usar, encantar, trocar ou dropar o item enquanto
 * alguém pagava dinheiro real por ele. Não havia erro na tela — havia venda de
 * coisa nenhuma.
 *
 * E não dá para consertar daqui. Tirar o item do inventário com segurança
 * exige a API de inventário do GameServer, porque a cópia que vale do item está
 * em MEMÓRIA nele; o site escrevendo em `items` por baixo perde a escrita no
 * próximo save ou duplica o item. Quem pode fazer isso é quem tem o item em
 * memória. Então anunciar é EXCLUSIVO do jogo.
 *
 * A action continua existindo e exportada porque o SellClient a consome via
 * useActionState — e porque uma mensagem que ENSINA o caminho certo vale mais
 * que um botão que desapareceu sem explicação.
 */
export async function createListingAction(
  _prev: SellState,
  _formData: FormData
): Promise<SellState> {
  // A sessão é checada mesmo recusando: a mensagem certa para quem perdeu o
  // login é "faça login", não uma aula sobre custódia de item.
  const s = await getSession();
  if (!s) return { error: "Sessão expirada. Faça login novamente." };

  return {
    error:
      "Anuncie pelo jogo: Alt+B > RMT MARKET > ANUNCIAR — é assim que o item sai do seu inventário e entra em custódia. Anúncio criado pelo site deixaria o item na sua mochila, e o comprador pagaria por nada.",
  };
}
