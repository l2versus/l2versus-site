import "server-only";

/**
 * Números REAIS do Discord via API pública de convites (sem token, sem widget).
 * Cacheado 5 min no data cache do Next; devolve null em falha (a UI esconde).
 */
const INVITE_CODE = "C6XMvYQz2Q";

export interface DiscordStats {
  online: number;
  members: number;
}

export async function discordStats(): Promise<DiscordStats | null> {
  try {
    const res = await fetch(
      `https://discord.com/api/v10/invites/${INVITE_CODE}?with_counts=true`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const j = (await res.json()) as {
      approximate_presence_count?: number;
      approximate_member_count?: number;
    };
    if (typeof j.approximate_member_count !== "number") return null;
    return {
      online: j.approximate_presence_count ?? 0,
      members: j.approximate_member_count,
    };
  } catch {
    return null;
  }
}
