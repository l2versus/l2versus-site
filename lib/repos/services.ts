import "server-only";
import { query, queryOne, execute } from "@/lib/db";

/**
 * Serviços aplicados direto no personagem da rev (tabela `characters`).
 * REGRAS DE SEGURANÇA:
 *  - Só age em personagem que pertence a uma conta de jogo do web_user (escopo).
 *  - Só age com o personagem OFFLINE (online = 0), senão o servidor sobrescreve
 *    ao deslogar e pode corromper estado.
 */

/** Coordenada de "cidade segura" para Unstuck — Giran (C6/Interlude). */
const GIRAN = { x: 83400, y: 147943, z: -3404 };

export type OwnedChar = {
  obj_Id: number;
  char_name: string;
  online: number;
  sex: number;
  karma: number;
  account_name: string;
};

/** Personagens (não deletados) de todas as contas do web_user — p/ dropdowns de serviço. */
export function ownedChars(uid: number): Promise<OwnedChar[]> {
  return query<OwnedChar>(
    `SELECT c.obj_Id, c.char_name, c.online, c.sex, c.karma, c.account_name
       FROM characters c
       JOIN accounts a ON a.login COLLATE utf8mb4_general_ci = c.account_name
      WHERE a.site_user_id = ? AND (c.deletetime = 0 OR c.deletetime IS NULL)
      ORDER BY c.level DESC`,
    [uid]
  );
}

/** Busca um personagem SE pertencer ao web_user; senão null. */
export async function ownedCharByObjId(
  uid: number,
  objId: number
): Promise<OwnedChar | null> {
  return queryOne<OwnedChar>(
    `SELECT c.obj_Id, c.char_name, c.online, c.sex, c.karma, c.account_name
       FROM characters c
       JOIN accounts a ON a.login COLLATE utf8mb4_general_ci = c.account_name
      WHERE a.site_user_id = ? AND c.obj_Id = ?
        AND (c.deletetime = 0 OR c.deletetime IS NULL)
      LIMIT 1`,
    [uid, objId]
  );
}

async function logService(
  uid: number,
  ch: OwnedChar,
  service: string,
  cost: number
): Promise<void> {
  await execute(
    "INSERT INTO web_service_log (user_id, char_obj_id, char_name, service, cost) VALUES (?, ?, ?, ?, ?)",
    [uid, ch.obj_Id, ch.char_name, service, cost]
  );
}

/** Teleporta o personagem (offline) para Giran. */
export async function unstuck(uid: number, ch: OwnedChar, cost = 0) {
  await execute(
    "UPDATE characters SET x = ?, y = ?, z = ? WHERE obj_Id = ? AND online = 0",
    [GIRAN.x, GIRAN.y, GIRAN.z, ch.obj_Id]
  );
  await logService(uid, ch, "unstuck", cost);
}

/** Zera a karma (e PK kills) do personagem offline. */
export async function clearKarma(uid: number, ch: OwnedChar, cost = 0) {
  await execute(
    "UPDATE characters SET karma = 0, pkkills = 0 WHERE obj_Id = ? AND online = 0",
    [ch.obj_Id]
  );
  await logService(uid, ch, "clear_karma", cost);
}

/** Alterna o sexo do personagem offline (0<->1). */
export async function changeGender(uid: number, ch: OwnedChar, cost = 0) {
  await execute(
    "UPDATE characters SET sex = 1 - sex WHERE obj_Id = ? AND online = 0",
    [ch.obj_Id]
  );
  await logService(uid, ch, "change_gender", cost);
}
