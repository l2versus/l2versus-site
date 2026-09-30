"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE } from "./server";
import { LOCALES, type Locale } from "./dict";

/** Troca o idioma (cookie). O client chama e dá router.refresh(). */
export async function setLocaleAction(locale: string): Promise<void> {
  const ok = LOCALES.some((l) => l.code === locale);
  const value: Locale = ok ? (locale as Locale) : "pt";
  const jar = await cookies();
  jar.set(LOCALE_COOKIE, value, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
