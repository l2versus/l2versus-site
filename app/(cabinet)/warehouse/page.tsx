import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getBalance } from "@/lib/repos/economy";
import { ownedChars } from "@/lib/repos/services";
import WarehouseClient, { type WarehouseChar } from "./WarehouseClient";

const COIN = process.env.NEXT_PUBLIC_COIN_NAME ?? "VSCOIN";

export default async function WarehousePage() {
  const s = await getSession();
  if (!s) redirect("/login");

  const [balance, chars] = await Promise.all([
    getBalance(s.uid),
    ownedChars(s.uid),
  ]);

  const charViews: WarehouseChar[] = chars.map((c) => ({
    objId: Number(c.obj_Id),
    name: c.char_name,
    online: c.online === 1,
  }));

  return (
    <>
      <header className="reveal">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-gold)]">
          Armazém
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-[0.06em] text-[var(--color-parchment)] md:text-4xl">
          Enviar {COIN} ao <span className="text-glow-gold">Jogo</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
          Transfira {COIN} do seu saldo do site direto para um personagem
          dentro do servidor L2 Versus.
        </p>
      </header>

      {charViews.length === 0 ? (
        <div
          className="panel reveal mt-8 rounded-sm px-6 py-12 text-center"
          style={{ animationDelay: "0.1s" }}
        >
          <p className="text-[var(--color-muted)]">
            Você ainda não possui personagens em nenhuma conta de jogo.
          </p>
          <p className="mt-2 text-sm text-[var(--color-faint)]">
            Crie uma conta de jogo e um personagem no servidor para poder
            receber {COIN}.
          </p>
          <Link
            href="/dashboard"
            className="btn-ghost mt-6 inline-flex px-6 py-2.5 text-xs"
          >
            Gerenciar contas de jogo
          </Link>
        </div>
      ) : (
        <WarehouseClient chars={charViews} balance={balance} coinName={COIN} />
      )}
    </>
  );
}
