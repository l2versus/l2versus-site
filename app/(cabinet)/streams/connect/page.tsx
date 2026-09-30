import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getT } from "@/lib/i18n/server";
import { myStreamers } from "@/lib/repos/streams";
import StreamsClient from "./StreamsClient";

export default async function StreamsConnectPage() {
  const s = await getSession();
  if (!s) redirect("/login");

  const [t, streams] = await Promise.all([getT(), myStreamers(s.uid)]);

  const labels = {
    title: t("st.title"),
    sub: t("st.sub"),
    platform: t("st.platform"),
    channel: t("st.channel"),
    hint: t("st.channel_hint"),
    add: t("st.add"),
    none: t("st.none"),
    remove: t("st.remove"),
    status_approved: t("st.status.approved"),
    status_pending: t("st.status.pending"),
    status_rejected: t("st.status.rejected"),
  };

  return (
    <>
      <header className="reveal flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-gold)]">
            Streams
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-[0.06em] text-[var(--color-parchment)] md:text-4xl">
            {t("st.title")}
          </h1>
        </div>
        <Link href="/streams" className="btn-ghost px-5 py-2.5 text-xs">
          {t("site.nav.streams")} ↗
        </Link>
      </header>

      <StreamsClient initial={streams} labels={labels} />
    </>
  );
}
