import "server-only";
import { query, queryOne, execute } from "@/lib/db";
import type { ResultSetHeader } from "mysql2/promise";

/**
 * Repositório das CONTAS DE JOGO (tabela `accounts`) e seus personagens
 * (tabela `characters`). Um web_user possui várias contas de jogo
 * (accounts.site_user_id = web_users.id); cada conta possui vários personagens
 * (characters.account_name = accounts.login).
 */

export type GameAccount = {
  login: string;
  email: string;
  /** timestamp em ms (bigint). 0 = nunca logou. */
  last_active: number;
  access_level: number;
  last_server: number;
};

export type GameCharacter = {
  obj_Id: number;
  char_name: string;
  level: number;
  classid: number;
  /** 0=Humano, 1=Elfo, 2=Dark Elf, 3=Orc, 4=Anão */
  race: number;
  clanid: number;
  clan_name: string | null;
  /** 0 offline, 1 online */
  online: number;
  /** tempo online em segundos */
  onlinetime: number;
  pvpkills: number;
  pkkills: number;
};

/** Resumo do perfil do web_user (topo do painel). */
export type Profile = {
  balance: number;
  /** data de criação da conta do site */
  created_at: Date | string | null;
  referral_code: string | null;
  /** quantos usuários se cadastraram com o meu código */
  referred_count: number;
};

/** Saldo de VSCOIN do web_user. */
export async function getBalance(uid: number): Promise<number> {
  const row = await queryOne<{ balance: number }>(
    "SELECT balance FROM web_users WHERE id = ?",
    [uid]
  );
  return Number(row?.balance ?? 0);
}

/** Perfil consolidado: saldo, data de registro e indicações. */
export async function getProfile(uid: number): Promise<Profile> {
  const row = await queryOne<{
    balance: number;
    created_at: Date | string | null;
    referral_code: string | null;
    referred_count: number;
  }>(
    `SELECT u.balance, u.created_at, u.referral_code,
            (SELECT COUNT(*) FROM web_users r WHERE r.referred_by = u.id) AS referred_count
       FROM web_users u WHERE u.id = ?`,
    [uid]
  );
  return {
    balance: Number(row?.balance ?? 0),
    created_at: row?.created_at ?? null,
    referral_code: row?.referral_code ?? null,
    referred_count: Number(row?.referred_count ?? 0),
  };
}

/** Lista as contas de jogo pertencentes a um web_user. */
export async function listGameAccounts(uid: number): Promise<GameAccount[]> {
  return query<GameAccount>(
    "SELECT login, email, last_active, access_level, last_server FROM accounts WHERE site_user_id = ? ORDER BY login",
    [uid]
  );
}

/** Personagens (não deletados) de uma conta de jogo, do maior nível ao menor. */
export async function charactersFor(login: string): Promise<GameCharacter[]> {
  return query<GameCharacter>(
    `SELECT c.obj_Id, c.char_name, c.level, c.classid, c.race, c.clanid,
            c.online, c.onlinetime, c.pvpkills, c.pkkills,
            cd.clan_name
       FROM characters c
       LEFT JOIN clan_data cd ON cd.clan_id = c.clanid
      WHERE c.account_name = ? AND (c.deletetime = 0 OR c.deletetime IS NULL)
      ORDER BY c.level DESC`,
    [login]
  );
}

/** Verifica se um login de jogo já existe (globalmente). */
export async function gameAccountExists(login: string): Promise<boolean> {
  const row = await queryOne<{ x: number }>(
    "SELECT 1 AS x FROM accounts WHERE login = ? LIMIT 1",
    [login]
  );
  return row !== null;
}

/** Dados mínimos de uma conta de jogo para o fluxo de "vincular conta existente". */
export async function getAccountForClaim(
  login: string
): Promise<{ login: string; password: string; site_user_id: number | null } | null> {
  return queryOne<{ login: string; password: string; site_user_id: number | null }>(
    "SELECT login, password, site_user_id FROM accounts WHERE login = ? LIMIT 1",
    [login]
  );
}

/** Vincula (claim) uma conta de jogo existente e ainda não-reivindicada ao web_user. */
export async function linkAccountToUser(
  login: string,
  uid: number
): Promise<ResultSetHeader> {
  return execute(
    "UPDATE accounts SET site_user_id = ? WHERE login = ? AND (site_user_id IS NULL OR site_user_id = 0)",
    [uid, login]
  );
}

/** Quantas contas de jogo o web_user já possui. */
export async function countGameAccounts(uid: number): Promise<number> {
  const row = await queryOne<{ n: number }>(
    "SELECT COUNT(*) AS n FROM accounts WHERE site_user_id = ?",
    [uid]
  );
  return Number(row?.n ?? 0);
}

/** Cria uma conta de jogo vinculada ao web_user. */
export async function createGameAccount({
  uid,
  login,
  passwordHash,
}: {
  uid: number;
  login: string;
  passwordHash: string;
}): Promise<ResultSetHeader> {
  return execute(
    "INSERT INTO accounts (login, password, email, site_user_id, access_level, last_active, last_server) VALUES (?, ?, '', ?, 0, 0, 1)",
    [login, passwordHash, uid]
  );
}

/**
 * Troca a senha de uma conta de jogo. Escopo por `uid` garante que o usuário
 * só altere contas que lhe pertencem (affectedRows = 0 caso contrário).
 */
export async function updateGamePassword(
  login: string,
  passwordHash: string,
  uid: number
): Promise<ResultSetHeader> {
  return execute(
    "UPDATE accounts SET password = ? WHERE login = ? AND site_user_id = ?",
    [passwordHash, login, uid]
  );
}
