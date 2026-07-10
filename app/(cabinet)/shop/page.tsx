import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getBalance } from "@/lib/repos/economy";
import { ownedChars } from "@/lib/repos/services";
import { DONATE_CATALOG, DONATE_CATEGORIES } from "@/lib/l2/donate-catalog";
import ShopClient, { type ShopChar } from "./ShopClient";

// A base da rev muda o tempo todo; nunca renderizar estático nem tocar o DB no build.
export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const s = await getSession();
  if (!s) redirect("/login");

  const [balance, chars] = await Promise.all([
    getBalance(s.uid),
    ownedChars(s.uid),
  ]);

  const charOpts: ShopChar[] = chars.map((c) => ({
    objId: Number(c.obj_Id),
    name: c.char_name,
    online: c.online === 1,
  }));

  return (
    <>
      <header className="reveal flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-gold)]">
            Loja
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-[0.06em] text-[var(--color-parchment)] md:text-4xl">
            Donate <span className="text-glow-gold">Shop</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--color-muted)]">
            Gaste VSCOIN em VIP, runas, enchant assist, soulstones e mais. A
            entrega é enfileirada e processada dentro do jogo.
          </p>
        </div>
        <div className="rounded-sm border border-[var(--color-line)] bg-[rgba(201,162,75,0.04)] px-5 py-3 text-center">
          <div className="font-display text-2xl text-[var(--color-gold-bright)]">
            {new Intl.NumberFormat("pt-BR").format(balance)}
          </div>
          <div className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--color-faint)]">
            VSCOIN disponível
          </div>
        </div>
      </header>

      <ShopClient
        balance={balance}
        chars={charOpts}
        catalog={DONATE_CATALOG}
        categories={DONATE_CATEGORIES}
      />
    </>
  );
}
