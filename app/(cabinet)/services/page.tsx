import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ownedChars } from "@/lib/repos/services";
import { getBalance } from "@/lib/repos/economy";
import { query } from "@/lib/db";
import ServicesClient, { type ServiceChar } from "./ServicesClient";

export default async function ServicesPage() {
  const s = await getSession();
  if (!s) redirect("/login");

  const [chars, balance] = await Promise.all([
    ownedChars(s.uid),
    getBalance(s.uid),
  ]);

  // ownedChars() não traz o nível — busca em lote apenas pelos obj_Ids do usuário.
  const objIds = chars.map((c) => Number(c.obj_Id));
  const levels = new Map<number, number>();
  if (objIds.length) {
    const rows = await query<{ obj_Id: number; level: number }>(
      `SELECT charId AS obj_Id, level FROM characters WHERE charId IN (${objIds
        .map(() => "?")
        .join(",")})`,
      objIds
    );
    for (const r of rows) levels.set(Number(r.obj_Id), Number(r.level));
  }

  const view: ServiceChar[] = chars.map((c) => ({
    objId: Number(c.obj_Id),
    name: c.char_name,
    level: levels.get(Number(c.obj_Id)) ?? 0,
    online: c.online === 1,
    karma: Number(c.karma ?? 0),
    sex: Number(c.sex ?? 0),
  }));

  return (
    <>
      <header className="reveal flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-gold)]">
            Serviços
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-[0.06em] text-[var(--color-parchment)] md:text-4xl">
            Serviços de <span className="text-glow-gold">Personagem</span>
          </h1>
        </div>
        <div className="rounded-sm border border-[var(--color-line)] bg-[rgba(201,162,75,0.04)] px-5 py-3 text-center">
          <div className="font-display text-2xl text-[var(--color-gold-bright)]">
            {balance.toLocaleString("pt-BR")}
          </div>
          <div className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--color-faint)]">
            VSCOIN
          </div>
        </div>
      </header>

      <div
        className="reveal mt-6 flex items-start gap-3 rounded-sm border border-[rgba(201,162,75,0.35)] bg-[rgba(201,162,75,0.06)] px-4 py-3"
        style={{ animationDelay: "0.05s" }}
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
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <p className="text-sm text-[var(--color-muted)]">
          O personagem precisa estar{" "}
          <span className="font-semibold text-[var(--color-gold-bright)]">
            OFFLINE
          </span>{" "}
          para usar os serviços.
        </p>
      </div>

      <ServicesClient chars={view} balance={balance} />
    </>
  );
}
