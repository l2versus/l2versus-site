import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { browseListings } from "@/lib/repos/rmt";
import { ownedChars } from "@/lib/repos/services";
import RmtMarketClient, { type RmtChar } from "./RmtMarketClient";

// A base da rev muda o tempo todo; nunca renderizar estático nem tocar o DB no build.
export const dynamic = "force-dynamic";

export default async function RmtMarketPage() {
  const s = await getSession();
  if (!s) redirect("/login");

  const [listings, chars] = await Promise.all([
    browseListings(100),
    ownedChars(s.uid),
  ]);

  const charOpts: RmtChar[] = chars.map((c) => ({
    objId: Number(c.obj_Id),
    name: c.char_name,
    online: c.online === 1,
  }));

  return (
    <>
      <header className="reveal flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-gold)]">
            Marketplace
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-[0.06em] text-[var(--color-parchment)] md:text-4xl">
            RMT <span className="text-glow-gold">Market</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--color-muted)]">
            Compre e venda itens entre jogadores por dinheiro real (USD). A casa
            retém 12% de comissão sobre cada venda; o vendedor recebe os 88%
            restantes.
          </p>
        </div>
      </header>

      {/* Aviso do modo teste (o checkout USD real é seam de deploy) */}
      <div
        className="reveal mt-6 flex items-start gap-3 rounded-sm border border-[rgba(201,162,75,0.35)] bg-[rgba(201,162,75,0.06)] px-4 py-3"
        style={{ animationDelay: "0.03s" }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-0.5 shrink-0"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-sm text-[var(--color-muted)]">
          O checkout USD real entra no deploy. Por ora, o botão{" "}
          <span className="font-semibold text-[var(--color-gold-bright)]">
            Comprar
          </span>{" "}
          liquida a venda em{" "}
          <span className="font-semibold text-[var(--color-gold-bright)]">
            modo teste
          </span>
          .
        </p>
      </div>

      <RmtMarketClient
        listings={listings}
        chars={charOpts}
        myUid={s.uid}
      />
    </>
  );
}
