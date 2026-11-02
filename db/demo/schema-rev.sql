-- Schema das tabelas da REV usadas pelo site (gerado por
-- scripts/gerar-dump-demo.mjs a partir do MariaDB de desenvolvimento).
-- NÃO editar à mão: regenerar. Contém só estrutura, zero dado real.

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `accounts`;
CREATE TABLE `accounts` (
  `login` varchar(45) NOT NULL DEFAULT '',
  `password` varchar(45) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `created_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `lastactive` bigint(13) unsigned NOT NULL DEFAULT 0,
  `accessLevel` tinyint(4) NOT NULL DEFAULT 0,
  `lastIP` char(15) DEFAULT NULL,
  `lastServer` tinyint(4) DEFAULT 1,
  `pcIp` char(15) DEFAULT NULL,
  `hop1` char(15) DEFAULT NULL,
  `hop2` char(15) DEFAULT NULL,
  `hop3` char(15) DEFAULT NULL,
  `hop4` char(15) DEFAULT NULL,
  `site_user_id` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`login`),
  KEY `idx_site_user` (`site_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `characters`;
CREATE TABLE `characters` (
  `account_name` varchar(45) DEFAULT NULL,
  `charId` int(10) unsigned NOT NULL DEFAULT 0,
  `char_name` varchar(35) NOT NULL,
  `level` tinyint(3) unsigned DEFAULT NULL,
  `maxHp` mediumint(8) unsigned DEFAULT NULL,
  `curHp` mediumint(8) unsigned DEFAULT NULL,
  `maxCp` mediumint(8) unsigned DEFAULT NULL,
  `curCp` mediumint(8) unsigned DEFAULT NULL,
  `maxMp` mediumint(8) unsigned DEFAULT NULL,
  `curMp` mediumint(8) unsigned DEFAULT NULL,
  `face` tinyint(3) unsigned DEFAULT NULL,
  `hairStyle` tinyint(3) unsigned DEFAULT NULL,
  `hairColor` tinyint(3) unsigned DEFAULT NULL,
  `sex` tinyint(3) unsigned DEFAULT NULL,
  `heading` mediumint(9) DEFAULT NULL,
  `x` mediumint(9) DEFAULT NULL,
  `y` mediumint(9) DEFAULT NULL,
  `z` mediumint(9) DEFAULT NULL,
  `exp` bigint(20) unsigned DEFAULT 0,
  `expBeforeDeath` bigint(20) unsigned DEFAULT 0,
  `sp` bigint(10) unsigned NOT NULL DEFAULT 0,
  `karma` int(10) unsigned DEFAULT NULL,
  `fame` mediumint(8) unsigned NOT NULL DEFAULT 0,
  `pvpkills` smallint(5) unsigned DEFAULT NULL,
  `pkkills` smallint(5) unsigned DEFAULT NULL,
  `clanid` int(10) unsigned DEFAULT NULL,
  `race` tinyint(3) unsigned DEFAULT NULL,
  `classid` tinyint(3) unsigned DEFAULT NULL,
  `base_class` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `transform_id` smallint(5) unsigned NOT NULL DEFAULT 0,
  `deletetime` bigint(13) unsigned NOT NULL DEFAULT 0,
  `cancraft` tinyint(3) unsigned DEFAULT NULL,
  `title` varchar(21) DEFAULT NULL,
  `title_color` mediumint(8) unsigned NOT NULL DEFAULT 15530402,
  `accesslevel` mediumint(9) DEFAULT 0,
  `online` tinyint(3) unsigned DEFAULT NULL,
  `onlinetime` int(11) DEFAULT NULL,
  `char_slot` tinyint(3) unsigned DEFAULT NULL,
  `newbie` mediumint(8) unsigned DEFAULT 1,
  `lastAccess` bigint(13) unsigned NOT NULL DEFAULT 0,
  `clan_privs` int(10) unsigned DEFAULT 0,
  `wantspeace` tinyint(3) unsigned DEFAULT 0,
  `isin7sdungeon` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `power_grade` tinyint(3) unsigned DEFAULT NULL,
  `nobless` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `subpledge` smallint(6) NOT NULL DEFAULT 0,
  `lvl_joined_academy` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `apprentice` int(10) unsigned NOT NULL DEFAULT 0,
  `sponsor` int(10) unsigned NOT NULL DEFAULT 0,
  `clan_join_expiry_time` bigint(13) unsigned NOT NULL DEFAULT 0,
  `clan_create_expiry_time` bigint(13) unsigned NOT NULL DEFAULT 0,
  `death_penalty_level` smallint(5) unsigned NOT NULL DEFAULT 0,
  `bookmarkslot` smallint(5) unsigned NOT NULL DEFAULT 0,
  `vitality_points` smallint(5) unsigned NOT NULL DEFAULT 0,
  `createDate` date NOT NULL DEFAULT '2015-01-01',
  `language` varchar(2) DEFAULT NULL,
  `faction` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `pccafe_points` int(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`charId`),
  KEY `account_name` (`account_name`),
  KEY `char_name` (`char_name`),
  KEY `clanid` (`clanid`),
  KEY `online` (`online`),
  KEY `idx_charId` (`charId`),
  KEY `idx_char_name` (`char_name`),
  KEY `idx_account_name` (`account_name`),
  KEY `idx_accountName_createDate` (`account_name`,`createDate`),
  KEY `idx_createDate` (`createDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `clan_data`;
CREATE TABLE `clan_data` (
  `clan_id` int(11) NOT NULL DEFAULT 0,
  `clan_name` varchar(45) DEFAULT NULL,
  `clan_level` int(11) DEFAULT NULL,
  `reputation_score` int(11) NOT NULL DEFAULT 0,
  `hasCastle` int(11) DEFAULT NULL,
  `blood_alliance_count` smallint(5) unsigned NOT NULL DEFAULT 0,
  `blood_oath_count` smallint(5) unsigned NOT NULL DEFAULT 0,
  `ally_id` int(11) DEFAULT NULL,
  `ally_name` varchar(45) DEFAULT NULL,
  `leader_id` int(11) DEFAULT NULL,
  `crest_id` int(11) DEFAULT NULL,
  `crest_large_id` int(11) DEFAULT NULL,
  `ally_crest_id` int(11) DEFAULT NULL,
  `auction_bid_at` int(11) NOT NULL DEFAULT 0,
  `ally_penalty_expiry_time` bigint(13) unsigned NOT NULL DEFAULT 0,
  `ally_penalty_type` tinyint(1) NOT NULL DEFAULT 0,
  `char_penalty_expiry_time` bigint(13) unsigned NOT NULL DEFAULT 0,
  `dissolving_expiry_time` bigint(13) unsigned NOT NULL DEFAULT 0,
  `new_leader_id` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`clan_id`),
  KEY `ally_id` (`ally_id`),
  KEY `leader_id` (`leader_id`),
  KEY `auction_bid_at` (`auction_bid_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `castle`;
CREATE TABLE `castle` (
  `id` int(11) NOT NULL DEFAULT 0,
  `name` varchar(25) NOT NULL,
  `taxPercent` int(11) NOT NULL DEFAULT 15,
  `treasury` bigint(20) NOT NULL DEFAULT 0,
  `siegeDate` bigint(13) unsigned NOT NULL DEFAULT 0,
  `regTimeOver` enum('true','false') NOT NULL DEFAULT 'true',
  `regTimeEnd` bigint(13) unsigned NOT NULL DEFAULT 0,
  `showNpcCrest` enum('true','false') NOT NULL DEFAULT 'false',
  `ticketBuyCount` smallint(3) NOT NULL DEFAULT 0,
  PRIMARY KEY (`name`),
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `heroes`;
CREATE TABLE `heroes` (
  `charId` int(10) unsigned NOT NULL DEFAULT 0,
  `class_id` decimal(3,0) NOT NULL DEFAULT 0,
  `count` decimal(3,0) NOT NULL DEFAULT 0,
  `played` decimal(1,0) NOT NULL DEFAULT 0,
  `claimed` enum('true','false') NOT NULL DEFAULT 'false',
  `message` varchar(300) NOT NULL DEFAULT '',
  PRIMARY KEY (`charId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `items`;
CREATE TABLE `items` (
  `owner_id` int(11) DEFAULT NULL,
  `object_id` int(11) NOT NULL DEFAULT 0,
  `item_id` int(11) DEFAULT NULL,
  `count` bigint(20) unsigned NOT NULL DEFAULT 0,
  `enchant_level` int(11) DEFAULT NULL,
  `loc` varchar(10) DEFAULT NULL,
  `loc_data` int(11) DEFAULT NULL,
  `time_of_use` int(11) DEFAULT NULL,
  `custom_type1` int(11) DEFAULT 0,
  `custom_type2` int(11) DEFAULT 0,
  `mana_left` decimal(5,0) NOT NULL DEFAULT -1,
  `time` decimal(13,0) NOT NULL DEFAULT 0,
  PRIMARY KEY (`object_id`),
  KEY `owner_id` (`owner_id`),
  KEY `item_id` (`item_id`),
  KEY `loc` (`loc`),
  KEY `time_of_use` (`time_of_use`),
  KEY `idx_item_id` (`item_id`),
  KEY `idx_object_id` (`object_id`),
  KEY `idx_owner_id` (`owner_id`),
  KEY `idx_owner_id_loc` (`owner_id`,`loc`),
  KEY `idx_owner_id_item_id` (`owner_id`,`item_id`),
  KEY `idx_owner_id_loc_locdata` (`owner_id`,`loc`,`loc_data`),
  KEY `idx_owner_id_loc_locdata_enchant` (`owner_id`,`loc`,`loc_data`,`enchant_level`,`item_id`,`object_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `olympiad_nobles`;
CREATE TABLE `olympiad_nobles` (
  `charId` int(10) unsigned NOT NULL DEFAULT 0,
  `class_id` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `olympiad_points` int(10) unsigned NOT NULL DEFAULT 0,
  `competitions_done` smallint(3) unsigned NOT NULL DEFAULT 0,
  `competitions_won` smallint(3) unsigned NOT NULL DEFAULT 0,
  `competitions_lost` smallint(3) unsigned NOT NULL DEFAULT 0,
  `competitions_drawn` smallint(3) unsigned NOT NULL DEFAULT 0,
  `competitions_done_week` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `competitions_done_week_classed` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `competitions_done_week_non_classed` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `competitions_done_week_team` tinyint(3) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`charId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `character_offline_trade`;
CREATE TABLE `character_offline_trade` (
  `charId` int(10) unsigned NOT NULL,
  `time` bigint(13) unsigned NOT NULL DEFAULT 0,
  `type` tinyint(4) NOT NULL DEFAULT 0,
  `title` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`charId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `character_offline_trade_items`;
CREATE TABLE `character_offline_trade_items` (
  `charId` int(10) unsigned NOT NULL,
  `item` int(10) unsigned NOT NULL DEFAULT 0,
  `count` bigint(20) unsigned NOT NULL DEFAULT 0,
  `price` bigint(20) unsigned NOT NULL DEFAULT 0,
  KEY `charId` (`charId`),
  KEY `item` (`item`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

SET FOREIGN_KEY_CHECKS = 1;
