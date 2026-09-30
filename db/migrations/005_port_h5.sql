-- ============================================================
-- 005 — Port do site para o L2J Mobius CT 2.6 High Five.
--
-- Contexto: o site nasceu contra uma rev L2jOne C6 Interlude (schema
-- `l2versus`). O servidor de verdade é o Mobius High Five (`l2jversush5`).
-- As tabelas de jogo do H5 já existem e NÃO são tocadas aqui — só criamos
-- o que é do site e a única coluna que o site precisa enxertar em `accounts`.
--
-- Rode contra o banco NOVO:
--   mysql -u root -p l2jversush5 < db/migrations/005_port_h5.sql
--
-- As migrations 001..004 devem rodar ANTES desta (elas criam web_users,
-- web_transactions, web_deliveries, web_service_log, rmt_* e web_streamers).
-- Todas são idempotentes (CREATE TABLE IF NOT EXISTS), então reaplicar é seguro.
-- ============================================================

-- ------------------------------------------------------------
-- 1) O elo entre conta de site e conta de jogo.
--
-- Um web_user possui N contas de jogo. No Interlude essa coluna havia sido
-- enxertada direto em `accounts`; refazemos o mesmo no H5 porque o site faz
-- JOIN entre `accounts` e `web_users` em quase toda tela do painel, e um
-- schema separado obrigaria JOIN cross-schema sem ganho nenhum.
--
-- NULL = conta de jogo ainda não reivindicada por nenhum usuário do site.
-- ------------------------------------------------------------
ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS site_user_id INT UNSIGNED DEFAULT NULL;

ALTER TABLE accounts
  ADD INDEX IF NOT EXISTS idx_site_user (site_user_id);

-- Nota deliberada: NÃO criamos `phone`. Ela existia no schema Interlude mas
-- nenhuma linha do código a referencia — coluna morta não se replica.
--
-- Nota deliberada 2: NÃO criamos FOREIGN KEY de accounts.site_user_id para
-- web_users(id). O GameServer faz DELETE/INSERT em `accounts` sem saber que o
-- site existe; uma FK aqui transformaria operação normal do servidor em erro.
-- A integridade é garantida no código do site (todo WHERE é escopado por uid).
