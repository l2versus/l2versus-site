import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listSellerItems, COMMISSION_PCT } from "@/lib/repos/rmt";
import SellClient, { type SellItem } from "./SellClient";

// Inventário/warehouse muda o tempo todo; nunca renderizar estático nem tocar o DB no build.
export const dynamic = "force-dynamic";

export default async function RmtSellPage() {
  const s = await getSession();
  if (!s) redirect("/login");

  const raw = await listSellerItems(s.uid);
  const items: SellItem[] = raw.map((i) => ({
    objectId: Number(i.object_id),
    itemId: Number(i.item_id),
    enchant: Number(i.enchant),
    count: Number(i.count),
    charObjId: Number(i.char_obj_id),
    charName: i.char_name,
    online: i.online === 1,
  }));

  return (
    <>
      <header className="reveal flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-gold)]">
            RMT Market
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-[0.06em] text-[var(--color-parchment)] md:text-4xl">
            Anunciar <span className="text-glow-gold">item</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--color-muted)]">
            Venda itens do seu inventário ou warehouse por dinheiro real (USD).
            A casa retém {COMMISSION_PCT}% de comissão na venda.
          </p>
        </div>
      </header>

      {/* Aviso de custódia */}
      <div
        className="reveal mt-6 flex items-start gap-3 rounded-sm border border-[rgba(201,162,75,0.35)] bg-[rgba(201,162,75,0.05)] px-5 py-4"
        style={{ animationDelay: "0.05s" }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-0.5 shrink-0"
        >
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        </svg>
        <p className="text-sm leading-relaxed text-[var(--color-muted)]">
          O personagem precisa estar{" "}
          <span className="font-medium text-[var(--color-parchment)]">
            OFFLINE
          </span>{" "}
          para anunciar (o item entra em custódia).
        </p>
      </div>

      {items.length === 0 ? (
        <div
          className="panel reveal mt-6 rounded-sm px-6 py-10 text-center text-sm text-[var(--color-muted)]"
          style={{ animationDelay: "0.1s" }}
        >
          Nenhum item negociável — entre no jogo / coloque itens no inventário
          ou warehouse.
        </div>
      ) : (
        <SellClient items={items} />
      )}
    </>
  );
}
