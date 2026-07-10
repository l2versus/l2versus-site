import "server-only";
import { cookies } from "next/headers";
import { dict, LOCALES, type Locale } from "./dict";

export const LOCALE_COOKIE = "vs_locale";

/** Locale atual a partir do cookie (padrão pt). */
export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const v = jar.get(LOCALE_COOKIE)?.value as Locale | undefined;
  return v && LOCALES.some((l) => l.code === v) ? v : "pt";
}

/** Tradutor server-side: getT() -> t("nav.profile"). Faz fallback pt -> chave. */
export async function getT(): Promise<(key: string) => string> {
  const locale = await getLocale();
  const table = dict[locale];
  return (key: string) => table[key] ?? dict.pt[key] ?? key;
}
