import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getProfile } from "@/lib/repos/accounts";
import { SITE_URL } from "@/lib/links";
import ReferralsClient from "./ReferralsClient";

export default async function ReferralsPage() {
  const s = await getSession();
  if (!s) redirect("/login");

  const profile = await getProfile(s.uid);
  // Domínio de produção como padrão; env só sobrescreve se definido (ex.: preview).
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || SITE_URL;

  return (
    <>
      <header className="reveal">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-gold)]">
          Programa de Indicação
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-[0.06em] text-[var(--color-parchment)] md:text-4xl">
          Indique <span className="text-glow-gold">amigos</span> e ganhe VSCOIN
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--color-muted)]">
          Convide jogadores para o servidor com o seu link exclusivo. A cada
          recarga de um indicado, você recebe uma comissão em VSCOIN
          automaticamente.
        </p>
      </header>

      <ReferralsClient
        code={profile.referral_code}
        referredCount={profile.referred_count}
        baseUrl={baseUrl}
      />
    </>
  );
}
