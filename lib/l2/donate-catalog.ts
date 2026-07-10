/**
 * CATÁLOGO AUTORITATIVO da Donate Shop (preços em VSCOIN ≡ Donate Coin).
 *
 * Esta é a ÚNICA fonte da verdade de itens/preços. Tanto a página (exibição)
 * quanto a Server Action (cobrança) importam daqui. A action NUNCA confia no
 * preço enviado pelo client — ela re-deriva o preço a partir deste módulo via
 * `donateItemById()`.
 *
 * Preços extraídos de docs/server-economy.md ("Donate Shop").
 */

export type DonateCategory =
  | "vip"
  | "vote"
  | "enchant_armor"
  | "enchant_weapon"
  | "rune_xp"
  | "rune_pve"
  | "life_stone"
  | "soulstone"
  | "hot_springs"
  | "utility"
  | "reward";

export type DonateItem = {
  /** id estável e único — usado como chave no client e validado no server. */
  id: string;
  category: DonateCategory;
  name: string;
  /** preço em VSCOIN (Donate Coin). */
  price: number;
  note?: string;
};

/** Metadados de cada categoria (rótulo + ordem de exibição). */
export const DONATE_CATEGORIES: {
  key: DonateCategory;
  label: string;
  blurb?: string;
}[] = [
  { key: "vip", label: "VIP", blurb: "+20% XP/SP/Adena e buffs exclusivos VIP." },
  { key: "vote", label: "Vote Status", blurb: "+20% XP/SP/Adena por 7 dias." },
  {
    key: "enchant_armor",
    label: "Enchant Assist — Armadura",
    blurb: "Garante o próximo encantamento da armadura por grade.",
  },
  {
    key: "enchant_weapon",
    label: "Enchant Assist — Arma",
    blurb: "Garante o próximo encantamento da arma por grade.",
  },
  { key: "rune_xp", label: "Runa XP/SP/Adena 20%", blurb: "Bônus de +20% por tempo." },
  { key: "rune_pve", label: "Runa PVE 10%", blurb: "+10% de dano contra monstros." },
  {
    key: "life_stone",
    label: "Life Stone Box",
    blurb: "Caixas de Life Stone High/Top Grade.",
  },
  {
    key: "soulstone",
    label: "Soulstones",
    blurb: "Pedras para Special Ability (SA) por grade.",
  },
  {
    key: "hot_springs",
    label: "Doenças Hot Springs",
    blurb: "Buffs reformulados de Hot Springs (permanentes até morte).",
  },
  { key: "utility", label: "Utilidades", blurb: "Montarias, pets e liberações." },
  { key: "reward", label: "Reward Box", blurb: "Caixa de loot aleatório premium." },
];

/**
 * Catálogo completo (lista plana). Agrupar por `category` no client usando a
 * ordem de DONATE_CATEGORIES.
 */
export const DONATE_CATALOG: DonateItem[] = [
  // ---------------------------------------------------------------- VIP
  { id: "vip_1d", category: "vip", name: "VIP — 1 dia", price: 20 },
  { id: "vip_2d", category: "vip", name: "VIP — 2 dias", price: 30 },
  { id: "vip_7d", category: "vip", name: "VIP — 7 dias", price: 100 },
  { id: "vip_15d", category: "vip", name: "VIP — 15 dias", price: 150 },
  { id: "vip_30d", category: "vip", name: "VIP — 30 dias", price: 250 },

  // ---------------------------------------------------------------- Vote
  {
    id: "vote_status",
    category: "vote",
    name: "Vote Status — 7 dias",
    price: 50,
    note: "Grátis por 24h assistindo vídeo verificado (TikTok/YT).",
  },

  // -------------------------------------------------- Enchant Assist Armadura
  { id: "ench_armor_d", category: "enchant_armor", name: "Enchant Assist Armadura — Grade D", price: 5 },
  { id: "ench_armor_c", category: "enchant_armor", name: "Enchant Assist Armadura — Grade C", price: 10 },
  { id: "ench_armor_b", category: "enchant_armor", name: "Enchant Assist Armadura — Grade B", price: 15 },
  { id: "ench_armor_a", category: "enchant_armor", name: "Enchant Assist Armadura — Grade A", price: 20 },
  { id: "ench_armor_s", category: "enchant_armor", name: "Enchant Assist Armadura — Grade S", price: 25 },

  // ----------------------------------------------------- Enchant Assist Arma
  { id: "ench_weapon_d", category: "enchant_weapon", name: "Enchant Assist Arma — Grade D", price: 10 },
  { id: "ench_weapon_c", category: "enchant_weapon", name: "Enchant Assist Arma — Grade C", price: 15 },
  { id: "ench_weapon_b", category: "enchant_weapon", name: "Enchant Assist Arma — Grade B", price: 20 },
  { id: "ench_weapon_a", category: "enchant_weapon", name: "Enchant Assist Arma — Grade A", price: 25 },
  { id: "ench_weapon_s", category: "enchant_weapon", name: "Enchant Assist Arma — Grade S", price: 30 },

  // ----------------------------------------------- Runa XP/SP/Adena 20%
  { id: "rune_xp_1h", category: "rune_xp", name: "Runa XP 20% — 1 hora", price: 10 },
  { id: "rune_xp_2h", category: "rune_xp", name: "Runa XP 20% — 2 horas", price: 15 },
  { id: "rune_xp_4h", category: "rune_xp", name: "Runa XP 20% — 4 horas", price: 25 },

  // ------------------------------------------------------------ Runa PVE 10%
  { id: "rune_pve_1h", category: "rune_pve", name: "Runa PVE 10% — 1 hora", price: 10 },
  { id: "rune_pve_2h", category: "rune_pve", name: "Runa PVE 10% — 2 horas", price: 15 },
  { id: "rune_pve_4h", category: "rune_pve", name: "Runa PVE 10% — 4 horas", price: 25 },

  // ----------------------------------------------------------- Life Stone Box
  { id: "ls_high_15d", category: "life_stone", name: "Life Stone Box — High Grade (15 dias)", price: 60 },
  { id: "ls_top_15d", category: "life_stone", name: "Life Stone Box — Top Grade (15 dias)", price: 75 },
  { id: "ls_high_30d", category: "life_stone", name: "Life Stone Box — High Grade (30 dias)", price: 100 },
  { id: "ls_top_30d", category: "life_stone", name: "Life Stone Box — Top Grade (30 dias)", price: 120 },

  // ------------------------------------------------------------- Soulstones
  { id: "soul_b", category: "soulstone", name: "Soulstone — Grade B", price: 20 },
  { id: "soul_a", category: "soulstone", name: "Soulstone — Grade A", price: 50 },
  { id: "soul_s", category: "soulstone", name: "Soulstone — Grade S", price: 75 },
  { id: "soul_dynasty", category: "soulstone", name: "Soulstone — Dynasty", price: 100 },
  { id: "soul_icarus", category: "soulstone", name: "Soulstone — Icarus", price: 150 },
  { id: "soul_vesper", category: "soulstone", name: "Soulstone — Vesper", price: 250 },

  // ------------------------------------------------ Doenças Hot Springs
  { id: "hs_malaria", category: "hot_springs", name: "Malaria — Casting +16%", price: 600 },
  { id: "hs_cholera", category: "hot_springs", name: "Cholera — Accuracy +10", price: 600 },
  { id: "hs_rheumatism", category: "hot_springs", name: "Rheumatism — Crit +50", price: 600 },
  { id: "hs_flu", category: "hot_springs", name: "Flu — Atk Speed +16%", price: 600 },
  {
    id: "hs_all_in_one",
    category: "hot_springs",
    name: "ALL-IN-ONE (4 doenças)",
    price: 2000,
    note: "Malaria + Cholera + Rheumatism + Flu.",
  },

  // -------------------------------------------------------------- Utilidades
  {
    id: "mount_eternal",
    category: "utility",
    name: "Montaria Eterna",
    price: 25,
    note: "Speed máximo, sem expiração.",
  },
  {
    id: "penitent_manacle",
    category: "utility",
    name: "Penitent's Manacle (pet Sin Eater)",
    price: 25,
    note: "Remove PK ao caçar com o pet.",
  },
  {
    id: "subclass_release",
    category: "utility",
    name: "Liberação de Subclasse",
    price: 50,
    note: "Hallate / Golkonda / Kernon.",
  },

  // -------------------------------------------------------------- Reward Box
  {
    id: "reward_box",
    category: "reward",
    name: "Reward Box",
    price: 50,
    note: "Loot aleatório: runas, enchant assist, blessed S, life stones…",
  },
];

/** Índice id -> item para lookup O(1) no server (validação de compra). */
const BY_ID: ReadonlyMap<string, DonateItem> = new Map(
  DONATE_CATALOG.map((it) => [it.id, it])
);

/** Retorna o item do catálogo pelo id, ou undefined se o id for inválido. */
export function donateItemById(id: string): DonateItem | undefined {
  return BY_ID.get(id);
}
