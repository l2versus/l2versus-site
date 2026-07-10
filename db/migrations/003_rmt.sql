-- ============================================================
-- RMT Market — marketplace P2P de itens por dinheiro real (USD).
-- Comissão da casa: 12%. Servidor hospedado na Europa.
-- SEGURANÇA: o site NUNCA muta a tabela `items` do servidor rodando.
-- Ele grava intenções em rmt_item_ops; um worker/NPC do servidor consome
-- (escrow/deliver/restore) com guarda de offline. Assim não corrompe obj_id.
-- ============================================================

-- Anúncios do mercado RMT.
CREATE TABLE IF NOT EXISTS rmt_listings (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  seller_uid         INT UNSIGNED    NOT NULL,
  seller_char_obj_id INT UNSIGNED    NOT NULL,
  seller_char_name   VARCHAR(35)     NOT NULL,
  item_object_id     INT UNSIGNED    NOT NULL,          -- instância do item no jogo (items.object_id)
  item_id            INT             NOT NULL,
  enchant            INT             NOT NULL DEFAULT 0,
  count              BIGINT          NOT NULL DEFAULT 1,
  price_cents        INT UNSIGNED    NOT NULL,          -- preço em centavos de USD
  commission_pct     TINYINT UNSIGNED NOT NULL DEFAULT 12,
  status             ENUM('pending_escrow','active','sold','delivering','delivered','cancelled') NOT NULL DEFAULT 'pending_escrow',
  buyer_uid          INT UNSIGNED    DEFAULT NULL,
  buyer_char_obj_id  INT UNSIGNED    DEFAULT NULL,
  created_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sold_at            TIMESTAMP       NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_status (status),
  KEY idx_seller (seller_uid),
  KEY idx_item (item_object_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Carteira USD do vendedor (ganhos após comissão).
CREATE TABLE IF NOT EXISTS rmt_wallet (
  user_id        INT UNSIGNED NOT NULL,
  balance_cents  INT UNSIGNED NOT NULL DEFAULT 0,       -- disponível para saque
  pending_cents  INT UNSIGNED NOT NULL DEFAULT 0,       -- em processamento
  lifetime_cents INT UNSIGNED NOT NULL DEFAULT 0,       -- total já ganho
  PRIMARY KEY (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Pedidos de saque (payout) — liquidação via provedor (seam: PayPal/Stripe/cripto).
CREATE TABLE IF NOT EXISTS rmt_payouts (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id      INT UNSIGNED    NOT NULL,
  amount_cents INT UNSIGNED    NOT NULL,
  method       VARCHAR(30)     NOT NULL,                -- paypal/stripe/crypto
  destination  VARCHAR(190)    NOT NULL,                -- email/wallet
  status       ENUM('requested','processing','paid','rejected') NOT NULL DEFAULT 'requested',
  created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP       NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_user (user_id),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Fila de operações de item que o servidor/NPC consome (escrow seguro).
CREATE TABLE IF NOT EXISTS rmt_item_ops (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  listing_id        BIGINT UNSIGNED NOT NULL,
  op                ENUM('escrow','deliver','restore') NOT NULL,
  item_object_id    INT UNSIGNED    NOT NULL,
  from_char_obj_id  INT UNSIGNED    DEFAULT NULL,
  to_char_obj_id    INT UNSIGNED    DEFAULT NULL,
  status            ENUM('pending','done','failed') NOT NULL DEFAULT 'pending',
  created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  done_at           TIMESTAMP       NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
