-- Usuario do SITE (separado das contas de jogo em `accounts`).
-- 1 web_user -> N contas de jogo (accounts.site_user_id = web_users.id).
CREATE TABLE IF NOT EXISTS web_users (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email         VARCHAR(255) NOT NULL,
  username      VARCHAR(45)  NOT NULL,
  password      VARCHAR(72)  NOT NULL,           -- bcrypt ($2a$...)
  balance       INT UNSIGNED NOT NULL DEFAULT 0, -- saldo em VSCOIN
  referral_code VARCHAR(16)  DEFAULT NULL,
  referred_by   INT UNSIGNED DEFAULT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login    BIGINT       NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_email (email),
  UNIQUE KEY uq_username (username),
  UNIQUE KEY uq_referral (referral_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
