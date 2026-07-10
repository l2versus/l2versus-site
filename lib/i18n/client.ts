import { dict, type Locale } from "./dict";

/** Tradutor para client components. Uso: const t = makeT(locale). */
export function makeT(locale: Locale): (key: string) => string {
  const table = dict[locale] ?? dict.pt;
  return (key: string) => table[key] ?? dict.pt[key] ?? key;
}
