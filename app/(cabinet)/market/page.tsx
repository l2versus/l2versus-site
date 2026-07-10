import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { offlineStores } from "@/lib/repos/ladder";
import MarketClient from "./MarketClient";

// As lojas abrem e fecham o tempo todo — nunca renderizar estático nem tocar o DB no build.
export const dynamic = "force-dynamic";

export default async function MarketPage() {
  const s = await getSession();
  if (!s) redirect("/login");

  const stores = await offlineStores(60);
  const totalItems = stores.reduce((n, st) => n + st.items.length, 0);

  return (
    <>
      <header className="reveal flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-gold)]">
            Mercado de Aden
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-[0.06em] text-[var(--color-parchment)] md:text-4xl">
            <span className="text-glow-gold">Lojas Offline</span>
          </h1>
          <p className="mt-2 max-w-xl text-[var(--color-muted)]">
            Lojas de jogadores em modo offline no mundo de Aden.
          </p>
        </div>

        {stores.length > 0 && (
          <div className="flex gap-6 rounded-sm border border-[var(--color-line)] bg-[rgba(201,162,75,0.04)] px-5 py-3 text-center">
            <div>
              <div className="font-display text-2xl text-[var(--color-gold-bright)]">
                {stores.length}
              </div>
              <div className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--color-faint)]">
                Lojas
              </div>
            </div>
            <div className="border-l border-[var(--color-line)]" />
            <div>
              <div className="font-display text-2xl text-[var(--color-gold-bright)]">
                {totalItems}
              </div>
              <div className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--color-faint)]">
                Ofertas
              </div>
            </div>
          </div>
        )}
      </header>

      {stores.length === 0 ? (
        <div className="panel reveal mt-8 flex flex-col items-center justify-center gap-3 rounded-sm px-6 py-20 text-center">
          <span className="inline-block h-2 w-2 rotate-45 border border-[var(--color-gold)] bg-[rgba(201,162,75,0.2)]" />
          <p className="max-w-md text-[var(--color-muted)]">
            Nenhuma loja offline no momento.
          </p>
        </div>
      ) : (
        <MarketClient stores={stores} />
      )}
    </>
  );
}
