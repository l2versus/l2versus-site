"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import {
  addStreamer,
  removeStreamer,
  countStreamers,
  isPlatform,
  type Platform,
} from "@/lib/repos/streams";

export type StreamActionState = { error?: string; ok?: boolean; message?: string };

const CHANNEL_RE = /^@?[A-Za-z0-9_.\-]{2,60}$/;
const MAX_CHANNELS = 3;

/** Monta o link público do canal a partir da plataforma + handle. */
function channelUrl(platform: Platform, channel: string): string {
  const ch = channel.replace(/^@/, "");
  switch (platform) {
    case "twitch":
      return `https://twitch.tv/${ch}`;
    case "kick":
      return `https://kick.com/${ch}`;
    case "trovo":
      return `https://trovo.live/s/${ch}`;
    case "youtube":
      return channel.startsWith("UC")
        ? `https://youtube.com/channel/${channel}`
        : `https://youtube.com/@${ch}`;
  }
}

export async function addStreamerAction(
  _prev: StreamActionState,
  formData: FormData
): Promise<StreamActionState> {
  const s = await getSession();
  if (!s) return { error: "Sessão expirada. Faça login novamente." };

  const platform = String(formData.get("platform") ?? "");
  const channel = String(formData.get("channel") ?? "").trim();

  if (!isPlatform(platform)) return { error: "Plataforma inválida." };
  if (!CHANNEL_RE.test(channel))
    return { error: "Canal inválido: use só letras, números, _ . - (2–60 caracteres)." };

  try {
    if ((await countStreamers(s.uid)) >= MAX_CHANNELS)
      return { error: `Limite de ${MAX_CHANNELS} canais atingido.` };
    await addStreamer(s.uid, platform, channel, channelUrl(platform, channel));
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Duplicate")) return { error: "Este canal já está conectado." };
    console.error("addStreamerAction", e);
    return { error: "Erro no servidor. Tente novamente." };
  }

  revalidatePath("/streams");
  revalidatePath("/streams/connect");
  return { ok: true, message: `Canal "${channel}" conectado — já aparece na página Streams.` };
}

export async function removeStreamerAction(
  _prev: StreamActionState,
  formData: FormData
): Promise<StreamActionState> {
  const s = await getSession();
  if (!s) return { error: "Sessão expirada. Faça login novamente." };

  const id = Number(formData.get("id") ?? 0);
  if (!id) return { error: "Canal inválido." };

  try {
    const n = await removeStreamer(s.uid, id);
    if (n === 0) return { error: "Canal não encontrado ou não pertence a você." };
  } catch (e) {
    console.error("removeStreamerAction", e);
    return { error: "Erro no servidor. Tente novamente." };
  }

  revalidatePath("/streams");
  revalidatePath("/streams/connect");
  return { ok: true, message: "Canal removido." };
}
