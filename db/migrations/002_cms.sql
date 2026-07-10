-- ============================================================
-- CMS L2 Versus — tabelas de apoio do painel (cabinet).
-- Nada aqui altera as tabelas da rev; são tabelas próprias do site.
-- ============================================================

-- Histórico financeiro do site (recargas, gastos, bônus) -> Account History.
CREATE TABLE IF NOT EXISTS web_transactions (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED    NOT NULL,
  kind        ENUM('topup','spend','referral_bonus','transfer_in','transfer_out','service','pack','send_to_game') NOT NULL,
  amount      INT             NOT NULL,          -- + entra / - sai (VSCOIN)
  method      VARCHAR(40)     DEFAULT NULL,       -- pix/stripe/mercadopago/crypto/internal
  status      ENUM('pending','done','failed') NOT NULL DEFAULT 'done',
  description VARCHAR(255)    DEFAULT NULL,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user (user_id),
  KEY idx_kind (kind)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Fila de entrega no jogo (moedas/itens/pacotes). O servidor (ou rotina) consome
-- registros 'pending' e marca 'delivered'. Evita INSERT arriscado em `items`.
CREATE TABLE IF NOT EXISTS web_deliveries (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id      INT UNSIGNED    NOT NULL,
  char_obj_id  INT UNSIGNED    NOT NULL,
  char_name    VARCHAR(35)     NOT NULL,
  kind         ENUM('coins','pack','item') NOT NULL,
  item_id      INT             DEFAULT NULL,
  amount       INT             NOT NULL DEFAULT 1,
  payload      TEXT            DEFAULT NULL,       -- JSON p/ packs (lista de itens)
  status       ENUM('pending','delivered','failed') NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  delivered_at TIMESTAMP       NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_status (status),
  KEY idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Auditoria de serviços aplicados direto no personagem (gender/karma/unstuck).
CREATE TABLE IF NOT EXISTS web_service_log (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED    NOT NULL,
  char_obj_id INT UNSIGNED    NOT NULL,
  char_name   VARCHAR(35)     NOT NULL,
  service     VARCHAR(40)     NOT NULL,            -- clear_karma / change_gender / unstuck / transfer
  cost        INT             NOT NULL DEFAULT 0,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Idioma preferido (opcional; o cookie é a fonte primária).
ALTER TABLE web_users ADD COLUMN IF NOT EXISTS locale VARCHAR(5) NOT NULL DEFAULT 'pt';
