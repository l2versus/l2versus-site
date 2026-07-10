import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listGameAccounts, charactersFor } from "@/lib/repos/accounts";
import { className } from "@/lib/l2/classes";
import { getT, getLocale } from "@/lib/i18n/server";
import GameAccounts, { type AccountView } from "../_components/GameAccounts";

const MAX_ACCOUNTS = 10;

export default async function ProfilePage() {
  const s = await getSession();
  if (!s) redirect("/login");

  const [accounts, t, locale] = await Promise.all([
    listGameAccounts(s.uid),
    getT(),
    getLocale(),
  ]);

  const withChars = await Promise.all(
    accounts.map(async (account) => ({
      account,
      chars: await charactersFor(account.login),
    }))
  );

  const accountViews: AccountView[] = withChars.map(({ account, chars }) => ({
    login: account.login,
    chars: chars.map((c) => ({
      objId: Number(c.obj_Id),
      name: c.char_name,
      classId: c.classid,
      cls: className(c.classid),
      level: c.level,
      clan: c.clan_name,
      pvp: Number(c.pvpkills ?? 0),
      pk: Number(c.pkkills ?? 0),
      online: c.online === 1,
    })),
  }));

  const totalChars = accountViews.reduce((n, a) => n + a.chars.length, 0);
  const highest = accountViews
    .flatMap((a) => a.chars)
    .reduce((m, c) => Math.max(m, c.level), 0);

  return (
    <>
      <header className="reveal flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-[var(--color-gold)]">
            <span className="block h-1.5 w-1.5 rotate-45 bg-[var(--color-gold)]" />
            {t("profile.kicker")}
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-[0.06em] text-[var(--color-parchment)] md:text-4xl">
            {t("profile.welcome")},{" "}
            <span className="text-glow-gold">{s.username}</span>
          </h1>
        </div>
        <div className="flex gap-6 rounded-sm border border-[var(--color-line)] bg-[rgba(201,162,75,0.04)] px-5 py-3 text-center">
          <div>
            <div className="font-display text-2xl text-[var(--color-gold-bright)]">
              {totalChars}
            </div>
            <div className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--color-faint)]">
              {t("profile.characters")}
            </div>
          </div>
          <div className="border-l border-[var(--color-line)]" />
          <div>
            <div className="font-display text-2xl text-[var(--color-gold-bright)]">
              {highest || "—"}
            </div>
            <div className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--color-faint)]">
              {t("profile.highest")}
            </div>
          </div>
        </div>
      </header>

      <GameAccounts
        accounts={accountViews}
        used={accounts.length}
        max={MAX_ACCOUNTS}
        locale={locale}
      />
    </>
  );
}
