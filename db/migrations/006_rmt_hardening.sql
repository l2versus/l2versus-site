-- ============================================================
--  RMT Market — endurecimento antes do dinheiro real.
--
--  Esta migração fecha as falhas que a auditoria de 2026-10-07 achou. Nenhuma
--  delas pode acontecer HOJE, porque nada cobra ninguém — e é exatamente por
--  isso que ela vem AGORA: cada uma abre no dia em que o gateway entrar, e o
--  desenho do gateway depende destas colunas existirem.
--
--  Tudo é idempotente (IF NOT EXISTS). Rodar duas vezes não quebra nada.
--  O espelho para instalação nova do servidor vive em
--  L2J_Mobius_CT_2.6_HighFive/dist/db_installer/sql/game/rmt_market.sql.
--
--  MariaDB 11.x. `ADD COLUMN IF NOT EXISTS` é extensão do MariaDB e já é usada
--  na 005_port_h5.sql — não portar isto para MySQL sem reescrever.
-- ============================================================


-- ------------------------------------------------------------
-- 1. RESERVA — a janela entre "pagou" e "liquidou"
--
--  O PROBLEMA: o pagamento acontece ANTES do settleSale. Com gateway real a
--  sequência é: comprador clica -> vai ao provedor e paga (minutos) -> webhook
--  confirma -> settleSale. Durante esses minutos o anúncio continua 'active',
--  então o vendedor PODE cancelar. O settleSale então falha e o comprador já
--  pagou: estorno, suporte, e um vendedor que nem soube que quase vendeu.
--
--  A SOLUÇÃO: um estado 'reserved' entre 'active' e a venda. E há uma
--  elegância aqui — os DOIS caminhos de cancelamento (site e jogo) já filtram
--  por lista branca `status IN ('active','pending_escrow')`, então criar o
--  estado novo bloqueia os dois SEM tocar em uma linha daquele código.
--
--  'refunded' entra junto porque estorno precisa de um estado próprio: um
--  anúncio estornado não é 'cancelled' (nunca houve dinheiro) nem 'delivered'.
-- ------------------------------------------------------------

ALTER TABLE `rmt_listings`
  MODIFY COLUMN `status` ENUM(
    'pending_escrow',  -- anúncio criado, item ainda não saiu do inventário
    'active',          -- na vitrine, item em custódia
    'reserved',        -- comprador no checkout: CONGELADO, ninguém cancela
    'sold',            -- pago, aguardando entrega
    'delivering',      -- op de entrega enfileirada
    'delivered',       -- item recolhido pelo comprador
    'cancelled',       -- vendedor desistiu, item volta
    'refunded'         -- pago e desfeito: comprador estornado
  ) NOT NULL DEFAULT 'pending_escrow';

ALTER TABLE `rmt_listings`
  -- Quem segurou. É o user do SITE, não o personagem: quem paga é a conta.
  ADD COLUMN IF NOT EXISTS `reserved_by` INT UNSIGNED DEFAULT NULL,
  -- Quando a reserva morre sozinha. Sem isto um checkout abandonado tranca o
  -- item para sempre e o vendedor fica refém de um comprador que sumiu.
  ADD COLUMN IF NOT EXISTS `reserved_until` TIMESTAMP NULL DEFAULT NULL,
  -- O id da sessão de checkout do provedor. É o que amarra o webhook que chega
  -- depois a ESTE anúncio, sem confiar no que o cliente mandar de volta.
  ADD COLUMN IF NOT EXISTS `reserve_token` VARCHAR(64) DEFAULT NULL,
  -- Marca que o GameServer já avisou o vendedor em jogo. A tarefa periódica
  -- varre `status='reserved' AND notified_at IS NULL`, então o aviso sai uma
  -- vez só por reserva, mesmo que o vendedor relogue.
  ADD COLUMN IF NOT EXISTS `notified_at` TIMESTAMP NULL DEFAULT NULL;

-- A varredura de reservas vencidas roda a cada minuto; sem este índice ela é
-- um full scan na tabela que mais cresce do sistema.
ALTER TABLE `rmt_listings`
  ADD INDEX IF NOT EXISTS `idx_reserva` (`status`, `reserved_until`);

-- A tarefa de aviso em jogo procura exatamente por esta combinação.
ALTER TABLE `rmt_listings`
  ADD INDEX IF NOT EXISTS `idx_avisar` (`status`, `notified_at`);


-- ------------------------------------------------------------
-- 2. ENTREGA POR CONTA — e não por personagem
--
--  O PROBLEMA: settleSale grava `buyer_char_obj_id`. Se o comprador apagar
--  esse personagem antes de recolher, a op aponta para um charId que não
--  existe mais e o item fica PRESO NA CUSTÓDIA PARA SEMPRE — o faxineiro de
--  boot não o apaga (owner_id = -1 é isento) e nenhuma tela o mostra. Vale
--  igual para a devolução ao vendedor.
--
--  A SOLUÇÃO: a op passa a carregar o DONO (user do site). O personagem que
--  recebe é escolhido na hora de recolher, em jogo, entre os que a conta tem
--  vivos. Resolve personagem deletado e de quebra atende quem anunciou com um
--  char e quer receber em outro.
--
--  `to_char_obj_id` continua existindo e vira uma PREFERÊNCIA (o personagem
--  sugerido), não um requisito — por isso nada do que já existe quebra.
-- ------------------------------------------------------------

ALTER TABLE `rmt_item_ops`
  ADD COLUMN IF NOT EXISTS `to_user_id` INT UNSIGNED DEFAULT NULL;

ALTER TABLE `rmt_item_ops`
  ADD INDEX IF NOT EXISTS `idx_to_user` (`to_user_id`, `status`);


-- ------------------------------------------------------------
-- 3. CARÊNCIA NA CARTEIRA — o vendedor não saca dinheiro que pode voltar
--
--  O PROBLEMA: settleSale credita `balance_cents`, que é sacável na hora. Com
--  pagamento real o chargeback chega DIAS depois. Se o vendedor já sacou, o
--  prejuízo é da casa.
--
--  Ironia do schema atual: `pending_cents` existe e hoje é usado AO CONTRÁRIO
--  — o saque move balance -> pending ("saque em processamento"). Então não dá
--  para reaproveitar aquela coluna sem misturar dois conceitos.
--
--  A SOLUÇÃO: coluna `held_cents` para venda em carência, e uma tabela de
--  travas com data de liberação POR VENDA. A data vive na linha e não numa
--  constante: mudar a política de carência amanhã não pode reescrever o
--  passado de ninguém.
-- ------------------------------------------------------------

ALTER TABLE `rmt_wallet`
  ADD COLUMN IF NOT EXISTS `held_cents` INT UNSIGNED NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS `rmt_wallet_holds` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`       INT UNSIGNED    NOT NULL,
  `listing_id`    BIGINT UNSIGNED NOT NULL,
  `amount_cents`  INT UNSIGNED    NOT NULL,
  `available_at`  TIMESTAMP       NOT NULL,          -- quando vira sacável
  `released_at`   TIMESTAMP       NULL DEFAULT NULL, -- quando virou, de fato
  `reversed_at`   TIMESTAMP       NULL DEFAULT NULL, -- estorno: nunca libera
  `created_at`    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  -- Uma trava por venda. É o que torna a liberação idempotente: rodar o
  -- liberador duas vezes não credita duas vezes.
  UNIQUE KEY `uk_listing` (`listing_id`),
  KEY `idx_liberar` (`released_at`, `available_at`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ------------------------------------------------------------
-- 4. RAZÃO DA CASA — os 12%, gravados
--
--  O PROBLEMA: a comissão nunca é gravada. Dá para derivar com SUM() sobre
--  rmt_listings, mas derivada não serve para dividir resultado entre sócios:
--  um estorno, uma taxa diferente no passado, um anúncio editado, e a conta
--  de ontem muda sozinha.
--
--  A SOLUÇÃO: uma linha imutável no instante da venda, com a taxa daquele
--  momento. UNIQUE em listing_id é o que impede o webhook reentrante de
--  lançar duas vezes.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `rmt_house_ledger` (
  `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `listing_id`        BIGINT UNSIGNED NOT NULL,
  `seller_uid`        INT UNSIGNED    NOT NULL,
  `buyer_uid`         INT UNSIGNED    NOT NULL,
  `gross_cents`       INT UNSIGNED    NOT NULL,       -- o que o comprador pagou
  `commission_pct`    TINYINT UNSIGNED NOT NULL,      -- a taxa DAQUELE momento
  `house_cents`       INT UNSIGNED    NOT NULL,       -- a nossa fatia
  `seller_net_cents`  INT UNSIGNED    NOT NULL,       -- o que foi para o vendedor
  `provider`          VARCHAR(30)     DEFAULT NULL,   -- stripe/paypal/cripto
  `provider_ref`      VARCHAR(190)    DEFAULT NULL,   -- id da cobrança no provedor
  `reversed_at`       TIMESTAMP       NULL DEFAULT NULL, -- estorno
  `created_at`        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_listing` (`listing_id`),
  KEY `idx_data` (`created_at`),
  KEY `idx_seller` (`seller_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ------------------------------------------------------------
-- 5. EVENTOS DE PAGAMENTO — idempotência do webhook
--
--  O PROBLEMA: todo gateway REENVIA webhook (timeout, deploy no meio, retry
--  automático). Sem chave de idempotência, o mesmo pagamento credita o
--  vendedor duas vezes e lança a comissão duas vezes.
--
--  A SOLUÇÃO: gravar o id do evento do provedor com UNIQUE antes de agir. Se o
--  INSERT falhar por duplicidade, o evento já foi processado e a chamada
--  retorna sucesso sem fazer nada — que é o que o provedor espera ver.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `rmt_payment_events` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `provider`     VARCHAR(30)     NOT NULL,
  `event_id`     VARCHAR(190)    NOT NULL,          -- id do evento NO PROVEDOR
  `kind`         VARCHAR(60)     NOT NULL,          -- paid/failed/refunded/...
  `listing_id`   BIGINT UNSIGNED DEFAULT NULL,
  `amount_cents` INT UNSIGNED    DEFAULT NULL,
  `payload`      TEXT            DEFAULT NULL,      -- o corpo cru, para auditoria
  `received_at`  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `processed_at` TIMESTAMP       NULL DEFAULT NULL,
  `error`        VARCHAR(255)    DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_evento` (`provider`, `event_id`),
  KEY `idx_listing` (`listing_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ------------------------------------------------------------
-- 6. TRILHA DE AUDITORIA — quem fez o quê, quando
--
--  Dinheiro sem trilha não se audita. Cada transição de estado de anúncio e
--  cada movimento de carteira deixa uma linha aqui, incluindo o que foi feito
--  por GM/admin. É append-only por convenção: nada no código dá UPDATE ou
--  DELETE nesta tabela.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `rmt_audit` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `at`         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actor`      VARCHAR(60)     NOT NULL,          -- 'game:<charName>' | 'site:<uid>' | 'system' | 'admin:<uid>'
  `action`     VARCHAR(40)     NOT NULL,          -- listed/reserved/paid/delivered/cancelled/refunded/released/payout
  `listing_id` BIGINT UNSIGNED DEFAULT NULL,
  `user_id`    INT UNSIGNED    DEFAULT NULL,
  `cents`      INT             DEFAULT NULL,      -- assinado: débito é negativo
  `detail`     VARCHAR(255)    DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_listing` (`listing_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_at` (`at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
