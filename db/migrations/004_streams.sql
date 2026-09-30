-- Streamers do site: cada web_user pode conectar canais (Twitch/YouTube/Kick/Trovo).
-- Página pública /streams lista os aprovados; auto-aprovado por padrão (admin pode rejeitar depois).
CREATE TABLE IF NOT EXISTS web_streamers (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED NOT NULL,
  platform    ENUM('twitch','youtube','kick','trovo') NOT NULL,
  channel     VARCHAR(100) NOT NULL,  -- handle/login do canal (ex.: gaules) ou channel ID do YouTube (UC...)
  url         VARCHAR(255) NOT NULL,  -- link completo do canal
  status      ENUM('pending','approved','rejected') NOT NULL DEFAULT 'approved',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_channel (user_id, platform, channel),
  KEY idx_status (status),
  CONSTRAINT fk_streamer_user FOREIGN KEY (user_id) REFERENCES web_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
