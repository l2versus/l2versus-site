import "server-only";
import { query } from "@/lib/db";

/**
 * Estado dos castelos de Aden lido direto da rev (l2versus, MariaDB).
 *
 * A tabela `castle` guarda id/taxa/tesouro/data de cerco; o dono é o clã cujo
 * `clan_data.hasCastle` aponta para o id do castelo. Os nomes dos 9 castelos
 * são fixos (Aden padrão) e mapeados aqui no código.
 *
 * Tolerante a falha: se a conexão cair, devolve [] (a página renderiza o
 * estado vazio) e o erro sai em console.error.
 */

/** Nomes fixos dos 9 castelos de Aden (id -> nome). */
const CASTLE_NAMES: Record<number, string> = {
  1: "Gludio",
  2: "Dion",
  3: "Giran",
  4: "Oren",
  5: "Aden",
  6: "Innadril",
  7: "Goddard",
  8: "Rune",
  9: "Schuttgart",
};

export type CastleStatus = {
  id: number;
  name: string;
  owner: string | null;
  tax: number;
  /** Timestamp do próximo cerco em milissegundos (0 = não agendado). */
  siegeDate: number;
};

type CastleRow = {
  id: number;
  currentTaxPercent: number;
  siegeDate: number | string | null;
};

export async function castleStatus(): Promise<CastleStatus[]> {
  try {
    const rows = await query<CastleRow>(
      `SELECT c.id, c.currentTaxPercent, c.siegeDate,
              (SELECT cd.clan_name FROM clan_data cd WHERE cd.hasCastle = c.id LIMIT 1) AS owner
         FROM castle c
        ORDER BY c.id ASC`
    );

    return rows.map((r) => {
      const row = r as CastleRow & { owner: string | null };
      return {
        id: Number(row.id),
        name: CASTLE_NAMES[Number(row.id)] ?? `Castelo #${row.id}`,
        owner: row.owner ?? null,
        tax: Number(row.currentTaxPercent ?? 0),
        siegeDate: Number(row.siegeDate ?? 0),
      };
    });
  } catch (e) {
    console.error("[castles] query falhou:", e);
    return [];
  }
}
