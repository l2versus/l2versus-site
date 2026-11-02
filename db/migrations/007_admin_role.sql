-- ============================================================
--  Papel de ADMIN no site.
--
--  Por que existe: até aqui a sessão do site carrega apenas `uid` — não há
--  nenhuma noção de "este usuário é sócio/administrador". O painel de RMT
--  (anúncios de todo mundo, carteiras, receita da casa, saques) não pode
--  existir sem isso, e inventar a regra no meio do código da página é como
--  nasce área de admin aberta.
--
--  Decisão: coluna no banco, e não lista em variável de ambiente. São cinco
--  sócios e a lista mudaria raramente — mas uma env é invisível na auditoria,
--  não diz QUEM concedeu, e se perde numa migração de servidor. A coluna
--  viaja com o banco, que é o que o Carlo leva para o KVM.
--
--  FALHA FECHADA: ninguém é admin por padrão. Com zero admins, o painel
--  recusa todo mundo — que é o estado certo para um banco recém-instalado.
-- ============================================================

ALTER TABLE `web_users`
  ADD COLUMN IF NOT EXISTS `is_admin` TINYINT(1) NOT NULL DEFAULT 0;

ALTER TABLE `web_users`
  ADD INDEX IF NOT EXISTS `idx_admin` (`is_admin`);

-- ------------------------------------------------------------
--  COMO CONCEDER O PRIMEIRO ADMIN (não dá para fazer pela interface, de
--  propósito — senão o primeiro cadastro do mundo viraria admin sozinho):
--
--      UPDATE web_users SET is_admin = 1 WHERE email = 'seu@email';
--
--  Conferir quem tem acesso:
--
--      SELECT id, email, is_admin FROM web_users WHERE is_admin = 1;
-- ------------------------------------------------------------
