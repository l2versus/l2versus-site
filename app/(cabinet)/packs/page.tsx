import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getBalance } from "@/lib/repos/economy";
import { ownedChars } from "@/lib/repos/services";
import PacksClient, { type CharOpt } from "./PacksClient";

export default async function PacksPage() {
  const s = await getSession();
  if (!s) redirect("/login");

  const [balance, chars] = await Promise.all([
    getBalance(s.uid),
    ownedChars(s.uid),
  ]);

  const charOpts: CharOpt[] = chars.map((c) => ({
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
            Starter <span className="text-glow-gold">Packs</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--color-muted)]">
            Kits de itens entregues direto no seu personagem dentro do jogo.
            Escolha um personagem e adquira com VSCOIN.
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

      <PacksClient balance={balance} chars={charOpts} />
    </>
  );
}
