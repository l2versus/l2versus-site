import "server-only";
import { query, execute } from "@/lib/db";

/**
 * Repositório de streamers (web_streamers) + checagem de "ao vivo".
 * Twitch: status live via decapi.me (API pública, sem token), cache 2 min.
 * Tolerante a falha: erro de rede => offline (nunca derruba a página).
 * Todas as escritas usam SQL parametrizado (mysql2 execute).
 */

export type Platform = "twitch" | "youtube" | "kick" | "trovo";

export interface StreamerRow {
  id: number;
  user_id: number;
  platform: Platform;
  channel: string;
  url: string;
  status: "pending" | "approved" | "rejected";
  created_at: Date | string;
  username?: string;
}

const PLATFORMS: Platform[] = ["twitch", "youtube", "kick", "trovo"];

export function isPlatform(v: string): v is Platform {
  return (PLATFORMS as string[]).includes(v);
}

export async function approvedStreamers(): Promise<StreamerRow[]> {
  try {
    return await query<StreamerRow>(
      `SELECT s.*, u.username FROM web_streamers s
        JOIN web_users u ON u.id = s.user_id
       WHERE s.status = 'approved'
       ORDER BY s.platform = 'twitch' DESC, s.created_at ASC`,
      []
    );
  } catch (e) {
    console.error("[streams] approvedStreamers:", e);
    return [];
  }
}

export async function myStreamers(uid: number): Promise<StreamerRow[]> {
  try {
    return await query<StreamerRow>(
      `SELECT * FROM web_streamers WHERE user_id = ? ORDER BY created_at ASC`,
      [uid]
    );
  } catch (e) {
    console.error("[streams] myStreamers:", e);
    return [];
  }
}

export async function addStreamer(
  uid: number,
  platform: Platform,
  channel: string,
  url: string
): Promise<void> {
  await execute(
    `INSERT INTO web_streamers (user_id, platform, channel, url) VALUES (?, ?, ?, ?)`,
    [uid, platform, channel, url]
  );
}

export async function removeStreamer(uid: number, id: number): Promise<number> {
  const res = await execute(
    `DELETE FROM web_streamers WHERE id = ? AND user_id = ?`,
    [id, uid]
  );
  return res.affectedRows;
}

export async function countStreamers(uid: number): Promise<number> {
  const rows = await query<{ n: number }>(
    `SELECT COUNT(*) AS n FROM web_streamers WHERE user_id = ?`,
    [uid]
  );
  return Number(rows[0]?.n ?? 0);
}

/** Twitch ao vivo? decapi devolve "<channel> is offline" quando offline. */
export async function twitchIsLive(channel: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://decapi.me/twitch/uptime/${encodeURIComponent(channel)}`,
      { next: { revalidate: 120 } }
    );
    if (!res.ok) return false;
    const text = (await res.text()).trim().toLowerCase();
    return text.length > 0 && !text.includes("offline") && !text.includes("error");
  } catch {
    return false;
  }
}
