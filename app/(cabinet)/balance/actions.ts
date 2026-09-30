"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { execute } from "@/lib/db";

/** Estado do formulário de recarga (tipo apenas — é apagado em runtime). */
export type TopUpState = { error?: string; ok?: boolean; message?: string };

/** Formas de pagamento europeias (id -> nome exibido). */
const METHODS: Record<string, string> = {
  card: "Cartão",
  paypal: "PayPal",
  sepa: "SEPA",
  crypto: "Cripto",
};

const MIN_AMOUNT = 5;
const MAX_AMOUNT = 100000;

/**
 * Faixa de bônus por volume (1 VSCOIN = 1 €).
 * MANTER EM SINCRONIA com BONUS_TIERS em BalanceClient.tsx
 * (duplicado de propósito: helpers não podem ser exportados de um arquivo "use server").
 */
function bonusRate(amount: number): number {
  if (amount >= 100) return 0.15;
  if (amount >= 50) return 0.1;
  if (amount >= 20) return 0.05;
  return 0;
}

/**
 * Registra um pedido de recarga (kind 'topup', status 'pending').
 * NÃO credita o saldo — isso é responsabilidade do callback do gateway de
 * pagamento (seam intencional: precisa de chaves de API para ativar).
 */
export async function topUpAction(
  _prev: TopUpState,
  formData: FormData
): Promise<TopUpState> {
  const s = await getSession();
  if (!s) return { error: "Sessão expirada. Faça login novamente." };

  const amount = Math.floor(Number(formData.get("amount") ?? 0));
  const method = String(formData.get("method") ?? "").trim();
  const promo = String(formData.get("promo") ?? "")
    .trim()
    .toUpperCase()
    .slice(0, 32);

  if (!Number.isFinite(amount) || amount < MIN_AMOUNT)
    return { error: `O valor mínimo de recarga é ${MIN_AMOUNT} VSCOIN.` };
  if (amount > MAX_AMOUNT)
    return { error: `O valor máximo por recarga é ${MAX_AMOUNT} VSCOIN.` };

  const methodLabel = METHODS[method];
  if (!methodLabel) return { error: "Selecione uma forma de pagamento válida." };

  const bonus = Math.floor(amount * bonusRate(amount));
  const total = amount + bonus;

  let description = `Recarga de ${amount} VSCOIN via ${methodLabel}`;
  if (bonus > 0) description += ` (+${bonus} de bônus)`;
  if (promo) description += ` · promo ${promo}`;

  try {
    await execute(
      "INSERT INTO web_transactions (user_id, kind, amount, method, status, description) VALUES (?, 'topup', ?, ?, 'pending', ?)",
      [s.uid, total, method, description]
    );
  } catch (e) {
    console.error("topUpAction", e);
    return { error: "Erro ao registrar a recarga. Tente novamente." };
  }

  revalidatePath("/balance");
  revalidatePath("/history");
  return {
    ok: true,
    message:
      `Pedido de recarga de ${total} VSCOIN registrado como PENDENTE via ${methodLabel}. ` +
      "O crédito será liberado assim que o pagamento for confirmado. " +
      "Atenção: nenhum gateway de pagamento está conectado ainda — é preciso ligar as chaves de API para processar o pagamento real.",
  };
}
